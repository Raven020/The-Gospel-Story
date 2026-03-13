# Operational Notes

## Running the app
Open `index.html` in a browser (file:// or local server). No build step needed.

## Running tests
```bash
npx vitest run        # single run
npx vitest            # watch mode
```

## Project structure
- `src/engine/` — GameLoop, Display, SceneManager, TransitionManager
- `src/systems/` — InputSystem
- `src/lib/` — renderSprite utility
- `src/audio/` — AudioManager (stub)
- `src/` — main.js entry point
- `specs/` — design specifications
- `specs/sprites/` — pixel art sprite data modules
