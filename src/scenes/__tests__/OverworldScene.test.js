import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OverworldScene } from '../OverworldScene.js';
import { TransitionManager, TransitionState } from '../../engine/TransitionManager.js';
import { Actions, InputContext } from '../../systems/InputSystem.js';

// Mock OffscreenCanvas for tile caching
class MockCanvas {
  constructor(w, h) { this.width = w; this.height = h; }
  getContext() { return { fillStyle: '', fillRect: vi.fn() }; }
}
vi.stubGlobal('OffscreenCanvas', MockCanvas);

function createMockInput() {
  return {
    context: InputContext.OVERWORLD,
    pressed: vi.fn(() => false),
    held: vi.fn(() => false),
    getDirectionalHeld: vi.fn(() => null),
    getDirectionalPressed: vi.fn(() => null),
  };
}

function createTestMap() {
  return {
    id: 'test',
    name: 'Test Map',
    width: 10,
    height: 10,
    tileset: 'overworld',
    layers: {
      ground: new Array(100).fill(1),
      detail: new Array(100).fill(0),
      above: new Array(100).fill(0),
      collision: new Array(100).fill(0),
      event: new Array(100).fill(0),
    },
    events: {},
    npcs: [],
    encounters: { enabled: false },
  };
}

function createTestTileset() {
  return {
    PALETTE: { A: '#FF0000' },
    TILES: {
      1: Array.from({ length: 16 }, () => Array(16).fill('A')),
    },
  };
}

describe('OverworldScene', () => {
  let scene, input, transitions;

  beforeEach(() => {
    input = createMockInput();
    transitions = new TransitionManager();
    scene = new OverworldScene({
      input,
      transitions,
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
    });
    scene.loadMap(createTestMap(), createTestTileset(), 5, 5);
  });

  it('initializes player at spawn position', () => {
    expect(scene.player.tileX).toBe(5);
    expect(scene.player.tileY).toBe(5);
  });

  it('sets input context on enter', () => {
    scene.enter();
    expect(input.context).toBe(InputContext.OVERWORLD);
  });

  it('moves player when directional input held', () => {
    input.getDirectionalHeld.mockReturnValue(Actions.DOWN);
    scene.update(1 / 60);
    expect(scene.player.moving).toBe(true);
    expect(scene.player.facing).toBe(Actions.DOWN);
  });

  it('does not update when transition is active', () => {
    transitions.fadeToBlack();
    transitions.update(); // now in FADE_OUT
    const prevX = scene.player.tileX;
    input.getDirectionalHeld.mockReturnValue(Actions.RIGHT);
    scene.update(1 / 60);
    expect(scene.player.tileX).toBe(prevX);
  });

  it('shows location name on map load', () => {
    expect(scene._showLocName).toBe(true);
    expect(scene._locName).toBe('Test Map');
  });

  it('location name fades out after duration', () => {
    // 20 fade-in + 120 hold + 20 fade-out = 160 frames
    for (let i = 0; i < 160; i++) {
      input.getDirectionalHeld.mockReturnValue(null);
      scene.update(1 / 60);
    }
    expect(scene._showLocName).toBe(false);
  });

  it('renders without errors', () => {
    const ctx = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      globalAlpha: 1,
    };
    expect(() => scene.render(ctx)).not.toThrow();
  });

  it('handles warp events', () => {
    const map = createTestMap();
    map.layers.event[6 * 10 + 5] = 'warp_test';
    map.events.warp_test = {
      type: 'warp',
      targetMap: 'test',
      targetX: 2,
      targetY: 2,
      transition: 'fade',
    };
    scene.loadMap(map, createTestTileset(), 5, 5);

    // Move player down to (5,6) where warp is
    input.getDirectionalHeld.mockReturnValue(Actions.DOWN);
    scene.update(1 / 60);

    // Complete the movement
    for (let i = 0; i < 20; i++) {
      input.getDirectionalHeld.mockReturnValue(null);
      scene.update(1 / 60);
    }

    // Transition should have started
    expect(transitions.active).toBe(true);
  });

  it('opens dialogue on NPC interaction', () => {
    const map = createTestMap();
    map.npcs = [
      { id: 'npc1', sprite: 's', x: 5, y: 4, facing: 'down', dialogue: 'dlg_test', movement: 'static' },
    ];
    scene.loadMap(map, createTestTileset(), 5, 5);

    // Register dialogue data for the NPC
    scene.registerDialogue('dlg_test', {
      start: { speaker: 'Villager', text: 'Hello traveler!', next: null },
    });

    // Player faces up (toward NPC at 5,4)
    scene.player.facing = Actions.UP;
    input.pressed.mockImplementation((action) => action === Actions.CONFIRM);
    input.getDirectionalPressed.mockReturnValue(null);

    scene.update(1 / 60);

    // Dialogue should be open
    expect(scene.dialogue.isOpen).toBe(true);
    expect(input.context).toBe(InputContext.DIALOGUE);
  });

  it('opens pause menu on START press', () => {
    input.pressed.mockImplementation((action) => action === Actions.START);
    scene.update(1 / 60);
    expect(scene.pauseMenu.active).toBe(true);
    expect(input.context).toBe(InputContext.MENU);
  });
});
