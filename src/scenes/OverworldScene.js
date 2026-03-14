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

    // Auto-register dialogue for NPCs on this map
    if (map.npcs) {
      for (const npc of map.npcs) {
        if (npc.dialogue && !this._dialogueCache[npc.dialogue]) {
          // Dialogue will be registered externally if not already cached
        }
      }
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
      default:
        console.log('[Effect] Unhandled:', effect.type, effect);
    }
  }

  _handleMenuSelect(option) {
    // Sub-screens will be implemented as needed (Party, Items, Save, Load, Options)
    console.log('[Menu] Selected:', option);
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

  _handleEvent(evt) {
    if (evt.type === 'warp') {
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
      const script = this._cutsceneScripts[evt.script];
      if (script) {
        const commands = typeof script === 'function' ? script() : script;
        this.eventSystem.startEvent(commands);
      }
    }
  }
}
