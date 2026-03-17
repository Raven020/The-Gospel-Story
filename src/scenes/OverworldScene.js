/**
 * Overworld scene: ties together tilemap rendering, camera, player, NPCs,
 * dialogue system, and pause menu.
 */

import { Camera } from '../engine/Camera.js';
import {
  renderGroundLayers,
  renderAboveLayer,
  isBlocked,
  getEvent,
  checkEncounterZone,
  clearTileCache,
  TILE_SIZE,
} from '../engine/TilemapRenderer.js';
import { createEnemy } from '../data/enemies.js';
import { GameState } from '../systems/GameState.js';
import { renderSprite, renderSpriteMirrored } from '../lib/renderSprite.js';
import { drawText, measureText } from '../lib/drawText.js';
import { Player } from '../systems/Player.js';
import { NPCManager } from '../systems/NPCManager.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { EventSystem } from '../systems/EventSystem.js';
import { PauseMenu } from '../ui/PauseMenu.js';
import { Colors } from '../ui/Colors.js';
import { Follower } from '../systems/Follower.js';
import { Actions, InputContext } from '../systems/InputSystem.js';
import { SCREEN_WIDTH } from '../engine/Display.js';
import { audioManager } from '../audio/AudioManager.js';
import { getCurrentObjective } from '../data/objectives.js';

// Location name display per specs/ui-hud.md §6
const LOC_FADE_IN = 20;
const LOC_HOLD = 120;
const LOC_FADE_OUT = 20;

export class OverworldScene {
  constructor({ input, transitions, sceneManager, spriteRegistry, frameCountFn, gameState, battleScene }) {
    this.input = input;
    this.transitions = transitions;
    this.sceneManager = sceneManager;
    this.spriteRegistry = spriteRegistry || {};
    this.getFrameCount = frameCountFn || (() => 0);

    this.camera = new Camera();
    this.player = new Player(9, 5);
    this.npcManager = new NPCManager();

    // Follower companion (Mary in Arc 1). Null when no follower is active.
    this.follower = null;

    // Use gameState.questFlags as the single source of truth for quest flags.
    // Both DialogueSystem and EventSystem must reference the same object so that
    // flag reads (condition checks) and writes (setFlag effects) stay in sync.
    // loadMap() refreshes these references after newGame()/load() which replace
    // the questFlags object on gameState.
    const flags = (gameState && gameState.questFlags) || {};

    // Dialogue system
    this.dialogue = new DialogueSystem({
      questFlags: flags,
      onEffect: (effect) => this._handleDialogueEffect(effect),
    });

    // Event/cutscene system
    this.eventSystem = new EventSystem({
      player: this.player,
      npcManager: this.npcManager,
      dialogueSystem: this.dialogue,
      camera: this.camera,
      transitions,
      questFlags: flags,
      onStartBattle: (enemyId, onComplete) => this._triggerScriptedBattle(enemyId, onComplete),
      onWarp: (targetMap, targetX, targetY, onComplete) => this._executeScriptedWarp(targetMap, targetX, targetY, onComplete),
      onSetFlag: (flag, value) => this._handleCutsceneSetFlag(flag, value),
    });

    // Map registry: maps map IDs to { map, tileset } for cross-map warps
    this._mapRegistry = {};

    // Script registry for cutscene events
    this._cutsceneScripts = {};

    // Pause menu
    this.pauseMenu = new PauseMenu({
      input,
      gameState: gameState || null,
      spriteRegistry: this.spriteRegistry,
      onSelect: (option) => this._handleMenuSelect(option),
      onClose: () => { this.input.context = InputContext.OVERWORLD; },
    });

    // Wire SaveLoadMenu.onLoad so loading a save reloads the correct map
    if (this.pauseMenu.saveLoadMenu) {
      this.pauseMenu.saveLoadMenu.onLoad = () => {
        this._reloadFromSave();
      };
    }

    // Dialogue data cache (loaded modules)
    this._dialogueCache = {};

    this.map = null;
    this.tileset = null;
    this.tilesetId = null;

    // Location name display
    this._locNameFrame = 0;
    this._locNameTotal = LOC_FADE_IN + LOC_HOLD + LOC_FADE_OUT;
    this._showLocName = false;
    this._locName = '';

    this._pendingWarp = null;

    // Pending arc-transition cutscene key, triggered after dialogue closes
    this._pendingArcCutscene = null;

    // Battle integration
    this.gameState = gameState || null;
    this.battleScene = battleScene || null;
    this._inBattle = false;
  }

  /**
   * Register a map in the registry for cross-map warps.
   */
  registerMap(mapId, map, tileset) {
    this._mapRegistry[mapId] = { map, tileset };
  }

  /**
   * Get a registered map entry by ID.
   * @returns {{ map, tileset } | undefined}
   */
  getMapEntry(mapId) {
    return this._mapRegistry[mapId];
  }

  loadMap(map, tileset, spawnX, spawnY) {
    clearTileCache();
    this.map = map;
    this.tileset = tileset;
    this.tilesetId = map.tileset;
    this.npcManager.loadFromMap(map);
    const sx = spawnX !== undefined ? spawnX : 9;
    const sy = spawnY !== undefined ? spawnY : 5;
    this.player.teleport(sx, sy);

    // Position follower 1 tile behind the player (or same tile if blocked)
    this._syncFollower(sx, sy);

    this.camera.follow(this.player.pixelX, this.player.pixelY, map.width, map.height);

    this._locName = map.name || '';
    this._locNameFrame = 0;
    this._showLocName = !!this._locName;

    // Update game state with current map info
    if (this.gameState) {
      this.gameState.currentMap = map.id || '';
      this.gameState.playerX = this.player.tileX;
      this.gameState.playerY = this.player.tileY;

      // Refresh questFlags references after newGame()/load() which replace
      // the questFlags object. Both subsystems must point to the same object
      // so condition checks and flag writes stay in sync.
      this.dialogue.questFlags = this.gameState.questFlags;
      this.eventSystem.questFlags = this.gameState.questFlags;

      // Set up or remove follower based on arc
      this._updateFollowerForArc();
    }

  }

  /**
   * Register dialogue data so NPCs can trigger it.
   */
  registerDialogue(key, data) {
    this._dialogueCache[key] = data;
  }

  /**
   * Register a cutscene script (array of commands or function returning array).
   */
  registerCutscene(key, script) {
    this._cutsceneScripts[key] = script;
  }

  enter() {
    this.input.context = InputContext.OVERWORLD;
    audioManager.playBGM('overworld');
  }

  exit() {
    // Close dialogue if open so it doesn't render over the next scene
    if (this.dialogue.isOpen) {
      this.dialogue.close();
    }
    // Close pause menu if open
    if (this.pauseMenu.active) {
      this.pauseMenu.close();
    }
    // Reset input context so the incoming scene sets it fresh in its own enter()
    this.input.context = InputContext.OVERWORLD;
  }

  update(dt) {
    if (!this.map) return;

    // Pause menu takes priority
    if (this.pauseMenu.active) {
      this.pauseMenu.update();
      return;
    }

    // Event/cutscene system takes priority
    if (this.eventSystem.isActive()) {
      this.eventSystem.update(dt);

      // Still update dialogue input during events (dialogue command needs it)
      if (this.dialogue.isOpen) {
        this.dialogue.update();
        if (this.input.pressed(Actions.CONFIRM)) {
          this.dialogue.onActionPress();
        }
        const dir = this.input.getDirectionalPressed();
        if (dir === Actions.UP || dir === Actions.DOWN) {
          this.dialogue.onDirectional(dir === Actions.UP ? 'up' : 'down');
        }
      }

      // Note: transitions.update() is called by the game loop (main.js) each tick,
      // so we do NOT call it here — doing so would double-advance the animation.

      // Camera: follow override position or player
      if (this.eventSystem.cameraOverride) {
        this.camera.follow(
          this.eventSystem.cameraOverride.x,
          this.eventSystem.cameraOverride.y,
          this.map.width,
          this.map.height
        );
      } else {
        this.camera.follow(this.player.pixelX, this.player.pixelY, this.map.width, this.map.height);
      }

      // Update NPC rendering positions during events
      this.npcManager.update(dt, () => false);
      return;
    }

    // Dialogue takes priority
    if (this.dialogue.isOpen) {
      this.dialogue.update();

      if (this.input.pressed(Actions.CONFIRM)) {
        this.dialogue.onActionPress();
      } else if (this.input.held(Actions.CONFIRM)) {
        // Fast-forward: only accelerate typewriter reveal, never advance between nodes
        if (!this.dialogue.box.fullyRevealed) {
          this.dialogue.onActionPress();
        }
      }
      const dir = this.input.getDirectionalPressed();
      if (dir === Actions.UP || dir === Actions.DOWN) {
        this.dialogue.onDirectional(dir === Actions.UP ? 'up' : 'down');
      }

      if (!this.dialogue.isOpen) {
        this.input.context = InputContext.OVERWORLD;
        // Fire pending arc-transition cutscene after dialogue closes
        if (this._pendingArcCutscene) {
          const scriptKey = this._pendingArcCutscene;
          this._pendingArcCutscene = null;
          const script = this._cutsceneScripts[scriptKey];
          if (script) {
            const commands = typeof script === 'function' ? script() : script;
            const resolved = commands.map(cmd => {
              if (cmd.type === 'dialogue' && typeof cmd.data === 'string') {
                const data = this._dialogueCache[cmd.data];
                if (data) return { ...cmd, data };
              }
              return cmd;
            });
            this.eventSystem.startEvent(resolved);
          }
        }
      }
      return;
    }

    if (this.transitions.active) return;

    // Player movement
    if (!this.player.moving) {
      const dir = this.input.getDirectionalHeld();
      if (dir) {
        const prevX = this.player.tileX;
        const prevY = this.player.tileY;
        const isTileBlocked = (tx, ty) => {
          return isBlocked(this.map, tx, ty) || this.npcManager.isNPCAt(tx, ty);
        };
        const moved = this.player.tryMove(dir, isTileBlocked);
        if (moved && this.follower) {
          this.follower.onPlayerMove(prevX, prevY, dir);
        }
      }

      // NPC interaction
      if (this.input.pressed(Actions.CONFIRM)) {
        const { x, y } = this.player.getFacingTile();
        const npc = this.npcManager.getNPCAt(x, y);
        if (npc) {
          npc.faceToward(this.player.tileX, this.player.tileY);
          this._openNPCDialogue(npc);
        }
      }

      // Pause menu
      if (this.input.pressed(Actions.START)) {
        this.pauseMenu.open();
      }
    }

    this.player.update(dt);
    if (this.follower) this.follower.update(dt);

    if (this.player.justArrived) {
      // Track player position in game state
      if (this.gameState) {
        this.gameState.playerX = this.player.tileX;
        this.gameState.playerY = this.player.tileY;
      }

      const evt = getEvent(this.map, this.player.tileX, this.player.tileY);
      if (evt) {
        this._handleEvent(evt);
      } else if (!this._inBattle) {
        const enemyId = checkEncounterZone(this.map, this.player.tileX, this.player.tileY);
        if (enemyId) {
          this._triggerEncounter(enemyId);
        }
      }
    }

    this.npcManager.update(dt, (tx, ty) => {
      return (
        isBlocked(this.map, tx, ty) ||
        (this.player.tileX === tx && this.player.tileY === ty)
      );
    });

    this.camera.follow(this.player.pixelX, this.player.pixelY, this.map.width, this.map.height);

    if (this._showLocName) {
      this._locNameFrame++;
      if (this._locNameFrame >= this._locNameTotal) {
        this._showLocName = false;
      }
    }
  }

  render(ctx) {
    if (!this.map || !this.tileset) return;

    const cx = this.camera.x;
    const cy = this.camera.y;

    renderGroundLayers(ctx, this.map, this.tileset, this.tilesetId, cx, cy);
    this._renderEntities(ctx, cx, cy);
    renderAboveLayer(ctx, this.map, this.tileset, this.tilesetId, cx, cy);

    if (this._showLocName) {
      this._renderLocationName(ctx);
    } else if (!this.dialogue.isOpen && !this.pauseMenu.active && !this._inBattle) {
      this._renderObjectiveMarker(ctx);
    }

    // Dialogue box renders on top of everything
    this.dialogue.render(ctx, this.getFrameCount());

    // Pause menu renders on top of everything
    this.pauseMenu.render(ctx, this.getFrameCount());
  }

  /**
   * Get the sprite key for the current player character.
   * Uses the party leader's sprite field so it's Joseph in Arc 1, Jesus in Arc 2+.
   */
  _getPlayerSpriteKey() {
    if (this.gameState && this.gameState.party.active.length > 0) {
      return this.gameState.party.active[0].sprite;
    }
    return 'jesus';
  }

  _renderEntities(ctx, cameraX, cameraY) {
    const entities = [];

    entities.push({
      pixelX: this.player.pixelX,
      pixelY: this.player.pixelY,
      facing: this.player.facing,
      type: 'player',
    });

    // Add follower as a renderable entity
    if (this.follower && this.follower.visible) {
      entities.push({
        pixelX: this.follower.pixelX,
        pixelY: this.follower.pixelY,
        facing: this.follower.facing,
        type: 'follower',
      });
    }

    for (const npc of this.npcManager.npcs) {
      entities.push({
        pixelX: npc.pixelX,
        pixelY: npc.pixelY,
        facing: npc.facing,
        type: 'npc',
        npc,
      });
    }

    entities.sort((a, b) => a.pixelY - b.pixelY);

    for (const ent of entities) {
      const screenX = Math.round(ent.pixelX - cameraX);
      const screenY = Math.round(ent.pixelY - cameraY - TILE_SIZE);

      if (ent.type === 'player') {
        this._renderCharacterSprite(ctx, this._getPlayerSpriteKey(), ent.facing, screenX, screenY);
      } else if (ent.type === 'follower') {
        this._renderCharacterSprite(ctx, this.follower.spriteKey, ent.facing, screenX, screenY);
      } else if (ent.type === 'npc') {
        this._renderCharacterSprite(ctx, ent.npc.sprite, ent.facing, screenX, screenY);
      }
    }
  }

  _renderCharacterSprite(ctx, spriteKey, facing, screenX, screenY) {
    const reg = this.spriteRegistry[spriteKey];
    if (!reg) {
      ctx.fillStyle = spriteKey === 'jesus' ? '#E8E0D0' : '#A090C0';
      ctx.fillRect(screenX + 2, screenY + 2, 12, 28);
      return;
    }

    const { sprites, palette } = reg;
    let spriteData;
    let mirrored = false;

    switch (facing) {
      case Actions.DOWN: spriteData = sprites.front; break;
      case Actions.UP: spriteData = sprites.back; break;
      case Actions.LEFT: spriteData = sprites.left; break;
      case Actions.RIGHT: spriteData = sprites.left; mirrored = true; break;
      default: spriteData = sprites.front;
    }

    if (!spriteData) {
      ctx.fillStyle = '#A090C0';
      ctx.fillRect(screenX + 2, screenY + 2, 12, 28);
      return;
    }

    if (mirrored) {
      renderSpriteMirrored(ctx, spriteData, palette, screenX, screenY);
    } else {
      renderSprite(ctx, spriteData, palette, screenX, screenY);
    }
  }

  _renderLocationName(ctx) {
    const f = this._locNameFrame;
    let alpha = 1;

    if (f < LOC_FADE_IN) {
      alpha = f / LOC_FADE_IN;
    } else if (f >= LOC_FADE_IN + LOC_HOLD) {
      alpha = 1 - (f - LOC_FADE_IN - LOC_HOLD) / LOC_FADE_OUT;
    }

    if (alpha <= 0) return;

    ctx.globalAlpha = alpha;
    const textW = measureText(this._locName);
    ctx.fillStyle = Colors.BG_DARK;
    ctx.fillRect(2, 2, textW + 4, 12);
    drawText(ctx, this._locName, 4, 4, Colors.TEXT_LIGHT);
    ctx.globalAlpha = 1;
  }

  _renderObjectiveMarker(ctx) {
    if (!this.gameState) return;
    const text = getCurrentObjective(this.gameState.questFlags);
    if (!text) return;

    // Truncate to 30 chars with ellipsis if needed
    const display = text.length > 30 ? text.slice(0, 27) + '...' : text;
    const textW = measureText(display);

    ctx.fillStyle = Colors.BG_DARK;
    ctx.fillRect(2, 2, textW + 4, 12);
    drawText(ctx, display, 4, 4, Colors.TEXT_LIGHT);
  }

  _openNPCDialogue(npc) {
    const dialogueData = this._dialogueCache[npc.dialogue];
    if (dialogueData) {
      this.input.context = InputContext.DIALOGUE;
      this.dialogue.open(dialogueData);
    } else {
      // Fallback: simple greeting
      this.input.context = InputContext.DIALOGUE;
      this.dialogue.open({
        start: {
          speaker: npc.id,
          text: '...',
          next: null,
        },
      });
    }
  }

  _handleDialogueEffect(effect) {
    if (!this.gameState) return;

    switch (effect.type) {
      case 'setFlag':
        this.gameState.questFlags[effect.flag] = effect.value;
        // Auto-advance arc when an arc completion flag is set
        if (effect.value && typeof effect.flag === 'string') {
          const match = effect.flag.match(/^arc(\d+)_complete$/);
          if (match) {
            const completedArc = Number(match[1]);
            this.gameState.advanceArc(completedArc + 1);
            // Arc 1→2 transition: swap Joseph for Jesus, remove Mary follower
            if (completedArc === 1) {
              this.gameState.transitionToArc2();
              this.follower = null;
              this._pendingArcCutscene = 'arc1_transition';
            }
          }
          // Baptism power-up: boost Jesus's stats when baptism completes
          if (effect.flag === 'baptism_complete') {
            const jesus = this.gameState.party.find(m => m.id === 'jesus');
            if (jesus) {
              jesus.stats.wis += 10;
              jesus.stats.fai += 10;
              jesus.stats.sp += 5;
              jesus.currentSp = Math.min(jesus.currentSp + 5, jesus.stats.sp);
            }
          }
        }
        break;
      case 'recruitMember':
        this.gameState.recruitMember(effect.memberId);
        break;
      case 'giveItem':
        this.gameState.inventory.add(effect.item || effect.itemId, effect.qty || effect.count || 1);
        break;
      case 'removeItem':
        this.gameState.inventory.remove(effect.item || effect.itemId, effect.qty || effect.count || 1);
        break;
      case 'playSound':
        audioManager.playSFX(effect.soundId || effect.sfxId);
        break;
      case 'playMusic':
        audioManager.playBGM(effect.trackId);
        break;
      case 'setNpcState': {
        const npc = this.npcManager.npcs.find(n => n.id === effect.npcId);
        if (npc) {
          if (effect.dialogue !== undefined) npc.dialogue = effect.dialogue;
          if (effect.visible === false) {
            const idx = this.npcManager.npcs.indexOf(npc);
            if (idx !== -1) this.npcManager.npcs.splice(idx, 1);
          }
        }
        break;
      }
      case 'triggerEvent': {
        const script = this._cutsceneScripts[effect.eventId];
        if (script) {
          const commands = typeof script === 'function' ? script() : script;
          const resolved = commands.map(cmd => {
            if (cmd.type === 'dialogue' && typeof cmd.data === 'string') {
              const data = this._dialogueCache[cmd.data];
              if (data) return { ...cmd, data };
            }
            return cmd;
          });
          this.eventSystem.startEvent(resolved);
        }
        break;
      }
    }
  }

  /**
   * Handle arc-completion flags set by EventSystem (cutscene setFlag commands).
   * Mirrors the arc-advancement logic in _handleDialogueEffect so that inline
   * cutscene setFlag commands (e.g. summit_choosing) also trigger advanceArc().
   */
  _handleCutsceneSetFlag(flag, value) {
    if (!this.gameState) return;
    if (value && typeof flag === 'string') {
      const match = flag.match(/^arc(\d+)_complete$/);
      if (match) {
        const completedArc = Number(match[1]);
        this.gameState.advanceArc(completedArc + 1);
        if (completedArc === 1) {
          this.gameState.transitionToArc2();
          this.follower = null;
        }
      }
    }
  }

  _triggerEncounter(enemyId) {
    this._inBattle = true;
    audioManager.stopBGM();
    this.transitions.flashWhite(() => {
      this._startBattle(enemyId);
    });
  }

  _startBattle(enemyId) {
    if (!this.battleScene) {
      this._inBattle = false;
      return;
    }

    // Create 1-3 enemies of the encountered type
    const count = 1 + Math.floor(Math.random() * 3);
    const enemies = [];
    for (let i = 0; i < count; i++) {
      const enemy = createEnemy(enemyId);
      if (enemy) enemies.push(enemy);
    }

    if (enemies.length === 0) {
      this._inBattle = false;
      return;
    }

    // Get the active party from gameState, or fall back to a default
    const party = this.gameState ? this.gameState.party.active : [];
    if (party.length === 0) {
      this._inBattle = false;
      return;
    }

    this.sceneManager.switch('battle');
    audioManager.playBGM('battle');
    this.battleScene.startBattle(party, enemies, (result) => {
      if (result === 'victory') {
        // EXP already awarded by BattleScene
        this.transitions.fadeToBlack(
          () => {
            this.sceneManager.switch('overworld');
          },
          () => {
            this._inBattle = false;
          }
        );
      } else if (result === 'retry') {
        this._handleRetry();
      } else {
        // Defeat: fade to title screen
        this.transitions.fadeToBlack(
          () => {
            this._inBattle = false;
            this.sceneManager.switch('title');
          },
          null
        );
      }
    });
  }

  _executeScriptedWarp(targetMap, targetX, targetY, onComplete) {
    this.transitions.fadeToBlack(
      () => {
        const entry = this._mapRegistry[targetMap];
        if (entry) {
          this.loadMap(entry.map, entry.tileset, targetX, targetY);
        } else {
          this.player.teleport(targetX, targetY);
        }
        this.camera.follow(this.player.pixelX, this.player.pixelY, this.map.width, this.map.height);
      },
      () => {
        if (onComplete) onComplete();
      }
    );
  }

  _triggerScriptedBattle(enemyId, onComplete) {
    if (!this.battleScene) { if (onComplete) onComplete(); return; }

    const enemy = createEnemy(enemyId);
    if (!enemy) { if (onComplete) onComplete(); return; }

    const party = this.gameState ? this.gameState.party.active : [];
    if (party.length === 0) { if (onComplete) onComplete(); return; }

    this._inBattle = true;
    this.sceneManager.switch('battle');
    audioManager.playBGM('boss');
    this.battleScene.startBattle(party, [enemy], (result) => {
      if (result === 'victory') {
        // EXP already awarded by BattleScene
        this.transitions.fadeToBlack(
          () => { this.sceneManager.switch('overworld'); },
          () => {
            this._inBattle = false;
            audioManager.playBGM('overworld');
            if (onComplete) onComplete();
          }
        );
      } else if (result === 'retry') {
        this._handleRetry();
      } else {
        this.transitions.fadeToBlack(
          () => {
            this._inBattle = false;
            this.sceneManager.switch('title');
          },
          null
        );
      }
    });
  }

  /**
   * Reload map and player position from GameState after a save is loaded
   * via the pause menu. Fades to black, loads the saved map, and restores
   * player position/facing.
   */
  _reloadFromSave() {
    if (!this.gameState) return;
    this.transitions.fadeToBlack(
      () => {
        const entry = this._mapRegistry[this.gameState.currentMap];
        if (entry) {
          this.loadMap(entry.map, entry.tileset, this.gameState.playerX, this.gameState.playerY);
        }
        this.player.facing = this.gameState.playerFacing || Actions.DOWN;
      },
      null
    );
  }

  _handleRetry() {
    const slot = this._findLatestSaveSlot();
    if (slot >= 0 && this.gameState && this.gameState.load(slot)) {
      this.transitions.fadeToBlack(
        () => {
          const entry = this._mapRegistry[this.gameState.currentMap];
          if (entry) {
            this.loadMap(entry.map, entry.tileset, this.gameState.playerX, this.gameState.playerY);
          }
          this.player.facing = this.gameState.playerFacing || Actions.DOWN;
          this.sceneManager.switch('overworld');
        },
        () => {
          this._inBattle = false;
        }
      );
    } else {
      // No save found — fall back to title
      this.transitions.fadeToBlack(
        () => {
          this._inBattle = false;
          this.sceneManager.switch('title');
        },
        null
      );
    }
  }

  _findLatestSaveSlot() {
    let latestSlot = -1;
    let latestTimestamp = -1;
    try {
      for (let i = 0; i < 3; i++) {
        const info = GameState.getSaveInfo(i);
        if (info && info.timestamp > latestTimestamp) {
          latestTimestamp = info.timestamp;
          latestSlot = i;
        }
      }
    } catch (_e) { /* localStorage not available */ }
    return latestSlot;
  }

  _handleEvent(evt) {
    if (evt.type === 'warp') {
      // Arc ordering enforcement: block warps to maps the player hasn't unlocked
      if (evt.targetMap && this.gameState && !this.gameState.canAccessMap(evt.targetMap)) {
        // Show feedback instead of silently blocking
        this.input.context = InputContext.DIALOGUE;
        this.dialogue.open({
          start: {
            speaker: null,
            text: "You're not ready to go there yet.",
            next: null,
          },
        });
        return;
      }
      this._pendingWarp = evt;
      this.transitions.fadeToBlack(
        () => {
          if (this._pendingWarp) {
            // Cross-map warp: load the target map if different
            if (this._pendingWarp.targetMap) {
              const entry = this._mapRegistry[this._pendingWarp.targetMap];
              if (entry) {
                this.loadMap(entry.map, entry.tileset, this._pendingWarp.targetX, this._pendingWarp.targetY);
              } else {
                // Fallback: same-map teleport
                this.player.teleport(this._pendingWarp.targetX, this._pendingWarp.targetY);
              }
            } else {
              this.player.teleport(this._pendingWarp.targetX, this._pendingWarp.targetY);
            }
            this.camera.follow(
              this.player.pixelX,
              this.player.pixelY,
              this.map.width,
              this.map.height
            );
            this._locName = this.map.name || '';
            this._locNameFrame = 0;
            this._showLocName = !!this._locName;
          }
        },
        () => {
          this._pendingWarp = null;
        }
      );
    } else if (evt.type === 'cutscene') {
      // Support flag guard: skip if the guard flag is already set
      if (evt.flag && this.gameState && this.gameState.questFlags[evt.flag]) {
        return;
      }
      // Support prerequisite flags: skip if any required flag is not set
      if (evt.requires && this.gameState) {
        const missing = evt.requires.some(f => !this.gameState.questFlags[f]);
        if (missing) return;
      }

      let commands;
      if (evt.commands) {
        // Inline commands on the event object (used by map cutscene events)
        commands = evt.commands;
      } else if (evt.script) {
        // Named script in registry
        const script = this._cutsceneScripts[evt.script];
        if (!script) return;
        commands = typeof script === 'function' ? script() : script;
      } else {
        return;
      }

      // Resolve dialogue string keys to actual data objects from the cache
      const resolved = commands.map(cmd => {
        if (cmd.type === 'dialogue' && typeof cmd.data === 'string') {
          const data = this._dialogueCache[cmd.data];
          if (data) return { ...cmd, data };
        }
        return cmd;
      });

      this.eventSystem.startEvent(resolved);
    }
  }

  /**
   * Create or remove the follower based on current arc.
   * Arc 1: Mary follows Joseph. Arc 2+: no follower.
   */
  _updateFollowerForArc() {
    if (!this.gameState) return;
    const arc = this.gameState.questFlags.current_arc || 1;
    if (arc === 1) {
      if (!this.follower) {
        this.follower = new Follower('mary', this.player.tileX, this.player.tileY, this.player.facing);
      }
      // Position Mary 1 tile behind the player
      this._syncFollower(this.player.tileX, this.player.tileY);
    } else {
      this.follower = null;
    }
  }

  /**
   * Position the follower 1 tile behind the player's spawn position.
   * Uses the player's facing direction to determine "behind".
   */
  _syncFollower(spawnX, spawnY) {
    if (!this.follower) return;
    // Place follower 1 tile behind relative to facing direction
    const facing = this.player.facing;
    let fx = spawnX;
    let fy = spawnY;
    if (facing === Actions.UP) fy = spawnY + 1;
    else if (facing === Actions.DOWN) fy = spawnY - 1;
    else if (facing === Actions.LEFT) fx = spawnX + 1;
    else if (facing === Actions.RIGHT) fx = spawnX - 1;
    this.follower.teleport(fx, fy, facing);
  }
}
