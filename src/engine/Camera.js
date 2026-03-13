/**
 * Camera system per specs/tilemap-format.md §10.
 * Follows player, clamps to map bounds.
 * Camera position is in pixel units (top-left of viewport).
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT } from './Display.js';
import { TILE_SIZE } from './TilemapRenderer.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Update camera to follow a target pixel position, clamped to map bounds.
   * Per spec: cameraX = clamp(playerX - 112, 0, mapW*16 - 240)
   */
  follow(targetPixelX, targetPixelY, mapWidth, mapHeight) {
    const mapPixelW = mapWidth * TILE_SIZE;
    const mapPixelH = mapHeight * TILE_SIZE;

    // Center target in viewport (112 = 240/2 - 16/2, 72 = 160/2 - 16/2)
    this.x = Math.max(0, Math.min(targetPixelX - 112, mapPixelW - SCREEN_WIDTH));
    this.y = Math.max(0, Math.min(targetPixelY - 72, mapPixelH - SCREEN_HEIGHT));

    // Handle maps smaller than screen
    if (mapPixelW <= SCREEN_WIDTH) this.x = 0;
    if (mapPixelH <= SCREEN_HEIGHT) this.y = 0;
  }
}
