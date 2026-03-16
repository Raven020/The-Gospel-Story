import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OptionsMenu } from '../OptionsMenu.js';
import { gameSettings } from '../gameSettings.js';
import { Actions, InputContext } from '../../systems/InputSystem.js';

function createMockInput() {
  return {
    context: InputContext.MENU,
    pressed: vi.fn(() => false),
    held: vi.fn(() => false),
    getDirectionalHeld: vi.fn(() => null),
    getDirectionalPressed: vi.fn(() => null),
  };
}

describe('OptionsMenu', () => {
  let menu, input;

  beforeEach(() => {
    input = createMockInput();
    menu = new OptionsMenu({ input });
    // Reset gameSettings to defaults
    gameSettings.textSpeed = 2;
    gameSettings.bgmEnabled = true;
    gameSettings.sfxEnabled = true;
  });

  it('starts inactive', () => {
    expect(menu.active).toBe(false);
  });

  it('open activates and resets cursor', () => {
    menu.cursor = 2;
    menu.open();
    expect(menu.active).toBe(true);
    expect(menu.cursor).toBe(0);
  });

  it('close deactivates and calls onClose', () => {
    const onClose = vi.fn();
    menu.onClose = onClose;
    menu.open();
    menu.close();
    expect(menu.active).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('navigates cursor with UP/DOWN', () => {
    menu.open();

    input.pressed.mockImplementation((a) => a === Actions.DOWN);
    menu.update();
    expect(menu.cursor).toBe(1);

    input.pressed.mockImplementation((a) => a === Actions.UP);
    menu.update();
    expect(menu.cursor).toBe(0);
  });

  it('cursor wraps around', () => {
    menu.open();
    input.pressed.mockImplementation((a) => a === Actions.UP);
    menu.update();
    expect(menu.cursor).toBe(3); // wraps to last (Back)
  });

  it('cycles text speed on confirm', () => {
    menu.open();
    menu.cursor = 0; // Text Speed row
    expect(gameSettings.textSpeed).toBe(2); // Normal

    input.pressed.mockImplementation((a) => a === Actions.CONFIRM);
    menu.update();
    expect(gameSettings.textSpeed).toBe(4); // Fast

    menu.update();
    expect(gameSettings.textSpeed).toBe(1); // Slow

    menu.update();
    expect(gameSettings.textSpeed).toBe(2); // Normal again
  });

  it('toggles BGM on confirm', () => {
    menu.open();
    menu.cursor = 1; // BGM row

    input.pressed.mockImplementation((a) => a === Actions.CONFIRM);
    menu.update();
    expect(gameSettings.bgmEnabled).toBe(false);

    menu.update();
    expect(gameSettings.bgmEnabled).toBe(true);
  });

  it('toggles SFX on confirm', () => {
    menu.open();
    menu.cursor = 2; // SFX row

    input.pressed.mockImplementation((a) => a === Actions.CONFIRM);
    menu.update();
    expect(gameSettings.sfxEnabled).toBe(false);
  });

  it('closes when Back is selected', () => {
    const onClose = vi.fn();
    menu.onClose = onClose;
    menu.open();
    menu.cursor = 3; // Back row

    input.pressed.mockImplementation((a) => a === Actions.CONFIRM);
    menu.update();
    expect(menu.active).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on CANCEL', () => {
    const onClose = vi.fn();
    menu.onClose = onClose;
    menu.open();

    input.pressed.mockImplementation((a) => a === Actions.CANCEL);
    menu.update();
    expect(menu.active).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not update when inactive', () => {
    menu.cursor = 0;
    input.pressed.mockImplementation((a) => a === Actions.DOWN);
    menu.update();
    expect(menu.cursor).toBe(0);
  });

  it('renders without error when active', () => {
    menu.open();
    const ctx = {
      fillStyle: '',
      fillRect: vi.fn(),
      globalAlpha: 1,
    };
    expect(() => menu.render(ctx, 0)).not.toThrow();
  });

  it('does not render when inactive', () => {
    const ctx = {
      fillStyle: '',
      fillRect: vi.fn(),
    };
    menu.render(ctx, 0);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});
