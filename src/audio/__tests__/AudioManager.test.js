import { describe, it, expect } from 'vitest';
import { AudioManager, audioManager } from '../AudioManager.js';

describe('AudioManager', () => {
  it('exports a singleton instance', () => {
    expect(audioManager).toBeInstanceOf(AudioManager);
  });

  it('all methods are callable no-ops', () => {
    const am = new AudioManager();
    expect(() => {
      am.playBGM('overworld');
      am.stopBGM();
      am.playSFX('menu_select');
      am.setVolume('bgm', 0.5);
    }).not.toThrow();
  });
});
