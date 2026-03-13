import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderSprite, renderSpriteMirrored, clearSpriteCache, getSpriteSize } from '../renderSprite.js';

// Mock OffscreenCanvas for Node environment
class MockCanvas {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this._ctx = {
      fillStyle: '',
      fillRect: vi.fn(),
    };
  }
  getContext() {
    return this._ctx;
  }
}

vi.stubGlobal('OffscreenCanvas', MockCanvas);

describe('renderSprite', () => {
  const palette = { _: null, A: '#FF0000', B: '#00FF00' };
  const spriteData = [
    ['A', '_', 'B'],
    ['_', 'A', '_'],
  ];

  beforeEach(() => {
    clearSpriteCache();
  });

  it('renders sprite via drawImage', () => {
    const ctx = { drawImage: vi.fn() };
    renderSprite(ctx, spriteData, palette, 10, 20);
    expect(ctx.drawImage).toHaveBeenCalledOnce();
    expect(ctx.drawImage.mock.calls[0][1]).toBe(10);
    expect(ctx.drawImage.mock.calls[0][2]).toBe(20);
  });

  it('caches sprite and reuses on second call', () => {
    const ctx = { drawImage: vi.fn() };
    renderSprite(ctx, spriteData, palette, 0, 0);
    renderSprite(ctx, spriteData, palette, 5, 5);
    expect(ctx.drawImage).toHaveBeenCalledTimes(2);
    // Same cached image
    expect(ctx.drawImage.mock.calls[0][0]).toBe(ctx.drawImage.mock.calls[1][0]);
  });

  it('rounds coordinates to integers', () => {
    const ctx = { drawImage: vi.fn() };
    renderSprite(ctx, spriteData, palette, 10.7, 20.3);
    expect(ctx.drawImage.mock.calls[0][1]).toBe(11);
    expect(ctx.drawImage.mock.calls[0][2]).toBe(20);
  });

  it('renderSpriteMirrored renders different cache entry', () => {
    const ctx = { drawImage: vi.fn() };
    renderSprite(ctx, spriteData, palette, 0, 0);
    renderSpriteMirrored(ctx, spriteData, palette, 0, 0);

    // Different cached images
    expect(ctx.drawImage.mock.calls[0][0]).not.toBe(ctx.drawImage.mock.calls[1][0]);
  });
});

describe('getSpriteSize', () => {
  it('returns correct dimensions', () => {
    const sprite = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
    ];
    expect(getSpriteSize(sprite)).toEqual({ width: 3, height: 2 });
  });
});
