import { describe, it, expect } from 'vitest';
import { PALETTE as overworldPalette, TILES as overworldTiles } from '../overworld.js';
import { PALETTE as interiorPalette, TILES as interiorTiles } from '../interior.js';
import { PALETTE as desertPalette, TILES as desertTiles } from '../desert.js';
import { PALETTE as shorelinePalette, TILES as shorelineTiles } from '../shoreline.js';

function testTileset(palette, tiles, label) {
  describe(label, () => {
    it('palette has transparent key', () => {
      expect(palette._).toBeNull();
    });

    it('palette values are null or valid CSS color strings', () => {
      for (const [key, val] of Object.entries(palette)) {
        if (val !== null) {
          expect(typeof val).toBe('string');
          expect(val.length).toBeGreaterThan(0);
        }
      }
    });

    it('has at least one tile defined', () => {
      expect(Object.keys(tiles).length).toBeGreaterThan(0);
    });

    it('all tiles are 16x16 arrays', () => {
      for (const [id, tile] of Object.entries(tiles)) {
        expect(tile.length, `tile ${id} should have 16 rows`).toBe(16);
        for (let row = 0; row < tile.length; row++) {
          expect(tile[row].length, `tile ${id} row ${row} should have 16 columns`).toBe(16);
        }
      }
    });

    it('all tile pixel keys exist in palette', () => {
      for (const [id, tile] of Object.entries(tiles)) {
        for (let row = 0; row < tile.length; row++) {
          for (let col = 0; col < tile[row].length; col++) {
            const key = tile[row][col];
            expect(key in palette,
              `tile ${id} [${row}][${col}] uses unknown palette key "${key}"`
            ).toBe(true);
          }
        }
      }
    });
  });
}

testTileset(overworldPalette, overworldTiles, 'Overworld tileset');
testTileset(interiorPalette, interiorTiles, 'Interior tileset');
testTileset(desertPalette, desertTiles, 'Desert tileset');
testTileset(shorelinePalette, shorelineTiles, 'Shoreline tileset');
