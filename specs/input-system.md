# Input System Specification — The Gospel Story

## 1. Keyboard Mappings

| GBA Button | Primary Key | Alternate Key | Purpose |
|------------|-------------|---------------|---------|
| D-pad Up | Arrow Up | W | Movement / menu navigate up |
| D-pad Down | Arrow Down | S | Movement / menu navigate down |
| D-pad Left | Arrow Left | A | Movement / menu navigate left |
| D-pad Right | Arrow Right | D | Movement / menu navigate right |
| A (confirm) | Z | — | Confirm, interact, advance dialogue |
| B (cancel) | X | — | Cancel, back, close menu |
| Start | Enter | — | Open/close pause menu |
| Select | Shift | — | Reserved (unused in MVP) |

WASD movement is optional and mirrors arrow keys exactly. No remapping in MVP.

---

## 2. Input States

Each mapped key tracks three boolean states, updated once per frame:

- **`pressed`** — `true` only on the single frame the key transitions down.
- **`held`** — `true` every frame the key remains down (includes the first frame).
- **`released`** — `true` only on the single frame the key transitions up.

All three states are derived from `keydown` / `keyup` events and resolved at the start of each game loop tick. Between ticks, raw event flags are accumulated; the frame update converts them to `pressed` / `held` / `released` and clears the raw flags.

---

## 3. Input Contexts

The active context determines which states are consumed and how.

### Overworld
| Action | Keys | State used |
|--------|------|------------|
| Move character | D-pad / WASD | `held` |
| Interact / examine | A (Z) | `pressed` |
| Open pause menu | Start (Enter) | `pressed` |

### Dialogue
| Action | Keys | State used |
|--------|------|------------|
| Advance text / close | A (Z) or B (X) | `pressed` |
| Select choice | A (Z) | `pressed` |
| Fast-forward text | A (Z) held | `held` |

### Menu
| Action | Keys | State used |
|--------|------|------------|
| Navigate | D-pad / WASD | `pressed` + key-repeat (see §5) |
| Select item | A (Z) | `pressed` |
| Go back / close | B (X) | `pressed` |

### Battle
| Action | Keys | State used |
|--------|------|------------|
| Navigate action grid | D-pad | `pressed` |
| Confirm action | A (Z) | `pressed` |
| Cancel / back | B (X) | `pressed` |

---

## 4. Input Buffering

- The last `pressed` input is stored in a buffer with a timestamp.
- The buffer is valid for **100 ms**.
- On each frame, if the current context can consume the buffered input, it does so and clears the buffer.
- This prevents missed inputs that occur when a key is pressed during a context transition (e.g., a scene change mid-press).
- `held` and `released` states are never buffered — only `pressed`.

---

## 5. Key Repeat for Menus

Directional keys in the **Menu** context fire a synthetic `pressed` event on a timer while held, enabling cursor scroll-through.

- **Initial delay:** 300 ms after the key first goes down.
- **Repeat rate:** one synthetic press every 100 ms thereafter.
- Key repeat applies only to directional inputs (D-pad / WASD) and only in the Menu context.
- Releasing the key resets both timers immediately.

---

## 6. Implementation Notes

- Attach `keydown` and `keyup` listeners to `window` at startup; never remove them during gameplay.
- Call `event.preventDefault()` for all mapped keys to suppress browser defaults (arrow-key scrolling, space-bar activation, etc.).
- Unmapped keys are ignored and not prevented.
- The input module exposes a single `update()` function called once at the top of each game loop frame. All other systems query the input module after `update()` runs.
- Input state is reset to all-false at the start of each `update()` call before applying accumulated events.
- Gamepad / touch support is out of scope for MVP and should be added as a separate input layer without modifying the keyboard module.

---

## 7. Known Bugs

- **Player cannot move after New Game.** After selecting "New Game" from the title screen, the overworld loads (Jerusalem map, spawn at 14,18) but arrow keys and WASD have no effect. The player character is visible but unresponsive to input. Root cause is not yet confirmed — suspected issues include: input context not properly transitioning from MENU to OVERWORLD, the transition manager being stuck in an active state, or the canvas/window not receiving keyboard events. Needs debugging with browser dev console to isolate.
