/**
 * Pause menu per specs/ui-hud.md §3.
 * Full-screen overlay with centered panel, 6 options.
 */

import { drawPanel, drawCursor } from './UIChrome.js';
import { drawText } from '../lib/drawText.js';
import { Colors } from './Colors.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';
import { Actions, InputContext } from '../systems/InputSystem.js';
import { SaveLoadMenu } from './SaveLoadMenu.js';
import { PartyMenu } from './PartyMenu.js';
import { ItemMenu } from './ItemMenu.js';
import { OptionsMenu } from './OptionsMenu.js';

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
  constructor({ input, onSelect, onClose, gameState }) {
    this.input = input;
    this.onSelect = onSelect || (() => {});
    this.onClose = onClose || (() => {});
    this.active = false;
    this.cursorIndex = 0;
    this._prevContext = InputContext.OVERWORLD;

    // Sub-menus (only created if gameState is provided)
    this._activeSubMenu = null;
    if (gameState) {
      this.saveLoadMenu = new SaveLoadMenu({ input, gameState, mode: 'save' });
      this.saveLoadMenu.onClose = () => { this._activeSubMenu = null; };

      this.partyMenu = new PartyMenu({ input, gameState });
      this.partyMenu.onClose = () => { this._activeSubMenu = null; };

      this.itemMenu = new ItemMenu({ input, gameState });
      this.itemMenu.onClose = () => { this._activeSubMenu = null; };

      this.optionsMenu = new OptionsMenu({ input });
      this.optionsMenu.onClose = () => { this._activeSubMenu = null; };
    } else {
      this.saveLoadMenu = null;
      this.partyMenu = null;
      this.itemMenu = null;
      this.optionsMenu = new OptionsMenu({ input });
      this.optionsMenu.onClose = () => { this._activeSubMenu = null; };
    }
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

    // Delegate to active sub-menu
    if (this._activeSubMenu) {
      this._activeSubMenu.update();
      return;
    }

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
        this._openSubMenu(option.toLowerCase());
      }
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this.close();
    }
  }

  _openSubMenu(option) {
    if (option === 'party' && this.partyMenu) {
      this.partyMenu.open();
      this._activeSubMenu = this.partyMenu;
    } else if (option === 'items' && this.itemMenu) {
      this.itemMenu.open();
      this._activeSubMenu = this.itemMenu;
    } else if (option === 'save' && this.saveLoadMenu) {
      this.saveLoadMenu.open('save');
      this._activeSubMenu = this.saveLoadMenu;
    } else if (option === 'load' && this.saveLoadMenu) {
      this.saveLoadMenu.open('load');
      this._activeSubMenu = this.saveLoadMenu;
    } else if (option === 'options' && this.optionsMenu) {
      this.optionsMenu.open();
      this._activeSubMenu = this.optionsMenu;
    } else {
      // Fallback for options without sub-menu or no gameState
      this.onSelect(option);
    }
  }

  render(ctx, frameCount) {
    if (!this.active) return;

    // If sub-menu is active, render overlay behind it then delegate
    if (this._activeSubMenu) {
      ctx.fillStyle = Colors.BG_OVERLAY;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      drawPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, Colors.BG_DARK);
      this._activeSubMenu.render(ctx, frameCount);
      return;
    }

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
        drawCursor(ctx, CURSOR_X, y + 1, frameCount, Colors.TEXT_LIGHT);
        drawText(ctx, OPTIONS[i], TEXT_X, y, Colors.TEXT_LIGHT);
      } else {
        drawText(ctx, OPTIONS[i], TEXT_X, y, Colors.TEXT_LIGHT);
      }
    }
  }
}
