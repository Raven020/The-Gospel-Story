import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveLoadMenu } from '../SaveLoadMenu.js';
import { Actions } from '../../systems/InputSystem.js';
import { GameState } from '../../systems/GameState.js';

function createMockInput() {
  return {
    context: 'menu',
    pressed: vi.fn(() => false),
  };
}

function createMockGameState() {
  const gs = {
    party: {
      active: [{ id: 'jesus', name: 'Jesus', level: 5, isJesus: true }],
      bench: [],
    },
    playtime: 3600,
    save: vi.fn(() => true),
    load: vi.fn(() => true),
  };
  return gs;
}

describe('SaveLoadMenu', () => {
  beforeEach(() => {
    // Mock static methods on GameState
    vi.spyOn(GameState, 'getSaveInfo').mockImplementation(() => null);
    vi.spyOn(GameState, 'hasSave').mockImplementation(() => false);
  });

  it('starts inactive', () => {
    const menu = new SaveLoadMenu({ input: createMockInput(), gameState: createMockGameState(), mode: 'save' });
    expect(menu.active).toBe(false);
  });

  it('opens and sets active', () => {
    const menu = new SaveLoadMenu({ input: createMockInput(), gameState: createMockGameState(), mode: 'save' });
    menu.open('save');
    expect(menu.active).toBe(true);
    expect(menu.mode).toBe('save');
    expect(menu.cursor).toBe(0);
  });

  it('opens in load mode', () => {
    const menu = new SaveLoadMenu({ input: createMockInput(), gameState: createMockGameState(), mode: 'save' });
    menu.open('load');
    expect(menu.mode).toBe('load');
  });

  it('closes and calls onClose', () => {
    const menu = new SaveLoadMenu({ input: createMockInput(), gameState: createMockGameState(), mode: 'save' });
    const onClose = vi.fn();
    menu.onClose = onClose;
    menu.open('save');
    menu.close();
    expect(menu.active).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('navigates cursor up/down with wrapping', () => {
    const input = createMockInput();
    const menu = new SaveLoadMenu({ input, gameState: createMockGameState(), mode: 'save' });
    menu.open('save');
    expect(menu.cursor).toBe(0);

    input.pressed.mockImplementation(a => a === Actions.DOWN);
    menu.update();
    expect(menu.cursor).toBe(1);

    menu.update();
    expect(menu.cursor).toBe(2);

    // Wrap around
    menu.update();
    expect(menu.cursor).toBe(0);

    // Wrap up
    input.pressed.mockImplementation(a => a === Actions.UP);
    menu.update();
    expect(menu.cursor).toBe(2);
  });

  it('saves to empty slot on confirm', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new SaveLoadMenu({ input, gameState: gs, mode: 'save' });
    menu.open('save');

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(gs.save).toHaveBeenCalledWith(0);
    expect(menu._savedMessage).toBeGreaterThan(0);
  });

  it('shows overwrite confirmation for occupied slot', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    GameState.getSaveInfo.mockImplementation(() => ({ slot: 0, level: 5, playtime: 100, map: 'demo' }));

    const menu = new SaveLoadMenu({ input, gameState: gs, mode: 'save' });
    menu.open('save');

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu._confirmingOverwrite).toBe(true);
    expect(gs.save).not.toHaveBeenCalled();

    // Confirm overwrite
    menu.update();
    expect(gs.save).toHaveBeenCalledWith(0);
    expect(menu._confirmingOverwrite).toBe(false);
  });

  it('cancels overwrite confirmation', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    GameState.getSaveInfo.mockImplementation(() => ({ slot: 0, level: 5, playtime: 100, map: 'demo' }));

    const menu = new SaveLoadMenu({ input, gameState: gs, mode: 'save' });
    menu.open('save');

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();
    expect(menu._confirmingOverwrite).toBe(true);

    input.pressed.mockImplementation(a => a === Actions.CANCEL);
    menu.update();
    expect(menu._confirmingOverwrite).toBe(false);
    expect(gs.save).not.toHaveBeenCalled();
  });

  it('loads from slot on confirm', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new SaveLoadMenu({ input, gameState: gs, mode: 'load' });
    menu.open('load');

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(gs.load).toHaveBeenCalledWith(0);
  });

  it('calls onLoad callback after successful load', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const onLoad = vi.fn();
    const menu = new SaveLoadMenu({ input, gameState: gs, mode: 'load' });
    menu.onLoad = onLoad;
    menu.open('load');

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(onLoad).toHaveBeenCalledOnce();
  });

  it('cancel closes the menu', () => {
    const input = createMockInput();
    const menu = new SaveLoadMenu({ input, gameState: createMockGameState(), mode: 'save' });
    menu.open('save');

    input.pressed.mockImplementation(a => a === Actions.CANCEL);
    menu.update();

    expect(menu.active).toBe(false);
  });

  it('renders without errors', () => {
    const input = createMockInput();
    const menu = new SaveLoadMenu({ input, gameState: createMockGameState(), mode: 'save' });
    menu.open('save');
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });

  it('renders in load mode without errors', () => {
    const input = createMockInput();
    const menu = new SaveLoadMenu({ input, gameState: createMockGameState(), mode: 'load' });
    menu.open('load');
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });

  it('saved message auto-closes after countdown', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new SaveLoadMenu({ input, gameState: gs, mode: 'save' });
    menu.open('save');

    // Trigger save
    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    // Countdown the saved message
    input.pressed.mockImplementation(() => false);
    const frames = menu._savedMessage;
    for (let i = 0; i < frames; i++) {
      menu.update();
    }
    expect(menu.active).toBe(false);
  });
});
