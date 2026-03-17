/**
 * Dialogue box renderer per specs/ui-hud.md §2 and specs/dialogue-system.md.
 * Handles text display, typewriter reveal, choices, and advance arrow.
 */

import { drawText, drawTextPartial, wordWrap, CELL_W, CELL_H } from '../lib/drawText.js';
import { drawPanel, drawAdvanceArrow, drawCursor } from './UIChrome.js';
import { Colors } from './Colors.js';
import { SCREEN_WIDTH } from '../engine/Display.js';
import { gameSettings } from './gameSettings.js';

// Layout constants per spec
const BOX_X = 0;
const BOX_Y = 118;
const BOX_W = 240;
const BOX_H = 42;
const PADDING = 2;
const NAME_X = 4;
const NAME_Y = 120;
const BODY_Y = 130;
const LINE_HEIGHT = 9;
const MAX_CHARS_PER_LINE = 38;
const LINES_PER_PAGE = 2;
const ARROW_X = 231;
const ARROW_Y = 149;
const MAX_VISIBLE_CHOICES = 4;

export class DialogueBox {
  constructor() {
    this.active = false;
    this.speaker = '';
    this.pages = [];       // array of { lines: string[] }
    this.pageIndex = 0;
    this.revealIndex = 0;
    this.fullyRevealed = false;

    // Choice state
    this.choices = null;   // null or array of { text, next }
    this.choiceIndex = 0;
  }

  /**
   * Open dialogue box with text and optional speaker.
   * Text is word-wrapped and split into pages.
   */
  open(speaker, text) {
    this.active = true;
    this.speaker = speaker || '';
    this.pageIndex = 0;
    this.revealIndex = 0;
    this.fullyRevealed = false;
    this.choices = null;
    this.choiceIndex = 0;

    // Word wrap and paginate
    const lines = wordWrap(text, MAX_CHARS_PER_LINE);
    this.pages = [];
    for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
      this.pages.push({ lines: lines.slice(i, i + LINES_PER_PAGE) });
    }
  }

  /**
   * Show choice options (displayed below question text).
   */
  showChoices(choices) {
    this.choices = choices;
    this.choiceIndex = 0;
    this._choiceScrollOffset = 0;
    this.fullyRevealed = true;
  }

  close() {
    this.active = false;
    this.pages = [];
    this.choices = null;
  }

  /**
   * Update typewriter reveal. Called once per frame.
   */
  update() {
    if (!this.active || this.fullyRevealed) return;

    const page = this.pages[this.pageIndex];
    if (!page) return;

    const totalChars = page.lines.reduce((sum, l) => sum + l.length, 0);
    this.revealIndex += gameSettings.textSpeed;

    if (this.revealIndex >= totalChars) {
      this.revealIndex = totalChars;
      this.fullyRevealed = true;
    }
  }

  /**
   * Handle confirm/action press.
   * Returns: null (still showing), 'next' (advance to next page), 'done' (all pages shown),
   * or { choiceIndex, choice } if a choice was selected.
   */
  onConfirm() {
    if (!this.active) return null;

    // If choices are showing, select current choice
    if (this.choices) {
      return { choiceIndex: this.choiceIndex, choice: this.choices[this.choiceIndex] };
    }

    // If not fully revealed, skip to full
    if (!this.fullyRevealed) {
      const page = this.pages[this.pageIndex];
      if (page) {
        this.revealIndex = page.lines.reduce((sum, l) => sum + l.length, 0);
      }
      this.fullyRevealed = true;
      return null;
    }

    // Advance to next page
    this.pageIndex++;
    if (this.pageIndex >= this.pages.length) {
      return 'done';
    }

    this.revealIndex = 0;
    this.fullyRevealed = false;
    return 'next';
  }

  /**
   * Handle directional input for choice navigation.
   * Caps visible choices at MAX_VISIBLE_CHOICES with scroll offset.
   */
  onDirection(dir) {
    if (!this.choices) return;

    if (dir === 'up') {
      this.choiceIndex = (this.choiceIndex - 1 + this.choices.length) % this.choices.length;
    } else if (dir === 'down') {
      this.choiceIndex = (this.choiceIndex + 1) % this.choices.length;
    }
    // Keep scroll offset so the selected choice is always visible
    if (this.choices.length > MAX_VISIBLE_CHOICES) {
      if (this.choiceIndex < this._choiceScrollOffset) {
        this._choiceScrollOffset = this.choiceIndex;
      } else if (this.choiceIndex >= this._choiceScrollOffset + MAX_VISIBLE_CHOICES) {
        this._choiceScrollOffset = this.choiceIndex - MAX_VISIBLE_CHOICES + 1;
      }
    }
  }

  /**
   * Render the dialogue box.
   */
  render(ctx, frameCount) {
    if (!this.active) return;

    // Background panel
    ctx.fillStyle = Colors.BG_DIALOG;
    ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);

    // Border
    ctx.fillStyle = Colors.BORDER;
    ctx.fillRect(BOX_X, BOX_Y, BOX_W, 1);
    ctx.fillRect(BOX_X, BOX_Y + BOX_H - 1, BOX_W, 1);
    ctx.fillRect(BOX_X, BOX_Y, 1, BOX_H);
    ctx.fillRect(BOX_X + BOX_W - 1, BOX_Y, 1, BOX_H);

    // Speaker name
    if (this.speaker) {
      drawText(ctx, this.speaker, NAME_X, NAME_Y, Colors.TEXT_GOLD);
      // Separator rule
      ctx.fillStyle = Colors.BORDER_RULE;
      const nameW = this.speaker.length * CELL_W + 4;
      ctx.fillRect(NAME_X, NAME_Y + CELL_H, nameW, 1);
    }

    // Text body — always rendered; choices rendered below when active
    if (this.choices) {
      this._renderQuestionHeader(ctx);
      this._renderChoices(ctx, frameCount);
    } else {
      this._renderTextBody(ctx, frameCount);
    }
  }

  _renderTextBody(ctx, frameCount) {
    const page = this.pages[this.pageIndex];
    if (!page) return;

    let charsDrawn = 0;
    for (let i = 0; i < page.lines.length; i++) {
      const line = page.lines[i];
      const lineY = BODY_Y + i * LINE_HEIGHT;
      const remaining = this.revealIndex - charsDrawn;

      if (remaining <= 0) break;

      drawTextPartial(ctx, line, NAME_X, lineY, Colors.TEXT_LIGHT, remaining);
      charsDrawn += line.length;
    }

    // Advance arrow when fully revealed (signals more pages or close)
    if (this.fullyRevealed) {
      drawAdvanceArrow(ctx, ARROW_X, ARROW_Y, frameCount);
    }
  }

  /**
   * Render the last page of question text as a header above choices.
   * Shows speaker name context when choices are active (UI-01).
   */
  _renderQuestionHeader(ctx) {
    const page = this.pages[this.pages.length - 1];
    if (!page) return;
    // Render first line of the last page as question header
    const line = page.lines[0];
    if (line) {
      drawText(ctx, line, NAME_X, BODY_Y, Colors.TEXT_LIGHT);
    }
  }

  _renderChoices(ctx, frameCount) {
    // Choices render one line below the question header (UI-01)
    const choiceStartY = BODY_Y + LINE_HEIGHT;
    const visibleCount = Math.min(this.choices.length, MAX_VISIBLE_CHOICES);
    const offset = this._choiceScrollOffset || 0;

    for (let i = 0; i < visibleCount; i++) {
      const choiceIdx = offset + i;
      if (choiceIdx >= this.choices.length) break;
      const choice = this.choices[choiceIdx];
      const y = choiceStartY + i * LINE_HEIGHT;

      if (choiceIdx === this.choiceIndex) {
        // Highlight bar
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(NAME_X, y - 1, BOX_W - NAME_X * 2, LINE_HEIGHT);
        drawCursor(ctx, NAME_X, y + 1, frameCount, Colors.TEXT_LIGHT);
        drawText(ctx, choice.text, NAME_X + 8, y, Colors.TEXT_LIGHT);
      } else {
        drawText(ctx, choice.text, NAME_X + 8, y, Colors.TEXT_LIGHT);
      }
    }
  }
}
