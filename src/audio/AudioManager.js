/**
 * Audio manager stub per specs/audio.md.
 * All methods are no-ops for MVP. Ready for post-MVP Web Audio API implementation.
 */

export class AudioManager {
  playBGM(_trackId) {}
  stopBGM() {}
  playSFX(_sfxId) {}
  setVolume(_type, _level) {}
}

export const audioManager = new AudioManager();
