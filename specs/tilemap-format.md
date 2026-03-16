# Tilemap & Map System Specification

## Overview

Maps are composed of stacked data layers rendered in order. All coordinates are in **tile units** unless otherwise noted. All pixel art uses the same palette-key array format as sprite data.

---

## 1. Tile Dimensions

- **Tile size:** 16×16 pixels
- **Screen in tiles:** 15 wide × 10 tall = 240×160 pixels (one GBA screen)
- Maps larger than 15×10 scroll; the camera follows the player and clamps at map edges

---

## 2. Map Dimensions

```
mapWidthPx  = width  * 16
mapHeightPx = height * 16
```

A map of **30×20 tiles** is two screens wide and two screens tall. There is no enforced maximum size; keep maps reasonably small for MVP (≤64×64 tiles).

---

## 3. Tile Data Format

Tile IDs are plain integers. `0` is always the null/empty tile (transparent or skipped).

Tilesets define what each ID looks like. Maps reference tile IDs in their layer arrays.

Layer arrays are **flat, row-major**:

```js
// index = y * width + x
const tileIndex = tileY * mapWidth + tileX;
```

---

## 4. Map Layers

Every map has exactly five layers, all the same width×height in tiles.

| Layer | Render Order | Purpose |
|-------|-------------|---------|
| `ground` | 1st (bottom) | Base terrain: grass, sand, stone floor, water |
| `detail` | 2nd | Objects below the player: rugs, puddles, floor markings |
| `above` | 4th (top) | Rendered after player: tree canopies, roof overhangs, archways |
| `collision` | N/A | Binary: `0` = walkable, `1` = blocked |
| `event` | N/A | Trigger data: warps, NPC zones, cutscene areas |

Player and NPCs are rendered 3rd, between `detail` and `above`.

### Collision Layer

Values: `0` (walkable) or `1` (blocked). Checked before any movement is applied.

Water, cliffs, walls, and the above layer's footprint tiles should be blocked in the collision layer.

### Event Layer

Values are either `0` (no event) or a string event ID that maps to the map's `events` table. The engine checks the event layer on the tile the player steps onto.

```js
// event layer entry — string IDs reference map.events
collision: [0,0,1,0, ...],
event:     [0,'warp_bethlehem',0,0, ...]
```

---

## 5. Map File Format

Each map is a JS module in `src/maps/`.

```js
// src/maps/nazareth-village.js

export const MAP = {
  id: 'nazareth_village',
  name: 'Nazareth — Village',

  width: 20,   // tiles
  height: 15,  // tiles

  tileset: 'overworld',  // references src/tilesets/overworld.js

  layers: {
    // Flat row-major arrays, length = width * height
    ground: [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      // ... (20 * 15 = 300 entries total)
    ],
    detail: [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      // ... 0 = no detail tile
    ],
    above: [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      // ... canopy tiles only where trees are
    ],
    collision: [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      // ... 1 = blocked
    ],
    event: [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      // ... string event IDs or 0
    ],
  },

  // Named event definitions — referenced by event layer string IDs
  events: {
    warp_bethlehem: { type: 'warp', targetMap: 'bethlehem_road', targetX: 1, targetY: 7, transition: 'fade' },
    inn_door:       { type: 'warp', targetMap: 'nazareth_inn_interior', targetX: 4, targetY: 8, transition: 'fade' },
    trigger_joseph: { type: 'cutscene', script: 'cs_joseph_workshop' },
  },

  npcs: [
    {
      id: 'villager_miriam',
      sprite: 'townspeople_woman_a',
      x: 5,          // tile x
      y: 3,          // tile y
      facing: 'down',
      dialogue: 'dlg_miriam_greeting',
      movement: 'static',
    },
    {
      id: 'old_eli',
      sprite: 'townspeople_elder_a',
      x: 11,
      y: 7,
      facing: 'left',
      dialogue: 'dlg_eli_law',
      movement: { type: 'wander', radius: 2, intervalMs: 2000 },
    },
  ],

  encounters: {
    enabled: false,
    // For wilderness maps, see encounter config below
  },

  music: 'bgm_nazareth',
};
```

---

## 6. NPC Definitions

NPCs are defined per-map. Each NPC is a plain object in the `npcs` array.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique within the map; used to track state (spoken to, quest flags) |
| `sprite` | string | Key into the sprite registry (`src/sprites/`) |
| `x`, `y` | number | Spawn position in tile coordinates |
| `facing` | string | Initial direction: `'up'` `'down'` `'left'` `'right'` |
| `dialogue` | string | Dialogue script key, looked up in `src/data/dialogue.js` |
| `movement` | string or object | `'static'` — never moves; or wander config (see below) |

### Wander Config

```js
movement: {
  type: 'wander',
  radius: 3,        // max tiles from spawn point
  intervalMs: 2500, // ms between steps
}
```

Wandering NPCs will not enter collision-blocked tiles or leave their radius. They face the direction of each step.

---

## 7. Warp Definitions

Warps are defined in the map's `events` table with `type: 'warp'`.

| Field | Type | Description |
|-------|------|-------------|
| `targetMap` | string | ID of the destination map (`MAP.id`) |
| `targetX` | number | Destination tile X |
| `targetY` | number | Destination tile Y |
| `transition` | string | `'fade'` (black fade out/in) or `'instant'` |

The event layer string ID is placed on every tile that should trigger the warp (e.g., a doorway may be 1×1 or 2×1 tiles wide — place the same event ID on each tile).

```js
// Example: 2-tile-wide door at tiles (4,8) and (5,8)
event: [
  // ...row 8...
  0, 0, 0, 0, 'inn_door', 'inn_door', 0, 0, ...
]
```

---

## 8. Encounter Zones

Random battles occur when the player walks in tiles that belong to an encounter zone. Encounter zones are rectangular regions defined per-map.

```js
encounters: {
  enabled: true,
  zones: [
    {
      // tile-coordinate bounding box (inclusive)
      x: 0, y: 0, w: 20, h: 15,
      rate: 0.08,          // probability per step (8%)
      table: [
        { enemy: 'roman_soldier',  weight: 5 },
        { enemy: 'desert_bandit',  weight: 3 },
        { enemy: 'wild_beast',     weight: 2 },
      ],
    },
  ],
},
```

Multiple zones can overlap; the engine checks the zone the player's tile falls in and uses the first match (ordered by array index). `rate` is a 0–1 float checked each time the player completes a tile step while on walkable grass/sand/road tiles designated for encounters.

Enemy IDs reference `src/data/enemies.js`.

---

## 9. Tileset Format

Tilesets live in `src/tilesets/`. Each is a JS module exporting a shared palette and per-tile pixel data.

Pixel data format matches the sprite format: a 16×16 array of palette key strings. `_` is transparent.

```js
// src/tilesets/overworld.js

export const PALETTE = {
  _:   null,        // transparent
  G1:  '#5A8A3C',   // grass base
  G2:  '#4A7A2C',   // grass shadow
  G3:  '#6A9A4C',   // grass highlight
  SD:  '#C8A96E',   // sand/dirt base
  SS:  '#B8996E',   // sand shadow
  ST:  '#8C7A5A',   // stone base
  SK:  '#7A6A4A',   // stone shadow
  SH:  '#9C8A6A',   // stone highlight
  WA:  '#3A7AAA',   // water base
  WD:  '#2A6A9A',   // water deep
  WH:  '#6AAACC',   // water highlight
  PB:  '#8B4513',   // path/brown dirt
  TK:  '#3D5C1E',   // tree trunk dark
  TL:  '#2D7A2D',   // leaf base
  TS:  '#1D6A1D',   // leaf shadow
};

// Tile ID 0 is always reserved (null tile — transparent / skip)
// Tile IDs start at 1.

export const TILES = {

  // --- Tile 1: Grass (plain) ---
  1: [
    ['G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1'],
    ['G1','G2','G1','G1','G1','G3','G1','G1','G1','G1','G2','G1','G1','G1','G1','G1'],
    ['G1','G1','G1','G3','G1','G1','G1','G1','G1','G2','G1','G1','G1','G3','G1','G1'],
    ['G1','G1','G1','G1','G1','G1','G2','G1','G1','G1','G1','G1','G1','G1','G1','G1'],
    ['G2','G1','G1','G1','G1','G1','G1','G1','G3','G1','G1','G1','G1','G1','G2','G1'],
    ['G1','G1','G3','G1','G1','G1','G1','G1','G1','G1','G1','G3','G1','G1','G1','G1'],
    ['G1','G1','G1','G1','G2','G1','G1','G1','G1','G1','G1','G1','G1','G2','G1','G1'],
    ['G1','G3','G1','G1','G1','G1','G1','G2','G1','G1','G1','G1','G1','G1','G1','G3'],
    ['G1','G1','G1','G1','G1','G1','G1','G1','G1','G3','G1','G1','G2','G1','G1','G1'],
    ['G2','G1','G1','G3','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G3','G1'],
    ['G1','G1','G1','G1','G1','G2','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1'],
    ['G1','G1','G2','G1','G1','G1','G1','G3','G1','G1','G1','G2','G1','G1','G1','G1'],
    ['G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G3','G1','G1'],
    ['G3','G1','G1','G1','G2','G1','G1','G1','G3','G1','G1','G1','G1','G1','G1','G2'],
    ['G1','G1','G1','G1','G1','G1','G1','G1','G1','G1','G2','G1','G1','G1','G1','G1'],
    ['G1','G2','G1','G3','G1','G1','G1','G1','G1','G1','G1','G1','G3','G1','G1','G1'],
  ],

  // --- Tile 2: Stone path ---
  2: [
    ['ST','ST','SH','ST','SK','ST','ST','ST','ST','SH','ST','ST','ST','SK','ST','ST'],
    ['ST','SH','ST','ST','ST','ST','SK','ST','ST','ST','ST','ST','SH','ST','ST','SK'],
    ['SK','ST','ST','ST','ST','ST','ST','ST','SK','ST','ST','ST','ST','ST','ST','ST'],
    ['ST','ST','SK','ST','SH','ST','ST','ST','ST','ST','SH','ST','SK','ST','ST','ST'],
    ['ST','ST','ST','ST','ST','ST','ST','SK','ST','ST','ST','ST','ST','ST','SK','ST'],
    ['SH','ST','ST','SK','ST','ST','ST','ST','ST','SH','ST','SK','ST','ST','ST','ST'],
    ['ST','ST','ST','ST','ST','SH','ST','ST','ST','ST','ST','ST','ST','ST','SH','ST'],
    ['ST','SK','ST','ST','ST','ST','ST','ST','SH','ST','SK','ST','ST','ST','ST','ST'],
    ['ST','ST','ST','SH','ST','SK','ST','ST','ST','ST','ST','ST','ST','SK','ST','ST'],
    ['SK','ST','ST','ST','ST','ST','ST','SH','ST','ST','ST','SH','ST','ST','ST','SK'],
    ['ST','ST','SH','ST','ST','ST','ST','ST','ST','SK','ST','ST','ST','ST','ST','ST'],
    ['ST','ST','ST','ST','SK','ST','ST','ST','ST','ST','ST','ST','SK','SH','ST','ST'],
    ['ST','SH','ST','ST','ST','ST','ST','SK','ST','SH','ST','ST','ST','ST','ST','ST'],
    ['ST','ST','ST','SK','ST','ST','ST','ST','ST','ST','ST','SK','ST','ST','SH','ST'],
    ['SH','ST','ST','ST','ST','SH','ST','ST','SK','ST','ST','ST','ST','ST','ST','ST'],
    ['ST','ST','SK','ST','ST','ST','ST','ST','ST','ST','SH','ST','ST','SK','ST','ST'],
  ],

  // --- Tile 3: Water ---
  3: [
    ['WA','WA','WH','WA','WA','WA','WD','WA','WA','WH','WA','WA','WA','WA','WD','WA'],
    ['WA','WA','WA','WA','WH','WA','WA','WA','WA','WA','WA','WD','WA','WA','WA','WA'],
    ['WD','WA','WA','WA','WA','WA','WA','WH','WA','WA','WA','WA','WA','WH','WA','WD'],
    ['WA','WA','WH','WA','WA','WD','WA','WA','WA','WA','WH','WA','WA','WA','WA','WA'],
    ['WA','WA','WA','WA','WA','WA','WA','WA','WD','WA','WA','WA','WA','WA','WH','WA'],
    ['WA','WD','WA','WH','WA','WA','WA','WA','WA','WA','WA','WH','WA','WD','WA','WA'],
    ['WA','WA','WA','WA','WA','WA','WH','WA','WA','WA','WA','WA','WA','WA','WA','WH'],
    ['WH','WA','WA','WA','WD','WA','WA','WA','WH','WA','WD','WA','WA','WA','WA','WA'],
    ['WA','WA','WA','WA','WA','WA','WA','WA','WA','WA','WA','WA','WH','WA','WD','WA'],
    ['WA','WH','WD','WA','WA','WA','WA','WH','WA','WD','WA','WA','WA','WA','WA','WA'],
    ['WA','WA','WA','WA','WA','WA','WA','WA','WA','WA','WA','WH','WA','WA','WA','WD'],
    ['WD','WA','WA','WH','WA','WA','WD','WA','WA','WA','WA','WA','WA','WH','WA','WA'],
    ['WA','WA','WA','WA','WA','WH','WA','WA','WA','WD','WA','WA','WA','WA','WA','WA'],
    ['WA','WH','WA','WA','WD','WA','WA','WA','WA','WA','WA','WA','WH','WA','WD','WA'],
    ['WA','WA','WA','WA','WA','WA','WA','WH','WA','WA','WA','WH','WA','WA','WA','WA'],
    ['WD','WA','WH','WA','WA','WA','WA','WA','WD','WA','WA','WA','WA','WA','WA','WH'],
  ],

  // Additional tiles follow the same pattern...
  // 4: sand, 5: wall-top, 6: tree-trunk, 7: tree-canopy, etc.
};
```

### Tileset Conventions

- Tile `0` is always the null tile; never define it in `TILES`
- IDs 1–99 are reserved for terrain (ground layer use)
- IDs 100–199 are detail tiles (detail layer use)
- IDs 200–299 are above-player tiles (above layer use)
- A tile can technically appear in any layer; these ranges are conventions for readability
- Transparency (`_`) in above-layer tiles lets the player and ground show through

---

## 10. Engine Integration Notes

### Rendering Loop (per frame)

```js
function renderMap(ctx, map, tileset, cameraX, cameraY) {
  renderLayer(ctx, map, tileset, map.layers.ground, cameraX, cameraY);
  renderLayer(ctx, map, tileset, map.layers.detail, cameraX, cameraY);
  renderEntities(ctx, map, cameraX, cameraY); // player + NPCs
  renderLayer(ctx, map, tileset, map.layers.above,  cameraX, cameraY);
}
```

### Drawing a Tile

```js
function drawTile(ctx, tileset, tileId, destX, destY) {
  if (!tileId) return; // skip tile 0
  const pixels = tileset.TILES[tileId];
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const key = pixels[row][col];
      if (key === '_') continue;
      ctx.fillStyle = tileset.PALETTE[key];
      ctx.fillRect(destX + col, destY + row, 1, 1);
    }
  }
}
```

### Camera

Camera position is in **pixel** units, top-left corner of the viewport:

```js
// Clamp camera so it never shows outside the map
cameraX = Math.max(0, Math.min(playerPixelX - 112, map.width  * 16 - 240));
cameraY = Math.max(0, Math.min(playerPixelY -  72, map.height * 16 - 160));
```

### Collision Check

```js
function isBlocked(map, tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) return true;
  return map.layers.collision[tileY * map.width + tileX] === 1;
}
```

### Event Check (on player tile step)

```js
function checkEvent(map, tileX, tileY) {
  const eventId = map.layers.event[tileY * map.width + tileX];
  if (!eventId) return;
  const event = map.events[eventId];
  if (event) triggerEvent(event);
}
```

---

## 11. File Structure

```
src/
  maps/
    nazareth-village.js
    bethlehem-road.js
    jordan-river.js
    jerusalem-temple.js
    ...
  tilesets/
    overworld.js       # grass, path, water, trees — used by outdoor maps
    interior.js        # floors, walls, furniture — used by buildings
    desert.js          # sand, rock, dunes
    temple.js          # marble, pillars, sacred objects
```

Each map's `tileset` field is the filename stem (e.g., `'overworld'` → `src/tilesets/overworld.js`), imported dynamically or bundled at load time.

---

## 12. Map Connectivity & Progression (CRITICAL)

**Every map MUST have at least one working warp exit that allows the player to leave and progress through the game.** This is a hard requirement — a map with no reachable exit is a game-breaking bug.

### Requirements

1. **Every map must have at least one warp event** leading to another map (unless it is an intentionally sealed story moment with a scripted exit trigger).
2. **Warp tiles must be walkable.** The collision layer must have `0` on every tile that contains a warp event ID. A warp placed on a collision-blocked tile is unreachable and therefore broken.
3. **Warp tiles must be reachable.** There must be a clear, unblocked path from the player spawn point to every exit warp. No exit should be walled off by collision tiles, NPCs, or missing event IDs.
4. **Map edges that represent logical exits** (e.g., the south edge of a town leading to a road) should have warp events on the edge tiles. Do not rely on the player "walking off the map" — the collision check already blocks out-of-bounds movement.
5. **After completing a map's objectives** (e.g., finding boy Jesus in the Temple), the game must either (a) automatically warp/transition the player to the next area, or (b) ensure an exit warp is available and clearly indicated so the player knows where to go.
6. **Test every map by walking from spawn to each exit.** If the player cannot reach an exit, the map is broken.

### Common Bugs to Avoid

- Placing warp event IDs in the event layer but forgetting to define them in the `events` table
- Collision layer blocking the doorway/exit tiles
- NPC standing on the exit tile with no way to move them
- Event-triggered map transitions that never fire because the trigger condition is wrong
- Maps where the player spawns inside a walled area with no exit
