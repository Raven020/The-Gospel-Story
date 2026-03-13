/**
 * Pause menu per specs/ui-hud.md §3.
 * Full-screen overlay with centered panel, 6 options.
 */

import { drawPanel, drawCursor } from './UIChrome.js';
import { drawText } from '../lib/drawText.js';
import { Colors } from './Colors.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';
import { Actions, InputContext } from '../systems/InputSystem.js';

const PANEL_X = 60;
const PANEL_Y = 30;
const PANEL_W = 120;
const PANEL_H = 100;
const HEADER_Y = 34;
const FIRST_OPTION_Y = 48;
const ROW_HEIGHT = 12;
const CURSOR_X = PANEL_X + 6;
const TEXT_X = PANEL_X + 16;

const OPTIONS = ['Party', 'Items', 'Save', 'Load', 'Options', 'Close'];

export class PauseMenu {
  constructor({ input, onSelect, onClose }) {
    this.input = input;
    this.onSelect = onSelect || (() => {});
    this.onClose = onClose || (() => {});
    this.active = false;
    this.cursorIndex = 0;
    this._prevContext = InputContext.OVERWORLD;
  }

  open() {
    this.active = true;
    this.cursorIndex = 0;
    this._prevContext = this.input.context;
    this.input.context = InputContext.MENU;
  }

  close() {
    this.active = false;
    this.input.context = this._prevContext;
    this.onClose();
  }

  update() {
    if (!this.active) return;

    if (this.input.pressed(Actions.UP)) {
      this.cursorIndex = (this.cursorIndex - 1 + OPTIONS.length) % OPTIONS.length;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this.cursorIndex = (this.cursorIndex + 1) % OPTIONS.length;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const option = OPTIONS[this.cursorIndex];
      if (option === 'Close') {
        this.close();
      } else {
        this.onSelect(option.toLowerCase());
      }
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this.close();
    }
  }

  render(ctx, frameCount) {
    if (!this.active) return;

    // Semi-transparent overlay
    ctx.fillStyle = Colors.BG_OVERLAY;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Panel
    drawPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, Colors.BG_DARK);

    // Header
    const headerText = 'PAUSE MENU';
    const headerX = PANEL_X + Math.floor((PANEL_W - headerText.length * 6) / 2);
    drawText(ctx, headerText, headerX, HEADER_Y, Colors.TEXT_GOLD);

    // Separator
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(PANEL_X + 4, HEADER_Y + 10, PANEL_W - 8, 1);

    // Options
    for (let i = 0; i < OPTIONS.length; i++) {
      const y = FIRST_OPTION_Y + i * ROW_HEIGHT;

      if (i === this.cursorIndex) {
        // Highlight bar
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(PANEL_X + 2, y - 1, PANEL_W - 4, ROW_HEIGHT - 1);
        drawCursor(ctx, CURSOR_X, y + 1, 0, Colors.TEXT_LIGHT);
        drawText(ctx, OPTIONS[i], TEXT_X, y, Colors.TEXT_LIGHT);
      } else {
        drawText(ctx, OPTIONS[i], TEXT_X, y, Colors.TEXT_LIGHT);
      }
    }
  }
}
