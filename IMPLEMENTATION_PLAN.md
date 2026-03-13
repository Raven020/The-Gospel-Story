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
> **Art blocker:** 64×64 battle sprites needed. Can prototype with scaled-up overworld sprites.

- [ ] **5.1 Battle transition**
  - Random encounter trigger: check encounter zones on player tile step (per `specs/tilemap-format.md` §8)
  - White flash transition (8 frames per `specs/ui-hud.md` §8)
  - Battle scene setup: load enemy group, initialize turn order

- [ ] **5.2 Turn-based combat engine**
  - Active party (Jesus + 4) vs enemy group (1-3 enemies)
  - Turn order based on Speed stat
  - Action menu: Prayer, Miracles, Truth, Scripture, Items, Defend
  - Damage calculation, HP/SP tracking, defeat/victory conditions
  - Experience/stat growth on victory
  - Enemy AI: simple pattern-based (attack, special, random target)
  - **Design needed:** Stat formulas — damage calc, HP scaling, level-up curves

- [ ] **5.3 Battle sprites & UI**
  - **Art needed:** 64×64 front-facing battle sprites for all MVP characters and enemies
  - Enemy sprite display (top area), party status (bottom strip)
  - Action selection menus, target selection cursor
  - Attack animations: simple flash/shake effects via screen shake + white overlay
  - Damage number floaters (rise + fade)
  - Victory screen: XP gained, level-up notices; Defeat screen: retry/title options

- [ ] **5.4 Scripture-selection combat**
  - Present 3-4 Scripture verse options in dialogue-style choice menu
  - Correct verse counters the enemy's challenge: bonus damage + morale boost
  - Wrong choice: stat/morale penalty (not failure — combat continues)
  - Used for Satan boss fights (Arc 2 ×3 temptations) and Pharisee debates
  - **Design needed:** Specific verse options and correct answers for each encounter

- [ ] **5.5 Wisdom Q&A mini-game**
  - Dialogue-battle format for Temple teachers (Arc 1)
  - Multiple-choice questions with Scripture-based answers
  - Witnessed event: player watches young Jesus answer, doesn't control him
  - Uses dialogue system for presentation; outcome is scripted (Jesus always succeeds)

### Phase 6 — Narrative & Events
> Cutscenes, scripted events, story progression.
> **Blocked by:** Phases 2-3 (maps, dialogue, NPC movement).

- [ ] **6.1 Event/cutscene system**
  - Scripted sequences: move NPCs along paths, show dialogue, change maps, play effects
  - Event triggers: step-on tile (event layer), interact with NPC, quest flag threshold
  - Camera control during cutscenes: pan to target, hold, return
  - Screen effects: fade, flash, shake (reuse TransitionManager)
  - Cutscenes use `DialogueSystem.open()` with `startNodeId` for mid-tree entry

- [ ] **6.2 Visual effects**
  - Baptism transformation glow (Arc 2): white radial glow around Jesus, palette brightening
  - Heaven-opens effect: dove sprite descending, vertical light beam (white translucent rect)
  - Wilderness atmosphere: palette shift to desaturated/warm tones, sand particle overlay

### Phase 7 — Arc 1 Content: The Boy Jesus
> First playable arc — tutorial, exploration, dialogue, find-the-boy puzzle.
> **Blocked by:** Phases 2-4, 5.5, 6.1.

- [ ] **7.1 Jerusalem tilemap(s)**
  - Town map: Jerusalem streets, market, residential (~30×25 tiles)
  - Temple of Jerusalem interior (~20×15 tiles)
  - Route: road from Jerusalem (departure/return path, ~40×10 tiles)
  - **Art needed:** Interior tileset for Temple (marble, pillars, scrolls)

- [ ] **7.2 Arc 1 NPCs & dialogue**
  - Mary and Joseph as player characters (controlled by player, not Jesus)
  - Townspeople NPCs with branching dialogue (Miriam example in `specs/dialogue-system.md`)
  - Temple teachers with breadcrumb dialogue ("a boy with wondrous knowledge")
  - Temple guard NPC (unlocks conditional dialogue branches)
  - Young Jesus NPC in the Temple inner court

- [ ] **7.3 Arc 1 gameplay**
  - "Find the boy" puzzle: explore Jerusalem, talk to NPCs, gather clues pointing to Temple
  - Quest flags drive progression: heard_about_temple_boy → talked_to_temple_guard → found_jesus_in_temple
  - No full combat in Arc 1 (tutorial arc)
  - Temple wisdom Q&A witnessed scene (Phase 5.5)
  - Mary/Jesus confrontation dialogue ("Son, why have you treated us so?")

- [ ] **7.4 Arc 1 cutscenes**
  - Opening: family traveling to Jerusalem for Passover (NPC movement + dialogue)
  - Discovery that Jesus is missing (Mary/Joseph panic, quest begins)
  - Finding Jesus in the Temple (cutscene with camera pan to young Jesus among teachers)
  - Closing: Jesus growing up in Nazareth (time-skip montage, transition to adult Jesus sprite)

### Phase 8 — Arc 2 Content: Baptism & Temptation
> John the Baptist, baptism event, wilderness dungeon, Satan boss fights.
> **Blocked by:** Phases 5.1-5.4, 6.

- [ ] **8.1 Jordan River & wilderness tilemaps**
  - Jordan River area: outdoor, river bank, John's preaching spot (~30×20 tiles)
  - Judean Wilderness dungeon: multi-room, encounter zones (~3 connected maps, ~25×20 each)
  - **Art needed:** Desert/wilderness tileset (sand, rock, dunes, sparse vegetation)

- [ ] **8.2 Arc 2 NPCs & events**
  - John the Baptist as NPC guide (dialogue, baptism trigger)
  - Baptism visual event: transformation effect, dove sprite descends, voice of God (text overlay)
  - Angel NPCs appear after final temptation to minister to Jesus

- [ ] **8.3 Satan boss encounters (×3)**
  - Temptation 1 — Stones to bread: Scripture selection (Deut. 8:3)
  - Temptation 2 — Temple pinnacle: Scripture selection (Deut. 6:16)
  - Temptation 3 — Kingdoms of the world: Scripture selection (Deut. 6:13)
  - Each uses Scripture-selection combat (Phase 5.4)
  - Victory after all 3: angels minister, stat boost event
  - **Design needed:** Satan's combat stats, challenge text, verse options per temptation

### Phase 9 — Arc 3 Content: Calling of the Disciples
> Sea of Galilee, Capernaum, disciple recruitment, party building.
> **Blocked by:** Phases 4.1, 6, 8.

- [ ] **9.1 Sea of Galilee & Capernaum tilemaps**
  - Galilee shoreline / fishing docks (~30×20 tiles)
  - Capernaum town (~25×20 tiles)
  - Mountain for the choosing of the Twelve (~20×25 tiles)
  - **Art needed:** Shoreline/water tileset, dock/boat detail tiles

- [ ] **9.2 Disciple recruitment events**
  - Peter & Andrew recruitment (fishing nets scene — cutscene + dialogue)
  - James & John recruitment (boat scene)
  - Philip & Nathanael recruitment
  - Matthew/Levi recruitment (tax booth)
  - Each triggers `recruitMember` effect → adds party member with unique abilities
  - Quest flags: recruited_peter, recruited_andrew, etc.

- [ ] **9.3 Party management integration**
  - Active party swap UI fully functional (5 active + bench)
  - Disciple stat screens showing unique abilities
  - Judas joins with hidden betrayal stat
  - Random encounters enabled in Galilee wilderness zones

### Phase 10 — Polish & Integration
> Testing, balancing, title screen, flow.
> **Blocked by:** Phases 7-9 (content must exist to polish).

- [ ] **10.1 Title screen & new game flow**
  - Title screen with pixel art logo (bitmap font "THE GOSPEL STORY")
  - New Game / Continue menu (using pause menu system)
  - Continue loads last save; New Game starts Arc 1 intro

- [ ] **10.2 Random encounter balancing**
  - Encounter rate tuning per zone (wilderness ~8%, roads ~3%)
  - Enemy difficulty curve across Arcs 2-3 (Arc 1 has no combat)
  - Stat progression balancing: level-up curve, enemy HP/damage scaling
  - Scripture selection difficulty: number of distractor verses

- [ ] **10.3 Arc-to-arc transitions**
  - Arc 1 → Arc 2: time skip, sprite swap (young Jesus → adult Jesus), narrative bridge
  - Arc 2 → Arc 3: wilderness exit, travel to Galilee, narrative bridge

- [ ] **10.4 Audio stubs**
  - `AudioManager.playBGM()` / `playSFX()` calls placed at appropriate points in code
  - All no-ops per `specs/audio.md` — ready to swap in real audio post-MVP

---

## Missing Art Assets (needed before or during implementation)

- [x] **Tilesets** — Overworld tileset created (`src/tilesets/overworld.js`) with 5 tiles: grass, stone path, water, sand, wall. Remaining tilesets needed for content phases:
  - Interior: stone floor, walls, pillars, doors, furniture — needed for Phase 7
  - Desert: sand, rock, dunes, sparse vegetation — needed for Phase 8
  - Temple: marble floor, columns, scrolls, ornate walls — needed for Phase 7
  - Shoreline: sand-to-water transition, docks, boats — needed for Phase 9
- [x] **Bitmap font** — 5×7 pixel glyphs created in `src/font/fontData.js` with full A-Z, a-z, 0-9, and punctuation glyphs. Completed in Phase 3.
- [ ] **Battle sprites (64×64)** — Front-facing battle sprites for Jesus, disciples, Satan, enemies. Needed for Phase 5. Can prototype with 4x-scaled overworld sprites.
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

1. **Stat formulas** — Damage calc, HP scaling, level-up curves. Need design before Phase 5.2.
2. **Difficulty model** — How wrong Scripture choices affect stats concretely. Need numbers before Phase 5.4.
3. **Scripture verse content** — Specific verse options for each Satan temptation and Pharisee debate. Need before Phase 8.3.
4. **Enemy roster** — Enemy types, stats, AI patterns, and encounter tables for wilderness zones. Need before Phase 5.2.

**Note:** Items 1 and 4 above require new spec documents (`specs/stat-formulas.md` and `specs/enemy-roster.md`) to be authored before Phase 5 can begin. These specs do not yet exist and should formalize damage calculations, HP/SP scaling curves, level-up stat growth tables, enemy types with base stats, AI behavior patterns, and per-zone encounter tables.

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
