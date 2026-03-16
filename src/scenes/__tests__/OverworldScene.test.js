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

  // --- P3.6: Unregistered NPC dialogue fallback ---
  it('opens fallback dialogue for NPC without registered dialogue', () => {
    const map = createTestMap();
    map.npcs = [
      { id: 'mystery', sprite: 's', x: 5, y: 4, facing: 'down', dialogue: 'nonexistent_key', movement: 'static' },
    ];
    scene.loadMap(map, createTestTileset(), 5, 5);
    // Don't register any dialogue for this key

    scene.player.facing = 'up';
    input.pressed.mockImplementation((a) => a === 'confirm');
    input.getDirectionalPressed.mockReturnValue(null);

    scene.update(1 / 60);

    // Fallback dialogue should open with '...'
    expect(scene.dialogue.isOpen).toBe(true);
    expect(input.context).toBe(InputContext.DIALOGUE);
  });

  // --- P3.6: Dialogue effects ---
  it('handleDialogueEffect sets quest flag', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });

    scn._handleDialogueEffect({ type: 'setFlag', flag: 'met_peter', value: true });
    expect(gameState.questFlags.met_peter).toBe(true);
  });

  it('handleDialogueEffect recruits member', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });

    scn._handleDialogueEffect({ type: 'recruitMember', memberId: 'peter' });
    expect(gameState.recruitMember).toHaveBeenCalledWith('peter');
  });

  it('handleDialogueEffect gives item', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });

    scn._handleDialogueEffect({ type: 'giveItem', itemId: 'bread', count: 3 });
    expect(gameState.inventory.add).toHaveBeenCalledWith('bread', 3);
  });

  it('handleDialogueEffect removes item', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });

    scn._handleDialogueEffect({ type: 'removeItem', itemId: 'bread', count: 1 });
    expect(gameState.inventory.remove).toHaveBeenCalledWith('bread', 1);
  });

  it('handleDialogueEffect is no-op without gameState', () => {
    // scene from beforeEach has no gameState
    expect(() => scene._handleDialogueEffect({ type: 'setFlag', flag: 'test', value: true })).not.toThrow();
  });

  // --- P3.6: Cutscene handling ---
  it('handles cutscene event with inline commands', () => {
    scene.loadMap(createTestMap(), createTestTileset(), 5, 5);

    // Directly invoke _handleEvent to test cutscene logic
    scene._handleEvent({
      type: 'cutscene',
      commands: [{ type: 'wait', frames: 5 }],
    });

    expect(scene.eventSystem.isActive()).toBe(true);
  });

  it('handles cutscene event with named script', () => {
    scene.loadMap(createTestMap(), createTestTileset(), 5, 5);
    scene.registerCutscene('test_script', [{ type: 'wait', frames: 5 }]);

    scene._handleEvent({
      type: 'cutscene',
      script: 'test_script',
    });

    expect(scene.eventSystem.isActive()).toBe(true);
  });

  it('skips cutscene if guard flag is already set', () => {
    const gameState = {
      questFlags: { cs_done: true },
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input,
      transitions,
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });
    scn.loadMap(createTestMap(), createTestTileset(), 5, 5);

    // Directly invoke _handleEvent with a guarded cutscene
    scn._handleEvent({
      type: 'cutscene',
      flag: 'cs_done',
      commands: [{ type: 'wait', frames: 5 }],
    });

    // Cutscene should NOT be active (guard flag blocks it)
    expect(scn.eventSystem.isActive()).toBe(false);
  });

  // --- P3.6: Encounter triggering ---
  it('triggers encounter via _triggerEncounter', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn(), getAll: () => [] },
      recruitMember: vi.fn(),
      party: { active: [{ id: 'jesus', name: 'Jesus', level: 1, stats: { hp: 200, sp: 50, str: 30, wis: 25, fai: 20, spd: 30 }, currentHp: 200, currentSp: 50, abilities: [] }], bench: [] },
    };
    const battleScene = {
      startBattle: vi.fn(),
    };
    const mockSceneManager = { switch: vi.fn() };
    const scn = new OverworldScene({
      input,
      transitions,
      sceneManager: mockSceneManager,
      spriteRegistry: {},
      gameState,
      battleScene,
    });
    scn.loadMap(createTestMap(), createTestTileset(), 5, 5);

    // Directly trigger an encounter
    scn._triggerEncounter('doubt');

    expect(scn._inBattle).toBe(true);
  });

  // --- Dialogue effect: playSound ---
  it('handleDialogueEffect playSound calls audioManager.playSFX', async () => {
    const { audioManager } = await import('../../audio/AudioManager.js');
    const spy = vi.spyOn(audioManager, 'playSFX');
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });

    scn._handleDialogueEffect({ type: 'playSound', sfxId: 'menu_select' });
    expect(spy).toHaveBeenCalledWith('menu_select');
    spy.mockRestore();
  });

  // --- Dialogue effect: playMusic ---
  it('handleDialogueEffect playMusic calls audioManager.playBGM', async () => {
    const { audioManager } = await import('../../audio/AudioManager.js');
    const spy = vi.spyOn(audioManager, 'playBGM');
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });

    scn._handleDialogueEffect({ type: 'playMusic', trackId: 'battle' });
    expect(spy).toHaveBeenCalledWith('battle');
    spy.mockRestore();
  });

  // --- Dialogue effect: setNpcState updates dialogue ---
  it('handleDialogueEffect setNpcState updates NPC dialogue key', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });
    const map = createTestMap();
    map.npcs = [{ id: 'npc1', sprite: 's', x: 3, y: 3, facing: 'down', dialogue: 'old_key', movement: 'static' }];
    scn.loadMap(map, createTestTileset(), 5, 5);

    scn._handleDialogueEffect({ type: 'setNpcState', npcId: 'npc1', dialogue: 'new_key' });
    expect(scn.npcManager.npcs[0].dialogue).toBe('new_key');
  });

  // --- Dialogue effect: setNpcState removes NPC ---
  it('handleDialogueEffect setNpcState visible:false removes NPC', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });
    const map = createTestMap();
    map.npcs = [{ id: 'npc1', sprite: 's', x: 3, y: 3, facing: 'down', dialogue: 'key', movement: 'static' }];
    scn.loadMap(map, createTestTileset(), 5, 5);
    expect(scn.npcManager.npcs.length).toBe(1);

    scn._handleDialogueEffect({ type: 'setNpcState', npcId: 'npc1', visible: false });
    expect(scn.npcManager.npcs.length).toBe(0);
  });

  // --- Dialogue effect: triggerEvent starts cutscene ---
  it('handleDialogueEffect triggerEvent starts registered cutscene', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });
    scn.loadMap(createTestMap(), createTestTileset(), 5, 5);
    scn.registerCutscene('my_event', [{ type: 'wait', frames: 10 }]);

    scn._handleDialogueEffect({ type: 'triggerEvent', eventId: 'my_event' });
    expect(scn.eventSystem.isActive()).toBe(true);
  });

  // --- Arc-transition cutscene ---
  it('_handleCutsceneSetFlag calls advanceArc for arc completion flags', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      advanceArc: vi.fn(),
      transitionToArc2: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });

    scn._handleCutsceneSetFlag('arc1_complete', true);

    expect(gameState.advanceArc).toHaveBeenCalledWith(2);
    expect(gameState.transitionToArc2).toHaveBeenCalledTimes(1);
  });

  it('_pendingArcCutscene is set when arc1_complete is triggered via dialogue effect', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      advanceArc: vi.fn(),
      transitionToArc2: vi.fn(),
      party: { active: [], bench: [] },
    };
    const scn = new OverworldScene({
      input: createMockInput(),
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });
    scn.loadMap(createTestMap(), createTestTileset(), 5, 5);

    expect(scn._pendingArcCutscene).toBeNull();
    scn._handleDialogueEffect({ type: 'setFlag', flag: 'arc1_complete', value: true });

    expect(scn._pendingArcCutscene).toBe('arc1_transition');
  });

  it('pending arc cutscene fires after dialogue closes', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      advanceArc: vi.fn(),
      transitionToArc2: vi.fn(),
      party: { active: [], bench: [] },
    };
    const mockInput = createMockInput();
    const scn = new OverworldScene({
      input: mockInput,
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });
    scn.loadMap(createTestMap(), createTestTileset(), 5, 5);

    // Register the arc1_transition cutscene
    scn.registerCutscene('arc1_transition', [{ type: 'wait', frames: 5 }]);

    // Open dialogue and set the pending arc cutscene
    scn.dialogue.open({ start: { speaker: 'Test', text: 'Hello', next: null } });
    scn._pendingArcCutscene = 'arc1_transition';

    expect(scn.eventSystem.isActive()).toBe(false);

    // Simulate pressing confirm to close dialogue, then update so the scene
    // detects dialogue has closed and fires the pending cutscene.
    // First confirm skips typewriter to full text; second closes the dialogue.
    mockInput.pressed.mockImplementation((action) => action === Actions.CONFIRM);
    scn.update(1 / 60);
    scn.update(1 / 60);

    expect(scn._pendingArcCutscene).toBeNull();
    expect(scn.eventSystem.isActive()).toBe(true);
  });

  // --- P5.9: Held confirm fast-forwards dialogue ---
  it('held confirm auto-advances dialogue each frame', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn() },
      recruitMember: vi.fn(),
      party: { active: [], bench: [] },
    };
    const mockInput = createMockInput();
    const scn = new OverworldScene({
      input: mockInput,
      transitions: new TransitionManager(),
      sceneManager: { switch: vi.fn() },
      spriteRegistry: {},
      gameState,
    });
    scn.loadMap(createTestMap(), createTestTileset(), 5, 5);

    scn.dialogue.open({ start: { speaker: 'Test', text: 'Hi', next: null } });
    expect(scn.dialogue.isOpen).toBe(true);

    // Simulate held confirm (not pressed, but held)
    mockInput.pressed.mockReturnValue(false);
    mockInput.held.mockImplementation((action) => action === Actions.CONFIRM);

    // First held frame: skips typewriter to full text
    scn.update(1 / 60);
    // Second held frame: advances past completed text, closing dialogue
    scn.update(1 / 60);
    expect(scn.dialogue.isOpen).toBe(false);
  });

  // --- P3.6: Defeat path ---
  it('defeat transitions to title screen', () => {
    const gameState = {
      questFlags: {},
      inventory: { add: vi.fn(), remove: vi.fn(), getAll: () => [] },
      recruitMember: vi.fn(),
      party: { active: [{ id: 'jesus', name: 'Jesus', level: 1, stats: { hp: 200, sp: 50, str: 30, wis: 25, fai: 20, spd: 30, def: 15 }, currentHp: 200, currentSp: 50, abilities: [] }], bench: [] },
    };
    const battleStartBattle = vi.fn();
    const battleScene = { startBattle: battleStartBattle };
    const mockSceneManager = { switch: vi.fn() };
    const scn = new OverworldScene({
      input,
      transitions,
      sceneManager: mockSceneManager,
      spriteRegistry: {},
      gameState,
      battleScene,
    });

    // Simulate calling _startBattle directly and intercepting the onComplete callback
    scn._startBattle('doubt');

    // battleScene.startBattle should have been called
    expect(battleStartBattle).toHaveBeenCalled();

    // Get the onComplete callback
    const onComplete = battleStartBattle.mock.calls[0][2];

    // Simulate defeat
    onComplete('defeat', 0);

    // Should have triggered a fadeToBlack transition
    expect(transitions.active).toBe(true);

    // Complete the transition
    for (let i = 0; i < 60; i++) {
      transitions.update();
    }

    // Should switch to title screen
    expect(mockSceneManager.switch).toHaveBeenCalledWith('title');
  });
});
