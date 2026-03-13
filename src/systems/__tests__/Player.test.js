import { describe, it, expect, vi } from 'vitest';
import { Player } from '../Player.js';
import { Actions } from '../InputSystem.js';

describe('Player', () => {
  it('initializes at correct tile and pixel position', () => {
    const p = new Player(5, 3);
    expect(p.tileX).toBe(5);
    expect(p.tileY).toBe(3);
    expect(p.pixelX).toBe(80); // 5 * 16
    expect(p.pixelY).toBe(48); // 3 * 16
    expect(p.facing).toBe(Actions.DOWN);
    expect(p.moving).toBe(false);
  });

  it('moves to adjacent tile when not blocked', () => {
    const p = new Player(5, 5);
    const neverBlocked = () => false;

    const started = p.tryMove(Actions.RIGHT, neverBlocked);
    expect(started).toBe(true);
    expect(p.moving).toBe(true);
    expect(p.facing).toBe(Actions.RIGHT);
  });

  it('does not move when blocked', () => {
    const p = new Player(5, 5);
    const alwaysBlocked = () => true;

    const started = p.tryMove(Actions.RIGHT, alwaysBlocked);
    expect(started).toBe(false);
    expect(p.moving).toBe(false);
    expect(p.facing).toBe(Actions.RIGHT); // facing still updates
  });

  it('cannot start new movement while already moving', () => {
    const p = new Player(5, 5);
    p.tryMove(Actions.RIGHT, () => false);
    const second = p.tryMove(Actions.UP, () => false);
    expect(second).toBe(false);
  });

  it('arrives at target tile after enough updates', () => {
    const p = new Player(5, 5);
    p.tryMove(Actions.RIGHT, () => false);

    // Move at 128 px/s, dt=1/60 -> ~2.13px/frame. 16px / 2.13 ≈ 8 frames.
    // Step frame by frame until arrived.
    let arrivedFrame = -1;
    for (let i = 0; i < 20; i++) {
      p.update(1 / 60);
      if (!p.moving && arrivedFrame < 0) {
        arrivedFrame = i;
        break;
      }
    }

    expect(arrivedFrame).toBeGreaterThan(0);
    expect(p.moving).toBe(false);
    expect(p.tileX).toBe(6);
    expect(p.tileY).toBe(5);
    expect(p.pixelX).toBe(96);
    expect(p.pixelY).toBe(80);
    expect(p.justArrived).toBe(true);
  });

  it('justArrived is only true for one frame', () => {
    const p = new Player(5, 5);
    p.tryMove(Actions.RIGHT, () => false);

    // Advance until arrived
    for (let i = 0; i < 20; i++) {
      p.update(1 / 60);
      if (p.justArrived) break;
    }
    expect(p.justArrived).toBe(true);

    p.update(1 / 60);
    expect(p.justArrived).toBe(false);
  });

  it('getFacingTile returns adjacent tile in facing direction', () => {
    const p = new Player(5, 5, Actions.UP);
    expect(p.getFacingTile()).toEqual({ x: 5, y: 4 });

    p.facing = Actions.LEFT;
    expect(p.getFacingTile()).toEqual({ x: 4, y: 5 });
  });

  it('teleport sets position immediately', () => {
    const p = new Player(0, 0);
    p.teleport(10, 7);
    expect(p.tileX).toBe(10);
    expect(p.tileY).toBe(7);
    expect(p.pixelX).toBe(160);
    expect(p.pixelY).toBe(112);
    expect(p.moving).toBe(false);
  });

  it('moves up correctly', () => {
    const p = new Player(5, 5);
    p.tryMove(Actions.UP, () => false);
    for (let i = 0; i < 20; i++) p.update(1 / 60);
    expect(p.tileX).toBe(5);
    expect(p.tileY).toBe(4);
  });

  it('moves down correctly', () => {
    const p = new Player(5, 5);
    p.tryMove(Actions.DOWN, () => false);
    for (let i = 0; i < 20; i++) p.update(1 / 60);
    expect(p.tileX).toBe(5);
    expect(p.tileY).toBe(6);
  });

  it('moves left correctly', () => {
    const p = new Player(5, 5);
    p.tryMove(Actions.LEFT, () => false);
    for (let i = 0; i < 20; i++) p.update(1 / 60);
    expect(p.tileX).toBe(4);
    expect(p.tileY).toBe(5);
  });
});
