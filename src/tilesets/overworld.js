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
};
