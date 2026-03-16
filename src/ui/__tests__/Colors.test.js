import { describe, it, expect } from 'vitest';
import { Colors } from '../Colors.js';

describe('Colors', () => {
  it('exports a Colors object', () => {
    expect(Colors).toBeDefined();
    expect(typeof Colors).toBe('object');
  });

  it('has all required text colors', () => {
    expect(Colors.TEXT_LIGHT).toBeDefined();
    expect(Colors.TEXT_DARK).toBeDefined();
    expect(Colors.TEXT_GOLD).toBeDefined();
    expect(Colors.TEXT_DIM).toBeDefined();
  });

  it('has all required background colors', () => {
    expect(Colors.BG_DARK).toBeDefined();
    expect(Colors.BG_LIGHT).toBeDefined();
    expect(Colors.BG_DIALOG).toBeDefined();
    expect(Colors.BG_OVERLAY).toBeDefined();
  });

  it('has all required UI colors', () => {
    expect(Colors.BORDER).toBeDefined();
    expect(Colors.CURSOR_BG).toBeDefined();
  });

  it('has all required HP bar colors', () => {
    expect(Colors.HP_HIGH).toBeDefined();
    expect(Colors.HP_MID).toBeDefined();
    expect(Colors.HP_LOW).toBeDefined();
    expect(Colors.HP_EMPTY).toBeDefined();
  });

  it('has SP and bar track colors', () => {
    expect(Colors.SP_BAR).toBeDefined();
    expect(Colors.BAR_TRACK).toBeDefined();
    expect(Colors.BAR_BORDER).toBeDefined();
  });

  it('has damage floater colors', () => {
    expect(Colors.DMG_NORMAL).toBeDefined();
    expect(Colors.DMG_HEAL).toBeDefined();
    expect(Colors.DMG_CRIT).toBeDefined();
    expect(Colors.DMG_MISS).toBeDefined();
  });

  it('all values are strings', () => {
    for (const [key, val] of Object.entries(Colors)) {
      expect(typeof val, `Colors.${key} should be a string`).toBe('string');
    }
  });
});
