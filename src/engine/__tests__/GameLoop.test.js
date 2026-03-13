import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop, FIXED_DT } from '../GameLoop.js';

describe('GameLoop', () => {
  let mockRaf, mockCancel, mockPerf;

  beforeEach(() => {
    let rafCallbacks = [];
    let rafId = 0;
    mockRaf = vi.fn((cb) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });
    mockCancel = vi.fn();
    mockPerf = { now: vi.fn(() => 0) };

    vi.stubGlobal('requestAnimationFrame', mockRaf);
    vi.stubGlobal('cancelAnimationFrame', mockCancel);
    vi.stubGlobal('performance', mockPerf);

    // Helper to simulate a frame
    mockRaf._flush = (time) => {
      const cbs = rafCallbacks.splice(0);
      cbs.forEach((cb) => cb(time));
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exports FIXED_DT as 1/60', () => {
    expect(FIXED_DT).toBeCloseTo(1 / 60);
  });

  it('starts and calls requestAnimationFrame', () => {
    const loop = new GameLoop(() => {}, () => {});
    loop.start();
    expect(mockRaf).toHaveBeenCalledOnce();
  });

  it('does not start twice', () => {
    const loop = new GameLoop(() => {}, () => {});
    loop.start();
    loop.start();
    expect(mockRaf).toHaveBeenCalledOnce();
  });

  it('calls update with fixed dt and render each frame', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    mockPerf.now.mockReturnValue(0);
    loop.start();

    // Simulate one frame at exactly 1/60 second later
    mockRaf._flush(1000 / 60);

    expect(update).toHaveBeenCalledWith(FIXED_DT);
    expect(render).toHaveBeenCalledOnce();
    expect(loop.frameCount).toBe(1);
  });

  it('accumulates multiple updates for large dt', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    mockPerf.now.mockReturnValue(0);
    loop.start();

    // Simulate 2/60 second elapsed (should trigger 2 updates)
    mockRaf._flush(2000 / 60);

    expect(update).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenCalledOnce();
    expect(loop.frameCount).toBe(2);
  });

  it('caps frame time to prevent spiral of death', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    mockPerf.now.mockReturnValue(0);
    loop.start();

    // Simulate 1 full second elapsed (capped to 0.25s = ~15 updates)
    mockRaf._flush(1000);

    // Should be capped at 0.25 / (1/60) = 15 updates
    expect(update).toHaveBeenCalledTimes(15);
    expect(loop.frameCount).toBe(15);
  });

  it('stops cleanly', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    mockPerf.now.mockReturnValue(0);
    loop.start();
    loop.stop();

    expect(mockCancel).toHaveBeenCalled();

    // Flush after stop should not trigger updates
    update.mockClear();
    render.mockClear();
    mockRaf._flush(1000 / 60);
    expect(update).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
  });
});
