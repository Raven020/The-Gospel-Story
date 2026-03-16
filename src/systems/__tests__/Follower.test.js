import { describe, it, expect } from 'vitest';
import { Follower } from '../Follower.js';
import { Actions } from '../InputSystem.js';

describe('Follower', () => {
  it('initializes at given tile position', () => {
    const f = new Follower('mary', 5, 10, Actions.DOWN);
    expect(f.spriteKey).toBe('mary');
    expect(f.tileX).toBe(5);
    expect(f.tileY).toBe(10);
    expect(f.pixelX).toBe(5 * 16);
    expect(f.pixelY).toBe(10 * 16);
    expect(f.facing).toBe(Actions.DOWN);
    expect(f.visible).toBe(true);
  });

  it('does not move without breadcrumbs', () => {
    const f = new Follower('mary', 5, 10, Actions.DOWN);
    f.update(1 / 60);
    expect(f.tileX).toBe(5);
    expect(f.tileY).toBe(10);
    expect(f.moving).toBe(false);
  });

  it('follows player breadcrumbs with 1-tile delay', () => {
    const f = new Follower('mary', 5, 10, Actions.DOWN);

    // Player moves from (5,9) to (5,8), leaving breadcrumb at (5,9)
    f.onPlayerMove(5, 9, Actions.UP);

    // Follower should start moving toward (5,9)
    f.update(0.001);
    expect(f.moving).toBe(true);
    expect(f.facing).toBe(Actions.UP);

    // Complete the move with a large dt
    f.update(10);
    expect(f.tileX).toBe(5);
    expect(f.tileY).toBe(9);
    expect(f.moving).toBe(false);
  });

  it('queues multiple breadcrumbs', () => {
    const f = new Follower('mary', 5, 10, Actions.DOWN);

    f.onPlayerMove(5, 9, Actions.UP);
    f.onPlayerMove(5, 8, Actions.UP);

    // First breadcrumb: dequeue then move
    f.update(0.001); // dequeue and start moving
    f.update(10);    // complete move
    expect(f.tileX).toBe(5);
    expect(f.tileY).toBe(9);

    // Second breadcrumb: dequeue then move
    f.update(0.001); // dequeue and start moving
    f.update(10);    // complete move
    expect(f.tileX).toBe(5);
    expect(f.tileY).toBe(8);
  });

  it('teleport clears breadcrumbs', () => {
    const f = new Follower('mary', 5, 10, Actions.DOWN);
    f.onPlayerMove(5, 9, Actions.UP);
    f.onPlayerMove(5, 8, Actions.UP);

    f.teleport(20, 20, Actions.LEFT);
    expect(f.tileX).toBe(20);
    expect(f.tileY).toBe(20);
    expect(f.facing).toBe(Actions.LEFT);
    expect(f.moving).toBe(false);

    // Breadcrumbs should be cleared
    f.update(10);
    expect(f.tileX).toBe(20);
    expect(f.tileY).toBe(20);
  });

  it('does not update when not visible', () => {
    const f = new Follower('mary', 5, 10, Actions.DOWN);
    f.onPlayerMove(5, 9, Actions.UP);
    f.visible = false;
    f.update(10);
    expect(f.tileX).toBe(5);
    expect(f.tileY).toBe(10);
  });

  it('updates facing direction from breadcrumbs', () => {
    const f = new Follower('mary', 5, 10, Actions.DOWN);
    f.onPlayerMove(6, 10, Actions.RIGHT);
    f.update(10);
    expect(f.facing).toBe(Actions.RIGHT);
  });
});
