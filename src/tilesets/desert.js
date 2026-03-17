/**
 * Desert/wilderness tileset for Arc 2 - "Baptism & Temptation."
 * Sand, rock, dunes, cacti, cliffs, oasis water, dry grass, cave floor.
 */

export const PALETTE = {
  _:   null,
  SB:  '#D4B86A',   // sand base
  SD:  '#C4A85A',   // sand dark/shadow
  SL:  '#E4C87A',   // sand light/highlight
  RB:  '#8A7A6A',   // rock base
  RD:  '#7A6A5A',   // rock dark
  RL:  '#9A8A7A',   // rock light
  DB:  '#C8A850',   // dune base
  DD:  '#B89840',   // dune shadow
  DL:  '#D8B860',   // dune highlight
  CB:  '#4A6A2A',   // cactus green base
  CD:  '#3A5A1A',   // cactus dark
  CL:  '#5A7A3A',   // cactus light
  CF:  '#6A5A4A',   // cliff face base
  CK:  '#5A4A3A',   // cliff dark
  CH:  '#7A6A5A',   // cliff highlight
  OB:  '#3A8AAA',   // oasis water base
  OD:  '#2A7A9A',   // oasis water dark
  OH:  '#5AAACC',   // oasis water highlight
  GB:  '#9A8A4A',   // dry grass base
  GD:  '#8A7A3A',   // dry grass dark
  GL:  '#AA9A5A',   // dry grass light
  FB:  '#5A5050',   // cave floor base
  FD:  '#4A4040',   // cave floor dark
  FL:  '#6A6060',   // cave floor light
  // Detail / above accent colors
  SR:  '#9A8870',   // scattered rock base
  SK:  '#8A7860',   // scattered rock dark
  SX:  '#AAA080',   // scattered rock highlight
  WV:  '#D0B060',   // sand ripple warm
  WK:  '#C0A050',   // sand ripple dark
  WL:  '#E0C070',   // sand ripple light
  RH:  '#7A6A5A',   // rock overhang base
  OK:  '#6A5A4A',   // rock overhang dark
  OL:  '#8A7A6A',   // rock overhang light
};

export const TILES = {
  // --- Tile 1: Sand (sandy ground) ---
  1: [
    ['SB','SB','SB','SD','SB','SB','SL','SB','SB','SB','SD','SB','SB','SB','SB','SL'],
    ['SB','SL','SB','SB','SB','SB','SB','SB','SD','SB','SB','SB','SL','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SD','SB','SB','SB','SB','SB','SB','SB','SB','SD','SB'],
    ['SD','SB','SB','SL','SB','SB','SB','SB','SB','SL','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','SB','SD','SB','SB','SB','SD','SB','SL','SB','SB'],
    ['SB','SB','SD','SB','SB','SL','SB','SB','SB','SB','SB','SB','SB','SB','SB','SD'],
    ['SL','SB','SB','SB','SB','SB','SB','SB','SL','SB','SB','SB','SD','SB','SB','SB'],
    ['SB','SB','SB','SD','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SL','SB'],
    ['SB','SD','SB','SB','SB','SB','SL','SB','SB','SD','SB','SL','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SL','SB','SB','SB','SB','SB','SB','SB','SB','SD','SB','SB'],
    ['SB','SB','SL','SB','SB','SB','SB','SD','SB','SB','SB','SB','SB','SB','SB','SL'],
    ['SD','SB','SB','SB','SB','SB','SB','SB','SB','SL','SB','SD','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SD','SB','SL','SB','SB','SB','SB','SB','SB','SL','SB','SB'],
    ['SB','SL','SB','SB','SB','SB','SB','SB','SD','SB','SB','SB','SB','SB','SB','SD'],
    ['SB','SB','SB','SL','SB','SD','SB','SB','SB','SB','SL','SB','SD','SB','SB','SB'],
    ['SB','SB','SD','SB','SB','SB','SB','SL','SB','SB','SB','SB','SB','SB','SB','SB'],
  ],

  // --- Tile 2: Rock (rocky ground) ---
  2: [
    ['RB','RB','RL','RB','RD','RB','RB','RB','RB','RL','RB','RB','RB','RD','RB','RB'],
    ['RB','RL','RB','RB','RB','RB','RD','RB','RB','RB','RB','RB','RL','RB','RB','RD'],
    ['RD','RB','RB','RB','RB','RB','RB','RB','RD','RB','RB','RB','RB','RB','RB','RB'],
    ['RB','RB','RD','RB','RL','RB','RB','RB','RB','RB','RL','RB','RD','RB','RB','RB'],
    ['RB','RB','RB','RB','RB','RB','RB','RD','RB','RB','RB','RB','RB','RB','RD','RB'],
    ['RL','RB','RB','RD','RB','RB','RB','RB','RB','RL','RB','RD','RB','RB','RB','RB'],
    ['RB','RB','RB','RB','RB','RL','RB','RB','RB','RB','RB','RB','RB','RB','RL','RB'],
    ['RB','RD','RB','RB','RB','RB','RB','RB','RL','RB','RD','RB','RB','RB','RB','RB'],
    ['RB','RB','RB','RL','RB','RD','RB','RB','RB','RB','RB','RB','RB','RD','RB','RB'],
    ['RD','RB','RB','RB','RB','RB','RB','RL','RB','RD','RB','RL','RB','RB','RB','RD'],
    ['RB','RB','RL','RB','RB','RB','RB','RB','RB','RB','RB','RB','RB','RB','RB','RB'],
    ['RB','RB','RB','RB','RD','RB','RB','RB','RB','RL','RB','RB','RD','RL','RB','RB'],
    ['RB','RL','RB','RB','RB','RB','RB','RD','RB','RB','RB','RB','RB','RB','RB','RB'],
    ['RB','RB','RB','RD','RB','RB','RB','RB','RB','RB','RB','RD','RB','RB','RL','RB'],
    ['RL','RB','RB','RB','RB','RL','RB','RB','RD','RB','RB','RB','RB','RB','RB','RB'],
    ['RB','RB','RD','RB','RB','RB','RB','RB','RB','RB','RL','RB','RB','RD','RB','RB'],
  ],

  // --- Tile 3: Sand dune (blocked) ---
  3: [
    ['SB','SB','SB','SB','SB','SB','DB','DB','DB','DB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','DB','DB','DB','DL','DL','DB','DB','DB','SB','SB','SB','SB'],
    ['SB','SB','SB','DB','DB','DL','DL','DL','DL','DL','DL','DB','DB','SB','SB','SB'],
    ['SB','SB','DB','DB','DL','DL','DL','DL','DL','DL','DL','DL','DB','DB','SB','SB'],
    ['SB','DB','DB','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DB','DB','SB'],
    ['DB','DB','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DB','DB'],
    ['DB','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DB'],
    ['DB','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DB'],
    ['DB','DB','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DB','DB'],
    ['DD','DB','DB','DL','DL','DL','DL','DL','DL','DL','DL','DL','DL','DB','DB','DD'],
    ['DD','DD','DB','DB','DL','DL','DL','DL','DL','DL','DL','DL','DB','DB','DD','DD'],
    ['DD','DD','DD','DB','DB','DL','DL','DL','DL','DL','DL','DB','DB','DD','DD','DD'],
    ['DD','DD','DD','DD','DB','DB','DB','DL','DL','DB','DB','DB','DD','DD','DD','DD'],
    ['DD','DD','DD','DD','DD','DB','DB','DB','DB','DB','DB','DD','DD','DD','DD','DD'],
    ['DD','DD','DD','DD','DD','DD','DB','DB','DB','DB','DD','DD','DD','DD','DD','DD'],
    ['DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD','DD'],
  ],

  // --- Tile 4: Cactus (sparse desert plant, blocked) ---
  4: [
    ['SB','SB','SB','SB','SB','SB','SB','CB','CB','SB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','SB','CB','CB','SB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','CB','CB','CB','CB','CB','CB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','CB','CL','CB','CB','CB','CL','CB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','CB','CB','CB','CB','CB','CB','CB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','CB','SB','CB','SB','CB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','CB','SB','CB','SB','CB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','CB','SB','CB','SB','CB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','SB','CB','SB','SB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','SB','CB','SB','SB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','SB','CB','SB','SB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','SB','CB','SB','SB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','CD','CB','CD','SB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','CD','CD','CD','SB','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SD','CD','CD','CD','SD','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SD','SD','SD','SD','SD','SB','SB','SB','SB','SB','SB'],
  ],

  // --- Tile 5: Cliff wall (blocked) ---
  5: [
    ['CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK'],
    ['CK','CF','CF','CF','CH','CF','CF','CF','CK','CF','CF','CH','CF','CF','CF','CK'],
    ['CK','CF','CH','CF','CF','CF','CF','CF','CK','CF','CF','CF','CF','CH','CF','CK'],
    ['CK','CF','CF','CF','CF','CH','CF','CF','CK','CF','CH','CF','CF','CF','CF','CK'],
    ['CK','CF','CF','CF','CF','CF','CF','CF','CK','CF','CF','CF','CF','CF','CF','CK'],
    ['CK','CH','CF','CF','CF','CF','CF','CH','CK','CF','CF','CF','CH','CF','CF','CK'],
    ['CK','CF','CF','CF','CF','CF','CF','CF','CK','CF','CF','CF','CF','CF','CH','CK'],
    ['CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK'],
    ['CK','CF','CF','CH','CF','CF','CF','CK','CF','CF','CF','CH','CF','CF','CF','CK'],
    ['CK','CF','CF','CF','CF','CF','CF','CK','CF','CH','CF','CF','CF','CF','CF','CK'],
    ['CK','CF','CH','CF','CF','CF','CF','CK','CF','CF','CF','CF','CF','CH','CF','CK'],
    ['CK','CF','CF','CF','CF','CH','CF','CK','CF','CF','CF','CF','CF','CF','CF','CK'],
    ['CK','CF','CF','CF','CF','CF','CF','CK','CF','CF','CH','CF','CF','CF','CF','CK'],
    ['CK','CH','CF','CF','CF','CF','CF','CK','CF','CF','CF','CF','CH','CF','CF','CK'],
    ['CK','CF','CF','CF','CH','CF','CF','CK','CF','CF','CF','CF','CF','CF','CF','CK'],
    ['CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK','CK'],
  ],

  // --- Tile 6: Oasis water (small water pool, blocked) ---
  6: [
    ['SB','SB','SB','SB','SB','OB','OB','OB','OB','OB','OB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','OB','OB','OB','OH','OB','OB','OH','OB','OB','OB','SB','SB','SB'],
    ['SB','SB','OB','OB','OH','OB','OB','OB','OB','OB','OB','OH','OB','OB','SB','SB'],
    ['SB','OB','OB','OB','OB','OB','OD','OB','OB','OD','OB','OB','OB','OB','OB','SB'],
    ['SB','OB','OH','OB','OB','OD','OD','OD','OD','OD','OD','OB','OB','OH','OB','SB'],
    ['OB','OB','OB','OB','OD','OD','OD','OD','OD','OD','OD','OD','OB','OB','OB','OB'],
    ['OB','OH','OB','OD','OD','OD','OD','OD','OD','OD','OD','OD','OD','OB','OH','OB'],
    ['OB','OB','OB','OD','OD','OD','OD','OD','OD','OD','OD','OD','OD','OB','OB','OB'],
    ['OB','OH','OB','OD','OD','OD','OD','OD','OD','OD','OD','OD','OD','OB','OH','OB'],
    ['OB','OB','OB','OB','OD','OD','OD','OD','OD','OD','OD','OD','OB','OB','OB','OB'],
    ['SB','OB','OH','OB','OB','OD','OD','OD','OD','OD','OD','OB','OB','OH','OB','SB'],
    ['SB','OB','OB','OB','OB','OB','OD','OB','OB','OD','OB','OB','OB','OB','OB','SB'],
    ['SB','SB','OB','OB','OH','OB','OB','OB','OB','OB','OB','OH','OB','OB','SB','SB'],
    ['SB','SB','SB','OB','OB','OB','OH','OB','OB','OH','OB','OB','OB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','OB','OB','OB','OB','OB','OB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB'],
  ],

  // --- Tile 7: Dry grass (withered grass) ---
  7: [
    ['SB','SB','GB','SB','SB','SB','SB','GB','SB','SB','SB','SB','GB','SB','SB','SB'],
    ['SB','GB','GL','GB','SB','SB','GB','GL','GB','SB','SB','GB','GL','GB','SB','SB'],
    ['SB','SB','GB','SB','SB','SB','SB','GB','SB','SB','SB','SB','GB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','GB','SB','SB','SB','GB','SB','SB','SB','SB','SB','GB'],
    ['SB','SB','SB','SB','GB','GL','GB','SB','GB','GL','GB','SB','SB','SB','GB','GL'],
    ['SB','SB','SB','SB','SB','GB','SB','SB','SB','GB','SB','SB','SB','SB','SB','GB'],
    ['SB','GB','SB','SB','SB','SB','SB','SB','SB','SB','SB','GB','SB','SB','SB','SB'],
    ['GB','GL','GB','SB','SB','SB','GB','SB','SB','SB','GB','GL','GB','SB','SB','SB'],
    ['SB','GB','SB','SB','SB','GB','GL','GB','SB','SB','SB','GB','SB','SB','SB','GB'],
    ['SB','SB','SB','GB','SB','SB','GB','SB','SB','SB','SB','SB','SB','SB','GB','GL'],
    ['SB','SB','GB','GL','GB','SB','SB','SB','SB','GB','SB','SB','SB','SB','SB','GB'],
    ['SB','SB','SB','GB','SB','SB','SB','SB','GB','GL','GB','SB','SB','GB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','GB','SB','SB','GB','SB','SB','GB','GL','GB','SB'],
    ['GB','SB','SB','SB','SB','GB','GL','GB','SB','SB','SB','SB','SB','GB','SB','SB'],
    ['GL','GB','SB','SB','SB','SB','GB','SB','SB','SB','GB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','GB','SB','SB','SB','SB','SB','GB','GL','GB','SB','SB','SB','SB'],
  ],

  // --- Tile 8: Cave floor (dark cave interior) ---
  8: [
    ['FB','FB','FB','FD','FB','FB','FL','FB','FB','FB','FD','FB','FB','FB','FB','FL'],
    ['FB','FL','FB','FB','FB','FB','FB','FB','FD','FB','FB','FB','FL','FB','FB','FB'],
    ['FD','FB','FB','FB','FB','FD','FB','FB','FB','FB','FB','FB','FB','FB','FD','FB'],
    ['FB','FB','FD','FL','FB','FB','FB','FB','FB','FL','FB','FB','FB','FB','FB','FB'],
    ['FB','FB','FB','FB','FB','FB','FB','FD','FB','FB','FB','FD','FB','FL','FB','FB'],
    ['FB','FB','FD','FB','FB','FL','FB','FB','FB','FB','FB','FB','FB','FB','FB','FD'],
    ['FL','FB','FB','FB','FB','FB','FB','FB','FL','FB','FB','FB','FD','FB','FB','FB'],
    ['FB','FB','FB','FD','FB','FB','FB','FB','FB','FB','FB','FB','FB','FB','FL','FB'],
    ['FB','FD','FB','FB','FB','FB','FL','FB','FB','FD','FB','FL','FB','FB','FB','FB'],
    ['FB','FB','FB','FB','FL','FB','FB','FB','FB','FB','FB','FB','FB','FD','FB','FB'],
    ['FB','FB','FL','FB','FB','FB','FB','FD','FB','FB','FB','FB','FB','FB','FB','FL'],
    ['FD','FB','FB','FB','FB','FB','FB','FB','FB','FL','FB','FD','FB','FB','FB','FB'],
    ['FB','FB','FB','FB','FD','FB','FL','FB','FB','FB','FB','FB','FB','FL','FB','FB'],
    ['FB','FL','FB','FB','FB','FB','FB','FB','FD','FB','FB','FB','FB','FB','FB','FD'],
    ['FB','FB','FB','FL','FB','FD','FB','FB','FB','FB','FL','FB','FD','FB','FB','FB'],
    ['FB','FB','FD','FB','FB','FB','FB','FL','FB','FB','FB','FB','FB','FB','FB','FB'],
  ],

  // =========================================================
  // DETAIL TILES (100-199) — transparent overlays rendered
  // above the ground layer, below player sprites.
  // =========================================================

  // --- Tile 100: Scattered rocks (small stones on sand) ---
  100: [
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','SK','SR','SX','SR','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','SR','SX','SR','SK','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','SK','SR','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','SK','SR','SX','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','SR','SK','SR','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','SK','SR','SX','_','_','_','_','_','_','SK','SR','SX','SR','_','_'],
    ['_','SR','SX','SR','SK','_','_','_','_','_','SR','SX','SR','SK','_','_'],
    ['_','_','SK','SR','_','_','_','_','_','_','_','SK','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // --- Tile 101: Sand ripple (wind-formed ripple marks in sand) ---
  101: [
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['WK','WK','WK','WV','WV','WV','WV','WV','WV','WV','WV','WK','WK','WK','WK','WK'],
    ['WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL'],
    ['WK','WV','WV','WV','WV','WV','WV','WV','WV','WV','WV','WV','WK','WK','WK','WK'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['WK','WK','WK','WK','WK','WV','WV','WV','WV','WV','WV','WK','WK','WK','WK','WK'],
    ['WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL','WL'],
    ['WK','WK','WV','WV','WV','WV','WV','WV','WV','WV','WV','WV','WK','WK','WK','WK'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],

  // =========================================================
  // ABOVE TILES (200-299) — transparent overlays rendered
  // after entities (rock overhangs, etc.).
  // =========================================================

  // --- Tile 200: Rock overhang (jutting cliff face overhead) ---
  200: [
    ['OK','RH','RH','RH','RH','OL','RH','RH','RH','RH','OL','RH','RH','OK','_','_'],
    ['OK','RH','OL','RH','RH','RH','RH','RH','RH','RH','RH','RH','OL','OK','_','_'],
    ['OK','OL','RH','RH','OK','RH','RH','RH','RH','RH','OK','RH','RH','OL','OK','_'],
    ['OK','RH','RH','OK','_','_','OK','RH','RH','OK','_','OK','RH','RH','OK','_'],
    ['OK','RH','OK','_','_','_','_','OK','OK','_','_','_','_','OK','RH','OK'],
    ['OK','RH','OK','_','_','_','_','_','_','_','_','_','_','OK','RH','OK'],
    ['OK','OL','OK','_','_','_','_','_','_','_','_','_','_','OK','OL','OK'],
    ['OK','RH','OK','_','_','_','_','_','_','_','_','_','_','OK','RH','OK'],
    ['OK','RH','OK','_','_','_','_','_','_','_','_','_','_','OK','RH','OK'],
    ['OK','RH','RH','OK','_','_','_','_','_','_','_','OK','RH','RH','OK','_'],
    ['OK','RH','RH','RH','OK','RH','RH','RH','RH','RH','OK','RH','RH','OK','_','_'],
    ['OK','RH','OL','RH','RH','RH','RH','RH','RH','RH','RH','RH','OL','OK','_','_'],
    ['OK','OK','RH','RH','OL','RH','RH','RH','RH','OL','RH','RH','OK','OK','_','_'],
    ['_','OK','OK','OK','OK','OK','OK','OK','OK','OK','OK','OK','OK','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ],
};
