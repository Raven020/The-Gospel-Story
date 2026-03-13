/**
 * John the Baptist — Overworld Sprite (Front-Facing / Down)
 *
 * Style: GBA-era Pokemon, 16x32 pixels
 * Wild, rugged appearance — lives in the wilderness
 * Camel hair garment (rough brown/tan), leather belt
 * Long wild hair, big untamed beard
 * Weathered skin, intense eyes
 */

export const PALETTE = {
  _: null,
  O: '#2B1B0E',      // outline

  // Skin (slightly more weathered/tan)
  SB: '#C89A60',     // skin base (darker/tanned)
  SS: '#A87A48',     // skin shadow
  SH: '#DEAE72',     // skin highlight
  EY: '#1A1A2E',     // eye

  // Wild hair (dark, unruly)
  H1: '#2A1A0A',     // hair dark
  H2: '#3E2A14',     // hair mid
  H3: '#52381E',     // hair highlight

  // Camel hair garment (rough, coarse texture)
  CB: '#8A7048',     // camel base
  CS: '#6A5434',     // camel shadow
  CH: '#A08858',     // camel highlight

  // Leather belt
  LB: '#4A3018',     // leather base
  LD: '#321E0E',     // leather dark

  // Sandals
  SN: '#6A4A20',     // sandal (rougher than others)
};

export const JOHN_BAPTIST = [
  // === HEAD (big wild hair, bushy beard) ===
  ['_','_','_','_','O','O','O','O','O','O','O','O','_','_','_','_'],
  ['_','_','_','O','H2','H3','H1','H2','H2','H1','H3','H2','O','_','_','_'],
  ['_','_','O','H1','H3','H2','H3','H1','H1','H3','H2','H3','H1','O','_','_'],
  ['_','O','H1','H2','H1','H3','H2','H3','H3','H2','H3','H1','H2','H1','O','_'],
  ['_','O','H1','H2','SH','SH','SB','SB','SB','SB','SH','SH','H2','H1','O','_'],
  ['_','O','H1','H2','SB','EY','SB','SB','SB','SB','EY','SB','H2','H1','O','_'],
  ['_','O','H1','H2','SB','SB','SB','SS','SS','SB','SB','SB','H2','H1','O','_'],
  ['_','O','H1','H2','SB','SB','SS','SB','SB','SS','SB','SB','H2','H1','O','_'],
  ['_','O','H1','H2','H2','H3','SB','SS','SS','SB','H3','H2','H2','H1','O','_'],
  ['_','O','H1','H1','H2','H3','H2','H2','H2','H2','H3','H2','H1','H1','O','_'],
  ['_','O','H1','H1','H2','H3','H2','H3','H3','H2','H3','H2','H1','H1','O','_'],
  ['_','O','H2','H1','H2','H3','H2','H2','H2','H2','H3','H2','H1','H2','O','_'],
  ['_','O','H2','H1','O','SB','O','H2','H2','O','SB','O','H1','H2','O','_'],

  // === BODY (camel hair garment, broad, rugged) ===
  ['O','H2','H1','O','CB','CB','CH','CB','CB','CH','CB','CB','O','H1','H2','O'],
  ['O','H1','H2','O','CS','CB','CB','CB','CB','CB','CB','CS','O','H2','H1','O'],
  ['O','CB','O','O','CS','CB','CH','CB','CB','CH','CB','CS','O','O','CB','O'],
  ['O','CS','O','O','CS','CB','CB','CB','CB','CB','CB','CS','O','O','CS','O'],
  ['O','CB','O','O','LD','LB','LB','LB','LB','LB','LB','LD','O','O','CB','O'],
  ['O','CS','O','O','CS','CB','CB','CB','CB','CB','CB','CS','O','O','CS','O'],
  ['O','SB','O','O','CS','CB','CH','CB','CB','CH','CB','CS','O','O','SB','O'],
  ['O','SB','O','CS','CB','CB','CB','CB','CB','CB','CB','CB','CS','O','SB','O'],
  ['_','O','O','CS','CB','CH','CB','CB','CB','CB','CH','CB','CS','O','O','_'],
  ['_','_','O','CS','CB','CB','CH','CB','CB','CH','CB','CB','CS','O','_','_'],
  ['_','O','CS','CB','CB','CB','CB','CB','CB','CB','CB','CB','CB','CS','O','_'],
  ['_','O','CS','CB','CH','CB','CB','CB','CB','CB','CB','CH','CB','CS','O','_'],
  ['_','O','CS','CB','CB','CB','CH','CB','CB','CH','CB','CB','CB','CS','O','_'],
  ['_','O','O','CS','CB','CB','CB','O','O','CB','CB','CB','CS','O','O','_'],
  ['_','_','O','O','CS','CB','O','_','_','O','CB','CS','O','O','_','_'],

  // === FEET (rough sandals) ===
  ['_','_','_','O','SS','SB','O','_','_','O','SB','SS','O','_','_','_'],
  ['_','_','O','SN','SN','SS','O','_','_','O','SS','SN','SN','O','_','_'],
  ['_','_','O','SN','SN','SN','O','_','_','O','SN','SN','SN','O','_','_'],
  ['_','_','_','O','O','O','_','_','_','_','O','O','O','_','_','_'],
];

export const JOHN_BAPTIST_BACK = [
  // === HEAD (all wild hair from behind, wide silhouette) ===
  ['_','_','_','_','O','O','O','O','O','O','O','O','_','_','_','_'],
  ['_','_','_','O','H1','H2','H1','H1','H1','H1','H2','H1','O','_','_','_'],
  ['_','_','O','H1','H2','H1','H2','H1','H1','H2','H1','H2','H1','O','_','_'],
  ['_','O','H1','H1','H2','H1','H1','H2','H2','H1','H1','H2','H1','H1','O','_'],
  ['_','O','H1','H2','H1','H1','H2','H1','H1','H2','H1','H1','H2','H1','O','_'],
  ['_','O','H1','H1','H2','H1','H1','H1','H1','H1','H1','H2','H1','H1','O','_'],
  ['_','O','H1','H2','H1','H2','H1','H2','H2','H1','H2','H1','H2','H1','O','_'],
  ['_','O','H1','H1','H1','H2','H1','H1','H1','H1','H2','H1','H1','H1','O','_'],
  ['_','O','H1','H2','H1','H1','H2','H1','H1','H2','H1','H1','H2','H1','O','_'],
  ['_','O','H1','H1','H2','H1','H1','H2','H2','H1','H1','H2','H1','H1','O','_'],
  ['_','O','H1','H1','H1','H2','H1','H3','H3','H1','H2','H1','H1','H1','O','_'],
  ['_','O','H2','H1','H1','H1','H2','H1','H1','H2','H1','H1','H1','H2','O','_'],
  ['_','O','H2','H1','H1','H2','H1','H1','H1','H1','H2','H1','H1','H2','O','_'],
  // === BODY (camel garment from behind, more shadow) ===
  ['O','H1','H1','O','CS','CB','CB','CB','CB','CB','CB','CS','O','H1','H1','O'],
  ['O','H1','H2','O','CS','CS','CB','CB','CB','CB','CS','CS','O','H2','H1','O'],
  ['O','CS','O','O','CS','CS','CB','CB','CB','CB','CS','CS','O','O','CS','O'],
  ['O','CS','O','O','CS','CS','CB','CS','CS','CB','CS','CS','O','O','CS','O'],
  ['O','CS','O','O','LD','LB','LB','LB','LB','LB','LB','LD','O','O','CS','O'],
  ['O','CS','O','O','CS','CS','CB','CB','CB','CB','CS','CS','O','O','CS','O'],
  ['O','SB','O','O','CS','CS','CB','CB','CB','CB','CS','CS','O','O','SB','O'],
  ['O','SB','O','CS','CS','CB','CB','CB','CB','CB','CB','CS','CS','O','SB','O'],
  ['_','O','O','CS','CS','CB','CB','CB','CB','CB','CB','CS','CS','O','O','_'],
  ['_','_','O','CS','CS','CB','CB','CS','CS','CB','CB','CS','CS','O','_','_'],
  ['_','O','CS','CS','CB','CB','CB','CB','CB','CB','CB','CB','CS','CS','O','_'],
  ['_','O','CS','CS','CB','CB','CB','CB','CB','CB','CB','CB','CS','CS','O','_'],
  ['_','O','CS','CS','CB','CB','CB','CS','CS','CB','CB','CB','CS','CS','O','_'],
  ['_','O','O','CS','CS','CB','CB','O','O','CB','CB','CS','CS','O','O','_'],
  ['_','_','O','O','CS','CB','O','_','_','O','CB','CS','O','O','_','_'],
  // === FEET (rough sandals from behind) ===
  ['_','_','_','O','SS','SB','O','_','_','O','SB','SS','O','_','_','_'],
  ['_','_','O','SN','SN','SS','O','_','_','O','SS','SN','SN','O','_','_'],
  ['_','_','O','SN','SN','SN','O','_','_','O','SN','SN','SN','O','_','_'],
  ['_','_','_','O','O','O','_','_','_','_','O','O','O','_','_','_'],
];

export const JOHN_BAPTIST_LEFT = [
  // === HEAD (profile, wild hair mass on right side) ===
  ['_','_','_','_','_','O','O','O','O','O','O','_','_','_','_','_'],
  ['_','_','_','_','O','H2','H1','H1','H2','H1','H2','O','_','_','_','_'],
  ['_','_','_','O','H1','H2','H1','H2','H1','H2','H1','H1','O','_','_','_'],
  ['_','_','_','O','H1','H1','H2','H1','H1','H1','H2','H1','H2','O','_','_'],
  ['_','_','_','O','H1','SH','SB','SB','SH','H1','H1','H2','H1','O','_','_'],
  ['_','_','_','O','SB','EY','SB','SB','SB','H1','H2','H1','H2','O','_','_'],
  ['_','_','O','SB','SB','SB','SS','SB','SB','H1','H1','H2','H1','O','_','_'],
  ['_','_','O','SB','SB','SS','SB','SB','SB','H1','H2','H1','H1','O','_','_'],
  ['_','_','O','H2','H3','SB','SS','SB','H2','H1','H1','H2','H1','O','_','_'],
  ['_','_','O','H2','H3','H2','H2','H2','H1','H1','H2','H1','O','_','_','_'],
  ['_','_','O','H2','H3','H2','H3','H2','H1','H2','H1','H1','O','_','_','_'],
  ['_','_','O','H2','H3','H2','H2','H2','H1','H1','H2','O','_','_','_','_'],
  ['_','_','_','O','O','SB','O','H2','H1','H1','O','_','_','_','_','_'],
  // === BODY (camel garment, side view, narrower) ===
  ['_','_','_','O','CB','CB','CH','CB','CB','CB','O','_','_','_','_','_'],
  ['_','_','_','O','CS','CB','CB','CB','CB','CS','O','_','_','_','_','_'],
  ['_','O','SB','O','CS','CB','CH','CB','CB','CS','O','SB','O','_','_','_'],
  ['_','O','SS','O','CS','CB','CB','CB','CB','CS','O','SS','O','_','_','_'],
  ['_','O','SB','O','LD','LB','LB','LB','LB','LD','O','SB','O','_','_','_'],
  ['_','O','SS','O','CS','CB','CB','CB','CB','CS','O','SS','O','_','_','_'],
  ['_','_','O','O','CS','CB','CH','CB','CB','CS','O','O','_','_','_','_'],
  ['_','_','_','O','CS','CB','CB','CB','CB','CB','O','_','_','_','_','_'],
  ['_','_','_','O','CS','CB','CH','CB','CB','CS','O','_','_','_','_','_'],
  ['_','_','_','O','CS','CB','CB','CH','CB','CS','O','_','_','_','_','_'],
  ['_','_','O','CS','CB','CB','CB','CB','CB','CB','CS','O','_','_','_','_'],
  ['_','_','O','CS','CB','CH','CB','CB','CH','CB','CS','O','_','_','_','_'],
  ['_','_','O','CS','CB','CB','CB','CB','CB','CB','CS','O','_','_','_','_'],
  ['_','_','_','O','CS','CB','CB','O','CB','CS','O','_','_','_','_','_'],
  ['_','_','_','_','O','CS','O','_','O','O','_','_','_','_','_','_'],
  // === FEET (one foot forward) ===
  ['_','_','_','O','SS','SB','O','_','O','SB','O','_','_','_','_','_'],
  ['_','_','O','SN','SN','SS','O','_','O','SN','SN','O','_','_','_','_'],
  ['_','_','O','SN','SN','SN','O','_','_','O','SN','O','_','_','_','_'],
  ['_','_','_','O','O','O','_','_','_','_','O','_','_','_','_','_'],
];

export function renderSprite(ctx, x, y, scale = 1) {
  for (let row = 0; row < JOHN_BAPTIST.length; row++) {
    for (let col = 0; col < JOHN_BAPTIST[row].length; col++) {
      const colorKey = JOHN_BAPTIST[row][col];
      if (colorKey === '_') continue;
      ctx.fillStyle = PALETTE[colorKey];
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
