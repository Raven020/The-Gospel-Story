/**
 * Mount of Choosing map for Arc 3 - "Calling of the Disciples."
 * 20x25 tiles - rocky mountain path winding to summit, grass on lower slopes.
 * Disciples are spawned via cutscenes, no static NPCs.
 */

// Helper: fill array with a value
const fill = (n, v) => new Array(n).fill(v);

// 20x25 map
const W = 20;
const H = 25;

// Tile IDs (overworld tileset):
// 1 = grass, 2 = stone path, 3 = water, 4 = sand/dirt, 5 = wall (rock)

// Build ground layer
const ground = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (y === 0) {
      // North edge: rock wall except summit clearing (cols 8-11)
      if (x >= 8 && x <= 11) {
        ground.push(1); // grass summit edge
      } else {
        ground.push(5); // rock wall
      }
    } else if (y === H - 1) {
      // South edge: rock wall except entrance (cols 9-10)
      if (x >= 9 && x <= 10) {
        ground.push(4); // dirt path entrance
      } else {
        ground.push(5); // rock wall
      }
    } else if (x === 0 || x === W - 1) {
      // Side rock walls
      ground.push(5);
    } else if (y >= 1 && y <= 4 && x >= 6 && x <= 13) {
      // Summit clearing (north area)
      if (x === 6 || x === 13) {
        ground.push(5); // rock border
      } else {
        ground.push(1); // grass clearing
      }
    } else if (y === 5 && x >= 9 && x <= 10) {
      // Path down from summit
      ground.push(2);
    } else if (y >= 6 && y <= 8 && x >= 8 && x <= 11) {
      // Upper path segment (heading right)
      if (x >= 8 && x <= 11) {
        ground.push(2);
      } else {
        ground.push(5);
      }
    } else if (y >= 6 && y <= 8 && (x >= 12 && x <= 14)) {
      // Path curves right
      if (y === 8) {
        ground.push(2); // turn point
      } else {
        ground.push(5); // rock
      }
    } else if (y >= 8 && y <= 11 && x >= 13 && x <= 14) {
      // Path goes south on right side
      ground.push(2);
    } else if (y === 12 && x >= 6 && x <= 14) {
      // Path crosses left
      ground.push(2);
    } else if (y >= 13 && y <= 16 && x >= 5 && x <= 6) {
      // Path goes south on left side
      ground.push(2);
    } else if (y === 17 && x >= 5 && x <= 14) {
      // Path crosses right again
      ground.push(2);
    } else if (y >= 18 && y <= 21 && x >= 13 && x <= 14) {
      // Path goes south on right
      ground.push(2);
    } else if (y === 22 && x >= 9 && x <= 14) {
      // Path crosses to center
      ground.push(2);
    } else if (y >= 23 && y <= 24 && x >= 9 && x <= 10) {
      // Final path segment to south entrance
      ground.push(2);
    } else if (y >= 20 && y <= 24 && x >= 1 && x <= 5) {
      // Lower grass area (southwest)
      ground.push(1);
    } else if (y >= 20 && y <= 24 && x >= 15 && x <= 18) {
      // Lower grass area (southeast)
      ground.push(1);
    } else if (y >= 13 && y <= 19 && x >= 1 && x <= 4) {
      // Mid grass area (west)
      ground.push(1);
    } else if (y >= 13 && y <= 19 && x >= 15 && x <= 18) {
      // Mid grass area (east)
      ground.push(1);
    } else {
      // Default: rock formations
      ground.push(5);
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
    if (tile === 5) {
      collision.push(1); // rock walls blocked
    } else if (y === 0 || x === 0 || x === W - 1) {
      collision.push(1); // edges blocked
    } else if (y === H - 1) {
      // South edge: only entrance passable
      if (x >= 9 && x <= 10) {
        collision.push(0);
      } else {
        collision.push(1);
      }
    } else {
      collision.push(0);
    }
  }
}

// Event layer: warp at south entrance
const event = fill(W * H, 0);
// South warp to capernaum (row 24, cols 9-10)
for (let x = 9; x <= 10; x++) {
  event[(H - 1) * W + x] = 'warp_capernaum';
}

export const MAP = {
  id: 'mountain',
  name: 'Mount of Choosing',
  width: W,
  height: H,
  tileset: 'overworld',

  layers: {
    ground,
    detail,
    above,
    collision,
    event,
  },

  events: {
    warp_capernaum: {
      type: 'warp',
      targetMap: 'capernaum',
      targetX: 12,
      targetY: 18,
      transition: 'fade',
    },
  },

  npcs: [],

  encounters: {
    enabled: true,
    zones: [
      {
        x: 1, y: 13, width: 4, height: 7,
        enemies: ['pride', 'temptation', 'doubt'],
        rate: 0.10,
      },
      {
        x: 15, y: 13, width: 4, height: 7,
        enemies: ['pride', 'temptation', 'doubt'],
        rate: 0.10,
      },
      {
        x: 1, y: 20, width: 5, height: 4,
        enemies: ['pride', 'doubt'],
        rate: 0.08,
      },
      {
        x: 15, y: 20, width: 4, height: 4,
        enemies: ['temptation', 'doubt'],
        rate: 0.08,
      },
    ],
  },

  music: 'bgm_mountain',
};
