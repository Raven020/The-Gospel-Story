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
import * as overworldTileset from './tilesets/overworld.js';

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
    overworld.loadMap(demoMap, overworldTileset, 9, 5);
    scenes.switch('overworld');
  },
  onContinue: () => {
    // Load the most recent save (first occupied slot)
    for (let i = 0; i < 3; i++) {
      if (GameState.hasSave(i)) {
        gameState.load(i);
        overworld.loadMap(demoMap, overworldTileset, gameState.playerX, gameState.playerY);
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
