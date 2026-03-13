import { describe, it, expect } from 'vitest';
import { ABILITIES, AbilityCategory, TargetType } from '../abilities.js';

describe('AbilityCategory', () => {
  it('defines all categories', () => {
    expect(AbilityCategory.PRAYER).toBe('prayer');
    expect(AbilityCategory.MIRACLE).toBe('miracle');
    expect(AbilityCategory.TRUTH).toBe('truth');
    expect(AbilityCategory.SCRIPTURE).toBe('scripture');
  });
});

describe('TargetType', () => {
  it('defines all target types', () => {
    expect(TargetType.SINGLE_ENEMY).toBe('single_enemy');
    expect(TargetType.ALL_ENEMIES).toBe('all_enemies');
    expect(TargetType.SINGLE_ALLY).toBe('single_ally');
    expect(TargetType.ALL_ALLIES).toBe('all_allies');
    expect(TargetType.SELF).toBe('self');
  });
});

describe('ABILITIES', () => {
  it('each ability has required fields', () => {
    for (const [id, ability] of Object.entries(ABILITIES)) {
      expect(ability.id).toBe(id);
      expect(ability.name).toBeTruthy();
      expect(ability.category).toBeTruthy();
      expect(ability.target).toBeTruthy();
      expect(typeof ability.spCost).toBe('number');
      expect(ability.spCost).toBeGreaterThanOrEqual(0);
      expect(typeof ability.power).toBe('number');
      expect(ability.description).toBeTruthy();
    }
  });

  it('has prayer abilities', () => {
    const prayers = Object.values(ABILITIES).filter(
      (a) => a.category === AbilityCategory.PRAYER
    );
    expect(prayers.length).toBeGreaterThan(0);
    expect(prayers.some((a) => a.id === 'prayer_heal')).toBe(true);
  });

  it('has miracle abilities', () => {
    const miracles = Object.values(ABILITIES).filter(
      (a) => a.category === AbilityCategory.MIRACLE
    );
    expect(miracles.length).toBeGreaterThan(0);
    expect(miracles.some((a) => a.id === 'miracle_calm')).toBe(true);
  });

  it('has truth abilities', () => {
    const truths = Object.values(ABILITIES).filter(
      (a) => a.category === AbilityCategory.TRUTH
    );
    expect(truths.length).toBeGreaterThan(0);
    expect(truths.some((a) => a.id === 'truth_word')).toBe(true);
  });

  it('healing abilities target allies', () => {
    const heal = ABILITIES.prayer_heal;
    expect(heal.target).toBe(TargetType.SINGLE_ALLY);
    expect(heal.power).toBeGreaterThan(0);
  });

  it('offensive abilities target enemies', () => {
    const attack = ABILITIES.thunder_zeal;
    expect(attack.target).toBe(TargetType.SINGLE_ENEMY);
    expect(attack.power).toBeGreaterThan(0);
  });

  it('all-enemy abilities exist', () => {
    const aoe = ABILITIES.miracle_calm;
    expect(aoe.target).toBe(TargetType.ALL_ENEMIES);
  });

  it('self-target abilities exist', () => {
    const self = ABILITIES.rock_stand;
    expect(self.target).toBe(TargetType.SELF);
  });

  it('abilities with effectType have valid types', () => {
    for (const ability of Object.values(ABILITIES)) {
      if (ability.effectType) {
        expect(typeof ability.effectType).toBe('string');
      }
    }
  });
});
