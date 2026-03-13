import { describe, it, expect, vi } from 'vitest';
import { TransitionManager, TransitionState } from '../TransitionManager.js';

describe('TransitionManager', () => {
  it('starts idle with alpha 0', () => {
    const tm = new TransitionManager();
    expect(tm.state).toBe(TransitionState.IDLE);
    expect(tm.alpha).toBe(0);
    expect(tm.active).toBe(false);
  });

  describe('fadeToBlack', () => {
    it('transitions through FADE_OUT -> BLACK -> FADE_IN -> IDLE', () => {
      const onMid = vi.fn();
      const onDone = vi.fn();
      const tm = new TransitionManager();

      tm.fadeToBlack(onMid, onDone);
      expect(tm.state).toBe(TransitionState.FADE_OUT);
      expect(tm.active).toBe(true);

      // Advance 30 frames for fade out
      for (let i = 0; i < 30; i++) tm.update();
      expect(tm.state).toBe(TransitionState.BLACK);
      expect(tm.alpha).toBe(1);
      expect(onMid).toHaveBeenCalledOnce();

      // One more frame transitions to FADE_IN
      tm.update();
      expect(tm.state).toBe(TransitionState.FADE_IN);

      // Advance 30 frames for fade in
      for (let i = 0; i < 30; i++) tm.update();
      expect(tm.state).toBe(TransitionState.IDLE);
      expect(tm.alpha).toBe(0);
      expect(onDone).toHaveBeenCalledOnce();
    });

    it('alpha increases linearly during fade out', () => {
      const tm = new TransitionManager();
      tm.fadeToBlack();

      tm.update(); // frame 1
      expect(tm.alpha).toBeCloseTo(1 / 30);

      for (let i = 0; i < 14; i++) tm.update(); // frame 15
      expect(tm.alpha).toBeCloseTo(15 / 30);
    });
  });

  describe('flashWhite', () => {
    it('completes in 8 frames', () => {
      const onDone = vi.fn();
      const tm = new TransitionManager();

      tm.flashWhite(onDone);
      expect(tm.state).toBe(TransitionState.FLASH);

      for (let i = 0; i < 8; i++) tm.update();
      expect(tm.state).toBe(TransitionState.IDLE);
      expect(tm.alpha).toBe(0);
      expect(onDone).toHaveBeenCalledOnce();
    });

    it('peaks at frame 4', () => {
      const tm = new TransitionManager();
      tm.flashWhite();

      for (let i = 0; i < 4; i++) tm.update();
      expect(tm.alpha).toBeCloseTo(1);
    });
  });

  describe('render', () => {
    it('does nothing when idle', () => {
      const tm = new TransitionManager();
      const ctx = { globalAlpha: 1, fillStyle: '', fillRect: vi.fn() };
      tm.render(ctx);
      expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('draws overlay when active', () => {
      const tm = new TransitionManager();
      const ctx = { globalAlpha: 1, fillStyle: '', fillRect: vi.fn() };
      tm.fadeToBlack();
      tm.update();
      tm.render(ctx);

      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 240, 160);
      expect(ctx.globalAlpha).toBe(1); // restored after render
    });
  });
});
