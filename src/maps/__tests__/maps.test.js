import { describe, it, expect } from 'vitest';
import { MAP as jerusalemMap } from '../jerusalem.js';
import { MAP as templeMap } from '../temple.js';
import { MAP as jordanRiverMap } from '../jordan_river.js';
import { MAP as wildernessMap } from '../wilderness.js';
import { MAP as galileeMap } from '../galilee.js';
import { MAP as capernaumMap } from '../capernaum.js';
import { MAP as mountainMap } from '../mountain.js';
import { ARC1_DIALOGUE } from '../../data/dialogue/arc1.js';
import { ARC2_DIALOGUE } from '../../data/dialogue/arc2.js';
import { ARC3_DIALOGUE } from '../../data/dialogue/arc3.js';

// All registered dialogue keys (single source of truth for validation)
const ALL_DIALOGUE_KEYS = new Set([
  ...Object.keys(ARC1_DIALOGUE),
  ...Object.keys(ARC2_DIALOGUE),
  ...Object.keys(ARC3_DIALOGUE),
]);

// All registered map IDs (the 7 story maps + demo)
const ALL_MAP_IDS = new Set([
  jerusalemMap.id,
  templeMap.id,
  jordanRiverMap.id,
  wildernessMap.id,
  galileeMap.id,
  capernaumMap.id,
  mountainMap.id,
  'demo',
]);

function testMap(map, label) {
  describe(label, () => {
    const totalTiles = map.width * map.height;

    it('has correct ground layer length', () => {
      expect(map.layers.ground.length).toBe(totalTiles);
    });

    it('has correct collision layer length', () => {
      expect(map.layers.collision.length).toBe(totalTiles);
    });

    it('has correct event layer length', () => {
      expect(map.layers.event.length).toBe(totalTiles);
    });

    it('has correct detail layer length', () => {
      expect(map.layers.detail.length).toBe(totalTiles);
    });

    it('has correct above layer length', () => {
      expect(map.layers.above.length).toBe(totalTiles);
    });

    it('has all event layer references defined in events object', () => {
      for (const val of map.layers.event) {
        if (val !== 0 && val !== null && val !== undefined) {
          expect(map.events[val]).toBeDefined();
        }
      }
    });

    it('NPCs have required fields', () => {
      for (const npc of map.npcs) {
        expect(typeof npc.id).toBe('string');
        expect(npc.id.length).toBeGreaterThan(0);
        expect(typeof npc.x).toBe('number');
        expect(typeof npc.y).toBe('number');
        expect(typeof npc.sprite).toBe('string');
        expect(typeof npc.dialogue).toBe('string');
      }
    });

    it('has name and id', () => {
      expect(typeof map.name).toBe('string');
      expect(map.name.length).toBeGreaterThan(0);
      expect(typeof map.id).toBe('string');
      expect(map.id.length).toBeGreaterThan(0);
    });

    it('warps have valid targets', () => {
      for (const [, evt] of Object.entries(map.events)) {
        if (evt.type === 'warp') {
          expect(typeof evt.targetMap).toBe('string');
          expect(typeof evt.targetX).toBe('number');
          expect(evt.targetX).toBeGreaterThanOrEqual(0);
          expect(typeof evt.targetY).toBe('number');
          expect(evt.targetY).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('has encounters property', () => {
      expect(map.encounters).toBeDefined();
    });

    it('NPC dialogue keys reference registered dialogue data', () => {
      for (const npc of map.npcs) {
        expect(ALL_DIALOGUE_KEYS.has(npc.dialogue),
          `NPC "${npc.id}" references unknown dialogue key "${npc.dialogue}"`
        ).toBe(true);
      }
    });

    it('warp targetMap values reference registered map IDs', () => {
      for (const [key, evt] of Object.entries(map.events)) {
        if (evt.type === 'warp') {
          expect(ALL_MAP_IDS.has(evt.targetMap),
            `Warp "${key}" references unknown map "${evt.targetMap}"`
          ).toBe(true);
        }
      }
    });
  });
}

testMap(jerusalemMap, 'Jerusalem map');
testMap(templeMap, 'Temple map');
testMap(jordanRiverMap, 'Jordan River map');
testMap(wildernessMap, 'Judean Wilderness map');
testMap(galileeMap, 'Sea of Galilee map');
testMap(capernaumMap, 'Capernaum map');
testMap(mountainMap, 'Mount of Choosing map');
