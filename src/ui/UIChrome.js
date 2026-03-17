/**
 * Shared UI drawing utilities per specs/ui-hud.md §7.
 * Window borders, cursor triangle, HP/SP bars.
 * All rendering via fillRect — no stroke/path ops.
 */

import { Colors } from './Colors.js';

/**
 * Draw a bordered panel.
 * @param {string} fillColor - interior fill color
 */
export function drawPanel(ctx, x, y, w, h, fillColor = Colors.BG_DARK) {
  // Fill interior
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);

  // 1px border via 4 strips
  ctx.fillStyle = Colors.BORDER;
  ctx.fillRect(x, y, w, 1);           // top
  ctx.fillRect(x, y + h - 1, w, 1);   // bottom
  ctx.fillRect(x, y, 1, h);           // left
  ctx.fillRect(x + w - 1, y, 1, h);   // right
}

/**
 * Draw right-pointing cursor triangle (3x5 pixels).
 * Per specs/ui-hud.md §7: blinks at 30-frame interval.
 */
export function drawCursor(ctx, x, y, frameCount, color = Colors.TEXT_LIGHT) {
  if (Math.floor(frameCount / 30) % 2 !== 0) return; // blink off

  ctx.fillStyle = color;
  // 3x5 right-pointing triangle
  ctx.fillRect(x, y, 1, 1);
  ctx.fillRect(x, y + 1, 2, 1);
  ctx.fillRect(x, y + 2, 3, 1);
  ctx.fillRect(x, y + 3, 2, 1);
  ctx.fillRect(x, y + 4, 1, 1);
}

/**
 * Draw down-pointing advance arrow (3x5 pixels) for dialogue box.
 * Per specs/ui-hud.md §2: 3 wide, 5 tall downward-pointing triangle.
 */
export function drawAdvanceArrow(ctx, x, y, frameCount, color = Colors.TEXT_LIGHT) {
  if (Math.floor(frameCount / 30) % 2 !== 0) return;

  ctx.fillStyle = color;
  // 3x5 down-pointing triangle
  ctx.fillRect(x, y, 3, 1);
  ctx.fillRect(x, y + 1, 3, 1);
  ctx.fillRect(x, y + 2, 3, 1);
  ctx.fillRect(x, y + 3, 2, 1);
  ctx.fillRect(x + 1, y + 4, 1, 1);
}

/**
 * Draw an HP or SP bar.
 * @param {number} current - current value
 * @param {number} max - maximum value
 * @param {number} maxW - max bar width in pixels
 * @param {number} h - bar height in pixels
 * @param {string} barColor - fill color (or 'hp' for auto HP coloring)
 */
export function drawBar(ctx, x, y, current, max, maxW, h, barColor) {
  const ratio = max > 0 ? current / max : 0;
  const filledW = Math.floor(ratio * maxW);

  // Determine color for HP bars
  let color = barColor;
  if (barColor === 'hp') {
    if (current <= 0) color = Colors.HP_EMPTY;
    else if (ratio < 0.2) color = Colors.HP_LOW;
    else if (ratio < 0.5) color = Colors.HP_MID;
    else color = Colors.HP_HIGH;
  }

  // Background track
  ctx.fillStyle = Colors.BAR_TRACK;
  ctx.fillRect(x, y, maxW, h);

  // Filled portion
  if (filledW > 0) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, filledW, h);
  }

  // 1px border
  ctx.fillStyle = Colors.BAR_BORDER;
  ctx.fillRect(x, y, maxW, 1);
  ctx.fillRect(x, y + h - 1, maxW, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + maxW - 1, y, 1, h);
}

/**
 * Draw a morale bar with color thresholds per party-system.md morale system.
 * @param {number} morale - 0-100 morale value
 * @param {number} maxW - max bar width in pixels
 * @param {number} h - bar height in pixels
 */
export function drawMoraleBar(ctx, x, y, morale, maxW, h) {
  const ratio = morale / 100;
  const filledW = Math.floor(ratio * maxW);

  let color;
  if (morale >= 70) color = Colors.MORALE_HIGH;
  else if (morale >= 40) color = Colors.MORALE_MID;
  else color = Colors.MORALE_LOW;

  // Background track
  ctx.fillStyle = Colors.BAR_TRACK;
  ctx.fillRect(x, y, maxW, h);

  // Filled portion
  if (filledW > 0) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, filledW, h);
  }

  // 1px border
  ctx.fillStyle = Colors.BAR_BORDER;
  ctx.fillRect(x, y, maxW, 1);
  ctx.fillRect(x, y + h - 1, maxW, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + maxW - 1, y, 1, h);
}
