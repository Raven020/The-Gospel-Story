import { describe, it, expect, vi } from 'vitest';
import { drawChar, drawText, drawTextPartial, measureText, wordWrap } from '../drawText.js';

describe('drawText', () => {
  describe('drawChar', () => {
    it('calls fillRect for each set pixel in glyph', () => {
      const ctx = { fillStyle: '', fillRect: vi.fn() };
      drawChar(ctx, 'A', 0, 0, '#FFF');
      // 'A' has specific number of set pixels
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.fillStyle).toBe('#FFF');
    });

    it('does nothing for unknown character', () => {
      const ctx = { fillStyle: '', fillRect: vi.fn() };
      drawChar(ctx, '~', 0, 0, '#FFF');
      expect(ctx.fillRect).not.toHaveBeenCalled();
    });
  });

  describe('drawText', () => {
    it('draws each character with CELL_W stride', () => {
      const ctx = { fillStyle: '', fillRect: vi.fn() };
      drawText(ctx, 'AB', 10, 20, '#FFF');
      // Should have calls at x=10 and x=16 (10 + 6)
      const xValues = ctx.fillRect.mock.calls.map(c => c[0]);
      expect(xValues.some(x => x >= 10 && x < 16)).toBe(true);
      expect(xValues.some(x => x >= 16 && x < 22)).toBe(true);
    });
  });

  describe('drawTextPartial', () => {
    it('only draws up to maxChars', () => {
      const ctx = { fillStyle: '', fillRect: vi.fn() };
      drawTextPartial(ctx, 'ABCDE', 0, 0, '#FFF', 2);
      // Only A and B should be drawn, max x should be < 12 (2 cells * 6px)
      const xValues = ctx.fillRect.mock.calls.map(c => c[0]);
      expect(xValues.every(x => x < 12)).toBe(true);
    });
  });

  describe('measureText', () => {
    it('returns correct width', () => {
      expect(measureText('Hello')).toBe(30); // 5 * 6
      expect(measureText('')).toBe(0);
    });
  });

  describe('wordWrap', () => {
    it('wraps at word boundaries', () => {
      const lines = wordWrap('Hello world this is a test', 12);
      expect(lines).toEqual(['Hello world', 'this is a', 'test']);
    });

    it('handles single word longer than line', () => {
      const lines = wordWrap('Superlongword', 5);
      expect(lines).toEqual(['Super', 'longw', 'ord']);
    });

    it('handles empty string', () => {
      expect(wordWrap('', 38)).toEqual([]);
    });

    it('handles exact fit', () => {
      const lines = wordWrap('abc def', 7);
      expect(lines).toEqual(['abc def']);
    });

    it('wraps at 38 chars per line for dialogue', () => {
      const text = 'A'.repeat(40);
      const lines = wordWrap(text, 38);
      expect(lines[0].length).toBe(38);
      expect(lines[1].length).toBe(2);
    });

    it('handles hard newlines (\\n)', () => {
      const lines = wordWrap('Line one\nLine two', 38);
      expect(lines).toEqual(['Line one', 'Line two']);
    });

    it('handles consecutive newlines for blank lines', () => {
      const lines = wordWrap('Hello\n\nWorld', 38);
      expect(lines).toEqual(['Hello', '', 'World']);
    });

    it('handles newline at end of text', () => {
      const lines = wordWrap('Hello\n', 38);
      expect(lines).toEqual(['Hello', '']);
    });

    it('combines newlines with word wrapping', () => {
      const lines = wordWrap('Short\nThis is a longer line that should wrap around', 20);
      expect(lines).toEqual(['Short', 'This is a longer', 'line that should', 'wrap around']);
    });
  });
});
