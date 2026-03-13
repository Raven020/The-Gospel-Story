import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderLayer,
  isBlocked,
  getEvent,
  checkEncounterZone,
  clearTileCache,
  TILE_SIZE,
} from '../TilemapRenderer.js';

// Mock OffscreenCanvas
class MockCanvas {
  constructor(w, h) {
    this.width = w;
    this.height = h;
  }
  getContext() {
    return { fillStyle: '', fillRect: vi.fn() };
  }
}
vi.stubGlobal('OffscreenCanvas', MockCanvas);

describe('TilemapRenderer', () => {
  beforeEach(() => {
    clearTileCache();
  });

  it('exports TILE_SIZE as 16', () => {
    expect(TILE_SIZE).toBe(16);
  });

  describe('isBlocked', () => {
    const map = {
      width: 3,
      height: 3,
      layers: {
        collision: [
          1, 0, 0,
          0, 0, 1,
          0, 1, 0,
        ],
      },
    };

    it('returns true for blocked tiles', () => {
      expect(isBlocked(map, 0, 0)).toBe(true);
      expect(isBlocked(map, 2, 1)).toBe(true);
      expect(isBlocked(map, 1, 2)).toBe(true);
    });

    it('returns false for walkable tiles', () => {
      expect(isBlocked(map, 1, 0)).toBe(false);
      expect(isBlocked(map, 1, 1)).toBe(false);
    });

    it('returns true for out-of-bounds', () => {
      expect(isBlocked(map, -1, 0)).toBe(true);
      expect(isBlocked(map, 0, -1)).toBe(true);
      expect(isBlocked(map, 3, 0)).toBe(true);
      expect(isBlocked(map, 0, 3)).toBe(true);
    });
  });

  describe('getEvent', () => {
    const map = {
      width: 3,
      height: 2,
      layers: {
        event: [0, 'warp_a', 0, 0, 0, 'trigger_b'],
      },
      events: {
        warp_a: { type: 'warp', targetMap: 'test', targetX: 1, targetY: 1, transition: 'fade' },
        trigger_b: { type: 'cutscene', script: 'cs_test' },
      },
    };

    it('returns event for tiles with events', () => {
      expect(getEvent(map, 1, 0)).toEqual(map.events.warp_a);
      expect(getEvent(map, 2, 1)).toEqual(map.events.trigger_b);
    });

    it('returns null for tiles without events', () => {
      expect(getEvent(map, 0, 0)).toBeNull();
    });

    it('returns null for out-of-bounds', () => {
      expect(getEvent(map, -1, 0)).toBeNull();
      expect(getEvent(map, 3, 0)).toBeNull();
    });
  });

  describe('checkEncounterZone', () => {
    it('returns null when encounters disabled', () => {
      const map = { encounters: { enabled: false } };
      expect(checkEncounterZone(map, 0, 0)).toBeNull();
    });

    it('returns null when no encounters config', () => {
      const map = {};
      expect(checkEncounterZone(map, 0, 0)).toBeNull();
    });

    it('returns null when outside zone', () => {
      const map = {
        encounters: {
          enabled: true,
          zones: [{ x: 5, y: 5, w: 3, h: 3, rate: 1.0, table: [{ enemy: 'test', weight: 1 }] }],
        },
      };
      expect(checkEncounterZone(map, 0, 0)).toBeNull();
    });

    it('returns enemy when inside zone and roll succeeds', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01); // low = triggers
      const map = {
        encounters: {
          enabled: true,
          zones: [
            {
              x: 0, y: 0, w: 10, h: 10,
              rate: 0.5,
              table: [{ enemy: 'wolf', weight: 1 }],
            },
          ],
        },
      };
      expect(checkEncounterZone(map, 3, 3)).toBe('wolf');
      vi.restoreAllMocks();
    });
  });

  describe('renderLayer', () => {
    it('calls drawImage for visible non-zero tiles', () => {
      const tileset = {
        PALETTE: { A: '#FF0000' },
        TILES: {
          1: Array.from({ length: 16 }, () => Array(16).fill('A')),
        },
      };
      const map = { width: 2, height: 2 };
      const layerData = [1, 0, 0, 1];
      const ctx = { drawImage: vi.fn() };

      renderLayer(ctx, map, tileset, 'test', layerData, 0, 0);

      // Should draw 2 tiles (tile IDs 1 at positions [0,0] and [1,1])
      expect(ctx.drawImage).toHaveBeenCalledTimes(2);
    });

    it('skips tiles outside viewport', () => {
      const tileset = {
        PALETTE: { A: '#FF0000' },
        TILES: {
          1: Array.from({ length: 16 }, () => Array(16).fill('A')),
        },
      };
      const map = { width: 100, height: 100 };
      const layerData = new Array(10000).fill(1);
      const ctx = { drawImage: vi.fn() };

      renderLayer(ctx, map, tileset, 'test', layerData, 0, 0);

      // Only visible tiles: ceil(240/16) * ceil(160/16) = 15 * 10 = 150
      expect(ctx.drawImage.mock.calls.length).toBeLessThanOrEqual(150);
    });
  });
});
