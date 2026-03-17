# Implementation Plan — The Gospel Story JRPG

## Project State
- **Source code:** `src/` fully scaffolded — 83 JS files across 11 directories
- **Tests:** 638 tests passing across 42 test suites (vitest)
- **Specs:** 12 documents fully authored (4 recently amended with map-progression & Arc 1 clarifications)
- **Sprite assets:** 10 JS modules in `specs/sprites/` with pixel data for all MVP characters
- **Preview:** `specs/sprites/preview.html` renders all sprites at 8x scale
- **All 10 implementation phases COMPLETE**
- **Comprehensive audit completed 2026-03-17** — 3 game-breaking bugs found, 9 major gaps, 7 content gaps

---

## Remaining Work — P7 Comprehensive Audit (2026-03-17)

Items sorted by priority tier. Each confirmed via code-level audit.

### P0 — Game-Breaking Bugs

All P0 bugs resolved.

### P1 — Major Functional Gaps

All P1 gaps resolved.

### P2 — Content & Narrative Gaps

All P2 content gaps resolved.

### P3 — Test & Code Quality

- **TEST-05:** No test for follower creation/breadcrumb/rendering (note: Follower.test.js has 7 tests — this gap may be about OverworldScene-level follower integration)
- **TEST-07:** No test for cross-map warp integration (tile event → loadMap)
- **T10:** `main.js` has zero test coverage
- **T11:** `demo.js` excluded from map validation (intentional — placeholder NPC keys)

- **CODE-04:** Exports used only by tests: `getSpriteSize`/`clearSpriteCache` (renderSprite.js), `drawChar`/`GLYPH_W`/`GLYPH_H` (drawText.js), `expForLevel`/`calcDamage`/`calcHeal` — acceptable, kept for test coverage

### P4 — Post-MVP (Tracked for Reference)

- P5.21: 5 disciples have no recruitment dialogue/map placement (post-MVP)
- P5.22: Judas `betrayalStat` never incremented (post-MVP, Arc 11+)
- P5.25: Legion boss absent from enemy data (post-MVP, Arc 6)
- P5.35: Healing Encounters not implemented (post-MVP, Arc 4+)
- P5.36: Debate/Riddle Battles not implemented (post-MVP, Arc 4+)
- P5.37: Narrative party locking not implemented (post-MVP, Arc 8)
- Morale system gameplay integration (stubbed only)
- Enemy HP number on hit (30-frame timer) not in BattleHUD
- Victory/defeat fade overlays use timers not actual globalAlpha fades
- 9-slice speaker name plate with min/max width scaling
- Dynamic import for dialogue modules (currently pre-loaded)
- Per-character dialogue files (currently 3 flat arc files)

---

## Spec Inconsistencies (Documentation Only)

1. `dialogue-system.md` §4b says 6px cell width; §12 says 8px — contradictory
2. `dialogue-system.md` §9 has duplicate `greet` key in example (acknowledged)
3. `party-system.md` stat display says ATK/DEF; code uses STR/WIS/FAI/SPD
4. `tilemap-format.md` §11 filenames use hyphens; actual files use underscores
5. `dialogue-system.md` uses `root` field; implementation uses `start` key convention
6. `dialogue-system.md` constructor takes inventory/party/eventBus; implementation uses `onEffect` callback
7. AudioManager spec shows object literal; implementation uses class

---

## Items Confirmed Resolved by This Audit

- **P5.24** — Post-MVP disciple quest flags NOW present in `questFlags.js` (working tree change)
- **T9** — Encounter via natural movement IS now tested (`OverworldScene.test.js` lines 646-701)
- All 7 MVP disciples fully defined with stats, abilities, sprites
- All quest flags for arcs 1-3 properly defined
- All objectives complete for arcs 1-3
- Save/load working with 3 slots
- All warps bidirectional (except GAP-01 jordan_river landing position)
- All 8 dialogue effect types wired and forwarded correctly

---

## Resolved Items (Prior Audits)

### Additional Test Fixes (P7 Audit)
- **TEST-06** — Added test for arc-blocked warp feedback dialogue: verifies `canAccessMap` check, dialogue opens with feedback text, no warp initiated.

### CONTENT-01 Verification (P7 Audit)
- **CONTENT-01** — Scripture-selection combat is FULLY IMPLEMENTED. BattleScene has complete scripture UI (challenge display, 3 verse options, cursor, correct/wrong feedback). BattleEngine._doScriptureAttack uses fai stat with 150/60 power for correct/wrong. 9 challenges defined in scriptures.js with ENEMY_SCRIPTURE mapping. IMPLEMENTATION_PLAN description was outdated.

### Content & Test Fixes (P7 Audit — Batch 2)
- **CONTENT-02** — Baptism power-up: Jesus gains +10 WIS, +10 FAI, +5 SP when `baptism_complete` is set.
- **CONTENT-03** — Galilee arrival proclamation cutscene added: narrator (Matt 4:12) → Jesus: "Repent, for the kingdom of heaven is at hand" → narrator summary. Sets `arc3_started` flag. Fires once on arrival tile (14,18).
- **TEST-02** — Added tests for `_handleRetry()`: save-found-reload and no-save-fallback-to-title paths.
- **TEST-03** — Added tests for `requires` guard: cutscene skipped with missing flags, fires with all flags present.
- **TEST-04** — Added test for `_executeScriptedWarp()`: loads registered map at target coordinates.

### Content Fixes (P7 Audit)
- **CONTENT-04** — Jesus's Scripture rebuttals added to all three temptation dialogues (Matt 4:4, 4:7, 4:10). Satan temptation 2 also gets his misquoted Scripture (Psalm 91:11-12).
- **CONTENT-05** — Baptism narration completed: "with whom I am well pleased" appended (Matt 3:17).
- **CONTENT-06** — Joseph NPC added to Jerusalem map at (13,10) facing Mary. Dialogue includes pre/post-discovery variants.
- **CONTENT-07** — Gold Find ability description corrected from "Increase item drops" to "Gain 1.5x EXP after battle."

### Code Quality Fixes (P7 Audit)
- **CODE-01** — Removed dead `CHARS_PER_FRAME` constant from DialogueBox.js.
- **CODE-02** — Fixed panCamera offset from hardcoded 112/72 to correct 120/80 (SCREEN_WIDTH/2, SCREEN_HEIGHT/2).
- **CODE-03** — Removed dead `_handleMenuSelect()` empty stub from OverworldScene.js.

### GAP-03 & TEST-01 Fixes (P7 Audit)
- **GAP-03** — All 4 maps (temple, capernaum, wilderness, mountain) now have populated detail and above layers using their tileset-defined tiles. Tree canopy footprints collision-blocked.
- **TEST-01** — Unsafe `Math.random` override replaced with `vi.spyOn(Math, 'random').mockReturnValue(0)` + `vi.restoreAllMocks()`.

### P1 Gap Fixes (P7 Audit)
- **GAP-01** — Jordan River `warp_south` targetY changed from 1 to 18 (south gate).
- **GAP-02** — Above-layer footprint tiles now blocked in jerusalem.js (trees) and galilee.js (reeds).
- **GAP-04** — Wilderness cactus moved from (13,16) to (14,16), no longer blocking `temptation_3` event.
- **GAP-05** — Effect parameter naming accepts both spec (`item`/`qty`/`soundId`) and legacy (`itemId`/`count`/`sfxId`).
- **GAP-06** — `calcHeal` now uses `Math.max(wis, fai)` so John's fai stat contributes to healing. Tests added.
- **GAP-07** — Battle-only items (oil) blocked from field use; `useItem()` returns false for `duration: 'battle'` items. Test added.
- **GAP-08** — Verified: Mary follower initializes correctly via `_updateFollowerForArc()` called from `loadMap()` (current_arc defaults to 1).
- **GAP-09** — BGM ID changed from `'battle_boss'` to `'boss'` to match spec.

### P0 Bug Fixes (P7 Audit)
- **BUG-01** — `setFlag` effects now forwarded to `onEffect` callback in `DialogueSystem._executeEffect`. Arc-advancement via dialogue setFlag (e.g., `arc1_complete` → `advanceArc(2)`) now works. Test added.
- **BUG-02** — Desert tileset duplicate palette key `OH` renamed to `RH` for rock overhang base. Oasis water highlight `OH` (#5AAACC) now renders correctly.
- **BUG-03** — BattleHUD `imageSmoothingEnabled` already set to `false` (confirmed resolved in prior commit).

### P6 Fixes
- **P6.7** — `arc2_started` moved from arc2.js baptism_complete node to arc1.js arc1_transition.start, so the flag is set when Arc 2 begins rather than when baptism completes.
- **P6.6** — `arc1_started` flag is now set in main.js onNewGame handler, resolving the declared-but-never-set gap.
- **P6.5** — RESOLVED for MVP. All 14 MVP sprite keys properly registered in sprite registry. 5 post-MVP disciple sprites are data-only stubs.
- **P6.4** — Wisdom Q&A implemented as dialogue-tree variant in young_jesus dialogue (arc1.js). Three questions covering Deut 6:5, Isaiah 9:6, Micah 5:2.
- **P6.1** — SaveLoadMenu.onLoad now wired in OverworldScene constructor. _reloadFromSave() fades to black, looks up saved map in _mapRegistry, calls loadMap() with restored coordinates and facing.
- **P6.2** — Held-confirm fast-forward now only accelerates typewriter reveal. When text is fully revealed, held confirm is ignored.
- **P6.3** — Objective marker rendered at (4,4) on overworld HUD. getCurrentObjective() derives text from questFlags.
- **P6.8** — EventSystem._cameraOverride replaced with public getter.
- **P6.9** — DMG_MISS color now used for miss and blocked damage floaters.

### P5 Fixes
- **P5.17** — Detail and above tile definitions added to all 4 tilesets. Jerusalem and Galilee maps populated with environmental details.
- **P5.18** — Temple map correctly uses `interior` tileset. `tilemap-format.md` updated to remove separate `temple.js`.
- **P5.16** — Enemy battle sprites created (16x16 pixel art, 2x scaled to 32x32). All 7 enemies have distinctive designs.
- **P5.23** — Summit cutscene spawns 7 disciple NPCs in semicircle via spawnNPC commands.
- **P5.34** — Morale field stubbed on party members (default 100, serialized/deserialized).
- **P5.20** — dialogue-system.md updated to match ui-hud.md: 240x42 box, 38 chars/line, 2 lines.
- **P5.26** — Peter recruitment dialogue expanded from 3 to 9 nodes with miraculous catch of fish (Luke 5:1-11).
- **P5.28** — EventSystem fadeOut onMidpoint documented as intentional.
- **P5.29** — BattleScene.exit() and OverworldScene.exit() now perform cleanup.
- **P5.33** — clearTileCache() called at start of OverworldScene.loadMap().
- **P5.30** — DialogueSystem effects deferred until player advances past the node. _pendingEffects array accumulates effects; flush on 'done' or choice result.
- **P5.19** — Jordan River east warp moved from water to sandy bank edge.
- **P5.15** — PartyMenu renders 16x16 member sprites via renderSprite. spriteRegistry passed through PauseMenu chain.
- **P5.14** — PartyMenu ROW_HEIGHT updated to 26, HP/SP bar maxW updated to 60.
- **P5.13** — OptionsMenu implemented with Text Speed, BGM toggle, SFX toggle.
- **P5.1** — Joseph+Mary are Arc 1 protagonists. Follower class implements breadcrumb-trail for Mary. transitionToArc2() swaps Joseph→Jesus.
- **P5.2** — After arc2_complete, temptation_3 cutscene auto-warps player to galilee via warp EventSystem command.
- **P5.3** — Temptation events trigger scripture-selection boss battles via startBattle EventSystem command.
- **P5.4** — Arc-blocked warp shows feedback dialogue.
- **P5.5** — Capernaum→Mountain warp spawns at base (targetY: 23).
- **P5.7** — Defeat screen with "FALLEN" panel, retry/title options.
- **P5.8** — Victory screen awards EXP, displays per-member level-up stat reveals.
- **P5.10** — def stat added to all 13 ROSTER entries and 7 enemies.
- **P5.12** — temptation_3 requires both temptation_1_resolved AND temptation_2_resolved.
- **P5.6** — Arc-transition cutscenes fully implemented.
- **P5.9** — Dialogue fast-forward on held confirm wired.
- **P5.11** — NPC post-discovery dialogue with conditionFail field.
- **P5.27** — Jerusalem townsperson_4 and townsperson_5 have unique dialogue trees.
- **P5.31** — Integer-only scaling confirmed intentional for pixel-art crispness.
- **P5.32** — overflow: hidden set on html and body.

### P4 Fixes
P4.4 (gold_bonus effectType), P4.7 (checkEncounterZone JSDoc), P4.14 (arc ordering enforcement).

### P3 Fixes
P3.19–P3.33 (evalCondition defaults, playtime counter, damage floater timing, cursor blink, Display CSS, DMG_MISS color, BattleHUD gap, Scan rendering, status_shield, pause overlay, PartyMenu layout, bonusVsWeakness, DialogueBox cleanup).

### Earlier P3 Fixes
P3.1–P3.18 (Display tests, tileset tests, UIChrome/Colors tests, EventSystem commands, BattleScene tests + target selection bug, OverworldScene gaps, PauseMenu delegation, ability menu, dialogue validation, Inventory.fromJSON, dialogue effects, enemy AI, dead code cleanup).

### Notable Bug Fixes
- **BattleScene target selection** — _handleActionInput() had early return that dropped target input. Fixed to call _handleTargetInput().
- **Flaky enemy AI test** — Fixed to accept all valid result types (damage, debuff, buff).
- **Pre-existing test bug** — "pending arc cutscene fires after dialogue closes" needed two confirm presses.

---

## Completed Phases

All 10 phases confirmed complete by audit:
1. Engine Foundation (game loop, display, sprites, input, scene manager)
2. World & Movement (tilemap, camera, player, NPCs, map transitions)
3. Dialogue & UI (bitmap font, dialogue box, menus, HUD)
4. Game State & Data (party, inventory, quest flags, save/load)
5. Combat Systems (battle transition, turn engine, sprites, scripture, wisdom)
6. Narrative & Events (15 command types; visual effects deferred)
7. Arc 1 Content (Jerusalem, temple, NPCs, cutscenes)
8. Arc 2 Content (Jordan River, wilderness, Satan encounters x3)
9. Arc 3 Content (Galilee, Capernaum, 7 disciple recruitments)
10. Polish & Integration (title screen, encounters, arc transitions, audio stubs)

---

## Key Design Decisions

- **Build tooling** — Pure ES modules, no bundler
- **Tilemap authoring** — Hand-coded JS modules
- **Audio** — Deferred post-MVP; stub interface defined
- **Input** — Arrow/WASD + Z/X/Enter
- **UI rendering** — All `fillRect`-based, no sprite sheets
- **Walk cycle animation** — Deferred (single-frame per direction)
- **Scripture difficulty** — correct=150, wrong=60 power
- **Enemy defense** — BattleEngine uses target.stats.def exclusively; DEF is a proper stat field on all party members and enemies (STR fallback removed)
- **Enemy AI** — Basic AI: 70% attack / 30% ability; Boss AI: 50/50; enemies have themed abilities
- **Dialogue effects** — All 8 effect types fully wired (setFlag, giveItem, removeItem, recruitMember, playSound, playMusic, setNpcState, triggerEvent)
- **Gold Find ability** — Matthew's gold_find applies a gold_bonus buff; grants 1.5x EXP on victory (no gold currency system — EXP is the only reward)
- **Arc ordering** — MAP_ARC_REQUIREMENTS maps each map to its minimum arc; current_arc tracked in questFlags; auto-advances when arc*_complete flags are set via dialogue effects
- **Dialogue string-key resolution** — OverworldScene resolves string keys to data objects from `_dialogueCache` before passing to EventSystem
- **EventSystem extended commands** — startBattle (scripture-selection boss battle) and warp (teleport to target map/coords) command types
- **Cutscene prerequisites** — `requires` array of flag names; OverworldScene skips event unless all flags are set
- **Text speed** — Configurable via Options menu (1/2/4 chars per frame); gameSettings singleton
- **Sprite registry** — Passed from OverworldScene through PauseMenu to PartyMenu for consistent rendering

---

## Out of Scope (per `specs/mvp-scope.md`)

- Full 12-disciple roster beyond MVP 7 (Peter, Andrew, James, John, Philip, Nathanael, Matthew)
- Parables side quests (Arc 7+)
- Advanced mini-games (fishing, stealth, platforming, resource management)
- Morale system (stubbed only — P5.34)
- Healing encounters (P5.35)
- Debate/Riddle battles (P5.36)
- Narrative party locking (P5.37)
- Native builds
- Arcs 4-16 content
- Audio playback (stubbed only)
- Gamepad / touch input
- Visual effects (Phase 6.2)
- Walk cycle animation
- Legion boss enemy (P5.25)
