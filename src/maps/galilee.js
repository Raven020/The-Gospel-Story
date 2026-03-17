/**
 * Sea of Galilee shoreline map for Arc 3 - "Calling of the Disciples."
 * 30x20 tiles - lake water east/north, sandy beach, fishing docks, grassy inland.
 * Fishermen NPCs: Peter, Andrew, James, John at the docks.
 */

// Helper: fill array with a value
const fill = (n, v) => new Array(n).fill(v);

// 30x20 map
const W = 30;
const H = 20;

// Tile IDs (shoreline tileset):
// 1 = sand_shore, 2 = shallow_water, 3 = deep_water, 4 = dock_wood,
// 5 = grass_shore, 6 = boat, 7 = pier_post, 8 = pebbles

// Build ground layer
const ground = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (y <= 2) {
      // North: water (rows 0-2)
      if (x <= 14) {
        // Northwest corner: shallow water near land
        if (y === 2 && x <= 10) {
          ground.push(1); // sand transition
        } else {
          ground.push(2); // shallow water
        }
      } else {
        ground.push(3); // deep water
      }
    } else if (x >= 22) {
      // East side: water
      if (x === 22) {
        ground.push(2); // shallow water edge
      } else {
        ground.push(3); // deep water
      }
    } else if (y === 3 && x >= 11 && x <= 21) {
      // Shallow water fringe along north-east
      if (x <= 14) {
        ground.push(1); // sand
      } else {
        ground.push(2); // shallow
      }
    } else if (x >= 18 && x <= 21 && y >= 4 && y <= 8) {
      // Dock area
      if (x === 18 || x === 21) {
        ground.push(7); // pier posts on edges
      } else {
        ground.push(4); // dock wood
      }
    } else if (x >= 15 && x <= 21 && y >= 3 && y <= 12) {
      // Beach along eastern shore
      if (x >= 19) {
        ground.push(8); // pebbles near water
      } else {
        ground.push(1); // sand
      }
    } else if (x <= 7 && y >= 4) {
      // Western inland: grass
      ground.push(5);
    } else if (y >= H - 2 && x >= 13 && x <= 16) {
      // South path (exit to capernaum)
      ground.push(8); // pebbly path
    } else if (y >= 3 && x >= 8 && x <= 14) {
      // Central area: sand
      ground.push(1);
    } else {
      // Default: sand shore
      ground.push(1);
    }
  }
}

// Detail layer: boats near docks + beach accents.
// Tile 6 = boat, 100 = shells, 101 = wet sand mark
const detail = fill(W * H, 0);
// Boats at dock (col 23 is shallow water east of dock area)
detail[6 * W + 23] = 6; // boat in shallow water east of dock
detail[10 * W + 23] = 6; // second boat further south
// Shells scattered on sandy beach
detail[ 5 * W +  9] = 100; // central sand, row 5
detail[ 8 * W + 12] = 100; // central sand, row 8
detail[11 * W + 10] = 100; // central sand, row 11
detail[13 * W + 16] = 100; // south-east beach
detail[ 6 * W + 15] = 100; // east beach strip
// Wet sand tide marks near water transition
detail[ 4 * W + 14] = 101; // just inland from shallow water
detail[ 7 * W + 13] = 101; // mid beach
detail[10 * W + 15] = 101; // lower beach

// Above layer: tall reeds on grass/water border.
// Tile 200 = tall reeds
const above = fill(W * H, 0);
// Reed clusters along the western grassy shore (where grass meets open area)
above[ 6 * W +  6] = 200; // west grass, mid area
above[ 9 * W +  4] = 200; // west grass, lower mid
above[12 * W +  5] = 200; // west grass, south area
above[15 * W +  3] = 200; // south-west grass
above[11 * W +  7] = 200; // inner grass edge

// Collision layer
const collision = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    const tile = ground[idx];
    const det = detail[idx];
    if (above[idx] !== 0) {
      collision.push(1); // above-layer footprint tiles are blocked (reeds)
    } else if (tile === 2 || tile === 3) {
      collision.push(1); // water is blocked
    } else if (tile === 6 || det === 6) {
      collision.push(1); // boats blocked
    } else if (tile === 7) {
      collision.push(1); // pier posts blocked
    } else if (y === 0 || (y <= 2 && x > 14)) {
      collision.push(1); // north water edge
    } else if (x === W - 1) {
      collision.push(1); // east edge
    } else if (x === 0 && (y < H - 1)) {
      collision.push(1); // west edge (except south path)
    } else {
      collision.push(0);
    }
  }
}

// Event layer: warp at south
const event = fill(W * H, 0);
// South warp to capernaum (row 19, cols 13-16)
for (let x = 13; x <= 16; x++) {
  event[(H - 1) * W + x] = 'warp_capernaum';
}

export const MAP = {
  id: 'galilee',
  name: 'Sea of Galilee',
  width: W,
  height: H,
  tileset: 'shoreline',

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
      targetY: 1,
      transition: 'fade',
    },
  },

  npcs: [
    {
      id: 'peter',
      sprite: 'peter',
      x: 19,
      y: 5,
      facing: 'right',
      dialogue: 'peter_recruit',
      movement: 'static',
    },
    {
      id: 'andrew',
      sprite: 'andrew',
      x: 20,
      y: 5,
      facing: 'right',
      dialogue: 'andrew_recruit',
      movement: 'static',
    },
    {
      id: 'james',
      sprite: 'james',
      x: 19,
      y: 7,
      facing: 'down',
      dialogue: 'james_recruit',
      movement: 'static',
    },
    {
      id: 'john',
      sprite: 'john',
      x: 20,
      y: 7,
      facing: 'down',
      dialogue: 'john_disciple_recruit',
      movement: 'static',
    },
  ],

  encounters: {
    enabled: true,
    zones: [
      {
        x: 1, y: 4, w: 7, h: 14,
        rate: 0.08,
        table: [
          { enemy: 'doubt', weight: 1 },
          { enemy: 'fear', weight: 1 },
          { enemy: 'greed', weight: 1 },
        ],
      },
    ],
  },

  music: 'bgm_galilee',
};
