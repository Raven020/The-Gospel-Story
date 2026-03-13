import { describe, it, expect } from 'vitest';
import { ROSTER, createMember, gainExp, expForLevel } from '../partyData.js';

describe('partyData', () => {
  describe('ROSTER', () => {
    it('has Jesus and all 12 disciples', () => {
      expect(ROSTER.jesus).toBeDefined();
      expect(ROSTER.peter).toBeDefined();
      expect(ROSTER.andrew).toBeDefined();
      expect(ROSTER.james).toBeDefined();
      expect(ROSTER.john).toBeDefined();
      expect(ROSTER.philip).toBeDefined();
      expect(ROSTER.nathanael).toBeDefined();
      expect(ROSTER.matthew).toBeDefined();
      expect(ROSTER.thomas).toBeDefined();
      expect(ROSTER.james_alphaeus).toBeDefined();
      expect(ROSTER.thaddaeus).toBeDefined();
      expect(ROSTER.simon_zealot).toBeDefined();
      expect(ROSTER.judas).toBeDefined();
      expect(Object.keys(ROSTER)).toHaveLength(13); // Jesus + 12
    });

    it('all roster entries have required fields', () => {
      for (const [id, def] of Object.entries(ROSTER)) {
        expect(def.id, `${id} missing id`).toBe(id);
        expect(def.name, `${id} missing name`).toBeTruthy();
        expect(def.baseStats.hp, `${id} missing hp`).toBeGreaterThan(0);
        expect(def.growth.hp, `${id} missing growth.hp`).toBeGreaterThan(0);
        expect(Array.isArray(def.abilities), `${id} abilities not array`).toBe(true);
      }
    });

    it('Judas has betrayal stat', () => {
      expect(ROSTER.judas.betrayalStat).toBeDefined();
    });
  });

  describe('createMember', () => {
    it('creates level 1 member with base stats', () => {
      const m = createMember('peter');
      expect(m.id).toBe('peter');
      expect(m.level).toBe(1);
      expect(m.stats.hp).toBe(ROSTER.peter.baseStats.hp);
      expect(m.currentHp).toBe(m.stats.hp);
      expect(m.currentSp).toBe(m.stats.sp);
    });

    it('applies growth for higher levels', () => {
      const m = createMember('peter', 5);
      expect(m.level).toBe(5);
      expect(m.stats.hp).toBe(ROSTER.peter.baseStats.hp + ROSTER.peter.growth.hp * 4);
    });

    it('throws for unknown roster ID', () => {
      expect(() => createMember('unknown')).toThrow();
    });

    it('Jesus has isJesus flag', () => {
      const m = createMember('jesus');
      expect(m.isJesus).toBe(true);
    });
  });

  describe('expForLevel', () => {
    it('increases with level', () => {
      expect(expForLevel(2)).toBeGreaterThan(expForLevel(1));
      expect(expForLevel(10)).toBeGreaterThan(expForLevel(5));
    });
  });

  describe('gainExp', () => {
    it('adds experience and levels up', () => {
      const m = createMember('peter');
      const expNeeded = m.expToNext;
      const levelUps = gainExp(m, expNeeded);

      expect(m.level).toBe(2);
      expect(levelUps).toHaveLength(1);
      expect(levelUps[0].level).toBe(2);
      expect(levelUps[0].gains.hp).toBe(ROSTER.peter.growth.hp);
    });

    it('handles multiple level-ups at once', () => {
      const m = createMember('peter');
      const levelUps = gainExp(m, 10000);
      expect(m.level).toBeGreaterThan(2);
      expect(levelUps.length).toBeGreaterThan(1);
    });

    it('heals to full on level up', () => {
      const m = createMember('peter');
      m.currentHp = 1;
      gainExp(m, m.expToNext);
      expect(m.currentHp).toBe(m.stats.hp);
    });
  });
});
