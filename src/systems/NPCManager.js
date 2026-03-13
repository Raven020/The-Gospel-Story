/**
 * NPC management per specs/tilemap-format.md §6 and IMPLEMENTATION_PLAN Phase 2.4.
 * Handles NPC placement, wandering AI, interaction, and dynamic collision.
 */

import { TILE_SIZE } from '../engine/TilemapRenderer.js';
import { Actions } from './InputSystem.js';

const OPPOSITE_DIR = {
  [Actions.UP]: Actions.DOWN,
  [Actions.DOWN]: Actions.UP,
  [Actions.LEFT]: Actions.RIGHT,
  [Actions.RIGHT]: Actions.LEFT,
};

const DIR_OFFSETS = {
  [Actions.UP]: { dx: 0, dy: -1 },
  [Actions.DOWN]: { dx: 0, dy: 1 },
  [Actions.LEFT]: { dx: -1, dy: 0 },
  [Actions.RIGHT]: { dx: 1, dy: 0 },
};

const ALL_DIRS = [Actions.UP, Actions.DOWN, Actions.LEFT, Actions.RIGHT];

export class NPC {
  constructor(def) {
    this.id = def.id;
    this.sprite = def.sprite;
    this.tileX = def.x;
    this.tileY = def.y;
    this.spawnX = def.x;
    this.spawnY = def.y;
    this.facing = dirFromString(def.facing || 'down');
    this.dialogue = def.dialogue;
    this.movement = def.movement || 'static';
    this.pixelX = def.x * TILE_SIZE;
    this.pixelY = def.y * TILE_SIZE;

    // Wandering state
    this._wanderTimer = 0;
    this._wanderInterval = typeof def.movement === 'object' ? def.movement.intervalMs / 1000 : 0;
    this._wanderRadius = typeof def.movement === 'object' ? def.movement.radius : 0;
    this._isMoving = false;
    this._targetPixelX = this.pixelX;
    this._targetPixelY = this.pixelY;
    this._targetTileX = this.tileX;
    this._targetTileY = this.tileY;
  }

  get isMoving() {
    return this._isMoving;
  }

  update(dt, isBlockedFn) {
    if (this._isMoving) {
      const dx = this._targetPixelX - this.pixelX;
      const dy = this._targetPixelY - this.pixelY;
      const dist = Math.abs(dx) + Math.abs(dy);
      const step = 64 * dt; // NPCs move slower than player

      if (step >= dist) {
        this.pixelX = this._targetPixelX;
        this.pixelY = this._targetPixelY;
        this.tileX = this._targetTileX;
        this.tileY = this._targetTileY;
        this._isMoving = false;
      } else {
        const nx = dx !== 0 ? Math.sign(dx) : 0;
        const ny = dy !== 0 ? Math.sign(dy) : 0;
        this.pixelX += nx * step;
        this.pixelY += ny * step;
      }
      return;
    }

    if (typeof this.movement !== 'object' || this.movement.type !== 'wander') return;

    this._wanderTimer += dt;
    if (this._wanderTimer < this._wanderInterval) return;
    this._wanderTimer = 0;

    // Pick random direction
    const shuffled = [...ALL_DIRS].sort(() => Math.random() - 0.5);
    for (const dir of shuffled) {
      const offset = DIR_OFFSETS[dir];
      const newX = this.tileX + offset.dx;
      const newY = this.tileY + offset.dy;

      // Check radius from spawn
      if (
        Math.abs(newX - this.spawnX) > this._wanderRadius ||
        Math.abs(newY - this.spawnY) > this._wanderRadius
      ) continue;

      if (isBlockedFn(newX, newY)) continue;

      this.facing = dir;
      this._isMoving = true;
      this._targetTileX = newX;
      this._targetTileY = newY;
      this._targetPixelX = newX * TILE_SIZE;
      this._targetPixelY = newY * TILE_SIZE;
      break;
    }
  }

  faceToward(tileX, tileY) {
    const dx = tileX - this.tileX;
    const dy = tileY - this.tileY;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? Actions.RIGHT : Actions.LEFT;
    } else {
      this.facing = dy > 0 ? Actions.DOWN : Actions.UP;
    }
  }
}

export class NPCManager {
  constructor() {
    this.npcs = [];
  }

  loadFromMap(map) {
    this.npcs = (map.npcs || []).map((def) => new NPC(def));
  }

  update(dt, mapIsBlocked) {
    const isBlocked = (tx, ty) => {
      if (mapIsBlocked(tx, ty)) return true;
      // NPCs block each other
      return this.npcs.some(
        (n) => !n._isMoving && n.tileX === tx && n.tileY === ty
      );
    };

    for (const npc of this.npcs) {
      npc.update(dt, isBlocked);
    }
  }

  /**
   * Check if any NPC occupies a tile (for player collision).
   */
  isNPCAt(tileX, tileY) {
    return this.npcs.some((n) => n.tileX === tileX && n.tileY === tileY);
  }

  /**
   * Get NPC at a tile position.
   */
  getNPCAt(tileX, tileY) {
    return this.npcs.find((n) => n.tileX === tileX && n.tileY === tileY) || null;
  }
}

function dirFromString(str) {
  switch (str) {
    case 'up': return Actions.UP;
    case 'down': return Actions.DOWN;
    case 'left': return Actions.LEFT;
    case 'right': return Actions.RIGHT;
    default: return Actions.DOWN;
  }
}
