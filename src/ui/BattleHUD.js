/**
 * Battle HUD per specs/ui-hud.md §5.
 * Top: enemy area with sprites + HP bars.
 * Bottom: party strip with HP/SP bars.
 * Right panel: action menu.
 */

import { drawText } from '../lib/drawText.js';
import { drawBar, drawPanel, drawCursor } from './UIChrome.js';
import { Colors } from './Colors.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';

const PARTY_STRIP_Y = 100;
const SLOT_WIDTH = 47;
const ACTION_PANEL_X = 144;
const ACTION_PANEL_W = 96;

const ACTION_OPTIONS = ['Prayer', 'Miracles', 'Truth', 'Scripture', 'Items', 'Defend'];

export class BattleHUD {
  constructor() {
    this.actionCursor = 0;
    this.targetCursor = 0;
    this.showActionMenu = false;
    this.damageFloaters = [];
  }

  /**
   * Add a floating damage number.
   */
  addFloater(x, y, text, color) {
    this.damageFloaters.push({
      x,
      y,
      text: String(text),
      color,
      frame: 0,
      maxFrames: 50,
    });
  }

  updateFloaters() {
    this.damageFloaters = this.damageFloaters.filter((f) => {
      f.frame++;
      f.y -= 1;
      return f.frame < f.maxFrames;
    });
  }

  renderEnemies(ctx, enemies, frameCount) {
    const alive = enemies.filter((e) => e.currentHp > 0);
    const count = alive.length;
    if (count === 0) return;

    const spacing = SCREEN_WIDTH / (count + 1);

    for (let i = 0; i < count; i++) {
      const enemy = alive[i];
      const cx = Math.floor(spacing * (i + 1));
      const y = 20;

      // Placeholder enemy sprite (colored rectangle)
      ctx.fillStyle = enemy.isBoss ? '#8B0000' : '#604080';
      ctx.fillRect(cx - 16, y, 32, 32);

      // Name
      const nameX = cx - Math.floor(enemy.name.length * 3);
      drawText(ctx, enemy.name, nameX, y + 39, Colors.TEXT_LIGHT);

      // HP bar
      drawBar(ctx, cx - 20, y + 44, enemy.currentHp, enemy.stats.hp, 40, 3, 'hp');
    }
  }

  renderPartyStrip(ctx, party, currentActorId) {
    // Background
    ctx.fillStyle = Colors.BG_DARK;
    ctx.fillRect(0, PARTY_STRIP_Y, SCREEN_WIDTH, SCREEN_HEIGHT - PARTY_STRIP_Y);

    // Top border
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(0, PARTY_STRIP_Y, SCREEN_WIDTH, 1);

    for (let i = 0; i < party.length && i < 5; i++) {
      const member = party[i];
      const x = i * SLOT_WIDTH;
      const y = PARTY_STRIP_Y + 2;

      // Active highlight
      if (member.id === currentActorId) {
        ctx.fillStyle = Colors.ACTIVE_SLOT_BG;
        ctx.fillRect(x, PARTY_STRIP_Y + 1, SLOT_WIDTH, 59);
      }

      // Divider
      if (i > 0) {
        ctx.fillStyle = Colors.BORDER;
        ctx.fillRect(x, PARTY_STRIP_Y + 1, 1, 59);
      }

      // Name (truncated to 5 chars)
      const name = member.name.slice(0, 5);
      drawText(ctx, name, x + 2, y + 2, member.currentHp > 0 ? Colors.TEXT_LIGHT : Colors.TEXT_DIM);

      // HP bar
      drawText(ctx, 'HP', x + 2, y + 12, Colors.HP_HIGH);
      drawBar(ctx, x + 2, y + 20, member.currentHp, member.stats.hp, 36, 3, 'hp');

      // SP bar
      drawText(ctx, 'SP', x + 2, y + 26, Colors.SP_BAR);
      drawBar(ctx, x + 2, y + 34, member.currentSp, member.stats.sp, 36, 3, Colors.SP_BAR);

      // Level
      drawText(ctx, `L${member.level}`, x + 2, y + 42, Colors.TEXT_DIM);
    }
  }

  renderActionMenu(ctx, frameCount) {
    if (!this.showActionMenu) return;

    drawPanel(ctx, ACTION_PANEL_X, PARTY_STRIP_Y + 1, ACTION_PANEL_W, 58, Colors.BG_DARK);

    for (let i = 0; i < ACTION_OPTIONS.length; i++) {
      const y = PARTY_STRIP_Y + 3 + i * 9;

      if (i === this.actionCursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(ACTION_PANEL_X + 2, y - 1, ACTION_PANEL_W - 4, 9);
        drawCursor(ctx, ACTION_PANEL_X + 4, y + 1, frameCount, Colors.TEXT_LIGHT);
      }

      drawText(ctx, ACTION_OPTIONS[i], ACTION_PANEL_X + 14, y, Colors.TEXT_LIGHT);
    }
  }

  renderFloaters(ctx) {
    for (const f of this.damageFloaters) {
      const alpha = f.frame < 40 ? 1 : 1 - (f.frame - 40) / 10;
      if (alpha <= 0) continue;
      ctx.globalAlpha = Math.max(0, alpha);
      drawText(ctx, f.text, f.x, f.y, f.color);
      ctx.globalAlpha = 1;
    }
  }

  renderTargetCursor(ctx, enemies, frameCount) {
    const alive = enemies.filter((e) => e.currentHp > 0);
    if (this.targetCursor >= alive.length) this.targetCursor = 0;
    if (alive.length === 0) return;

    const spacing = SCREEN_WIDTH / (alive.length + 1);
    const cx = Math.floor(spacing * (this.targetCursor + 1));

    // Blinking arrow above enemy
    if (Math.floor(frameCount / 20) % 2 === 0) {
      ctx.fillStyle = Colors.TEXT_LIGHT;
      ctx.fillRect(cx - 2, 10, 5, 1);
      ctx.fillRect(cx - 1, 11, 3, 1);
      ctx.fillRect(cx, 12, 1, 1);
    }
  }

  getSelectedAction() {
    return ACTION_OPTIONS[this.actionCursor].toLowerCase();
  }
}
