/**
 * Party status and management screen.
 * Shows active + bench members with stats, HP/SP bars.
 * Supports viewing member details and swapping between active/bench.
 */

import { drawPanel, drawCursor, drawBar } from './UIChrome.js';
import { drawText } from '../lib/drawText.js';
import { Colors } from './Colors.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';
import { Actions } from '../systems/InputSystem.js';

const PANEL_X = 4;
const PANEL_Y = 4;
const PANEL_W = 232;
const PANEL_H = 152;
const HEADER_Y = 8;
const LIST_Y = 22;
const ROW_HEIGHT = 26;
const CURSOR_X = PANEL_X + 4;
const TEXT_X = PANEL_X + 14;
const MAX_VISIBLE = 8;
const MAX_ACTIVE = 5;

const State = {
  LIST: 'list',
  DETAIL: 'detail',
  SWAP: 'swap',
};

export class PartyMenu {
  constructor({ input, gameState }) {
    this.input = input;
    this.gameState = gameState;
    this.active = false;
    this.cursor = 0;
    this.state = State.LIST;
    this._swapSource = -1;
    this._scrollOffset = 0;
    this.onClose = null;
  }

  open() {
    this.active = true;
    this.cursor = 0;
    this.state = State.LIST;
    this._swapSource = -1;
    this._scrollOffset = 0;
  }

  close() {
    this.active = false;
    this.state = State.LIST;
    this._swapSource = -1;
    if (this.onClose) this.onClose();
  }

  _getAllMembers() {
    const gs = this.gameState;
    return [...gs.party.active, ...gs.party.bench];
  }

  _getMemberAt(index) {
    const all = this._getAllMembers();
    return all[index] || null;
  }

  _isActiveIndex(index) {
    return index < this.gameState.party.active.length;
  }

  update() {
    if (!this.active) return;

    if (this.state === State.LIST) {
      this._updateList();
    } else if (this.state === State.DETAIL) {
      this._updateDetail();
    } else if (this.state === State.SWAP) {
      this._updateSwap();
    }
  }

  _updateList() {
    const all = this._getAllMembers();
    const count = all.length;
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
      this.state = State.DETAIL;
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this.close();
    }
  }

  _updateDetail() {
    const member = this._getMemberAt(this.cursor);
    if (!member) {
      this.state = State.LIST;
      return;
    }

    // Press confirm to enter swap mode (if not Jesus)
    if (this.input.pressed(Actions.CONFIRM)) {
      if (!member.isJesus) {
        this._swapSource = this.cursor;
        this.state = State.SWAP;
      }
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this.state = State.LIST;
    }
  }

  _updateSwap() {
    const all = this._getAllMembers();
    const count = all.length;

    if (this.input.pressed(Actions.UP)) {
      this.cursor = (this.cursor - 1 + count) % count;
      this._adjustScroll(count);
    }
    if (this.input.pressed(Actions.DOWN)) {
      this.cursor = (this.cursor + 1) % count;
      this._adjustScroll(count);
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      this._performSwap(this._swapSource, this.cursor);
      this.state = State.LIST;
      this._swapSource = -1;
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this.state = State.LIST;
      this._swapSource = -1;
    }
  }

  _performSwap(srcIdx, destIdx) {
    if (srcIdx === destIdx) return;
    const activeLen = this.gameState.party.active.length;
    const benchLen = this.gameState.party.bench.length;

    const srcMember = this._getMemberAt(srcIdx);
    const destMember = this._getMemberAt(destIdx);
    if (!srcMember || !destMember) return;

    // Don't move Jesus to bench
    if (srcMember.isJesus || destMember.isJesus) return;

    const srcActive = srcIdx < activeLen;
    const destActive = destIdx < activeLen;

    if (srcActive && destActive) {
      // Both in active: swap positions
      const tmp = this.gameState.party.active[srcIdx];
      this.gameState.party.active[srcIdx] = this.gameState.party.active[destIdx];
      this.gameState.party.active[destIdx] = tmp;
    } else if (!srcActive && !destActive) {
      // Both on bench: swap positions
      const si = srcIdx - activeLen;
      const di = destIdx - activeLen;
      const tmp = this.gameState.party.bench[si];
      this.gameState.party.bench[si] = this.gameState.party.bench[di];
      this.gameState.party.bench[di] = tmp;
    } else if (srcActive && !destActive) {
      // Active to bench swap
      const benchIdx = destIdx - activeLen;
      this.gameState.swapMember(srcIdx, benchIdx);
    } else {
      // Bench to active swap
      const benchIdx = srcIdx - activeLen;
      // Find a non-Jesus active member to swap with
      if (destIdx < activeLen) {
        this.gameState.swapMember(destIdx, benchIdx);
      }
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

    if (this.state === State.DETAIL) {
      this._renderDetail(ctx, frameCount);
      return;
    }

    // Main panel
    drawPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, Colors.BG_DARK);

    // Header
    let headerText = 'PARTY';
    if (this.state === State.SWAP) headerText = 'SWAP WITH...';
    const headerX = PANEL_X + Math.floor((PANEL_W - headerText.length * 6) / 2);
    drawText(ctx, headerText, headerX, HEADER_Y, Colors.TEXT_GOLD);

    // Separator
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(PANEL_X + 4, HEADER_Y + 10, PANEL_W - 8, 1);

    // Active/Bench label
    const all = this._getAllMembers();
    const activeLen = this.gameState.party.active.length;

    for (let vi = 0; vi < MAX_VISIBLE && vi + this._scrollOffset < all.length; vi++) {
      const i = vi + this._scrollOffset;
      const member = all[i];
      const y = LIST_Y + vi * ROW_HEIGHT;

      // Highlight
      if (i === this.cursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(PANEL_X + 2, y, PANEL_W - 4, ROW_HEIGHT - 1);
        drawCursor(ctx, CURSOR_X, y + 4, frameCount, Colors.TEXT_LIGHT);
      }

      // Swap source highlight
      if (this.state === State.SWAP && i === this._swapSource) {
        ctx.fillStyle = Colors.ACTIVE_SLOT_BG;
        ctx.fillRect(PANEL_X + 2, y, PANEL_W - 4, ROW_HEIGHT - 1);
      }

      // Active/Bench indicator
      const tag = i < activeLen ? 'A' : 'B';
      drawText(ctx, tag, TEXT_X, y + 2, i < activeLen ? Colors.TEXT_GOLD : Colors.TEXT_DIM);

      // Name (dimmed for bench members)
      const nameColor = i < activeLen ? Colors.TEXT_LIGHT : Colors.TEXT_DIM;
      drawText(ctx, member.name, TEXT_X + 12, y + 2, nameColor);

      // Level
      drawText(ctx, `Lv${member.level}`, TEXT_X + 72, y + 2, Colors.TEXT_DIM);

      // Role
      const roleStr = member.role.slice(0, 6);
      drawText(ctx, roleStr, TEXT_X + 108, y + 2, Colors.TEXT_DIM);

      // HP bar
      const barX = TEXT_X + 150;
      drawBar(ctx, barX, y + 2, member.currentHp, member.stats.hp, 60, 4, 'hp');

      // SP bar
      drawBar(ctx, barX, y + 8, member.currentSp, member.stats.sp, 60, 4, Colors.SP_BAR);
    }
  }

  _renderDetail(ctx, frameCount) {
    const member = this._getMemberAt(this.cursor);
    if (!member) return;

    drawPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, Colors.BG_DARK);

    // Name and role
    drawText(ctx, member.name, PANEL_X + 10, 10, Colors.TEXT_LIGHT);
    drawText(ctx, member.role, PANEL_X + 80, 10, Colors.TEXT_DIM);
    drawText(ctx, `Lv ${member.level}`, PANEL_X + 140, 10, Colors.TEXT_GOLD);

    // Separator
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(PANEL_X + 4, 22, PANEL_W - 8, 1);

    // Stats
    const stats = member.stats;
    const col1X = PANEL_X + 10;
    const col2X = PANEL_X + 120;
    let sy = 28;

    // HP / SP with bars
    drawText(ctx, `HP ${member.currentHp}/${stats.hp}`, col1X, sy, Colors.TEXT_LIGHT);
    drawBar(ctx, col1X + 90, sy + 1, member.currentHp, stats.hp, 60, 5, 'hp');
    sy += 12;

    drawText(ctx, `SP ${member.currentSp}/${stats.sp}`, col1X, sy, Colors.TEXT_LIGHT);
    drawBar(ctx, col1X + 90, sy + 1, member.currentSp, stats.sp, 60, 5, Colors.SP_BAR);
    sy += 14;

    // Core stats
    drawText(ctx, `STR ${stats.str}`, col1X, sy, Colors.TEXT_LIGHT);
    drawText(ctx, `DEF ${stats.def}`, col2X, sy, Colors.TEXT_LIGHT);
    sy += 12;
    drawText(ctx, `WIS ${stats.wis}`, col1X, sy, Colors.TEXT_LIGHT);
    drawText(ctx, `FAI ${stats.fai}`, col2X, sy, Colors.TEXT_LIGHT);
    sy += 12;
    drawText(ctx, `SPD ${stats.spd}`, col1X, sy, Colors.TEXT_LIGHT);
    sy += 14;

    // EXP
    drawText(ctx, `EXP ${member.exp}/${member.expToNext}`, col1X, sy, Colors.TEXT_DIM);
    sy += 14;

    // Abilities
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(PANEL_X + 4, sy, PANEL_W - 8, 1);
    sy += 4;

    drawText(ctx, 'Abilities:', col1X, sy, Colors.TEXT_GOLD);
    sy += 12;

    for (let i = 0; i < member.abilities.length; i++) {
      const abX = (i % 2 === 0) ? col1X : col2X;
      const abY = sy + Math.floor(i / 2) * 10;
      drawText(ctx, member.abilities[i], abX, abY, Colors.TEXT_LIGHT);
    }

    // Footer hint
    drawText(ctx, 'Z=Swap  X=Back', PANEL_X + 10, PANEL_Y + PANEL_H - 14, Colors.TEXT_DIM);
  }
}
