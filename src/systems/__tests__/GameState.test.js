import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameState } from '../GameState.js';

// Mock localStorage
const storage = {};
const localStorageMock = {
  getItem: vi.fn((key) => storage[key] || null),
  setItem: vi.fn((key, value) => { storage[key] = value; }),
  removeItem: vi.fn((key) => { delete storage[key]; }),
};
vi.stubGlobal('localStorage', localStorageMock);

describe('GameState', () => {
  beforeEach(() => {
    Object.keys(storage).forEach(k => delete storage[k]);
    vi.clearAllMocks();
  });

  it('creates with default state', () => {
    const gs = new GameState();
    expect(gs.party.active).toEqual([]);
    expect(gs.questFlags.current_arc).toBe(1);
  });

  describe('newGame', () => {
    it('initializes with Jesus in party', () => {
      const gs = new GameState();
      gs.newGame();
      expect(gs.party.active).toHaveLength(1);
      expect(gs.party.active[0].id).toBe('jesus');
      expect(gs.party.active[0].isJesus).toBe(true);
    });
  });

  describe('recruitMember', () => {
    it('adds to active party when under 5', () => {
      const gs = new GameState();
      gs.newGame();
      gs.recruitMember('peter');
      expect(gs.party.active).toHaveLength(2);
      expect(gs.party.active[1].id).toBe('peter');
    });

    it('adds to bench when active is full', () => {
      const gs = new GameState();
      gs.newGame();
      gs.recruitMember('peter');
      gs.recruitMember('andrew');
      gs.recruitMember('james');
      gs.recruitMember('john');
      expect(gs.party.active).toHaveLength(5);

      gs.recruitMember('philip');
      expect(gs.party.bench).toHaveLength(1);
      expect(gs.party.bench[0].id).toBe('philip');
    });

    it('prevents duplicate recruitment', () => {
      const gs = new GameState();
      gs.newGame();
      gs.recruitMember('peter');
      const result = gs.recruitMember('peter');
      expect(result).toBe(false);
      expect(gs.party.active).toHaveLength(2);
    });
  });

  describe('swapMember', () => {
    it('swaps active and bench members', () => {
      const gs = new GameState();
      gs.newGame();
      gs.recruitMember('peter');
      gs.recruitMember('andrew');
      gs.recruitMember('james');
      gs.recruitMember('john');
      gs.recruitMember('philip'); // goes to bench

      gs.swapMember(1, 0); // swap peter (active[1]) with philip (bench[0])
      expect(gs.party.active[1].id).toBe('philip');
      expect(gs.party.bench[0].id).toBe('peter');
    });

    it('cannot swap Jesus to bench', () => {
      const gs = new GameState();
      gs.newGame();
      gs.recruitMember('peter');
      gs.recruitMember('andrew');
      gs.recruitMember('james');
      gs.recruitMember('john');
      gs.recruitMember('philip');

      const result = gs.swapMember(0, 0); // try to swap Jesus
      expect(result).toBe(false);
      expect(gs.party.active[0].id).toBe('jesus');
    });
  });

  describe('removeMember', () => {
    it('removes from active', () => {
      const gs = new GameState();
      gs.newGame();
      gs.recruitMember('judas');
      gs.removeMember('judas');
      expect(gs.getMember('judas')).toBeNull();
    });
  });

  describe('save/load', () => {
    it('serializes and deserializes correctly', () => {
      const gs = new GameState();
      gs.newGame();
      gs.recruitMember('peter');
      gs.inventory.add('bread', 5);
      gs.questFlags.arc1_started = true;
      gs.currentMap = 'jerusalem';
      gs.playerX = 10;
      gs.playerY = 7;

      gs.save(0);

      const gs2 = new GameState();
      const loaded = gs2.load(0);
      expect(loaded).toBe(true);
      expect(gs2.party.active).toHaveLength(2);
      expect(gs2.party.active[0].id).toBe('jesus');
      expect(gs2.party.active[1].id).toBe('peter');
      expect(gs2.inventory.count('bread')).toBe(5);
      expect(gs2.questFlags.arc1_started).toBe(true);
      expect(gs2.currentMap).toBe('jerusalem');
    });

    it('preserves saved runtime state (HP/SP/exp) after load', () => {
      const gs = new GameState();
      gs.newGame();
      gs.party.active[0].currentHp = 42;
      gs.party.active[0].currentSp = 17;
      gs.party.active[0].exp = 25;

      gs.save(0);

      const gs2 = new GameState();
      gs2.load(0);
      expect(gs2.party.active[0].currentHp).toBe(42);
      expect(gs2.party.active[0].currentSp).toBe(17);
      expect(gs2.party.active[0].exp).toBe(25);
    });

    it('re-hydrates members through createMember on load', () => {
      const gs = new GameState();
      gs.newGame();
      gs.save(0);

      const gs2 = new GameState();
      gs2.load(0);
      const member = gs2.party.active[0];
      // createMember sets these fields — verify they survive re-hydration
      expect(member.role).toBe('leader');
      expect(member.sprite).toBe('jesus');
      expect(member.isJesus).toBe(true);
    });

    it('returns false for empty slot', () => {
      const gs = new GameState();
      expect(gs.load(0)).toBe(false);
    });

    it('rejects invalid slot numbers', () => {
      const gs = new GameState();
      expect(() => gs.save(-1)).toThrow();
      expect(() => gs.save(3)).toThrow();
    });
  });

  describe('canAccessMap', () => {
    it('allows access to arc 1 maps at start', () => {
      const gs = new GameState();
      gs.newGame();
      expect(gs.canAccessMap('jerusalem')).toBe(true);
      expect(gs.canAccessMap('temple')).toBe(true);
    });

    it('blocks access to arc 2 maps when current_arc is 1', () => {
      const gs = new GameState();
      gs.newGame();
      expect(gs.canAccessMap('jordan_river')).toBe(false);
      expect(gs.canAccessMap('wilderness')).toBe(false);
    });

    it('blocks access to arc 3 maps when current_arc is 2', () => {
      const gs = new GameState();
      gs.newGame();
      gs.questFlags.current_arc = 2;
      expect(gs.canAccessMap('galilee')).toBe(false);
      expect(gs.canAccessMap('capernaum')).toBe(false);
    });

    it('allows access to all maps when current_arc is 3', () => {
      const gs = new GameState();
      gs.newGame();
      gs.questFlags.current_arc = 3;
      expect(gs.canAccessMap('jerusalem')).toBe(true);
      expect(gs.canAccessMap('jordan_river')).toBe(true);
      expect(gs.canAccessMap('galilee')).toBe(true);
    });

    it('allows access to unlisted maps from any arc', () => {
      const gs = new GameState();
      gs.newGame();
      expect(gs.canAccessMap('demo')).toBe(true);
      expect(gs.canAccessMap('unknown_map')).toBe(true);
    });
  });

  describe('advanceArc', () => {
    it('advances current_arc forward', () => {
      const gs = new GameState();
      gs.newGame();
      expect(gs.questFlags.current_arc).toBe(1);
      gs.advanceArc(2);
      expect(gs.questFlags.current_arc).toBe(2);
    });

    it('does not regress current_arc', () => {
      const gs = new GameState();
      gs.newGame();
      gs.questFlags.current_arc = 3;
      gs.advanceArc(2);
      expect(gs.questFlags.current_arc).toBe(3);
    });

    it('persists through save/load', () => {
      const gs = new GameState();
      gs.newGame();
      gs.advanceArc(2);
      gs.save(0);

      const gs2 = new GameState();
      gs2.load(0);
      expect(gs2.questFlags.current_arc).toBe(2);
    });
  });

  describe('static methods', () => {
    it('hasSave returns false for empty slot', () => {
      expect(GameState.hasSave(0)).toBe(false);
    });

    it('hasSave returns true after save', () => {
      const gs = new GameState();
      gs.newGame();
      gs.save(1);
      expect(GameState.hasSave(1)).toBe(true);
    });

    it('getSaveInfo returns metadata', () => {
      const gs = new GameState();
      gs.newGame();
      gs.save(2);
      const info = GameState.getSaveInfo(2);
      expect(info).not.toBeNull();
      expect(info.slot).toBe(2);
      expect(info.level).toBe(1);
    });

    it('deleteSave removes save', () => {
      const gs = new GameState();
      gs.newGame();
      gs.save(0);
      GameState.deleteSave(0);
      expect(GameState.hasSave(0)).toBe(false);
    });
  });
});
