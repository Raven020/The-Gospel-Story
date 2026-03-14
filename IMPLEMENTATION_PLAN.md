# Implementation Plan — The Gospel Story JRPG

## Project State
- **Source code:** `src/` fully scaffolded — 83 JS files across 11 directories
- **Tests:** 555 tests passing across 39 test suites (vitest)
- **Specs:** 12 documents fully authored
- **Sprite assets:** 10 JS modules in `specs/sprites/` with pixel data for all MVP characters
- **Preview:** `specs/sprites/preview.html` renders all sprites at 8x scale
- **All 10 implementation phases COMPLETE**
- **All P0, P1, P2 audit items RESOLVED** (28 items total)

---

## Remaining Work — P3 Quality & Polish

| ID | Status | Item |
|----|--------|------|
| P3.11 | Out of scope | **Three roster members have placeholder data** — `james_alphaeus`, `thaddaeus`, `simon_zealot` have `role: 'tbd'` and empty `abilities: []` arrays. Per MVP scope only Peter, Andrew, James, John, Philip, Nathanael are in MVP. |

### Resolved P3 Items (for reference)
P3.1 (Display.js tests), P3.2 (tileset tests), P3.3 (UIChrome/Colors tests), P3.4 (EventSystem command tests), P3.5 (BattleScene sub-flow tests + target selection bug fix), P3.6 (OverworldScene gap tests), P3.7 (PauseMenu sub-menu delegation tests), P3.8 (demo.js exclusion — by design), P3.9 (ability menu drawPanel), P3.10 (AbilityCategory.SCRIPTURE — by design), P3.12 (wait frame-rate — fixed timestep), P3.13 (dialogue key validation), P3.14 (warp target validation), P3.15 (Inventory.fromJSON unknown ID filtering), P3.16 (dialogue effects: playSound/playMusic/setNpcState/triggerEvent), P3.17 (enemy AI with abilities), P3.18 (dead code cleanup).

### Bug Fixes Discovered During Testing
- **BattleScene target selection was broken** — `_handleActionInput()` had `if (this._selectingTarget) return;` which silently dropped all target input. Fixed to call `_handleTargetInput()`. Without this fix, players could never confirm a target after selecting a single-enemy ability.

---

## Spec Inconsistencies — All Resolved in Code

1. **Text Box Dimensions** — Code follows `ui-hud.md`. `specs/dialogue-system.md` still has incorrect dimensions.
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
