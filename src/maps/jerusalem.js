/**
 * Jerusalem town map for Arc 1 - "The Boy Jesus."
 * 30x20 tiles - streets, market area, residential area, temple entrance at north.
 * Player controls Mary/Joseph searching for young Jesus.
 */

// Helper: fill array with a value
const fill = (n, v) => new Array(n).fill(v);

// 30x20 map
const W = 30;
const H = 20;

// Tile IDs (overworld tileset):
// 1 = grass, 2 = stone path, 3 = water, 4 = sand/dirt, 5 = wall

// Build ground layer
const ground = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (y === 0) {
      // North edge - wall except temple entrance (cols 13-16)
      if (x >= 13 && x <= 16) {
        ground.push(2); // stone path to temple
      } else {
        ground.push(5); // wall
      }
    } else if (y === H - 1) {
      // South edge - wall except gate (cols 13-16)
      if (x >= 13 && x <= 16) {
        ground.push(4); // sand/dirt gate
      } else {
        ground.push(5); // wall
      }
    } else if (x === 0 || x === W - 1) {
      // Side walls
      ground.push(5);
    } else if (y >= 1 && y <= 3 && x >= 12 && x <= 17) {
      // Path to temple entrance (north area)
      ground.push(2);
    } else if (y >= 4 && y <= 6 && x >= 3 && x <= 26) {
      // Market row - stone path
      if (y === 5 && (x === 5 || x === 10 || x === 15 || x === 20 || x === 25)) {
        ground.push(5); // market stalls (wall tiles)
      } else {
        ground.push(2);
      }
    } else if ((x === 14 || x === 15) && y >= 1 && y <= 18) {
      // Main north-south street
      ground.push(2);
    } else if (y === 10 && x >= 2 && x <= 27) {
      // East-west cross street
      ground.push(2);
    } else if (y >= 12 && y <= 17 && x >= 2 && x <= 8) {
      // Residential area (west) - sand/dirt
      if (y === 13 && (x === 3 || x === 7)) {
        ground.push(5); // houses
      } else if (y === 16 && (x === 3 || x === 7)) {
        ground.push(5); // houses
      } else {
        ground.push(4);
      }
    } else if (y >= 12 && y <= 17 && x >= 21 && x <= 27) {
      // Residential area (east) - sand/dirt
      if (y === 13 && (x === 22 || x === 26)) {
        ground.push(5); // houses
      } else if (y === 16 && (x === 22 || x === 26)) {
        ground.push(5); // houses
      } else {
        ground.push(4);
      }
    } else {
      // Default: sand/dirt
      ground.push(4);
    }
  }
}

// Detail layer: floor accents.
// Tile 100 = flowers, 101 = path marks, 102 = rocks
const detail = fill(W * H, 0);
// Flowers in open sand areas between paths
detail[ 8 * W +  4] = 100; // west open area, row 8
detail[ 9 * W +  8] = 100; // near west market edge
detail[ 8 * W + 22] = 100; // east open area, row 8
detail[ 9 * W + 25] = 100; // near east market edge
detail[15 * W +  5] = 100; // south-west residential gap
detail[15 * W + 23] = 100; // south-east residential gap
// Path crossing marks on stone path intersections
detail[ 3 * W + 13] = 101; // north path to temple
detail[ 3 * W + 16] = 101; // north path to temple (other side)
detail[ 7 * W + 14] = 101; // main north-south street, upper
detail[10 * W + 11] = 101; // east-west cross street, left of center
detail[10 * W + 17] = 101; // east-west cross street, right of center
// Rocks near walls and building corners
detail[12 * W +  2] = 102; // near west wall, residential entry
detail[13 * W +  9] = 102; // east edge of west residential
detail[12 * W + 27] = 102; // near east wall, residential entry
detail[14 * W + 20] = 102; // west edge of east residential

// Above layer: tree canopies in open sand areas.
// Tile 200 = tree canopy
const above = fill(W * H, 0);
// A pair of trees flanking the open central area (rows 7-8, away from paths)
above[ 7 * W +  5] = 200; // west-side tree
above[ 7 * W + 23] = 200; // east-side tree
// Trees in south residential open gaps
above[17 * W + 10] = 200; // south-west tree
above[17 * W + 19] = 200; // south-east tree

// Collision layer: walls and stalls block, everything else open
const collision = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    const tile = ground[idx];
    if (tile === 5) {
      collision.push(1); // walls and stalls are blocked
    } else if (y === 0 || y === H - 1 || x === 0 || x === W - 1) {
      // Edge tiles that aren't gates are blocked
      if ((y === 0 && x >= 13 && x <= 16) || (y === H - 1 && x >= 13 && x <= 16)) {
        collision.push(0); // gate openings
      } else {
        collision.push(1);
      }
    } else {
      collision.push(0);
    }
  }
}

// Event layer: warps at north (to temple) and south (to route)
const event = fill(W * H, 0);
// North warp to temple (row 0, cols 13-16)
for (let x = 13; x <= 16; x++) {
  event[0 * W + x] = 'warp_temple';
}
// South warp to route/world map (row 19, cols 13-16)
for (let x = 13; x <= 16; x++) {
  event[(H - 1) * W + x] = 'warp_south';
}

export const MAP = {
  id: 'jerusalem',
  name: 'Jerusalem',
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
    warp_temple: {
      type: 'warp',
      targetMap: 'temple',
      targetX: 10,
      targetY: 13,
      transition: 'fade',
    },
    warp_south: {
      type: 'warp',
      targetMap: 'jordan_river',
      targetX: 14,
      targetY: 18,
      transition: 'fade',
    },
  },

  npcs: [
    {
      id: 'townsperson_1',
      sprite: 'townspeople_woman_a',
      x: 8,
      y: 5,
      facing: 'down',
      dialogue: 'townsperson_1',
      movement: 'static',
    },
    {
      id: 'townsperson_2',
      sprite: 'townspeople_elder_a',
      x: 18,
      y: 5,
      facing: 'left',
      dialogue: 'townsperson_2',
      movement: 'static',
    },
    {
      id: 'townsperson_3',
      sprite: 'townspeople_woman_a',
      x: 14,
      y: 8,
      facing: 'down',
      dialogue: 'townsperson_3',
      movement: { type: 'wander', radius: 2, intervalMs: 3000 },
    },
    {
      id: 'mary_worried',
      sprite: 'townspeople_woman_a',
      x: 12,
      y: 10,
      facing: 'right',
      dialogue: 'mary_worried',
      movement: 'static',
    },
    {
      id: 'townsperson_4',
      sprite: 'townspeople_elder_a',
      x: 5,
      y: 14,
      facing: 'right',
      dialogue: 'townsperson_4',
      movement: { type: 'wander', radius: 1, intervalMs: 4000 },
    },
    {
      id: 'townsperson_5',
      sprite: 'townspeople_woman_a',
      x: 24,
      y: 14,
      facing: 'left',
      dialogue: 'townsperson_5',
      movement: 'static',
    },
  ],

  encounters: {
    enabled: false,
  },

  music: 'bgm_jerusalem',
};
