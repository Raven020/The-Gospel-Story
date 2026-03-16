/**
 * Turn-based combat engine per specs/combat.md.
 * Manages turn order, action execution, damage calc, victory/defeat.
 */

import { ABILITIES, TargetType, AbilityCategory } from '../data/abilities.js';

export const BattlePhase = {
  INTRO: 'intro',
  SELECT_ACTION: 'selectAction',
  EXECUTE: 'execute',
  ENEMY_TURN: 'enemyTurn',
  CHECK_END: 'checkEnd',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
};

export const ActionType = {
  ATTACK: 'attack',
  ABILITY: 'ability',
  ITEM: 'item',
  DEFEND: 'defend',
  SCRIPTURE: 'scripture',
};

/**
 * Calculate damage: ATK * power/100 - DEF/2, minimum 1.
 */
export function calcDamage(attackerStr, power, defenderDef) {
  const raw = Math.floor((attackerStr * power) / 100) - Math.floor(defenderDef / 2);
  return Math.max(1, raw);
}

/**
 * Calculate healing amount.
 */
export function calcHeal(casterWis, power) {
  return Math.floor((casterWis * power) / 50);
}

export class BattleEngine {
  constructor(party, enemies) {
    this.party = party;        // array of member objects
    this.enemies = enemies;    // array of enemy instances
    this.phase = BattlePhase.INTRO;
    this.turnOrder = [];
    this.currentTurnIndex = 0;
    this.currentActor = null;

    // Pending action
    this.pendingAction = null;

    // Results
    this.lastResult = null;    // { type, actor, target, damage/heal, ... }
    this.expGained = 0;

    // Buffs/debuffs (simplified: arrays of {target, type, turnsLeft})
    this.buffs = [];

    this._introFrames = 0;
  }

  /**
   * Build turn order based on speed.
   */
  buildTurnOrder() {
    const actors = [];

    for (const m of this.party) {
      if (m.currentHp > 0) {
        actors.push({ type: 'party', entity: m, speed: m.stats.spd });
      }
    }
    for (const e of this.enemies) {
      if (e.currentHp > 0) {
        actors.push({ type: 'enemy', entity: e, speed: e.stats.spd });
      }
    }

    actors.sort((a, b) => b.speed - a.speed);
    this.turnOrder = actors;
    this.currentTurnIndex = 0;
  }

  /**
   * Advance to the next turn in the order. Skips dead actors.
   */
  nextTurn() {
    // Tick buffs
    this.buffs = this.buffs.filter((b) => {
      b.turnsLeft--;
      return b.turnsLeft > 0;
    });

    while (this.currentTurnIndex < this.turnOrder.length) {
      const actor = this.turnOrder[this.currentTurnIndex];
      this.currentTurnIndex++;

      if (actor.entity.currentHp <= 0) continue;

      this.currentActor = actor;

      if (actor.type === 'party') {
        this.phase = BattlePhase.SELECT_ACTION;
      } else {
        this.phase = BattlePhase.ENEMY_TURN;
      }
      return;
    }

    // All turns done — new round
    this.buildTurnOrder();
    this.nextTurn();
  }

  /**
   * Set pending action from player input.
   */
  setAction(actionType, data) {
    this.pendingAction = { type: actionType, ...data };
  }

  /**
   * Execute the pending action or enemy AI action.
   */
  execute() {
    const actor = this.currentActor;
    this.lastResult = null;

    if (actor.type === 'enemy') {
      this._executeEnemyAI(actor.entity);
    } else if (this.pendingAction) {
      this._executePlayerAction(actor.entity, this.pendingAction);
      this.pendingAction = null;
    }

    this.phase = BattlePhase.CHECK_END;
  }

  /**
   * Check victory/defeat conditions.
   */
  checkEnd() {
    const allEnemiesDead = this.enemies.every((e) => e.currentHp <= 0);
    const allPartyDead = this.party.every((m) => m.currentHp <= 0);

    if (allEnemiesDead) {
      let exp = this.enemies.reduce((sum, e) => sum + e.exp, 0);
      // Gold Find bonus: 1.5x EXP if any party member has gold_bonus buff active
      if (this.buffs.some((b) => b.type === 'gold_bonus')) {
        exp = Math.floor(exp * 1.5);
      }
      this.expGained = exp;
      this.phase = BattlePhase.VICTORY;
      return 'victory';
    }

    if (allPartyDead) {
      this.phase = BattlePhase.DEFEAT;
      return 'defeat';
    }

    return null;
  }

  _executePlayerAction(member, action) {
    switch (action.type) {
      case ActionType.ATTACK:
        this._doAttack(member, action.target, 100);
        break;

      case ActionType.ABILITY: {
        const abil = ABILITIES[action.abilityId];
        if (!abil) break;
        if (member.currentSp < abil.spCost) {
          this.lastResult = { type: 'fail', reason: 'Not enough SP' };
          break;
        }
        member.currentSp -= abil.spCost;
        this._executeAbility(member, abil, action.target);
        break;
      }

      case ActionType.ITEM:
        if (action.useItemFn) {
          action.useItemFn();
          this.lastResult = { type: 'item', actor: member, item: action.itemId };
        }
        break;

      case ActionType.DEFEND:
        this.buffs.push({
          target: member,
          type: 'defend',
          turnsLeft: 2,
        });
        this.lastResult = { type: 'defend', actor: member };
        break;

      case ActionType.SCRIPTURE:
        this._doScriptureAttack(member, action.target, action.correct);
        break;
    }
  }

  _doAttack(attacker, target, power) {
    let str = attacker.stats.str;
    const def = target.stats.def ?? 0;

    // Apply buff_str to attacker
    if (this.buffs.some((b) => b.target === attacker && b.type === 'buff_str')) {
      str = Math.floor(str * 1.5);
    }

    // Apply defense modifiers to target
    let defVal = def;
    if (this.buffs.some((b) => b.target === target && b.type === 'defend')) {
      defVal = defVal * 2;
    }
    if (this.buffs.some((b) => b.target === target && b.type === 'buff_def')) {
      defVal = defVal * 2;
    }
    if (this.buffs.some((b) => b.target === target && b.type === 'debuff_def')) {
      defVal = Math.floor(defVal * 0.5);
    }

    let damage = calcDamage(str, power, defVal);

    // Shield reduces final damage
    if (this.buffs.some((b) => b.target === target && b.type === 'shield')) {
      damage = Math.max(1, Math.floor(damage * 0.5));
    }

    target.currentHp = Math.max(0, target.currentHp - damage);
    this.lastResult = {
      type: 'damage',
      actor: attacker,
      target,
      damage,
      targetType: 'enemy',
    };
  }

  _doScriptureAttack(attacker, target, correct) {
    const basePower = correct ? 150 : 60;
    const str = attacker.stats.fai || attacker.stats.wis;
    const damage = calcDamage(str, basePower, target.stats.wis || 0);

    target.currentHp = Math.max(0, target.currentHp - damage);
    this.lastResult = {
      type: 'scripture',
      actor: attacker,
      target,
      damage,
      correct,
    };
  }

  _executeAbility(caster, ability, target) {
    if (ability.effectType === 'scan') {
      this.lastResult = { type: 'scan', actor: caster, target, enemy: target };
      return;
    }

    if (ability.effectType === 'gold_bonus') {
      this.buffs.push({
        target: caster,
        type: 'gold_bonus',
        turnsLeft: 99, // lasts the whole battle
      });
      this.lastResult = { type: 'buff', actor: caster, effectType: 'gold_bonus' };
      return;
    }

    if (ability.effectType === 'cleanse') {
      this.buffs = this.buffs.filter(
        (b) => !(b.target === target && b.type.startsWith('debuff'))
      );
      this.lastResult = { type: 'cleanse', actor: caster, target };
      return;
    }

    if (ability.effectType && ability.effectType.startsWith('buff')) {
      const targets =
        ability.target === TargetType.ALL_ALLIES ? this.party.filter((m) => m.currentHp > 0) :
        ability.target === TargetType.SELF ? [caster] :
        [target];

      for (const t of targets) {
        this.buffs.push({
          target: t,
          type: ability.effectType,
          turnsLeft: ability.duration || 3,
        });
      }
      this.lastResult = { type: 'buff', actor: caster, effectType: ability.effectType };
      return;
    }

    if (ability.effectType && ability.effectType.startsWith('debuff')) {
      this.buffs.push({
        target,
        type: ability.effectType,
        turnsLeft: ability.duration || 3,
      });
      this.lastResult = { type: 'debuff', actor: caster, target, effectType: ability.effectType };
      return;
    }

    // Damage or heal based on target type
    if (
      ability.target === TargetType.SINGLE_ALLY ||
      ability.target === TargetType.ALL_ALLIES ||
      ability.target === TargetType.SELF
    ) {
      // Healing
      const heal = calcHeal(caster.stats.wis, ability.power);
      const targets =
        ability.target === TargetType.ALL_ALLIES ? this.party.filter((m) => m.currentHp > 0) :
        ability.target === TargetType.SELF ? [caster] :
        [target];

      for (const t of targets) {
        t.currentHp = Math.min(t.stats.hp, t.currentHp + heal);
      }
      this.lastResult = { type: 'heal', actor: caster, heal, targets };
    } else {
      // Damage
      const basePower = ability.power;
      const targets =
        ability.target === TargetType.ALL_ENEMIES ? this.enemies.filter((e) => e.currentHp > 0) :
        [target];

      let totalDamage = 0;
      for (const t of targets) {
        let power = basePower;
        if (ability.bonusVsWeakness && t.weakness === ability.bonusVsWeakness) {
          power = Math.floor(power * 1.5);
        }
        const damage = calcDamage(caster.stats.wis, power, t.stats.wis || 0);
        t.currentHp = Math.max(0, t.currentHp - damage);
        totalDamage += damage;
      }
      this.lastResult = { type: 'damage', actor: caster, damage: totalDamage, targets };
    }
  }

  _executeEnemyAI(enemy) {
    const alive = this.party.filter((m) => m.currentHp > 0);
    if (alive.length === 0) return;

    const target = alive[Math.floor(Math.random() * alive.length)];

    // Decide whether to use an ability
    const hasAbilities = enemy.abilities && enemy.abilities.length > 0;
    const abilityChance = enemy.ai === 'boss' ? 0.5 : 0.3;
    const useAbility = hasAbilities && Math.random() < abilityChance;

    if (useAbility) {
      const ability = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
      this._executeEnemyAbility(enemy, ability, target);
    } else {
      this._doEnemyBasicAttack(enemy, target);
    }
  }

  _executeEnemyAbility(enemy, ability, target) {
    if (ability.type === 'damage') {
      const def = target.stats.def ?? 0;
      let defVal = def;
      if (this.buffs.some((b) => b.target === target && b.type === 'defend')) {
        defVal = defVal * 2;
      }
      if (this.buffs.some((b) => b.target === target && b.type === 'buff_def')) {
        defVal = defVal * 2;
      }
      if (this.buffs.some((b) => b.target === target && b.type === 'debuff_def')) {
        defVal = Math.floor(defVal * 0.5);
      }

      let damage = calcDamage(enemy.stats.wis, ability.power, defVal);
      if (this.buffs.some((b) => b.target === target && b.type === 'shield')) {
        damage = Math.max(1, Math.floor(damage * 0.5));
      }

      target.currentHp = Math.max(0, target.currentHp - damage);
      this.lastResult = {
        type: 'damage',
        actor: enemy,
        target,
        damage,
        abilityName: ability.name,
        targetType: 'party',
      };
    } else if (ability.type.startsWith('debuff')) {
      // Check for status_shield — blocks debuffs
      if (this.buffs.some((b) => b.target === target && b.type === 'status_shield')) {
        this.lastResult = {
          type: 'damage',
          actor: enemy,
          target,
          damage: 0,
          abilityName: ability.name,
          targetType: 'party',
          blocked: true,
        };
        return;
      }
      this.buffs.push({
        target,
        type: ability.type,
        turnsLeft: 3,
      });
      this.lastResult = {
        type: 'debuff',
        actor: enemy,
        target,
        effectType: ability.type,
        abilityName: ability.name,
        targetType: 'party',
      };
    } else if (ability.type.startsWith('buff')) {
      this.buffs.push({
        target: enemy,
        type: ability.type,
        turnsLeft: 3,
      });
      this.lastResult = {
        type: 'buff',
        actor: enemy,
        effectType: ability.type,
        abilityName: ability.name,
      };
    }
  }

  _doEnemyBasicAttack(enemy, target) {
    const power = 80 + Math.floor(Math.random() * 40);

    let str = enemy.stats.str;
    if (this.buffs.some((b) => b.target === enemy && b.type === 'buff_str')) {
      str = Math.floor(str * 1.5);
    }

    const def = target.stats.def ?? 0;
    let defVal = def;
    if (this.buffs.some((b) => b.target === target && b.type === 'defend')) {
      defVal = defVal * 2;
    }
    if (this.buffs.some((b) => b.target === target && b.type === 'buff_def')) {
      defVal = defVal * 2;
    }
    if (this.buffs.some((b) => b.target === target && b.type === 'debuff_def')) {
      defVal = Math.floor(defVal * 0.5);
    }

    let damage = calcDamage(str, power, defVal);
    if (this.buffs.some((b) => b.target === target && b.type === 'shield')) {
      damage = Math.max(1, Math.floor(damage * 0.5));
    }

    target.currentHp = Math.max(0, target.currentHp - damage);
    this.lastResult = {
      type: 'damage',
      actor: enemy,
      target,
      damage,
      targetType: 'party',
    };
  }
}
