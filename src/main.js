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

// Title scene (placeholder until Phase 10)
scenes.register('title', {
  enter() {},
  update(_dt) {
    if (input.pressed('confirm') || input.pressed('start')) {
      scenes.switch('overworld');
    }
  },
  render(ctx) {
    ctx.fillStyle = '#181018';
    ctx.fillRect(0, 0, 240, 160);
    ctx.fillStyle = '#FFD878';
    ctx.fillRect(60, 60, 120, 2);
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(90, 72, 60, 8);
    ctx.fillStyle = '#FFD878';
    ctx.fillRect(60, 90, 120, 2);
  },
});

// Overworld scene
const overworld = new OverworldScene({
  input,
  transitions,
  sceneManager: scenes,
  spriteRegistry,
});
overworld.loadMap(demoMap, overworldTileset, 9, 5);
scenes.register('overworld', overworld);

scenes.switch('overworld');

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

export { display, input, scenes, transitions, loop, audioManager };
