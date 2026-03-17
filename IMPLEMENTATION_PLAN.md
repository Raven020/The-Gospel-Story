# Implementation Plan — The Gospel Story JRPG

## Project State
- **Source code:** `src/` fully scaffolded — 83 JS files across 11 directories
- **Tests:** 672 tests passing across 43 test suites (vitest)
- **Specs:** 12 documents fully authored (4 recently amended with map-progression & Arc 1 clarifications)
- **Sprite assets:** 10 JS modules in `specs/sprites/` with pixel data for all MVP characters
- **Preview:** `specs/sprites/preview.html` renders all sprites at 8x scale
- **All 10 implementation phases COMPLETE**
- **Comprehensive audit completed 2026-03-17** — 0 game-breaking bugs, 8 functional gaps, 5 content gaps, 11 UI/visual gaps

---

## Remaining Work — Comprehensive Audit (2026-03-17)

Items sorted by priority tier. Each confirmed via code-level audit.

### P0 — Game-Breaking Bugs

All P0 bugs resolved. See "Resolved Items" section below.

### P1 — Major Functional Gaps

All P1 functional gaps resolved. See "Resolved Items" section below.

### P2 — Content & Narrative Gaps

All P2 content gaps resolved. See "Resolved Items" section below.

### P3 — UI & Visual Gaps

All major P3 UI gaps resolved. See "Resolved Items" section below. Remaining low-priority items:

- **UI-09:** Speaker name plate rendered as plain text + 1px rule. Spec §5 says 9-slice name plate sprite with min 48px / max 112px width. **Fix (low priority):** The IMPLEMENTATION_PLAN previously noted this as cosmetic-only since the spec's ui-hud.md §2 does NOT require 9-slice — it describes plain gold text + rule. The dialogue-system.md §5 contradicts this. Treat as spec ambiguity.

- **UI-10:** Speaker name separator rule drawn at `NAME_Y + CELL_H` (128) using cell height 8; spec implies glyph height 7, placing it at 127. 1px discrepancy. **Fix (low priority):** Use `GLYPH_H` instead of `CELL_H`.

### P4 — Post-MVP (Tracked for Reference)

- Healing Encounters not implemented (combat.md — requires non-hostile encounter mode)
- Debate/Riddle Battles not implemented (combat.md — Pharisee confrontations)
- Legion boss absent from enemy data (combat.md, story.md Arc 6)
- Morale system gameplay integration (stubbed only — party-system.md)
- Narrative party locking not implemented (party-system.md — arc-specific party restrictions)
- 5 disciples have `role: 'tbd'` and empty abilities (james_alphaeus, thaddaeus, simon_zealot + 2 post-MVP)
- Judas `betrayalStat` never incremented (post-MVP, Arc 11+)
- Currency/gold system for Matthew's abilities (no gold field anywhere)
- Dynamic import for dialogue modules (currently pre-loaded)
- Per-character dialogue files (currently 3 flat arc files)
- Decorative border around canvas (technical.md — "decorative border" mentioned but not implemented)
- WebGL rendering (technical.md says "canvas/WebGL" — implementation uses 2D canvas only)
- Follower `pause()`/`resume()` during NPC dialogue (party-system.md)
- Follower scripted `moveTo()` for cutscenes (only `teleport()` exists)
- Battle-duration item use path in combat (oil item has `duration: 'battle'` but no in-battle use code)

---

## Spec Inconsistencies (Documentation Only)

1. `dialogue-system.md` §4b says 6px cell width; §12 says 8px — contradictory. Implementation uses 6px (correct per ui-hud.md).
2. `dialogue-system.md` §9 has duplicate `greet` key in example (acknowledged)
3. ~~`party-system.md` stat display says ATK/DEF; code uses STR/WIS/FAI/SPD~~ — **Resolved:** ui-hud.md §4 updated to match implementation (STR/DEF/WIS/FAI/SPD)
4. `tilemap-format.md` §11 filenames use hyphens; actual files use underscores
5. `dialogue-system.md` uses `root` field; implementation uses `start` key convention
6. `dialogue-system.md` constructor takes inventory/party/eventBus; implementation uses `onEffect` callback
7. AudioManager spec shows object literal; implementation uses class
8. `ui-hud.md` §3 says PauseMenu "same fill as dialogue box" (dark); §1 color table says menu panels use BG_LIGHT (parchment) — contradictory
9. `dialogue-system.md` §5 says 9-slice name plate; `ui-hud.md` §2 says plain gold text + rule — contradictory
10. `tilemap-format.md` §11 lists 3 tilesets; implementation has 4 (shoreline.js undocumented in spec)
11. ~~`mvp-scope.md` lists 6 MVP disciples; implementation includes 7 (Matthew)~~ — **Resolved:** mvp-scope.md updated to include Matthew

---

## Items Confirmed Resolved by This Audit

- **Victory screen** — Fully implemented in BattleScene.js (lines 834-853). 30-frame fade, VICTORY panel, EXP, level-ups.
- **Defeat screen** — Fully implemented in BattleScene.js (lines 879-923). 60-frame fade, FALLEN panel, Retry/Title options.
- **Objective marker** — Fully implemented in OverworldScene.js (lines 497-508). Dark bg, text at (4,4), 30-char truncation.
- **Location name display** — Fully implemented in OverworldScene.js. 20-frame fade-in, 120-frame hold, 20-frame fade-out.
- **TransitionManager** — Fully implemented (123 lines). fadeToBlack, fadeIn, flashWhite with proper state machines.
- **Scripture combat** — One-step flow (pick verse → auto-targets). No two-step target selection issue.
- **All warp tiles walkable** — Confirmed collision=0 on all warp tiles across all 8 maps.
- **All maps have exits** — Confirmed at least one working warp per map (demo.js self-warp is intentional dev map).
- **All 659 tests passing** — No skipped, todo, or focused tests. No flaky tests (all Math.random properly mocked except one loose-assertion test in BattleEngine).
- **No TODO/FIXME/HACK comments** in source code.
- **Rabbi Q&A data is correct** — All three `qN_ask` nodes have both `text` (question) and `choices` (answers). The bug is in the rendering engine (BUG-P0-02), not the data.

---

## Resolved Items (Prior Audits)

### P3 UI Gap Fixes & CONTENT-11 (2026-03-17)
- **UI-03** — Advance arrow fixed from 5×3 to 3×5 downward-pointing triangle in UIChrome.js `drawAdvanceArrow`, matching spec §2.
- **UI-04** — Party screen header now shows "Active: N" count right-aligned, matching spec §4 layout.
- **UI-05** — Spec inconsistency resolved: ui-hud.md §4 detail view updated to use STR/DEF/WIS/FAI/SPD (matching implementation's thematic stat names) instead of generic ATK/DEF/SPD/LUK. EXP and Abilities list documented as intended features.
- **UI-06** — Party detail Swap/Back converted from text hint (`"Z=Swap  X=Back"`) to cursor-navigable option rows. `_detailCursor` tracks selection; UP/DOWN navigates; CONFIRM selects. Swap hidden for Jesus and when no bench exists. 2 new tests added.
- **UI-07** — Party-target highlight added to BattleHUD via `renderPartyTargetCursor()`. Blinking highlight bar (20-frame interval) drawn over targeted party member's slot during item target selection. Integrated in BattleScene render. 4 tests added.
- **UI-08** — Sub-menu slide-in animation added for battle action sub-menus (ability, item, item-target). `_subMenuSlideOffset` starts at 96px (panel width) and decreases by 16px/frame, creating a 6-frame slide-in from the right per spec §5.
- **CONTENT-11** — mvp-scope.md updated to include Matthew in the MVP disciple roster (was already fully implemented). Spec inconsistency #11 resolved.

### Content & UI Fixes (2026-03-17)
- **CONTENT-08** — Baptism visual cutscene added. `baptism_complete` flag now triggers `_pendingArcCutscene = 'baptism_cutscene'` which fires double white flash effects after the John the Baptist dialogue closes. Registered in main.js.
- **CONTENT-09** — Arc 1→2 transition cutscene enhanced with visual flash effects. Dialogue split into `arc1_transition_p1` and `arc1_transition_p2` keys with `flash` and `wait` commands between narration beats, simulating time passage.
- **CONTENT-10** — Teacher breadcrumb NPC (`road_teacher`) added to Jerusalem map at (13, 3) on the north temple approach path. Teacher dialogue includes firsthand account of the boy's scriptural knowledge, sets `heard_about_temple_boy` flag, offers choice to ask for directions. Pre/post-discovery conditional branch.
- **UI-01** — DialogueBox now shows question text above choices. New `_renderQuestionHeader()` displays the last page's first line as a header; choices render one `LINE_HEIGHT` below. Both text and choices visible simultaneously.
- **UI-02** — Choice scroll limit added. `MAX_VISIBLE_CHOICES = 4` caps rendered choices. `_choiceScrollOffset` tracks scroll position; `onDirection()` adjusts offset to keep selected choice visible. 3 tests added.

### P1 Functional Gap Fixes (2026-03-17)
- **FUNC-01** — Ability damage now uses STR for MIRACLE-category abilities and WIS for PRAYER/TRUTH categories. Both player (`_executeAbility`) and enemy (`_executeEnemyAbility`) paths in BattleEngine.js updated. Test updated.
- **FUNC-02** — Added offensive `prayer_rebuke` ability (power 50, SINGLE_ENEMY, bonusVsWeakness: 'prayer') to make fear enemy weakness reachable. Assigned to Andrew. Removed nonsensical `bonusVsWeakness` from `prayer_heal` (a healing ability that never enters the damage branch).
- **FUNC-03** — `autoAdvanceSingleChoice` now reads from tree root (`this._nodes.autoAdvanceSingleChoice`) instead of individual node, matching the spec's "per-tree" design. Tests updated to place flag at tree root.
- **FUNC-04** — Menu panels (PauseMenu, PartyMenu, ItemMenu, SaveLoadMenu) now use `Colors.BG_LIGHT` (#D8C8A0) for panel fill per spec §1 color table. Body text on menu panels uses `Colors.TEXT_DARK` for readability on light background; cursor-highlighted rows keep `Colors.TEXT_LIGHT`.
- **FUNC-05** — Fishermen NPCs (Andrew, James, John) in Galilee now have `condition: { flag: 'arc3_started', op: 'eq', value: true }` on their start nodes, preventing recruitment before the Galilee proclamation cutscene. Peter's start node has a `recruited_peter` guard with post-recruit dialogue fallback. Each has a `conditionFail` fallback node.
- **FUNC-06** — `transitions.fadeIn()` in main.js onNewGame and onContinue now passes `onComplete` callback that re-asserts `input.context = InputContext.OVERWORLD`. Added `InputContext` import.

### P0 Bug Fixes (2026-03-17)
- **BUG-P0-01** — `OverworldScene.js:550` crashed on `this.gameState.party.find(...)` because `gameState.party` is `{ active, bench }`, not an array. Fixed to use `this.gameState.getMember('jesus')`. Test added.
- **BUG-P0-02** — DialogueBox rendered choices OR text, never both. When a node had both `text` and `choices` (e.g., Rabbi Q&A), `showChoices()` was called in the same frame as `open()`, causing choices to hide the question text. Fixed by deferring choices in `DialogueSystem._navigateToNode()` via `_deferredChoices` — text is fully revealed and acknowledged before choices appear. 3 tests added, 2 existing tests updated.

### Battle HUD Enhancements
- **HP-ON-HIT** — Enemy HP number now displayed for 30 frames after taking damage. BattleHUD tracks per-enemy timers via `_hpShowTimers` Map. `showEnemyHp(id)` triggered from BattleScene `_showResult()` for both damage and scripture hit types. 6 tests added.
- **FADE-VERIFY** — Victory/defeat fade overlays confirmed to already use real `globalAlpha` fades (not just timers). Victory: 30-frame fade, Defeat: 60-frame fade. P4 item was outdated.
- **NAMEPLATE-VERIFY** — 9-slice speaker name plate is not in the spec (ui-hud.md specifies plain gold text + 1px rule). Implementation matches spec. P4 item was a false gap.

### Test Coverage Gaps (P7 Audit — Batch 3)
- **TEST-05** — Follower integration tests added at OverworldScene level: creates Mary in arc 1, positions 1 tile behind player, nulls in arc 2+, feeds breadcrumbs on movement, updates each frame, nulls on arc1_complete dialogue effect. 6 tests.
- **TEST-07** — Cross-map warp integration test: player steps on warp tile, transition completes, verifies target map loaded, player at correct coordinates, location name updated. End-to-end tile-event-triggered path.
- **T10** — main.js test coverage added: validates exports, scene registration (title/battle/overworld), all 8 maps registered with correct tilesets, all 14 sprite registry entries with palette/front/back/left, gameState initialization, requestAnimationFrame called. 8 tests.

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
