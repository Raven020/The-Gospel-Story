import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BattleScene } from '../BattleScene.js';
import { BattlePhase } from '../../systems/BattleEngine.js';
import { InputContext } from '../../systems/InputSystem.js';
import { createEnemy } from '../../data/enemies.js';

function makeMember(overrides = {}) {
  return {
    id: 'hero',
    name: 'Hero',
    level: 1,
    stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 25 },
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

  it('victory calls onComplete with victory', () => {
    const onComplete = vi.fn();
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, onComplete);

    // Kill enemy and force victory phase
    enemies[0].currentHp = 0;
    scene.engine.phase = BattlePhase.VICTORY;
    scene.engine.expGained = 12;
    scene._stateFrames = 120;

    scene.update(1 / 60);
    expect(onComplete).toHaveBeenCalledWith('victory', 12);
  });

  it('defeat calls onComplete with defeat', () => {
    const onComplete = vi.fn();
    const party = [makeMember()];
    const enemies = [createEnemy('doubt')];
    scene.startBattle(party, enemies, onComplete);

    party[0].currentHp = 0;
    scene.engine.phase = BattlePhase.DEFEAT;
    scene._stateFrames = 120;

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
});
