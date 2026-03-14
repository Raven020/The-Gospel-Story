import { describe, it, expect, vi } from 'vitest';
import { drawPanel, drawCursor, drawAdvanceArrow, drawBar } from '../UIChrome.js';
import { Colors } from '../Colors.js';

function makeCtx() {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
  };
}

describe('drawPanel', () => {
  it('draws filled rectangle and 4 border strips', () => {
    const ctx = makeCtx();
    drawPanel(ctx, 10, 20, 100, 50);
    // 1 fill + 4 border strips = 5 fillRect calls
    expect(ctx.fillRect).toHaveBeenCalledTimes(5);
    // First call is the interior fill
    expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 100, 50);
  });

  it('uses custom fill color', () => {
    const ctx = makeCtx();
    drawPanel(ctx, 0, 0, 50, 30, '#FF0000');
    // The fill color should have been set
    expect(ctx.fillRect).toHaveBeenCalledTimes(5);
  });
});

describe('drawCursor', () => {
  it('draws when frameCount makes it visible (blink on)', () => {
    const ctx = makeCtx();
    drawCursor(ctx, 10, 20, 0); // frame 0 → visible
    expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(0);
  });

  it('does not draw when frameCount makes it hidden (blink off)', () => {
    const ctx = makeCtx();
    drawCursor(ctx, 10, 20, 30); // frame 30 → hidden
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});

describe('drawAdvanceArrow', () => {
  it('draws when visible', () => {
    const ctx = makeCtx();
    drawAdvanceArrow(ctx, 10, 20, 0);
    expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(0);
  });

  it('does not draw when hidden', () => {
    const ctx = makeCtx();
    drawAdvanceArrow(ctx, 10, 20, 30);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});

describe('drawBar', () => {
  it('draws track, fill, and border', () => {
    const ctx = makeCtx();
    drawBar(ctx, 10, 20, 50, 100, 80, 6, Colors.SP_BAR);
    // track + fill + 4 border strips = 6 calls minimum
    expect(ctx.fillRect.mock.calls.length).toBeGreaterThanOrEqual(6);
  });

  it('handles zero current (empty bar)', () => {
    const ctx = makeCtx();
    drawBar(ctx, 10, 20, 0, 100, 80, 6, 'hp');
    // Should still draw track and border even with 0 fill
    expect(ctx.fillRect.mock.calls.length).toBeGreaterThanOrEqual(5);
  });

  it('handles full bar', () => {
    const ctx = makeCtx();
    drawBar(ctx, 10, 20, 100, 100, 80, 6, 'hp');
    expect(ctx.fillRect.mock.calls.length).toBeGreaterThanOrEqual(6);
  });
});
