import { describe, it, expect, vi } from 'vitest';
import { NPC, NPCManager } from '../NPCManager.js';
import { Actions } from '../InputSystem.js';

describe('NPC', () => {
  it('initializes from definition', () => {
    const npc = new NPC({
      id: 'test',
      sprite: 'villager',
      x: 3,
      y: 5,
      facing: 'down',
      dialogue: 'dlg_test',
      movement: 'static',
    });

    expect(npc.id).toBe('test');
    expect(npc.tileX).toBe(3);
    expect(npc.tileY).toBe(5);
    expect(npc.facing).toBe(Actions.DOWN);
    expect(npc.pixelX).toBe(48);
    expect(npc.pixelY).toBe(80);
  });

  it('faceToward turns to face a target', () => {
    const npc = new NPC({
      id: 'test', sprite: 's', x: 5, y: 5, facing: 'down', dialogue: 'd', movement: 'static',
    });

    npc.faceToward(5, 3); // target above
    expect(npc.facing).toBe(Actions.UP);

    npc.faceToward(3, 5); // target left
    expect(npc.facing).toBe(Actions.LEFT);

    npc.faceToward(7, 5); // target right
    expect(npc.facing).toBe(Actions.RIGHT);

    npc.faceToward(5, 7); // target below
    expect(npc.facing).toBe(Actions.DOWN);
  });

  it('static NPC does not move', () => {
    const npc = new NPC({
      id: 'test', sprite: 's', x: 5, y: 5, facing: 'down', dialogue: 'd', movement: 'static',
    });

    for (let i = 0; i < 100; i++) npc.update(1 / 60, () => false);
    expect(npc.tileX).toBe(5);
    expect(npc.tileY).toBe(5);
  });

  it('wandering NPC attempts to move after interval', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // always pick first direction after shuffle
    const npc = new NPC({
      id: 'test', sprite: 's', x: 5, y: 5, facing: 'down', dialogue: 'd',
      movement: { type: 'wander', radius: 3, intervalMs: 1000 },
    });

    // Not enough time
    npc.update(0.5, () => false);
    expect(npc.isMoving).toBe(false);

    // Enough time - should start moving
    npc.update(0.6, () => false);
    expect(npc.isMoving).toBe(true);

    vi.restoreAllMocks();
  });

  it('wandering NPC respects radius', () => {
    // Force the NPC to try only UP direction
    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      return 0; // deterministic shuffle
    });

    const npc = new NPC({
      id: 'test', sprite: 's', x: 5, y: 5, facing: 'down', dialogue: 'd',
      movement: { type: 'wander', radius: 0, intervalMs: 100 },
    });

    // With radius 0, NPC cannot move at all
    npc.update(0.2, () => false);
    expect(npc.isMoving).toBe(false);

    vi.restoreAllMocks();
  });
});

describe('NPCManager', () => {
  it('loads NPCs from map', () => {
    const mgr = new NPCManager();
    mgr.loadFromMap({
      npcs: [
        { id: 'a', sprite: 's', x: 1, y: 1, facing: 'down', dialogue: 'd', movement: 'static' },
        { id: 'b', sprite: 's', x: 3, y: 3, facing: 'up', dialogue: 'd', movement: 'static' },
      ],
    });
    expect(mgr.npcs).toHaveLength(2);
  });

  it('isNPCAt returns true when NPC occupies tile', () => {
    const mgr = new NPCManager();
    mgr.loadFromMap({
      npcs: [
        { id: 'a', sprite: 's', x: 5, y: 3, facing: 'down', dialogue: 'd', movement: 'static' },
      ],
    });
    expect(mgr.isNPCAt(5, 3)).toBe(true);
    expect(mgr.isNPCAt(5, 4)).toBe(false);
  });

  it('getNPCAt returns the NPC object', () => {
    const mgr = new NPCManager();
    mgr.loadFromMap({
      npcs: [
        { id: 'elder', sprite: 's', x: 7, y: 2, facing: 'left', dialogue: 'd', movement: 'static' },
      ],
    });
    const npc = mgr.getNPCAt(7, 2);
    expect(npc).not.toBeNull();
    expect(npc.id).toBe('elder');
    expect(mgr.getNPCAt(0, 0)).toBeNull();
  });

  it('NPCs block each other during wandering', () => {
    const mgr = new NPCManager();
    mgr.loadFromMap({
      npcs: [
        { id: 'a', sprite: 's', x: 5, y: 5, facing: 'down', dialogue: 'd', movement: 'static' },
        { id: 'b', sprite: 's', x: 5, y: 6, facing: 'up', dialogue: 'd', movement: 'static' },
      ],
    });
    // NPC 'a' at (5,5), NPC 'b' at (5,6)
    expect(mgr.isNPCAt(5, 5)).toBe(true);
    expect(mgr.isNPCAt(5, 6)).toBe(true);
  });
});
