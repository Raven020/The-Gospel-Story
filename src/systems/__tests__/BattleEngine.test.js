import { describe, it, expect, beforeEach } from 'vitest';
import {
  BattleEngine,
  BattlePhase,
  ActionType,
  calcDamage,
  calcHeal,
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

    it('enemy uses abilities based on AI type', () => {
      // Test with a boss enemy that has abilities
      const satan = createEnemy('satan');
      satan.stats.spd = 99;
      const testParty = [makeMember({ id: 'p1', stats: { hp: 200, sp: 50, str: 20, wis: 15, fai: 10, spd: 5, def: 15 }, currentHp: 200, currentSp: 50 })];

      // Run many trials to verify abilities are used at least sometimes
      let abilityUsed = false;
      for (let i = 0; i < 50; i++) {
        testParty[0].currentHp = 200;
        const eng = new BattleEngine(testParty, [createEnemy('satan')]);
        eng.enemies[0].stats.spd = 99;
        eng.buildTurnOrder();
        eng.nextTurn();
        eng.execute();
        if (eng.lastResult.abilityName || eng.lastResult.type === 'debuff' || eng.lastResult.type === 'buff') {
          abilityUsed = true;
          break;
        }
      }
      expect(abilityUsed).toBe(true);
    });

    it('basic enemy can use abilities', () => {
      const doubt = createEnemy('doubt');
      doubt.stats.spd = 99;
      const testParty = [makeMember({ id: 'p1', stats: { hp: 200, sp: 50, str: 20, wis: 15, fai: 10, spd: 5, def: 15 }, currentHp: 200, currentSp: 50 })];

      let abilityUsed = false;
      for (let i = 0; i < 50; i++) {
        testParty[0].currentHp = 200;
        const eng = new BattleEngine(testParty, [createEnemy('doubt')]);
        eng.enemies[0].stats.spd = 99;
        eng.buildTurnOrder();
        eng.nextTurn();
        eng.execute();
        if (eng.lastResult.type === 'debuff' || eng.lastResult.abilityName) {
          abilityUsed = true;
          break;
        }
      }
      expect(abilityUsed).toBe(true);
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
