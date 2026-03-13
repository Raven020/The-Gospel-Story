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
};

// Title scene
const titleScene = new TitleScene({
  input,
  sceneManager: scenes,
  frameCountFn: () => loop.frameCount,
  onNewGame: () => {
    gameState.newGame();
    overworld.loadMap(jerusalemMap, overworldTileset, 14, 18);
    scenes.switch('overworld');
  },
  onContinue: () => {
    // Load the most recent save (first occupied slot)
    for (let i = 0; i < 3; i++) {
      if (GameState.hasSave(i)) {
        gameState.load(i);
        const mapEntry = overworld._mapRegistry[gameState.currentMap];
        if (mapEntry) {
          overworld.loadMap(mapEntry.map, mapEntry.tileset, gameState.playerX, gameState.playerY);
        }
        scenes.switch('overworld');
        return;
      }
    }
  },
});
scenes.register('title', titleScene);

// Game state
const gameState = new GameState();
gameState.newGame();

// Battle scene
const battleScene = new BattleScene({
  input,
  transitions,
  sceneManager: scenes,
  frameCountFn: () => loop.frameCount,
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
  },
  () => {
    display.clear();
    scenes.render(display.ctx);
    transitions.render(display.ctx);
  }
);

loop.start();

export { display, input, scenes, transitions, loop, audioManager, gameState, battleScene };
