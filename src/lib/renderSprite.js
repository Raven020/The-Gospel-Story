/**
 * Unified sprite rendering utility per Phase 1.4.
 * Renders sprite pixel data (2D array of palette keys) at 1:1 scale.
 * Caches rendered sprites as offscreen canvases for performance.
 * Handles transparent pixels ('_') and mirrored rendering for right-facing.
 */

const spriteCache = new Map();

function getCacheKey(spriteData, palette) {
  if (spriteData._cacheId === undefined) {
    spriteData._cacheId = nextCacheId++;
  }
  if (palette._cacheId === undefined) {
    palette._cacheId = nextCacheId++;
  }
  return `${spriteData._cacheId}_${palette._cacheId}`;
}

let nextCacheId = 0;

function createCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(w, h);
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function bakeSpriteCanvas(spriteData, palette) {
  const h = spriteData.length;
  const w = spriteData[0].length;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const key = spriteData[row][col];
      if (key === '_' || !palette[key]) continue;
      ctx.fillStyle = palette[key];
      ctx.fillRect(col, row, 1, 1);
    }
  }
  return canvas;
}

function bakeMirroredCanvas(spriteData, palette) {
  const h = spriteData.length;
  const w = spriteData[0].length;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const key = spriteData[row][w - 1 - col];
      if (key === '_' || !palette[key]) continue;
      ctx.fillStyle = palette[key];
      ctx.fillRect(col, row, 1, 1);
    }
  }
  return canvas;
}

/**
 * Render a sprite at (x, y) on ctx. Pixel-perfect, cached.
 */
export function renderSprite(ctx, spriteData, palette, x, y) {
  const key = getCacheKey(spriteData, palette);
  let img = spriteCache.get(key);
  if (!img) {
    img = bakeSpriteCanvas(spriteData, palette);
    spriteCache.set(key, img);
  }
  ctx.drawImage(img, Math.round(x), Math.round(y));
}

/**
 * Render a horizontally mirrored sprite (for right-facing direction).
 */
export function renderSpriteMirrored(ctx, spriteData, palette, x, y) {
  const key = getCacheKey(spriteData, palette) + '_m';
  let img = spriteCache.get(key);
  if (!img) {
    img = bakeMirroredCanvas(spriteData, palette);
    spriteCache.set(key, img);
  }
  ctx.drawImage(img, Math.round(x), Math.round(y));
}

/**
 * Clear the sprite cache. Call when changing scenes or on memory pressure.
 */
export function clearSpriteCache() {
  spriteCache.clear();
  nextCacheId = 0;
}

/**
 * Get sprite dimensions without rendering.
 */
export function getSpriteSize(spriteData) {
  return {
    width: spriteData[0].length,
    height: spriteData.length,
  };
}
