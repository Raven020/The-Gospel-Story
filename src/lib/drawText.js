/**
 * Bitmap text rendering per specs/ui-hud.md §1.
 * Uses fillRect for each pixel of each glyph — no canvas path ops.
 */

import { GLYPHS, GLYPH_W, GLYPH_H, CELL_W, CELL_H } from '../font/fontData.js';

/**
 * Draw a single character at (x, y) in the given color.
 */
export function drawChar(ctx, char, x, y, color) {
  const glyph = GLYPHS[char];
  if (!glyph) return;
  ctx.fillStyle = color;
  for (let row = 0; row < GLYPH_H; row++) {
    for (let col = 0; col < GLYPH_W; col++) {
      if (glyph[row * GLYPH_W + col]) {
        ctx.fillRect(x + col, y + row, 1, 1);
      }
    }
  }
}

/**
 * Draw a string at (x, y) in the given color. Monospaced with CELL_W stride.
 */
export function drawText(ctx, str, x, y, color) {
  for (let i = 0; i < str.length; i++) {
    drawChar(ctx, str[i], x + i * CELL_W, y, color);
  }
}

/**
 * Draw text limited to maxChars (for typewriter reveal).
 */
export function drawTextPartial(ctx, str, x, y, color, maxChars) {
  const len = Math.min(str.length, maxChars);
  for (let i = 0; i < len; i++) {
    drawChar(ctx, str[i], x + i * CELL_W, y, color);
  }
}

/**
 * Measure text width in pixels.
 */
export function measureText(str) {
  return str.length * CELL_W;
}

/**
 * Word-wrap text to fit within maxCharsPerLine.
 * Returns array of lines.
 */
export function wordWrap(text, maxCharsPerLine) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (word.length > maxCharsPerLine) {
      // Hard break long words
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      for (let i = 0; i < word.length; i += maxCharsPerLine) {
        lines.push(word.slice(i, i + maxCharsPerLine));
      }
      continue;
    }

    const test = currentLine ? currentLine + ' ' + word : word;
    if (test.length <= maxCharsPerLine) {
      currentLine = test;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export { CELL_W, CELL_H, GLYPH_W, GLYPH_H };
