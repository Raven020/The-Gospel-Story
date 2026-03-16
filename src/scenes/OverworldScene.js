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
  TILE_SIZE,
} from '../engine/TilemapRenderer.js';
import { createEnemy } from '../data/enemies.js';
import { gainExp } from '../data/partyData.js';
import { renderSprite, renderSpriteMirrored } from '../lib/renderSprite.js';
import { drawText, measureText } from '../lib/drawText.js';
import { Player } from '../systems/Player.js';
import { NPCManager } from '../systems/NPCManager.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { EventSystem } from '../systems/EventSystem.js';
import { PauseMenu } from '../ui/PauseMenu.js';
import { Colors } from '../ui/Colors.js';
import { Actions, InputContext } from '../systems/InputSystem.js';
import { SCREEN_WIDTH } from '../engine/Display.js';
import { audioManager } from '../audio/AudioManager.js';

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
    });

    // Map registry: maps map IDs to { map, tileset } for cross-map warps
    this._mapRegistry = {};

    // Script registry for cutscene events
    this._cutsceneScripts = {};

    // Pause menu
    this.pauseMenu = new PauseMenu({
      input,
      gameState: gameState || null,
      onSelect: (option) => this._handleMenuSelect(option),
      onClose: () => { this.input.context = InputContext.OVERWORLD; },
    });

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
    this.map = map;
    this.tileset = tileset;
    this.tilesetId = map.tileset;
    this.npcManager.loadFromMap(map);
    this.player.teleport(
      spawnX !== undefined ? spawnX : 9,
      spawnY !== undefined ? spawnY : 5
    );
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

  exit() {}

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
      if (this.eventSystem._cameraOverride) {
        this.camera.follow(
          this.eventSystem._cameraOverride.x,
          this.eventSystem._cameraOverride.y,
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
      }
      const dir = this.input.getDirectionalPressed();
      if (dir === Actions.UP || dir === Actions.DOWN) {
        this.dialogue.onDirectional(dir === Actions.UP ? 'up' : 'down');
      }

      if (!this.dialogue.isOpen) {
        this.input.context = InputContext.OVERWORLD;
      }
      return;
    }

    if (this.transitions.active) return;

    // Player movement
    if (!this.player.moving) {
      const dir = this.input.getDirectionalHeld();
      if (dir) {
        const isTileBlocked = (tx, ty) => {
          return isBlocked(this.map, tx, ty) || this.npcManager.isNPCAt(tx, ty);
        };
        this.player.tryMove(dir, isTileBlocked);
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
    }

    // Dialogue box renders on top of everything
    this.dialogue.render(ctx, this.getFrameCount());

    // Pause menu renders on top of everything
    this.pauseMenu.render(ctx, this.getFrameCount());
  }

  _renderEntities(ctx, cameraX, cameraY) {
    const entities = [];

    entities.push({
      pixelX: this.player.pixelX,
      pixelY: this.player.pixelY,
      facing: this.player.facing,
      type: 'player',
    });

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
        this._renderCharacterSprite(ctx, 'jesus', ent.facing, screenX, screenY);
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
            this.gameState.advanceArc(Number(match[1]) + 1);
          }
        }
        break;
      case 'recruitMember':
        this.gameState.recruitMember(effect.memberId);
        break;
      case 'giveItem':
        this.gameState.inventory.add(effect.itemId, effect.count || 1);
        break;
      case 'removeItem':
        this.gameState.inventory.remove(effect.itemId, effect.count || 1);
        break;
      case 'playSound':
        audioManager.playSFX(effect.sfxId);
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

  _handleMenuSelect(_option) {
    // Fallback for unhandled menu options (e.g. "Options" has no sub-screen yet)
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
    this.battleScene.startBattle(party, enemies, (result, expGained) => {
      if (result === 'victory') {
        // Award EXP to all living party members
        for (const member of party) {
          if (member.currentHp > 0) {
            gainExp(member, expGained);
          }
        }
        // Fade back to overworld
        this.transitions.fadeToBlack(
          () => {
            this.sceneManager.switch('overworld');
          },
          () => {
            this._inBattle = false;
          }
        );
      } else {
        // Defeat: fade to title screen (game over)
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
    audioManager.playBGM('battle_boss');
    this.battleScene.startBattle(party, [enemy], (result, expGained) => {
      if (result === 'victory') {
        for (const member of party) {
          if (member.currentHp > 0) {
            gainExp(member, expGained);
          }
        }
        this.transitions.fadeToBlack(
          () => { this.sceneManager.switch('overworld'); },
          () => {
            this._inBattle = false;
            audioManager.playBGM('overworld');
            if (onComplete) onComplete();
          }
        );
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
}
