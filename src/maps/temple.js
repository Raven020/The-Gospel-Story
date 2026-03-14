/**
 * Temple of Jerusalem interior map for Arc 1 - "The Boy Jesus."
 * 20x15 tiles - grand entrance hall with pillars, inner court with teachers.
 * Uses interior tileset.
 */

// Helper: fill array with a value
const fill = (n, v) => new Array(n).fill(v);

// 20x15 map
const W = 20;
const H = 15;

// Interior tileset IDs:
// 1 = stone_floor, 2 = marble_floor, 3 = wall, 4 = pillar,
// 5 = door, 6 = scroll_shelf, 7 = carpet, 8 = bench

// Build ground layer row by row
const ground = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // Outer walls
    if (y === 0 || x === 0 || x === W - 1) {
      ground.push(3); // wall
    }
    // South wall with door opening
    else if (y === H - 1) {
      if (x >= 9 && x <= 10) {
        ground.push(5); // door opening
      } else {
        ground.push(3); // wall
      }
    }
    // Scroll shelves along left and right walls (rows 1-4)
    else if (x === 1 && y >= 1 && y <= 4) {
      ground.push(6); // scroll shelf on left wall
    }
    else if (x === W - 2 && y >= 1 && y <= 4) {
      ground.push(6); // scroll shelf on right wall
    }
    // Scroll shelves in north area (rows 1-2)
    else if (y === 1 && (x >= 3 && x <= 7 || x >= 12 && x <= 16)) {
      ground.push(6); // scroll shelves along top
    }
    // Pillars - two rows framing the main hall
    else if (y === 3 && (x === 4 || x === 9 || x === 10 || x === 15)) {
      ground.push(4); // pillars
    }
    else if (y === 7 && (x === 4 || x === 9 || x === 10 || x === 15)) {
      ground.push(4); // pillars
    }
    // Carpet in central aisle (cols 8-11, rows 8-13)
    else if (x >= 8 && x <= 11 && y >= 8 && y <= 13) {
      ground.push(7); // red carpet
    }
    // Carpet in inner court (rows 2-5, cols 8-11)
    else if (x >= 8 && x <= 11 && y >= 2 && y <= 5) {
      ground.push(7); // inner court carpet
    }
    // Benches (rows 5-6, left and right of center)
    else if (y === 5 && (x === 3 || x === 6 || x === 13 || x === 16)) {
      ground.push(8); // bench
    }
    else if (y === 9 && (x === 3 || x === 6 || x === 13 || x === 16)) {
      ground.push(8); // bench
    }
    // Inner court: marble floor (rows 1-5)
    else if (y >= 1 && y <= 5) {
      ground.push(2); // marble floor
    }
    // Main hall: stone floor
    else {
      ground.push(1); // stone floor
    }
  }
}

// Detail layer: empty
const detail = fill(W * H, 0);

// Above layer: empty
const above = fill(W * H, 0);

// Collision layer: walls, pillars, shelves, benches are blocked
const collision = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    const tile = ground[idx];
    // Blocked tiles: wall(3), pillar(4), scroll_shelf(6), bench(8)
    if (tile === 3 || tile === 4 || tile === 6 || tile === 8) {
      collision.push(1);
    }
    // South door is walkable (for warp)
    else if (y === H - 1 && x >= 9 && x <= 10) {
      collision.push(0);
    }
    else {
      collision.push(0);
    }
  }
}

// Event layer: warp at south door back to Jerusalem
const event = fill(W * H, 0);
// Warp at south edge door tiles (row 14, cols 9-10)
event[(H - 1) * W + 9] = 'warp_jerusalem';
event[(H - 1) * W + 10] = 'warp_jerusalem';

export const MAP = {
  id: 'temple',
  name: 'Temple of Jerusalem',
  width: W,
  height: H,
  tileset: 'interior',

  layers: {
    ground,
    detail,
    above,
    collision,
    event,
  },

  events: {
    warp_jerusalem: {
      type: 'warp',
      targetMap: 'jerusalem',
      targetX: 14,
      targetY: 1,
      transition: 'fade',
    },
  },

  npcs: [
    {
      id: 'temple_guard',
      sprite: 'townspeople_elder_a',
      x: 9,
      y: 11,
      facing: 'down',
      dialogue: 'temple_guard',
      movement: 'static',
    },
    {
      id: 'temple_teacher_1',
      sprite: 'townspeople_elder_a',
      x: 7,
      y: 3,
      facing: 'right',
      dialogue: 'temple_teacher_1',
      movement: 'static',
    },
    {
      id: 'temple_teacher_2',
      sprite: 'townspeople_elder_a',
      x: 12,
      y: 3,
      facing: 'left',
      dialogue: 'temple_teacher_2',
      movement: 'static',
    },
    {
      id: 'young_jesus',
      sprite: 'young_jesus',
      x: 10,
      y: 3,
      facing: 'down',
      dialogue: 'young_jesus',
      movement: 'static',
    },
  ],

  encounters: {
    enabled: false,
  },

  music: 'bgm_temple',
};
