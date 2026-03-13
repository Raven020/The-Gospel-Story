/**
 * Fixed-timestep game loop with requestAnimationFrame.
 * Separates update(dt) from render() to ensure deterministic physics.
 * Target: ~60 FPS with delta-time accumulator.
 */

const FIXED_DT = 1 / 60;
const MAX_FRAME_TIME = 0.25; // cap to prevent spiral of death

export class GameLoop {
  constructor(updateFn, renderFn) {
    this._update = updateFn;
    this._render = renderFn;
    this._lastTime = 0;
    this._accumulator = 0;
    this._running = false;
    this._rafId = null;
    this.frameCount = 0;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._accumulator = 0;
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _tick(time) {
    if (!this._running) return;

    const elapsed = Math.min((time - this._lastTime) / 1000, MAX_FRAME_TIME);
    this._lastTime = time;
    this._accumulator += elapsed;

    while (this._accumulator >= FIXED_DT) {
      this._update(FIXED_DT);
      this._accumulator -= FIXED_DT;
      this.frameCount++;
    }

    this._render();
    this._rafId = requestAnimationFrame(this._tick);
  }
}

export { FIXED_DT };
