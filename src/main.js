/**
 * Entry point: wires up Display, GameLoop, InputSystem, SceneManager, TransitionManager.
 */

import { Display } from './engine/Display.js';
import { GameLoop } from './engine/GameLoop.js';
import { SceneManager } from './engine/SceneManager.js';
import { TransitionManager } from './engine/TransitionManager.js';
import { InputSystem, InputContext } from './systems/InputSystem.js';
import { audioManager } from './audio/AudioManager.js';

const display = new Display();
const input = new InputSystem();
const scenes = new SceneManager();
const transitions = new TransitionManager();

input.attach(window);

// Placeholder title scene until real scenes are built
scenes.register('title', {
  enter() {},
  update(_dt) {},
  render(ctx) {
    ctx.fillStyle = '#181018';
    ctx.fillRect(0, 0, 240, 160);
    ctx.fillStyle = '#FFD878';
    ctx.fillRect(60, 60, 120, 2);
    ctx.fillStyle = '#F8F8F8';
    // Minimal text placeholder — real bitmap font comes in Phase 3
    ctx.fillRect(90, 72, 60, 8);
    ctx.fillStyle = '#FFD878';
    ctx.fillRect(60, 90, 120, 2);
  },
});

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

// Export for debugging and testing
export { display, input, scenes, transitions, loop, audioManager };
