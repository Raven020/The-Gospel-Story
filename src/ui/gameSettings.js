/**
 * Global game settings singleton.
 * Read by DialogueBox (textSpeed), AudioManager (bgm/sfxEnabled).
 * Written by OptionsMenu.
 */

export const gameSettings = {
  /** Characters per frame for dialogue typewriter (1=slow, 2=normal, 4=fast) */
  textSpeed: 2,
  /** Whether background music is enabled */
  bgmEnabled: true,
  /** Whether sound effects are enabled */
  sfxEnabled: true,
};
