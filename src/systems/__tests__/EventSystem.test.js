import { describe, it, expect, vi } from 'vitest';
import { EventSystem } from '../EventSystem.js';

/**
 * Minimal mocks matching the real system interfaces.
 */
function makePlayer(tileX = 5, tileY = 5) {
  return {
    tileX,
    tileY,
    pixelX: tileX * 16,
    pixelY: tileY * 16,
    facing: 'down',
    moving: false,
    _targetTileX: tileX,
    _targetTileY: tileY,
    _targetPixelX: tileX * 16,
    _targetPixelY: tileY * 16,
    teleport(x, y) {
      this.tileX = x;
      this.tileY = y;
      this.pixelX = x * 16;
      this.pixelY = y * 16;
      this._targetTileX = x;
      this._targetTileY = y;
      this._targetPixelX = x * 16;
      this._targetPixelY = y * 16;
      this.moving = false;
    },
  };
}

function makeNPCManager(npcs = []) {
  return { npcs: [...npcs] };
}

function makeDialogueSystem() {
  let open = false;
  return {
    get isOpen() { return open; },
    open() { open = true; },
    close() { open = false; },
    _setOpen(val) { open = val; },
    update() {},
  };
}

function makeCamera() {
  return { x: 0, y: 0, follow() {} };
}

function makeTransitions() {
  return {
    active: false,
    state: 'idle',
    _frame: 0,
    _alpha: 0,
    _color: '#000',
    _onMidpoint: null,
    _onComplete: null,
    fadeToBlack(onMid, onComplete) {
      this.active = true;
      this._onMidpoint = onMid;
      this._onComplete = onComplete;
    },
    fadeIn(onComplete) {
      this.active = true;
      this._onComplete = onComplete;
    },
    flashWhite(onComplete) {
      this.active = true;
      this._onComplete = onComplete;
    },
    update() {},
  };
}

function createEventSystem(overrides = {}) {
  const player = overrides.player || makePlayer();
  const npcManager = overrides.npcManager || makeNPCManager();
  const dialogueSystem = overrides.dialogueSystem || makeDialogueSystem();
  const camera = overrides.camera || makeCamera();
  const transitions = overrides.transitions || makeTransitions();
  const questFlags = overrides.questFlags || {};

  return new EventSystem({
    player,
    npcManager,
    dialogueSystem,
    camera,
    transitions,
    questFlags,
  });
}

describe('EventSystem', () => {
  it('starts inactive', () => {
    const es = createEventSystem();
    expect(es.isActive()).toBe(false);
    expect(es.active).toBe(false);
  });

  it('startEvent sets active', () => {
    const es = createEventSystem();
    es.startEvent([{ type: 'wait', frames: 10 }]);
    expect(es.isActive()).toBe(true);
    expect(es.active).toBe(true);
  });

  it('wait command completes after specified frames', () => {
    const es = createEventSystem();
    es.startEvent([{ type: 'wait', frames: 3 }]);

    expect(es.isActive()).toBe(true);
    es.update(1 / 60); // frame 1: framesLeft 3 -> 2
    expect(es.isActive()).toBe(true);
    es.update(1 / 60); // frame 2: framesLeft 2 -> 1
    expect(es.isActive()).toBe(true);
    es.update(1 / 60); // frame 3: framesLeft 1 -> 0, done
    expect(es.isActive()).toBe(false);
  });

  it('setFlag command sets flag immediately', () => {
    const questFlags = {};
    const es = createEventSystem({ questFlags });
    es.startEvent([{ type: 'setFlag', flag: 'metPeter', value: true }]);

    // setFlag is instant, should already be set and event done
    expect(questFlags.metPeter).toBe(true);
    expect(es.isActive()).toBe(false);
  });

  it('dialogue command waits for dialogue to close', () => {
    const dialogueSystem = makeDialogueSystem();
    const es = createEventSystem({ dialogueSystem });

    const dialogueData = { start: { speaker: 'Test', text: 'Hello', next: null } };
    es.startEvent([{ type: 'dialogue', data: dialogueData }]);

    expect(es.isActive()).toBe(true);
    expect(dialogueSystem.isOpen).toBe(true);

    // Update while dialogue is still open
    es.update(1 / 60);
    expect(es.isActive()).toBe(true);

    // Close dialogue externally
    dialogueSystem._setOpen(false);
    es.update(1 / 60);
    expect(es.isActive()).toBe(false);
  });

  it('teleportPlayer moves player', () => {
    const player = makePlayer(5, 5);
    const es = createEventSystem({ player });

    es.startEvent([{ type: 'teleportPlayer', x: 10, y: 12 }]);

    // Instant command
    expect(player.tileX).toBe(10);
    expect(player.tileY).toBe(12);
    expect(player.pixelX).toBe(160);
    expect(player.pixelY).toBe(192);
    expect(es.isActive()).toBe(false);
  });

  it('commands execute sequentially', () => {
    const questFlags = {};
    const es = createEventSystem({ questFlags });

    es.startEvent([
      { type: 'setFlag', flag: 'step1', value: 1 },
      { type: 'setFlag', flag: 'step2', value: 2 },
      { type: 'setFlag', flag: 'step3', value: 3 },
    ]);

    // All setFlag are instant, they chain immediately
    expect(questFlags.step1).toBe(1);
    expect(questFlags.step2).toBe(2);
    expect(questFlags.step3).toBe(3);
    expect(es.isActive()).toBe(false);
  });

  it('callback command runs function', () => {
    const fn = vi.fn();
    const es = createEventSystem();

    es.startEvent([{ type: 'callback', fn }]);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(es.isActive()).toBe(false);
  });

  it('isActive returns false after all commands complete', () => {
    const es = createEventSystem();

    es.startEvent([
      { type: 'wait', frames: 1 },
    ]);

    expect(es.isActive()).toBe(true);
    es.update(1 / 60); // framesLeft 1 -> 0
    expect(es.isActive()).toBe(false);
  });

  it('sequential mix of instant and timed commands', () => {
    const questFlags = {};
    const es = createEventSystem({ questFlags });

    es.startEvent([
      { type: 'setFlag', flag: 'before', value: true },
      { type: 'wait', frames: 2 },
      { type: 'setFlag', flag: 'after', value: true },
    ]);

    // setFlag is instant, then wait starts
    expect(questFlags.before).toBe(true);
    expect(questFlags.after).toBeUndefined();
    expect(es.isActive()).toBe(true);

    es.update(1 / 60); // frame 1
    expect(questFlags.after).toBeUndefined();

    es.update(1 / 60); // frame 2 - wait done, setFlag executes
    expect(questFlags.after).toBe(true);
    expect(es.isActive()).toBe(false);
  });

  it('spawnNPC adds an NPC and removeNPC removes it', () => {
    const npcManager = makeNPCManager();
    const es = createEventSystem({ npcManager });

    es.startEvent([
      { type: 'spawnNPC', npcId: 'angel', sprite: 'angel', x: 3, y: 4 },
    ]);

    expect(npcManager.npcs.length).toBe(1);
    expect(npcManager.npcs[0].id).toBe('angel');
    expect(npcManager.npcs[0].tileX).toBe(3);
    expect(npcManager.npcs[0].tileY).toBe(4);

    es.startEvent([
      { type: 'removeNPC', npcId: 'angel' },
    ]);

    expect(npcManager.npcs.length).toBe(0);
  });

  it('moveNPC moves NPC along path', () => {
    const npc = {
      id: 'peter',
      tileX: 1,
      tileY: 1,
      pixelX: 16,
      pixelY: 16,
      facing: 'down',
      _isMoving: false,
      _targetTileX: 1,
      _targetTileY: 1,
    };
    const npcManager = makeNPCManager([npc]);
    const es = createEventSystem({ npcManager });

    es.startEvent([
      { type: 'moveNPC', npcId: 'peter', path: [{ x: 2, y: 1 }] },
    ]);

    expect(es.isActive()).toBe(true);

    // Simulate enough frames to complete (1 tile = 16px at 128 px/s)
    const dt = 1 / 60;
    for (let i = 0; i < 60; i++) {
      if (!es.isActive()) break;
      es.update(dt);
    }

    expect(npc.tileX).toBe(2);
    expect(npc.tileY).toBe(1);
    expect(es.isActive()).toBe(false);
  });

  it('moveNPC skips when NPC not found', () => {
    const npcManager = makeNPCManager([]);
    const es = createEventSystem({ npcManager });

    es.startEvent([
      { type: 'moveNPC', npcId: 'ghost', path: [{ x: 2, y: 1 }] },
    ]);

    expect(es.isActive()).toBe(false);
  });

  it('movePlayer moves player along path', () => {
    const player = makePlayer(5, 5);
    const es = createEventSystem({ player });

    es.startEvent([
      { type: 'movePlayer', path: [{ x: 6, y: 5 }] },
    ]);

    expect(es.isActive()).toBe(true);

    const dt = 1 / 60;
    for (let i = 0; i < 60; i++) {
      if (!es.isActive()) break;
      es.update(dt);
    }

    expect(player.tileX).toBe(6);
    expect(player.tileY).toBe(5);
    expect(es.isActive()).toBe(false);
  });

  it('movePlayer skips when path is empty', () => {
    const player = makePlayer(5, 5);
    const es = createEventSystem({ player });

    es.startEvent([
      { type: 'movePlayer', path: [] },
    ]);

    expect(es.isActive()).toBe(false);
  });

  it('fadeOut command waits for transition to complete', () => {
    const transitions = makeTransitions();
    const es = createEventSystem({ transitions });

    es.startEvent([{ type: 'fadeOut' }]);

    expect(es.isActive()).toBe(true);
    expect(transitions.active).toBe(true);

    es.update(1 / 60);
    expect(es.isActive()).toBe(true);

    // Simulate transition completing
    transitions._onComplete();
    es.update(1 / 60);
    expect(es.isActive()).toBe(false);
  });

  it('fadeIn command waits for transition to complete', () => {
    const transitions = makeTransitions();
    const es = createEventSystem({ transitions });

    es.startEvent([{ type: 'fadeIn' }]);

    expect(es.isActive()).toBe(true);
    expect(transitions.active).toBe(true);

    // Simulate transition completing
    transitions._onComplete();
    es.update(1 / 60);
    expect(es.isActive()).toBe(false);
  });

  it('flash command waits for transition to complete', () => {
    const transitions = makeTransitions();
    const es = createEventSystem({ transitions });

    es.startEvent([{ type: 'flash' }]);

    expect(es.isActive()).toBe(true);
    expect(transitions.active).toBe(true);

    // Simulate transition completing
    transitions._onComplete();
    es.update(1 / 60);
    expect(es.isActive()).toBe(false);
  });

  it('panCamera moves camera override to target', () => {
    const camera = makeCamera();
    const es = createEventSystem({ camera });

    es.startEvent([{ type: 'panCamera', x: 100, y: 100, speed: 200 }]);

    expect(es.isActive()).toBe(true);

    // Update enough to reach target
    const dt = 1 / 60;
    for (let i = 0; i < 120; i++) {
      if (!es.isActive()) break;
      es.update(dt);
    }

    expect(es.isActive()).toBe(false);
  });

  it('returnCamera clears camera override', () => {
    const camera = makeCamera();
    const es = createEventSystem({ camera });

    // Start with a pan to set override
    es.startEvent([
      { type: 'panCamera', x: 50, y: 50, speed: 1000 },
    ]);
    for (let i = 0; i < 60; i++) {
      if (!es.isActive()) break;
      es.update(1 / 60);
    }

    // Now return camera
    es.startEvent([{ type: 'returnCamera' }]);
    expect(es._cameraOverride).toBeNull();
    expect(es.isActive()).toBe(false);
  });

  it('unknown command is skipped', () => {
    const es = createEventSystem();
    es.startEvent([
      { type: 'unknownCommand' },
      { type: 'wait', frames: 1 },
    ]);

    // Unknown was skipped, now on wait
    expect(es.isActive()).toBe(true);
    es.update(1 / 60);
    expect(es.isActive()).toBe(false);
  });

  it('teleportNPC moves NPC to position', () => {
    const npc = {
      id: 'peter',
      tileX: 1,
      tileY: 1,
      pixelX: 16,
      pixelY: 16,
      _isMoving: false,
    };
    const npcManager = makeNPCManager([npc]);
    const es = createEventSystem({ npcManager });

    es.startEvent([
      { type: 'teleportNPC', npcId: 'peter', x: 8, y: 9 },
    ]);

    expect(npc.tileX).toBe(8);
    expect(npc.tileY).toBe(9);
    expect(npc.pixelX).toBe(128);
    expect(npc.pixelY).toBe(144);
  });
});
