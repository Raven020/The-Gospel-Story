# Implementation Plan — The Gospel Story JRPG

## Project State
- **Source code:** `src/` fully scaffolded — 83 JS files across 11 directories
- **Tests:** 555 tests passing across 39 test suites (vitest)
- **Specs:** 12 documents fully authored
- **Sprite assets:** 10 JS modules in `specs/sprites/` with pixel data for all MVP characters
- **Preview:** `specs/sprites/preview.html` renders all sprites at 8x scale
- **All 10 implementation phases COMPLETE**
- **All P0, P1, P2 audit items RESOLVED** (28 items total)
- **All P3 audit items RESOLVED** (33 items total)

---

## Remaining Work — P4 Spec Audit Findings

| ID | Item |
|----|------|
| P4.1 | **Morale system entirely missing** — spec: combat.md, party-system.md, game-design.md |
| P4.2 | **Healing Encounters not implemented** — spec: combat.md |
| P4.3 | **Debate/Riddle Battles not implemented** — spec: combat.md |
| P4.4 | **gold_bonus buff type never consulted post-battle** — Matthew's Gold Find ability has no effect |
| P4.5 | **Dialogue text box dimensions differ from spec** — code uses 240x42/38chars/2lines (ui-hud.md); dialogue-system.md specifies 224x64/26chars/3lines |
| P4.6 | **Speaker name plate uses plain text** instead of 9-slice sprite (minor visual) — spec: dialogue-system.md |
| P4.7 | **rollEncounter JSDoc says returns {enemy, rate}** but returns bare string — spec mismatch |
| P4.8 | **No temple.js tileset** (spec lists it); unspecced shoreline.js exists instead |
| P4.9 | **Tileset IDs 100–299 (detail/above layers) have zero content** |
| P4.10 | **Arc 1 player character is Jesus** — spec says Mary/Joseph for Arc 1 |
| P4.11 | **Arc 2 Satan boss fights not wired to map events** |
| P4.12 | **Five disciples have no recruitment path** — Thomas, James A., Thaddaeus, Simon Z., Judas |
| P4.13 | **Judas betrayalStat never incremented** |
| P4.14 | **No arc ordering enforcement** — players can skip arcs |

---

## Resolved Items

### P3 Fixes (spec-correctness & polish, this session)
P3.19 (evalCondition unknown op defaulted true → false), P3.20 (evalCondition undefined flag defaulted 0 → false), P3.21 (playtime counter never incremented), P3.22 (damage floater fade timing 30→40 frames), P3.23 (cursor blink suppressed in choice/action menus), P3.24 (Display missing CSS image-rendering:pixelated and canvas centering), P3.25 (DMG_MISS color token missing from Colors.js), P3.26 (BattleHUD enemy name-to-HP-bar gap 10px→5px), P3.27 (Scan ability result never rendered in BattleScene), P3.28 (status_shield buff type never checked — Bartholomew's Sincere Guard inert), P3.29 (pause overlay didn't persist beneath sub-screens), P3.30 (PartyMenu ROW_HEIGHT too small, HP bar too narrow, bench names not dimmed), P3.31 (Prayer/Miracle abilities missing bonusVsWeakness), P3.32 (AoE bonusVsWeakness checked against null instead of per-target), P3.33 (DialogueBox redundant advance arrow if-blocks).

### Earlier P3 Fixes
P3.1 (Display.js tests), P3.2 (tileset tests), P3.3 (UIChrome/Colors tests), P3.4 (EventSystem command tests), P3.5 (BattleScene sub-flow tests + target selection bug fix), P3.6 (OverworldScene gap tests), P3.7 (PauseMenu sub-menu delegation tests), P3.8 (demo.js exclusion — by design), P3.9 (ability menu drawPanel), P3.10 (AbilityCategory.SCRIPTURE — by design), P3.11 (placeholder roster members — out of scope), P3.12 (wait frame-rate — fixed timestep), P3.13 (dialogue key validation), P3.14 (warp target validation), P3.15 (Inventory.fromJSON unknown ID filtering), P3.16 (dialogue effects: playSound/playMusic/setNpcState/triggerEvent), P3.17 (enemy AI with abilities), P3.18 (dead code cleanup).

### Notable Bug Fixes
- **BattleScene target selection** — `_handleActionInput()` had `if (this._selectingTarget) return;` which silently dropped all target input. Fixed to call `_handleTargetInput()`.

---

## Spec Inconsistencies

1. **Text Box Dimensions** — Code follows `ui-hud.md`. `specs/dialogue-system.md` still has different dimensions (tracked as P4.5).
2. **Dialogue Module Paths** — Code uses `src/` prefix. `specs/dialogue-system.md` omits prefix.
3. **NPC Dialogue Keys** — NPCs use flat string keys via `OverworldScene.registerDialogue()`.
4. **Quest Flags Disconnection** — Fixed: constructor uses gameState.questFlags, loadMap() refreshes after newGame()/load().
5. **Transition Double-Update** — Fixed: removed redundant call from OverworldScene.

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
- **Enemy defense** — BattleEngine checks target.stats.def first, falls back to str
- **Enemy AI** — Basic AI: 70% attack / 30% ability; Boss AI: 50/50; enemies have themed abilities
- **Dialogue effects** — All 8 effect types fully wired (setFlag, giveItem, removeItem, recruitMember, playSound, playMusic, setNpcState, triggerEvent)

---

## Out of Scope (per `specs/mvp-scope.md`)
- Full 12-disciple roster beyond MVP 6
- Parables side quests (Arc 7+)
- Advanced mini-games
- Morale system (stubbed only)
- Native builds
- Arcs 4-16 content
- Audio playback (stubbed only)
- Gamepad / touch input
- Visual effects (Phase 6.2)
