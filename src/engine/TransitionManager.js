/**
 * Screen transition effects per specs/ui-hud.md §8.
 * - Fade to black: 30 frames out -> callback -> 30 frames in
 * - Flash white: 8 frames (4 up + 4 down at 0.25 steps)
 * State machine: IDLE -> FADE_OUT -> BLACK -> FADE_IN -> IDLE
 *                IDLE -> FLASH -> IDLE
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT } from './Display.js';

export const TransitionState = {
  IDLE: 'idle',
  FADE_OUT: 'fadeOut',
  BLACK: 'black',
  FADE_IN: 'fadeIn',
  FLASH: 'flash',
};

const FADE_FRAMES = 30;
const FLASH_FRAMES = 8;

export class TransitionManager {
  constructor() {
    this.state = TransitionState.IDLE;
    this._frame = 0;
    this._alpha = 0;
    this._color = '#000';
    this._onMidpoint = null;
    this._onComplete = null;
  }

  get active() {
    return this.state !== TransitionState.IDLE;
  }

  get alpha() {
    return this._alpha;
  }

  fadeToBlack(onMidpoint, onComplete) {
    this.state = TransitionState.FADE_OUT;
    this._frame = 0;
    this._alpha = 0;
    this._color = '#000';
    this._onMidpoint = onMidpoint || null;
    this._onComplete = onComplete || null;
  }

  flashWhite(onComplete) {
    this.state = TransitionState.FLASH;
    this._frame = 0;
    this._alpha = 0;
    this._color = '#FFF';
    this._onMidpoint = null;
    this._onComplete = onComplete || null;
  }

  update() {
    if (this.state === TransitionState.IDLE) return;
    this._frame++;

    switch (this.state) {
      case TransitionState.FADE_OUT:
        this._alpha = Math.min(1, this._frame / FADE_FRAMES);
        if (this._frame >= FADE_FRAMES) {
          this._alpha = 1;
          this.state = TransitionState.BLACK;
          this._frame = 0;
          if (this._onMidpoint) this._onMidpoint();
        }
        break;

      case TransitionState.BLACK:
        this.state = TransitionState.FADE_IN;
        this._frame = 0;
        break;

      case TransitionState.FADE_IN:
        this._alpha = Math.max(0, 1 - this._frame / FADE_FRAMES);
        if (this._frame >= FADE_FRAMES) {
          this._alpha = 0;
          this.state = TransitionState.IDLE;
          if (this._onComplete) this._onComplete();
        }
        break;

      case TransitionState.FLASH:
        if (this._frame <= FLASH_FRAMES / 2) {
          this._alpha = this._frame * (1 / (FLASH_FRAMES / 2));
        } else {
          this._alpha = 1 - (this._frame - FLASH_FRAMES / 2) * (1 / (FLASH_FRAMES / 2));
        }
        if (this._frame >= FLASH_FRAMES) {
          this._alpha = 0;
          this.state = TransitionState.IDLE;
          if (this._onComplete) this._onComplete();
        }
        break;
    }
  }

  render(ctx) {
    if (this.state === TransitionState.IDLE || this._alpha <= 0) return;
    ctx.globalAlpha = this._alpha;
    ctx.fillStyle = this._color;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.globalAlpha = 1;
  }
}
