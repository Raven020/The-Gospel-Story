/**
 * Central game state: party, inventory, quest flags, current map/position.
 * Handles save/load via localStorage per IMPLEMENTATION_PLAN Phase 4.4.
 * 3 save slots, save anywhere.
 */

import { createMember } from '../data/partyData.js';
import { Inventory } from '../data/inventory.js';
import { createQuestFlags } from '../data/questFlags.js';

const SAVE_KEY_PREFIX = 'gospel_story_save_';
const MAX_SLOTS = 3;

/**
 * Maps each map ID to the minimum arc required to access it.
 * Maps not listed here are accessible from any arc (e.g., demo).
 */
const MAP_ARC_REQUIREMENTS = {
  jerusalem: 1,
  temple: 1,
  jordan_river: 2,
  wilderness: 2,
  galilee: 3,
  capernaum: 3,
  mountain: 3,
};

export class GameState {
  constructor() {
    this.party = {
      active: [],   // up to 5 members (Jesus + 4)
      bench: [],    // remaining recruited members
    };
    this.inventory = new Inventory();
    this.questFlags = createQuestFlags();
    this.currentMap = 'demo';
    this.playerX = 9;
    this.playerY = 5;
    this.playerFacing = 'down';
    this.playtime = 0; // seconds
  }

  /**
   * Initialize a new game state.
   * Arc 1 starts with Joseph (Mary follows as NPC companion).
   * Jesus joins the party at Arc 2 start.
   */
  newGame() {
    this.party.active = [createMember('joseph', 1)];
    this.party.bench = [];
    this.inventory = new Inventory();
    this.questFlags = createQuestFlags();
    this.currentMap = 'jerusalem';
    this.playerX = 14;
    this.playerY = 18;
    this.playerFacing = 'down';
    this.playtime = 0;
  }

  /**
   * Transition party from Arc 1 (Joseph) to Arc 2 (Jesus).
   * Removes Joseph from party, adds Jesus as leader.
   */
  transitionToArc2() {
    this.removeMember('joseph');
    if (!this.getMember('jesus')) {
      this.party.active = [createMember('jesus', 1), ...this.party.active];
    }
  }

  /**
   * Recruit a disciple. Added to active if < 5, else bench.
   */
  recruitMember(rosterId, level = 1) {
    // Check not already recruited
    const all = [...this.party.active, ...this.party.bench];
    if (all.some((m) => m.id === rosterId)) return false;

    const member = createMember(rosterId, level);
    if (this.party.active.length < 5) {
      this.party.active.push(member);
    } else {
      this.party.bench.push(member);
    }
    return true;
  }

  /**
   * Swap a member between active and bench.
   * Jesus cannot be moved to bench.
   */
  swapMember(activeIndex, benchIndex) {
    const activeMember = this.party.active[activeIndex];
    const benchMember = this.party.bench[benchIndex];

    if (!activeMember || !benchMember) return false;
    if (activeMember.isJesus) return false;

    this.party.active[activeIndex] = benchMember;
    this.party.bench[benchIndex] = activeMember;
    return true;
  }

  /**
   * Remove a member permanently (e.g., Judas leaves in Arc 11).
   */
  removeMember(memberId) {
    this.party.active = this.party.active.filter((m) => m.id !== memberId);
    this.party.bench = this.party.bench.filter((m) => m.id !== memberId);
  }

  /**
   * Check if the player can access a map based on current arc progression.
   * Enforces linear arc ordering — players cannot skip ahead.
   * @param {string} mapId
   * @returns {boolean}
   */
  canAccessMap(mapId) {
    const requiredArc = MAP_ARC_REQUIREMENTS[mapId];
    if (requiredArc === undefined) return true; // unlisted maps are always accessible
    const currentArc = this.questFlags.current_arc || 1;
    return currentArc >= requiredArc;
  }

  /**
   * Advance to the next arc. Called when an arc's completion flag is set.
   * @param {number} arc - The arc number to advance to.
   */
  advanceArc(arc) {
    if (arc > (this.questFlags.current_arc || 1)) {
      this.questFlags.current_arc = arc;
    }
  }

  /**
   * Get a member by ID from active or bench.
   */
  getMember(memberId) {
    return (
      this.party.active.find((m) => m.id === memberId) ||
      this.party.bench.find((m) => m.id === memberId) ||
      null
    );
  }

  /**
   * Serialize state to JSON-safe object.
   */
  serialize() {
    return {
      version: 1,
      party: {
        active: this.party.active.map(serializeMember),
        bench: this.party.bench.map(serializeMember),
      },
      inventory: this.inventory.toJSON(),
      questFlags: { ...this.questFlags },
      currentMap: this.currentMap,
      playerX: this.playerX,
      playerY: this.playerY,
      playerFacing: this.playerFacing,
      playtime: this.playtime,
      timestamp: Date.now(),
    };
  }

  /**
   * Deserialize from JSON-safe object.
   */
  deserialize(data) {
    if (!data || data.version !== 1) throw new Error('Invalid save data');

    this.party.active = data.party.active.map(deserializeMember);
    this.party.bench = data.party.bench.map(deserializeMember);
    this.inventory = new Inventory();
    this.inventory.fromJSON(data.inventory);
    this.questFlags = { ...data.questFlags };
    this.currentMap = data.currentMap;
    this.playerX = data.playerX;
    this.playerY = data.playerY;
    this.playerFacing = data.playerFacing;
    this.playtime = data.playtime || 0;
  }

  /**
   * Save to localStorage slot (0-2).
   */
  save(slot) {
    if (slot < 0 || slot >= MAX_SLOTS) throw new Error(`Invalid slot: ${slot}`);
    const data = this.serialize();
    try {
      localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  /**
   * Load from localStorage slot (0-2).
   */
  load(slot) {
    if (slot < 0 || slot >= MAX_SLOTS) throw new Error(`Invalid slot: ${slot}`);
    try {
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.deserialize(data);
      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  }

  /**
   * Check if a save exists in a slot.
   */
  static hasSave(slot) {
    try {
      return !!localStorage.getItem(SAVE_KEY_PREFIX + slot);
    } catch {
      return false;
    }
  }

  /**
   * Get save slot metadata (for save/load UI).
   */
  static getSaveInfo(slot) {
    try {
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        slot,
        timestamp: data.timestamp,
        playtime: data.playtime,
        map: data.currentMap,
        name: data.party.active[0]?.name || '',
        level: data.party.active[0]?.level || 1,
      };
    } catch {
      return null;
    }
  }

  /**
   * Delete a save slot.
   */
  static deleteSave(slot) {
    try {
      localStorage.removeItem(SAVE_KEY_PREFIX + slot);
    } catch {
      // ignore
    }
  }
}

function serializeMember(m) {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    sprite: m.sprite,
    level: m.level,
    exp: m.exp,
    expToNext: m.expToNext,
    stats: { ...m.stats },
    currentHp: m.currentHp,
    currentSp: m.currentSp,
    abilities: [...m.abilities],
    isJesus: m.isJesus,
    betrayalStat: m.betrayalStat,
    morale: m.morale,
  };
}

function deserializeMember(data) {
  // Re-hydrate through createMember to pick up any new fields added to the
  // roster since this save was created, then overlay saved runtime state.
  const fresh = createMember(data.id, data.level);
  return {
    ...fresh,
    exp: data.exp,
    expToNext: data.expToNext,
    stats: { ...data.stats },
    currentHp: data.currentHp,
    currentSp: data.currentSp,
    abilities: [...data.abilities],
    betrayalStat: data.betrayalStat,
    morale: data.morale ?? fresh.morale,
  };
}
