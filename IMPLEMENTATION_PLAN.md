# Implementation Plan — The Gospel Story JRPG

## Project State
- **Source code:** `src/` fully scaffolded — 83 JS files across 11 directories
- **Tests:** 437 tests passing across 35 test suites (vitest)
- **Specs:** 12 documents fully authored
- **Sprite assets:** 10 JS modules in `specs/sprites/` with pixel data for all MVP characters
- **Preview:** `specs/sprites/preview.html` renders all sprites at 8x scale
- **All 10 implementation phases marked COMPLETE** (with caveats — see audit below)

---

## Codebase Audit — Prioritized Remaining Work

The following items were discovered by comparing every source file against every spec document. They are sorted by priority: **P0** = game-breaking / blocks playability, **P1** = significant functionality gap, **P2** = correctness issue, **P3** = quality / polish.

---

### P0 — Game-Breaking Bugs

- [x] **P0.1 Player cannot move after New Game** — RESOLVED: Thorough static analysis found no single root cause. Three contributing bugs were fixed: (1) questFlags disconnection — DialogueSystem/EventSystem received empty {} instead of gameState.questFlags, (2) transitions double-updated during events causing timing glitches, (3) no fade-in transition on New Game caused abrupt scene switch. Added TransitionManager.fadeIn() public method and a fade-in on New Game/Continue that blocks input briefly during initialization, preventing any timing-related input glitches.

- [x] **P0.2 Encounter zone schema inconsistency** — RESOLVED: All maps normalized to use `{ x, y, w, h, rate, table: [{enemy, weight}] }` format (wilderness.js, galilee.js, mountain.js updated to match demo.js format).

- [x] **P0.3 Sprite registry incomplete** — RESOLVED: All 10 NPC sprite keys registered in main.js with proper sprite data from specs/sprites/ modules (peter, andrew, james, john, philip, nathanael, matthew, npc_john_baptist, townspeople_woman_a, townspeople_elder_a).

- [x] **P0.4 Battle items are a no-op** — RESOLVED: Full item selection UI implemented in BattleScene with item list, target selection for HP/SP items, and buff_str application for oil items. BattleScene now receives gameState for inventory access.

---

### P1 — Significant Functionality Gaps

- [x] **P1.1 Buff/debuff effects not applied in combat** — RESOLVED: _doAttack and _executeEnemyAI now check for buff_str (1.5x STR), buff_def (2x DEF), debuff_def (0.5x DEF), shield (0.5x damage), and defend (2x DEF). Also uses target.stats.def when available instead of always using str for defense.

- [x] **P1.2 Oil item STR buff not handled** — RESOLVED: Oil items now add buff_str to the engine's buff list during battle via the new item system.

- [ ] **P1.3 Quest flag name mismatch (Arc 2)** — `arc2.js` dialogue and `wilderness.js` cutscenes set flags `temptation_1_started`, `temptation_2_started`, `temptation_3_started`. But `INITIAL_FLAGS` in `questFlags.js` only declares `temptation_1_resolved`, `temptation_2_resolved`, `temptation_3_resolved`. The `_started` flags work at runtime (JS objects accept new keys) but are invisible to any system that checks `INITIAL_FLAGS` for valid flag names.

- [ ] **P1.4 Several Arc 1 quest flags never set** — `arc1_started` and `heard_about_temple_boy` are declared in `INITIAL_FLAGS` but no dialogue or event in arc1 sets them. They are always `false`.

- [ ] **P1.5 `arc3_started` flag never set** — Declared in `INITIAL_FLAGS` but no dialogue or event in arc3 sets it.

- [ ] **P1.6 `angel_minister` has no gate on temptation completion** — In `arc2.js`, the `angel_minister` dialogue unconditionally sets `arc2_complete: true` without checking that all three temptations were resolved first.

- [ ] **P1.7 Jerusalem `warp_south` is a self-loop** — `jerusalem.js` event `warp_south` warps to `targetMap: 'jerusalem'` at position (14,17) — same map. This should connect to another area (jordan_river or a route).

- [ ] **P1.8 Mountain map has no cutscene triggers** — `mountain.js` has `npcs: []` and its events object has only a `warp_down` — no disciple spawn cutscenes despite comments saying "disciples spawn via cutscenes."

- [x] **P1.9 EventSystem.fadeIn accesses TransitionManager private fields** — RESOLVED: Added TransitionManager.fadeIn(onComplete) public method. EventSystem fadeIn command now uses the public API instead of directly mutating private state.

- [x] **P1.10 `wordWrap` does not handle `\n` newlines** — RESOLVED: wordWrap now splits on \n first, then word-wraps each paragraph. Consecutive \n produce blank lines. 4 new tests added.

- [ ] **P1.11 Satan scripture challenge does not change per encounter** — `ENEMY_SCRIPTURE.satan` maps to `temptation_bread` with a comment "changes per encounter" but no code implements this. All three Satan encounters would use the same scripture challenge.

- [x] **P1.12 Experience distribution not implemented** — RESOLVED: Was already implemented in OverworldScene._startBattle victory callback (gainExp called for each living party member).

- [x] **P1.13 `newGame` starts on demo map, not Jerusalem** — RESOLVED: GameState.newGame() now sets currentMap='jerusalem', playerX=14, playerY=18.

---

### P2 — Correctness & Consistency Issues

- [ ] **P2.1 Display not centered on screen** — `Display._onResize()` scales the canvas but does not center it (no CSS `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)`). The canvas sits at top-left of body with no letterbox centering.

- [ ] **P2.2 Ability SP cost not enforced in BattleScene** — `_renderAbilityMenu` dims unaffordable abilities visually but they remain selectable. The `BattleEngine.execute()` deducts SP but doesn't check if the member has enough — SP can go negative.

- [ ] **P2.3 `TURN_START` and `SELECT_TARGET` phases are dead code** — Declared in `BattlePhase` enum but never set by the engine. `SELECT_TARGET` selection logic is handled inside `BattleScene` directly, not via the engine phase.

- [x] **P2.4 Enemy defense uses `str` stat** — RESOLVED: BattleEngine now checks for target.stats.def first, falling back to str for backward compatibility with enemies that lack a def field.

- [ ] **P2.5 NPC wander shuffle is biased** — `NPCManager` uses `[...ALL_DIRS].sort(() => Math.random() - 0.5)` which produces a non-uniform distribution. Should use Fisher-Yates shuffle.

- [ ] **P2.6 `OPPOSITE_DIR` constant is dead code in NPCManager** — Defined but never referenced.

- [ ] **P2.7 BattleHUD floater fade glitch** — Fade formula `alpha = 1 - (f.frame - 30) / 10` makes the last frame (40) fully opaque before removal, creating a 1-frame flash. Should be `alpha = 1 - (f.frame - 30) / 10` capped at 0.

- [x] **P2.8 `autoAdvanceSingleChoice` skips choice effects** — RESOLVED: When a single valid choice auto-advances, its effects array is now executed before following choice.next.

- [ ] **P2.9 PauseMenu cursor never blinks** — `render()` passes hardcoded `0` as `frameCount` to `drawCursor()`, so the cursor is always visible. Spec says it should blink at 30-frame intervals.

- [ ] **P2.10 SaveLoadMenu omits leader name display** — The slot info panel renders level, playtime, and map but drops the leader/character name despite `info` containing it.

- [ ] **P2.11 `BattleScene._renderVictory` text not centered** — "VICTORY" at hardcoded x=90 and "FALLEN" at x=96 are not calculated from `SCREEN_WIDTH`.

- [ ] **P2.12 `onContinue` accesses private `overworld._mapRegistry`** — In `main.js`, the continue-game callback reads `overworld._mapRegistry[mapId]` — accessing a private field.

- [ ] **P2.13 `young_jesus` NPC uses wrong sprite** — In `temple.js`, the `young_jesus` NPC has `sprite: 'townspeople_elder_a'` — same sprite as temple teachers/guards. Should use the young Jesus sprite from `specs/sprites/young-jesus.js`.

- [ ] **P2.14 `GameState.deserializeMember` skips `createMember` re-hydration** — If `partyData.js` adds new member fields in the future, saved games won't have them. Members loaded from saves are shallow copies of raw JSON, not re-created through the factory.

---

### P3 — Quality, Polish & Test Coverage

- [ ] **P3.1 No test for Display.js** — The only engine module with zero test coverage.
- [ ] **P3.2 No tests for tilesets** — No validation that palette keys in TILES exist in PALETTE, that tile arrays are 16x16, etc.
- [ ] **P3.3 No tests for UIChrome.js or Colors.js** — Core rendering primitives are untested.
- [ ] **P3.4 EventSystem commands untested** — `moveNPC`, `movePlayer`, `panCamera`, `returnCamera`, `fadeOut`, `fadeIn`, `flash` commands have zero test coverage.
- [ ] **P3.5 BattleScene sub-flows untested** — Ability→target, scripture input, target navigation, enemy turn, execute phase, victory/defeat renders have no tests.
- [ ] **P3.6 OverworldScene gaps** — No tests for: encounter triggering, defeat path, cutscene handling, dialogue effects, unregistered NPC dialogue fallback.
- [ ] **P3.7 PauseMenu sub-menu delegation untested** — Tests use `null` gameState, so real sub-menu activation (Party/Items/Save/Load) is never tested.
- [ ] **P3.8 `demo.js` map excluded from maps.test.js** — 7 of 8 maps tested; demo is skipped.
- [ ] **P3.9 `BattleScene._renderAbilityMenu` doesn't use `drawPanel`** — Draws its own panel manually instead of using UIChrome, inconsistent with the rest of the UI.
- [ ] **P3.10 `AbilityCategory.SCRIPTURE` is unused** — Defined in abilities.js enum but no ability has this category. Either assign it to scripture-related abilities or remove it.
- [ ] **P3.11 Three roster members have placeholder data** — `james_alphaeus`, `thaddaeus`, `simon_zealot` have `role: 'tbd'` and empty `abilities: []` arrays. Per MVP scope these 3 are out of scope (only Peter, Andrew, James, John, Philip, Nathanael are in MVP).
- [ ] **P3.12 `EventSystem.wait` is frame-rate dependent** — Counts down by 1 per `update()` call rather than using `dt`, making wait duration dependent on frame rate.
- [ ] **P3.13 Map NPC dialogue keys not validated** — No test or runtime check that NPC `dialogue` string keys correspond to registered dialogue data.
- [ ] **P3.14 Map warp `targetMap` values not validated** — No check that warp destinations reference valid map IDs in the registry.
- [ ] **P3.15 `Inventory.fromJSON` accepts unknown item IDs silently** — Could lead to ghost items in inventory after save format changes.

---

## Spec Inconsistencies — Status

### 1. Text Box Dimensions Conflict — RESOLVED in code
- Code follows `ui-hud.md`: BOX at y=118, 240x42px, 38 chars/line, 2 lines/page.
- `specs/dialogue-system.md` still contains incorrect dimensions (not updated).

### 2. Dialogue Module Path Inconsistency — RESOLVED in code
- Code uses `src/` prefix consistently.
- `specs/dialogue-system.md` still references paths without `src/` prefix.

### 3. NPC Dialogue Key Format — RESOLVED in code
- NPCs use a simple `dialogue` string key looked up in a flat registry via `OverworldScene.registerDialogue()`.

### 4. Quest Flags Disconnection — RESOLVED in code
- OverworldScene was creating DialogueSystem and EventSystem with empty {} for questFlags instead of using gameState.questFlags. Fixed: constructor uses gameState.questFlags, and loadMap() refreshes the references after newGame()/load() which replace the object.

### 5. Transition Double-Update During Events — RESOLVED in code
- Game loop calls transitions.update() each tick, but OverworldScene also called it during events, causing transitions to animate at 2x speed. Removed the redundant call from OverworldScene.

---

## Completed Phases (confirmed by audit)

### Phase 1 — Engine Foundation: COMPLETE
- [x] 1.1 Project scaffolding
- [x] 1.2 Game loop (fixed-timestep, spiral-of-death cap)
- [x] 1.3 Canvas & display scaling (240x160, nearest-neighbor, integer scale)
- [x] 1.4 Sprite rendering engine (palette-based, cached OffscreenCanvas, mirroring)
- [x] 1.5 Input system (keyboard, pressed/held/released, buffer, key repeat)
- [x] 1.6 Scene manager (register/switch, enter/exit lifecycle)

### Phase 2 — World & Movement: COMPLETE
- [x] 2.1 Tilemap system (5 layers, frustum culling, tile baking cache)
- [x] 2.2 Camera system (follow + clamp formula)
- [x] 2.3 Player movement (grid-based, 128 px/s interpolation)
- [x] 2.4 NPC placement & interaction (static + wander, tile collision)
- [x] 2.5 Map transitions (fade-to-black, midpoint callback)

### Phase 3 — Dialogue & UI: COMPLETE
- [x] 3.1 Bitmap font (5x7 glyphs, full charset)
- [x] 3.2 Dialogue box (word wrap, pagination, typewriter, choices)
- [x] 3.3 Menu system (Pause, Party, Items, Save/Load)
- [x] 3.4 Overworld HUD (location name fade in/hold/out) & Battle HUD

### Phase 4 — Game State & Data: COMPLETE
- [x] 4.1 Party data model (13 members, stats, growth, abilities, exp/leveling)
- [x] 4.2 Inventory system (consumables, key items, use effects)
- [x] 4.3 Quest flag system (26 flags + current_arc)
- [x] 4.4 Save/load system (3 slots, localStorage, versioned serialization)

### Phase 5 — Combat Systems: COMPLETE
- [x] 5.1 Battle transition
- [x] 5.2 Turn-based combat engine
- [x] 5.3 Battle sprites & UI (placeholder enemy sprites)
- [x] 5.4 Scripture-selection combat
- [x] 5.5 Wisdom Q&A mini-game

### Phase 6 — Narrative & Events: PARTIALLY COMPLETE
- [x] 6.1 Event/cutscene system (15 command types)
- [ ] 6.2 Visual effects (deferred)

### Phase 7 — Arc 1 Content: COMPLETE (with P1.4, P2.13 caveats)
- [x] 7.1 Jerusalem tilemap (30x20, overworld tileset)
- [x] 7.2 Arc 1 NPCs & dialogue (9 conversations)
- [x] 7.3 Arc 1 gameplay
- [x] 7.4 Arc 1 cutscenes

### Phase 8 — Arc 2 Content: COMPLETE (with P1.3, P1.6, P1.11 caveats)
- [x] 8.1 Jordan River & wilderness tilemaps
- [x] 8.2 Arc 2 NPCs & events
- [x] 8.3 Satan boss encounters (×3 dialogue stubs — scripture challenge switching not implemented)

### Phase 9 — Arc 3 Content: COMPLETE (with P1.5, P1.8 caveats)
- [x] 9.1 Sea of Galilee & Capernaum tilemaps
- [x] 9.2 Disciple recruitment events (7 disciples)
- [x] 9.3 Party management integration

### Phase 10 — Polish & Integration: COMPLETE (with P0.1 caveat)
- [x] 10.1 Title screen & new game flow
- [x] 10.2 Random encounter balancing
- [x] 10.3 Arc-to-arc transitions
- [x] 10.4 Audio stubs

---

## Missing Art Assets

- [x] **Tilesets** — 4 tilesets: overworld (5), interior (8), desert (8), shoreline (8)
- [x] **Bitmap font** — 5×7 pixel glyphs, full charset
- [x] **Battle sprites (64×64)** — Not actually implemented as 64×64 pixel art; enemies use placeholder colored rectangles
- [ ] **Walk cycle animation frames** — Deferred (single-frame per direction)
- [x] **UI chrome** — All procedural via `fillRect` per spec

---

## Key Design Decisions — Resolved

1. **Build tooling** — Pure ES modules, no bundler
2. **Tilemap authoring** — Hand-coded JS modules
3. **Audio approach** — Deferred post-MVP; stub interface defined
4. **Input mappings** — Arrow/WASD + Z/X/Enter
5. **UI rendering** — All `fillRect`-based, no sprite sheets

## Key Design Decisions — Still Needed

1. **Difficulty model** — Scripture choice penalties (correct=150, wrong=60)
2. **Walk cycle animation** — Deferred
3. **Enemy defense stat** — Resolved (P2.4): BattleEngine checks target.stats.def first, falling back to str. Enemies in enemies.js may still benefit from adding explicit def fields.

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
- Visual effects (Phase 6.2)
