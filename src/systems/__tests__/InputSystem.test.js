import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputSystem, Actions, InputContext } from '../InputSystem.js';

// Minimal EventTarget for testing without DOM
class MockTarget {
  constructor() {
    this._listeners = {};
  }
  addEventListener(type, fn) {
    (this._listeners[type] = this._listeners[type] || []).push(fn);
  }
  removeEventListener(type, fn) {
    this._listeners[type] = (this._listeners[type] || []).filter((f) => f !== fn);
  }
  dispatch(type, key) {
    (this._listeners[type] || []).forEach((fn) =>
      fn({ key, preventDefault: vi.fn() })
    );
  }
}

describe('InputSystem', () => {
  let input, target;

  beforeEach(() => {
    input = new InputSystem();
    target = new MockTarget();
    input.attach(target);
    // Override _now for deterministic timing
    input._now = vi.fn(() => 0);
  });

  it('detects pressed on first frame of keydown', () => {
    target.dispatch('keydown', 'z');
    input.update(1 / 60);

    expect(input.pressed(Actions.CONFIRM)).toBe(true);
    expect(input.held(Actions.CONFIRM)).toBe(true);
  });

  it('pressed is only true for one frame', () => {
    target.dispatch('keydown', 'z');
    input.update(1 / 60);
    expect(input.pressed(Actions.CONFIRM)).toBe(true);

    input.update(1 / 60);
    expect(input.pressed(Actions.CONFIRM)).toBe(false);
    expect(input.held(Actions.CONFIRM)).toBe(true);
  });

  it('detects released on keyup', () => {
    target.dispatch('keydown', 'z');
    input.update(1 / 60);

    target.dispatch('keyup', 'z');
    input.update(1 / 60);

    expect(input.released(Actions.CONFIRM)).toBe(true);
    expect(input.held(Actions.CONFIRM)).toBe(false);
  });

  it('maps arrow keys to directions', () => {
    target.dispatch('keydown', 'ArrowUp');
    input.update(1 / 60);
    expect(input.pressed(Actions.UP)).toBe(true);
  });

  it('maps WASD to directions', () => {
    target.dispatch('keydown', 'w');
    input.update(1 / 60);
    expect(input.pressed(Actions.UP)).toBe(true);
  });

  it('maps Enter to START', () => {
    target.dispatch('keydown', 'Enter');
    input.update(1 / 60);
    expect(input.pressed(Actions.START)).toBe(true);
  });

  it('keeps action held if another key for same action is still down', () => {
    target.dispatch('keydown', 'ArrowUp');
    target.dispatch('keydown', 'w');
    input.update(1 / 60);

    target.dispatch('keyup', 'ArrowUp');
    input.update(1 / 60);

    expect(input.held(Actions.UP)).toBe(true);
    expect(input.released(Actions.UP)).toBe(false);
  });

  it('anyDirectionalPressed returns true when directional key pressed', () => {
    target.dispatch('keydown', 'ArrowLeft');
    input.update(1 / 60);
    expect(input.anyDirectionalPressed()).toBe(true);
  });

  it('anyDirectionalPressed returns false for non-directional', () => {
    target.dispatch('keydown', 'z');
    input.update(1 / 60);
    expect(input.anyDirectionalPressed()).toBe(false);
  });

  it('getDirectionalPressed returns the pressed direction', () => {
    target.dispatch('keydown', 'ArrowDown');
    input.update(1 / 60);
    expect(input.getDirectionalPressed()).toBe(Actions.DOWN);
  });

  it('getDirectionalHeld returns held direction', () => {
    target.dispatch('keydown', 'ArrowRight');
    input.update(1 / 60);
    input.update(1 / 60);
    expect(input.getDirectionalHeld()).toBe(Actions.RIGHT);
  });

  describe('input buffer', () => {
    it('stores last pressed action', () => {
      target.dispatch('keydown', 'z');
      input.update(1 / 60);

      expect(input.consumeBuffer()).toBe(Actions.CONFIRM);
      expect(input.consumeBuffer()).toBeNull();
    });

    it('expires after 100ms', () => {
      target.dispatch('keydown', 'z');
      input._now.mockReturnValue(0);
      input.update(1 / 60);

      input._now.mockReturnValue(101);
      input.update(1 / 60);

      expect(input.consumeBuffer()).toBeNull();
    });
  });

  describe('menu key repeat', () => {
    it('fires repeat after initial delay then at repeat rate', () => {
      input.context = InputContext.MENU;
      const dt = 1 / 60;

      target.dispatch('keydown', 'ArrowDown');
      input.update(dt); // frame 1: pressed
      expect(input.pressed(Actions.DOWN)).toBe(true);

      // Hold for initial delay (300ms = 18 accumulation frames at 60fps)
      // Frame 2 starts tracking, frames 3+ accumulate timer
      for (let i = 0; i < 18; i++) input.update(dt);
      expect(input.pressed(Actions.DOWN)).toBe(false);

      input.update(dt); // frame 20: timer ~300ms, triggers repeat
      expect(input.pressed(Actions.DOWN)).toBe(true);

      // Then repeat at 100ms rate (~6 frames)
      for (let i = 0; i < 5; i++) input.update(dt);
      expect(input.pressed(Actions.DOWN)).toBe(false);

      input.update(dt); // ~100ms later
      expect(input.pressed(Actions.DOWN)).toBe(true);
    });

    it('does not repeat in overworld context', () => {
      input.context = InputContext.OVERWORLD;
      const dt = 1 / 60;

      target.dispatch('keydown', 'ArrowDown');
      input.update(dt);
      expect(input.pressed(Actions.DOWN)).toBe(true);

      for (let i = 0; i < 30; i++) input.update(dt);
      expect(input.pressed(Actions.DOWN)).toBe(false);
    });
  });

  it('detach removes listeners', () => {
    input.detach(target);
    target.dispatch('keydown', 'z');
    input.update(1 / 60);
    expect(input.pressed(Actions.CONFIRM)).toBe(false);
  });
});
