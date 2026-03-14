/**
 * Battle scene: orchestrates the turn-based combat flow.
 * Manages phases, player input for action/target selection, enemy AI, and victory/defeat.
 */

import { BattleEngine, BattlePhase, ActionType } from '../systems/BattleEngine.js';
import { BattleHUD } from '../ui/BattleHUD.js';
import { ABILITIES, AbilityCategory } from '../data/abilities.js';
import { SCRIPTURE_CHALLENGES, ENEMY_SCRIPTURE } from '../data/scriptures.js';
import { ITEMS, ItemType } from '../data/inventory.js';
import { Actions, InputContext } from '../systems/InputSystem.js';
import { Colors } from '../ui/Colors.js';
import { drawText, wordWrap } from '../lib/drawText.js';
import { drawPanel, drawCursor } from '../ui/UIChrome.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/Display.js';
import { audioManager } from '../audio/AudioManager.js';

const INTRO_FRAMES = 30;
const EXECUTE_FRAMES = 30;
const VICTORY_DISPLAY_FRAMES = 120;

export class BattleScene {
  constructor({ input, transitions, sceneManager, frameCountFn, gameState }) {
    this.input = input;
    this.transitions = transitions;
    this.sceneManager = sceneManager;
    this.getFrameCount = frameCountFn || (() => 0);
    this.gameState = gameState || null;

    this.engine = null;
    this.hud = new BattleHUD();
    this._stateFrames = 0;
    this._onComplete = null;

    // Sub-state for ability selection
    this._selectingAbility = false;
    this._abilityList = [];
    this._abilityCursor = 0;

    // Sub-state for scripture selection
    this._selectingScripture = false;
    this._scriptureChallenge = null;
    this._scriptureCursor = 0;

    // Target selection
    this._selectingTarget = false;
    this._targetType = 'enemy'; // 'enemy' or 'ally'

    // Sub-state for item selection
    this._selectingItem = false;
    this._itemList = [];
    this._itemCursor = 0;

    // Sub-state for item target selection (which party member to use item on)
    this._selectingItemTarget = false;
    this._itemTargetCursor = 0;
    this._pendingItemId = null;
  }

  /**
   * Start a battle with given party and enemies.
   * @param {Function} onComplete - called with 'victory' or 'defeat' when battle ends
   */
  startBattle(party, enemies, onComplete) {
    this.engine = new BattleEngine(party, enemies);
    this.hud = new BattleHUD();
    this._onComplete = onComplete;
    this._stateFrames = 0;
    this._selectingAbility = false;
    this._selectingScripture = false;
    this._scriptureChallenge = null;
    this._scriptureCursor = 0;
    this._selectingTarget = false;
    this._selectingItem = false;
    this._itemList = [];
    this._itemCursor = 0;
    this._selectingItemTarget = false;
    this._itemTargetCursor = 0;
    this._pendingItemId = null;
    this.engine.phase = BattlePhase.INTRO;
  }

  enter() {
    this.input.context = InputContext.BATTLE;
  }

  exit() {}

  update(dt) {
    if (!this.engine) return;

    this._stateFrames++;
    this.hud.updateFloaters();

    switch (this.engine.phase) {
      case BattlePhase.INTRO:
        if (this._stateFrames >= INTRO_FRAMES) {
          this.engine.buildTurnOrder();
          this.engine.nextTurn();
          this._stateFrames = 0;
        }
        break;

      case BattlePhase.SELECT_ACTION:
        this._handleActionInput();
        break;

      case BattlePhase.ENEMY_TURN:
        this.engine.execute();
        this._showResult();
        this._stateFrames = 0;
        this.engine.phase = BattlePhase.EXECUTE;
        break;

      case BattlePhase.EXECUTE:
        if (this._stateFrames >= EXECUTE_FRAMES) {
          const end = this.engine.checkEnd();
          if (end) {
            this._stateFrames = 0;
          } else {
            this.engine.nextTurn();
            this._stateFrames = 0;
          }
        }
        break;

      case BattlePhase.CHECK_END: {
        const end = this.engine.checkEnd();
        if (end) {
          this._stateFrames = 0;
        } else {
          this.engine.nextTurn();
          this._stateFrames = 0;
        }
        break;
      }

      case BattlePhase.VICTORY:
        if (this._stateFrames === 1) {
          audioManager.playBGM('victory');
        }
        if (this._stateFrames >= VICTORY_DISPLAY_FRAMES || this.input.pressed(Actions.CONFIRM)) {
          if (this._onComplete) this._onComplete('victory', this.engine.expGained);
        }
        break;

      case BattlePhase.DEFEAT:
        if (this._stateFrames >= VICTORY_DISPLAY_FRAMES || this.input.pressed(Actions.CONFIRM)) {
          if (this._onComplete) this._onComplete('defeat', 0);
        }
        break;
    }
  }

  render(ctx) {
    if (!this.engine) return;

    const fc = this.getFrameCount();

    // Background
    ctx.fillStyle = '#181028';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Enemies
    this.hud.renderEnemies(ctx, this.engine.enemies, fc);

    // Party strip
    const actorId = this.engine.currentActor?.entity?.id;
    this.hud.renderPartyStrip(ctx, this.engine.party, actorId);

    // Action menu
    if (this.engine.phase === BattlePhase.SELECT_ACTION && !this._selectingAbility && !this._selectingScripture && !this._selectingItem && !this._selectingItemTarget) {
      this.hud.showActionMenu = true;
      this.hud.renderActionMenu(ctx, fc);
    } else {
      this.hud.showActionMenu = false;
    }

    // Ability sub-menu
    if (this._selectingAbility) {
      this._renderAbilityMenu(ctx, fc);
    }

    // Item sub-menu
    if (this._selectingItem) {
      this._renderItemMenu(ctx, fc);
    }

    // Item target selection
    if (this._selectingItemTarget) {
      this._renderItemTargetMenu(ctx, fc);
    }

    // Scripture selection mini-game
    if (this._selectingScripture) {
      this._renderScriptureMenu(ctx, fc);
    }

    // Target selection cursor
    if (this._selectingTarget) {
      this.hud.renderTargetCursor(ctx, this.engine.enemies, fc);
    }

    // Damage floaters
    this.hud.renderFloaters(ctx);

    // Victory/defeat overlay
    if (this.engine.phase === BattlePhase.VICTORY) {
      this._renderVictory(ctx);
    } else if (this.engine.phase === BattlePhase.DEFEAT) {
      this._renderDefeat(ctx);
    }
  }

  _handleActionInput() {
    if (this._selectingScripture) {
      this._handleScriptureInput();
      return;
    }

    if (this._selectingAbility) {
      this._handleAbilityInput();
      return;
    }

    if (this._selectingItemTarget) {
      this._handleItemTargetInput();
      return;
    }

    if (this._selectingItem) {
      this._handleItemInput();
      return;
    }

    if (this._selectingTarget) {
      this._handleTargetInput();
      return;
    }

    if (this.input.pressed(Actions.UP)) {
      this.hud.actionCursor = (this.hud.actionCursor - 1 + 6) % 6;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this.hud.actionCursor = (this.hud.actionCursor + 1) % 6;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const action = this.hud.getSelectedAction();
      this._processActionSelection(action);
    }
  }

  _processActionSelection(action) {
    const member = this.engine.currentActor.entity;

    switch (action) {
      case 'prayer':
      case 'miracles':
      case 'truth': {
        const categoryMap = {
          prayer: AbilityCategory.PRAYER,
          miracles: AbilityCategory.MIRACLE,
          truth: AbilityCategory.TRUTH,
        };
        this._abilityList = member.abilities
          .filter((aId) => ABILITIES[aId]?.category === categoryMap[action])
          .map((aId) => ABILITIES[aId])
          .filter(Boolean);

        if (this._abilityList.length > 0) {
          this._selectingAbility = true;
          this._abilityCursor = 0;
        }
        break;
      }

      case 'scripture': {
        // Pick a scripture challenge based on enemies in battle
        const challenge = this._pickScriptureChallenge();
        if (challenge) {
          this._selectingScripture = true;
          this._scriptureChallenge = challenge;
          this._scriptureCursor = 0;
        }
        break;
      }

      case 'items': {
        if (!this.gameState) break;
        const inventory = this.gameState.inventory;
        this._itemList = inventory.getAll()
          .filter((entry) => entry.def && entry.def.type === ItemType.CONSUMABLE);
        if (this._itemList.length > 0) {
          this._selectingItem = true;
          this._itemCursor = 0;
        }
        break;
      }

      case 'defend':
        this.engine.setAction(ActionType.DEFEND, {});
        this.engine.execute();
        this._showResult();
        this._stateFrames = 0;
        this.engine.phase = BattlePhase.EXECUTE;
        break;
    }
  }

  _handleAbilityInput() {
    if (this.input.pressed(Actions.UP)) {
      this._abilityCursor = (this._abilityCursor - 1 + this._abilityList.length) % this._abilityList.length;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this._abilityCursor = (this._abilityCursor + 1) % this._abilityList.length;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const ability = this._abilityList[this._abilityCursor];
      const member = this.engine.currentActor?.entity;
      // Block selection if player cannot afford the SP cost
      if (member && member.currentSp < ability.spCost) {
        return;
      }
      this._selectingAbility = false;

      // Check if needs target selection
      if (ability.target === 'single_enemy') {
        this._selectingTarget = true;
        this._targetType = 'enemy';
        this.hud.targetCursor = 0;
        this.engine.setAction(ActionType.ABILITY, {
          abilityId: ability.id,
          target: null, // set after target selection
        });
      } else {
        // Auto-target (self, all, etc.)
        const member = this.engine.currentActor.entity;
        this.engine.setAction(ActionType.ABILITY, {
          abilityId: ability.id,
          target: member,
        });
        this.engine.execute();
        this._showResult();
        this._stateFrames = 0;
        this.engine.phase = BattlePhase.EXECUTE;
      }
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this._selectingAbility = false;
    }
  }

  _handleItemInput() {
    if (this.input.pressed(Actions.UP)) {
      this._itemCursor = (this._itemCursor - 1 + this._itemList.length) % this._itemList.length;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this._itemCursor = (this._itemCursor + 1) % this._itemList.length;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const entry = this._itemList[this._itemCursor];
      this._pendingItemId = entry.id;
      this._selectingItem = false;

      // Oil (STR buff) doesn't need target — applies to current actor
      if (entry.def.effect.stat === 'str') {
        const member = this.engine.currentActor.entity;
        this.engine.setAction(ActionType.ITEM, {
          itemId: entry.id,
          useItemFn: () => {
            this.engine.buffs.push({
              target: member,
              type: 'buff_str',
              turnsLeft: 99, // lasts the whole battle
            });
            this.gameState.inventory.remove(entry.id);
          },
        });
        this.engine.execute();
        this._showResult();
        this._stateFrames = 0;
        this.engine.phase = BattlePhase.EXECUTE;
      } else {
        // HP/SP items need a target party member
        this._selectingItemTarget = true;
        this._itemTargetCursor = 0;
      }
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this._selectingItem = false;
    }
  }

  _handleItemTargetInput() {
    const alive = this.engine.party.filter((m) => m.currentHp > 0);

    if (this.input.pressed(Actions.UP)) {
      this._itemTargetCursor = (this._itemTargetCursor - 1 + alive.length) % alive.length;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this._itemTargetCursor = (this._itemTargetCursor + 1) % alive.length;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const target = alive[this._itemTargetCursor];
      const itemId = this._pendingItemId;
      this._selectingItemTarget = false;
      this._pendingItemId = null;

      this.engine.setAction(ActionType.ITEM, {
        itemId,
        useItemFn: () => {
          this.gameState.inventory.useItem(itemId, target);
        },
      });
      this.engine.execute();
      this._showResult();
      this._stateFrames = 0;
      this.engine.phase = BattlePhase.EXECUTE;
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this._selectingItemTarget = false;
      this._pendingItemId = null;
      // Re-open item list
      this._selectingItem = true;
    }
  }

  _handleTargetInput() {
    const alive = this.engine.enemies.filter((e) => e.currentHp > 0);

    if (this.input.pressed(Actions.LEFT)) {
      this.hud.targetCursor = (this.hud.targetCursor - 1 + alive.length) % alive.length;
    }
    if (this.input.pressed(Actions.RIGHT)) {
      this.hud.targetCursor = (this.hud.targetCursor + 1) % alive.length;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const target = alive[this.hud.targetCursor];
      this._selectingTarget = false;

      // Update pending action target
      if (this.engine.pendingAction) {
        this.engine.pendingAction.target = target;
      } else {
        this.engine.setAction(ActionType.ATTACK, { target });
      }

      this.engine.execute();
      this._showResult();
      this._stateFrames = 0;
      this.engine.phase = BattlePhase.EXECUTE;
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this._selectingTarget = false;
      this.engine.pendingAction = null;
    }
  }

  /**
   * Pick a scripture challenge based on enemies present in battle.
   * For Satan, selects the correct temptation challenge based on quest flags.
   * Falls back to ENEMY_SCRIPTURE lookup, then a random challenge.
   */
  _pickScriptureChallenge() {
    const alive = this.engine.enemies.filter((e) => e.currentHp > 0);
    // Try to match an enemy id to a challenge
    for (const enemy of alive) {
      // Per-encounter Satan scripture: pick based on which temptation is unresolved
      if (enemy.id === 'satan' && this.gameState) {
        const flags = this.gameState.questFlags;
        let challengeId;
        if (!flags.temptation_1_resolved) {
          challengeId = 'temptation_bread';
        } else if (!flags.temptation_2_resolved) {
          challengeId = 'temptation_pinnacle';
        } else {
          challengeId = 'temptation_kingdoms';
        }
        if (SCRIPTURE_CHALLENGES[challengeId]) {
          return SCRIPTURE_CHALLENGES[challengeId];
        }
      }

      const challengeId = ENEMY_SCRIPTURE[enemy.id];
      if (challengeId && SCRIPTURE_CHALLENGES[challengeId]) {
        return SCRIPTURE_CHALLENGES[challengeId];
      }
    }
    // Fallback: pick a random challenge
    const keys = Object.keys(SCRIPTURE_CHALLENGES);
    return SCRIPTURE_CHALLENGES[keys[Math.floor(Math.random() * keys.length)]];
  }

  _handleScriptureInput() {
    const options = this._scriptureChallenge.options;

    if (this.input.pressed(Actions.UP)) {
      this._scriptureCursor = (this._scriptureCursor - 1 + options.length) % options.length;
    }
    if (this.input.pressed(Actions.DOWN)) {
      this._scriptureCursor = (this._scriptureCursor + 1) % options.length;
    }

    if (this.input.pressed(Actions.CONFIRM)) {
      const selected = options[this._scriptureCursor];
      this._selectingScripture = false;
      this._scriptureChallenge = null;

      // Proceed to target selection with correct/incorrect result
      this._selectingTarget = true;
      this._targetType = 'enemy';
      this.hud.targetCursor = 0;
      this.engine.setAction(ActionType.SCRIPTURE, {
        target: null,
        correct: selected.correct,
      });
    }

    if (this.input.pressed(Actions.CANCEL)) {
      this._selectingScripture = false;
      this._scriptureChallenge = null;
    }
  }

  /**
   * Render the scripture challenge overlay: challenge text at top, three options below.
   */
  _renderScriptureMenu(ctx, frameCount) {
    const challenge = this._scriptureChallenge;
    if (!challenge) return;

    // Semi-transparent overlay
    ctx.fillStyle = Colors.BG_OVERLAY;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Panel dimensions
    const panelX = 12;
    const panelY = 10;
    const panelW = SCREEN_WIDTH - 24;
    const panelH = 90;

    drawPanel(ctx, panelX, panelY, panelW, panelH, Colors.BG_DARK);

    // Challenge text (word-wrapped, max chars based on panel width / CELL_W=6)
    const maxChars = Math.floor((panelW - 16) / 6);
    const challengeLines = wordWrap(challenge.challenge, maxChars);
    for (let i = 0; i < challengeLines.length; i++) {
      drawText(ctx, challengeLines[i], panelX + 8, panelY + 6 + i * 10, Colors.TEXT_GOLD);
    }

    // Options start below the challenge text
    const optionsY = panelY + 6 + challengeLines.length * 10 + 6;

    for (let i = 0; i < challenge.options.length; i++) {
      const opt = challenge.options[i];
      const oy = optionsY + i * 18;

      // Highlight selected option
      if (i === this._scriptureCursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(panelX + 4, oy - 1, panelW - 8, 16);
        drawCursor(ctx, panelX + 6, oy + 2, frameCount, Colors.TEXT_LIGHT);
      }

      // Verse text (truncated to fit panel width)
      const optMaxChars = Math.floor((panelW - 32) / 6);
      const displayText = opt.text.length > optMaxChars
        ? opt.text.slice(0, optMaxChars - 2) + '..'
        : opt.text;
      drawText(ctx, displayText, panelX + 16, oy, Colors.TEXT_LIGHT);

      // Reference
      drawText(ctx, opt.ref, panelX + 16, oy + 8, Colors.TEXT_DIM);
    }
  }

  _showResult() {
    const result = this.engine.lastResult;
    if (!result) return;

    if (result.type === 'damage' && result.damage !== undefined) {
      audioManager.playSFX('hit');
      const x = 100 + Math.floor(Math.random() * 40);
      const y = result.targetType === 'party' ? 110 : 40;
      this.hud.addFloater(x, y, String(result.damage), Colors.DMG_NORMAL);
    } else if (result.type === 'heal') {
      audioManager.playSFX('heal');
      this.hud.addFloater(100, 110, `+${result.heal}`, Colors.DMG_HEAL);
    } else if (result.type === 'scripture') {
      const color = result.correct ? Colors.DMG_HEAL : Colors.DMG_CRIT;
      const text = result.correct ? `${result.damage}!` : String(result.damage);
      this.hud.addFloater(100, 40, text, color);
    } else if (result.type === 'fail') {
      this.hud.addFloater(100, 110, 'No SP!', Colors.TEXT_DIM);
    }
  }

  _renderAbilityMenu(ctx, frameCount) {
    const x = 144;
    const y = 100;
    const w = 96;
    const h = Math.min(58, this._abilityList.length * 10 + 4);

    drawPanel(ctx, x, y, w, h, Colors.BG_DARK);

    for (let i = 0; i < this._abilityList.length; i++) {
      const ay = y + 2 + i * 10;
      const abil = this._abilityList[i];
      const name = abil.name.slice(0, 12);

      if (i === this._abilityCursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(x + 2, ay - 1, w - 4, 10);
      }

      const member = this.engine.currentActor?.entity;
      const canAfford = member && member.currentSp >= abil.spCost;
      drawText(ctx, name, x + 4, ay, canAfford ? Colors.TEXT_LIGHT : Colors.TEXT_DIM);
      drawText(ctx, String(abil.spCost), x + w - 20, ay, Colors.SP_BAR);
    }
  }

  _renderItemMenu(ctx, frameCount) {
    const x = 144;
    const y = 100;
    const w = 96;
    const h = Math.min(58, this._itemList.length * 10 + 4);

    drawPanel(ctx, x, y, w, h, Colors.BG_DARK);

    for (let i = 0; i < this._itemList.length; i++) {
      const iy = y + 2 + i * 10;
      const entry = this._itemList[i];
      const name = entry.def.name.slice(0, 10);

      if (i === this._itemCursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(x + 2, iy - 1, w - 4, 10);
      }

      drawText(ctx, name, x + 4, iy, Colors.TEXT_LIGHT);
      drawText(ctx, `x${entry.quantity}`, x + w - 24, iy, Colors.TEXT_DIM);
    }
  }

  _renderItemTargetMenu(ctx, frameCount) {
    const alive = this.engine.party.filter((m) => m.currentHp > 0);
    const x = 144;
    const y = 100;
    const w = 96;
    const h = alive.length * 10 + 4;

    drawPanel(ctx, x, y, w, h, Colors.BG_DARK);

    for (let i = 0; i < alive.length; i++) {
      const iy = y + 2 + i * 10;
      const member = alive[i];

      if (i === this._itemTargetCursor) {
        ctx.fillStyle = Colors.CURSOR_BG;
        ctx.fillRect(x + 2, iy - 1, w - 4, 10);
      }

      drawText(ctx, member.name.slice(0, 8), x + 4, iy, Colors.TEXT_LIGHT);
      drawText(ctx, `${member.currentHp}/${member.stats.hp}`, x + w - 40, iy, Colors.HP_BAR);
    }
  }

  _renderVictory(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const victoryText = 'VICTORY';
    const victoryX = Math.floor((SCREEN_WIDTH - victoryText.length * 6) / 2);
    drawText(ctx, victoryText, victoryX, 50, Colors.TEXT_GOLD);
    const expText = `EXP: ${this.engine.expGained}`;
    const expX = Math.floor((SCREEN_WIDTH - expText.length * 6) / 2);
    drawText(ctx, expText, expX, 70, Colors.TEXT_LIGHT);
    const pressText = 'Press Z';
    const pressX = Math.floor((SCREEN_WIDTH - pressText.length * 6) / 2);
    drawText(ctx, pressText, pressX, 100, Colors.TEXT_DIM);
  }

  _renderDefeat(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const fallenText = 'FALLEN';
    const fallenX = Math.floor((SCREEN_WIDTH - fallenText.length * 6) / 2);
    drawText(ctx, fallenText, fallenX, 50, Colors.DMG_CRIT);
    const defPressText = 'Press Z';
    const defPressX = Math.floor((SCREEN_WIDTH - defPressText.length * 6) / 2);
    drawText(ctx, defPressText, defPressX, 100, Colors.TEXT_DIM);
  }
}
