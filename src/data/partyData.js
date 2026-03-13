/**
 * Party data model per specs/party-system.md.
 * Defines Jesus + 12 disciples with base stats, abilities, and growth tables.
 * Stats: HP, SP (Spirit), STR, WIS, FAI (Faith), SPD
 */

export const Stats = {
  HP: 'hp',
  SP: 'sp',
  STR: 'str',
  WIS: 'wis',
  FAI: 'fai',
  SPD: 'spd',
};

/**
 * Base roster definitions. Level 1 base stats.
 * MVP disciples: Peter, Andrew, James, John, Philip, Nathanael (Bartholomew)
 */
export const ROSTER = {
  jesus: {
    id: 'jesus',
    name: 'Jesus',
    role: 'leader',
    sprite: 'jesus',
    baseStats: { hp: 200, sp: 100, str: 40, wis: 60, fai: 99, spd: 35 },
    growth: { hp: 12, sp: 8, str: 3, wis: 5, fai: 5, spd: 3 },
    abilities: ['prayer_heal', 'miracle_calm', 'truth_word'],
    isJesus: true,
  },
  peter: {
    id: 'peter',
    name: 'Peter',
    role: 'tank',
    sprite: 'peter',
    baseStats: { hp: 180, sp: 60, str: 50, wis: 25, fai: 40, spd: 30 },
    growth: { hp: 14, sp: 5, str: 5, wis: 2, fai: 3, spd: 2 },
    abilities: ['fishing_net', 'rock_stand'],
  },
  andrew: {
    id: 'andrew',
    name: 'Andrew',
    role: 'support',
    sprite: 'andrew',
    baseStats: { hp: 140, sp: 80, str: 30, wis: 35, fai: 45, spd: 32 },
    growth: { hp: 10, sp: 7, str: 2, wis: 3, fai: 4, spd: 3 },
    abilities: ['rally_cry', 'recruit_aid'],
  },
  james: {
    id: 'james',
    name: 'James',
    role: 'offense',
    sprite: 'james',
    baseStats: { hp: 160, sp: 70, str: 55, wis: 20, fai: 35, spd: 38 },
    growth: { hp: 12, sp: 6, str: 5, wis: 2, fai: 3, spd: 3 },
    abilities: ['thunder_zeal', 'zealous_strike'],
  },
  john: {
    id: 'john',
    name: 'John',
    role: 'healer',
    sprite: 'john',
    baseStats: { hp: 130, sp: 90, str: 20, wis: 50, fai: 55, spd: 28 },
    growth: { hp: 9, sp: 8, str: 1, wis: 5, fai: 5, spd: 2 },
    abilities: ['love_heal', 'devotion_shield'],
  },
  philip: {
    id: 'philip',
    name: 'Philip',
    role: 'analyst',
    sprite: 'philip',
    baseStats: { hp: 135, sp: 75, str: 28, wis: 45, fai: 40, spd: 35 },
    growth: { hp: 10, sp: 7, str: 2, wis: 4, fai: 3, spd: 3 },
    abilities: ['inquiry_scan', 'reveal_weakness'],
  },
  nathanael: {
    id: 'nathanael',
    name: 'Nathanael',
    role: 'cleanser',
    sprite: 'nathanael',
    baseStats: { hp: 145, sp: 85, str: 25, wis: 40, fai: 50, spd: 30 },
    growth: { hp: 11, sp: 7, str: 2, wis: 4, fai: 4, spd: 2 },
    abilities: ['purify', 'sincere_guard'],
  },
  matthew: {
    id: 'matthew',
    name: 'Matthew',
    role: 'resource',
    sprite: 'matthew',
    baseStats: { hp: 140, sp: 70, str: 25, wis: 40, fai: 35, spd: 33 },
    growth: { hp: 10, sp: 6, str: 2, wis: 4, fai: 3, spd: 3 },
    abilities: ['gold_find', 'provision'],
  },
  thomas: {
    id: 'thomas',
    name: 'Thomas',
    role: 'detection',
    sprite: 'thomas',
    baseStats: { hp: 140, sp: 75, str: 30, wis: 45, fai: 30, spd: 34 },
    growth: { hp: 10, sp: 7, str: 2, wis: 4, fai: 2, spd: 3 },
    abilities: ['doubt_detect', 'question_probe'],
  },
  james_alphaeus: {
    id: 'james_alphaeus',
    name: 'James',
    role: 'tbd',
    sprite: 'james_alphaeus',
    baseStats: { hp: 150, sp: 70, str: 35, wis: 35, fai: 35, spd: 32 },
    growth: { hp: 11, sp: 6, str: 3, wis: 3, fai: 3, spd: 3 },
    abilities: [],
  },
  thaddaeus: {
    id: 'thaddaeus',
    name: 'Thaddaeus',
    role: 'tbd',
    sprite: 'thaddaeus',
    baseStats: { hp: 150, sp: 70, str: 35, wis: 35, fai: 35, spd: 32 },
    growth: { hp: 11, sp: 6, str: 3, wis: 3, fai: 3, spd: 3 },
    abilities: [],
  },
  simon_zealot: {
    id: 'simon_zealot',
    name: 'Simon',
    role: 'tbd',
    sprite: 'simon_zealot',
    baseStats: { hp: 155, sp: 65, str: 40, wis: 30, fai: 35, spd: 36 },
    growth: { hp: 12, sp: 5, str: 4, wis: 2, fai: 3, spd: 3 },
    abilities: [],
  },
  judas: {
    id: 'judas',
    name: 'Judas',
    role: 'betrayer',
    sprite: 'judas',
    baseStats: { hp: 145, sp: 70, str: 35, wis: 38, fai: 20, spd: 38 },
    growth: { hp: 10, sp: 6, str: 3, wis: 3, fai: 1, spd: 4 },
    abilities: ['coin_toss', 'false_aid'],
    betrayalStat: 0, // Hidden, increments through story
  },
};

/**
 * Experience required for each level. Simple quadratic curve.
 */
export function expForLevel(level) {
  return Math.floor(10 * level * level);
}

/**
 * Create a party member instance from roster definition.
 */
export function createMember(rosterId, level = 1) {
  const def = ROSTER[rosterId];
  if (!def) throw new Error(`Unknown roster ID: ${rosterId}`);

  const stats = {};
  for (const [key, base] of Object.entries(def.baseStats)) {
    stats[key] = base + def.growth[key] * (level - 1);
  }

  return {
    id: def.id,
    name: def.name,
    role: def.role,
    sprite: def.sprite,
    level,
    exp: 0,
    expToNext: expForLevel(level + 1) - expForLevel(level),
    stats: { ...stats },
    currentHp: stats.hp,
    currentSp: stats.sp,
    abilities: [...def.abilities],
    isJesus: def.isJesus || false,
    betrayalStat: def.betrayalStat !== undefined ? def.betrayalStat : undefined,
  };
}

/**
 * Apply experience gain and handle level-ups. Returns array of stat gains per level.
 */
export function gainExp(member, amount) {
  const levelUps = [];
  member.exp += amount;
  const def = ROSTER[member.id];

  while (member.exp >= member.expToNext) {
    member.exp -= member.expToNext;
    member.level++;
    member.expToNext = expForLevel(member.level + 1) - expForLevel(member.level);

    const gains = {};
    for (const [key, growth] of Object.entries(def.growth)) {
      gains[key] = growth;
      member.stats[key] += growth;
    }

    // Heal to new max on level up
    member.currentHp = member.stats.hp;
    member.currentSp = member.stats.sp;
    levelUps.push({ level: member.level, gains });
  }

  return levelUps;
}
