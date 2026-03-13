/**
 * Shoreline tileset for Galilee / lakeside maps.
 * Sand, water, docks, boats, and pebbly shore tiles.
 */

export const PALETTE = {
  _:   null,
  SB:  '#E8D5A3',   // sand base
  SS:  '#D8C593',   // sand shadow
  SH:  '#F0DDB3',   // sand highlight
  SW:  '#7AC0E0',   // shallow water base
  SD:  '#5AA0C0',   // shallow water dark
  SL:  '#9AD0F0',   // shallow water light
  DW:  '#2A6A9A',   // deep water base
  DD:  '#1A5A8A',   // deep water dark
  DL:  '#3A7AAA',   // deep water light
  DK:  '#8A6A3C',   // dock wood base
  DR:  '#7A5A2C',   // dock wood dark
  DH:  '#9A7A4C',   // dock wood highlight
  GS:  '#5A8A3C',   // grass shore base
  GD:  '#4A7A2C',   // grass shore dark
  GL:  '#6A9A4C',   // grass shore light
  BT:  '#6A5030',   // boat wood base
  BD:  '#5A4020',   // boat wood dark
  BH:  '#7A6040',   // boat wood highlight
  PP:  '#6A5A3C',   // pier post base
  PD:  '#5A4A2C',   // pier post dark
  PH:  '#7A6A4C',   // pier post highlight
  PB:  '#9A9080',   // pebble base
  PG:  '#8A8070',   // pebble dark
  PL:  '#AAA090',   // pebble light
};

export const TILES = {
  // --- Tile 1: Sand shore ---
  1: [
    ['SB','SB','SB','SS','SB','SB','SH','SB','SB','SB','SS','SB','SB','SB','SB','SH'],
    ['SB','SH','SB','SB','SB','SB','SB','SB','SS','SB','SB','SB','SH','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SS','SB','SB','SB','SB','SB','SB','SB','SB','SS','SB'],
    ['SS','SB','SB','SH','SB','SB','SB','SB','SB','SH','SB','SB','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SB','SB','SB','SS','SB','SB','SB','SS','SB','SH','SB','SB'],
    ['SB','SB','SS','SB','SB','SH','SB','SB','SB','SB','SB','SB','SB','SB','SB','SS'],
    ['SH','SB','SB','SB','SB','SB','SB','SB','SH','SB','SB','SB','SS','SB','SB','SB'],
    ['SB','SB','SB','SS','SB','SB','SB','SB','SB','SB','SB','SB','SB','SB','SH','SB'],
    ['SB','SS','SB','SB','SB','SB','SH','SB','SB','SS','SB','SH','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SH','SB','SB','SB','SB','SB','SB','SB','SB','SS','SB','SB'],
    ['SB','SB','SH','SB','SB','SB','SB','SS','SB','SB','SB','SB','SB','SB','SB','SH'],
    ['SS','SB','SB','SB','SB','SB','SB','SB','SB','SH','SB','SS','SB','SB','SB','SB'],
    ['SB','SB','SB','SB','SS','SB','SH','SB','SB','SB','SB','SB','SB','SH','SB','SB'],
    ['SB','SH','SB','SB','SB','SB','SB','SB','SS','SB','SB','SB','SB','SB','SB','SS'],
    ['SB','SB','SB','SH','SB','SS','SB','SB','SB','SB','SH','SB','SS','SB','SB','SB'],
    ['SB','SB','SS','SB','SB','SB','SB','SH','SB','SB','SB','SB','SB','SB','SB','SB'],
  ],

  // --- Tile 2: Shallow water (blocked) ---
  2: [
    ['SW','SW','SL','SW','SW','SW','SD','SW','SW','SL','SW','SW','SW','SW','SD','SW'],
    ['SW','SW','SW','SW','SL','SW','SW','SW','SW','SW','SW','SD','SW','SW','SW','SW'],
    ['SD','SW','SW','SW','SW','SW','SW','SL','SW','SW','SW','SW','SW','SL','SW','SD'],
    ['SW','SW','SL','SW','SW','SD','SW','SW','SW','SW','SL','SW','SW','SW','SW','SW'],
    ['SW','SW','SW','SW','SW','SW','SW','SW','SD','SW','SW','SW','SW','SW','SL','SW'],
    ['SW','SD','SW','SL','SW','SW','SW','SW','SW','SW','SW','SL','SW','SD','SW','SW'],
    ['SW','SW','SW','SW','SW','SW','SL','SW','SW','SW','SW','SW','SW','SW','SW','SL'],
    ['SL','SW','SW','SW','SD','SW','SW','SW','SL','SW','SD','SW','SW','SW','SW','SW'],
    ['SW','SW','SW','SW','SW','SW','SW','SW','SW','SW','SW','SW','SL','SW','SD','SW'],
    ['SW','SL','SD','SW','SW','SW','SW','SL','SW','SD','SW','SW','SW','SW','SW','SW'],
    ['SW','SW','SW','SW','SW','SW','SW','SW','SW','SW','SW','SL','SW','SW','SW','SD'],
    ['SD','SW','SW','SL','SW','SW','SD','SW','SW','SW','SW','SW','SW','SL','SW','SW'],
    ['SW','SW','SW','SW','SW','SL','SW','SW','SW','SD','SW','SW','SW','SW','SW','SW'],
    ['SW','SL','SW','SW','SD','SW','SW','SW','SW','SW','SW','SW','SL','SW','SD','SW'],
    ['SW','SW','SW','SW','SW','SW','SW','SL','SW','SW','SW','SL','SW','SW','SW','SW'],
    ['SD','SW','SL','SW','SW','SW','SW','SW','SD','SW','SW','SW','SW','SW','SW','SL'],
  ],

  // --- Tile 3: Deep water (blocked) ---
  3: [
    ['DW','DW','DL','DW','DW','DW','DD','DW','DW','DL','DW','DW','DW','DW','DD','DW'],
    ['DW','DW','DW','DW','DL','DW','DW','DW','DW','DW','DW','DD','DW','DW','DW','DW'],
    ['DD','DW','DW','DW','DW','DW','DW','DL','DW','DW','DW','DW','DW','DL','DW','DD'],
    ['DW','DW','DL','DW','DW','DD','DW','DW','DW','DW','DL','DW','DW','DW','DW','DW'],
    ['DW','DW','DW','DW','DW','DW','DW','DW','DD','DW','DW','DW','DW','DW','DL','DW'],
    ['DW','DD','DW','DL','DW','DW','DW','DW','DW','DW','DW','DL','DW','DD','DW','DW'],
    ['DW','DW','DW','DW','DW','DW','DL','DW','DW','DW','DW','DW','DW','DW','DW','DL'],
    ['DL','DW','DW','DW','DD','DW','DW','DW','DL','DW','DD','DW','DW','DW','DW','DW'],
    ['DW','DW','DW','DW','DW','DW','DW','DW','DW','DW','DW','DW','DL','DW','DD','DW'],
    ['DW','DL','DD','DW','DW','DW','DW','DL','DW','DD','DW','DW','DW','DW','DW','DW'],
    ['DW','DW','DW','DW','DW','DW','DW','DW','DW','DW','DW','DL','DW','DW','DW','DD'],
    ['DD','DW','DW','DL','DW','DW','DD','DW','DW','DW','DW','DW','DW','DL','DW','DW'],
    ['DW','DW','DW','DW','DW','DL','DW','DW','DW','DD','DW','DW','DW','DW','DW','DW'],
    ['DW','DL','DW','DW','DD','DW','DW','DW','DW','DW','DW','DW','DL','DW','DD','DW'],
    ['DW','DW','DW','DW','DW','DW','DW','DL','DW','DW','DW','DL','DW','DW','DW','DW'],
    ['DD','DW','DL','DW','DW','DW','DW','DW','DD','DW','DW','DW','DW','DW','DW','DL'],
  ],

  // --- Tile 4: Dock wood planks ---
  4: [
    ['DK','DK','DH','DK','DR','DK','DK','DK','DK','DH','DK','DK','DK','DR','DK','DK'],
    ['DR','DK','DK','DK','DK','DK','DH','DK','DR','DK','DK','DK','DK','DK','DH','DK'],
    ['DK','DK','DK','DH','DK','DK','DK','DK','DK','DK','DK','DH','DK','DK','DK','DR'],
    ['DK','DH','DK','DK','DK','DR','DK','DK','DK','DH','DK','DK','DK','DK','DK','DK'],
    ['DR','DK','DK','DK','DK','DK','DK','DH','DK','DK','DR','DK','DK','DH','DK','DK'],
    ['DK','DK','DH','DK','DK','DK','DK','DK','DK','DK','DK','DK','DR','DK','DK','DK'],
    ['DK','DR','DK','DK','DH','DK','DK','DK','DR','DK','DK','DK','DK','DK','DH','DK'],
    ['DK','DK','DK','DK','DK','DK','DR','DK','DK','DK','DH','DK','DK','DK','DK','DR'],
    ['DH','DK','DK','DR','DK','DK','DK','DK','DK','DK','DK','DK','DH','DK','DK','DK'],
    ['DK','DK','DK','DK','DK','DH','DK','DR','DK','DK','DK','DR','DK','DK','DK','DH'],
    ['DK','DH','DK','DK','DK','DK','DK','DK','DH','DK','DK','DK','DK','DR','DK','DK'],
    ['DR','DK','DK','DK','DH','DK','DK','DK','DK','DR','DK','DK','DK','DK','DK','DK'],
    ['DK','DK','DR','DK','DK','DK','DK','DH','DK','DK','DK','DH','DK','DK','DR','DK'],
    ['DK','DK','DK','DK','DK','DR','DK','DK','DK','DK','DK','DK','DK','DK','DK','DH'],
    ['DH','DK','DK','DK','DK','DK','DK','DK','DR','DK','DH','DK','DK','DK','DK','DK'],
    ['DK','DR','DK','DH','DK','DK','DK','DK','DK','DK','DK','DR','DK','DH','DK','DK'],
  ],

  // --- Tile 5: Grass near water ---
  5: [
    ['GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS'],
    ['GS','GD','GS','GS','GS','GL','GS','GS','GS','GS','GD','GS','GS','GS','GS','GS'],
    ['GS','GS','GS','GL','GS','GS','GS','GS','GS','GD','GS','GS','GS','GL','GS','GS'],
    ['GS','GS','GS','GS','GS','GS','GD','GS','GS','GS','GS','GS','GS','GS','GS','GS'],
    ['GD','GS','GS','GS','GS','GS','GS','GS','GL','GS','GS','GS','GS','GS','GD','GS'],
    ['GS','GS','GL','GS','GS','GS','GS','GS','GS','GS','GS','GL','GS','GS','GS','GS'],
    ['GS','GS','GS','GS','GD','GS','GS','GS','GS','GS','GS','GS','GS','GD','GS','GS'],
    ['GS','GL','GS','GS','GS','GS','GS','GD','GS','GS','GS','GS','GS','GS','GS','GL'],
    ['GS','GS','GS','GS','GS','GS','GS','GS','GS','GL','GS','GS','GD','GS','GS','GS'],
    ['GD','GS','GS','GL','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GL','GS'],
    ['GS','GS','GS','GS','GS','GD','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS'],
    ['GS','GS','GD','GS','GS','GS','GS','GL','GS','GS','GS','GD','GS','GS','GS','GS'],
    ['GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GL','GS','GS'],
    ['GL','GS','GS','GS','GD','GS','GS','GS','GL','GS','GS','GS','GS','GS','GS','GD'],
    ['GS','GS','GS','GS','GS','GS','GS','GS','GS','GS','GD','GS','GS','GS','GS','GS'],
    ['GS','GD','GS','GL','GS','GS','GS','GS','GS','GS','GS','GS','GL','GS','GS','GS'],
  ],

  // --- Tile 6: Fishing boat (blocked) ---
  6: [
    ['_','_','_','_','BD','BD','BD','BD','BD','BD','BD','BD','_','_','_','_'],
    ['_','_','_','BD','BT','BT','BT','BT','BT','BT','BT','BT','BD','_','_','_'],
    ['_','_','BD','BT','BT','BH','BT','BT','BT','BH','BT','BT','BT','BD','_','_'],
    ['_','BD','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BD','_'],
    ['BD','BT','BT','BT','BH','BT','BT','BT','BT','BT','BH','BT','BT','BT','BT','BD'],
    ['BD','BT','BT','BT','BT','BT','BT','BH','BT','BT','BT','BT','BT','BT','BT','BD'],
    ['BD','BT','BH','BT','BT','BT','BT','BT','BT','BT','BT','BT','BH','BT','BT','BD'],
    ['BD','BT','BT','BT','BT','BT','BT','BT','BT','BH','BT','BT','BT','BT','BT','BD'],
    ['BD','BT','BT','BT','BT','BH','BT','BT','BT','BT','BT','BT','BT','BH','BT','BD'],
    ['BD','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BD'],
    ['BD','BT','BH','BT','BT','BT','BT','BT','BH','BT','BT','BT','BT','BT','BT','BD'],
    ['BD','BT','BT','BT','BT','BT','BT','BT','BT','BT','BT','BH','BT','BT','BT','BD'],
    ['_','BD','BT','BT','BH','BT','BT','BT','BT','BT','BT','BT','BT','BT','BD','_'],
    ['_','_','BD','BT','BT','BT','BT','BT','BH','BT','BT','BT','BT','BD','_','_'],
    ['_','_','_','BD','BT','BT','BT','BT','BT','BT','BT','BT','BD','_','_','_'],
    ['_','_','_','_','BD','BD','BD','BD','BD','BD','BD','BD','_','_','_','_'],
  ],

  // --- Tile 7: Dock post (blocked) ---
  7: [
    ['_','_','_','_','_','PD','PP','PP','PP','PD','_','_','_','_','_','_'],
    ['_','_','_','_','PD','PP','PH','PP','PH','PP','PD','_','_','_','_','_'],
    ['_','_','_','PD','PP','PP','PP','PP','PP','PP','PP','PD','_','_','_','_'],
    ['_','_','_','PD','PP','PH','PP','PP','PP','PH','PP','PD','_','_','_','_'],
    ['_','_','_','PD','PP','PP','PP','PH','PP','PP','PP','PD','_','_','_','_'],
    ['_','_','_','PD','PP','PP','PP','PP','PP','PP','PP','PD','_','_','_','_'],
    ['_','_','_','_','PD','PP','PP','PP','PP','PP','PD','_','_','_','_','_'],
    ['_','_','_','_','_','PD','PP','PP','PP','PD','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','PD','PP','PD','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','PD','PP','PD','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','PD','PP','PD','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','PD','PP','PD','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','PD','PP','PD','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','PD','PP','PD','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','PD','PP','PD','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','PD','PP','PD','_','_','_','_','_','_','_'],
  ],

  // --- Tile 8: Pebbly shore ---
  8: [
    ['PB','PB','PG','PB','PB','PL','PB','PB','PG','PB','PB','PB','PL','PB','PB','PG'],
    ['PB','PL','PB','PB','PB','PB','PB','PG','PB','PB','PB','PB','PB','PB','PB','PB'],
    ['PG','PB','PB','PB','PL','PB','PB','PB','PB','PL','PB','PG','PB','PB','PB','PB'],
    ['PB','PB','PB','PG','PB','PB','PB','PB','PB','PB','PB','PB','PB','PL','PB','PG'],
    ['PB','PG','PB','PB','PB','PB','PL','PB','PG','PB','PB','PB','PB','PB','PB','PB'],
    ['PB','PB','PB','PL','PB','PB','PB','PB','PB','PB','PG','PB','PB','PB','PL','PB'],
    ['PL','PB','PB','PB','PB','PG','PB','PB','PB','PB','PB','PB','PG','PB','PB','PB'],
    ['PB','PB','PG','PB','PB','PB','PB','PL','PB','PG','PB','PB','PB','PB','PB','PL'],
    ['PB','PB','PB','PB','PL','PB','PB','PB','PB','PB','PB','PL','PB','PB','PG','PB'],
    ['PG','PB','PB','PB','PB','PB','PG','PB','PB','PB','PB','PB','PB','PL','PB','PB'],
    ['PB','PB','PL','PB','PB','PB','PB','PB','PL','PB','PG','PB','PB','PB','PB','PB'],
    ['PB','PG','PB','PB','PG','PB','PB','PB','PB','PB','PB','PB','PB','PB','PG','PB'],
    ['PB','PB','PB','PL','PB','PB','PB','PG','PB','PL','PB','PB','PL','PB','PB','PB'],
    ['PL','PB','PB','PB','PB','PB','PL','PB','PB','PB','PB','PG','PB','PB','PB','PG'],
    ['PB','PB','PG','PB','PB','PB','PB','PB','PG','PB','PB','PB','PB','PB','PL','PB'],
    ['PB','PB','PB','PB','PL','PG','PB','PB','PB','PB','PL','PB','PG','PB','PB','PB'],
  ],
};
