/**
 * Capernaum town map for Arc 3 - "Calling of the Disciples."
 * 25x20 tiles - stone streets, buildings, market area, synagogue, tax booth.
 * NPCs: Philip, Nathanael, Matthew, townspeople.
 */

// Helper: fill array with a value
const fill = (n, v) => new Array(n).fill(v);

// 25x20 map
const W = 25;
const H = 20;

// Tile IDs (overworld tileset):
// 1 = grass, 2 = stone path, 3 = water, 4 = sand/dirt, 5 = wall

// Build ground layer
const ground = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (y === 0) {
      // North edge - wall except gate (cols 11-13) to galilee
      if (x >= 11 && x <= 13) {
        ground.push(2); // stone path gate
      } else {
        ground.push(5); // wall
      }
    } else if (y === H - 1) {
      // South edge - wall except gate (cols 11-13) to mountain
      if (x >= 11 && x <= 13) {
        ground.push(4); // dirt path gate
      } else {
        ground.push(5); // wall
      }
    } else if (x === 0 || x === W - 1) {
      // Side walls
      ground.push(5);
    } else if ((x === 12) && y >= 1 && y <= 18) {
      // Main north-south street
      ground.push(2);
    } else if (y === 10 && x >= 2 && x <= 22) {
      // East-west cross street
      ground.push(2);
    } else if ((x === 11 || x === 13) && y >= 1 && y <= 3) {
      // North gate approach
      ground.push(2);
    } else if ((x === 11 || x === 13) && y >= 17 && y <= 18) {
      // South gate approach
      ground.push(2);
    } else if (y >= 3 && y <= 6 && x >= 2 && x <= 7) {
      // Market area (northwest)
      if ((y === 4 || y === 6) && (x === 3 || x === 6)) {
        ground.push(5); // market stalls
      } else {
        ground.push(2); // stone path
      }
    } else if (y >= 3 && y <= 6 && x >= 16 && x <= 22) {
      // Synagogue area (northeast)
      if (y >= 3 && y <= 5 && x >= 17 && x <= 21) {
        if (y === 5 && x === 19) {
          ground.push(2); // synagogue entrance
        } else {
          ground.push(5); // synagogue walls
        }
      } else {
        ground.push(2); // path around synagogue
      }
    } else if (y >= 12 && y <= 15 && x >= 2 && x <= 7) {
      // Residential area west
      if ((y === 13) && (x === 3 || x === 6)) {
        ground.push(5); // houses
      } else if ((y === 15) && (x === 3 || x === 6)) {
        ground.push(5); // houses
      } else {
        ground.push(4); // dirt
      }
    } else if (y >= 12 && y <= 15 && x >= 16 && x <= 22) {
      // Tax booth / Matthew's area (southeast)
      if (y === 13 && x >= 18 && x <= 20) {
        ground.push(5); // tax booth
      } else {
        ground.push(4); // dirt
      }
    } else if (y === 8 && x >= 3 && x <= 21) {
      // Secondary east-west path
      ground.push(2);
    } else {
      // Default: dirt
      ground.push(4);
    }
  }
}

// Detail layer: flowers, path marks, rocks
const detail = fill(W * H, 0);
// Flowers in open dirt/grass areas
detail[2 * W + 3] = 100;
detail[2 * W + 20] = 100;
detail[16 * W + 4] = 100;
detail[16 * W + 20] = 100;
// Path marks on worn stone paths
detail[10 * W + 6] = 101;
detail[10 * W + 18] = 101;
detail[8 * W + 10] = 101;
detail[8 * W + 15] = 101;
// Rocks scattered on dirt areas
detail[7 * W + 2] = 102;
detail[7 * W + 22] = 102;
detail[17 * W + 3] = 102;
detail[17 * W + 21] = 102;

// Above layer: tree canopies and tall grass
const above = fill(W * H, 0);
// Tree canopies in open areas
above[6 * W + 3] = 200;
above[6 * W + 21] = 200;
above[16 * W + 9] = 200;
above[16 * W + 15] = 200;
// Tall grass tops near residential areas
above[14 * W + 2] = 201;
above[14 * W + 22] = 201;

// Collision layer
const collision = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    const tile = ground[idx];
    if (above[idx] === 200) {
      collision.push(1); // tree canopy footprint blocked
    } else if (tile === 5) {
      collision.push(1); // walls, buildings, stalls blocked
    } else if (y === 0 || y === H - 1 || x === 0 || x === W - 1) {
      // Edge tiles: only gate openings passable
      if ((y === 0 && x >= 11 && x <= 13) || (y === H - 1 && x >= 11 && x <= 13)) {
        collision.push(0); // gate openings
      } else {
        collision.push(1);
      }
    } else {
      collision.push(0);
    }
  }
}

// Event layer: warps north and south
const event = fill(W * H, 0);
// North warp to galilee (row 0, cols 11-13)
for (let x = 11; x <= 13; x++) {
  event[0 * W + x] = 'warp_galilee';
}
// South warp to mountain (row 19, cols 11-13)
for (let x = 11; x <= 13; x++) {
  event[(H - 1) * W + x] = 'warp_mountain';
}

export const MAP = {
  id: 'capernaum',
  name: 'Capernaum',
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
    warp_galilee: {
      type: 'warp',
      targetMap: 'galilee',
      targetX: 14,
      targetY: 18,
      transition: 'fade',
    },
    warp_mountain: {
      type: 'warp',
      targetMap: 'mountain',
      targetX: 10,
      targetY: 23,
      transition: 'fade',
    },
  },

  npcs: [
    {
      id: 'philip',
      sprite: 'philip',
      x: 5,
      y: 5,
      facing: 'down',
      dialogue: 'philip_recruit',
      movement: 'static',
    },
    {
      id: 'nathanael',
      sprite: 'nathanael',
      x: 7,
      y: 5,
      facing: 'left',
      dialogue: 'nathanael_recruit',
      movement: 'static',
    },
    {
      id: 'matthew',
      sprite: 'matthew',
      x: 19,
      y: 14,
      facing: 'left',
      dialogue: 'matthew_recruit',
      movement: 'static',
    },
    {
      id: 'townsperson_cap_1',
      sprite: 'townspeople_woman_a',
      x: 10,
      y: 10,
      facing: 'right',
      dialogue: 'townsperson_cap_1',
      movement: { type: 'wander', radius: 2, intervalMs: 3000 },
    },
    {
      id: 'townsperson_cap_2',
      sprite: 'townspeople_elder_a',
      x: 14,
      y: 8,
      facing: 'down',
      dialogue: 'townsperson_cap_2',
      movement: 'static',
    },
  ],

  encounters: {
    enabled: false,
  },

  music: 'bgm_capernaum',
};
