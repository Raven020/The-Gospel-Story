/**
 * Input system per specs/input-system.md.
 * GBA-style mappings: arrows/WASD, Z=confirm, X=cancel, Enter=start, Shift=select.
 * Per-frame pressed/held/released states. 100ms input buffer. Menu key repeat.
 */

export const Actions = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  START: 'start',
  SELECT: 'select',
};

export const InputContext = {
  OVERWORLD: 'overworld',
  DIALOGUE: 'dialogue',
  MENU: 'menu',
  BATTLE: 'battle',
};

const KEY_MAP = {
  ArrowUp: Actions.UP,
  ArrowDown: Actions.DOWN,
  ArrowLeft: Actions.LEFT,
  ArrowRight: Actions.RIGHT,
  w: Actions.UP,
  W: Actions.UP,
  a: Actions.LEFT,
  A: Actions.LEFT,
  s: Actions.DOWN,
  S: Actions.DOWN,
  d: Actions.RIGHT,
  D: Actions.RIGHT,
  z: Actions.CONFIRM,
  Z: Actions.CONFIRM,
  x: Actions.CANCEL,
  X: Actions.CANCEL,
  Enter: Actions.START,
  Shift: Actions.SELECT,
};

const MAPPED_KEYS = new Set(Object.keys(KEY_MAP));
const DIRECTIONAL = new Set([Actions.UP, Actions.DOWN, Actions.LEFT, Actions.RIGHT]);
const BUFFER_DURATION_MS = 100;
const REPEAT_INITIAL_MS = 300;
const REPEAT_RATE_MS = 100;

export class InputSystem {
  constructor() {
    this._rawDown = new Set();
    this._actionsDown = new Set();
    this._pressed = new Set();
    this._released = new Set();
    this._prevDown = new Set();

    this._buffer = null;
    this._bufferTimestamp = 0;

    this._repeatAction = null;
    this._repeatTimer = 0;
    this._repeatInitial = true;

    this.context = InputContext.OVERWORLD;
    this._now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();

    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
  }

  attach(target) {
    (target || globalThis).addEventListener('keydown', this._handleKeyDown);
    (target || globalThis).addEventListener('keyup', this._handleKeyUp);
  }

  detach(target) {
    (target || globalThis).removeEventListener('keydown', this._handleKeyDown);
    (target || globalThis).removeEventListener('keyup', this._handleKeyUp);
  }

  _handleKeyDown(e) {
    if (!MAPPED_KEYS.has(e.key)) return;
    e.preventDefault();
    this._rawDown.add(e.key);
    this._actionsDown.add(KEY_MAP[e.key]);
  }

  _handleKeyUp(e) {
    if (!MAPPED_KEYS.has(e.key)) return;
    e.preventDefault();
    this._rawDown.delete(e.key);
    const action = KEY_MAP[e.key];
    const stillDown = [...this._rawDown].some((k) => KEY_MAP[k] === action);
    if (!stillDown) {
      this._actionsDown.delete(action);
    }
  }

  update(dt) {
    this._pressed.clear();
    this._released.clear();

    for (const action of this._actionsDown) {
      if (!this._prevDown.has(action)) {
        this._pressed.add(action);
        this._buffer = action;
        this._bufferTimestamp = this._now();
      }
    }

    for (const action of this._prevDown) {
      if (!this._actionsDown.has(action)) {
        this._released.add(action);
      }
    }

    // Menu key repeat for directional keys
    if (this.context === InputContext.MENU) {
      const heldDir = [Actions.UP, Actions.DOWN, Actions.LEFT, Actions.RIGHT].find(
        (a) => this._actionsDown.has(a) && this._prevDown.has(a)
      );

      if (heldDir) {
        if (this._repeatAction === heldDir) {
          this._repeatTimer += dt * 1000;
          const threshold = this._repeatInitial ? REPEAT_INITIAL_MS : REPEAT_RATE_MS;
          if (this._repeatTimer >= threshold) {
            this._pressed.add(heldDir);
            this._repeatTimer = 0;
            this._repeatInitial = false;
          }
        } else {
          this._repeatAction = heldDir;
          this._repeatTimer = 0;
          this._repeatInitial = true;
        }
      } else {
        this._repeatAction = null;
        this._repeatTimer = 0;
        this._repeatInitial = true;
      }
    } else {
      this._repeatAction = null;
      this._repeatTimer = 0;
      this._repeatInitial = true;
    }

    // Expire buffer
    if (this._buffer && this._now() - this._bufferTimestamp > BUFFER_DURATION_MS) {
      this._buffer = null;
    }

    // Save prev state
    this._prevDown.clear();
    for (const a of this._actionsDown) this._prevDown.add(a);
  }

  pressed(action) {
    return this._pressed.has(action);
  }

  held(action) {
    return this._actionsDown.has(action);
  }

  released(action) {
    return this._released.has(action);
  }

  consumeBuffer() {
    const b = this._buffer;
    this._buffer = null;
    return b;
  }

  anyDirectionalPressed() {
    return (
      this._pressed.has(Actions.UP) ||
      this._pressed.has(Actions.DOWN) ||
      this._pressed.has(Actions.LEFT) ||
      this._pressed.has(Actions.RIGHT)
    );
  }

  getDirectionalPressed() {
    for (const dir of [Actions.UP, Actions.DOWN, Actions.LEFT, Actions.RIGHT]) {
      if (this._pressed.has(dir)) return dir;
    }
    return null;
  }

  getDirectionalHeld() {
    for (const dir of [Actions.UP, Actions.DOWN, Actions.LEFT, Actions.RIGHT]) {
      if (this._actionsDown.has(dir)) return dir;
    }
    return null;
  }
}
