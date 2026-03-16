/**
 * Options sub-screen for the Pause Menu.
 * Provides text speed, BGM, and SFX toggle settings.
 */

import { drawPanel, drawCursor } from './UIChrome.js';
import { drawText } from '../lib/drawText.js';
import { Colors } from './Colors.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';
import { Actions } from '../systems/InputSystem.js';
import { gameSettings } from './gameSettings.js';

const PANEL_X = 30;
const PANEL_Y = 20;
const PANEL_W = 180;
const PANEL_H = 100;
const HEADER_Y = 26;
const FIRST_ROW_Y = 42;
const ROW_HEIGHT = 16;
const CURSOR_X = PANEL_X + 6;
const LABEL_X = PANEL_X + 16;
const VALUE_X = PANEL_X + 120;

const TEXT_SPEED_LABELS = ['Slow', 'Normal', 'Fast'];
const TEXT_SPEED_VALUES = [1, 2, 4];

const ROWS = [
  { label: 'Text Speed', type: 'textSpeed' },
  { label: 'BGM', type: 'bgm' },
  { label: 'SFX', type: 'sfx' },
  { label: 'Back', type: 'back' },
];

export class OptionsMenu {
  constructor({ input }) {
    this.input = input;
    this.active = false;
    this.cursor = 0;
    this.onClose = null;
  }

  open() {
    this.active = true;
    this.cursor = 0;
  }

  close() {
    this.active = false;
    if (this.onClose) this.onClose();
  }

  update() {
    if (!this.active) return;

    if (this.input.pressed(Actions.UP)) {
      this.cursor = (this.cursor - 1 + ROWS.length) % ROWS.length;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this.cursor = (this.cursor + 1) % ROWS.length;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const row = ROWS[this.cursor];
      if (row.type === 'back') {
        this.close();
        return;
      }
      this._cycleOption(row.type);
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this.close();
    }

    // Left/Right to cycle options on the current row
    if (this.input.pressed(Actions.LEFT) || this.input.pressed(Actions.RIGHT)) {
      const row = ROWS[this.cursor];
      if (row.type !== 'back') {
        this._cycleOption(row.type, this.input.pressed(Actions.LEFT) ? -1 : 1);
      }
    }
  }

  _cycleOption(type, direction) {
    if (type === 'textSpeed') {
      const idx = TEXT_SPEED_VALUES.indexOf(gameSettings.textSpeed);
      const dir = direction || 1;
      const next = (idx + dir + TEXT_SPEED_VALUES.length) % TEXT_SPEED_VALUES.length;
      gameSettings.textSpeed = TEXT_SPEED_VALUES[next];
    } else if (type === 'bgm') {
      gameSettings.bgmEnabled = !gameSettings.bgmEnabled;
    } else if (type === 'sfx') {
      gameSettings.sfxEnabled = !gameSettings.sfxEnabled;
    }
  }

  _getValueText(type) {
    if (type === 'textSpeed') {
      const idx = TEXT_SPEED_VALUES.indexOf(gameSettings.textSpeed);
      return TEXT_SPEED_LABELS[idx >= 0 ? idx : 1];
    }
    if (type === 'bgm') return gameSettings.bgmEnabled ? 'On' : 'Off';
    if (type === 'sfx') return gameSettings.sfxEnabled ? 'On' : 'Off';
    return '';
  }

  render(ctx, frameCount) {
    if (!this.active) return;

    // Overlay
    ctx.fillStyle = Colors.BG_OVERLAY;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Panel
    drawPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, Colors.BG_DARK);

    // Header
    const headerText = 'OPTIONS';
    const headerX = PANEL_X + Math.floor((PANEL_W - headerText.length * 6) / 2);
    drawText(ctx, headerText, headerX, HEADER_Y, Colors.TEXT_GOLD);

    // Separator
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(PANEL_X + 4, HEADER_Y + 10, PANEL_W - 8, 1);

    // Rows
    for (let i = 0; i < ROWS.length; i++) {
      const row = ROWS[i];
      const y = FIRST_ROW_Y + i * ROW_HEIGHT;

      if (i === this.cursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(PANEL_X + 2, y - 1, PANEL_W - 4, ROW_HEIGHT - 2);
        drawCursor(ctx, CURSOR_X, y + 3, frameCount, Colors.TEXT_LIGHT);
      }

      drawText(ctx, row.label, LABEL_X, y + 2, Colors.TEXT_LIGHT);

      const valueText = this._getValueText(row.type);
      if (valueText) {
        const valueColor = i === this.cursor ? Colors.TEXT_GOLD : Colors.TEXT_DIM;
        drawText(ctx, valueText, VALUE_X, y + 2, valueColor);
      }
    }
  }
}
