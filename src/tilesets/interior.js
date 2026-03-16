/**
 * Interior tileset for temples, houses, and indoor areas.
 * Stone floors, marble, walls, pillars, doors, shelves, carpet, benches.
 */

export const PALETTE = {
  _:   null,
  SF:  '#8C8C8C',   // stone floor base
  SD:  '#7A7A7A',   // stone floor dark
  SL:  '#9E9E9E',   // stone floor light
  MF:  '#D4CFC4',   // marble floor base
  MD:  '#C4BFB4',   // marble floor dark
  ML:  '#E4DFD4',   // marble floor light
  WB:  '#4A4A4A',   // wall base (dark stone)
  WD:  '#3A3A3A',   // wall dark
  WL:  '#5A5A5A',   // wall light/highlight
  PB:  '#B0A890',   // pillar base
  PD:  '#9A9280',   // pillar dark
  PL:  '#C0B8A0',   // pillar light
  DB:  '#8B6914',   // door wood base
  DD:  '#6B4904',   // door wood dark
  DL:  '#AB8934',   // door wood light
  SB:  '#6B4E2E',   // scroll shelf base
  SK:  '#5B3E1E',   // scroll shelf dark
  SC:  '#C8B878',   // scroll/parchment color
  CB:  '#8B1A1A',   // carpet base (red)
  CD:  '#6B0A0A',   // carpet dark
  CL:  '#AB3A3A',   // carpet light
  BB:  '#7A5A3A',   // bench wood base
  BD:  '#6A4A2A',   // bench wood dark
  BL:  '#8A6A4A',   // bench wood light
  // Detail / above accent colors
  FP:  '#C0A880',   // floor pattern accent (warm tan)
  FD:  '#A09060',   // floor pattern dark
  RB:  '#9A1A1A',   // rug border red
  RC:  '#7A0A0A',   // rug border dark
  RL:  '#BA3A3A',   // rug border light
  RG:  '#C8A020',   // rug gold accent
  AC:  '#B0A890',   // arch stone base (same as pillar base)
  AD:  '#9A9280',   // arch stone dark
  AL:  '#C8C0A8',   // arch stone highlight
};

export const TILES = {
  // --- Tile 1: Stone floor ---
  1: [
    ['SF','SF','SF','SD','SF','SF','SF','SF','SF','SL','SF','SF','SF','SD','SF','SF'],
    ['SF','SL','SF','SF','SF','SF','SD','SF','SF','SF','SF','SF','SL','SF','SF','SD'],
    ['SD','SF','SF','SF','SF','SF','SF','SF','SD','SF','SF','SF','SF','SF','SF','SF'],
    ['SF','SF','SD','SF','SL','SF','SF','SF','SF','SF','SL','SF','SD','SF','SF','SF'],
    ['SF','SF','SF','SF','SF','SF','SF','SD','SF','SF','SF','SF','SF','SF','SD','SF'],
    ['SL','SF','SF','SD','SF','SF','SF','SF','SF','SL','SF','SD','SF','SF','SF','SF'],
    ['SF','SF','SF','SF','SF','SL','SF','SF','SF','SF','SF','SF','SF','SF','SL','SF'],
    ['SF','SD','SF','SF','SF','SF','SF','SF','SL','SF','SD','SF','SF','SF','SF','SF'],
    ['SF','SF','SF','SL','SF','SD','SF','SF','SF','SF','SF','SF','SF','SD','SF','SF'],
    ['SD','SF','SF','SF','SF','SF','SF','SL','SF','SD','SF','SL','SF','SF','SF','SD'],
    ['SF','SF','SL','SF','SF','SF','SF','SF','SF','SF','SF','SF','SF','SF','SF','SF'],
    ['SF','SF','SF','SF','SD','SF','SF','SF','SF','SL','SF','SF','SD','SL','SF','SF'],
    ['SF','SL','SF','SF','SF','SF','SF','SD','SF','SF','SF','SF','SF','SF','SF','SF'],
    ['SF','SF','SF','SD','SF','SF','SF','SF','SF','SF','SF','SD','SF','SF','SL','SF'],
    ['SL','SF','SF','SF','SF','SL','SF','SF','SD','SF','SF','SF','SF','SF','SF','SF'],
    ['SF','SF','SD','SF','SF','SF','SF','SF','SF','SF','SL','SF','SF','SD','SF','SF'],
  ],

  // --- Tile 2: Marble floor ---
  2: [
    ['MF','MF','ML','MF','MF','MD','MF','MF','MF','ML','MF','MF','MD','MF','MF','MF'],
    ['MF','MD','MF','MF','ML','MF','MF','MF','MF','MF','MF','ML','MF','MF','MF','MD'],
    ['MF','MF','MF','MF','MF','MF','MD','MF','ML','MF','MF','MF','MF','MD','MF','MF'],
    ['ML','MF','MF','MD','MF','MF','MF','MF','MF','MF','MD','MF','MF','MF','ML','MF'],
    ['MF','MF','MF','MF','MF','ML','MF','MD','MF','MF','MF','MF','ML','MF','MF','MF'],
    ['MF','ML','MD','MF','MF','MF','MF','MF','MF','ML','MF','MF','MF','MF','MD','MF'],
    ['MF','MF','MF','MF','MD','MF','MF','ML','MF','MF','MF','MD','MF','MF','MF','ML'],
    ['MD','MF','MF','ML','MF','MF','MF','MF','MD','MF','MF','MF','MF','ML','MF','MF'],
    ['MF','MF','MF','MF','MF','MD','MF','MF','MF','MF','ML','MF','MD','MF','MF','MF'],
    ['MF','MD','ML','MF','MF','MF','MF','MF','ML','MD','MF','MF','MF','MF','MF','MD'],
    ['MF','MF','MF','MF','ML','MF','MD','MF','MF','MF','MF','ML','MF','MF','MF','MF'],
    ['ML','MF','MF','MF','MF','MF','MF','MD','MF','MF','MF','MF','MF','MD','ML','MF'],
    ['MF','MF','MD','MF','MF','ML','MF','MF','MF','ML','MF','MF','MF','MF','MF','MF'],
    ['MF','ML','MF','MF','MF','MF','MF','MF','MD','MF','MF','MD','MF','ML','MF','MF'],
    ['MF','MF','MF','MD','MF','MF','ML','MF','MF','MF','MF','MF','MF','MF','MD','MF'],
    ['MD','MF','MF','MF','MF','MD','MF','MF','ML','MF','MD','MF','ML','MF','MF','MF'],
  ],

  // --- Tile 3: Wall (dark stone, blocked) ---
  3: [
    ['WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD'],
    ['WD','WB','WB','WB','WL','WB','WB','WB','WD','WB','WB','WL','WB','WB','WB','WD'],
    ['WD','WB','WL','WB','WB','WB','WB','WB','WD','WB','WB','WB','WB','WL','WB','WD'],
    ['WD','WB','WB','WB','WB','WL','WB','WB','WD','WB','WL','WB','WB','WB','WB','WD'],
    ['WD','WB','WB','WB','WB','WB','WB','WB','WD','WB','WB','WB','WB','WB','WB','WD'],
    ['WD','WL','WB','WB','WB','WB','WB','WL','WD','WB','WB','WB','WL','WB','WB','WD'],
    ['WD','WB','WB','WB','WB','WB','WB','WB','WD','WB','WB','WB','WB','WB','WL','WD'],
    ['WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD'],
    ['WD','WB','WB','WL','WB','WB','WB','WD','WB','WB','WB','WL','WB','WB','WB','WD'],
    ['WD','WB','WB','WB','WB','WB','WB','WD','WB','WL','WB','WB','WB','WB','WB','WD'],
    ['WD','WB','WL','WB','WB','WB','WB','WD','WB','WB','WB','WB','WB','WL','WB','WD'],
    ['WD','WB','WB','WB','WB','WL','WB','WD','WB','WB','WB','WB','WB','WB','WB','WD'],
    ['WD','WB','WB','WB','WB','WB','WB','WD','WB','WB','WL','WB','WB','WB','WB','WD'],
    ['WD','WL','WB','WB','WB','WB','WB','WD','WB','WB','WB','WB','WL','WB','WB','WD'],
    ['WD','WB','WB','WB','WL','WB','WB','WD','WB','WB','WB','WB','WB','WB','WB','WD'],
    ['WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD','WD'],
  ],

  // --- Tile 4: Pillar (column, blocked) ---
  4: [
    ['_','_','_','_','PD','PB','PB','PB','PB','PB','PB','PD','_','_','_','_'],
    ['_','_','_','PD','PB','PL','PL','PL','PL','PL','PB','PD','_','_','_','_'],
    ['_','_','_','PD','PB','PL','PB','PB','PB','PL','PB','PD','_','_','_','_'],
    ['_','_','_','PD','PB','PL','PB','PB','PB','PL','PB','PD','_','_','_','_'],
    ['_','_','_','_','PD','PB','PB','PB','PB','PB','PD','_','_','_','_','_'],
    ['_','_','_','_','PD','PB','PL','PL','PL','PB','PD','_','_','_','_','_'],
    ['_','_','_','_','PD','PB','PL','PL','PL','PB','PD','_','_','_','_','_'],
    ['_','_','_','_','PD','PB','PL','PL','PL','PB','PD','_','_','_','_','_'],
    ['_','_','_','_','PD','PB','PL','PL','PL','PB','PD','_','_','_','_','_'],
    ['_','_','_','_','PD','PB','PL','PL','PL','PB','PD','_','_','_','_','_'],
    ['_','_','_','_','PD','PB','PL','PL','PL','PB','PD','_','_','_','_','_'],
    ['_','_','_','_','PD','PB','PB','PB','PB','PB','PD','_','_','_','_','_'],
    ['_','_','_','PD','PB','PL','PL','PL','PL','PL','PB','PD','_','_','_','_'],
    ['_','_','_','PD','PB','PL','PB','PB','PB','PL','PB','PD','_','_','_','_'],
    ['_','_','PD','PB','PB','PB','PB','PB','PB','PB','PB','PB','PD','_','_','_'],
    ['_','_','PD','PD','PD','PD','PD','PD','PD','PD','PD','PD','PD','_','_','_'],
  ],

  // --- Tile 5: Wooden door ---
  5: [
    ['DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD'],
    ['DD','DB','DB','DL','DB','DB','DB','DD','DD','DB','DB','DB','DL','DB','DB','DD'],
    ['DD','DB','DB','DB','DB','DB','DB','DD','DD','DB','DB','DB','DB','DB','DB','DD'],
    ['DD','DB','DL','DB','DB','DB','DB','DD','DD','DB','DB','DL','DB','DB','DB','DD'],
    ['DD','DB','DB','DB','DB','DL','DB','DD','DD','DB','DB','DB','DB','DB','DL','DD'],
    ['DD','DB','DB','DB','DB','DB','DB','DD','DD','DL','DB','DB','DB','DB','DB','DD'],
    ['DD','DB','DB','DL','DB','DB','DB','DD','DD','DB','DB','DB','DL','DB','DB','DD'],
    ['DD','DB','DB','DB','DB','DB','DB','DD','DD','DB','DB','DB','DB','DB','DB','DD'],
    ['DD','DB','DB','DB','DL','DB','DB','DD','DD','DB','DL','DB','DB','DB','DB','DD'],
    ['DD','DL','DB','DB','DB','DB','DB','DD','DD','DB','DB','DB','DB','DL','DB','DD'],
    ['DD','DB','DB','DB','DB','DB','DL','DD','DD','DB','DB','DB','DB','DB','DB','DD'],
    ['DD','DB','DL','DB','DB','DB','DB','DD','DD','DL','DB','DB','DB','DB','DB','DD'],
    ['DD','DB','DB','DB','DB','DL','DB','DD','DD','DB','DB','DL','DB','DB','DB','DD'],
    ['DD','DB','DB','DB','DB','DB','DB','DD','DD','DB','DB','DB','DB','DB','DL','DD'],
    ['DD','DL','DB','DB','DB','DB','DB','DD','DD','DB','DB','DB','DB','DB','DB','DD'],
    ['DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD'],
  ],

  // --- Tile 6: Scroll shelf (bookshelf with scrolls, blocked) ---
  6: [
    ['SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK'],
    ['SK','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SK'],
    ['SK','SB','SC','SC','SB','SC','SC','SC','SB','SC','SC','SB','SC','SC','SB','SK'],
    ['SK','SB','SC','SC','SB','SC','SC','SC','SB','SC','SC','SB','SC','SC','SB','SK'],
    ['SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK'],
    ['SK','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SK'],
    ['SK','SB','SC','SC','SC','SB','SC','SC','SB','SC','SC','SC','SB','SC','SB','SK'],
    ['SK','SB','SC','SC','SC','SB','SC','SC','SB','SC','SC','SC','SB','SC','SB','SK'],
    ['SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK'],
    ['SK','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SK'],
    ['SK','SB','SC','SB','SC','SC','SB','SC','SC','SC','SB','SC','SC','SB','SB','SK'],
    ['SK','SB','SC','SB','SC','SC','SB','SC','SC','SC','SB','SC','SC','SB','SB','SK'],
    ['SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK'],
    ['SK','SB','SC','SC','SC','SB','SC','SB','SC','SC','SB','SC','SC','SC','SB','SK'],
    ['SK','SB','SC','SC','SC','SB','SC','SB','SC','SC','SB','SC','SC','SC','SB','SK'],
    ['SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK','SK'],
  ],

  // --- Tile 7: Red carpet/rug ---
  7: [
    ['CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD'],
    ['CD','CB','CB','CB','CL','CB','CB','CB','CB','CB','CL','CB','CB','CB','CB','CD'],
    ['CD','CB','CL','CB','CB','CB','CB','CB','CB','CB','CB','CB','CL','CB','CB','CD'],
    ['CD','CB','CB','CB','CB','CB','CL','CB','CB','CL','CB','CB','CB','CB','CB','CD'],
    ['CD','CL','CB','CB','CB','CB','CB','CB','CB','CB','CB','CB','CB','CL','CB','CD'],
    ['CD','CB','CB','CB','CL','CB','CB','CB','CB','CB','CL','CB','CB','CB','CB','CD'],
    ['CD','CB','CB','CB','CB','CB','CB','CL','CL','CB','CB','CB','CB','CB','CB','CD'],
    ['CD','CB','CL','CB','CB','CB','CL','CB','CB','CL','CB','CB','CL','CB','CB','CD'],
    ['CD','CB','CB','CB','CB','CB','CB','CL','CL','CB','CB','CB','CB','CB','CB','CD'],
    ['CD','CB','CB','CL','CB','CB','CB','CB','CB','CB','CB','CL','CB','CB','CB','CD'],
    ['CD','CL','CB','CB','CB','CB','CB','CB','CB','CB','CB','CB','CB','CL','CB','CD'],
    ['CD','CB','CB','CB','CB','CL','CB','CB','CB','CL','CB','CB','CB','CB','CB','CD'],
    ['CD','CB','CL','CB','CB','CB','CB','CB','CB','CB','CB','CB','CL','CB','CB','CD'],
    ['CD','CB','CB','CB','CB','CB','CL','CB','CB','CL','CB','CB','CB','CB','CB','CD'],
    ['CD','CB','CB','CL','CB','CB','CB','CB','CB','CB','CB','CL','CB','CB','CB','CD'],
    ['CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD','CD'],
  ],

  // --- Tile 8: Wooden bench (blocked) ---
  8: [
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','_'],
    ['_','BD','BB','BB','BL','BB','BB','BB','BB','BB','BL','BB','BB','BB','BD','_'],
    ['_','BD','BB','BL','BB','BB','BB','BL','BB','BB','BB','BB','BL','BB','BD','_'],
    ['_','BD','BB','BB','BB','BL','BB','BB','BB','BL','BB','BB','BB','BB','BD','_'],
    ['_','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','BD','_'],
    ['_','_','BD','_','_','_','_','_','_','_','_','_','_','BD','_','_'],
    ['_','_','BD','_','_','_','_','_','_','_','_','_','_','BD','_','_'],
    ['_','_','BD','_','_','_','_','_','_','_','_','_','_','BD','_','_'],
    ['_','_','BD','_','_','_','_','_','_','_','_','_','_','BD','_','_'],
    ['_','BD','BD','BD','_','_','_','_','_','_','_','_','BD','BD','BD','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // =========================================================
  // DETAIL TILES (100-199) — transparent overlays rendered
  // above the ground layer, below player sprites.
  // =========================================================

  // --- Tile 100: Floor pattern (diamond inlay accent on stone/marble) ---
  100: [
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','FP','FP','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','FP','FD','FD','FP','_','_','_','_','_','_'],
    ['_','_','_','_','_','FP','FD','FP','FP','FD','FP','_','_','_','_','_'],
    ['_','_','_','_','FP','FD','FP','_','_','FP','FD','FP','_','_','_','_'],
    ['_','_','_','FP','FD','FP','_','_','_','_','FP','FD','FP','_','_','_'],
    ['_','_','_','_','FP','FD','FP','_','_','FP','FD','FP','_','_','_','_'],
    ['_','_','_','_','_','FP','FD','FP','FP','FD','FP','_','_','_','_','_'],
    ['_','_','_','_','_','_','FP','FD','FD','FP','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','FP','FP','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // --- Tile 101: Rug detail (decorative border stripe on carpet) ---
  101: [
    ['RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC'],
    ['RC','RB','RG','RB','RG','RB','RG','RB','RB','RG','RB','RG','RB','RG','RB','RC'],
    ['RC','RG','RL','RG','RL','RG','RL','RG','RG','RL','RG','RL','RG','RL','RG','RC'],
    ['RC','RB','RG','RB','RG','RB','RG','RB','RB','RG','RB','RG','RB','RG','RB','RC'],
    ['RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC'],
    ['RC','RB','RG','RB','RG','RB','RG','RB','RB','RG','RB','RG','RB','RG','RB','RC'],
    ['RC','RG','RL','RG','RL','RG','RL','RG','RG','RL','RG','RL','RG','RL','RG','RC'],
    ['RC','RB','RG','RB','RG','RB','RG','RB','RB','RG','RB','RG','RB','RG','RB','RC'],
    ['RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC','RC'],
  ],

  // =========================================================
  // ABOVE TILES (200-299) — transparent overlays rendered
  // after entities (pillar tops, arch overhangs, etc.).
  // =========================================================

  // --- Tile 200: Pillar top (capital of a column, overhanging the player) ---
  200: [
    ['_','_','AD','AC','AC','AC','AC','AC','AC','AC','AC','AC','AD','_','_','_'],
    ['_','AD','AC','AL','AL','AL','AL','AL','AL','AL','AC','AC','AC','AD','_','_'],
    ['AD','AC','AL','AL','AC','AC','AC','AC','AC','AL','AL','AC','AC','AC','AD','_'],
    ['AC','AL','AL','AC','AD','_','_','_','_','AD','AC','AL','AL','AC','AC','_'],
    ['AC','AL','AC','AD','_','_','_','_','_','_','AD','AC','AL','AL','AC','_'],
    ['AC','AL','AC','AD','_','_','_','_','_','_','AD','AC','AL','AL','AC','_'],
    ['AC','AL','AL','AC','AD','_','_','_','_','AD','AC','AL','AL','AC','AC','_'],
    ['AD','AC','AL','AL','AC','AC','AC','AC','AC','AL','AL','AC','AC','AC','AD','_'],
    ['_','AD','AC','AL','AL','AL','AL','AL','AL','AL','AC','AC','AC','AD','_','_'],
    ['_','_','AD','AC','AC','AC','AC','AC','AC','AC','AC','AC','AD','_','_','_'],
    ['_','_','_','AD','AD','AD','AD','AD','AD','AD','AD','AD','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // --- Tile 201: Arch (stone arch spanning overhead) ---
  201: [
    ['AD','AC','AC','AC','AC','AC','AC','AC','AC','AC','AC','AC','AC','AC','AC','AD'],
    ['AD','AL','AL','AL','AL','AL','AL','AL','AL','AL','AL','AL','AL','AL','AL','AD'],
    ['AD','AC','AL','AC','AC','AC','AC','AC','AC','AC','AC','AC','AL','AC','AC','AD'],
    ['AD','AC','AD','_','_','_','_','_','_','_','_','_','AD','AC','AC','AD'],
    ['AD','AC','AD','_','_','_','_','_','_','_','_','_','AD','AC','AC','AD'],
    ['AD','AC','AD','_','_','_','_','_','_','_','_','_','AD','AC','AC','AD'],
    ['AD','AC','AL','AC','AC','_','_','_','_','_','AC','AC','AL','AC','AC','AD'],
    ['AD','AC','AC','AL','AC','AC','_','_','_','AC','AC','AL','AC','AC','AC','AD'],
    ['_','AD','AC','AC','AL','AC','AC','AC','AC','AC','AL','AC','AC','AD','_','_'],
    ['_','_','AD','AC','AC','AL','AL','AL','AL','AL','AC','AC','AD','_','_','_'],
    ['_','_','_','AD','AC','AC','AC','AC','AC','AC','AC','AD','_','_','_','_'],
    ['_','_','_','_','AD','AD','AD','AD','AD','AD','AD','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],
};
