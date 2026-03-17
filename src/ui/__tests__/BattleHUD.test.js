import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BattleHUD } from '../BattleHUD.js';

function mockCtx() {
  return {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(),
  };
}

describe('BattleHUD', () => {
  let hud;

  beforeEach(() => {
    hud = new BattleHUD();
  });

  it('initializes with default state', () => {
    expect(hud.actionCursor).toBe(0);
    expect(hud.targetCursor).toBe(0);
    expect(hud.showActionMenu).toBe(false);
    expect(hud.damageFloaters).toEqual([]);
  });

  it('addFloater creates a floater', () => {
    hud.addFloater(100, 50, '15', '#ff0000');
    expect(hud.damageFloaters.length).toBe(1);
    expect(hud.damageFloaters[0].text).toBe('15');
    expect(hud.damageFloaters[0].frame).toBe(0);
  });

  it('updateFloaters advances frame and moves floaters up', () => {
    hud.addFloater(100, 50, '15', '#ff0000');
    hud.updateFloaters();
    expect(hud.damageFloaters[0].frame).toBe(1);
    expect(hud.damageFloaters[0].y).toBe(49);
  });

  it('updateFloaters removes expired floaters', () => {
    hud.addFloater(100, 50, '15', '#ff0000');
    for (let i = 0; i < 51; i++) {
      hud.updateFloaters();
    }
    expect(hud.damageFloaters.length).toBe(0);
  });

  it('getSelectedAction returns lowercase action name', () => {
    hud.actionCursor = 0;
    expect(hud.getSelectedAction()).toBe('prayer');
    hud.actionCursor = 5;
    expect(hud.getSelectedAction()).toBe('defend');
  });

  it('renderEnemies handles empty list', () => {
    const ctx = mockCtx();
    expect(() => hud.renderEnemies(ctx, [], 0)).not.toThrow();
  });

  it('renderEnemies draws alive enemies', () => {
    const ctx = mockCtx();
    const enemies = [
      { name: 'Doubt', currentHp: 60, stats: { hp: 60 }, isBoss: false },
    ];
    hud.renderEnemies(ctx, enemies, 0);
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renderEnemies skips dead enemies', () => {
    const ctx = mockCtx();
    const enemies = [
      { name: 'Dead', currentHp: 0, stats: { hp: 60 }, isBoss: false },
    ];
    hud.renderEnemies(ctx, enemies, 0);
    // Should return early since no alive enemies
  });

  it('renderPartyStrip draws party members', () => {
    const ctx = mockCtx();
    const party = [
      { id: 'p1', name: 'Hero', currentHp: 100, currentSp: 50, stats: { hp: 100, sp: 50 }, level: 1 },
    ];
    hud.renderPartyStrip(ctx, party, 'p1');
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renderActionMenu does nothing when not shown', () => {
    const ctx = mockCtx();
    hud.showActionMenu = false;
    hud.renderActionMenu(ctx, 0);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('renderTargetCursor handles empty alive list', () => {
    const ctx = mockCtx();
    expect(() => hud.renderTargetCursor(ctx, [], 0)).not.toThrow();
  });

  it('renderTargetCursor clamps cursor to alive count', () => {
    const ctx = mockCtx();
    hud.targetCursor = 5;
    const enemies = [
      { name: 'E1', currentHp: 30, stats: { hp: 60 } },
    ];
    hud.renderTargetCursor(ctx, enemies, 0);
    expect(hud.targetCursor).toBe(0);
  });

  it('addFloater converts number to string', () => {
    hud.addFloater(100, 50, 42, '#ff0000');
    expect(hud.damageFloaters[0].text).toBe('42');
  });

  describe('enemy HP on-hit display', () => {
    it('showEnemyHp sets a 30-frame timer', () => {
      hud.showEnemyHp('doubt');
      expect(hud._hpShowTimers.get('doubt')).toBe(30);
    });

    it('updateFloaters ticks down HP show timers', () => {
      hud.showEnemyHp('doubt');
      hud.updateFloaters();
      expect(hud._hpShowTimers.get('doubt')).toBe(29);
    });

    it('HP show timer is removed after 30 frames', () => {
      hud.showEnemyHp('doubt');
      for (let i = 0; i < 30; i++) {
        hud.updateFloaters();
      }
      expect(hud._hpShowTimers.has('doubt')).toBe(false);
    });

    it('showEnemyHp resets timer on repeated hits', () => {
      hud.showEnemyHp('doubt');
      for (let i = 0; i < 15; i++) {
        hud.updateFloaters();
      }
      expect(hud._hpShowTimers.get('doubt')).toBe(15);
      hud.showEnemyHp('doubt');
      expect(hud._hpShowTimers.get('doubt')).toBe(30);
    });

    it('renderEnemies draws HP text when timer is active', () => {
      const ctx = mockCtx();
      // Use id not in ENEMY_BATTLE_SPRITES to avoid OffscreenCanvas dependency
      const enemies = [
        { id: 'test_enemy', name: 'Test', currentHp: 40, stats: { hp: 60 }, isBoss: false },
      ];
      hud.showEnemyHp('test_enemy');
      hud.renderEnemies(ctx, enemies, 0);
      // fillRect is called for the fallback sprite rect + HP bar + HP text chars
      expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(2);
    });

    it('renderEnemies does not draw HP text when no timer', () => {
      const ctx = mockCtx();
      // Use id not in ENEMY_BATTLE_SPRITES to avoid OffscreenCanvas dependency
      const enemies = [
        { id: 'test_enemy', name: 'Test', currentHp: 40, stats: { hp: 60 }, isBoss: false },
      ];
      hud.renderEnemies(ctx, enemies, 0);
      const callsWithout = ctx.fillRect.mock.calls.length;

      // Now with timer
      const ctx2 = mockCtx();
      hud.showEnemyHp('test_enemy');
      hud.renderEnemies(ctx2, enemies, 0);
      const callsWith = ctx2.fillRect.mock.calls.length;

      // With timer should have more fillRect calls (from drawText rendering HP numbers)
      expect(callsWith).toBeGreaterThan(callsWithout);
    });
  });

  describe('party target cursor', () => {
    it('renderPartyTargetCursor draws highlight on visible frame', () => {
      const ctx = mockCtx();
      const party = [
        { id: 'p1', name: 'Hero', currentHp: 100, stats: { hp: 100 } },
        { id: 'p2', name: 'Ally', currentHp: 80, stats: { hp: 80 } },
      ];
      hud.renderPartyTargetCursor(ctx, party, 0, 0); // frame 0 → visible
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('renderPartyTargetCursor does not draw on blink-off frame', () => {
      const ctx = mockCtx();
      const party = [
        { id: 'p1', name: 'Hero', currentHp: 100, stats: { hp: 100 } },
      ];
      hud.renderPartyTargetCursor(ctx, party, 0, 20); // frame 20 → hidden (Math.floor(20/20)%2===1)
      expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('renderPartyTargetCursor handles out-of-range index', () => {
      const ctx = mockCtx();
      const party = [
        { id: 'p1', name: 'Hero', currentHp: 100, stats: { hp: 100 } },
      ];
      hud.renderPartyTargetCursor(ctx, party, 5, 0);
      expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('renderPartyTargetCursor skips dead members for slot positioning', () => {
      const ctx = mockCtx();
      const party = [
        { id: 'p1', name: 'Hero', currentHp: 0, stats: { hp: 100 } },
        { id: 'p2', name: 'Alive', currentHp: 50, stats: { hp: 80 } },
      ];
      // Target alive index 0 → should highlight slot 1 (p2)
      hud.renderPartyTargetCursor(ctx, party, 0, 0);
      expect(ctx.fillRect).toHaveBeenCalled();
      // The x position should be 47 (slot 1 * 47px width)
      const call = ctx.fillRect.mock.calls[0];
      expect(call[0]).toBe(47); // x = slotIndex(1) * SLOT_WIDTH(47)
    });
  });
});
