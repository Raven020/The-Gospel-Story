import { describe, it, expect, vi } from 'vitest';
import { ItemMenu } from '../ItemMenu.js';
import { Actions } from '../../systems/InputSystem.js';
import { Inventory } from '../../data/inventory.js';
import { createMember } from '../../data/partyData.js';

function createMockInput() {
  return {
    context: 'menu',
    pressed: vi.fn(() => false),
  };
}

function createMockGameState() {
  const inventory = new Inventory();
  inventory.add('bread', 3);
  inventory.add('water', 2);
  inventory.add('temple_scroll', 1);

  return {
    party: {
      active: [
        createMember('jesus', 1),
        createMember('peter', 1),
      ],
      bench: [],
    },
    inventory,
  };
}

describe('ItemMenu', () => {
  it('starts inactive', () => {
    const menu = new ItemMenu({ input: createMockInput(), gameState: createMockGameState() });
    expect(menu.active).toBe(false);
  });

  it('opens and sets active', () => {
    const menu = new ItemMenu({ input: createMockInput(), gameState: createMockGameState() });
    menu.open();
    expect(menu.active).toBe(true);
    expect(menu.cursor).toBe(0);
  });

  it('closes and calls onClose', () => {
    const onClose = vi.fn();
    const menu = new ItemMenu({ input: createMockInput(), gameState: createMockGameState() });
    menu.onClose = onClose;
    menu.open();
    menu.close();
    expect(menu.active).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('navigates cursor up/down with wrapping', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();

    // 3 items: bread, water, temple_scroll
    input.pressed.mockImplementation(a => a === Actions.DOWN);
    menu.update();
    expect(menu.cursor).toBe(1);

    menu.update();
    expect(menu.cursor).toBe(2);

    // Wrap
    menu.update();
    expect(menu.cursor).toBe(0);

    // Wrap up
    input.pressed.mockImplementation(a => a === Actions.UP);
    menu.update();
    expect(menu.cursor).toBe(2);
  });

  it('opens target selection on confirm for consumable', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();
    menu.cursor = 0; // bread (consumable)

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu._state).toBe('target');
  });

  it('does not open target selection for key items', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();
    menu.cursor = 2; // temple_scroll (key item)

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu._state).toBe('items');
  });

  it('uses consumable item on party member', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    // Damage Jesus first so healing has effect
    gs.party.active[0].currentHp = 100;
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();
    menu.cursor = 0; // bread

    // Enter target selection
    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();
    expect(menu._state).toBe('target');

    // Confirm on Jesus (target 0)
    menu.update();

    // Bread restores 50 HP
    expect(gs.party.active[0].currentHp).toBe(150);
    expect(gs.inventory.count('bread')).toBe(2);
    expect(menu._state).toBe('items');
  });

  it('cancel returns from target to items', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();
    menu.cursor = 0;

    // Enter target
    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();
    expect(menu._state).toBe('target');

    // Cancel back
    input.pressed.mockImplementation(a => a === Actions.CANCEL);
    menu.update();
    expect(menu._state).toBe('items');
  });

  it('cancel closes menu from items list', () => {
    const input = createMockInput();
    const menu = new ItemMenu({ input, gameState: createMockGameState() });
    menu.open();

    input.pressed.mockImplementation(a => a === Actions.CANCEL);
    menu.update();

    expect(menu.active).toBe(false);
  });

  it('handles empty inventory gracefully', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    gs.inventory = new Inventory(); // empty
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();

    // Should not crash on navigation
    input.pressed.mockImplementation(a => a === Actions.DOWN);
    expect(() => menu.update()).not.toThrow();

    // Cancel should still work
    input.pressed.mockImplementation(a => a === Actions.CANCEL);
    menu.update();
    expect(menu.active).toBe(false);
  });

  it('renders without errors', () => {
    const menu = new ItemMenu({ input: createMockInput(), gameState: createMockGameState() });
    menu.open();
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });

  it('renders target panel without errors', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();
    menu._state = 'target';
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });

  it('renders empty inventory without errors', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    gs.inventory = new Inventory();
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });

  it('navigates target cursor with wrapping', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new ItemMenu({ input, gameState: gs });
    menu.open();
    menu._state = 'target';
    menu._targetCursor = 0;

    // 2 party members
    input.pressed.mockImplementation(a => a === Actions.DOWN);
    menu.update();
    expect(menu._targetCursor).toBe(1);

    // Wrap
    menu.update();
    expect(menu._targetCursor).toBe(0);

    // Wrap up
    input.pressed.mockImplementation(a => a === Actions.UP);
    menu.update();
    expect(menu._targetCursor).toBe(1);
  });
});
