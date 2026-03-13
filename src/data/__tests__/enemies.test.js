import { describe, it, expect } from 'vitest';
import { ENEMIES, createEnemy } from '../enemies.js';

describe('ENEMIES data', () => {
  it('defines all expected enemy types', () => {
    const ids = Object.keys(ENEMIES);
    expect(ids).toContain('doubt');
    expect(ids).toContain('fear');
    expect(ids).toContain('temptation');
    expect(ids).toContain('pride');
    expect(ids).toContain('greed');
    expect(ids).toContain('deception');
    expect(ids).toContain('satan');
  });

  it('each enemy has required fields', () => {
    for (const [id, enemy] of Object.entries(ENEMIES)) {
      expect(enemy.id).toBe(id);
      expect(enemy.name).toBeTruthy();
      expect(enemy.stats).toBeDefined();
      expect(enemy.stats.hp).toBeGreaterThan(0);
      expect(enemy.stats.str).toBeGreaterThan(0);
      expect(enemy.stats.spd).toBeGreaterThan(0);
      expect(enemy.exp).toBeGreaterThan(0);
      expect(enemy.ai).toBeTruthy();
      expect(enemy.weakness).toBeTruthy();
    }
  });

  it('satan is marked as boss', () => {
    expect(ENEMIES.satan.isBoss).toBe(true);
  });

  it('regular enemies are not bosses', () => {
    expect(ENEMIES.doubt.isBoss).toBeUndefined();
    expect(ENEMIES.fear.isBoss).toBeUndefined();
  });

  it('satan has significantly higher stats than regular enemies', () => {
    expect(ENEMIES.satan.stats.hp).toBeGreaterThan(200);
    expect(ENEMIES.satan.stats.str).toBeGreaterThan(30);
  });
});

describe('createEnemy', () => {
  it('creates an enemy instance with currentHp', () => {
    const enemy = createEnemy('doubt');
    expect(enemy).not.toBeNull();
    expect(enemy.id).toBe('doubt');
    expect(enemy.name).toBe('Doubt');
    expect(enemy.currentHp).toBe(enemy.stats.hp);
  });

  it('creates independent stat copies', () => {
    const a = createEnemy('doubt');
    const b = createEnemy('doubt');
    a.stats.hp = 999;
    expect(b.stats.hp).toBe(ENEMIES.doubt.stats.hp);
  });

  it('returns null for unknown enemy', () => {
    expect(createEnemy('nonexistent')).toBeNull();
  });

  it('boss enemy instance has isBoss true', () => {
    const satan = createEnemy('satan');
    expect(satan.isBoss).toBe(true);
  });

  it('regular enemy instance has isBoss false', () => {
    const doubt = createEnemy('doubt');
    expect(doubt.isBoss).toBe(false);
  });
});
