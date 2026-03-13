# Audio Specification

**Status: Deferred post-MVP.** All audio is stubbed as no-ops for now.

---

## MVP Approach

Audio is explicitly out of scope for the MVP. No sound assets will be loaded or played. All audio calls go through a single `AudioManager` object whose methods are no-ops, so game code can call them freely without conditional guards and the stubs can be swapped for real implementations later without touching call sites.

---

## AudioManager Interface

```js
// src/audio/AudioManager.js
export const AudioManager = {
  playBGM(trackId) {},      // Start looping background music track
  stopBGM() {},             // Stop current BGM immediately
  playSFX(sfxId) {},        // Play a one-shot sound effect
  setVolume(type, level) {}, // type: 'bgm' | 'sfx', level: 0–1
};
```

All methods return `undefined`. Callers should never depend on a return value.

---

## Track IDs (BGM)

| ID            | Context                        |
|---------------|--------------------------------|
| `overworld`   | World map exploration          |
| `battle`      | Standard random encounter      |
| `boss`        | Boss fight                     |
| `town`        | Town / village                 |
| `temple`      | Temple / sacred location       |
| `wilderness`  | Dungeon / wilderness area      |
| `victory`     | Post-battle victory fanfare    |
| `defeat`      | Game over / party wipe         |
| `menu`        | Title screen and main menu     |

---

## SFX IDs

| ID            | Trigger                        |
|---------------|--------------------------------|
| `menu_select` | Confirm a menu option          |
| `menu_cancel` | Back / cancel                  |
| `text_advance`| Advance dialogue text box      |
| `damage`      | Character or enemy takes damage|
| `heal`        | HP restored                    |
| `level_up`    | Level-up event                 |
| `encounter`   | Random battle triggered        |
| `door`        | Open a door or chest           |
| `footstep`    | Player movement step           |

---

## Post-MVP Implementation Plan

- **API**: Web Audio API (`AudioContext`).
- **Formats**: OGG (primary) with MP4/AAC fallback for Safari.
- **Asset loading**: Fetch and decode into `AudioBuffer` on first use; cache buffers in a `Map`.
- **BGM looping**: Use a `AudioBufferSourceNode` with `loop = true`.
- **User interaction gate**: `AudioContext` must be created or resumed inside a user gesture handler (click/keypress) per browser autoplay policy. Queue any `playBGM` call made before context is ready and flush it on first interaction.
- **Volume**: Separate `GainNode` chains for BGM and SFX routed into `AudioContext.destination`.
- **File location**: `src/audio/AudioManager.js` (replace stub in place).

---

## Stub Implementation (current)

```js
// src/audio/AudioManager.js
export const AudioManager = {
  playBGM(trackId) {},
  stopBGM() {},
  playSFX(sfxId) {},
  setVolume(type, level) {},
};
```

Place this file now so all other modules can import it without change when real audio is added.
