# Implementation Plan — The Gospel Story JRPG

## Project State
- **Source code:** `src/` fully scaffolded — 83 JS files across 11 directories
- **Tests:** 604 tests passing across 42 test suites (vitest)
- **Specs:** 12 documents fully authored (4 recently amended with map-progression & Arc 1 clarifications)
- **Sprite assets:** 10 JS modules in `specs/sprites/` with pixel data for all MVP characters
- **Preview:** `specs/sprites/preview.html` renders all sprites at 8x scale
- **All 10 implementation phases COMPLETE**
- **All P0–P3 audit items RESOLVED** (61 items total)

---

## Remaining Work — P6 Comprehensive Audit (2026-03-16)

Items sorted by priority. Each is confirmed missing/broken via code search.

### P2 — Spec Divergence (Visible to Player)

- **P5.16 — Enemy sprites are placeholder colored rectangles**
  - `BattleHUD.js:62` explicitly comments "Placeholder enemy sprite (colored rectangle)"
  - `#8B0000` for bosses, `#604080` for generic enemies — no real art integrated
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

- **P5.20 — RESOLVED. See Resolved Items / Spec Inconsistencies.**

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
  - `summit_choosing` cutscene has only `fadeOut`, `dialogue`, `setFlag`, `dialogue`, `fadeIn`
  - No `spawnNPC` commands — the "Jesus calling the twelve on the mountain" scene has no visual NPC population
  - EventSystem's `spawnNPC` command is implemented but never used anywhere in the codebase

- **P5.24 — Missing quest flags for later disciples**
  - `questFlags.js` has no `recruited_thomas`, `recruited_james_alphaeus`, `recruited_thaddaeus`, `recruited_simon_zealot`, `recruited_judas`
  - These characters exist in ROSTER but their recruitment can't be tracked

- **P5.25 — Legion boss absent from enemy data**
  - `combat.md` names Legion as a boss-level demon; `enemies.js` has only `doubt`, `fear`, `temptation`, `pride`, `greed`, `deception`, `satan`
  - Post-MVP (Arc 6) but worth noting for future planning

- **P5.26 — Peter recruitment lacks "miraculous catch of fish" scene**
  - `story.md` and `mvp-scope.md` reference this; `peter_recruit` in arc3.js is pure dialogue (3 nodes)
  - No cutscene commands, no visual event, no sound effects
  - Need: at minimum, dialogue describing the miracle; ideally a cutscene event sequence with fadeOut/spawnNPC/dialogue

### P4 — Polish & Minor Issues

- **P5.28 — `EventSystem.fadeOut` onMidpoint callback is a no-op lambda**
  - Line 129: `() => {}` — fadeOut events complete visually but perform no mid-transition action
  - Need: either connect to a meaningful callback or document as intentional

- **P5.29 — `exit()` methods on BattleScene and OverworldScene are empty**
  - No cleanup of input context, dialogue state, or audio on scene exit
  - Could cause stale state if scenes are switched mid-action

- **P5.31 — Display uses integer-only scaling (Math.floor)**
  - At certain window sizes the canvas is noticeably smaller than the window
  - Spec says "responsively scaled to fill browser window" — could use CSS transform for fractional scaling
  - Trade-off: integer scaling preserves pixel-perfect rendering — likely intentional

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

- **P6.8 — EventSystem._cameraOverride accessed as private field from OverworldScene**
  - `OverworldScene.update()` reads `this.eventSystem._cameraOverride` directly
  - Encapsulation violation; if field is renamed, overworld silently breaks
  - Need: add a public getter on EventSystem (e.g., `get cameraOverride()`)

- **P6.9 — `DMG_MISS` color token defined but never used**
  - `Colors.js` defines `DMG_MISS: '#F8F8F8'` but no code references it
  - BattleScene/BattleHUD should use it for miss floaters

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

### P6 Fixes
- **P6.7** — `arc2_started` moved from arc2.js baptism_complete node to arc1.js arc1_transition.start, so the flag is set when Arc 2 begins rather than when baptism completes.
- **P6.6** — `arc1_started` flag is now set in main.js onNewGame handler, resolving the declared-but-never-set gap.
- **P6.5** — RESOLVED for MVP. All 14 MVP sprite keys (jesus, joseph, mary, young_jesus, 7 disciples, john_baptist, 2 townspeople) are properly registered in the sprite registry. 5 post-MVP disciple sprites (thomas, james_alphaeus, thaddaeus, simon_zealot, judas) are data-only stubs.
- **P6.4** — Wisdom Q&A implemented as dialogue-tree variant in young_jesus dialogue (arc1.js). Three questions covering Deut 6:5, Isaiah 9:6, Micah 5:2 with correct/wrong answer paths. wisdom_qa_complete flag gates replay. Non-blocking wrong answers per spec.
- **P6.1** — SaveLoadMenu.onLoad now wired in OverworldScene constructor. _reloadFromSave() fades to black, looks up saved map in _mapRegistry, calls loadMap() with restored coordinates and facing. Pattern matches existing _handleRetry() approach.
- **P6.2** — Held-confirm fast-forward now only accelerates typewriter reveal. When dialogue box text is fully revealed, held confirm is ignored — only a fresh press advances to the next node. Prevents dialogue from auto-skipping through entire sequences.
- **P5.13** — OptionsMenu implemented with Text Speed (Slow/Normal/Fast), BGM toggle, and SFX toggle. gameSettings singleton drives DialogueBox typewriter speed. Wired into PauseMenu via standard sub-menu pattern.
- **P6.3** — Objective marker rendered at (4,4) on overworld HUD. getCurrentObjective() derives text from questFlags — covers all arc 1-3 progression states. Hidden during dialogue, menus, battles, and location name display. Font extended with > and < glyphs.

### P5 Fixes
- **P5.33** — `clearTileCache()` is now called at the start of `OverworldScene.loadMap()`, preventing stale pre-baked tile canvases from persisting across map transitions.
- **P5.30** — DialogueSystem effects are now deferred until the player advances past the node. A `_pendingEffects` array accumulates effects on node enter; they flush when the dialogue reaches 'done' or a choice result is selected. Action nodes (triggerEvent etc.) still execute immediately as per spec.
- **P5.19** — Jordan River east warp moved from column 29 (water) to column 23 (sandy bank edge, tile 4) rows 9-10. The manual collision override that opened water tiles was removed. `wilderness.js` return warp target updated from x=28 (water) to x=22 (sandy bank).
- **P5.15** — PartyMenu now renders 16×16 member sprites in both the list and detail views using `renderSprite`. `spriteRegistry` is passed down through the PauseMenu constructor chain so PartyMenu can access character pixel data.
- **P5.14** — PartyMenu `ROW_HEIGHT` updated from 18 to 26 and HP/SP bar `maxW` updated from 50 to 60, matching the ui-hud.md spec.
- **P5.1** — Joseph+Mary are now the Arc 1 protagonists. Joseph and Mary added to ROSTER (partyData.js) with full stats/sprites. GameState.newGame() creates Joseph as party leader. Follower class implements breadcrumb-trail pattern for Mary (1-tile delay, same facing, clears on teleport). OverworldScene dynamically resolves player sprite from party leader's sprite field. transitionToArc2() swaps Joseph→Jesus when arc1_complete is set. Mary follower is removed on arc transition.
- **P5.2** — After `arc2_complete`, `temptation_3` cutscene auto-warps player to galilee (14,18) via new `warp` EventSystem command; `onWarp` callback wired in OverworldScene.
- **P5.3** — Temptation events now trigger scripture-selection boss battles via new `startBattle` EventSystem command; Satan dialogue no longer sets flags directly (flags set by cutscene after battle victory); `BattleScene._pickScriptureChallenge` selects the correct challenge per encounter.
- **P5.4** — Arc-blocked warp now shows feedback dialogue ("You're not ready to go there yet.") instead of silently returning.
- **P5.5** — Capernaum→Mountain warp now spawns player at base (`targetY: 23`) instead of summit (`targetY: 1`).
- **P5.7** — Defeat screen now shows a "FALLEN" panel with 60-frame slow fade, flavor text, and a two-option menu: "Retry from last save" (loads most recent save via GameState) and "Return to title". OverworldScene handles 'retry' result by finding latest save slot and restoring full game state. Defeat no longer auto-advances to title.
- **P5.8** — Victory screen now awards EXP inside BattleScene (via gainExp), displays per-member level-up stat reveals with typewriter animation (2 chars/frame), and shows aggregated stat gains. Panel renders after a 30-frame fade to black. Player presses Z to advance through each member's level-ups, or auto-advances after 3 seconds of inactivity. OverworldScene no longer duplicates EXP awarding.
- **P5.10** — `def` stat added to all 13 ROSTER entries and all 7 enemies; STR fallback removed from `BattleEngine._doAttack`.
- **P5.12** — `temptation_3` cutscene now requires both `temptation_1_resolved` AND `temptation_2_resolved` via a `requires` array; OverworldScene enforces `requires` prerequisite guard on cutscene events.
- **P5.6** — Arc-transition cutscenes now fully implemented. Arc 1→2 has fadeOut + narrator dialogue ("years passed in Nazareth") + warp to jordan_river. Arc 2→3 has angel_minister dialogue + narrator transition ("returned to Galilee in the power of the Spirit") + warp to galilee. Arc 3 ending has mountain commission dialogue + narrator closing ("the twelve were chosen") + fadeIn. All transition dialogue defined in arc1.js, arc2.js, arc3.js; cutscene sequences in wilderness.js and mountain.js.
- **P5.9** — Dialogue fast-forward on held confirm now wired. OverworldScene checks `input.held(Actions.CONFIRM)` in addition to `input.pressed()`, calling `dialogue.onActionPress()` every frame while held.
- **P5.11** — NPC post-discovery dialogue implemented for all Arc 1 NPCs. DialogueSystem enhanced with `conditionFail` field on nodes — when a node's condition is false, navigates to `conditionFail` instead of `next`. All 7 Arc 1 NPCs (townsperson 1-5, temple guard, temple teachers 1-2, mary_worried) now have post-`found_jesus_in_temple` dialogue variants.
- **P5.27** — Jerusalem townsperson_4 and townsperson_5 now have unique dialogue trees instead of reusing townsperson_1/townsperson_3 keys.
- **P5.32** — RESOLVED. `overflow: hidden` is set on both `html` and `body` in `index.html`.

### Pre-existing Test Bug Fix
- "pending arc cutscene fires after dialogue closes" test needed two confirm presses (typewriter skip + advance), not one.

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

1. **Text Box Dimensions** — RESOLVED (P5.20). `dialogue-system.md` updated to match `ui-hud.md` and implementation: 240×42 box, 38 chars/line, 2 lines per page. Full-width box is standard for 240px-wide GBA-style games.
2. **Dialogue Module Paths** — Code uses flat string keys via `registerDialogue()`. Spec describes dynamic `import()` by module path. Current approach works; spec is aspirational.
3. **DEF stat** — RESOLVED (P5.10). DEF is now a proper stat field on all party members and enemies; STR fallback removed.
4. **Stat display labels** — Spec shows ATK/DEF in party detail; code shows STR/WIS/FAI/SPD.
5. **Duplicate `greet` key in dialogue-system.md §9 example** — The Miriam example has two `greet` nodes in the same object literal. Second silently overwrites first. Not a runtime bug (it's spec example code) but misleading.

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
- **Text speed** — configurable via Options menu (1/2/4 chars per frame); gameSettings singleton replaces hardcoded CHARS_PER_FRAME
- **Sprite registry** — passed from OverworldScene through PauseMenu to PartyMenu for consistent character rendering across overworld and menus

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
