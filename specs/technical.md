# Technical Specification

## Rendering Engine
- Custom canvas/WebGL implementation — no third-party game engine
- Full control over rendering pipeline and game loop

## Art Style
- GBA-era pixel art, modeled after Pokemon (Fire Red / Emerald generation)
- Top-down overworld perspective
- Sprite sizes: ~16x16 tiles, 16x32 character sprites
- Clean pixel art with limited palette per sprite/tileset

## Display
- Fixed internal resolution: 240x160 (GBA-native)
- Responsively scaled to fill the browser window (nearest-neighbor interpolation)
- Maintain 3:2 aspect ratio when scaling, centered with black bars/decorative border
- Crisp nearest-neighbor pixel scaling (no anti-aliasing/blurring)
- `image-rendering: pixelated` / `crisp-edges` on all canvases

## Platform
- Web-based (runs in modern browsers)
- No native builds planned for MVP

## Save System
- Free save anywhere
- Save state includes: current arc/position, party composition, stats, morale, inventory, quest flags
- LocalStorage for persistence (sufficient for MVP save data)
