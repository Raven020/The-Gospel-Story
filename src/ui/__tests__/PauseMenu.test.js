import { describe, it, expect, vi } from 'vitest';
import { PauseMenu } from '../PauseMenu.js';
import { Actions, InputContext } from '../../systems/InputSystem.js';

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
