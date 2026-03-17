/**
 * T10: main.js test coverage
 *
 * main.js is the entry point — everything executes at import time.
 * We mock browser globals, import the module, and validate the critical
 * wiring: exports, scene registration, map registration, sprite registry
 * shape (via overworld), and playtime gating.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';

// --- Stub browser globals before any module loads ---
vi.stubGlobal('window', {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  innerWidth: 960,
  innerHeight: 640,
});
vi.stubGlobal('document', {
  createElement: vi.fn(() => ({
    width: 240,
    height: 160,
    style: {},
    getContext: vi.fn(() => ({
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      imageSmoothingEnabled: true,
      canvas: { width: 240, height: 160 },
    })),
  })),
  body: {
    appendChild: vi.fn(),
    style: {},
  },
});
vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => 1));
vi.stubGlobal('cancelAnimationFrame', vi.fn());
vi.stubGlobal('performance', { now: vi.fn(() => 0) });
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
});

class MockCanvas {
  constructor(w, h) { this.width = w; this.height = h; }
  getContext() { return { fillStyle: '', fillRect: vi.fn() }; }
}
vi.stubGlobal('OffscreenCanvas', MockCanvas);

let mainModule;

beforeAll(async () => {
  mainModule = await import('../main.js');
});

describe('main.js bootstrap', () => {
  it('exports all expected top-level objects', () => {
    expect(mainModule.display).toBeDefined();
    expect(mainModule.input).toBeDefined();
    expect(mainModule.scenes).toBeDefined();
    expect(mainModule.transitions).toBeDefined();
    expect(mainModule.loop).toBeDefined();
    expect(mainModule.audioManager).toBeDefined();
    expect(mainModule.gameState).toBeDefined();
    expect(mainModule.battleScene).toBeDefined();
  });

  it('starts on the title scene', () => {
    const { scenes } = mainModule;
    // scenes.switch('title') is the last scene switch in bootstrap
    expect(scenes.current).toBeDefined();
    expect(scenes._scenes.title).toBeDefined();
    expect(scenes.current).toBe(scenes._scenes.title);
  });

  it('registers all three scenes', () => {
    const { scenes } = mainModule;
    expect(scenes._scenes.title).toBeDefined();
    expect(scenes._scenes.battle).toBeDefined();
    expect(scenes._scenes.overworld).toBeDefined();
  });

  it('gameState is initialized with newGame defaults', () => {
    const { gameState } = mainModule;
    expect(gameState.questFlags).toBeDefined();
    expect(typeof gameState.playtime).toBe('number');
  });
});

describe('map registration', () => {
  it('all 8 maps are registered for cross-map warps', () => {
    const overworld = mainModule.scenes._scenes.overworld;
    const mapIds = ['jerusalem', 'temple', 'jordan_river', 'wilderness', 'galilee', 'capernaum', 'mountain', 'demo'];
    for (const id of mapIds) {
      const entry = overworld.getMapEntry(id);
      expect(entry, `map '${id}' should be registered`).toBeDefined();
      expect(entry.map).toBeDefined();
      expect(entry.tileset).toBeDefined();
    }
  });

  it('maps use correct tilesets', () => {
    const overworld = mainModule.scenes._scenes.overworld;
    // Temple uses interior tileset (distinct from overworld)
    const temple = overworld.getMapEntry('temple');
    const jerusalem = overworld.getMapEntry('jerusalem');
    expect(temple.tileset).not.toBe(jerusalem.tileset);
  });
});

describe('sprite registry (via overworld)', () => {
  const EXPECTED_KEYS = [
    'jesus', 'peter', 'andrew', 'james', 'john', 'philip', 'nathanael', 'matthew',
    'npc_john_baptist', 'townspeople_woman_a', 'townspeople_elder_a',
    'young_jesus', 'joseph', 'mary',
  ];

  it('overworld has all 14 MVP sprite keys with correct shape', () => {
    const overworld = mainModule.scenes._scenes.overworld;
    const registry = overworld.spriteRegistry;
    for (const key of EXPECTED_KEYS) {
      expect(registry[key], `sprite '${key}' should exist`).toBeDefined();
      expect(registry[key].palette, `sprite '${key}' should have palette`).toBeDefined();
      expect(registry[key].sprites.front, `sprite '${key}' should have front`).toBeDefined();
      expect(registry[key].sprites.back, `sprite '${key}' should have back`).toBeDefined();
      expect(registry[key].sprites.left, `sprite '${key}' should have left`).toBeDefined();
    }
  });
});

describe('playtime gating', () => {
  it('loop has started (requestAnimationFrame called)', () => {
    expect(requestAnimationFrame).toHaveBeenCalled();
  });
});
