/**
 * Satan — Overworld / Boss Sprite (Front-Facing / Down)
 *
 * Style: GBA-era Pokemon, 16x32 pixels
 * Deceptive appearance — outwardly regal/beautiful but unsettling
 * "Angel of light" disguise with dark undertones
 * Pale/ashen skin, sharp angular features, dark piercing eyes
 * Dark royal robes with crimson accents
 * Tall, imposing silhouette
 */

export const PALETTE = {
  _: null,
  O: '#1A0A0A',      // outline (darker/redder than normal)

  // Skin (pale, ashen, unnatural)
  SB: '#C8B8A8',     // skin base (pale)
  SS: '#A89888',     // skin shadow
  SH: '#DED0C0',     // skin highlight

  // Eyes (piercing, dark with red hint)
  EY: '#4A0A0A',     // eye (dark red)

  // Hair (dark, sleek)
  H1: '#0E0A08',     // hair dark (near black)
  H2: '#1E1614',     // hair mid
  H3: '#2E2220',     // hair highlight

  // Dark robes
  RB: '#1E1620',     // robe base (dark purple-black)
  RS: '#0E0A12',     // robe shadow
  RH: '#2E2430',     // robe highlight

  // Crimson accents
  CB: '#6E1818',     // crimson base
  CS: '#4E0E0E',     // crimson shadow
  CH: '#8E2828',     // crimson highlight

  // Sash (crimson)
  SA: '#6E1818',     // sash
  SD: '#4E0E0E',     // sash dark

  // Feet (dark, almost hidden)
  FT: '#1A1218',     // dark foot/boot
};

export const SATAN = [
  // === HEAD (angular, sharp, imposing) ===
  ['_','_','_','_','_','O','O','O','O','O','O','_','_','_','_','_'],
  ['_','_','_','_','O','H2','H1','H2','H2','H1','H2','O','_','_','_','_'],
  ['_','_','_','O','H1','H2','H3','H2','H2','H3','H2','H1','O','_','_','_'],
  ['_','_','O','H1','H1','H2','H3','H3','H3','H3','H2','H1','H1','O','_','_'],
  ['_','_','O','H1','SH','SH','SB','SB','SB','SB','SH','SH','H1','O','_','_'],
  ['_','_','O','H1','SB','EY','SS','SB','SB','SS','EY','SB','H1','O','_','_'],
  ['_','_','O','H1','SB','SB','SB','SS','SS','SB','SB','SB','H1','O','_','_'],
  ['_','_','O','H1','SS','SB','SS','SB','SB','SS','SB','SS','H1','O','_','_'],
  ['_','_','O','H1','SB','SS','SB','SS','SS','SB','SS','SB','H1','O','_','_'],
  ['_','_','_','O','H1','SB','SB','SB','SB','SB','SB','H1','O','_','_','_'],
  ['_','_','_','_','O','H1','O','SB','SB','O','H1','O','_','_','_','_'],
  ['_','_','_','_','O','O','SS','O','O','SS','O','O','_','_','_','_'],
  ['_','_','_','_','_','O','O','O','O','O','O','_','_','_','_','_'],

  // === BODY (dark robes, tall, imposing, crimson accents) ===
  ['_','_','_','O','CB','RB','RH','RB','RB','RH','RB','CB','O','_','_','_'],
  ['_','_','_','O','CS','RB','RB','RB','RB','RB','RB','CS','O','_','_','_'],
  ['_','O','RB','O','RS','RB','RH','RB','RB','RH','RB','RS','O','RB','O','_'],
  ['_','O','RS','O','RS','RB','RB','RB','RB','RB','RB','RS','O','RS','O','_'],
  ['_','O','RB','O','SD','SA','SA','SA','SA','SA','SA','SD','O','RB','O','_'],
  ['_','O','RS','O','RS','RB','RB','RB','RB','RB','RB','RS','O','RS','O','_'],
  ['_','O','SB','O','RS','RB','RH','RB','RB','RH','RB','RS','O','SB','O','_'],
  ['_','O','SS','O','RS','RB','RB','RB','RB','RB','RB','RS','O','SS','O','_'],
  ['_','_','O','O','RS','RH','RB','RB','RB','RB','RH','RS','O','O','_','_'],
  ['_','_','O','RS','RB','RB','CB','RB','RB','CB','RB','RB','RS','O','_','_'],
  ['_','O','RS','RB','RB','RB','RB','RB','RB','RB','RB','RB','RB','RS','O','_'],
  ['_','O','RS','RB','CB','RB','RB','RB','RB','RB','RB','CB','RB','RS','O','_'],
  ['_','O','RS','RB','RB','RB','CB','RB','RB','CB','RB','RB','RB','RS','O','_'],
  ['_','O','O','RS','RB','RB','RB','O','O','RB','RB','RB','RS','O','O','_'],
  ['_','_','O','O','RS','RB','O','_','_','O','RB','RS','O','O','_','_'],

  // === FEET (dark, hidden) ===
  ['_','_','_','O','FT','FT','O','_','_','O','FT','FT','O','_','_','_'],
  ['_','_','O','FT','FT','FT','O','_','_','O','FT','FT','FT','O','_','_'],
  ['_','_','O','FT','FT','FT','O','_','_','O','FT','FT','FT','O','_','_'],
  ['_','_','_','O','O','O','_','_','_','_','O','O','O','_','_','_'],
];

export const SATAN_BACK = [
  // === HEAD (sleek dark hair from behind, no face) ===
  ['_','_','_','_','_','O','O','O','O','O','O','_','_','_','_','_'],
  ['_','_','_','_','O','H1','H2','H1','H1','H2','H1','O','_','_','_','_'],
  ['_','_','_','O','H1','H1','H2','H1','H1','H2','H1','H1','O','_','_','_'],
  ['_','_','O','H1','H1','H1','H2','H1','H1','H2','H1','H1','H1','O','_','_'],
  ['_','_','O','H1','H1','H2','H1','H1','H1','H1','H2','H1','H1','O','_','_'],
  ['_','_','O','H1','H1','H1','H2','H1','H1','H2','H1','H1','H1','O','_','_'],
  ['_','_','O','H1','H1','H2','H1','H1','H1','H1','H2','H1','H1','O','_','_'],
  ['_','_','O','H1','H1','H1','H1','H2','H2','H1','H1','H1','H1','O','_','_'],
  ['_','_','O','H1','H1','H1','H2','H1','H1','H2','H1','H1','H1','O','_','_'],
  ['_','_','_','O','H1','H1','H1','H1','H1','H1','H1','H1','O','_','_','_'],
  ['_','_','_','_','O','H1','H1','H1','H1','H1','H1','O','_','_','_','_'],
  ['_','_','_','_','O','O','SS','O','O','SS','O','O','_','_','_','_'],
  ['_','_','_','_','_','O','O','O','O','O','O','_','_','_','_','_'],

  // === BODY (dark robe back, more shadow, crimson accents) ===
  ['_','_','_','O','CB','RS','RB','RS','RS','RB','RS','CB','O','_','_','_'],
  ['_','_','_','O','CS','RS','RS','RB','RB','RS','RS','CS','O','_','_','_'],
  ['_','O','RB','O','RS','RS','RB','RS','RS','RB','RS','RS','O','RB','O','_'],
  ['_','O','RS','O','RS','RS','RS','RB','RB','RS','RS','RS','O','RS','O','_'],
  ['_','O','RB','O','SD','SA','SA','SA','SA','SA','SA','SD','O','RB','O','_'],
  ['_','O','RS','O','RS','RS','RS','RB','RB','RS','RS','RS','O','RS','O','_'],
  ['_','O','RB','O','RS','RS','RB','RS','RS','RB','RS','RS','O','RB','O','_'],
  ['_','O','RS','O','RS','RS','RS','RB','RB','RS','RS','RS','O','RS','O','_'],
  ['_','_','O','O','RS','RB','RS','RS','RS','RS','RB','RS','O','O','_','_'],
  ['_','_','O','RS','RS','RS','CB','RS','RS','CB','RS','RS','RS','O','_','_'],
  ['_','O','RS','RS','RB','RS','RS','RB','RB','RS','RS','RB','RS','RS','O','_'],
  ['_','O','RS','RS','CB','RS','RS','RS','RS','RS','RS','CB','RS','RS','O','_'],
  ['_','O','RS','RS','RS','RS','CB','RS','RS','CB','RS','RS','RS','RS','O','_'],
  ['_','O','O','RS','RS','RB','RS','O','O','RS','RB','RS','RS','O','O','_'],
  ['_','_','O','O','RS','RS','O','_','_','O','RS','RS','O','O','_','_'],

  // === FEET (dark, hidden) ===
  ['_','_','_','O','FT','FT','O','_','_','O','FT','FT','O','_','_','_'],
  ['_','_','O','FT','FT','FT','O','_','_','O','FT','FT','FT','O','_','_'],
  ['_','_','O','FT','FT','FT','O','_','_','O','FT','FT','FT','O','_','_'],
  ['_','_','_','O','O','O','_','_','_','_','O','O','O','_','_','_'],
];

export const SATAN_LEFT = [
  // === HEAD (profile facing left, sharp angular features) ===
  ['_','_','_','_','_','_','O','O','O','O','O','_','_','_','_','_'],
  ['_','_','_','_','_','O','H1','H2','H1','H2','H1','O','_','_','_','_'],
  ['_','_','_','_','O','H1','H2','H1','H2','H1','H1','H1','O','_','_','_'],
  ['_','_','_','O','H1','H1','H1','H2','H1','H1','H1','H1','H1','O','_','_'],
  ['_','_','_','O','SH','SB','SB','SB','H1','H1','H1','H1','H1','O','_','_'],
  ['_','_','O','SB','EY','SS','SB','SB','H1','H1','H1','H1','O','_','_','_'],
  ['_','_','O','SB','SB','SB','SS','SB','H1','H1','H1','O','_','_','_','_'],
  ['_','_','O','SS','SB','SS','SB','SB','H1','H1','H1','O','_','_','_','_'],
  ['_','_','_','O','SB','SS','SB','SB','H1','H1','O','_','_','_','_','_'],
  ['_','_','_','_','O','SB','SB','SB','H1','O','_','_','_','_','_','_'],
  ['_','_','_','_','O','O','SB','SB','O','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','O','SS','O','O','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','O','O','_','_','_','_','_','_','_','_'],

  // === BODY (side view, narrow but tall, dark robe with crimson) ===
  ['_','_','_','_','O','CB','RB','RH','RB','CB','O','_','_','_','_','_'],
  ['_','_','_','_','O','CS','RB','RB','RB','CS','O','_','_','_','_','_'],
  ['_','_','_','O','RS','RB','RH','RB','RB','RS','O','RB','O','_','_','_'],
  ['_','_','_','O','RS','RB','RB','RB','RB','RS','O','RS','O','_','_','_'],
  ['_','_','_','O','SD','SA','SA','SA','SA','SD','O','RB','O','_','_','_'],
  ['_','_','_','O','RS','RB','RB','RB','RB','RS','O','RS','O','_','_','_'],
  ['_','_','_','O','RS','RB','RH','RB','RB','RS','O','SB','O','_','_','_'],
  ['_','_','_','O','RS','RB','RB','RB','RB','RS','O','SS','O','_','_','_'],
  ['_','_','_','O','RS','RH','RB','RB','RH','RS','O','O','_','_','_','_'],
  ['_','_','_','O','RS','RB','CB','RB','RB','RS','O','_','_','_','_','_'],
  ['_','_','_','O','RS','RB','RB','RB','RB','RB','RS','O','_','_','_','_'],
  ['_','_','_','O','RS','RB','CB','RB','RB','CB','RB','RS','O','_','_','_'],
  ['_','_','_','O','RS','RB','RB','CB','RB','RB','RB','RS','O','_','_','_'],
  ['_','_','_','O','O','RS','RB','RB','O','RB','RS','O','O','_','_','_'],
  ['_','_','_','_','O','O','RS','O','_','O','RS','O','O','_','_','_'],

  // === FEET (one foot forward, dark) ===
  ['_','_','_','_','O','FT','FT','O','_','O','FT','O','_','_','_','_'],
  ['_','_','_','O','FT','FT','FT','O','_','O','FT','FT','O','_','_','_'],
  ['_','_','_','O','FT','FT','FT','O','_','_','O','FT','FT','O','_','_'],
  ['_','_','_','_','O','O','O','_','_','_','_','O','O','O','_','_'],
];

export function renderSprite(ctx, x, y, scale = 1) {
  for (let row = 0; row < SATAN.length; row++) {
    for (let col = 0; col < SATAN[row].length; col++) {
      const colorKey = SATAN[row][col];
      if (colorKey === '_') continue;
      ctx.fillStyle = PALETTE[colorKey];
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
