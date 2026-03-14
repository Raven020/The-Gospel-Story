/**
 * Entry point: wires up Display, GameLoop, InputSystem, SceneManager, TransitionManager.
 * Loads demo map and starts the overworld.
 */

import { Display } from './engine/Display.js';
import { GameLoop } from './engine/GameLoop.js';
import { SceneManager } from './engine/SceneManager.js';
import { TransitionManager } from './engine/TransitionManager.js';
import { InputSystem } from './systems/InputSystem.js';
import { audioManager } from './audio/AudioManager.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameState } from './systems/GameState.js';
import { MAP as demoMap } from './maps/demo.js';
import { MAP as jerusalemMap } from './maps/jerusalem.js';
import { MAP as templeMap } from './maps/temple.js';
import { MAP as jordanRiverMap } from './maps/jordan_river.js';
import { MAP as wildernessMap } from './maps/wilderness.js';
import { MAP as galileeMap } from './maps/galilee.js';
import { MAP as capernaumMap } from './maps/capernaum.js';
import { MAP as mountainMap } from './maps/mountain.js';
import * as overworldTileset from './tilesets/overworld.js';
import * as interiorTileset from './tilesets/interior.js';
import * as desertTileset from './tilesets/desert.js';
import * as shorelineTileset from './tilesets/shoreline.js';
import { ARC1_DIALOGUE } from './data/dialogue/arc1.js';
import { ARC2_DIALOGUE } from './data/dialogue/arc2.js';
import { ARC3_DIALOGUE } from './data/dialogue/arc3.js';

// Sprite imports for the sprite registry
import { PALETTE as jesusPalette, JESUS_FRONT, JESUS_BACK, JESUS_LEFT } from '../specs/sprites/jesus-overworld.js';
import {
  PALETTE as disciplePalette,
  PETER, PETER_BACK, PETER_LEFT,
  ANDREW, ANDREW_BACK, ANDREW_LEFT,
  JAMES_ZEBEDEE, JAMES_ZEBEDEE_BACK, JAMES_ZEBEDEE_LEFT,
  JOHN, JOHN_BACK, JOHN_LEFT,
  PHILIP, PHILIP_BACK, PHILIP_LEFT,
  BARTHOLOMEW, BARTHOLOMEW_BACK, BARTHOLOMEW_LEFT,
  MATTHEW, MATTHEW_BACK, MATTHEW_LEFT,
} from '../specs/sprites/disciples.js';
import {
  PALETTE as johnBaptistPalette,
  JOHN_BAPTIST, JOHN_BAPTIST_BACK, JOHN_BAPTIST_LEFT,
} from '../specs/sprites/john-baptist.js';
import {
  PALETTE as townsPalette,
  TOWNSWOMAN_1, TOWNSWOMAN_1_BACK, TOWNSWOMAN_1_LEFT,
  TEMPLE_TEACHER, TEMPLE_TEACHER_BACK, TEMPLE_TEACHER_LEFT,
} from '../specs/sprites/townspeople.js';
import {
  PALETTE as youngJesusPalette,
  YOUNG_JESUS, YOUNG_JESUS_BACK, YOUNG_JESUS_LEFT,
} from '../specs/sprites/young-jesus.js';

const display = new Display();
const input = new InputSystem();
const scenes = new SceneManager();
const transitions = new TransitionManager();

input.attach(window);

// Build sprite registry: maps sprite keys to { palette, sprites: { front, back, left } }
const spriteRegistry = {
  jesus: {
    palette: jesusPalette,
    sprites: { front: JESUS_FRONT, back: JESUS_BACK, left: JESUS_LEFT },
  },
  peter: {
    palette: disciplePalette,
    sprites: { front: PETER, back: PETER_BACK, left: PETER_LEFT },
  },
  andrew: {
    palette: disciplePalette,
    sprites: { front: ANDREW, back: ANDREW_BACK, left: ANDREW_LEFT },
  },
  james: {
    palette: disciplePalette,
    sprites: { front: JAMES_ZEBEDEE, back: JAMES_ZEBEDEE_BACK, left: JAMES_ZEBEDEE_LEFT },
  },
  john: {
    palette: disciplePalette,
    sprites: { front: JOHN, back: JOHN_BACK, left: JOHN_LEFT },
  },
  philip: {
    palette: disciplePalette,
    sprites: { front: PHILIP, back: PHILIP_BACK, left: PHILIP_LEFT },
  },
  nathanael: {
    palette: disciplePalette,
    sprites: { front: BARTHOLOMEW, back: BARTHOLOMEW_BACK, left: BARTHOLOMEW_LEFT },
  },
  matthew: {
    palette: disciplePalette,
    sprites: { front: MATTHEW, back: MATTHEW_BACK, left: MATTHEW_LEFT },
  },
  npc_john_baptist: {
    palette: johnBaptistPalette,
    sprites: { front: JOHN_BAPTIST, back: JOHN_BAPTIST_BACK, left: JOHN_BAPTIST_LEFT },
  },
  townspeople_woman_a: {
    palette: townsPalette,
    sprites: { front: TOWNSWOMAN_1, back: TOWNSWOMAN_1_BACK, left: TOWNSWOMAN_1_LEFT },
  },
  townspeople_elder_a: {
    palette: townsPalette,
    sprites: { front: TEMPLE_TEACHER, back: TEMPLE_TEACHER_BACK, left: TEMPLE_TEACHER_LEFT },
  },
  young_jesus: {
    palette: youngJesusPalette,
    sprites: { front: YOUNG_JESUS, back: YOUNG_JESUS_BACK, left: YOUNG_JESUS_LEFT },
  },
};

// Title scene
const titleScene = new TitleScene({
  input,
  sceneManager: scenes,
  frameCountFn: () => loop.frameCount,
  onNewGame: () => {
    gameState.newGame();
    gameState.questFlags.arc1_started = true;
    overworld.loadMap(jerusalemMap, overworldTileset, 14, 18);
    scenes.switch('overworld');
    // Fade in from black so the scene doesn't pop in abruptly.
    // Also ensures transitions.active blocks input briefly while the
    // overworld initializes, preventing any one-frame input glitches.
    transitions.fadeIn();
  },
  onContinue: () => {
    // Load the most recent save (first occupied slot)
    for (let i = 0; i < 3; i++) {
      if (GameState.hasSave(i)) {
        gameState.load(i);
        const mapEntry = overworld.getMapEntry(gameState.currentMap);
        if (mapEntry) {
          overworld.loadMap(mapEntry.map, mapEntry.tileset, gameState.playerX, gameState.playerY);
        }
        scenes.switch('overworld');
        transitions.fadeIn();
        return;
      }
    }
  },
});
scenes.register('title', titleScene);

// Game state
const gameState = new GameState();
gameState.newGame();

// Battle scene (gameState passed for item access during combat)
const battleScene = new BattleScene({
  input,
  transitions,
  sceneManager: scenes,
  frameCountFn: () => loop.frameCount,
  gameState,
});
scenes.register('battle', battleScene);

// Overworld scene
const overworld = new OverworldScene({
  input,
  transitions,
  sceneManager: scenes,
  spriteRegistry,
  gameState,
  battleScene,
  frameCountFn: () => loop.frameCount,
});
overworld.loadMap(demoMap, overworldTileset, 9, 5);

// Register all maps with their tilesets for cross-map warps
overworld.registerMap('jerusalem', jerusalemMap, overworldTileset);
overworld.registerMap('temple', templeMap, interiorTileset);
overworld.registerMap('jordan_river', jordanRiverMap, overworldTileset);
overworld.registerMap('wilderness', wildernessMap, desertTileset);
overworld.registerMap('galilee', galileeMap, shorelineTileset);
overworld.registerMap('capernaum', capernaumMap, overworldTileset);
overworld.registerMap('mountain', mountainMap, overworldTileset);
overworld.registerMap('demo', demoMap, overworldTileset);

// Register all dialogue trees
for (const [key, data] of Object.entries(ARC1_DIALOGUE)) {
  overworld.registerDialogue(key, data);
}
for (const [key, data] of Object.entries(ARC2_DIALOGUE)) {
  overworld.registerDialogue(key, data);
}
for (const [key, data] of Object.entries(ARC3_DIALOGUE)) {
  overworld.registerDialogue(key, data);
}

scenes.register('overworld', overworld);

scenes.switch('title');

const loop = new GameLoop(
  (dt) => {
    input.update(dt);
    transitions.update();
    scenes.update(dt);
    // Increment playtime while playing (not on title screen)
    if (scenes.current && scenes.current !== titleScene) {
      gameState.playtime += dt;
    }
  },
  () => {
    display.clear();
    scenes.render(display.ctx);
    transitions.render(display.ctx);
  }
);

loop.start();

export { display, input, scenes, transitions, loop, audioManager, gameState, battleScene };
