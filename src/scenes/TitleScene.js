/**
 * Title screen scene for The Gospel Story.
 * Shows title, subtitle, and menu options (New Game / Continue).
 * Implements enter/update/render per SceneManager contract.
 */

import { drawText, measureText, CELL_H } from '../lib/drawText.js';
import { Colors } from '../ui/Colors.js';
import { drawCursor } from '../ui/UIChrome.js';
import { Actions, InputContext } from '../systems/InputSystem.js';
import { GameState } from '../systems/GameState.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';

const PHASE_PRESS_START = 0;
const PHASE_MENU = 1;

const TITLE_TEXT = 'THE GOSPEL STORY';
const SUBTITLE_TEXT = 'A Journey of Faith';
const PRESS_START_TEXT = 'Press Start';
const NEW_GAME_TEXT = 'New Game';
const CONTINUE_TEXT = 'Continue';

const BG_COLOR = '#181018';

// Blink rate: toggle every 30 frames
const BLINK_INTERVAL = 30;

export class TitleScene {
  constructor({ input, sceneManager, frameCountFn, onNewGame, onContinue }) {
    this._input = input;
    this._sceneManager = sceneManager;
    this._frameCountFn = frameCountFn;
    this._onNewGame = onNewGame;
    this._onContinue = onContinue;

    this._phase = PHASE_PRESS_START;
    this._cursor = 0;
  }

  enter() {
    this._input.context = InputContext.MENU;
    this._phase = PHASE_PRESS_START;
    this._cursor = 0;
  }

  exit() {
    // No cleanup needed
  }

  hasSaveData() {
    for (let i = 0; i < 3; i++) {
      if (GameState.hasSave(i)) return true;
    }
    return false;
  }

  update(_dt) {
    const frameCount = this._frameCountFn();

    if (this._phase === PHASE_PRESS_START) {
      if (
        this._input.pressed(Actions.START) ||
        this._input.pressed(Actions.CONFIRM)
      ) {
        this._phase = PHASE_MENU;
        this._cursor = 0;
      }
      return;
    }

    // PHASE_MENU
    const hasSave = this.hasSaveData();
    const menuLen = hasSave ? 2 : 1;

    if (this._input.pressed(Actions.UP)) {
      this._cursor = (this._cursor - 1 + menuLen) % menuLen;
    }
    if (this._input.pressed(Actions.DOWN)) {
      this._cursor = (this._cursor + 1) % menuLen;
    }

    if (this._input.pressed(Actions.CONFIRM)) {
      if (this._cursor === 0 && this._onNewGame) {
        this._onNewGame();
      } else if (this._cursor === 1 && hasSave && this._onContinue) {
        this._onContinue();
      }
    }
  }

  render(ctx) {
    const frameCount = this._frameCountFn();

    // Dark background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Title: centered, gold
    const titleW = measureText(TITLE_TEXT);
    const titleX = Math.floor((SCREEN_WIDTH - titleW) / 2);
    const titleY = 30;
    drawText(ctx, TITLE_TEXT, titleX, titleY, Colors.TEXT_GOLD);

    // Decorative lines above and below title
    const lineX = titleX - 4;
    const lineW = titleW + 8;
    ctx.fillStyle = Colors.TEXT_GOLD;
    ctx.fillRect(lineX, titleY - 4, lineW, 1);
    ctx.fillRect(lineX, titleY + CELL_H + 3, lineW, 1);

    // Subtitle: centered, lighter
    const subW = measureText(SUBTITLE_TEXT);
    const subX = Math.floor((SCREEN_WIDTH - subW) / 2);
    const subY = titleY + CELL_H + 12;
    drawText(ctx, SUBTITLE_TEXT, subX, subY, Colors.TEXT_LIGHT);

    if (this._phase === PHASE_PRESS_START) {
      // Blinking "Press Start"
      const blink = Math.floor(frameCount / BLINK_INTERVAL) % 2 === 0;
      if (blink) {
        const psW = measureText(PRESS_START_TEXT);
        const psX = Math.floor((SCREEN_WIDTH - psW) / 2);
        const psY = 110;
        drawText(ctx, PRESS_START_TEXT, psX, psY, Colors.TEXT_LIGHT);
      }
    } else {
      // Menu
      const hasSave = this.hasSaveData();
      const menuItems = hasSave
        ? [NEW_GAME_TEXT, CONTINUE_TEXT]
        : [NEW_GAME_TEXT];

      const menuStartY = 100;
      const menuSpacing = CELL_H + 6;
      const cursorOffsetX = 8; // space for cursor before text

      for (let i = 0; i < menuItems.length; i++) {
        const itemW = measureText(menuItems[i]);
        const itemX = Math.floor((SCREEN_WIDTH - itemW) / 2) + Math.floor(cursorOffsetX / 2);
        const itemY = menuStartY + i * menuSpacing;

        drawText(ctx, menuItems[i], itemX, itemY, Colors.TEXT_LIGHT);

        if (i === this._cursor) {
          // Cursor triangle to the left of the text
          drawCursor(ctx, itemX - cursorOffsetX, itemY + 1, frameCount, Colors.TEXT_GOLD);
        }
      }
    }
  }
}
