/**
 * Inventory system per IMPLEMENTATION_PLAN Phase 4.2.
 * Thematic consumables and key items. Simple flat map structure.
 */

export const ItemType = {
  CONSUMABLE: 'consumable',
  KEY: 'key',
};

/**
 * Item definitions. All MVP items.
 */
export const ITEMS = {
  bread: {
    id: 'bread',
    name: 'Bread',
    type: ItemType.CONSUMABLE,
    description: 'Restores 50 HP.',
    effect: { stat: 'hp', amount: 50 },
  },
  fish: {
    id: 'fish',
    name: 'Fish',
    type: ItemType.CONSUMABLE,
    description: 'Restores 80 HP.',
    effect: { stat: 'hp', amount: 80 },
  },
  oil: {
    id: 'oil',
    name: 'Anointing Oil',
    type: ItemType.CONSUMABLE,
    description: 'Boosts STR by 5 for one battle.',
    effect: { stat: 'str', amount: 5, duration: 'battle' },
  },
  water: {
    id: 'water',
    name: 'Living Water',
    type: ItemType.CONSUMABLE,
    description: 'Restores 30 SP.',
    effect: { stat: 'sp', amount: 30 },
  },
  wine: {
    id: 'wine',
    name: 'Wine',
    type: ItemType.CONSUMABLE,
    description: 'Restores 50 SP.',
    effect: { stat: 'sp', amount: 50 },
  },
  herbs: {
    id: 'herbs',
    name: 'Herbs',
    type: ItemType.CONSUMABLE,
    description: 'Restores 30 HP.',
    effect: { stat: 'hp', amount: 30 },
  },
  // Key items (non-consumable, quest progression)
  temple_scroll: {
    id: 'temple_scroll',
    name: 'Temple Scroll',
    type: ItemType.KEY,
    description: 'A scroll from the Temple of Jerusalem.',
  },
  fishing_net: {
    id: 'fishing_net',
    name: 'Fishing Net',
    type: ItemType.KEY,
    description: "Peter's fishing net.",
  },
};

/**
 * Inventory: a map of item ID -> quantity.
 */
export class Inventory {
  constructor() {
    this.items = {};
  }

  add(itemId, quantity = 1) {
    this.items[itemId] = (this.items[itemId] || 0) + quantity;
  }

  remove(itemId, quantity = 1) {
    if (!this.items[itemId]) return false;
    this.items[itemId] -= quantity;
    if (this.items[itemId] <= 0) {
      delete this.items[itemId];
    }
    return true;
  }

  has(itemId, quantity = 1) {
    return (this.items[itemId] || 0) >= quantity;
  }

  count(itemId) {
    return this.items[itemId] || 0;
  }

  /**
   * Get all items as [{id, quantity, def}] array.
   */
  getAll() {
    return Object.entries(this.items).map(([id, quantity]) => ({
      id,
      quantity,
      def: ITEMS[id] || null,
    }));
  }

  /**
   * Use a consumable item on a party member.
   * Returns true if item was used, false if not usable.
   */
  useItem(itemId, member) {
    const def = ITEMS[itemId];
    if (!def || def.type !== ItemType.CONSUMABLE) return false;
    if (!this.has(itemId)) return false;

    const effect = def.effect;
    if (effect.stat === 'hp') {
      member.currentHp = Math.min(member.stats.hp, member.currentHp + effect.amount);
    } else if (effect.stat === 'sp') {
      member.currentSp = Math.min(member.stats.sp, member.currentSp + effect.amount);
    }
    // Battle-duration buffs handled by combat system

    this.remove(itemId);
    return true;
  }

  toJSON() {
    return { ...this.items };
  }

  fromJSON(data) {
    this.items = { ...data };
  }
}
