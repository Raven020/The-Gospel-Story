/**
 * Overworld tileset per specs/tilemap-format.md §9.
 * Grass, stone path, water, sand, wall tiles for outdoor maps.
 */

export const PALETTE = {
  _:   null,
  G1:  '#5A8A3C',   // grass base
  G2:  '#4A7A2C',   // grass shadow
  G3:  '#6A9A4C',   // grass highlight
  SD:  '#C8A96E',   // sand/dirt base
  SS:  '#B8996E',   // sand shadow
  SL:  '#D8B97E',   // sand highlight
  ST:  '#8C7A5A',   // stone base
  SK:  '#7A6A4A',   // stone shadow
  SH:  '#9C8A6A',   // stone highlight
  WA:  '#3A7AAA',   // water base
  WD:  '#2A6A9A',   // water deep
  WH:  '#6AAACC',   // water highlight
  WL:  '#4A6A3C',   // wall base (dark stone)
  WK:  '#3A5A2C',   // wall shadow
  WG:  '#5A7A4C',   // wall highlight
  FB:  '#6A5A3C',   // fence/wood brown
  FD:  '#5A4A2C',   // fence dark
  // Detail / above accent colors
  FP:  '#E84040',   // flower petal red
  FY:  '#E8C840',   // flower petal yellow
  FC:  '#B040B0',   // flower petal purple
  FG:  '#3A6A20',   // flower stem green
  RK:  '#6A6060',   // rock grey base
  RL:  '#8A8070',   // rock grey light
  RD:  '#504848',   // rock grey dark
  TC:  '#2A5A18',   // tree canopy dark
  TM:  '#3A7A28',   // tree canopy mid
  TL:  '#4A8A38',   // tree canopy light
  TT:  '#1A3A10',   // tree canopy very dark (shadow)
  TG:  '#5A6A30',   // tall grass top dark
  TH:  '#7A8A40',   // tall grass top light
};

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

  // --- Tile 4: Sand/dirt ---
  4: [
    ['SD','SD','SD','SS','SD','SD','SL','SD','SD','SD','SS','SD','SD','SD','SD','SL'],
    ['SD','SL','SD','SD','SD','SD','SD','SD','SS','SD','SD','SD','SL','SD','SD','SD'],
    ['SD','SD','SD','SD','SD','SS','SD','SD','SD','SD','SD','SD','SD','SD','SS','SD'],
    ['SS','SD','SD','SL','SD','SD','SD','SD','SD','SL','SD','SD','SD','SD','SD','SD'],
    ['SD','SD','SD','SD','SD','SD','SD','SS','SD','SD','SD','SS','SD','SL','SD','SD'],
    ['SD','SD','SS','SD','SD','SL','SD','SD','SD','SD','SD','SD','SD','SD','SD','SS'],
    ['SL','SD','SD','SD','SD','SD','SD','SD','SL','SD','SD','SD','SS','SD','SD','SD'],
    ['SD','SD','SD','SS','SD','SD','SD','SD','SD','SD','SD','SD','SD','SD','SL','SD'],
    ['SD','SS','SD','SD','SD','SD','SL','SD','SD','SS','SD','SL','SD','SD','SD','SD'],
    ['SD','SD','SD','SD','SL','SD','SD','SD','SD','SD','SD','SD','SD','SS','SD','SD'],
    ['SD','SD','SL','SD','SD','SD','SD','SS','SD','SD','SD','SD','SD','SD','SD','SL'],
    ['SS','SD','SD','SD','SD','SD','SD','SD','SD','SL','SD','SS','SD','SD','SD','SD'],
    ['SD','SD','SD','SD','SS','SD','SL','SD','SD','SD','SD','SD','SD','SL','SD','SD'],
    ['SD','SL','SD','SD','SD','SD','SD','SD','SS','SD','SD','SD','SD','SD','SD','SS'],
    ['SD','SD','SD','SL','SD','SS','SD','SD','SD','SD','SL','SD','SS','SD','SD','SD'],
    ['SD','SD','SS','SD','SD','SD','SD','SL','SD','SD','SD','SD','SD','SD','SD','SD'],
  ],

  // --- Tile 5: Wall (stone block — used for boundaries) ---
  5: [
    ['WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK'],
    ['WK','WL','WL','WL','WG','WL','WL','WL','WK','WL','WL','WG','WL','WL','WL','WK'],
    ['WK','WL','WG','WL','WL','WL','WL','WL','WK','WL','WL','WL','WL','WG','WL','WK'],
    ['WK','WL','WL','WL','WL','WG','WL','WL','WK','WL','WG','WL','WL','WL','WL','WK'],
    ['WK','WL','WL','WL','WL','WL','WL','WL','WK','WL','WL','WL','WL','WL','WL','WK'],
    ['WK','WG','WL','WL','WL','WL','WL','WG','WK','WL','WL','WL','WG','WL','WL','WK'],
    ['WK','WL','WL','WL','WL','WL','WL','WL','WK','WL','WL','WL','WL','WL','WG','WK'],
    ['WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK'],
    ['WK','WL','WL','WG','WL','WL','WL','WK','WL','WL','WL','WG','WL','WL','WL','WK'],
    ['WK','WL','WL','WL','WL','WL','WL','WK','WL','WG','WL','WL','WL','WL','WL','WK'],
    ['WK','WL','WG','WL','WL','WL','WL','WK','WL','WL','WL','WL','WL','WG','WL','WK'],
    ['WK','WL','WL','WL','WL','WG','WL','WK','WL','WL','WL','WL','WL','WL','WL','WK'],
    ['WK','WL','WL','WL','WL','WL','WL','WK','WL','WL','WG','WL','WL','WL','WL','WK'],
    ['WK','WG','WL','WL','WL','WL','WL','WK','WL','WL','WL','WL','WG','WL','WL','WK'],
    ['WK','WL','WL','WL','WG','WL','WL','WK','WL','WL','WL','WL','WL','WL','WL','WK'],
    ['WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK','WK'],
  ],

  // =========================================================
  // DETAIL TILES (100-199) — transparent overlays rendered
  // above the ground layer, below player sprites.
  // =========================================================

  // --- Tile 100: Flowers (scattered wildflowers) ---
  100: [
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','FG','_','_','_','_','_','FG','_','_','_','_','_','_'],
    ['_','_','FP','FG','FP','_','_','_','FY','FG','FY','_','_','_','_','_'],
    ['_','_','_','FG','_','_','_','_','_','FG','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','FG','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','FC','FG','FC','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','FG','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','FG','_','_','_','_','_','_','_','_','_','_','FG','_','_'],
    ['FY','FG','FY','_','_','_','_','_','_','_','FP','FG','FP','FG','FP','_'],
    ['_','FG','_','_','_','_','_','_','_','_','_','FG','_','FG','_','_'],
    ['_','_','_','_','_','_','FG','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','FP','FG','FC','FG','FP','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','FG','_','FG','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // --- Tile 101: Path marks (worn dirt crossing marks on stone) ---
  101: [
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','SS','SS','_','_','_','_','_','_','_','_','_','SS','SS','_','_'],
    ['_','SS','_','_','_','_','_','_','_','_','_','_','_','SS','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','SD','SD','SD','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','SD','_','SD','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','SD','SD','_','_','_','_','SS','SS','_','_','_','_','_'],
    ['_','_','_','SD','_','_','_','_','_','SS','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','SS','SS','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','SS','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // --- Tile 102: Rocks (small stones on the ground) ---
  102: [
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','RD','RK','RL','RD','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','RK','RL','RK','RD','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','RD','RD','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','RD','RK','RL','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','RK','RK','RD','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','RD','RK','_','_','_','_','_','_','_','_','RD','RK','RL','_','_'],
    ['_','RK','RL','RD','_','_','_','_','_','_','_','RK','RL','RD','_','_'],
    ['_','_','RD','_','_','_','_','_','_','_','_','_','RD','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // =========================================================
  // ABOVE TILES (200-299) — transparent overlays rendered
  // after entities (tree canopies, roof edges, etc.).
  // =========================================================

  // --- Tile 200: Tree canopy (round leafy treetop) ---
  200: [
    ['_','_','_','TT','TC','TM','TM','TM','TM','TM','TC','TT','_','_','_','_'],
    ['_','_','TT','TC','TM','TL','TL','TL','TL','TM','TM','TC','TT','_','_','_'],
    ['_','TT','TC','TM','TL','TL','TM','TM','TL','TL','TL','TM','TC','TT','_','_'],
    ['_','TC','TM','TL','TL','TM','TC','TC','TM','TL','TL','TM','TM','TC','_','_'],
    ['TT','TC','TM','TL','TM','TC','TT','TT','TC','TM','TL','TL','TM','TC','TT','_'],
    ['TC','TM','TL','TL','TC','TT','_','_','TT','TC','TL','TL','TM','TM','TC','_'],
    ['TC','TM','TL','TM','TT','_','_','_','_','TT','TM','TL','TM','TM','TC','_'],
    ['TC','TM','TL','TM','TT','_','_','_','_','TT','TM','TL','TL','TM','TC','_'],
    ['TC','TM','TL','TL','TC','TT','_','_','TT','TC','TL','TL','TM','TM','TC','_'],
    ['TT','TC','TM','TL','TM','TC','TT','TT','TC','TM','TL','TL','TM','TC','TT','_'],
    ['_','TC','TM','TL','TL','TM','TC','TC','TM','TL','TL','TM','TM','TC','_','_'],
    ['_','TT','TC','TM','TL','TL','TM','TM','TL','TL','TL','TM','TC','TT','_','_'],
    ['_','_','TT','TC','TM','TL','TL','TL','TL','TM','TM','TC','TT','_','_','_'],
    ['_','_','_','TT','TC','TM','TM','TM','TM','TM','TC','TT','_','_','_','_'],
    ['_','_','_','_','TT','TC','TC','TC','TC','TC','TT','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // --- Tile 201: Tall grass top (upper half of tall grass, above player) ---
  201: [
    ['_','TG','_','_','TG','_','_','_','TH','_','_','TG','_','_','_','TH'],
    ['TG','TH','TG','_','TH','TG','_','TG','TH','TG','TG','TH','TG','_','TG','TH'],
    ['TG','TH','TG','TG','TH','TG','TG','TH','TG','TH','TG','TH','TG','TG','TH','TG'],
    ['TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TH','TG','TG','TH','TG','TG'],
    ['TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH'],
    ['TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG'],
    ['TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG'],
    ['_','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH'],
    ['_','_','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG'],
    ['_','_','_','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG'],
    ['_','_','_','_','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG','TH'],
    ['_','_','_','_','_','TG','TG','TH','TG','TG','TH','TG','TG','TH','TG','TG'],
    ['_','_','_','_','_','_','_','TG','TG','TH','TG','TG','TH','TG','TG','TH'],
    ['_','_','_','_','_','_','_','_','_','TG','TG','TH','TG','TG','TH','TG'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],
};
