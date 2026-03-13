/**
 * Jesus — Overworld Sprites (All Directions)
 *
 * Style: GBA-era Pokemon
 * Dimensions: 16x32 pixels per direction
 * Palette: 15 colors + transparent
 *
 * Directions:
 *   FRONT (down) — facing camera
 *   BACK (up) — walking away
 *   LEFT (side) — mirror in code for RIGHT
 *
 * Design notes:
 * - Large head (~40% of height) for Pokemon-style proportions
 * - Shoulder-length brown hair, short beard
 * - Off-white/cream robes with brown sash
 * - Sandals
 * - Olive/tan skin tone
 * - 1px dark outline for readability
 * - Light source: top-left
 * - Hue-shifted shadows (skin shadow leans warm, robe shadow leans cool)
 */

export const PALETTE = {
  _: null,           // transparent
  O: '#2B1B0E',      // outline (dark brown-black)
  HD: '#4A2912',     // hair dark
  HM: '#6B3D22',     // hair mid
  HL: '#7D4E2D',     // hair highlight
  SB: '#D4A574',     // skin base
  SS: '#B8845A',     // skin shadow
  SH: '#E8C49A',     // skin highlight
  RB: '#E8E0D0',     // robe base (off-white)
  RS: '#C4B8A4',     // robe shadow
  RH: '#F5F0E8',     // robe highlight
  SA: '#7B3F15',     // sash
  SD: '#5C2E0E',     // sash dark
  SN: '#8B6914',     // sandal
  EY: '#1A1A2E',     // eye (near-black with slight blue)
  BD: '#5C3A21',     // beard
};

// ============================================================
// FRONT (facing camera / walking down)
// ============================================================
export const JESUS_FRONT = [
  // === HEAD (rows 0-12) ===
  ['_','_','_','_','_','O','O','O','O','O','O','_','_','_','_','_'],
  ['_','_','_','_','O','HL','HM','HL','HL','HM','HL','O','_','_','_','_'],
  ['_','_','_','O','HM','HL','HM','HL','HL','HM','HL','HM','O','_','_','_'],
  ['_','_','O','HD','HM','HM','HL','HL','HL','HL','HM','HM','HD','O','_','_'],
  ['_','_','O','HD','SH','SH','SB','SB','SB','SB','SH','SH','HD','O','_','_'],
  ['_','_','O','HD','SB','EY','SB','SB','SB','SB','EY','SB','HD','O','_','_'],
  ['_','_','O','HD','SB','SB','SB','SS','SS','SB','SB','SB','HD','O','_','_'],
  ['_','_','O','HD','SB','SB','SS','SB','SB','SS','SB','SB','HD','O','_','_'],
  ['_','_','O','HD','BD','BD','SB','SS','SS','SB','BD','BD','HD','O','_','_'],
  ['_','_','O','HM','HD','BD','BD','BD','BD','BD','BD','HD','HM','O','_','_'],
  ['_','_','O','HM','HD','BD','BD','BD','BD','BD','BD','HD','HM','O','_','_'],
  ['_','_','O','HM','HD','O','BD','BD','BD','BD','O','HD','HM','O','_','_'],
  ['_','O','HM','HM','O','SB','O','O','O','O','SB','O','HM','HM','O','_'],
  // === BODY (rows 13-27) ===
  ['_','O','HM','O','RB','RB','RH','RB','RB','RH','RB','RB','O','HM','O','_'],
  ['_','O','HD','O','RS','RB','RB','RB','RB','RB','RB','RS','O','HD','O','_'],
  ['O','RB','O','O','RS','RB','RH','RB','RB','RH','RB','RS','O','O','RB','O'],
  ['O','RS','O','O','RS','RB','RB','RB','RB','RB','RB','RS','O','O','RS','O'],
  ['O','RB','O','O','SD','SA','SA','SA','SA','SA','SA','SD','O','O','RB','O'],
  ['O','RS','O','O','RS','RB','RB','RB','RB','RB','RB','RS','O','O','RS','O'],
  ['O','SB','O','O','RS','RB','RH','RB','RB','RH','RB','RS','O','O','SB','O'],
  ['O','SB','O','RS','RB','RB','RB','RB','RB','RB','RB','RB','RS','O','SB','O'],
  ['_','O','O','RS','RB','RH','RB','RB','RB','RB','RH','RB','RS','O','O','_'],
  ['_','_','O','RS','RB','RB','RH','RB','RB','RH','RB','RB','RS','O','_','_'],
  ['_','O','RS','RB','RB','RB','RB','RB','RB','RB','RB','RB','RB','RS','O','_'],
  ['_','O','RS','RB','RH','RB','RB','RB','RB','RB','RB','RH','RB','RS','O','_'],
  ['_','O','RS','RB','RB','RB','RH','RB','RB','RH','RB','RB','RB','RS','O','_'],
  ['_','O','O','RS','RB','RB','RB','O','O','RB','RB','RB','RS','O','O','_'],
  ['_','_','O','O','RS','RB','O','_','_','O','RB','RS','O','O','_','_'],
  // === FEET (rows 28-31) ===
  ['_','_','_','O','SS','SB','O','_','_','O','SB','SS','O','_','_','_'],
  ['_','_','O','SN','SN','SS','O','_','_','O','SS','SN','SN','O','_','_'],
  ['_','_','O','SN','SN','SN','O','_','_','O','SN','SN','SN','O','_','_'],
  ['_','_','_','O','O','O','_','_','_','_','O','O','O','_','_','_'],
];

// ============================================================
// BACK (walking away / facing up)
// No face, no beard. Hair covers back of head, falls to shoulders.
// Robe seen from behind — sash visible, no front details.
// ============================================================
export const JESUS_BACK = [
  // === HEAD (rows 0-12) — all hair from behind ===
  ['_','_','_','_','_','O','O','O','O','O','O','_','_','_','_','_'],
  ['_','_','_','_','O','HM','HD','HM','HM','HD','HM','O','_','_','_','_'],
  ['_','_','_','O','HD','HM','HD','HM','HM','HD','HM','HD','O','_','_','_'],
  ['_','_','O','HD','HD','HM','HM','HM','HM','HM','HM','HD','HD','O','_','_'],
  ['_','_','O','HD','HD','HM','HL','HM','HM','HL','HM','HD','HD','O','_','_'],
  ['_','_','O','HD','HD','HM','HM','HM','HM','HM','HM','HD','HD','O','_','_'],
  ['_','_','O','HD','HD','HM','HM','HL','HL','HM','HM','HD','HD','O','_','_'],
  ['_','_','O','HD','HD','HM','HM','HM','HM','HM','HM','HD','HD','O','_','_'],
  ['_','_','O','HD','HD','HM','HM','HM','HM','HM','HM','HD','HD','O','_','_'],
  ['_','_','O','HM','HD','HM','HM','HM','HM','HM','HM','HD','HM','O','_','_'],
  ['_','_','O','HM','HD','HM','HL','HM','HM','HL','HM','HD','HM','O','_','_'],
  ['_','_','O','HM','HD','HD','HM','HM','HM','HM','HD','HD','HM','O','_','_'],
  ['_','O','HM','HM','O','HD','O','O','O','O','HD','O','HM','HM','O','_'],
  // === BODY (rows 13-27) — robe from behind, hair draping ===
  ['_','O','HM','O','RB','RB','RB','RS','RS','RB','RB','RB','O','HM','O','_'],
  ['_','O','HD','O','RS','RB','RB','RB','RB','RB','RB','RS','O','HD','O','_'],
  ['O','RB','O','O','RS','RB','RB','RS','RS','RB','RB','RS','O','O','RB','O'],
  ['O','RS','O','O','RS','RB','RB','RB','RB','RB','RB','RS','O','O','RS','O'],
  ['O','RB','O','O','SD','SA','SA','SA','SA','SA','SA','SD','O','O','RB','O'],
  ['O','RS','O','O','RS','RB','RB','RB','RB','RB','RB','RS','O','O','RS','O'],
  ['O','SB','O','O','RS','RB','RB','RS','RS','RB','RB','RS','O','O','SB','O'],
  ['O','SB','O','RS','RB','RB','RB','RB','RB','RB','RB','RB','RS','O','SB','O'],
  ['_','O','O','RS','RB','RB','RS','RB','RB','RS','RB','RB','RS','O','O','_'],
  ['_','_','O','RS','RB','RB','RB','RS','RS','RB','RB','RB','RS','O','_','_'],
  ['_','O','RS','RB','RB','RB','RB','RB','RB','RB','RB','RB','RB','RS','O','_'],
  ['_','O','RS','RB','RB','RS','RB','RB','RB','RB','RS','RB','RB','RS','O','_'],
  ['_','O','RS','RB','RB','RB','RB','RS','RS','RB','RB','RB','RB','RS','O','_'],
  ['_','O','O','RS','RB','RB','RB','O','O','RB','RB','RB','RS','O','O','_'],
  ['_','_','O','O','RS','RB','O','_','_','O','RB','RS','O','O','_','_'],
  // === FEET (rows 28-31) ===
  ['_','_','_','O','SS','SB','O','_','_','O','SB','SS','O','_','_','_'],
  ['_','_','O','SN','SN','SS','O','_','_','O','SS','SN','SN','O','_','_'],
  ['_','_','O','SN','SN','SN','O','_','_','O','SN','SN','SN','O','_','_'],
  ['_','_','_','O','O','O','_','_','_','_','O','O','O','_','_','_'],
];

// ============================================================
// LEFT (side view — walking left)
// Mirror horizontally in code for RIGHT.
// Profile: one eye visible, nose bump, beard from side.
// Hair falls on far side. Body turned sideways — narrower.
// Light source top-left: left-facing = lit side toward camera.
// ============================================================
export const JESUS_LEFT = [
  // === HEAD (rows 0-12) — profile view ===
  // Face points left. Hair on right side (back of head).
  // Nose protrudes left as a skin pixel bump. Clear skin face, no hair overlap.
  ['_','_','_','_','_','_','O','O','O','O','O','_','_','_','_','_'],
  ['_','_','_','_','_','O','HM','HL','HM','HL','HM','O','_','_','_','_'],
  ['_','_','_','_','O','HM','HL','HM','HL','HM','HL','HM','O','_','_','_'],
  ['_','_','_','_','O','HD','HM','HL','HL','HM','HL','HM','HD','O','_','_'],
  // Row 4: forehead — skin visible on left, hair only on right
  ['_','_','_','_','O','SH','SB','SB','SH','HM','HM','HM','HD','O','_','_'],
  // Row 5: eye — skin face on left, hair behind on right
  ['_','_','_','_','O','SB','EY','SB','SB','SB','HM','HM','HD','O','_','_'],
  // Row 6: nose protrudes left
  ['_','_','_','O','SS','SB','SB','SS','SB','SB','HM','HM','HD','O','_','_'],
  // Row 7: mouth area
  ['_','_','_','_','O','SB','SS','SB','SB','SB','HM','HM','HD','O','_','_'],
  // Row 8: beard from side — beard on chin/front, hair behind
  ['_','_','_','O','BD','BD','SS','SB','BD','BD','HM','HM','HD','O','_','_'],
  // Row 9: beard and hair
  ['_','_','_','_','O','BD','BD','BD','BD','HD','HM','HM','HD','O','_','_'],
  // Row 10: beard tapers, hair falls
  ['_','_','_','_','_','O','BD','BD','HD','HM','HM','HD','O','_','_','_'],
  // Row 11: chin, hair at shoulder
  ['_','_','_','_','_','O','O','SB','O','HD','HM','HD','O','_','_','_'],
  // Row 12: neck, hair drapes behind
  ['_','_','_','_','_','O','SB','O','O','O','HM','HM','O','_','_','_'],
  // === BODY (rows 13-27) — side profile, narrower ===
  ['_','_','_','_','O','RB','RH','RB','RB','O','HM','HD','O','_','_','_'],
  ['_','_','_','_','O','RS','RB','RB','RS','O','O','O','_','_','_','_'],
  ['_','_','_','O','SB','O','RB','RH','RB','RS','O','RB','O','_','_','_'],
  ['_','_','_','O','SS','O','RB','RB','RB','RS','O','RS','O','_','_','_'],
  ['_','_','_','O','SB','O','SA','SA','SA','SD','O','RB','O','_','_','_'],
  ['_','_','_','O','SS','O','RB','RB','RB','RS','O','RS','O','_','_','_'],
  ['_','_','_','O','SB','O','RB','RH','RB','RS','O','SB','O','_','_','_'],
  ['_','_','_','_','O','RS','RB','RB','RB','RS','O','SB','O','_','_','_'],
  ['_','_','_','_','O','RS','RB','RH','RB','RS','O','O','_','_','_','_'],
  ['_','_','_','_','O','RS','RB','RB','RB','RS','O','_','_','_','_','_'],
  ['_','_','_','O','RS','RB','RB','RB','RB','RB','RS','O','_','_','_','_'],
  ['_','_','_','O','RS','RB','RH','RB','RB','RB','RS','O','_','_','_','_'],
  ['_','_','_','O','RS','RB','RB','RH','RB','RB','RS','O','_','_','_','_'],
  ['_','_','_','O','O','RS','RB','O','O','RS','O','O','_','_','_','_'],
  ['_','_','_','_','O','O','O','_','_','O','O','_','_','_','_','_'],
  // === FEET (rows 28-31) — side view, one foot slightly forward ===
  ['_','_','_','_','O','SB','O','_','O','SS','O','_','_','_','_','_'],
  ['_','_','_','O','SN','SN','O','_','O','SN','SN','O','_','_','_','_'],
  ['_','_','_','O','SN','SN','O','_','O','SN','SN','O','_','_','_','_'],
  ['_','_','_','_','O','O','_','_','_','O','O','_','_','_','_','_'],
];

/**
 * Renders a sprite grid to a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - top-left x position
 * @param {number} y - top-left y position
 * @param {number} scale - pixel scale factor
 */
export function renderSprite(ctx, x, y, scale = 1) {
  renderSpriteData(ctx, JESUS_FRONT, x, y, scale);
}

/**
 * Renders any sprite data array using the Jesus palette.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[][]} spriteData
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 */
export function renderSpriteData(ctx, spriteData, x, y, scale = 1) {
  for (let row = 0; row < spriteData.length; row++) {
    for (let col = 0; col < spriteData[row].length; col++) {
      const colorKey = spriteData[row][col];
      if (colorKey === '_') continue;
      ctx.fillStyle = PALETTE[colorKey];
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

/**
 * Renders a sprite mirrored horizontally (used for RIGHT from LEFT).
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[][]} spriteData
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 */
export function renderSpriteMirrored(ctx, spriteData, x, y, scale = 1) {
  const width = spriteData[0].length;
  for (let row = 0; row < spriteData.length; row++) {
    for (let col = 0; col < spriteData[row].length; col++) {
      const colorKey = spriteData[row][col];
      if (colorKey === '_') continue;
      ctx.fillStyle = PALETTE[colorKey];
      ctx.fillRect(x + (width - 1 - col) * scale, y + row * scale, scale, scale);
    }
  }
}
