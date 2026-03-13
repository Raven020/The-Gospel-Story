/**
 * Demo map for development and testing.
 * 20x15 tiles - grass field with stone path, water border, and NPCs.
 */

// Helper: fill array with a value
const fill = (n, v) => new Array(n).fill(v);

// 20x15 map
const W = 20;
const H = 15;

// Build ground layer: grass with stone path down the middle (col 9-10)
const ground = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (x >= 18) {
      ground.push(3); // water on right edge
    } else if (x === 9 || x === 10) {
      ground.push(2); // stone path
    } else {
      ground.push(1); // grass
    }
  }
}

// Detail layer: empty
const detail = fill(W * H, 0);

// Above layer: empty
const above = fill(W * H, 0);

// Collision layer: walls on top/bottom edges, water is blocked
const collision = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (y === 0 || y === H - 1) {
      collision.push(1); // top/bottom walls
    } else if (x >= 18) {
      collision.push(1); // water blocked
    } else {
      collision.push(0);
    }
  }
}

// Event layer: warp at bottom of path
const event = fill(W * H, 0);
// Warp event at tiles (9,13) and (10,13) — just above bottom wall
event[13 * W + 9] = 'warp_south';
event[13 * W + 10] = 'warp_south';

export const MAP = {
  id: 'demo',
  name: 'Demo Field',
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
      targetMap: 'demo',
      targetX: 9,
      targetY: 2,
      transition: 'fade',
    },
  },

  npcs: [
    {
      id: 'test_npc_static',
      sprite: 'townspeople_woman_a',
      x: 5,
      y: 5,
      facing: 'down',
      dialogue: 'dlg_test_greeting',
      movement: 'static',
    },
    {
      id: 'test_npc_wander',
      sprite: 'townspeople_elder_a',
      x: 13,
      y: 7,
      facing: 'left',
      dialogue: 'dlg_test_elder',
      movement: { type: 'wander', radius: 2, intervalMs: 2000 },
    },
  ],

  encounters: {
    enabled: false,
  },

  music: 'bgm_overworld',
};
