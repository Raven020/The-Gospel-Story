import { describe, it, expect, vi } from 'vitest';
import { PartyMenu } from '../PartyMenu.js';
import { Actions } from '../../systems/InputSystem.js';
import { createMember } from '../../data/partyData.js';

function createMockInput() {
  return {
    context: 'menu',
    pressed: vi.fn(() => false),
  };
}

function createMockGameState() {
  return {
    party: {
      active: [
        createMember('jesus', 1),
        createMember('peter', 1),
        createMember('john', 1),
      ],
      bench: [
        createMember('andrew', 1),
        createMember('james', 1),
      ],
    },
    swapMember: vi.fn(() => true),
  };
}

describe('PartyMenu', () => {
  it('starts inactive', () => {
    const menu = new PartyMenu({ input: createMockInput(), gameState: createMockGameState() });
    expect(menu.active).toBe(false);
  });

  it('opens and sets active', () => {
    const menu = new PartyMenu({ input: createMockInput(), gameState: createMockGameState() });
    menu.open();
    expect(menu.active).toBe(true);
    expect(menu.cursor).toBe(0);
    expect(menu.state).toBe('list');
  });

  it('closes and calls onClose', () => {
    const onClose = vi.fn();
    const menu = new PartyMenu({ input: createMockInput(), gameState: createMockGameState() });
    menu.onClose = onClose;
    menu.open();
    menu.close();
    expect(menu.active).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('navigates cursor up/down with wrapping', () => {
    const input = createMockInput();
    const gs = createMockGameState();
    const menu = new PartyMenu({ input, gameState: gs });
    menu.open();

    // Total members: 3 active + 2 bench = 5
    input.pressed.mockImplementation(a => a === Actions.DOWN);
    menu.update();
    expect(menu.cursor).toBe(1);

    menu.update();
    expect(menu.cursor).toBe(2);

    menu.update();
    expect(menu.cursor).toBe(3);

    menu.update();
    expect(menu.cursor).toBe(4);

    // Wrap
    menu.update();
    expect(menu.cursor).toBe(0);

    // Wrap up
    input.pressed.mockImplementation(a => a === Actions.UP);
    menu.update();
    expect(menu.cursor).toBe(4);
  });

  it('shows member details on confirm', () => {
    const input = createMockInput();
    const menu = new PartyMenu({ input, gameState: createMockGameState() });
    menu.open();

    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();

    expect(menu.state).toBe('detail');
  });

  it('returns to list from detail on cancel', () => {
    const input = createMockInput();
    const menu = new PartyMenu({ input, gameState: createMockGameState() });
    menu.open();

    // Go to detail
    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();
    expect(menu.state).toBe('detail');

    // Cancel back
    input.pressed.mockImplementation(a => a === Actions.CANCEL);
    menu.update();
    expect(menu.state).toBe('list');
  });

  it('enters swap mode from detail (non-Jesus member)', () => {
    const input = createMockInput();
    const menu = new PartyMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.cursor = 1; // Peter (not Jesus)

    // Go to detail
    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();
    expect(menu.state).toBe('detail');

    // Confirm again to enter swap
    menu.update();
    expect(menu.state).toBe('swap');
  });

  it('does not enter swap mode for Jesus', () => {
    const input = createMockInput();
    const menu = new PartyMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.cursor = 0; // Jesus

    // Go to detail
    input.pressed.mockImplementation(a => a === Actions.CONFIRM);
    menu.update();
    expect(menu.state).toBe('detail');

    // Try confirm again - should stay in detail since Jesus can't swap
    menu.update();
    expect(menu.state).toBe('detail');
  });

  it('cancel closes menu from list', () => {
    const input = createMockInput();
    const menu = new PartyMenu({ input, gameState: createMockGameState() });
    menu.open();

    input.pressed.mockImplementation(a => a === Actions.CANCEL);
    menu.update();

    expect(menu.active).toBe(false);
  });

  it('renders list without errors', () => {
    const menu = new PartyMenu({ input: createMockInput(), gameState: createMockGameState() });
    menu.open();
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });

  it('renders detail view without errors', () => {
    const input = createMockInput();
    const menu = new PartyMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.state = 'detail';
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });

  it('renders swap mode without errors', () => {
    const input = createMockInput();
    const menu = new PartyMenu({ input, gameState: createMockGameState() });
    menu.open();
    menu.state = 'swap';
    menu._swapSource = 1;
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });
});
