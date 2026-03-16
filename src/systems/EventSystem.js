/**
 * Event/cutscene system for scripted sequences.
 * Executes a queue of commands sequentially: NPC movement, dialogue,
 * screen effects, camera control, and more.
 */

import { TILE_SIZE } from '../engine/TilemapRenderer.js';
import { NPC } from './NPCManager.js';
import { Actions } from './InputSystem.js';

const MOVE_SPEED = 128; // px/s, same as Player

export class EventSystem {
  constructor({ player, npcManager, dialogueSystem, camera, transitions, questFlags, onStartBattle, onWarp, onSetFlag }) {
    this.player = player;
    this.npcManager = npcManager;
    this.dialogueSystem = dialogueSystem;
    this.camera = camera;
    this.transitions = transitions;
    this.questFlags = questFlags || {};
    this.onStartBattle = onStartBattle || null;
    this.onWarp = onWarp || null;
    this.onSetFlag = onSetFlag || null;

    this.active = false;
    this._commands = [];
    this._currentCmd = null;
    this._cmdState = null;
    this._cameraOverride = null;
  }

  /**
   * Begin executing a command sequence.
   */
  startEvent(commands) {
    if (!commands || commands.length === 0) return;
    this.active = true;
    this._commands = [...commands];
    this._currentCmd = null;
    this._cmdState = null;
    this._cameraOverride = null;
    this._advanceToNext();
  }

  /**
   * Returns whether an event is currently running.
   */
  isActive() {
    return this.active;
  }

  /**
   * Process the current command each frame.
   */
  update(dt) {
    if (!this.active) return;
    if (!this._currentCmd) return;

    this._updateCommand(dt);
  }

  /**
   * Advance to the next command in the queue.
   */
  _advanceToNext() {
    if (this._commands.length === 0) {
      this.active = false;
      this._currentCmd = null;
      this._cmdState = null;
      this._cameraOverride = null;
      return;
    }
    const cmd = this._commands.shift();
    this._currentCmd = cmd;
    this._cmdState = {};
    this._executeCommand(cmd);
  }

  /**
   * Start executing a command (set up initial state).
   */
  _executeCommand(cmd) {
    switch (cmd.type) {
      case 'dialogue':
        this.dialogueSystem.open(cmd.data);
        break;

      case 'moveNPC': {
        const npc = this._findNPC(cmd.npcId);
        if (!npc || !cmd.path || cmd.path.length === 0) {
          this._advanceToNext();
          return;
        }
        this._cmdState = {
          npc,
          path: cmd.path,
          pathIndex: 0,
          moving: false,
          targetPixelX: npc.pixelX,
          targetPixelY: npc.pixelY,
        };
        this._startNPCPathStep();
        break;
      }

      case 'movePlayer': {
        if (!cmd.path || cmd.path.length === 0) {
          this._advanceToNext();
          return;
        }
        this._cmdState = {
          path: cmd.path,
          pathIndex: 0,
          moving: false,
          targetPixelX: this.player.pixelX,
          targetPixelY: this.player.pixelY,
        };
        this._startPlayerPathStep();
        break;
      }

      case 'wait':
        this._cmdState = { framesLeft: cmd.frames || 0 };
        break;

      case 'fadeOut':
        this._cmdState = { done: false };
        this.transitions.fadeToBlack(
          () => {},
          () => { this._cmdState.done = true; }
        );
        break;

      case 'fadeIn':
        this._cmdState = { done: false };
        this.transitions.fadeIn(() => { this._cmdState.done = true; });
        break;

      case 'flash':
        this._cmdState = { done: false };
        this.transitions.flashWhite(() => { this._cmdState.done = true; });
        break;

      case 'setFlag':
        this.questFlags[cmd.flag] = cmd.value;
        if (this.onSetFlag) this.onSetFlag(cmd.flag, cmd.value);
        this._advanceToNext();
        return;

      case 'teleportPlayer':
        this.player.teleport(cmd.x, cmd.y);
        this._advanceToNext();
        return;

      case 'teleportNPC': {
        const npc = this._findNPC(cmd.npcId);
        if (npc) {
          npc.tileX = cmd.x;
          npc.tileY = cmd.y;
          npc.pixelX = cmd.x * TILE_SIZE;
          npc.pixelY = cmd.y * TILE_SIZE;
          npc._isMoving = false;
        }
        this._advanceToNext();
        return;
      }

      case 'panCamera':
        this._cmdState = {
          targetX: cmd.x,
          targetY: cmd.y,
          speed: cmd.speed || 2,
        };
        this._cameraOverride = {
          x: this.camera.x + 112, // current center approximation
          y: this.camera.y + 72,
        };
        break;

      case 'returnCamera':
        this._cameraOverride = null;
        this._advanceToNext();
        return;

      case 'spawnNPC': {
        const newNpc = new NPC({
          id: cmd.npcId,
          sprite: cmd.sprite,
          x: cmd.x,
          y: cmd.y,
          facing: 'down',
          movement: 'static',
        });
        this.npcManager.npcs.push(newNpc);
        this._advanceToNext();
        return;
      }

      case 'removeNPC': {
        const idx = this.npcManager.npcs.findIndex(n => n.id === cmd.npcId);
        if (idx !== -1) {
          this.npcManager.npcs.splice(idx, 1);
        }
        this._advanceToNext();
        return;
      }

      case 'startBattle':
        if (this.onStartBattle) {
          this.onStartBattle(cmd.enemyId, () => this._advanceToNext());
        } else {
          this._advanceToNext();
        }
        return;

      case 'warp':
        if (this.onWarp) {
          this.onWarp(cmd.targetMap, cmd.targetX, cmd.targetY, () => this._advanceToNext());
        } else {
          this._advanceToNext();
        }
        return;

      case 'callback':
        if (typeof cmd.fn === 'function') {
          cmd.fn();
        }
        this._advanceToNext();
        return;

      default:
        // Unknown command, skip
        this._advanceToNext();
        return;
    }
  }

  /**
   * Check if the current command is complete; advance if so.
   */
  _updateCommand(dt) {
    const cmd = this._currentCmd;
    const state = this._cmdState;

    switch (cmd.type) {
      case 'dialogue':
        if (!this.dialogueSystem.isOpen) {
          this._advanceToNext();
        }
        break;

      case 'moveNPC':
        this._updateNPCMove(dt);
        break;

      case 'movePlayer':
        this._updatePlayerMove(dt);
        break;

      case 'wait':
        state.framesLeft--;
        if (state.framesLeft <= 0) {
          this._advanceToNext();
        }
        break;

      case 'fadeOut':
      case 'fadeIn':
      case 'flash':
        if (state.done) {
          this._advanceToNext();
        }
        break;

      case 'panCamera':
        this._updatePanCamera(dt);
        break;

      default:
        this._advanceToNext();
        break;
    }
  }

  // --- NPC movement along path ---

  _startNPCPathStep() {
    const state = this._cmdState;
    const target = state.path[state.pathIndex];
    const npc = state.npc;

    // Set facing direction based on movement
    const dx = target.x - npc.tileX;
    const dy = target.y - npc.tileY;
    if (Math.abs(dx) > Math.abs(dy)) {
      npc.facing = dx > 0 ? Actions.RIGHT : Actions.LEFT;
    } else {
      npc.facing = dy > 0 ? Actions.DOWN : Actions.UP;
    }

    state.targetPixelX = target.x * TILE_SIZE;
    state.targetPixelY = target.y * TILE_SIZE;
    npc._targetTileX = target.x;
    npc._targetTileY = target.y;
    state.moving = true;
  }

  _updateNPCMove(dt) {
    const state = this._cmdState;
    const npc = state.npc;
    const step = MOVE_SPEED * dt;

    const dx = state.targetPixelX - npc.pixelX;
    const dy = state.targetPixelY - npc.pixelY;
    const dist = Math.abs(dx) + Math.abs(dy);

    if (step >= dist) {
      // Arrived at this path point
      npc.pixelX = state.targetPixelX;
      npc.pixelY = state.targetPixelY;
      const target = state.path[state.pathIndex];
      npc.tileX = target.x;
      npc.tileY = target.y;
      state.pathIndex++;

      if (state.pathIndex >= state.path.length) {
        // Path complete
        npc._isMoving = false;
        this._advanceToNext();
      } else {
        this._startNPCPathStep();
      }
    } else {
      const nx = dx !== 0 ? Math.sign(dx) : 0;
      const ny = dy !== 0 ? Math.sign(dy) : 0;
      npc.pixelX += nx * step;
      npc.pixelY += ny * step;
    }
  }

  // --- Player movement along path ---

  _startPlayerPathStep() {
    const state = this._cmdState;
    const target = state.path[state.pathIndex];
    const player = this.player;

    const dx = target.x - player.tileX;
    const dy = target.y - player.tileY;
    if (Math.abs(dx) > Math.abs(dy)) {
      player.facing = dx > 0 ? Actions.RIGHT : Actions.LEFT;
    } else {
      player.facing = dy > 0 ? Actions.DOWN : Actions.UP;
    }

    state.targetPixelX = target.x * TILE_SIZE;
    state.targetPixelY = target.y * TILE_SIZE;
    player._targetTileX = target.x;
    player._targetTileY = target.y;
    player._targetPixelX = state.targetPixelX;
    player._targetPixelY = state.targetPixelY;
    player.moving = true;
    state.moving = true;
  }

  _updatePlayerMove(dt) {
    const state = this._cmdState;
    const player = this.player;
    const step = MOVE_SPEED * dt;

    const dx = state.targetPixelX - player.pixelX;
    const dy = state.targetPixelY - player.pixelY;
    const dist = Math.abs(dx) + Math.abs(dy);

    if (step >= dist) {
      player.pixelX = state.targetPixelX;
      player.pixelY = state.targetPixelY;
      const target = state.path[state.pathIndex];
      player.tileX = target.x;
      player.tileY = target.y;
      player._targetTileX = target.x;
      player._targetTileY = target.y;
      player.moving = false;
      state.pathIndex++;

      if (state.pathIndex >= state.path.length) {
        this._advanceToNext();
      } else {
        this._startPlayerPathStep();
      }
    } else {
      const nx = dx !== 0 ? Math.sign(dx) : 0;
      const ny = dy !== 0 ? Math.sign(dy) : 0;
      player.pixelX += nx * step;
      player.pixelY += ny * step;
    }
  }

  // --- Camera pan ---

  _updatePanCamera(dt) {
    const state = this._cmdState;
    const override = this._cameraOverride;
    const step = state.speed;

    const dx = state.targetX - override.x;
    const dy = state.targetY - override.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= step) {
      override.x = state.targetX;
      override.y = state.targetY;
      this._advanceToNext();
    } else {
      override.x += (dx / dist) * step;
      override.y += (dy / dist) * step;
    }
  }

  // --- Helpers ---

  _findNPC(npcId) {
    return this.npcManager.npcs.find(n => n.id === npcId) || null;
  }
}
