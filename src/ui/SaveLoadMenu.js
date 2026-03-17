/**
 * Save/Load screen with 3 save slots.
 * Shows slot info (leader name, level, play time) or "Empty".
 * Confirmation prompt before overwriting, brief "Saved!" message after save.
 */

import { drawPanel, drawCursor } from './UIChrome.js';
import { drawText } from '../lib/drawText.js';
import { Colors } from './Colors.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';
import { Actions } from '../systems/InputSystem.js';
import { GameState } from '../systems/GameState.js';

const MAX_SLOTS = 3;
const PANEL_X = 20;
const PANEL_Y = 10;
const PANEL_W = 200;
const PANEL_H = 140;
const HEADER_Y = 16;
const FIRST_SLOT_Y = 34;
const SLOT_HEIGHT = 30;
const CURSOR_X = PANEL_X + 6;
const TEXT_X = PANEL_X + 16;
const SAVED_MSG_FRAMES = 60;

export class SaveLoadMenu {
  constructor({ input, gameState, mode }) {
    this.input = input;
    this.gameState = gameState;
    this.mode = mode || 'save';
    this.active = false;
    this.cursor = 0;
    this._confirmingOverwrite = false;
    this._savedMessage = 0;
    this.onClose = null;
    this.onLoad = null;
  }

  open(mode) {
    this.mode = mode || this.mode;
    this.active = true;
    this.cursor = 0;
    this._confirmingOverwrite = false;
    this._savedMessage = 0;
  }

  close() {
    this.active = false;
    this._confirmingOverwrite = false;
    this._savedMessage = 0;
    if (this.onClose) this.onClose();
  }

  update() {
    if (!this.active) return;

    // "Saved!" message countdown
    if (this._savedMessage > 0) {
      this._savedMessage--;
      if (this._savedMessage <= 0) {
        this.close();
      }
      return;
    }

    // Overwrite confirmation prompt
    if (this._confirmingOverwrite) {
      if (this.input.pressed(Actions.CONFIRM)) {
        this._doSave(this.cursor);
        this._confirmingOverwrite = false;
      }
      if (this.input.pressed(Actions.CANCEL)) {
        this._confirmingOverwrite = false;
      }
      return;
    }

    // Cursor navigation
    if (this.input.pressed(Actions.UP)) {
      this.cursor = (this.cursor - 1 + MAX_SLOTS) % MAX_SLOTS;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this.cursor = (this.cursor + 1) % MAX_SLOTS;
    }

    // Confirm
    if (this.input.pressed(Actions.CONFIRM)) {
      if (this.mode === 'save') {
        const info = GameState.getSaveInfo(this.cursor);
        if (info) {
          this._confirmingOverwrite = true;
        } else {
          this._doSave(this.cursor);
        }
      } else {
        this._doLoad(this.cursor);
      }
    }

    // Cancel
    if (this.input.pressed(Actions.CANCEL)) {
      this.close();
    }
  }

  _doSave(slot) {
    const success = this.gameState.save(slot);
    if (success) {
      this._savedMessage = SAVED_MSG_FRAMES;
    }
  }

  _doLoad(slot) {
    const success = this.gameState.load(slot);
    if (success && this.onLoad) {
      this.onLoad();
    }
    if (success) {
      this.close();
    }
  }

  _formatPlaytime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  render(ctx, frameCount) {
    if (!this.active) return;

    // Overlay
    ctx.fillStyle = Colors.BG_OVERLAY;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Panel
    drawPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, Colors.BG_LIGHT);

    // Header
    const headerText = this.mode === 'save' ? 'SAVE GAME' : 'LOAD GAME';
    const headerX = PANEL_X + Math.floor((PANEL_W - headerText.length * 6) / 2);
    drawText(ctx, headerText, headerX, HEADER_Y, Colors.TEXT_GOLD);

    // Separator
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(PANEL_X + 4, HEADER_Y + 10, PANEL_W - 8, 1);

    // Slots
    for (let i = 0; i < MAX_SLOTS; i++) {
      const y = FIRST_SLOT_Y + i * SLOT_HEIGHT;
      const info = GameState.getSaveInfo(i);

      // Highlight selected slot
      if (i === this.cursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(PANEL_X + 2, y - 1, PANEL_W - 4, SLOT_HEIGHT - 2);
        drawCursor(ctx, CURSOR_X, y + 8, frameCount, Colors.TEXT_LIGHT);
      }

      // Slot number
      const slotColor = i === this.cursor ? Colors.TEXT_LIGHT : Colors.TEXT_DARK;
      drawText(ctx, `Slot ${i + 1}`, TEXT_X, y + 2, slotColor);

      if (info) {
        // Leader name and level
        if (info.name) {
          drawText(ctx, info.name, TEXT_X + 42, y + 2, slotColor);
        }
        drawText(ctx, `Lv ${info.level}`, TEXT_X + 90, y + 2, Colors.TEXT_DIM);
        // Playtime
        const timeStr = this._formatPlaytime(info.playtime || 0);
        drawText(ctx, timeStr, TEXT_X + 126, y + 2, Colors.TEXT_DIM);
        // Map name
        drawText(ctx, info.map || '', TEXT_X, y + 14, Colors.TEXT_DIM);
      } else {
        drawText(ctx, 'Empty', TEXT_X + 60, y + 2, Colors.TEXT_DIM);
      }
    }

    // Overwrite confirmation
    if (this._confirmingOverwrite) {
      const promptW = 160;
      const promptH = 30;
      const promptX = PANEL_X + Math.floor((PANEL_W - promptW) / 2);
      const promptY = PANEL_Y + PANEL_H - 40;
      drawPanel(ctx, promptX, promptY, promptW, promptH, Colors.BG_LIGHT);
      drawText(ctx, 'Overwrite? Z=Yes X=No', promptX + 8, promptY + 10, Colors.TEXT_GOLD);
    }

    // "Saved!" message
    if (this._savedMessage > 0) {
      const msgW = 80;
      const msgH = 24;
      const msgX = PANEL_X + Math.floor((PANEL_W - msgW) / 2);
      const msgY = PANEL_Y + Math.floor((PANEL_H - msgH) / 2);
      drawPanel(ctx, msgX, msgY, msgW, msgH, Colors.BG_LIGHT);
      const savedText = 'Saved!';
      const savedX = msgX + Math.floor((msgW - savedText.length * 6) / 2);
      drawText(ctx, savedText, savedX, msgY + 8, Colors.TEXT_GOLD);
    }
  }
}
