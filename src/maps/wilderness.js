/**
 * Judean Wilderness dungeon map for Arc 2 - "Baptism & Temptation."
 * 25x20 tiles - Desert terrain with three temptation areas.
 * Random encounters with spiritual enemies. Three Satan encounter triggers.
 */

// Helper: fill array with a value
const fill = (n, v) => new Array(n).fill(v);

// 25x20 map
const W = 25;
const H = 20;

// Tile IDs (desert tileset):
// 1 = sand, 2 = rock, 3 = dune (blocked), 4 = cactus (blocked),
// 5 = cliff (blocked), 6 = oasis_water (blocked), 7 = dry_grass, 8 = cave_floor

// Build ground layer
const ground = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // Border cliffs
    if (y === 0 || y === H - 1) {
      if (y === 0 && x === 0) {
        // West warp at row 0 not needed, warp is on west edge
        ground.push(5); // cliff
      } else {
        ground.push(5); // cliff walls top/bottom
      }
    } else if (x === 0) {
      // West edge - cliff except warp (rows 9-10)
      if (y >= 9 && y <= 10) {
        ground.push(1); // sand (warp entry from jordan river)
      } else {
        ground.push(5); // cliff
      }
    } else if (x === W - 1) {
      ground.push(5); // east edge cliff
    }
    // Temptation area 1: Stones to bread (top-left clearing, rows 2-5, cols 3-8)
    else if (y >= 2 && y <= 5 && x >= 3 && x <= 8) {
      if (y === 3 && x >= 5 && x <= 6) {
        ground.push(2); // rocky center (stones)
      } else {
        ground.push(1); // sand clearing
      }
    }
    // Temptation area 2: Pinnacle (center-right area, rows 8-12, cols 16-21)
    else if (y >= 8 && y <= 12 && x >= 16 && x <= 21) {
      if (y === 10 && x >= 18 && x <= 19) {
        ground.push(2); // rocky pinnacle center
      } else {
        ground.push(1); // sand clearing
      }
    }
    // Temptation area 3: Kingdoms (bottom area, rows 15-18, cols 8-16)
    else if (y >= 15 && y <= 18 && x >= 8 && x <= 16) {
      if (y === 16 && x >= 11 && x <= 13) {
        ground.push(2); // rocky high ground
      } else {
        ground.push(1); // sand clearing
      }
    }
    // Winding path through desert
    else if ((x === 1 || x === 2) && y >= 9 && y <= 10) {
      ground.push(1); // entry path
    } else if (x >= 2 && x <= 4 && y >= 6 && y <= 9) {
      ground.push(1); // path north to temptation 1
    } else if (x >= 4 && x <= 9 && y === 6) {
      ground.push(7); // dry grass along path
    } else if (x >= 8 && x <= 16 && y === 7) {
      ground.push(1); // east path connector
    } else if (x >= 14 && x <= 16 && y >= 7 && y <= 9) {
      ground.push(1); // path to temptation 2
    } else if (x >= 8 && x <= 10 && y >= 10 && y <= 15) {
      ground.push(1); // south path to temptation 3
    } else if (x >= 10 && x <= 12 && y >= 13 && y <= 15) {
      ground.push(7); // dry grass approach
    }
    // Scattered obstacles
    else if ((x === 6 && y === 13) || (x === 20 && y === 4) || (x === 14 && y === 16)) {
      ground.push(4); // cactus
    } else if ((x === 11 && y === 2) || (x === 19 && y === 15) || (x === 3 && y === 14)) {
      ground.push(3); // dune
    } else if (x === 22 && y === 5) {
      ground.push(6); // oasis
    }
    // Default: sand
    else {
      ground.push(1);
    }
  }
}

// Detail layer: empty
const detail = fill(W * H, 0);

// Above layer: empty
const above = fill(W * H, 0);

// Collision layer
const collision = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    const tile = ground[idx];
    if (tile === 3 || tile === 4 || tile === 5 || tile === 6) {
      // Dune, cactus, cliff, oasis are blocked
      if (x === 0 && y >= 9 && y <= 10) {
        collision.push(0); // warp entry point (overrides cliff)
      } else {
        collision.push(1);
      }
    } else {
      collision.push(0);
    }
  }
}

// Event layer
const event = fill(W * H, 0);

// West warp back to jordan river (col 0, rows 9-10)
for (let y = 9; y <= 10; y++) {
  event[y * W + 0] = 'warp_west';
}

// Temptation 1 trigger: center of stones area (row 3, cols 5-6)
event[3 * W + 5] = 'temptation_1';
event[3 * W + 6] = 'temptation_1';

// Temptation 2 trigger: pinnacle center (row 10, cols 18-19)
event[10 * W + 18] = 'temptation_2';
event[10 * W + 19] = 'temptation_2';

// Temptation 3 trigger: kingdoms high ground (row 16, cols 11-13)
event[16 * W + 11] = 'temptation_3';
event[16 * W + 12] = 'temptation_3';
event[16 * W + 13] = 'temptation_3';

export const MAP = {
  id: 'wilderness',
  name: 'Judean Wilderness',
  width: W,
  height: H,
  tileset: 'desert',

  layers: {
    ground,
    detail,
    above,
    collision,
    event,
  },

  events: {
    warp_west: {
      type: 'warp',
      targetMap: 'jordan_river',
      targetX: 22,
      targetY: 9,
      transition: 'fade',
    },
    temptation_1: {
      type: 'cutscene',
      flag: 'temptation_1_resolved',
      commands: [
        { type: 'fadeOut' },
        { type: 'dialogue', data: 'satan_temptation_1' },
        { type: 'startBattle', enemyId: 'satan' },
        { type: 'setFlag', flag: 'temptation_1_resolved', value: true },
        { type: 'fadeIn' },
      ],
    },
    temptation_2: {
      type: 'cutscene',
      flag: 'temptation_2_resolved',
      commands: [
        { type: 'fadeOut' },
        { type: 'dialogue', data: 'satan_temptation_2' },
        { type: 'startBattle', enemyId: 'satan' },
        { type: 'setFlag', flag: 'temptation_2_resolved', value: true },
        { type: 'fadeIn' },
      ],
    },
    temptation_3: {
      type: 'cutscene',
      flag: 'temptation_3_resolved',
      requires: ['temptation_1_resolved', 'temptation_2_resolved'],
      commands: [
        { type: 'fadeOut' },
        { type: 'dialogue', data: 'satan_temptation_3' },
        { type: 'startBattle', enemyId: 'satan' },
        { type: 'setFlag', flag: 'temptation_3_resolved', value: true },
        { type: 'dialogue', data: 'angel_minister' },
        { type: 'dialogue', data: 'arc2_transition' },
        { type: 'warp', targetMap: 'galilee', targetX: 14, targetY: 18 },
      ],
    },
  },

  npcs: [],

  encounters: {
    enabled: true,
    zones: [
      {
        x: 1, y: 1, w: 23, h: 18,
        rate: 0.08,
        table: [
          { enemy: 'doubt', weight: 30 },
          { enemy: 'fear', weight: 25 },
          { enemy: 'temptation', weight: 25 },
          { enemy: 'pride', weight: 20 },
        ],
      },
    ],
  },

  music: 'bgm_wilderness',
};
