# Operational Notes

## Running the app
Open `index.html` in a browser (file:// or local server). No build step needed.

## Running tests
```bash
npx vitest run        # single run
npx vitest            # watch mode
```

## Project structure
- `src/engine/` — GameLoop, Display, SceneManager, TransitionManager, Camera, TilemapRenderer
- `src/systems/` — InputSystem, Player, NPCManager, DialogueSystem, GameState, BattleEngine, EventSystem
- `src/scenes/` — TitleScene, OverworldScene, BattleScene
- `src/ui/` — DialogueBox, PauseMenu, BattleHUD, PartyMenu, ItemMenu, SaveLoadMenu, UIChrome, Colors
- `src/data/` — partyData, inventory, questFlags, enemies, abilities, scriptures
- `src/data/dialogue/` — arc1, arc2, arc3 dialogue trees
- `src/maps/` — demo, jerusalem, temple, jordan_river, wilderness, galilee, capernaum, mountain
- `src/tilesets/` — overworld, interior, desert, shoreline
- `src/lib/` — renderSprite, drawText
- `src/font/` — fontData (5x7 bitmap glyphs)
- `src/audio/` — AudioManager (stub, no-op methods)
- `specs/` — design specifications and sprite data modules
