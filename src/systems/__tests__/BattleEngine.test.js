import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BattleEngine,
  BattlePhase,
  ActionType,
  calcDamage,
  calcHeal,
  getMoraleModifier,
} from '../BattleEngine.js';
import { createEnemy } from '../../data/enemies.js';

function makeMember(overrides = {}) {
  return {
    id: 'test',
    name: 'Test',
    level: 1,
    stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 18 },
    currentHp: 100,
    currentSp: 50,
    abilities: ['prayer_heal', 'thunder_zeal', 'truth_word'],
    ...overrides,
  };
}

describe('calcDamage', () => {
  it('calculates basic damage', () => {
    // ATK=20, power=100, DEF=10 → 20*100/100 - 10/2 = 20-5 = 15
    expect(calcDamage(20, 100, 10)).toBe(15);
  });

  it('returns minimum 1 damage', () => {
    expect(calcDamage(1, 10, 100)).toBe(1);
  });

  it('handles zero defense', () => {
    // ATK=20, power=100, DEF=0 → 20
    expect(calcDamage(20, 100, 0)).toBe(20);
  });

  it('scales with power', () => {
    const low = calcDamage(20, 50, 10);
    const high = calcDamage(20, 150, 10);
    expect(high).toBeGreaterThan(low);
  });
});

describe('calcHeal', () => {
  it('calculates heal amount', () => {
    // WIS=15, power=60 → floor(15*60/50) = floor(18) = 18
    expect(calcHeal(15, 60)).toBe(18);
  });

  it('scales with wisdom', () => {
    expect(calcHeal(30, 60)).toBeGreaterThan(calcHeal(15, 60));
  });

  it('uses fai when higher than wis (GAP-06)', () => {
    // wis=15, power=60, fai=30 → uses fai → floor(30*60/50) = 36
    expect(calcHeal(15, 60, 30)).toBe(36);
  });

  it('uses wis when fai is lower', () => {
    // wis=30, power=60, fai=15 → uses wis → floor(30*60/50) = 36
    expect(calcHeal(30, 60, 15)).toBe(36);
  });

  it('works without fai parameter (backwards compat)', () => {
    expect(calcHeal(15, 60)).toBe(18);
  });
});

describe('getMoraleModifier', () => {
  it('returns 1.0 for morale 100', () => {
    expect(getMoraleModifier({ morale: 100 })).toBe(1.0);
  });

  it('returns 0.75 for morale 50', () => {
    expect(getMoraleModifier({ morale: 50 })).toBe(0.75);
  });

  it('returns 0.5 for morale 0', () => {
    expect(getMoraleModifier({ morale: 0 })).toBe(0.5);
  });

  it('returns 1.0 for entities without morale (enemies)', () => {
    expect(getMoraleModifier({ stats: { str: 10 } })).toBe(1.0);
  });
});

describe('BattleEngine', () => {
  let engine;
  let party;
  let enemies;

  beforeEach(() => {
    party = [makeMember({ id: 'p1', name: 'Hero', stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 25 }, currentHp: 100, currentSp: 50 })];
    enemies = [createEnemy('doubt')];
    engine = new BattleEngine(party, enemies);
  });

  it('starts in INTRO phase', () => {
    expect(engine.phase).toBe(BattlePhase.INTRO);
  });

  it('builds turn order by speed', () => {
    engine.buildTurnOrder();
    expect(engine.turnOrder.length).toBe(2); // 1 party + 1 enemy
    // Hero speed 25 > Doubt speed 18
    expect(engine.turnOrder[0].entity.id).toBe('p1');
  });

  it('nextTurn sets phase to SELECT_ACTION for party member', () => {
    engine.buildTurnOrder();
    engine.nextTurn();
    expect(engine.phase).toBe(BattlePhase.SELECT_ACTION);
    expect(engine.currentActor.type).toBe('party');
  });

  it('nextTurn sets phase to ENEMY_TURN for enemy', () => {
    // Make enemy faster
    enemies[0].stats.spd = 99;
    engine = new BattleEngine(party, enemies);
    engine.buildTurnOrder();
    engine.nextTurn();
    expect(engine.phase).toBe(BattlePhase.ENEMY_TURN);
    expect(engine.currentActor.type).toBe('enemy');
  });

  it('skips dead actors in turn order', () => {
    const party2 = [
      makeMember({ id: 'p1', name: 'Alive', stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 30 }, currentHp: 100, currentSp: 50 }),
      makeMember({ id: 'p2', name: 'Dead', stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 28 }, currentHp: 0, currentSp: 50 }),
    ];
    engine = new BattleEngine(party2, enemies);
    engine.buildTurnOrder();
    // Dead member shouldn't be in turn order at all (filtered during build)
    const partyActors = engine.turnOrder.filter((a) => a.type === 'party');
    expect(partyActors.length).toBe(1);
    expect(partyActors[0].entity.id).toBe('p1');
  });

  it('setAction stores pending action', () => {
    engine.setAction(ActionType.ATTACK, { target: enemies[0] });
    expect(engine.pendingAction).toEqual({ type: ActionType.ATTACK, target: enemies[0] });
  });

  describe('execute - player actions', () => {
    beforeEach(() => {
      engine.buildTurnOrder();
      engine.nextTurn(); // Hero's turn
    });

    it('executes attack action dealing damage', () => {
      const initialHp = enemies[0].currentHp;
      engine.setAction(ActionType.ATTACK, { target: enemies[0] });
      engine.execute();
      expect(enemies[0].currentHp).toBeLessThan(initialHp);
      expect(engine.lastResult.type).toBe('damage');
    });

    it('executes defend action adding buff', () => {
      engine.setAction(ActionType.DEFEND, {});
      engine.execute();
      expect(engine.lastResult.type).toBe('defend');
      expect(engine.buffs.length).toBe(1);
      expect(engine.buffs[0].type).toBe('defend');
    });

    it('executes ability action consuming SP', () => {
      const initialSp = party[0].currentSp;
      engine.setAction(ActionType.ABILITY, {
        abilityId: 'thunder_zeal',
        target: enemies[0],
      });
      engine.execute();
      expect(party[0].currentSp).toBeLessThan(initialSp);
      expect(engine.lastResult.type).toBe('damage');
    });

    it('fails ability when SP insufficient', () => {
      party[0].currentSp = 0;
      engine.setAction(ActionType.ABILITY, {
        abilityId: 'thunder_zeal',
        target: enemies[0],
      });
      engine.execute();
      expect(engine.lastResult.type).toBe('fail');
    });

    it('executes healing ability', () => {
      party[0].currentHp = 50;
      engine.setAction(ActionType.ABILITY, {
        abilityId: 'prayer_heal',
        target: party[0],
      });
      engine.execute();
      expect(party[0].currentHp).toBeGreaterThan(50);
      expect(engine.lastResult.type).toBe('heal');
    });

    it('executes item action calling useItemFn', () => {
      let called = false;
      engine.setAction(ActionType.ITEM, {
        itemId: 'bread',
        useItemFn: () => { called = true; },
      });
      engine.execute();
      expect(called).toBe(true);
      expect(engine.lastResult).toEqual({ type: 'item', actor: party[0], item: 'bread' });
      expect(engine.phase).toBe(BattlePhase.CHECK_END);
    });

    it('item action without useItemFn sets no result', () => {
      engine.setAction(ActionType.ITEM, { itemId: 'bread' });
      engine.execute();
      expect(engine.lastResult).toBeNull();
      expect(engine.phase).toBe(BattlePhase.CHECK_END);
    });

    it('executes scripture attack', () => {
      const initialHp = enemies[0].currentHp;
      engine.setAction(ActionType.SCRIPTURE, {
        target: enemies[0],
        correct: true,
      });
      engine.execute();
      expect(enemies[0].currentHp).toBeLessThan(initialHp);
      expect(engine.lastResult.type).toBe('scripture');
      expect(engine.lastResult.correct).toBe(true);
    });

    it('scripture correct does more damage than incorrect', () => {
      const e1 = createEnemy('doubt');
      const e2 = createEnemy('doubt');

      const eng1 = new BattleEngine([makeMember({ stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 25 }, currentHp: 100, currentSp: 50 })], [e1]);
      eng1.buildTurnOrder();
      eng1.nextTurn();
      eng1.setAction(ActionType.SCRIPTURE, { target: e1, correct: true });
      eng1.execute();

      const eng2 = new BattleEngine([makeMember({ stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 25 }, currentHp: 100, currentSp: 50 })], [e2]);
      eng2.buildTurnOrder();
      eng2.nextTurn();
      eng2.setAction(ActionType.SCRIPTURE, { target: e2, correct: false });
      eng2.execute();

      expect(eng1.lastResult.damage).toBeGreaterThan(eng2.lastResult.damage);
    });
  });

  describe('execute - enemy AI', () => {
    it('enemy attacks a party member', () => {
      enemies[0].stats.spd = 99;
      engine = new BattleEngine(party, enemies);
      engine.buildTurnOrder();
      engine.nextTurn(); // enemy turn
      engine.execute();
      // Enemy AI may use a basic attack (damage) or an ability (debuff/buff)
      expect(['damage', 'debuff', 'buff']).toContain(engine.lastResult.type);
      if (engine.lastResult.type === 'damage') {
        expect(engine.lastResult.targetType).toBe('party');
      }
    });

    it('enemy uses abilities based on AI type (deterministic)', () => {
      // Mock Math.random: target index=0, abilityChance<0.5 (boss), ability index=0
      const randoms = [0, 0.1, 0];
      let call = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => randoms[call++ % randoms.length]);

      const testParty = [makeMember({ id: 'p1', stats: { hp: 200, sp: 50, str: 20, wis: 15, fai: 10, spd: 5, def: 15 }, currentHp: 200, currentSp: 50 })];
      const eng = new BattleEngine(testParty, [createEnemy('satan')]);
      eng.enemies[0].stats.spd = 99;
      eng.buildTurnOrder();
      eng.nextTurn();
      eng.execute();

      // Boss should use an ability (not a basic attack)
      expect(eng.lastResult.abilityName).toBeDefined();
      vi.restoreAllMocks();
    });

    it('basic enemy can use abilities (deterministic)', () => {
      // Mock Math.random: target index=0, abilityChance<0.3 (basic), ability index=0
      const randoms = [0, 0.1, 0];
      let call = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => randoms[call++ % randoms.length]);

      const testParty = [makeMember({ id: 'p1', stats: { hp: 200, sp: 50, str: 20, wis: 15, fai: 10, spd: 5, def: 15 }, currentHp: 200, currentSp: 50 })];
      const eng = new BattleEngine(testParty, [createEnemy('doubt')]);
      eng.enemies[0].stats.spd = 99;
      eng.buildTurnOrder();
      eng.nextTurn();
      eng.execute();

      // Basic enemy should use an ability
      expect(eng.lastResult.abilityName).toBeDefined();
      vi.restoreAllMocks();
    });

    it('enemy uses basic attack when random exceeds ability chance', () => {
      // Mock Math.random: target index=0, abilityChance=0.9 (>0.3 for basic), attack power roll=0.5
      const randoms = [0, 0.9, 0.5];
      let call = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => randoms[call++ % randoms.length]);

      const testParty = [makeMember({ id: 'p1', stats: { hp: 200, sp: 50, str: 20, wis: 15, fai: 10, spd: 5, def: 15 }, currentHp: 200, currentSp: 50 })];
      const eng = new BattleEngine(testParty, [createEnemy('doubt')]);
      eng.enemies[0].stats.spd = 99;
      eng.buildTurnOrder();
      eng.nextTurn();
      eng.execute();

      // Should be a basic attack (no abilityName)
      expect(eng.lastResult.type).toBe('damage');
      expect(eng.lastResult.abilityName).toBeUndefined();
      vi.restoreAllMocks();
    });

    it('enemy abilities have correct result types', () => {
      // Manually test _executeEnemyAbility via the engine
      const doubt = createEnemy('doubt');
      doubt.stats.spd = 99;
      const testParty = [makeMember({ id: 'p1', stats: { hp: 200, sp: 50, str: 20, wis: 15, fai: 10, spd: 5, def: 15 }, currentHp: 200, currentSp: 50 })];
      const eng = new BattleEngine(testParty, [doubt]);

      // Test damage ability
      eng._executeEnemyAbility(doubt, { id: 'test', name: 'Test Hit', power: 60, type: 'damage' }, testParty[0]);
      expect(eng.lastResult.type).toBe('damage');
      expect(eng.lastResult.abilityName).toBe('Test Hit');

      // Test debuff ability
      eng._executeEnemyAbility(doubt, { id: 'test_debuff', name: 'Weaken', power: 0, type: 'debuff_str' }, testParty[0]);
      expect(eng.lastResult.type).toBe('debuff');
      expect(eng.buffs.some(b => b.type === 'debuff_str')).toBe(true);

      // Test buff ability (self-buff)
      eng._executeEnemyAbility(doubt, { id: 'test_buff', name: 'Fortify', power: 0, type: 'buff_def' }, testParty[0]);
      expect(eng.lastResult.type).toBe('buff');
      expect(eng.buffs.some(b => b.target === doubt && b.type === 'buff_def')).toBe(true);
    });

    // T3: status_shield blocks enemy debuff abilities (blocked:true path)
    it('status_shield on target blocks enemy debuff ability and returns blocked:true', () => {
      const doubt = createEnemy('doubt');
      const testParty = [makeMember({ id: 'p1', stats: { hp: 200, sp: 50, str: 20, wis: 15, fai: 10, spd: 5, def: 15 }, currentHp: 200, currentSp: 50 })];
      const eng = new BattleEngine(testParty, [doubt]);

      // Give the party member a status_shield buff
      eng.buffs.push({ target: testParty[0], type: 'status_shield', turnsLeft: 3 });

      // Enemy uses a debuff ability against the shielded member
      eng._executeEnemyAbility(doubt, { id: 'cloud_of_doubt', name: 'Cloud of Doubt', power: 0, type: 'debuff_def' }, testParty[0]);

      // Debuff must be blocked
      expect(eng.lastResult.blocked).toBe(true);
      expect(eng.lastResult.damage).toBe(0);
      expect(eng.lastResult.type).toBe('damage'); // blocked path uses 'damage' result type
      // The debuff should NOT have been applied
      expect(eng.buffs.some(b => b.type === 'debuff_def')).toBe(false);
    });
  });

  describe('checkEnd', () => {
    it('returns victory when all enemies dead', () => {
      enemies[0].currentHp = 0;
      const result = engine.checkEnd();
      expect(result).toBe('victory');
      expect(engine.phase).toBe(BattlePhase.VICTORY);
    });

    it('returns defeat when all party dead', () => {
      party[0].currentHp = 0;
      const result = engine.checkEnd();
      expect(result).toBe('defeat');
      expect(engine.phase).toBe(BattlePhase.DEFEAT);
    });

    it('returns null when both sides alive', () => {
      const result = engine.checkEnd();
      expect(result).toBeNull();
    });

    it('calculates exp on victory', () => {
      enemies[0].currentHp = 0;
      engine.checkEnd();
      expect(engine.expGained).toBe(enemies[0].exp);
    });
  });

  describe('buffs', () => {
    it('defend buff reduces damage', () => {
      engine.buildTurnOrder();
      engine.nextTurn();

      // Apply defend buff to party member
      engine.buffs.push({ target: party[0], type: 'defend', turnsLeft: 2 });

      // Create enemy-turn engine to attack party
      enemies[0].stats.spd = 99;
      const eng2 = new BattleEngine(party, [createEnemy('doubt')]);
      eng2.buffs = [{ target: party[0], type: 'defend', turnsLeft: 2 }];
      eng2.buildTurnOrder();
      eng2.nextTurn(); // enemy turn

      const hpBefore = party[0].currentHp;
      eng2.execute();
      const dmgWithDefend = hpBefore - party[0].currentHp;

      // Without defend
      party[0].currentHp = 100;
      const eng3 = new BattleEngine(party, [createEnemy('doubt')]);
      eng3.buildTurnOrder();
      eng3.nextTurn();
      const hpBefore2 = party[0].currentHp;
      eng3.execute();
      const dmgWithout = hpBefore2 - party[0].currentHp;

      // Defend should reduce damage (or at least not increase it)
      expect(dmgWithDefend).toBeLessThanOrEqual(dmgWithout);
    });

    it('buffs tick down each turn', () => {
      engine.buffs.push({ target: party[0], type: 'defend', turnsLeft: 2 });
      engine.buildTurnOrder();
      engine.nextTurn();
      expect(engine.buffs[0].turnsLeft).toBe(1);
    });

    it('expired buffs are removed', () => {
      engine.buffs.push({ target: party[0], type: 'defend', turnsLeft: 1 });
      engine.buildTurnOrder();
      engine.nextTurn();
      expect(engine.buffs.length).toBe(0);
    });
  });

  describe('ability effects', () => {
    beforeEach(() => {
      engine.buildTurnOrder();
      engine.nextTurn();
    });

    it('scan ability produces scan result', () => {
      engine.setAction(ActionType.ABILITY, {
        abilityId: 'inquiry_scan',
        target: enemies[0],
      });
      engine.execute();
      expect(engine.lastResult.type).toBe('scan');
    });

    it('debuff ability adds debuff', () => {
      engine.setAction(ActionType.ABILITY, {
        abilityId: 'reveal_weakness',
        target: enemies[0],
      });
      engine.execute();
      expect(engine.lastResult.type).toBe('debuff');
      expect(engine.buffs.some((b) => b.type === 'debuff_def')).toBe(true);
    });

    it('buff ability adds buff', () => {
      engine.setAction(ActionType.ABILITY, {
        abilityId: 'rally_cry',
        target: party[0],
      });
      engine.execute();
      expect(engine.lastResult.type).toBe('buff');
      expect(engine.buffs.some((b) => b.type === 'buff_str')).toBe(true);
    });

    it('cleanse removes debuffs', () => {
      engine.buffs.push({ target: party[0], type: 'debuff_def', turnsLeft: 3 });
      engine.setAction(ActionType.ABILITY, {
        abilityId: 'purify',
        target: party[0],
      });
      engine.execute();
      expect(engine.lastResult.type).toBe('cleanse');
      expect(engine.buffs.filter((b) => b.type.startsWith('debuff')).length).toBe(0);
    });

    it('AoE damage hits all enemies', () => {
      const enemies2 = [createEnemy('doubt'), createEnemy('fear')];
      const eng = new BattleEngine(party, enemies2);
      eng.buildTurnOrder();
      eng.nextTurn();
      eng.setAction(ActionType.ABILITY, {
        abilityId: 'miracle_calm',
        target: null,
      });
      eng.execute();
      expect(enemies2[0].currentHp).toBeLessThan(enemies2[0].stats.hp);
      expect(enemies2[1].currentHp).toBeLessThan(enemies2[1].stats.hp);
    });

    it('gold_bonus ability applies buff and grants 1.5x EXP on victory', () => {
      // Give hero the gold_find ability
      party[0].abilities.push('gold_find');
      party[0].currentSp = 50;

      engine.setAction(ActionType.ABILITY, {
        abilityId: 'gold_find',
        target: party[0],
      });
      engine.execute();
      expect(engine.lastResult.type).toBe('buff');
      expect(engine.lastResult.effectType).toBe('gold_bonus');
      expect(engine.buffs.some((b) => b.type === 'gold_bonus')).toBe(true);

      // Kill enemy and check EXP is boosted
      enemies[0].currentHp = 0;
      const baseExp = enemies[0].exp;
      engine.checkEnd();
      expect(engine.expGained).toBe(Math.floor(baseExp * 1.5));
    });

    it('victory without gold_bonus gives normal EXP', () => {
      enemies[0].currentHp = 0;
      const baseExp = enemies[0].exp;
      engine.checkEnd();
      expect(engine.expGained).toBe(baseExp);
    });

    // T4: bonusVsWeakness applies 1.5x damage multiplier
    it('ability with bonusVsWeakness deals 1.5x damage vs matching weakness', () => {
      // 'greed' enemy has weakness: 'miracle'; thunder_zeal has bonusVsWeakness: 'miracle'
      const greed = createEnemy('greed');
      const noWeaknessEnemy = createEnemy('greed');
      noWeaknessEnemy.weakness = null; // strip weakness for baseline

      // Compute damage WITH bonus (enemy weakness matches ability)
      const engWith = new BattleEngine(
        [makeMember({ stats: { hp: 100, sp: 50, str: 20, wis: 30, fai: 10, spd: 25 }, currentHp: 100, currentSp: 50 })],
        [greed],
      );
      engWith.buildTurnOrder();
      engWith.nextTurn();
      engWith.setAction(ActionType.ABILITY, { abilityId: 'thunder_zeal', target: greed });
      engWith.execute();
      const damageWithBonus = engWith.lastResult.damage;

      // Compute damage WITHOUT bonus (weakness cleared)
      const engWithout = new BattleEngine(
        [makeMember({ stats: { hp: 100, sp: 50, str: 20, wis: 30, fai: 10, spd: 25 }, currentHp: 100, currentSp: 50 })],
        [noWeaknessEnemy],
      );
      engWithout.buildTurnOrder();
      engWithout.nextTurn();
      engWithout.setAction(ActionType.ABILITY, { abilityId: 'thunder_zeal', target: noWeaknessEnemy });
      engWithout.execute();
      const damageWithout = engWithout.lastResult.damage;

      // thunder_zeal is MIRACLE category → uses str (20) not wis (30)
      const basePower = 70;
      const boostedPower = Math.floor(basePower * 1.5);
      const def = greed.stats.wis || 0;
      const expectedWithout = calcDamage(20, basePower, def);
      const expectedWith = calcDamage(20, boostedPower, def);
      expect(damageWithout).toBe(expectedWithout);
      expect(damageWithBonus).toBe(expectedWith);
      expect(damageWithBonus).toBeGreaterThan(damageWithout);
    });

    it('morale modifier scales attack damage', () => {
      // Party member with low morale (50) should deal less damage than one with full morale (100)
      const lowMorale = makeMember({ id: 'low', morale: 50, stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 25, def: 10 }, currentHp: 100, currentSp: 50 });
      const fullMorale = makeMember({ id: 'full', morale: 100, stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 25, def: 10 }, currentHp: 100, currentSp: 50 });

      const enemy1 = createEnemy('doubt');
      const enemy2 = createEnemy('doubt');
      enemy1.currentHp = enemy1.stats.hp;
      enemy2.currentHp = enemy2.stats.hp;

      const eng1 = new BattleEngine([lowMorale], [enemy1]);
      eng1.buildTurnOrder();
      eng1.nextTurn();
      eng1.setAction(ActionType.ATTACK, { target: enemy1 });
      eng1.execute();
      const lowDmg = eng1.lastResult.damage;

      const eng2 = new BattleEngine([fullMorale], [enemy2]);
      eng2.buildTurnOrder();
      eng2.nextTurn();
      eng2.setAction(ActionType.ATTACK, { target: enemy2 });
      eng2.execute();
      const fullDmg = eng2.lastResult.damage;

      expect(fullDmg).toBeGreaterThanOrEqual(lowDmg);
    });

    it('scripture correct answer boosts morale by 5', () => {
      const member = makeMember({ morale: 80, stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 30, spd: 25, def: 10 }, currentHp: 100, currentSp: 50 });
      const enemy = createEnemy('doubt');
      const eng = new BattleEngine([member], [enemy]);
      eng.buildTurnOrder();
      eng.nextTurn();
      eng.setAction(ActionType.SCRIPTURE, { target: enemy, correct: true });
      eng.execute();
      expect(member.morale).toBe(85);
    });

    it('scripture wrong answer reduces morale by 10', () => {
      const member = makeMember({ morale: 80, stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 30, spd: 25, def: 10 }, currentHp: 100, currentSp: 50 });
      const enemy = createEnemy('doubt');
      const eng = new BattleEngine([member], [enemy]);
      eng.buildTurnOrder();
      eng.nextTurn();
      eng.setAction(ActionType.SCRIPTURE, { target: enemy, correct: false });
      eng.execute();
      expect(member.morale).toBe(70);
    });

    it('morale does not exceed 100 or drop below 0', () => {
      const highMorale = makeMember({ morale: 98, stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 30, spd: 25, def: 10 }, currentHp: 100, currentSp: 50 });
      const enemy1 = createEnemy('doubt');
      const eng1 = new BattleEngine([highMorale], [enemy1]);
      eng1.buildTurnOrder();
      eng1.nextTurn();
      eng1.setAction(ActionType.SCRIPTURE, { target: enemy1, correct: true });
      eng1.execute();
      expect(highMorale.morale).toBe(100); // capped at 100

      const lowMorale = makeMember({ morale: 5, stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 30, spd: 25, def: 10 }, currentHp: 100, currentSp: 50 });
      const enemy2 = createEnemy('doubt');
      const eng2 = new BattleEngine([lowMorale], [enemy2]);
      eng2.buildTurnOrder();
      eng2.nextTurn();
      eng2.setAction(ActionType.SCRIPTURE, { target: enemy2, correct: false });
      eng2.execute();
      expect(lowMorale.morale).toBe(0); // floored at 0
    });

    it('victory grants +2 morale to surviving party members', () => {
      const alive = makeMember({ id: 'alive', morale: 80, currentHp: 50, stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 25, def: 10 }, currentSp: 50 });
      const dead = makeMember({ id: 'dead', morale: 80, currentHp: 0, stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 25, def: 10 }, currentSp: 50 });
      const eng = new BattleEngine([alive, dead], enemies);
      enemies[0].currentHp = 0;
      eng.checkEnd();
      expect(alive.morale).toBe(82);
      expect(dead.morale).toBe(80); // dead members don't get boost
    });

    it('AoE heal heals all allies', () => {
      const party2 = [
        makeMember({ id: 'p1', stats: { hp: 100, sp: 80, str: 20, wis: 15, fai: 10, spd: 25 }, currentHp: 50, currentSp: 80 }),
        makeMember({ id: 'p2', stats: { hp: 100, sp: 50, str: 20, wis: 15, fai: 10, spd: 20 }, currentHp: 50, currentSp: 50 }),
      ];
      const eng = new BattleEngine(party2, enemies);
      eng.buildTurnOrder();
      eng.nextTurn();
      eng.setAction(ActionType.ABILITY, {
        abilityId: 'recruit_aid',
        target: null,
      });
      eng.execute();
      expect(party2[0].currentHp).toBeGreaterThan(50);
      expect(party2[1].currentHp).toBeGreaterThan(50);
    });
  });
});
