/**
 * Tilemap renderer per specs/tilemap-format.md.
 * Renders tile layers with cached offscreen canvases for performance.
 * Only draws tiles visible within the camera viewport (frustum culling).
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT } from './Display.js';

const TILE_SIZE = 16;
const tileCache = new Map();

function createCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(w, h);
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function getCacheKey(tilesetId, tileId) {
  return `${tilesetId}_${tileId}`;
}

function bakeTileCanvas(tileset, tileId) {
  const pixels = tileset.TILES[tileId];
  if (!pixels) return null;
  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d');
  for (let row = 0; row < TILE_SIZE; row++) {
    for (let col = 0; col < TILE_SIZE; col++) {
      const key = pixels[row][col];
      if (key === '_' || !tileset.PALETTE[key]) continue;
      ctx.fillStyle = tileset.PALETTE[key];
      ctx.fillRect(col, row, 1, 1);
    }
  }
  return canvas;
}

function getTileCachedImage(tileset, tilesetId, tileId) {
  const key = getCacheKey(tilesetId, tileId);
  let img = tileCache.get(key);
  if (!img) {
    img = bakeTileCanvas(tileset, tileId);
    if (img) tileCache.set(key, img);
  }
  return img;
}

/**
 * Render a single map layer. Only draws tiles within camera viewport.
 */
export function renderLayer(ctx, map, tileset, tilesetId, layerData, cameraX, cameraY) {
  const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
  const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
  const endCol = Math.min(map.width, Math.ceil((cameraX + SCREEN_WIDTH) / TILE_SIZE));
  const endRow = Math.min(map.height, Math.ceil((cameraY + SCREEN_HEIGHT) / TILE_SIZE));

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const tileId = layerData[row * map.width + col];
      if (!tileId) continue;
      const img = getTileCachedImage(tileset, tilesetId, tileId);
      if (!img) continue;
      const destX = Math.round(col * TILE_SIZE - cameraX);
      const destY = Math.round(row * TILE_SIZE - cameraY);
      ctx.drawImage(img, destX, destY);
    }
  }
}

/**
 * Render a complete map: ground -> detail -> (entities rendered externally) -> above.
 * Returns after detail layer so caller can render entities, then call renderAboveLayer.
 */
export function renderGroundLayers(ctx, map, tileset, tilesetId, cameraX, cameraY) {
  renderLayer(ctx, map, tileset, tilesetId, map.layers.ground, cameraX, cameraY);
  renderLayer(ctx, map, tileset, tilesetId, map.layers.detail, cameraX, cameraY);
}

export function renderAboveLayer(ctx, map, tileset, tilesetId, cameraX, cameraY) {
  renderLayer(ctx, map, tileset, tilesetId, map.layers.above, cameraX, cameraY);
}

/**
 * Check if a tile is blocked by collision layer or out of bounds.
 */
export function isBlocked(map, tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) return true;
  return map.layers.collision[tileY * map.width + tileX] === 1;
}

/**
 * Check event layer at a tile position.
 */
export function getEvent(map, tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) return null;
  const eventId = map.layers.event[tileY * map.width + tileX];
  if (!eventId) return null;
  return map.events[eventId] || null;
}

/**
 * Check encounter zones at a tile position.
 * Returns { enemy, rate } or null.
 */
export function checkEncounterZone(map, tileX, tileY) {
  if (!map.encounters || !map.encounters.enabled) return null;
  const zones = map.encounters.zones || [];
  for (const zone of zones) {
    if (
      tileX >= zone.x &&
      tileX < zone.x + zone.w &&
      tileY >= zone.y &&
      tileY < zone.y + zone.h
    ) {
      if (Math.random() < zone.rate) {
        return rollEncounter(zone.table);
      }
      return null;
    }
  }
  return null;
}

function rollEncounter(table) {
  const totalWeight = table.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.enemy;
  }
  return table[table.length - 1].enemy;
}

export function clearTileCache() {
  tileCache.clear();
}

export { TILE_SIZE };
