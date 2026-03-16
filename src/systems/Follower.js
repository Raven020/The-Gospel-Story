/**
 * Follower system for NPC companions that trail behind the player.
 * Used in Arc 1 for Mary following Joseph using a breadcrumb-trail pattern:
 * - Follows the player's exact path with a 1-tile delay
 * - Faces the same direction the player last moved
 * - Does not block the player's movement or collide
 * - Stops when the player talks to NPCs
 * - Can be positioned beside the player for cutscenes
 */

import { TILE_SIZE } from '../engine/TilemapRenderer.js';

const MOVE_SPEED = 128; // Same speed as player to keep pace

export class Follower {
  /**
   * @param {string} spriteKey - Key into the sprite registry (e.g. 'mary')
   * @param {number} tileX - Starting tile X
   * @param {number} tileY - Starting tile Y
   * @param {number} facing - Initial facing direction (Actions enum value)
   */
  constructor(spriteKey, tileX, tileY, facing) {
    this.spriteKey = spriteKey;
    this.tileX = tileX;
    this.tileY = tileY;
    this.pixelX = tileX * TILE_SIZE;
    this.pixelY = tileY * TILE_SIZE;
    this.facing = facing;
    this.visible = true;

    // Movement state
    this._moving = false;
    this._targetPixelX = this.pixelX;
    this._targetPixelY = this.pixelY;
    this._targetTileX = tileX;
    this._targetTileY = tileY;

    // Breadcrumb queue: stores tiles the player has walked through
    // When player moves from A→B, A is enqueued. When queue has entries,
    // follower dequeues and moves to that tile.
    this._breadcrumbs = [];
  }

  get moving() {
    return this._moving;
  }

  /**
   * Called when the player starts moving to a new tile.
   * Enqueues the player's previous position as a breadcrumb.
   * @param {number} prevTileX - Player's tile X before the move
   * @param {number} prevTileY - Player's tile Y before the move
   * @param {number} direction - Direction the player is moving (for facing)
   */
  onPlayerMove(prevTileX, prevTileY, direction) {
    this._breadcrumbs.push({ x: prevTileX, y: prevTileY, facing: direction });
  }

  /**
   * Update follower position. Call every frame.
   * Processes pixel interpolation toward current target,
   * then dequeues next breadcrumb when arrived.
   */
  update(dt) {
    if (!this.visible) return;

    if (this._moving) {
      const dx = this._targetPixelX - this.pixelX;
      const dy = this._targetPixelY - this.pixelY;
      const dist = Math.abs(dx) + Math.abs(dy);
      const step = MOVE_SPEED * dt;

      if (step >= dist) {
        this.pixelX = this._targetPixelX;
        this.pixelY = this._targetPixelY;
        this.tileX = this._targetTileX;
        this.tileY = this._targetTileY;
        this._moving = false;
      } else {
        const nx = dx !== 0 ? Math.sign(dx) : 0;
        const ny = dy !== 0 ? Math.sign(dy) : 0;
        this.pixelX += nx * step;
        this.pixelY += ny * step;
      }
      return;
    }

    // If not moving, try to dequeue a breadcrumb
    if (this._breadcrumbs.length > 0) {
      const crumb = this._breadcrumbs.shift();
      this.facing = crumb.facing;
      this._targetTileX = crumb.x;
      this._targetTileY = crumb.y;
      this._targetPixelX = crumb.x * TILE_SIZE;
      this._targetPixelY = crumb.y * TILE_SIZE;

      if (this._targetTileX !== this.tileX || this._targetTileY !== this.tileY) {
        this._moving = true;
      }
    }
  }

  /**
   * Teleport follower to a tile position (for warps/spawns).
   * Clears any pending breadcrumbs.
   */
  teleport(tileX, tileY, facing) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.pixelX = tileX * TILE_SIZE;
    this.pixelY = tileY * TILE_SIZE;
    this._targetPixelX = this.pixelX;
    this._targetPixelY = this.pixelY;
    this._targetTileX = tileX;
    this._targetTileY = tileY;
    this._moving = false;
    this._breadcrumbs = [];
    if (facing !== undefined) this.facing = facing;
  }
}
