# UI & HUD Specification — The Gospel Story

GBA-style JRPG. Internal resolution: 240×160. Rendering: Canvas 2D `fillRect`-based pixel art. No system fonts, no DOM UI, no build tools.

---

## 1. Bitmap Font

### Character Dimensions

- Glyph size: **5×7 pixels**
- Cell size: **6×8 pixels** (1px horizontal spacing, 1px vertical spacing)
- Monospaced; all characters occupy a full 5×7 draw area within the 6×8 cell

### Character Set

Supported: A–Z, a–z, 0–9, and punctuation: `. , ! ? ' " : ; - _ ( ) / % +`

### Font Data Format

Each glyph is stored as a flat array of 35 values (5 columns × 7 rows), row-major, MSB-first. `1` = filled pixel, `0` = empty.

```js
// src/font/fontData.js
export const GLYPHS = {
  'A': [
    0,1,1,1,0,
    1,0,0,0,1,
    1,0,0,0,1,
    1,1,1,1,1,
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
  ],
  // ... remaining glyphs
};

export const GLYPH_W = 5;
export const GLYPH_H = 7;
export const CELL_W  = 6; // includes 1px right spacing
export const CELL_H  = 8; // includes 1px bottom spacing
```

### Rendering Function

```js
// drawChar(ctx, char, x, y, color)
// Iterates GLYPHS[char], calls ctx.fillRect(x + col, y + row, 1, 1) for each set pixel.
// drawText(ctx, str, x, y, color) loops drawChar with CELL_W stride.
```

### Color Usage

| Context       | Text color  | Background         |
|---------------|-------------|--------------------|
| Dialogue box  | `#F8F8F8`   | `#181018` (semi-transparent) |
| Menu panels   | `#181018`   | `#D8C8A0` (light parchment)  |
| Disabled item | `#888888`   | same as parent     |
| Highlighted   | `#F8F8F8`   | `#4878C0` (cursor fill)      |

---

## 2. Dialogue Text Box

### Layout

```
┌──────────────────────────────────────────┐  y=118
│ JESUS                                    │  (name row, 8px tall)
│ Text line one goes here, up to ~38 chars │  (line 1, 8px tall)
│ Text line two continues here...        ▼ │  (line 2 + arrow)
└──────────────────────────────────────────┘  y=158
```

- Position: x=0, y=118; size: 240×42 px
- Background: `rgba(24, 16, 24, 0.88)` drawn as a filled rect (alpha composite)
- Border: 1px solid `#B0A090`, inset from edges
- Inner padding: 2px all sides

### Speaker Name

- Drawn at x=4, y=120 in `#FFD878` (gold)
- Separated from body text by 1px horizontal rule in `#504040`

### Text Body

- Starts at y=130 (after name + rule)
- Line height: 9px (CELL_H + 1px gap)
- Max characters per line: `floor((240 - 8) / 6)` = **38 chars**
- Word-wrap: break at word boundaries; hard-break only if a word exceeds line width

### Typewriter Reveal

- Reveal speed: **2 characters per frame** (at 60 fps ≈ ~30 chars/sec)
- State: `revealIndex` integer incremented each frame
- When `revealIndex >= totalChars`: show advance arrow, accept input
- Skip: pressing action button snaps `revealIndex` to `totalChars` instantly

### Advance Arrow

- Character: small right-pointing triangle (▼), rendered as 3×5 custom glyph
- Position: x=231, y=149 (bottom-right of box)
- Blinks at **30-frame** interval (on 30, off 30)

### Choice Display

- Replaces line 2 area; each option occupies one 8px row
- Cursor arrow (`▶`) drawn 2px left of option text
- Options: up to 4 visible; scroll if more
- Navigation: up/down moves cursor; wraps at ends

---

## 3. Pause Menu

### Layout

Full-screen overlay (240×160). Semi-transparent dark fill: `rgba(0,0,0,0.75)`.

Panel: centered box, 120×100 px, at x=60, y=30. Same border/fill style as dialogue box.

```
┌────────────────┐
│   PAUSE MENU   │   (header, gold text, centered)
├────────────────┤
│ ▶ Party        │
│   Items        │
│   Save         │
│   Load         │
│   Options      │
│   Close        │
└────────────────┘
```

- Each option row: 12px tall (CELL_H + 4px padding)
- Cursor `▶` is 4px left of text; cursor row highlights background with `#4878C0` bar
- Navigation: Up/Down moves cursor (wraps); Action selects; Cancel closes menu

### Sub-screens

Selecting Party, Items, Save, Load, or Options pushes a new screen state. Cancel/B pops back to the pause menu. The pause overlay persists beneath sub-screens.

---

## 4. Party Screen

### Layout

Full panel replacing the pause menu interior (or full-screen if entered from pause).

```
┌─────────────────────────────────────────┐
│ PARTY                          Active: 5│
├──────────┬──────────────────────────────┤
│ [sprite] │ Jesus        Lv.30           │
│          │ HP ████████░░░░░ 145/200     │
├──────────┼──────────────────────────────┤
│ [sprite] │ Peter        Lv.28           │
│          │ HP ██████░░░░░░░  98/180     │
│ ... (up to 5 active + bench rows)       │
└─────────────────────────────────────────┘
```

### Member Row

- Height: 26px per member
- Sprite: 16×16 px, drawn at row left (scaled from 8×8 source if needed)
- Name: drawn at sprite right + 4px
- Level: right-aligned in name row
- HP bar: 60px wide, 4px tall, positioned below name
- Bench members: slightly dimmer name (`#888888`), same layout

### HP Bar Colors

| HP %     | Bar color  |
|----------|------------|
| > 50%    | `#40C040`  |
| 20–50%   | `#C0C020`  |
| < 20%    | `#C02020`  |
| 0        | `#404040`  |

Background of bar track: `#303030`, 1px border `#606060`.

### Detail View

Selecting a member opens a stat panel:

```
┌─────────────────────────────┐
│ Jesus              Lv.30    │
│ HP   145/200   SP   80/100  │
│ ATK  48        DEF  42      │
│ SPD  35        LUK  60      │
│ [Swap Active/Bench]  [Back] │
└─────────────────────────────┘
```

"Swap" option is only shown if bench exists and is navigable by cursor.

---

## 5. Battle HUD

### Top Area — Enemies (y=0 to y=88)

- Enemy sprites centered horizontally, spaced evenly; max 3 enemies visible at once
- Each enemy has a name label and HP bar directly below their sprite
  - Name: 5px above HP bar, centered under sprite
  - HP bar: 40px wide, 3px tall; color rules same as party HP bars
  - HP number hidden by default; shown briefly on hit (30-frame timer)

### Bottom Area — Party Status (y=100 to y=160)

Compact strip showing all active party members side by side.

```
┌────────────────────────────────────────────────┐  y=100
│ Jesus    HP ████░  SP ████  │ Peter  HP ███░  … │
└────────────────────────────────────────────────┘  y=160
```

- Each member slot: 47px wide (240 / 5), 1px dividers
- Name: truncated to 5 chars if needed; drawn in `#F8F8F8`
- HP bar: 36px wide, 3px tall, green/yellow/red
- SP (Spirit) bar: 36px wide, 3px tall, `#4090E0` (blue); below HP bar
- Active (current turn) member slot background: `#383050` highlight

### Action Menu (y=100 to y=160, right panel, 96px wide)

Appears during the acting party member's turn. Left 144px remains party status.

```
┌────────────────┐
│ ▶ Prayer       │
│   Miracles     │
│   Truth        │
│   Scripture    │
│   Items        │
│   Defend       │
└────────────────┘
```

- Each row: 9px tall
- Cursor `▶` highlights selected row
- Sub-menus (Miracles list, Items list, etc.) slide in from the right, same panel width

### Target Selection

- Enemy targets: cursor arrow rendered above targeted enemy sprite, blinks at 20-frame interval
- Party targets (e.g. healing): highlight bar under targeted member's name in party strip
- Confirm with Action, cancel returns to action menu

### Damage Numbers

- Rendered as bitmap text at the struck entity's position
- Float upward 1px/frame over 40 frames, then fade (alpha step 1/10 per frame)
- Colors: `#F8F800` (damage), `#40F840` (heal), `#F84040` (critical), `#F8F8F8` (miss/"Blocked")

### Victory / Defeat Screens

**Victory:**
- Fade to black over 30 frames
- Panel centered: "VICTORY" in gold, XP gained, level-up notices (one per member, sequentially)
- Each level-up shows new stat increases line by line with typewriter reveal
- Advance with Action; auto-advances after 3 seconds of inactivity

**Defeat:**
- Fade to black over 60 frames (slower)
- Panel: "FALLEN" in red, flavor text line, options: "Retry from last save" / "Return to title"

---

## 6. Overworld HUD

No persistent HUD elements on the overworld map.

### Location Name Display

- Triggered on: map room/region enter event
- Render: location name string drawn in `#F8F8F8` at x=4, y=4
  - Backed by a `#181018` filled rect, padded 2px, no border
- Fade in: alpha 0→1 over 20 frames
- Hold: frames 21–140 (2 seconds at 60 fps), full opacity
- Fade out: alpha 1→0 over 20 frames
- State machine: `IDLE | FADE_IN | HOLD | FADE_OUT`
- Canvas globalAlpha is set before drawing; restored to 1.0 after

---

## 7. UI Chrome

### Window Borders

All UI panels use the same box style:

- Outer rect: 1px `#B0A090` stroke (simulated as 4 fillRect strips, 1px wide)
- Inner fill: `#181018` (dark panels) or `#D8C8A0` (light/menu panels)
- Corner pixels: filled with border color (no rounding)

### Cursor Triangle

- Shape: 3×5 custom glyph, right-pointing triangle
```
  1 0 0
  1 1 0
  1 1 1
  1 1 0
  1 0 0
```
- Color: `#F8F8F8`
- Blink: 30 frames on / 30 frames off (driven by `Math.floor(frameCount / 30) % 2`)

### HP and SP Bars

All bars follow the same structure:

1. Draw background track: `ctx.fillRect(x, y, maxW, h)` in `#303030`
2. Draw filled portion: `ctx.fillRect(x, y, filledW, h)` in bar color
3. Draw 1px border: 4 strips in `#606060`

`filledW = Math.floor((current / max) * maxW)`

### Color Palette Reference

| Token           | Hex       | Usage                          |
|-----------------|-----------|--------------------------------|
| TEXT_LIGHT      | `#F8F8F8` | Body text on dark bg           |
| TEXT_DARK       | `#181018` | Body text on light bg          |
| TEXT_GOLD       | `#FFD878` | Speaker names, headers         |
| TEXT_DIM        | `#888888` | Disabled / bench members       |
| BG_DARK         | `#181018` | Panel fills                    |
| BG_LIGHT        | `#D8C8A0` | Menu panel fills               |
| BORDER          | `#B0A090` | All window borders             |
| CURSOR_BG       | `#4878C0` | Highlighted menu row fill      |
| HP_HIGH         | `#40C040` | HP > 50%                       |
| HP_MID          | `#C0C020` | HP 20–50%                      |
| HP_LOW          | `#C02020` | HP < 20%                       |
| HP_EMPTY        | `#404040` | HP = 0                         |
| SP_BAR          | `#4090E0` | Spirit bar                     |
| BAR_TRACK       | `#303030` | Bar background                 |
| BAR_BORDER      | `#606060` | Bar border                     |
| DMG_NORMAL      | `#F8F800` | Damage number                  |
| DMG_HEAL        | `#40F840` | Heal number                    |
| DMG_CRIT        | `#F84040` | Critical hit number            |

---

## 8. Screen Transitions

### Fade to Black

Used for: map transitions, battle start, battle end, game over, title screen changes.

- Render a full-screen `fillRect(0, 0, 240, 160)` in `#000000`
- `globalAlpha` steps from 0 → 1 over **30 frames** (fade out) or 1 → 0 over **30 frames** (fade in)
- Step size: `1 / 30` per frame
- During fade-out (alpha rising): game scene draws first, overlay draws on top
- During fade-in (alpha falling): new scene draws first, overlay draws on top
- Scene swap occurs at the midpoint (alpha = 1.0, full black)

### Flash White

Used for: random encounter trigger, miracle activation (optional).

- Render full-screen `fillRect(0, 0, 240, 160)` in `#FFFFFF`
- Duration: **8 frames** total
  - Frames 1–4: alpha 0 → 1 (steps of 0.25)
  - Frames 5–8: alpha 1 → 0 (steps of 0.25)
- Layered above the game scene each frame

### Transition State Machine

```
IDLE → FADE_OUT (trigger) → BLACK (scene swap) → FADE_IN → IDLE
IDLE → FLASH (encounter) → IDLE
```

All transition state and alpha values are managed in a single `TransitionManager` module. The main render loop checks transition state before/after drawing the scene.

---

## Implementation Notes

- All pixel coordinates are in **CSS pixels at 1:1 scale**; the canvas is scaled up via CSS `image-rendering: pixelated` and `transform: scale(N)` or canvas width/height attributes set to a multiple of 240×160.
- No `strokeRect`, `arc`, or path operations. Every shape is composed of `fillRect` calls.
- `globalAlpha` must be restored to `1.0` after any semi-transparent draw to avoid bleeding into subsequent draws.
- UI modules import `GLYPHS`, `CELL_W`, `CELL_H` from `src/font/fontData.js`; they do not bundle font data inline.
- All frame counters are driven by the main game loop's `frameCount` integer (incremented each `requestAnimationFrame` tick).
