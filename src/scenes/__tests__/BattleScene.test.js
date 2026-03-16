import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BattleScene } from '../BattleScene.js';
import { BattlePhase } from '../../systems/BattleEngine.js';
import { Actions, InputContext } from '../../systems/InputSystem.js';
import { createEnemy } from '../../data/enemies.js';

// Mock OffscreenCanvas for sprite scaling in BattleHUD
class MockCanvas {
  constructor(w, h) { this.width = w; this.height = h; }
  getContext() {
    return {
      fillStyle: '', fillRect: vi.fn(),
      drawImage: vi.fn(), imageSmoothingEnabled: true,
    };
  }
}
vi.stubGlobal('OffscreenCanvas', MockCanvas);

function makeMember(overrides = {}) {
  return {
    id: 'peter',
    name: 'Peter',
    level: 1,
    exp: 0,
    expToNext: 30,
    stats: { hp: 100, sp: 50, str: 20, def: 15, wis: 15, fai: 10, spd: 25 },
    currentHp: 100,
    currentSp: 50,
    abilities: ['prayer_heal', 'thunder_zeal', 'truth_word'],
    ...overrides,
  };
}

function makeInput() {
  const pressedKeys = new Set();
  return {
    context: InputContext.OVERWORLD,
    pressed(action) {
      return pressedKeys.has(action);
    },
    held() {
      return false;
    },
    _press(action) {
      pressedKeys.add(action);
    },
    _clear() {
      pressedKeys.clear();
    },
  };
}

function makeScene() {
  const input = makeInput();
  const scene = new BattleScene({
    input,
    transitions: { fadeToBlack: vi.fn() },
    sceneManager: {},
    frameCountFn: () => 0,
  });
  return { scene, input };
}

describe('BattleScene', () => {
  let scene, input;

  beforeEach(() => {
    ({ scene, input } = makeScene());
  });

  it('starts with no engine', () => {
    expect(scene.engine).toBeNull();
  });

  it('startBattle initializes engine in INTRO phase', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    expect(scene.engine).not.toBeNull();
    expect(scene.engine.phase).toBe(BattlePhase.INTRO);
  });

  it('enter sets input context to BATTLE', () => {
    scene.enter();
    expect(input.context).toBe(InputContext.BATTLE);
  });

  it('update does nothing without engine', () => {
    expect(() => scene.update(1 / 60)).not.toThrow();
  });

  it('intro phase transitions after INTRO_FRAMES', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());

    for (let i = 0; i < 30; i++) {
      scene.update(1 / 60);
    }

    // After 30 frames, should have moved past intro
    expect(scene.engine.phase).not.toBe(BattlePhase.INTRO);
  });

  it('victory calls onComplete with victory after fade and confirm', () => {
    const onComplete = vi.fn();
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, onComplete);

    // Kill enemy and force victory phase
    enemies[0].currentHp = 0;
    scene.engine.phase = BattlePhase.VICTORY;
    scene.engine.expGained = 12;
    scene._stateFrames = 0;

    // Advance past init (frame 1) + 30-frame fade
    for (let i = 0; i <= 30; i++) scene.update(1 / 60);
    expect(onComplete).not.toHaveBeenCalled();

    // Press CONFIRM on EXP screen (no level-ups → completes)
    input._press(Actions.CONFIRM);
    scene.update(1 / 60);
    expect(onComplete).toHaveBeenCalledWith('victory', 12);
  });

  it('victory auto-advances after 3 seconds of inactivity', () => {
    const onComplete = vi.fn();
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, onComplete);

    enemies[0].currentHp = 0;
    scene.engine.phase = BattlePhase.VICTORY;
    scene.engine.expGained = 12;
    scene._stateFrames = 0;

    // Advance past fade (31 frames) + auto-advance timer (180 frames) = 211 frames
    for (let i = 0; i < 211; i++) scene.update(1 / 60);
    expect(onComplete).toHaveBeenCalledWith('victory', 12);
  });

  it('victory awards EXP to living party members', () => {
    const onComplete = vi.fn();
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, onComplete);

    enemies[0].currentHp = 0;
    scene.engine.phase = BattlePhase.VICTORY;
    scene.engine.expGained = 12;
    scene._stateFrames = 0;

    const expBefore = party[0].exp;
    // Frame 1 triggers _awardExp
    scene.update(1 / 60);
    expect(party[0].exp).toBe(expBefore + 12);
  });

  it('defeat menu retry calls onComplete with retry', () => {
    const onComplete = vi.fn();
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, onComplete);

    party[0].currentHp = 0;
    scene.engine.phase = BattlePhase.DEFEAT;
    scene._stateFrames = 0;

    // Advance past 60-frame fade
    for (let i = 0; i <= 60; i++) scene.update(1 / 60);
    expect(onComplete).not.toHaveBeenCalled();

    // Default cursor is 0 (Retry) — press CONFIRM
    input._press(Actions.CONFIRM);
    scene.update(1 / 60);
    expect(onComplete).toHaveBeenCalledWith('retry', 0);
  });

  it('defeat calls onComplete with defeat when title selected', () => {
    const onComplete = vi.fn();
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, onComplete);

    party[0].currentHp = 0;
    scene.engine.phase = BattlePhase.DEFEAT;
    scene._stateFrames = 0;

    // Advance past 60-frame fade
    for (let i = 0; i <= 60; i++) scene.update(1 / 60);

    // Press DOWN to select "Return to title"
    input._press(Actions.DOWN);
    scene.update(1 / 60);
    input._clear();

    // Press CONFIRM
    input._press(Actions.CONFIRM);
    scene.update(1 / 60);
    expect(onComplete).toHaveBeenCalledWith('defeat', 0);
  });

  it('render does nothing without engine', () => {
    const ctx = { fillStyle: '', fillRect: vi.fn() };
    expect(() => scene.render(ctx)).not.toThrow();
  });

  it('processActionSelection opens scripture selection for scripture', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('scripture');
    expect(scene._selectingScripture).toBe(true);
    expect(scene._scriptureChallenge).not.toBeNull();
    expect(scene._scriptureChallenge.id).toBe('doubt_challenge');
    expect(scene._scriptureCursor).toBe(0);
  });

  it('processActionSelection opens ability menu for prayer', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('prayer');
    expect(scene._selectingAbility).toBe(true);
    expect(scene._abilityList.length).toBeGreaterThan(0);
  });

  it('processActionSelection executes defend immediately', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('defend');
    expect(scene.engine.phase).toBe(BattlePhase.EXECUTE);
    expect(scene.engine.buffs.length).toBe(1);
  });

  // --- P3.5: Ability → target selection flow ---
  it('ability with single_enemy target opens target selection', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    // thunder_zeal is a miracle with target: single_enemy
    scene._processActionSelection('miracles');
    expect(scene._selectingAbility).toBe(true);

    // Confirm the ability selection
    input._press('confirm');
    scene.update(1 / 60);
    input._clear();

    // Should now be in target selection mode
    expect(scene._selectingTarget).toBe(true);
    expect(scene._selectingAbility).toBe(false);
  });

  it('ability with self/ally target auto-executes without target selection', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    // prayer_heal targets single_ally, auto-targets current actor
    scene._processActionSelection('prayer');
    expect(scene._selectingAbility).toBe(true);

    // Confirm the ability (prayer_heal costs 15 SP, member has 50)
    input._press('confirm');
    scene.update(1 / 60);
    input._clear();

    // Should auto-execute without target selection
    expect(scene._selectingTarget).toBe(false);
    expect(scene.engine.phase).toBe(BattlePhase.EXECUTE);
  });

  it('ability cancel returns to action menu', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('prayer');
    expect(scene._selectingAbility).toBe(true);

    input._press('cancel');
    scene.update(1 / 60);
    input._clear();

    expect(scene._selectingAbility).toBe(false);
  });

  // --- P3.5: Target navigation ---
  it('target cursor navigates with LEFT/RIGHT', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt'), createEnemy('fear')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    // Open miracles and select thunder_zeal (single_enemy)
    scene._processActionSelection('miracles');
    input._press('confirm');
    scene.update(1 / 60);
    input._clear();

    expect(scene._selectingTarget).toBe(true);
    expect(scene.hud.targetCursor).toBe(0);

    // Move target right
    input._press('right');
    scene.update(1 / 60);
    input._clear();

    expect(scene.hud.targetCursor).toBe(1);
  });

  it('target confirm executes action on selected enemy', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('miracles');
    input._press('confirm');
    scene.update(1 / 60);
    input._clear();

    // Confirm target
    input._press('confirm');
    scene.update(1 / 60);
    input._clear();

    expect(scene._selectingTarget).toBe(false);
    expect(scene.engine.phase).toBe(BattlePhase.EXECUTE);
  });

  it('target cancel returns to action menu', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('miracles');
    input._press('confirm');
    scene.update(1 / 60);
    input._clear();

    expect(scene._selectingTarget).toBe(true);

    input._press('cancel');
    scene.update(1 / 60);
    input._clear();

    expect(scene._selectingTarget).toBe(false);
  });

  // --- P3.5: Scripture input flow ---
  it('scripture cursor navigates with UP/DOWN', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('scripture');
    expect(scene._selectingScripture).toBe(true);
    expect(scene._scriptureCursor).toBe(0);

    input._press('down');
    scene.update(1 / 60);
    input._clear();

    expect(scene._scriptureCursor).toBe(1);

    input._press('up');
    scene.update(1 / 60);
    input._clear();

    expect(scene._scriptureCursor).toBe(0);
  });

  it('scripture confirm opens target selection', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('scripture');

    // Select the first option (correct answer)
    input._press('confirm');
    scene.update(1 / 60);
    input._clear();

    expect(scene._selectingScripture).toBe(false);
    expect(scene._selectingTarget).toBe(true);
  });

  it('scripture cancel returns to action menu', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('scripture');

    input._press('cancel');
    scene.update(1 / 60);
    input._clear();

    expect(scene._selectingScripture).toBe(false);
  });

  // --- P3.5: Enemy turn ---
  it('enemy turn auto-executes and advances to EXECUTE phase', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());

    // Force enemy turn
    scene.engine.phase = BattlePhase.ENEMY_TURN;
    scene.engine.currentActor = { type: 'enemy', entity: enemies[0] };

    scene.update(1 / 60);

    expect(scene.engine.phase).toBe(BattlePhase.EXECUTE);
  });

  // --- P3.5: Execute phase advancement ---
  it('execute phase advances after EXECUTE_FRAMES', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    // Set to EXECUTE phase
    scene.engine.phase = BattlePhase.EXECUTE;
    scene._stateFrames = 0;

    // Run for 30 frames (EXECUTE_FRAMES)
    for (let i = 0; i < 30; i++) {
      scene.update(1 / 60);
    }

    // Should have advanced past EXECUTE
    expect(scene.engine.phase).not.toBe(BattlePhase.EXECUTE);
  });

  // --- P3.5: Victory/defeat renders ---
  it('render shows victory overlay in VICTORY phase', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    enemies[0].currentHp = 0;
    scene.engine.phase = BattlePhase.VICTORY;
    scene.engine.expGained = 12;

    const fillRects = [];
    const ctx = {
      fillStyle: '',
      fillRect: vi.fn((...args) => fillRects.push(args)),
      drawImage: vi.fn(),
      globalAlpha: 1,
    };

    expect(() => scene.render(ctx)).not.toThrow();
    // Victory overlay draws a semi-transparent black rect
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('render shows defeat overlay in DEFEAT phase', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    party[0].currentHp = 0;
    scene.engine.phase = BattlePhase.DEFEAT;

    const ctx = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      globalAlpha: 1,
    };

    expect(() => scene.render(ctx)).not.toThrow();
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  // --- P3.5: Item flow ---
  it('items action opens item list when inventory has consumables', () => {
    const { scene: s, input: inp } = (() => {
      const i = makeInput();
      const gameState = {
        inventory: {
          getAll: () => [
            { id: 'bread', quantity: 3, def: { id: 'bread', name: 'Bread', type: 'consumable', effect: { stat: 'hp', amount: 50 } } },
          ],
        },
        questFlags: {},
      };
      const sc = new BattleScene({
        input: i,
        transitions: { fadeToBlack: vi.fn() },
        sceneManager: {},
        frameCountFn: () => 0,
        gameState,
      });
      return { scene: sc, input: i };
    })();

    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    s.startBattle(party, enemies, vi.fn());
    s.engine.buildTurnOrder();
    s.engine.nextTurn();

    s._processActionSelection('items');
    expect(s._selectingItem).toBe(true);
    expect(s._itemList).toHaveLength(1);
  });

  // --- P3.5: Action cursor navigation ---
  it('action menu cursor navigates with UP/DOWN', () => {
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    expect(scene.hud.actionCursor).toBe(0);

    input._press('down');
    scene.update(1 / 60);
    input._clear();

    expect(scene.hud.actionCursor).toBe(1);

    input._press('up');
    scene.update(1 / 60);
    input._clear();

    expect(scene.hud.actionCursor).toBe(0);
  });

  // --- P3.5: Ability SP check ---
  it('blocks ability selection when SP is insufficient', () => {
    const party = [makeMember({ currentSp: 0 })]; // No SP
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, vi.fn());
    scene.engine.buildTurnOrder();
    scene.engine.nextTurn();

    scene._processActionSelection('prayer');
    expect(scene._selectingAbility).toBe(true);

    // Try to confirm - should be blocked by SP check
    input._press('confirm');
    scene.update(1 / 60);
    input._clear();

    // Should still be selecting ability (blocked)
    expect(scene._selectingAbility).toBe(true);
  });
});
