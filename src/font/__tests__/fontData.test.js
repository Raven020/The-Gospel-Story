import { describe, it, expect } from 'vitest';
import { GLYPHS, GLYPH_W, GLYPH_H, CELL_W, CELL_H } from '../fontData.js';

describe('fontData', () => {
  it('exports correct dimensions', () => {
    expect(GLYPH_W).toBe(5);
    expect(GLYPH_H).toBe(7);
    expect(CELL_W).toBe(6);
    expect(CELL_H).toBe(8);
  });

  it('has glyphs for A-Z', () => {
    for (let c = 65; c <= 90; c++) {
      const ch = String.fromCharCode(c);
      expect(GLYPHS[ch], `missing glyph for ${ch}`).toBeDefined();
      expect(GLYPHS[ch].length, `wrong length for ${ch}`).toBe(35);
    }
  });

  it('has glyphs for a-z', () => {
    for (let c = 97; c <= 122; c++) {
      const ch = String.fromCharCode(c);
      expect(GLYPHS[ch], `missing glyph for ${ch}`).toBeDefined();
      expect(GLYPHS[ch].length, `wrong length for ${ch}`).toBe(35);
    }
  });

  it('has glyphs for 0-9', () => {
    for (let c = 48; c <= 57; c++) {
      const ch = String.fromCharCode(c);
      expect(GLYPHS[ch], `missing glyph for ${ch}`).toBeDefined();
      expect(GLYPHS[ch].length, `wrong length for ${ch}`).toBe(35);
    }
  });

  it('has glyphs for required punctuation', () => {
    const required = ['.', ',', '!', '?', "'", '"', ':', ';', '-', '_', '(', ')', '/', '%', '+', ' '];
    for (const ch of required) {
      expect(GLYPHS[ch], `missing glyph for '${ch}'`).toBeDefined();
      expect(GLYPHS[ch].length, `wrong length for '${ch}'`).toBe(35);
    }
  });

  it('all glyph values are 0 or 1', () => {
    for (const [ch, data] of Object.entries(GLYPHS)) {
      for (let i = 0; i < data.length; i++) {
        expect(data[i] === 0 || data[i] === 1, `bad value in ${ch}[${i}]: ${data[i]}`).toBe(true);
      }
    }
  });

  it('space glyph is all zeros', () => {
    expect(GLYPHS[' '].every(v => v === 0)).toBe(true);
  });

  it('A glyph matches spec example', () => {
    expect(GLYPHS['A']).toEqual([
      0,1,1,1,0,
      1,0,0,0,1,
      1,0,0,0,1,
      1,1,1,1,1,
      1,0,0,0,1,
      1,0,0,0,1,
      1,0,0,0,1,
    ]);
  });
});
