import { describe, it, expect } from 'vitest';
import { Camera } from '../Camera.js';

describe('Camera', () => {
  it('starts at 0,0', () => {
    const cam = new Camera();
    expect(cam.x).toBe(0);
    expect(cam.y).toBe(0);
  });

  it('centers on target per spec formula', () => {
    const cam = new Camera();
    // Player at pixel 200,150 on a 30x20 map
    cam.follow(200, 150, 30, 20);
    // cameraX = clamp(200 - 112, 0, 30*16 - 240) = clamp(88, 0, 240) = 88
    // cameraY = clamp(150 - 72, 0, 20*16 - 160) = clamp(78, 0, 160) = 78
    expect(cam.x).toBe(88);
    expect(cam.y).toBe(78);
  });

  it('clamps to left/top edge', () => {
    const cam = new Camera();
    cam.follow(0, 0, 30, 20);
    expect(cam.x).toBe(0);
    expect(cam.y).toBe(0);
  });

  it('clamps to right/bottom edge', () => {
    const cam = new Camera();
    // Player at bottom-right of 30x20 map
    cam.follow(29 * 16, 19 * 16, 30, 20);
    // cameraX = clamp(464 - 112, 0, 240) = clamp(352, 0, 240) = 240
    // cameraY = clamp(304 - 72, 0, 160) = clamp(232, 0, 160) = 160
    expect(cam.x).toBe(240);
    expect(cam.y).toBe(160);
  });

  it('handles map smaller than screen', () => {
    const cam = new Camera();
    // 10x8 map = 160x128 pixels (smaller than 240x160 screen)
    cam.follow(80, 64, 10, 8);
    expect(cam.x).toBe(0);
    expect(cam.y).toBe(0);
  });
});
