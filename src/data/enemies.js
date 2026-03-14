/**
 * Enemy definitions for MVP combat (Arcs 2-3).
 * Stat formulas: damage = ATK - DEF/2, HP scaling by level.
 */

export const ENEMIES = {
  // Abstract spiritual forces (random encounters)
  doubt: {
    id: 'doubt',
    name: 'Doubt',
    stats: { hp: 60, str: 15, wis: 20, spd: 18 },
    exp: 12,
    ai: 'basic',
    weakness: 'truth',
    abilities: [
      { id: 'cloud_of_doubt', name: 'Cloud of Doubt', power: 60, type: 'debuff_def' },
    ],
  },
  fear: {
    id: 'fear',
    name: 'Fear',
    stats: { hp: 55, str: 20, wis: 12, spd: 22 },
    exp: 14,
    ai: 'basic',
    weakness: 'prayer',
    abilities: [
      { id: 'paralyzing_fear', name: 'Paralyzing Fear', power: 55, type: 'damage' },
    ],
  },
  temptation: {
    id: 'temptation',
    name: 'Temptation',
    stats: { hp: 70, str: 18, wis: 25, spd: 16 },
    exp: 16,
    ai: 'basic',
    weakness: 'scripture',
    abilities: [
      { id: 'lure', name: 'Lure', power: 50, type: 'debuff_str' },
    ],
  },
  pride: {
    id: 'pride',
    name: 'Pride',
    stats: { hp: 80, str: 22, wis: 18, spd: 15 },
    exp: 18,
    ai: 'basic',
    weakness: 'truth',
    abilities: [
      { id: 'boastful_strike', name: 'Boastful Strike', power: 70, type: 'damage' },
    ],
  },
  greed: {
    id: 'greed',
    name: 'Greed',
    stats: { hp: 65, str: 16, wis: 22, spd: 20 },
    exp: 15,
    ai: 'basic',
    weakness: 'miracle',
    abilities: [
      { id: 'drain', name: 'Drain', power: 45, type: 'damage' },
    ],
  },
  deception: {
    id: 'deception',
    name: 'Deception',
    stats: { hp: 50, str: 12, wis: 28, spd: 24 },
    exp: 13,
    ai: 'basic',
    weakness: 'truth',
    abilities: [
      { id: 'false_image', name: 'False Image', power: 0, type: 'buff_def' },
    ],
  },

  // Boss enemies
  satan: {
    id: 'satan',
    name: 'Satan',
    stats: { hp: 300, str: 40, wis: 50, spd: 30 },
    exp: 100,
    ai: 'boss',
    weakness: 'scripture',
    isBoss: true,
    abilities: [
      { id: 'dark_temptation', name: 'Dark Temptation', power: 80, type: 'damage' },
      { id: 'lies_of_the_enemy', name: 'Lies of the Enemy', power: 0, type: 'debuff_str' },
      { id: 'shadow_veil', name: 'Shadow Veil', power: 0, type: 'buff_def' },
    ],
  },
};

/**
 * Create an enemy instance for battle.
 */
export function createEnemy(enemyId) {
  const def = ENEMIES[enemyId];
  if (!def) return null;
  return {
    id: def.id,
    name: def.name,
    stats: { ...def.stats },
    currentHp: def.stats.hp,
    exp: def.exp,
    ai: def.ai,
    weakness: def.weakness,
    isBoss: def.isBoss || false,
    abilities: def.abilities || [],
  };
}
