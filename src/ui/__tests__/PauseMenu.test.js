import { describe, it, expect, vi } from 'vitest';
import { PauseMenu } from '../PauseMenu.js';
import { Actions, InputContext } from '../../systems/InputSystem.js';

// Mock sub-menu modules to isolate PauseMenu delegation logic
vi.mock('../SaveLoadMenu.js', () => ({
  SaveLoadMenu: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
    onClose: null,
  })),
}));

vi.mock('../PartyMenu.js', () => ({
  PartyMenu: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
    onClose: null,
  })),
}));

vi.mock('../ItemMenu.js', () => ({
  ItemMenu: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
    onClose: null,
  })),
}));

function createMockInput() {
  return {
    context: InputContext.OVERWORLD,
    pressed: vi.fn(() => false),
  };
}

describe('PauseMenu', () => {
  it('starts inactive', () => {
    const menu = new PauseMenu({ input: createMockInput() });
    expect(menu.active).toBe(false);
  });

  it('opens and sets menu context', () => {
    const input = createMockInput();
    const menu = new PauseMenu({ input });
    menu.open();
    expect(menu.active).toBe(true);
    expect(input.context).toBe(InputContext.MENU);
  });

  it('navigates cursor up/down with wrapping', () => {
    const input = createMockInput();
    const menu = new PauseMenu({ input });
    menu.open();
    expect(menu.cursorIndex).toBe(0);

    input.pressed.mockImplementation(a => a === Actions.DOWN);
    menu.update();
    expect(menu.cursorIndex).toBe(1);

    input.pressed.mockImplementation(a => a === Actions.UP);
    menu.update();
    expect(menu.cursorIndex).toBe(0);

    // Wrap up
    menu.update();
    expect(menu.cursorIndex).toBe(5); // wraps to last (Close)
  });

  it('selects Close to close menu', () => {
    const input = createMockInput();
    const onClose = vi.fn();
    const menu = new PauseMenu({ input, onClose });
    menu.open();
    menu.cursorIndex = 5; // Close

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu.active).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('fires onSelect for non-Close options', () => {
    const input = createMockInput();
    const onSelect = vi.fn();
    const menu = new PauseMenu({ input, onSelect });
    menu.open();
    menu.cursorIndex = 0; // Party

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(onSelect).toHaveBeenCalledWith('party');
  });

  it('cancel button closes menu', () => {
    const input = createMockInput();
    const onClose = vi.fn();
    const menu = new PauseMenu({ input, onClose });
    menu.open();

    input.pressed.mockImplementation(a => a === Actions.CANCEL);
    menu.update();

    expect(menu.active).toBe(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('restores previous input context on close', () => {
    const input = createMockInput();
    input.context = InputContext.OVERWORLD;
    const menu = new PauseMenu({ input });
    menu.open();
    expect(input.context).toBe(InputContext.MENU);
    menu.close();
    expect(input.context).toBe(InputContext.OVERWORLD);
  });

  it('renders without errors', () => {
    const input = createMockInput();
    const menu = new PauseMenu({ input });
    menu.open();
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });
});

describe('PauseMenu sub-menu delegation', () => {
  function createMockGameState() {
    return {
      party: { active: [], bench: [] },
      inventory: { getAll: () => [] },
      questFlags: {},
    };
  }

  function createMockInputForSub() {
    return {
      context: InputContext.OVERWORLD,
      pressed: vi.fn(() => false),
    };
  }

  it('opens PartyMenu when Party is selected', () => {
    const input = createMockInputForSub();
    const menu = new PauseMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.cursorIndex = 0; // Party

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu._activeSubMenu).toBe(menu.partyMenu);
    expect(menu.partyMenu.open).toHaveBeenCalled();
  });

  it('opens ItemMenu when Items is selected', () => {
    const input = createMockInputForSub();
    const menu = new PauseMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.cursorIndex = 1; // Items

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu._activeSubMenu).toBe(menu.itemMenu);
    expect(menu.itemMenu.open).toHaveBeenCalled();
  });

  it('opens SaveLoadMenu in save mode when Save is selected', () => {
    const input = createMockInputForSub();
    const menu = new PauseMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.cursorIndex = 2; // Save

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu._activeSubMenu).toBe(menu.saveLoadMenu);
    expect(menu.saveLoadMenu.open).toHaveBeenCalledWith('save');
  });

  it('opens SaveLoadMenu in load mode when Load is selected', () => {
    const input = createMockInputForSub();
    const menu = new PauseMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.cursorIndex = 3; // Load

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu._activeSubMenu).toBe(menu.saveLoadMenu);
    expect(menu.saveLoadMenu.open).toHaveBeenCalledWith('load');
  });

  it('delegates update to active sub-menu', () => {
    const input = createMockInputForSub();
    const menu = new PauseMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu._activeSubMenu = menu.partyMenu;

    input.pressed.mockImplementation(() => false);
    menu.update();

    expect(menu.partyMenu.update).toHaveBeenCalled();
    // Main menu cursor should NOT have changed (delegation, not own handling)
    expect(menu.cursorIndex).toBe(0);
  });

  it('delegates render to active sub-menu', () => {
    const input = createMockInputForSub();
    const menu = new PauseMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu._activeSubMenu = menu.itemMenu;

    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    menu.render(ctx, 0);

    expect(menu.itemMenu.render).toHaveBeenCalledWith(ctx, 0);
  });

  it('clears active sub-menu when sub-menu closes', () => {
    const input = createMockInputForSub();
    const menu = new PauseMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.cursorIndex = 0; // Party

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu._activeSubMenu).toBe(menu.partyMenu);

    // Simulate sub-menu closing via onClose callback
    menu.partyMenu.onClose();
    expect(menu._activeSubMenu).toBeNull();
  });
});
