# Implementation Plan — The Gospel Story JRPG

## Project State
- **Source code:** `src/` fully scaffolded — 83 JS files across 11 directories
- **Tests:** 575 tests passing across 40 test suites (vitest)
- **Specs:** 12 documents fully authored (4 recently amended with map-progression & Arc 1 clarifications)
- **Sprite assets:** 10 JS modules in `specs/sprites/` with pixel data for all MVP characters
- **Preview:** `specs/sprites/preview.html` renders all sprites at 8x scale
- **All 10 implementation phases COMPLETE**
- **All P0–P3 audit items RESOLVED** (61 items total)

---

## Remaining Work — P5 Comprehensive Audit (2026-03-16)

Items sorted by priority. Each is confirmed missing/broken via code search.

### P0 — Game-Breaking / Core MVP Gaps

### P1 — Core Feature Incomplete

- **P5.6 — No arc-transition cutscenes after arc*_complete flags**
  - `arc1_complete` and `arc2_complete` flags are set silently via dialogue effects
  - No closing cutscene, no scene transition, no "Jesus grows up in Nazareth" (Arc 1 close per spec)
  - No auto-warp forward after completing an arc
  - Need: register post-arc cutscene scripts that trigger on flag set; auto-warp to next arc's starting map

- **P5.7 — Defeat screen has no menu (Retry/Title)**
  - Spec requires "FALLEN" panel with "Retry from last save" and "Return to title" options
  - Current: `BattlePhase.DEFEAT` immediately calls `_onComplete('defeat', 0)` after timer → unconditional title screen
  - Spec also requires 60-frame slow fade on defeat (current: 30 frames)
  - Need: defeat menu UI in BattleScene, "retry" calls gameState.load(), 60-frame fade

- **P5.8 — Victory screen missing level-up stat reveals**
  - Spec: sequential level-up stat-increase reveals with typewriter animation, per-member display
  - Current: only shows "VICTORY" + "EXP: N", auto-advances after 2 sec or button press
  - Need: per-member level-up display with stat gains

- **P5.9 — Dialogue fast-forward on held confirm not wired**
  - `input-system.md §3`: "Fast-forward text: A (Z) held → held state"
  - `OverworldScene.update()` only checks `input.pressed(Actions.CONFIRM)`, never `input.held`
  - Need: add held-confirm path that calls `dialogue.onActionPress()` every frame while held

- **P5.11 — NPC dialogue has no post-discovery state changes (Arc 1)**
  - Temple guard, townspeople give same dialogue before and after `found_jesus_in_temple`
  - Spec says NPCs should have conditional post-discovery dialogue branches
  - Need: add condition-gated alternate dialogue trees for Arc 1 NPCs

- **P5.13 — No Options sub-screen in Pause Menu**
  - `_handleMenuSelect('options')` is a no-op in OverworldScene
  - Even minimal options (text speed, volume placeholder) would be appropriate
  - Need: basic Options screen or remove from menu

### P2 — Spec Divergence (Visible to Player)

- **P5.14 — Party screen HP bar 50px vs 60px spec; row height 18px vs 26px spec**
  - `PartyMenu` uses `ROW_HEIGHT = 18` (spec: 26) and HP bar `maxW = 50` (spec: 60)
  - Need: update constants to match ui-hud.md

- **P5.15 — Party screen renders no member sprites**
  - Spec shows a 16×16 sprite column in the party list
  - Current implementation shows only text columns
  - Need: render character sprites using `renderSprite` from `src/lib/renderSprite.js`

- **P5.16 — Enemy sprites are placeholder colored rectangles**
  - `BattleHUD.js:62` explicitly comments "Placeholder enemy sprite (colored rectangle)"
  - Need: integrate actual enemy battle sprites (64×64 per art-style.md spec)

- **P5.17 — Map `detail` and `above` layers are empty across all maps**
  - Every map has `detail = fill(W * H, 0)` and `above = fill(W * H, 0)` (except 2 boats in galilee)
  - Tileset IDs 100–299 (detail/above) have zero tile definitions in any tileset
  - Maps render completely flat with no depth layering above player sprite
  - Need: add detail/above tile definitions to tilesets; populate layers for visual depth

- **P5.18 — No temple.js tileset (spec lists it)**
  - Spec lists `temple.js` as a tileset; current code has unspecced `shoreline.js` instead
  - `temple.js` map references `tileset: 'interior'` as fallback
  - Need: create temple tileset or update spec to acknowledge interior reuse

- **P5.19 — Jordan River east warp is inside river water**
  - `jordan_river.js` places wilderness warp at column 29 (water tiles)
  - Player walks through river to enter wilderness — visually incoherent
  - Need: move warp to a ford/bridge point on land

- **P5.20 — DialogueBox text layout: 38 chars/2 lines vs spec 26 chars/3 lines**
  - Implementation follows `ui-hud.md` (240×42 box, 38 chars, 2 lines)
  - `dialogue-system.md` specifies 224×64 box, 26 chars, 3 lines
  - These specs conflict — need reconciliation decision (currently tracked as P4.5)

### P3 — Content & Data Gaps

- **P5.21 — Five disciples have no recruitment dialogue or map placement**
  - Thomas, James son of Alphaeus, Thaddaeus, Simon the Zealot, Judas
  - `partyData.js` has roster entries but no dialogue trees in `arc3.js`, no NPCs on maps
  - James A., Thaddaeus, Simon Z. have `role: 'tbd'` and `abilities: []`
  - MVP scope says only 6 disciples (Peter, Andrew, James, John, Philip, Nathanael) + Matthew is implemented as 7th
  - Need: decide if Thomas+Judas are MVP (they have abilities defined) vs post-MVP

- **P5.22 — Judas betrayalStat never incremented**
  - `betrayalStat: 0` in partyData.js, persisted in GameState serialize/deserialize
  - No code path ever increments it; Thomas's `doubt_detect` never reads it in combat
  - The entire Judas betrayal mechanic is data-only scaffolding
  - Post-MVP scope (Arc 11+), but the detection mechanic could be wired now

- **P5.23 — Mountain summit cutscene does not spawn disciple NPCs**
  - `summit_choosing` cutscene has only `fadeOut`, `dialogue`, `setFlag`, `fadeIn`
  - No `spawnNPC` commands — the "Jesus calling the twelve on the mountain" scene has no visual NPC population
  - EventSystem's `spawnNPC` command is implemented but never used anywhere

- **P5.24 — Missing quest flags for later disciples**
  - `questFlags.js` has no `recruited_thomas`, `recruited_james_alphaeus`, `recruited_thaddaeus`, `recruited_simon_zealot`, `recruited_judas`
  - These characters exist in ROSTER but their recruitment can't be tracked

- **P5.25 — Legion boss absent from enemy data**
  - `combat.md` names Legion as a boss-level demon; `enemies.js` has only `doubt`, `fear`, `temptation`, `pride`, `greed`, `deception`, `satan`
  - Post-MVP (Arc 6) but worth noting for future planning

- **P5.26 — Peter recruitment lacks "miraculous catch of fish" scene**
  - `story.md` and `mvp-scope.md` reference this; `peter_recruit` in arc3.js is pure dialogue
  - Need: at minimum, dialogue describing the miracle; ideally a cutscene event sequence

- **P5.27 — Jerusalem townspeople: 2 of 6 NPCs reuse duplicate dialogue**
  - `townsperson_4` and `townsperson_5` reference `townsperson_1` and `townsperson_3` keys
  - Need: unique dialogue for each NPC to make Jerusalem feel populated

### P4 — Polish & Minor Issues

- **P5.28 — `EventSystem.fadeOut` onMidpoint callback is a no-op lambda**
  - Line 126: `() => {}` — fadeOut events complete visually but perform no mid-transition action
  - Need: either connect to a meaningful callback or document as intentional

- **P5.29 — `exit()` methods on BattleScene and OverworldScene are empty**
  - No cleanup of input context, dialogue state, or audio on scene exit
  - Could cause stale state if scenes are switched mid-action

- **P5.30 — Dialogue effects fire synchronously on node enter, not after text reveals**
  - `dialogue-system.md` says `triggerEvent` fires "asynchronously after the current node's text completes and the player advances"
  - Current: all effects execute immediately when node is entered (before typewriter reveal starts)
  - Low impact for `setFlag`; higher impact for `triggerEvent` (cutscene fires before player reads text)

- **P5.31 — Display uses integer-only scaling (Math.floor)**
  - At certain window sizes the canvas is noticeably smaller than the window
  - Spec says "responsively scaled to fill browser window" — could use CSS transform for fractional scaling
  - Trade-off: integer scaling preserves pixel-perfect rendering

- **P5.32 — `overflow: hidden` not set on body**
  - Possible scrollbars on small windows; minor CSS fix

- **P5.33 — `clearTileCache()` never called on map load**
  - TilemapRenderer tile cache is module-level; persists across map loads
  - Risk: stale pre-baked canvases if tilesets share IDs across maps
  - Current tilesets use distinct IDs so this is latent, not active

- **P5.34 — Morale system entirely missing (MVP-scope says "stub OK")**
  - No `morale` field anywhere in GameState, ROSTER, or createMember()
  - Even a stubbed numeric field would support future integration
  - Per mvp-scope.md this can be a stub, but currently not even data-scaffolded

- **P5.35 — Healing Encounters not implemented**
  - `combat.md` defines a distinct encounter type for the sick/possessed resolved via Prayer/Miracles
  - No `HealingEncounter` scene or non-combat resolution path exists
  - Post-MVP but should be planned for Arc 4+

- **P5.36 — Debate/Riddle Battles not implemented**
  - `combat.md` defines a dialogue-tree-style battle for Pharisee/teacher confrontations
  - No debate-battle mode exists; only standard combat + scripture mini-game
  - Post-MVP but should be planned for Arc 4+

- **P5.37 — Narrative party locking not implemented**
  - Spec: "certain arcs restrict the party to only the disciples present in the biblical account"
  - No party-restriction mechanism exists; all recruited members are freely swappable
  - Post-MVP (applies mainly to Arc 8 Transfiguration: Peter/James/John only)

### Test Coverage Gaps (non-blocking but tracked)

- **T1** — `BattleScene._handleItemInput` / `_handleItemTargetInput` untested end-to-end
- **T2** — `BattleEngine` ActionType.ITEM execution path (`useItemFn` callback) never invoked in tests
- **T3** — `BattleEngine._executeEnemyAbility` with `status_shield` blocking (blocked:true path) untested
- **T4** — `BattleEngine` bonusVsWeakness 1.5x multiplier never verified in tests
- **T5** — `OverworldScene.registerMap`/`getMapEntry` zero test coverage
- **T6** — `DialogueSystem` autoAdvanceSingleChoice path untested
- **T7** — `TilemapRenderer.renderGroundLayers`/`renderAboveLayer` untested (only underlying `renderLayer` tested)
- **T8** — `GameState.getMember()` exported but never directly tested
- **T9** — OverworldScene encounter trigger via natural movement (bypassed — tests call `_triggerEncounter` directly)
- **T10** — `main.js` has zero test coverage (entry point wiring, onNewGame/onContinue handlers, playtime)
- **T11** — `demo.js` excluded from maps.test.js structural validation
- **T12** — BattleEngine enemy AI tests are probabilistic (50 iterations, no Math.random mock) — theoretically flaky

---

## Resolved Items

### P5 Fixes
- **P5.1** — Joseph+Mary are now the Arc 1 protagonists. Joseph and Mary added to ROSTER (partyData.js) with full stats/sprites. GameState.newGame() creates Joseph as party leader. Follower class implements breadcrumb-trail pattern for Mary (1-tile delay, same facing, clears on teleport). OverworldScene dynamically resolves player sprite from party leader's sprite field. transitionToArc2() swaps Joseph→Jesus when arc1_complete is set. Mary follower is removed on arc transition.
- **P5.2** — After `arc2_complete`, `temptation_3` cutscene auto-warps player to galilee (14,18) via new `warp` EventSystem command; `onWarp` callback wired in OverworldScene.
- **P5.3** — Temptation events now trigger scripture-selection boss battles via new `startBattle` EventSystem command; Satan dialogue no longer sets flags directly (flags set by cutscene after battle victory); `BattleScene._pickScriptureChallenge` selects the correct challenge per encounter.
- **P5.4** — Arc-blocked warp now shows feedback dialogue ("You're not ready to go there yet.") instead of silently returning.
- **P5.5** — Capernaum→Mountain warp now spawns player at base (`targetY: 23`) instead of summit (`targetY: 1`).
- **P5.10** — `def` stat added to all 13 ROSTER entries and all 7 enemies; STR fallback removed from `BattleEngine._doAttack`.
- **P5.12** — `temptation_3` cutscene now requires both `temptation_1_resolved` AND `temptation_2_resolved` via a `requires` array; OverworldScene enforces `requires` prerequisite guard on cutscene events.

### P4 Fixes
P4.4 (gold_bonus effectType handled in BattleEngine — applies buff, 1.5x EXP on victory), P4.7 (checkEncounterZone JSDoc corrected to string|null), P4.14 (arc ordering enforcement via MAP_ARC_REQUIREMENTS, canAccessMap(), advanceArc(), auto-advance on arc*_complete).

### P3 Fixes (spec-correctness & polish)
P3.19 (evalCondition unknown op defaulted true → false), P3.20 (evalCondition undefined flag defaulted 0 → false), P3.21 (playtime counter never incremented), P3.22 (damage floater fade timing 30→40 frames), P3.23 (cursor blink suppressed in choice/action menus), P3.24 (Display missing CSS image-rendering:pixelated and canvas centering), P3.25 (DMG_MISS color token missing from Colors.js), P3.26 (BattleHUD enemy name-to-HP-bar gap 10px→5px), P3.27 (Scan ability result never rendered in BattleScene), P3.28 (status_shield buff type never checked — Bartholomew's Sincere Guard inert), P3.29 (pause overlay didn't persist beneath sub-screens), P3.30 (PartyMenu ROW_HEIGHT too small, HP bar too narrow, bench names not dimmed), P3.31 (Prayer/Miracle abilities missing bonusVsWeakness), P3.32 (AoE bonusVsWeakness checked against null instead of per-target), P3.33 (DialogueBox redundant advance arrow if-blocks).

### Earlier P3 Fixes
P3.1–P3.18 (Display tests, tileset tests, UIChrome/Colors tests, EventSystem command tests, BattleScene tests + target selection bug, OverworldScene gap tests, PauseMenu delegation tests, ability menu drawPanel, dialogue key/warp validation, Inventory.fromJSON filtering, dialogue effects, enemy AI, dead code cleanup).

### Notable Bug Fixes
- **BattleScene target selection** — `_handleActionInput()` had `if (this._selectingTarget) return;` which silently dropped all target input. Fixed to call `_handleTargetInput()`.
- **Flaky enemy AI test** — "enemy attacks a party member" expected result always `'damage'` but enemy AI can use debuff/buff abilities (30% chance). Fixed to accept all valid result types.

---

## Spec Inconsistencies

1. **Text Box Dimensions** — Code follows `ui-hud.md` (240×42, 38 chars, 2 lines). `dialogue-system.md` specifies 224×64, 26 chars, 3 lines. Tracked as P5.20.
2. **Dialogue Module Paths** — Code uses flat string keys via `registerDialogue()`. Spec describes dynamic `import()` by module path. Current approach works; spec is aspirational.
3. **DEF stat** — RESOLVED (P5.10). DEF is now a proper stat field on all party members and enemies; STR fallback removed.
4. **Stat display labels** — Spec shows ATK/DEF in party detail; code shows STR/WIS/FAI/SPD.

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
8. Arc 2 Content (Jordan River, wilderness, Satan encounters ×3)
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
- **Dialogue string-key resolution** — OverworldScene resolves string keys to data objects from `_dialogueCache` before passing to EventSystem, both for triggerEvent and inline cutscene commands
- **EventSystem extended commands** — EventSystem now supports `startBattle` (triggers scripture-selection boss battle via callback to OverworldScene) and `warp` (teleports player to target map/coords via onWarp callback) command types
- **Cutscene prerequisites** — Cutscene events support a `requires` array of flag names; OverworldScene skips the event unless all listed flags are set in questFlags

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
