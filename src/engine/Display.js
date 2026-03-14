/**
 * Display system: fixed 240x160 internal canvas, CSS-scaled with nearest-neighbor.
 * Maintains 3:2 aspect ratio with letterboxing.
 */

export const SCREEN_WIDTH = 240;
export const SCREEN_HEIGHT = 160;

export class Display {
  constructor() {
    this.width = SCREEN_WIDTH;
    this.height = SCREEN_HEIGHT;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.imageRendering = 'crisp-edges';
    this.canvas.style.display = 'block';
    this.canvas.style.margin = 'auto';
    document.body.style.backgroundColor = '#000';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    document.body.appendChild(this.canvas);
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  _onResize() {
    const scaleX = window.innerWidth / this.width;
    const scaleY = window.innerHeight / this.height;
    const scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));
    this.canvas.style.width = `${this.width * scale}px`;
    this.canvas.style.height = `${this.height * scale}px`;
  }

  clear() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
