/**
 * Item use screen.
 * Lists inventory items with quantities, allows using consumables on party members.
 */

import { drawPanel, drawCursor, drawBar } from './UIChrome.js';
import { drawText } from '../lib/drawText.js';
import { Colors } from './Colors.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';
import { Actions } from '../systems/InputSystem.js';
import { ItemType } from '../data/inventory.js';

const PANEL_X = 4;
const PANEL_Y = 4;
const PANEL_W = 232;
const PANEL_H = 152;
const HEADER_Y = 8;
const LIST_Y = 24;
const ROW_HEIGHT = 12;
const CURSOR_X = PANEL_X + 4;
const TEXT_X = PANEL_X + 14;
const MAX_VISIBLE = 7;
const DESC_Y = PANEL_Y + PANEL_H - 24;

const State = {
  ITEMS: 'items',
  TARGET: 'target',
};

export class ItemMenu {
  constructor({ input, gameState }) {
    this.input = input;
    this.gameState = gameState;
    this.active = false;
    this.cursor = 0;
    this._scrollOffset = 0;
    this._state = State.ITEMS;
    this._targetCursor = 0;
    this.onClose = null;
  }

  open() {
    this.active = true;
    this.cursor = 0;
    this._scrollOffset = 0;
    this._state = State.ITEMS;
    this._targetCursor = 0;
  }

  close() {
    this.active = false;
    this._state = State.ITEMS;
    if (this.onClose) this.onClose();
  }

  _getItems() {
    return this.gameState.inventory.getAll();
  }

  update() {
    if (!this.active) return;

    if (this._state === State.ITEMS) {
      this._updateItems();
    } else if (this._state === State.TARGET) {
      this._updateTarget();
    }
  }

  _updateItems() {
    const items = this._getItems();
    const count = items.length;

    if (count === 0) {
      if (this.input.pressed(Actions.CANCEL)) this.close();
      return;
    }

    if (this.input.pressed(Actions.UP)) {
      this.cursor = (this.cursor - 1 + count) % count;
      this._adjustScroll(count);
    }
    if (this.input.pressed(Actions.DOWN)) {
      this.cursor = (this.cursor + 1) % count;
      this._adjustScroll(count);
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const item = items[this.cursor];
      if (item && item.def && item.def.type === ItemType.CONSUMABLE) {
        this._state = State.TARGET;
        this._targetCursor = 0;
      }
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this.close();
    }
  }

  _updateTarget() {
    const party = this.gameState.party.active;
    const count = party.length;

    if (count === 0) {
      this._state = State.ITEMS;
      return;
    }

    if (this.input.pressed(Actions.UP)) {
      this._targetCursor = (this._targetCursor - 1 + count) % count;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this._targetCursor = (this._targetCursor + 1) % count;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const items = this._getItems();
      const item = items[this.cursor];
      if (item) {
        const target = party[this._targetCursor];
        const used = this.gameState.inventory.useItem(item.id, target);
        if (used) {
          // If item is fully consumed and cursor is past end, adjust
          const newItems = this._getItems();
          if (this.cursor >= newItems.length && newItems.length > 0) {
            this.cursor = newItems.length - 1;
          }
          this._state = State.ITEMS;
        }
      }
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this._state = State.ITEMS;
    }
  }

  _adjustScroll(count) {
    if (this.cursor < this._scrollOffset) {
      this._scrollOffset = this.cursor;
    } else if (this.cursor >= this._scrollOffset + MAX_VISIBLE) {
      this._scrollOffset = this.cursor - MAX_VISIBLE + 1;
    }
  }

  render(ctx, frameCount) {
    if (!this.active) return;

    // Overlay
    ctx.fillStyle = Colors.BG_OVERLAY;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Main panel
    drawPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, Colors.BG_LIGHT);

    // Header
    const headerText = 'ITEMS';
    const headerX = PANEL_X + Math.floor((PANEL_W - headerText.length * 6) / 2);
    drawText(ctx, headerText, headerX, HEADER_Y, Colors.TEXT_GOLD);

    // Separator
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(PANEL_X + 4, HEADER_Y + 10, PANEL_W - 8, 1);

    const items = this._getItems();

    if (items.length === 0) {
      drawText(ctx, 'No items', TEXT_X, LIST_Y + 10, Colors.TEXT_DIM);
    }

    // Item list (left side when targeting, full width otherwise)
    const listW = this._state === State.TARGET ? 120 : PANEL_W - 16;

    for (let vi = 0; vi < MAX_VISIBLE && vi + this._scrollOffset < items.length; vi++) {
      const i = vi + this._scrollOffset;
      const item = items[i];
      const y = LIST_Y + vi * ROW_HEIGHT;

      // Highlight
      if (i === this.cursor && this._state === State.ITEMS) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(PANEL_X + 2, y, listW, ROW_HEIGHT - 1);
        drawCursor(ctx, CURSOR_X, y + 2, frameCount, Colors.TEXT_LIGHT);
      } else if (i === this.cursor && this._state === State.TARGET) {
        ctx.fillStyle = Colors.ACTIVE_SLOT_BG;
        ctx.fillRect(PANEL_X + 2, y, listW, ROW_HEIGHT - 1);
      }

      // Item name
      const name = item.def ? item.def.name : item.id;
      const nameColor = (i === this.cursor && this._state === State.ITEMS) ? Colors.TEXT_LIGHT : Colors.TEXT_DARK;
      drawText(ctx, name, TEXT_X, y + 2, nameColor);

      // Quantity
      const qtyStr = `x${item.quantity}`;
      drawText(ctx, qtyStr, TEXT_X + 90, y + 2, Colors.TEXT_DIM);

      // Key item indicator
      if (item.def && item.def.type === ItemType.KEY) {
        drawText(ctx, '[Key]', TEXT_X + 108, y + 2, Colors.TEXT_GOLD);
      }
    }

    // Description at bottom
    if (items.length > 0 && items[this.cursor]) {
      const desc = items[this.cursor].def ? items[this.cursor].def.description : '';
      ctx.fillStyle = Colors.BORDER;
      ctx.fillRect(PANEL_X + 4, DESC_Y - 4, PANEL_W - 8, 1);
      drawText(ctx, desc.slice(0, 36), PANEL_X + 8, DESC_Y, Colors.TEXT_DIM);
    }

    // Target selection panel (party members)
    if (this._state === State.TARGET) {
      this._renderTargetPanel(ctx, frameCount);
    }
  }

  _renderTargetPanel(ctx, frameCount) {
    const tpX = PANEL_X + 130;
    const tpY = PANEL_Y + 18;
    const tpW = 98;
    const party = this.gameState.party.active;
    const tpH = 10 + party.length * 18;

    drawPanel(ctx, tpX, tpY, tpW, tpH, Colors.BG_LIGHT);
    drawText(ctx, 'Use on:', tpX + 4, tpY + 2, Colors.TEXT_GOLD);

    for (let i = 0; i < party.length; i++) {
      const m = party[i];
      const y = tpY + 12 + i * 18;

      if (i === this._targetCursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(tpX + 2, y, tpW - 4, 16);
        drawCursor(ctx, tpX + 4, y + 4, frameCount, Colors.TEXT_LIGHT);
      }

      const tColor = i === this._targetCursor ? Colors.TEXT_LIGHT : Colors.TEXT_DARK;
      drawText(ctx, m.name, tpX + 14, y + 2, tColor);
      drawBar(ctx, tpX + 14, y + 10, m.currentHp, m.stats.hp, 40, 3, 'hp');
    }
  }
}
