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
import { gainExp } from '../data/partyData.js';

const INTRO_FRAMES = 30;
const EXECUTE_FRAMES = 30;
const VICTORY_FADE_FRAMES = 30;
const DEFEAT_FADE_FRAMES = 60;
const AUTO_ADVANCE_FRAMES = 180; // 3 sec at 60fps

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

    // Defeat menu state
    this._defeatCursor = 0;

    // Victory level-up state
    this._levelUpResults = [];
    this._levelUpMemberIndex = -1; // -1 = EXP screen, 0+ = level-up member
    this._typewriterChars = 0;
    this._victoryAutoTimer = 0;
  }

  /**
   * Start a battle with given party and enemies.
   * @param {Function} onComplete - called with 'victory', 'defeat', or 'retry' when battle ends
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
    this._defeatCursor = 0;
    this._levelUpResults = [];
    this._levelUpMemberIndex = -1;
    this._typewriterChars = 0;
    this._victoryAutoTimer = 0;
    this.engine.phase = BattlePhase.INTRO;
  }

  enter() {
    this.input.context = InputContext.BATTLE;
  }

  exit() {
    // Reset all sub-state so stale menus/selections don't bleed into the next scene entry
    this._selectingAbility = false;
    this._selectingScripture = false;
    this._scriptureChallenge = null;
    this._selectingTarget = false;
    this._selectingItem = false;
    this._selectingItemTarget = false;
    this._pendingItemId = null;
    audioManager.stopBGM();
  }

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
          this._awardExp();
          this._levelUpMemberIndex = -1;
          this._typewriterChars = 0;
          this._victoryAutoTimer = 0;
        }
        if (this._stateFrames <= VICTORY_FADE_FRAMES) break;
        this._victoryAutoTimer++;
        if (this._levelUpMemberIndex >= 0 && this._levelUpMemberIndex < this._levelUpResults.length) {
          this._typewriterChars += 2;
        }
        if (this.input.pressed(Actions.CONFIRM) || this._victoryAutoTimer >= AUTO_ADVANCE_FRAMES) {
          this._advanceVictory();
        }
        break;

      case BattlePhase.DEFEAT:
        if (this._stateFrames === 1) {
          this._defeatCursor = 0;
        }
        if (this._stateFrames <= DEFEAT_FADE_FRAMES) break;
        if (this.input.pressed(Actions.UP) || this.input.pressed(Actions.DOWN)) {
          this._defeatCursor = this._defeatCursor === 0 ? 1 : 0;
        }
        if (this.input.pressed(Actions.CONFIRM)) {
          if (this._defeatCursor === 0) {
            this._completeDefeat('retry');
          } else {
            this._completeDefeat('defeat');
          }
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

  /** Award EXP to living party members and collect level-up results for display. */
  _awardExp() {
    const exp = this.engine.expGained;
    if (exp <= 0) return;
    this._levelUpResults = [];
    for (const member of this.engine.party) {
      if (member.currentHp > 0) {
        const levelUps = gainExp(member, exp);
        if (levelUps.length > 0) {
          this._levelUpResults.push({ name: member.name, levelUps });
        }
      }
    }
  }

  /** Advance victory display: EXP screen → level-ups → complete. */
  _advanceVictory() {
    if (this._levelUpMemberIndex < 0) {
      // On EXP screen
      if (this._levelUpResults.length > 0) {
        this._levelUpMemberIndex = 0;
        this._typewriterChars = 0;
        this._victoryAutoTimer = 0;
      } else {
        this._completeVictory();
      }
    } else if (this._levelUpMemberIndex < this._levelUpResults.length) {
      const totalChars = this._getLevelUpCharCount(this._levelUpMemberIndex);
      if (this._typewriterChars >= totalChars) {
        // Fully revealed, advance to next member or complete
        this._levelUpMemberIndex++;
        this._typewriterChars = 0;
        this._victoryAutoTimer = 0;
        if (this._levelUpMemberIndex >= this._levelUpResults.length) {
          this._completeVictory();
        }
      } else {
        // Snap typewriter to full reveal
        this._typewriterChars = totalChars;
        this._victoryAutoTimer = 0;
      }
    } else {
      this._completeVictory();
    }
  }

  _completeVictory() {
    if (this._onComplete) {
      const cb = this._onComplete;
      this._onComplete = null;
      cb('victory', this.engine.expGained);
    }
  }

  _completeDefeat(result) {
    if (this._onComplete) {
      const cb = this._onComplete;
      this._onComplete = null;
      cb(result, 0);
    }
  }

  _buildLevelUpLines(memberIndex) {
    const result = this._levelUpResults[memberIndex];
    const lines = [];
    const totalGains = {};
    let finalLevel = 0;
    for (const lu of result.levelUps) {
      finalLevel = lu.level;
      for (const [stat, val] of Object.entries(lu.gains)) {
        totalGains[stat] = (totalGains[stat] || 0) + val;
      }
    }
    lines.push(`${result.name} -> Level ${finalLevel}!`);
    const entries = Object.entries(totalGains).filter(([, v]) => v > 0);
    for (let i = 0; i < entries.length; i += 3) {
      const chunk = entries.slice(i, i + 3);
      lines.push(chunk.map(([s, v]) => `${s.toUpperCase()} +${v}`).join('  '));
    }
    return lines;
  }

  _getLevelUpCharCount(memberIndex) {
    return this._buildLevelUpLines(memberIndex).reduce((sum, l) => sum + l.length, 0);
  }

  _showResult() {
    const result = this.engine.lastResult;
    if (!result) return;

    if (result.type === 'damage' && result.damage !== undefined) {
      audioManager.playSFX('hit');
      const x = 100 + Math.floor(Math.random() * 40);
      const y = result.targetType === 'party' ? 110 : 40;
      if (result.miss) {
        this.hud.addFloater(x, y, 'MISS', Colors.DMG_MISS);
      } else if (result.blocked) {
        this.hud.addFloater(x, y, 'Blocked', Colors.DMG_MISS);
      } else {
        this.hud.addFloater(x, y, String(result.damage), Colors.DMG_NORMAL);
      }
    } else if (result.type === 'heal') {
      audioManager.playSFX('heal');
      this.hud.addFloater(100, 110, `+${result.heal}`, Colors.DMG_HEAL);
    } else if (result.type === 'scripture') {
      const color = result.correct ? Colors.DMG_HEAL : Colors.DMG_CRIT;
      const text = result.correct ? `${result.damage}!` : String(result.damage);
      this.hud.addFloater(100, 40, text, color);
    } else if (result.type === 'scan') {
      const enemy = result.enemy;
      if (enemy) {
        const info = `${enemy.name} HP:${enemy.currentHp}/${enemy.stats.hp}`;
        this.hud.addFloater(60, 30, info, Colors.TEXT_GOLD);
        if (enemy.weakness) {
          this.hud.addFloater(60, 42, `Weak: ${enemy.weakness}`, Colors.DMG_HEAL);
        }
      }
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
    // Spec: 30-frame fade to black (globalAlpha stepping 1/30 per frame)
    const fadeAlpha = Math.min(this._stateFrames / VICTORY_FADE_FRAMES, 1);
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.globalAlpha = 1;

    if (this._stateFrames <= VICTORY_FADE_FRAMES) return;

    // Panel with results
    const panelX = 20;
    const panelY = 15;
    const panelW = SCREEN_WIDTH - 40;
    const panelH = SCREEN_HEIGHT - 30;
    drawPanel(ctx, panelX, panelY, panelW, panelH, Colors.BG_DARK);

    const victoryText = 'VICTORY';
    const victoryX = Math.floor((SCREEN_WIDTH - victoryText.length * 6) / 2);
    drawText(ctx, victoryText, victoryX, panelY + 8, Colors.TEXT_GOLD);

    const expText = `EXP: ${this.engine.expGained}`;
    const expX = Math.floor((SCREEN_WIDTH - expText.length * 6) / 2);
    drawText(ctx, expText, expX, panelY + 22, Colors.TEXT_LIGHT);

    // Per-member level-up reveal with typewriter animation (2 chars/frame)
    if (this._levelUpMemberIndex >= 0 && this._levelUpMemberIndex < this._levelUpResults.length) {
      const lines = this._buildLevelUpLines(this._levelUpMemberIndex);
      let charsLeft = this._typewriterChars;
      let lineY = panelY + 40;
      for (const line of lines) {
        if (charsLeft <= 0) break;
        const visible = Math.min(charsLeft, line.length);
        const color = lineY === panelY + 40 ? Colors.TEXT_GOLD : Colors.TEXT_LIGHT;
        drawText(ctx, line.slice(0, visible), panelX + 10, lineY, color);
        charsLeft -= line.length;
        lineY += 12;
      }
    }

    const promptText = 'Press Z';
    const promptX = Math.floor((SCREEN_WIDTH - promptText.length * 6) / 2);
    drawText(ctx, promptText, promptX, panelY + panelH - 14, Colors.TEXT_DIM);
  }

  _renderDefeat(ctx) {
    // Spec: 60-frame slow fade to black (globalAlpha stepping 1/60 per frame)
    const fadeAlpha = Math.min(this._stateFrames / DEFEAT_FADE_FRAMES, 1);
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.globalAlpha = 1;

    if (this._stateFrames <= DEFEAT_FADE_FRAMES) return;

    // FALLEN panel with menu
    const panelX = 30;
    const panelY = 30;
    const panelW = SCREEN_WIDTH - 60;
    const panelH = 95;
    drawPanel(ctx, panelX, panelY, panelW, panelH, Colors.BG_DARK);

    const fallenText = 'FALLEN';
    const fallenX = Math.floor((SCREEN_WIDTH - fallenText.length * 6) / 2);
    drawText(ctx, fallenText, fallenX, panelY + 8, Colors.DMG_CRIT);

    const flavorText = 'Your faith was not enough...';
    const flavorX = Math.floor((SCREEN_WIDTH - flavorText.length * 6) / 2);
    drawText(ctx, flavorText, flavorX, panelY + 24, Colors.TEXT_DIM);

    const fc = this.getFrameCount();
    const menuX = panelX + 14;
    const optW = panelW - 28;

    const opt0 = 'Retry from last save';
    const opt0Y = panelY + 46;
    if (this._defeatCursor === 0) {
      ctx.fillStyle = Colors.CURSOR_BG;
      ctx.fillRect(menuX - 2, opt0Y - 1, optW, 14);
      drawCursor(ctx, menuX, opt0Y + 3, fc, Colors.TEXT_LIGHT);
    }
    drawText(ctx, opt0, menuX + 10, opt0Y + 1, Colors.TEXT_LIGHT);

    const opt1 = 'Return to title';
    const opt1Y = panelY + 66;
    if (this._defeatCursor === 1) {
      ctx.fillStyle = Colors.CURSOR_BG;
      ctx.fillRect(menuX - 2, opt1Y - 1, optW, 14);
      drawCursor(ctx, menuX, opt1Y + 3, fc, Colors.TEXT_LIGHT);
    }
    drawText(ctx, opt1, menuX + 10, opt1Y + 1, Colors.TEXT_LIGHT);
  }
}
