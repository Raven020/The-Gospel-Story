import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TitleScene } from '../TitleScene.js';
import { Actions, InputContext } from '../../systems/InputSystem.js';
import { GameState } from '../../systems/GameState.js';

// Mock localStorage for GameState.hasSave
const mockStorage = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key) => mockStorage[key] || null),
  setItem: vi.fn((key, val) => { mockStorage[key] = val; }),
  removeItem: vi.fn((key) => { delete mockStorage[key]; }),
});

function createMockInput() {
  const pressedSet = new Set();
  return {
    context: InputContext.OVERWORLD,
    pressed: vi.fn((action) => pressedSet.has(action)),
    held: vi.fn(() => false),
    _pressedSet: pressedSet,
  };
}

function createMockCtx() {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
  };
}

describe('TitleScene', () => {
  let scene, input, sceneManager, onNewGame, onContinue;
  let frameCount;

  beforeEach(() => {
    // Clear mock storage
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);

    input = createMockInput();
    sceneManager = { switch: vi.fn() };
    onNewGame = vi.fn();
    onContinue = vi.fn();
    frameCount = 0;

    scene = new TitleScene({
      input,
      sceneManager,
      frameCountFn: () => frameCount,
      onNewGame,
      onContinue,
    });
  });

  it('constructor initializes correctly', () => {
    expect(scene._phase).toBe(0); // PHASE_PRESS_START
    expect(scene._cursor).toBe(0);
    expect(scene._input).toBe(input);
    expect(scene._sceneManager).toBe(sceneManager);
    expect(scene._onNewGame).toBe(onNewGame);
    expect(scene._onContinue).toBe(onContinue);
  });

  it('enter() sets input context to MENU', () => {
    input.context = InputContext.OVERWORLD;
    scene.enter();
    expect(input.context).toBe(InputContext.MENU);
  });

  it('enter() resets phase and cursor', () => {
    scene._phase = 1;
    scene._cursor = 1;
    scene.enter();
    expect(scene._phase).toBe(0);
    expect(scene._cursor).toBe(0);
  });

  it('pressing start transitions from press-start to menu', () => {
    scene.enter();
    expect(scene._phase).toBe(0);

    input._pressedSet.add(Actions.START);
    scene.update(1 / 60);
    expect(scene._phase).toBe(1); // PHASE_MENU
  });

  it('pressing confirm also transitions from press-start to menu', () => {
    scene.enter();
    input._pressedSet.add(Actions.CONFIRM);
    scene.update(1 / 60);
    expect(scene._phase).toBe(1);
  });

  it('menu cursor navigation wraps downward', () => {
    // Add save data so we have 2 menu items
    mockStorage['gospel_story_save_0'] = '{"version":1}';

    scene.enter();
    scene._phase = 1; // jump to menu
    scene._cursor = 0;

    // Press DOWN
    input._pressedSet.add(Actions.DOWN);
    scene.update(1 / 60);
    expect(scene._cursor).toBe(1);

    // Press DOWN again -> wraps to 0
    scene.update(1 / 60);
    expect(scene._cursor).toBe(0);
  });

  it('menu cursor navigation wraps upward', () => {
    mockStorage['gospel_story_save_0'] = '{"version":1}';

    scene.enter();
    scene._phase = 1;
    scene._cursor = 0;

    input._pressedSet.add(Actions.UP);
    scene.update(1 / 60);
    expect(scene._cursor).toBe(1); // wraps to last item
  });

  it('New Game selection calls onNewGame', () => {
    scene.enter();
    scene._phase = 1;
    scene._cursor = 0;

    input._pressedSet.add(Actions.CONFIRM);
    scene.update(1 / 60);
    expect(onNewGame).toHaveBeenCalledOnce();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('Continue selection calls onContinue', () => {
    mockStorage['gospel_story_save_0'] = '{"version":1}';

    scene.enter();
    scene._phase = 1;
    scene._cursor = 1;

    input._pressedSet.add(Actions.CONFIRM);
    scene.update(1 / 60);
    expect(onContinue).toHaveBeenCalledOnce();
    expect(onNewGame).not.toHaveBeenCalled();
  });

  it('Continue not shown when no save data', () => {
    // No save data in mockStorage
    scene.enter();
    scene._phase = 1;
    scene._cursor = 0;

    expect(scene.hasSaveData()).toBe(false);

    // With only 1 menu item, pressing DOWN wraps back to 0
    input._pressedSet.add(Actions.DOWN);
    scene.update(1 / 60);
    expect(scene._cursor).toBe(0);
  });

  it('hasSaveData() returns true when save exists', () => {
    mockStorage['gospel_story_save_1'] = '{"version":1}';
    expect(scene.hasSaveData()).toBe(true);
  });

  it('hasSaveData() returns false when no saves exist', () => {
    expect(scene.hasSaveData()).toBe(false);
  });

  it('render does not throw in press-start phase', () => {
    scene.enter();
    const ctx = createMockCtx();
    expect(() => scene.render(ctx)).not.toThrow();
  });

  it('render does not throw in menu phase', () => {
    scene.enter();
    scene._phase = 1;
    const ctx = createMockCtx();
    expect(() => scene.render(ctx)).not.toThrow();
  });

  it('render does not throw in menu phase with save data', () => {
    mockStorage['gospel_story_save_0'] = '{"version":1}';
    scene.enter();
    scene._phase = 1;
    const ctx = createMockCtx();
    expect(() => scene.render(ctx)).not.toThrow();
  });
});
