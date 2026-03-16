/**
 * Jordan River map for Arc 2 - "Baptism & Temptation."
 * 30x20 tiles - River on east side, grassy bank west, John's preaching spot.
 * Player arrives from south (Jerusalem route), can cross east to wilderness.
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
    if (x >= 24) {
      // River (east side, cols 24-29)
      ground.push(3); // water
    } else if (x >= 22 && x <= 23) {
      // River bank (sandy edge)
      ground.push(4); // sand/dirt
    } else if (y === H - 1 && x >= 13 && x <= 16) {
      // South path entrance
      ground.push(2); // stone path
    } else if (y >= 0 && y <= 1 && x >= 0 && x <= 4) {
      // Northwest trees/wall boundary
      ground.push(5); // wall (dense vegetation)
    } else if (y >= 0 && y <= 1 && x >= 18 && x <= 21) {
      // Northeast trees/wall boundary
      ground.push(5); // wall
    } else if ((x === 14 || x === 15) && y >= 14) {
      // Path from south
      ground.push(2); // stone path
    } else if (x >= 10 && x <= 18 && y >= 6 && y <= 12) {
      // John's preaching clearing (open ground)
      if (x >= 12 && x <= 16 && y >= 8 && y <= 10) {
        ground.push(4); // sandy clearing center
      } else {
        ground.push(1); // grass clearing
      }
    } else {
      // Default: grass
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
    if (tile === 3) {
      // Water is blocked
      collision.push(1);
    } else if (tile === 5) {
      collision.push(1); // walls/vegetation blocked
    } else if (y === 0 && !(x >= 13 && x <= 16)) {
      collision.push(1); // north edge blocked (no exit)
    } else if (x === 0) {
      collision.push(1); // west edge blocked
    } else {
      collision.push(0);
    }
  }
}

// Event layer
const event = fill(W * H, 0);
// South warp to jerusalem (row 19, cols 13-16)
for (let x = 13; x <= 16; x++) {
  event[(H - 1) * W + x] = 'warp_south';
}
// East warp to wilderness (col 23, rows 9-10) - sandy bank edge, walkable land tile
for (let y = 9; y <= 10; y++) {
  event[y * W + 23] = 'warp_east';
}

export const MAP = {
  id: 'jordan_river',
  name: 'Jordan River',
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
    warp_south: {
      type: 'warp',
      targetMap: 'jerusalem',
      targetX: 14,
      targetY: 1,
      transition: 'fade',
    },
    warp_east: {
      type: 'warp',
      targetMap: 'wilderness',
      targetX: 1,
      targetY: 10,
      transition: 'fade',
    },
  },

  npcs: [
    {
      id: 'john_baptist',
      sprite: 'npc_john_baptist',
      x: 14,
      y: 9,
      facing: 'down',
      dialogue: 'john_baptist',
      movement: 'static',
    },
    {
      id: 'crowd_1',
      sprite: 'townspeople_elder_a',
      x: 11,
      y: 8,
      facing: 'right',
      dialogue: 'crowd_1',
      movement: 'static',
    },
    {
      id: 'crowd_2',
      sprite: 'townspeople_woman_a',
      x: 17,
      y: 10,
      facing: 'left',
      dialogue: 'crowd_2',
      movement: 'static',
    },
    {
      id: 'crowd_3',
      sprite: 'townspeople_woman_a',
      x: 12,
      y: 11,
      facing: 'up',
      dialogue: 'crowd_3',
      movement: 'static',
    },
  ],

  encounters: {
    enabled: false,
  },

  music: 'bgm_jordan_river',
};
