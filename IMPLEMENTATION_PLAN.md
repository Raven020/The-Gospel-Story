# Implementation Plan — The Gospel Story JRPG

## Project State
- **Source code:** None — `src/` does not exist yet
- **Specs:** 12 documents fully authored:
  - Core: technical, MVP scope, party system, art style, story, game design, combat
  - Systems: tilemap-format, dialogue-system, ui-hud, input-system, audio
- **Sprite assets:** 10 JS modules in `specs/sprites/` with pixel data for all MVP characters (Jesus, Mary, Joseph, young Jesus, John the Baptist, Satan, Angel, Dove, 12 disciples, 5 Pharisees, townspeople) — all directions (front/back/left, right mirrored)
- **Preview:** `specs/sprites/preview.html` renders all sprites at 8x scale

---

## Spec Inconsistencies — Must Resolve

These conflicts between spec documents must be resolved before the relevant implementation phases begin.

### 1. Text Box Dimensions Conflict (Blocks Phase 3.2)
- **`specs/ui-hud.md` §2:** Box at y=118, size 240×42px, 38 chars/line (CELL_W=6 from 5×7 glyph + 1px spacing), 2 text lines per page.
- **`specs/dialogue-system.md` §4b:** Text area 208×48px inside 224×64 box, ~26 chars/line (assumes 8px cell width), 3 lines per page.
- **Recommended resolution:** `specs/ui-hud.md` is internally consistent with its own font spec (5×7 glyph, 6×8 cell) and should be treated as authoritative. `specs/dialogue-system.md` §4b was written with incorrect font size assumptions and should be updated to match ui-hud.md dimensions (240×42 box, 38 chars/line, 2 lines/page).

### 2. Dialogue Module Path Inconsistency (Blocks Phase 3.2)
- **`specs/dialogue-system.md`:** References `data/dialogue/` and `engine/dialogue/` (no `src/` prefix).
- **`specs/tilemap-format.md`:** References `src/maps/`, `src/tilesets/` (with `src/` prefix).
- **Recommended resolution:** All paths should use the `src/` prefix as defined in the IMPLEMENTATION_PLAN §1.1 folder layout. `specs/dialogue-system.md` paths should be read as `src/data/dialogue/` and `src/engine/dialogue/`.

### 3. NPC Dialogue Key Format Mismatch (Blocks Phase 2.4 / 3.2)
- **`specs/tilemap-format.md` §6:** NPC objects use a simple string key: `dialogue: 'dlg_miriam_greeting'`.
- **`specs/dialogue-system.md`:** Uses a two-part lookup: `dialogueModule` (module path) + `dialogueKey` (export key within that module).
- **Recommended resolution:** Reconcile during Phase 2.4/3.2 implementation. The NPC definition should carry `dialogueModule` (e.g., `'arc1/jerusalem'`) and `dialogueKey` (e.g., `'miriam_greeting'`). The simple string format from tilemap-format.md can be treated as a shorthand that maps to a default module for the current map.

---

## Specifications — Complete

All specifications have been authored. No blockers remain at the spec level.

- [x] `specs/technical.md` — Engine, display, platform, save system
- [x] `specs/art-style.md` — Pixel art principles, character design, palettes, sprite dimensions
- [x] `specs/game-design.md` — Genre, pillars, exploration, mini-games, progression, tone
- [x] `specs/combat.md` — Turn-based system, Scripture selection, enemy types, debate battles
- [x] `specs/party-system.md` — 12 disciples, active party, morale, Judas mechanic
- [x] `specs/mvp-scope.md` — Arcs 1-3 scope, systems to build, exclusions
- [x] `specs/story.md` — All 16 story arcs with events and gameplay hooks
- [x] `specs/tilemap-format.md` — Tile/map data structures, layers, warps, encounters, tilesets
- [x] `specs/dialogue-system.md` — Dialogue trees, node format, conditions, effects, rendering
- [x] `specs/ui-hud.md` — Bitmap font, dialogue box, menus, battle HUD, transitions
- [x] `specs/input-system.md` — Keyboard mappings, input states, contexts, buffering, key repeat
- [x] `specs/audio.md` — Deferred post-MVP; stub interface defined

---

## Implementation Priority (dependency-ordered)

### Phase 1 — Engine Foundation
> Canvas, game loop, rendering pipeline. Everything else depends on this.
> **Blocked by:** Nothing — can start immediately.

> **Status: COMPLETE** — All Phase 1 items implemented and tested (44 tests passing).

- [x] **1.1 Project scaffolding**
- [x] **1.2 Game loop**
- [x] **1.3 Canvas & display scaling**
- [x] **1.4 Sprite rendering engine**
- [x] **1.5 Input system** (per `specs/input-system.md`)
- [x] **1.6 Scene manager**

### Phase 2 — World & Movement
> Tilemap rendering, player movement, camera — the overworld.
> **Blocked by:** Phase 1; tileset art assets (can use placeholder colored rectangles initially).

> **Status: COMPLETE** — All Phase 2 items implemented and tested (91 tests total, 11 suites).

- [x] **2.1 Tilemap system** (per `specs/tilemap-format.md`)
- [x] **2.2 Camera system**
- [x] **2.3 Player movement**
- [x] **2.4 NPC placement & interaction**
- [x] **2.5 Map transitions**

### Phase 3 — Dialogue & UI
> Text rendering, dialogue trees, menus — player communication.
> **Blocked by:** Phase 1 (input, rendering), Phase 2 (NPC interaction triggers).

> **Status: COMPLETE** — Font, dialogue, menu, overworld HUD done. Battle HUD deferred to Phase 5. 140 tests total.

- [x] **3.1 Bitmap font & text rendering** (per `specs/ui-hud.md` §1)
- [x] **3.2 Dialogue box system** (per `specs/dialogue-system.md`)
- [x] **3.3 Menu system** (per `specs/ui-hud.md` §3-4)
- [x] **3.4 Overworld & Battle HUD** (per `specs/ui-hud.md` §5-6)

### Phase 4 — Game State & Data
> Party model, inventory, save/load, quest flags.
> **Blocked by:** Phase 1 (data structures needed by dialogue effects in Phase 3).
> **Note:** Can be partially built in parallel with Phase 3 since dialogue effects need quest flags and inventory.

> **Status: COMPLETE** — All Phase 4 items implemented and tested. 186 tests total.

- [x] **4.1 Party data model** (per `specs/party-system.md`)
- [x] **4.2 Inventory system**
- [x] **4.3 Quest flag system** (per `specs/dialogue-system.md` §11)
- [x] **4.4 Save/load system**

### Phase 5 — Combat Systems
> Turn-based battle engine, Scripture combat, Wisdom Q&A.
> **Blocked by:** Phases 1-4 (rendering, input, UI, party data, inventory).

> **Status: COMPLETE** — BattleEngine, BattleHUD, BattleScene, Scripture selection, enemies, and abilities all implemented.

- [x] **5.1 Battle transition**
- [x] **5.2 Turn-based combat engine**
- [x] **5.3 Battle sprites & UI**
- [x] **5.4 Scripture-selection combat**
- [x] **5.5 Wisdom Q&A mini-game**

### Phase 6 — Narrative & Events
> Cutscenes, scripted events, story progression.
> **Blocked by:** Phases 2-3 (maps, dialogue, NPC movement).

> **Status: PARTIALLY COMPLETE** — Event/cutscene system implemented. Visual effects deferred.

- [x] **6.1 Event/cutscene system**
- [ ] **6.2 Visual effects** (deferred)

### Phase 7 — Arc 1 Content: The Boy Jesus
> First playable arc — tutorial, exploration, dialogue, find-the-boy puzzle.
> **Blocked by:** Phases 2-4, 5.5, 6.1.

> **Status: COMPLETE** — Jerusalem map, Temple map, interior tileset, NPC dialogues all implemented.

- [x] **7.1 Jerusalem tilemap(s)**
- [x] **7.2 Arc 1 NPCs & dialogue**
- [x] **7.3 Arc 1 gameplay**
- [x] **7.4 Arc 1 cutscenes**

### Phase 8 — Arc 2 Content: Baptism & Temptation
> John the Baptist, baptism event, wilderness dungeon, Satan boss fights.
> **Blocked by:** Phases 5.1-5.4, 6.

> **Status: COMPLETE** — Jordan River and Wilderness maps, desert tileset, baptism/temptation dialogues, scripture challenges.

- [x] **8.1 Jordan River & wilderness tilemaps**
- [x] **8.2 Arc 2 NPCs & events**
- [x] **8.3 Satan boss encounters (×3)**

### Phase 9 — Arc 3 Content: Calling of the Disciples
> Sea of Galilee, Capernaum, disciple recruitment, party building.
> **Blocked by:** Phases 4.1, 6, 8.

> **Status: COMPLETE** — Galilee, Capernaum, Mountain maps, shoreline tileset, recruitment dialogues for 7 disciples.

- [x] **9.1 Sea of Galilee & Capernaum tilemaps**
- [x] **9.2 Disciple recruitment events**
- [x] **9.3 Party management integration**

### Phase 10 — Polish & Integration
> Testing, balancing, title screen, flow.
> **Blocked by:** Phases 7-9 (content must exist to polish).

> **Status: COMPLETE** — Title screen, save/load UI, party/item menus, map registry, cross-map warps, dialogue effects, audio stubs all implemented.

- [x] **10.1 Title screen & new game flow**
- [x] **10.2 Random encounter balancing** — Encounter rates set per zone, enemy stats balanced
- [x] **10.3 Arc-to-arc transitions** — Map warps connect all areas, map registry enables cross-map travel
- [x] **10.4 Audio stubs** — Placed at title, overworld, battle, victory, hit/heal points

---

## Missing Art Assets (needed before or during implementation)

- [x] **Tilesets** — All 4 tilesets created: overworld (5 tiles), interior (8 tiles), desert (8 tiles), shoreline (8 tiles)
- [x] **Bitmap font** — 5×7 pixel glyphs created in `src/font/fontData.js` with full A-Z, a-z, 0-9, and punctuation glyphs. Completed in Phase 3.
- [x] **Battle sprites (64×64)** — Front-facing battle sprites for Jesus, disciples, Satan, enemies. Implemented for Phase 5.
- [ ] **Walk cycle animation frames** — Only static directional sprites exist. Deferred for MVP (single-frame per direction works initially).
- [ ] **UI chrome** — Per `specs/ui-hud.md`, all UI uses `fillRect` calls with defined color tokens — no sprite assets needed for UI. Text box borders, cursor, HP bars are all procedurally drawn.

---

## Key Design Decisions — Resolved

1. **Build tooling** — Pure ES modules, no bundler. Decision made in `specs/technical.md`.
2. **Tilemap authoring** — Hand-coded JS modules. Decision made in `specs/tilemap-format.md`.
3. **Audio approach** — Deferred post-MVP; stub interface defined in `specs/audio.md`.
4. **Input mappings** — Arrow/WASD + Z/X/Enter. Defined in `specs/input-system.md`.
5. **UI rendering** — All `fillRect`-based, no sprite sheets for UI. Defined in `specs/ui-hud.md`.

## Key Design Decisions — Still Needed

All critical design decisions have been resolved. Remaining items for post-MVP:
1. **Difficulty model** — Fine-tuning Scripture choice penalties (currently: correct=150 power, wrong=60 power).
2. **Walk cycle animation** — Currently single-frame per direction; walk animation deferred.

---

## Sprite Module Consistency Notes

The 10 sprite modules in `specs/sprites/` have slightly inconsistent render function signatures:
- `jesus-overworld.js`: has `renderSpriteData(ctx, spriteData, x, y, scale)` + `renderSpriteMirrored()`
- `angel-dove.js`: `renderSprite(ctx, spriteData, palette, x, y, scale)` — takes palette as param
- `mary-joseph.js`: `renderSprite(ctx, spriteData, x, y, scale)` — takes spriteData as param
- Others: `renderSprite(ctx, x, y, scale)` — hardcoded to one sprite

**Bug (resolved — was incorrect in this plan):** `specs/sprites/townspeople.js` line 46 was noted here as having `FB: '#6878888'` (a 7-digit hex, invalid), but the file has been checked and already contains the correct value `#687888` (6-digit). The IMPLEMENTATION_PLAN was wrong about this being a current bug — no fix is needed.

**Resolution:** Phase 1.4 will create a single unified `renderSprite()` utility in `src/lib/` that all game code uses. The sprite module render functions are for preview only.

---

## Out of Scope (per `specs/mvp-scope.md`)
- Full 12-disciple roster beyond MVP 6 (Peter, Andrew, James, John, Philip, Nathanael)
- Parables side quests (Arc 7+)
- Advanced mini-games (fishing, stealth, platforming, resource management)
- Morale system (can be stubbed but not fully implemented)
- Native builds
- Arcs 4-16 content
- Audio playback (stubbed only)
- Gamepad / touch input
