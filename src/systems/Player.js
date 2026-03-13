/**
 * Player movement system per specs/tilemap-format.md and IMPLEMENTATION_PLAN Phase 2.3.
 * 4-directional grid-based movement with smooth pixel interpolation between tiles.
 * Collision detection against tilemap collision layer and NPC positions.
 */

import { TILE_SIZE } from '../engine/TilemapRenderer.js';
import { Actions } from './InputSystem.js';

const MOVE_SPEED = 128; // pixels per second (8 frames per tile at 60fps)

const DIR_OFFSETS = {
  [Actions.UP]: { dx: 0, dy: -1 },
  [Actions.DOWN]: { dx: 0, dy: 1 },
  [Actions.LEFT]: { dx: -1, dy: 0 },
  [Actions.RIGHT]: { dx: 1, dy: 0 },
};

export class Player {
  constructor(tileX, tileY, facing = Actions.DOWN) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.pixelX = tileX * TILE_SIZE;
    this.pixelY = tileY * TILE_SIZE;
    this.facing = facing;
    this.moving = false;
    this._targetPixelX = this.pixelX;
    this._targetPixelY = this.pixelY;
    this._targetTileX = tileX;
    this._targetTileY = tileY;
    this._justArrived = false;
  }

  /**
   * True for one frame after completing a tile step.
   */
  get justArrived() {
    return this._justArrived;
  }

  /**
   * Try to start movement in a direction.
   * Returns true if movement started, false if blocked.
   */
  tryMove(direction, isBlockedFn) {
    if (this.moving) return false;

    this.facing = direction;
    const offset = DIR_OFFSETS[direction];
    if (!offset) return false;

    const newTX = this.tileX + offset.dx;
    const newTY = this.tileY + offset.dy;

    if (isBlockedFn(newTX, newTY)) return false;

    this.moving = true;
    this._targetTileX = newTX;
    this._targetTileY = newTY;
    this._targetPixelX = newTX * TILE_SIZE;
    this._targetPixelY = newTY * TILE_SIZE;
    this._justArrived = false;
    return true;
  }

  /**
   * Update pixel position during movement. Call every frame.
   */
  update(dt) {
    this._justArrived = false;

    if (!this.moving) return;

    const dx = this._targetPixelX - this.pixelX;
    const dy = this._targetPixelY - this.pixelY;
    const dist = Math.abs(dx) + Math.abs(dy);
    const step = MOVE_SPEED * dt;

    if (step >= dist) {
      // Arrived at target tile
      this.pixelX = this._targetPixelX;
      this.pixelY = this._targetPixelY;
      this.tileX = this._targetTileX;
      this.tileY = this._targetTileY;
      this.moving = false;
      this._justArrived = true;
    } else {
      // Interpolate toward target
      const nx = dx !== 0 ? Math.sign(dx) : 0;
      const ny = dy !== 0 ? Math.sign(dy) : 0;
      this.pixelX += nx * step;
      this.pixelY += ny * step;
    }
  }

  /**
   * Get the tile position the player is facing.
   */
  getFacingTile() {
    const offset = DIR_OFFSETS[this.facing] || { dx: 0, dy: 0 };
    return {
      x: this.tileX + offset.dx,
      y: this.tileY + offset.dy,
    };
  }

  /**
   * Teleport player to a tile position (for warps/spawns).
   */
  teleport(tileX, tileY) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.pixelX = tileX * TILE_SIZE;
    this.pixelY = tileY * TILE_SIZE;
    this._targetPixelX = this.pixelX;
    this._targetPixelY = this.pixelY;
    this._targetTileX = tileX;
    this._targetTileY = tileY;
    this.moving = false;
    this._justArrived = false;
  }
}
