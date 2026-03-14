import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../Display.js';

describe('Display constants', () => {
  it('exports GBA resolution 240x160', () => {
    expect(SCREEN_WIDTH).toBe(240);
    expect(SCREEN_HEIGHT).toBe(160);
  });
});

describe('Display', () => {
  let mockCtx;
  let mockCanvas;

  beforeEach(() => {
    mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      imageSmoothingEnabled: true,
    };
    mockCanvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
      getContext: vi.fn(() => mockCtx),
    };
    globalThis.document = {
      createElement: vi.fn(() => mockCanvas),
      body: { appendChild: vi.fn(), style: {} },
    };
    globalThis.window = {
      innerWidth: 960,
      innerHeight: 640,
      addEventListener: vi.fn(),
    };
  });

  async function createDisplay() {
    // Dynamic import to pick up mocked globals
    const mod = await import('../Display.js');
    return new mod.Display();
  }

  it('creates canvas at 240x160 with smoothing disabled', async () => {
    const display = await createDisplay();
    expect(mockCanvas.width).toBe(240);
    expect(mockCanvas.height).toBe(160);
    expect(mockCtx.imageSmoothingEnabled).toBe(false);
  });

  it('appends canvas to document body', async () => {
    const display = await createDisplay();
    expect(document.body.appendChild).toHaveBeenCalledWith(mockCanvas);
  });

  it('registers resize listener', async () => {
    const display = await createDisplay();
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('_onResize scales to fit window with integer factor', async () => {
    const display = await createDisplay();
    // window is 960x640: scaleX = 4, scaleY = 4, scale = floor(min(4,4)) = 4
    display._onResize();
    expect(mockCanvas.style.width).toBe('960px');
    expect(mockCanvas.style.height).toBe('640px');
  });

  it('_onResize uses minimum of x/y scales', async () => {
    window.innerWidth = 720;
    window.innerHeight = 640;
    const display = await createDisplay();
    // scaleX = 3, scaleY = 4, scale = floor(min(3,4)) = 3
    display._onResize();
    expect(mockCanvas.style.width).toBe('720px');
    expect(mockCanvas.style.height).toBe('480px');
  });

  it('_onResize enforces minimum scale of 1', async () => {
    window.innerWidth = 100;
    window.innerHeight = 80;
    const display = await createDisplay();
    // scaleX = 0.41, scaleY = 0.5, scale = max(1, floor(min(...))) = 1
    display._onResize();
    expect(mockCanvas.style.width).toBe('240px');
    expect(mockCanvas.style.height).toBe('160px');
  });

  it('clear fills canvas with black', async () => {
    const display = await createDisplay();
    display.clear();
    expect(mockCtx.fillStyle).toBe('#000');
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 240, 160);
  });
});
