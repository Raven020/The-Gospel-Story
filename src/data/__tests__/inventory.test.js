import { describe, it, expect } from 'vitest';
import { Inventory, ITEMS, ItemType } from '../inventory.js';

describe('Inventory', () => {
  it('starts empty', () => {
    const inv = new Inventory();
    expect(inv.getAll()).toEqual([]);
  });

  it('adds items', () => {
    const inv = new Inventory();
    inv.add('bread', 3);
    expect(inv.count('bread')).toBe(3);
    expect(inv.has('bread')).toBe(true);
    expect(inv.has('bread', 3)).toBe(true);
    expect(inv.has('bread', 4)).toBe(false);
  });

  it('stacks on add', () => {
    const inv = new Inventory();
    inv.add('bread', 2);
    inv.add('bread', 3);
    expect(inv.count('bread')).toBe(5);
  });

  it('removes items', () => {
    const inv = new Inventory();
    inv.add('bread', 3);
    inv.remove('bread', 2);
    expect(inv.count('bread')).toBe(1);
  });

  it('deletes entry at 0', () => {
    const inv = new Inventory();
    inv.add('bread', 1);
    inv.remove('bread');
    expect(inv.has('bread')).toBe(false);
    expect(inv.count('bread')).toBe(0);
  });

  it('remove returns false for missing items', () => {
    const inv = new Inventory();
    expect(inv.remove('bread')).toBe(false);
  });

  it('getAll returns all items with definitions', () => {
    const inv = new Inventory();
    inv.add('bread', 2);
    inv.add('water', 1);
    const all = inv.getAll();
    expect(all).toHaveLength(2);
    expect(all.find(i => i.id === 'bread').quantity).toBe(2);
    expect(all.find(i => i.id === 'bread').def).toBe(ITEMS.bread);
  });

  it('useItem restores HP', () => {
    const inv = new Inventory();
    inv.add('bread', 1);
    const member = { currentHp: 50, stats: { hp: 200 }, currentSp: 50, stats: { hp: 200, sp: 100 } };
    const used = inv.useItem('bread', member);
    expect(used).toBe(true);
    expect(member.currentHp).toBe(100); // 50 + 50
    expect(inv.has('bread')).toBe(false); // consumed
  });

  it('useItem restores SP', () => {
    const inv = new Inventory();
    inv.add('water', 1);
    const member = { currentHp: 100, currentSp: 20, stats: { hp: 200, sp: 100 } };
    const used = inv.useItem('water', member);
    expect(used).toBe(true);
    expect(member.currentSp).toBe(50); // 20 + 30
  });

  it('useItem caps at max', () => {
    const inv = new Inventory();
    inv.add('bread', 1);
    const member = { currentHp: 190, currentSp: 50, stats: { hp: 200, sp: 100 } };
    inv.useItem('bread', member);
    expect(member.currentHp).toBe(200);
  });

  it('useItem fails for key items', () => {
    const inv = new Inventory();
    inv.add('temple_scroll', 1);
    const member = { currentHp: 50, currentSp: 50, stats: { hp: 200, sp: 100 } };
    expect(inv.useItem('temple_scroll', member)).toBe(false);
  });

  it('serializes and deserializes', () => {
    const inv = new Inventory();
    inv.add('bread', 3);
    inv.add('water', 1);
    const json = inv.toJSON();

    const inv2 = new Inventory();
    inv2.fromJSON(json);
    expect(inv2.count('bread')).toBe(3);
    expect(inv2.count('water')).toBe(1);
  });

  it('fromJSON discards unknown item IDs', () => {
    const inv = new Inventory();
    inv.fromJSON({ bread: 2, ghost_item: 5, water: 1 });
    expect(inv.count('bread')).toBe(2);
    expect(inv.count('water')).toBe(1);
    expect(inv.count('ghost_item')).toBe(0);
    expect(inv.getAll()).toHaveLength(2);
  });
});

describe('ITEMS', () => {
  it('defines bread as consumable', () => {
    expect(ITEMS.bread.type).toBe(ItemType.CONSUMABLE);
    expect(ITEMS.bread.effect.stat).toBe('hp');
  });

  it('defines temple_scroll as key item', () => {
    expect(ITEMS.temple_scroll.type).toBe(ItemType.KEY);
  });
});
