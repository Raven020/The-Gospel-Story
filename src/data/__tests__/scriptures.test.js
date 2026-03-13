import { describe, it, expect } from 'vitest';
import { SCRIPTURE_CHALLENGES, ENEMY_SCRIPTURE } from '../scriptures.js';

describe('SCRIPTURE_CHALLENGES', () => {
  it('all challenges have required fields', () => {
    for (const [id, challenge] of Object.entries(SCRIPTURE_CHALLENGES)) {
      expect(challenge.id).toBe(id);
      expect(typeof challenge.challenge).toBe('string');
      expect(challenge.challenge.length).toBeGreaterThan(0);
      expect(Array.isArray(challenge.options)).toBe(true);
      expect(challenge.options.length).toBe(3);
    }
  });

  it('each challenge has exactly one correct option', () => {
    for (const [id, challenge] of Object.entries(SCRIPTURE_CHALLENGES)) {
      const correctCount = challenge.options.filter((o) => o.correct === true).length;
      expect(correctCount).toBe(1);
    }
  });

  it('all options have text, ref, and correct fields', () => {
    for (const challenge of Object.values(SCRIPTURE_CHALLENGES)) {
      for (const option of challenge.options) {
        expect(typeof option.text).toBe('string');
        expect(option.text.length).toBeGreaterThan(0);
        expect(typeof option.ref).toBe('string');
        expect(option.ref.length).toBeGreaterThan(0);
        expect(typeof option.correct).toBe('boolean');
      }
    }
  });

  it('contains the three temptation challenges', () => {
    expect(SCRIPTURE_CHALLENGES.temptation_bread).toBeDefined();
    expect(SCRIPTURE_CHALLENGES.temptation_pinnacle).toBeDefined();
    expect(SCRIPTURE_CHALLENGES.temptation_kingdoms).toBeDefined();
  });

  it('contains generic encounter challenges', () => {
    expect(SCRIPTURE_CHALLENGES.doubt_challenge).toBeDefined();
    expect(SCRIPTURE_CHALLENGES.fear_challenge).toBeDefined();
    expect(SCRIPTURE_CHALLENGES.pride_challenge).toBeDefined();
    expect(SCRIPTURE_CHALLENGES.deception_challenge).toBeDefined();
    expect(SCRIPTURE_CHALLENGES.temptation_challenge).toBeDefined();
    expect(SCRIPTURE_CHALLENGES.greed_challenge).toBeDefined();
  });
});

describe('ENEMY_SCRIPTURE', () => {
  it('all enemy types have a scripture mapping', () => {
    const expectedEnemies = ['doubt', 'fear', 'temptation', 'pride', 'greed', 'deception', 'satan'];
    for (const enemyId of expectedEnemies) {
      expect(ENEMY_SCRIPTURE[enemyId]).toBeDefined();
    }
  });

  it('all mapped challenge IDs exist in SCRIPTURE_CHALLENGES', () => {
    for (const [enemyId, challengeId] of Object.entries(ENEMY_SCRIPTURE)) {
      expect(SCRIPTURE_CHALLENGES[challengeId]).toBeDefined();
    }
  });
});
