# Game Design Specification

## Genre
- Web-based retro JRPG
- GBA-era Pokemon visual style
- Top-down exploration with turn-based spiritual combat

## Core Design Pillars
1. **Faithful to Scripture** — The game remains reverent and accurate to the biblical text
2. **Providence over agency** — Player choices affect stats and morale, never the story outcome
3. **Spiritual metaphor** — All combat and conflict represents spiritual reality, not literal violence
4. **Accessible** — Tutorial arc (Arc 1) onboards players into mechanics naturally

## Exploration
- Top-down overworld in the style of Pokemon GBA games
- Town and dungeon pairs for each story arc
- Route system connecting locations (Pokemon-style paths with encounters, NPCs, and items)
- NPC dialogue with branching dialogue trees
- Environmental interaction and discovery
- Random encounters (Pokemon tall-grass style) on routes and in dungeons

## Mini-Game Systems

### MVP Mini-Games (Arcs 1-3)
1. **Wisdom Q&A** — Temple teachers challenge; choose correct answers in a dialogue-battle format (Arc 1)
2. **Scripture-Selection Boss Fights** — Choose the right verse to counter Satan's temptations; wrong choices affect stats, not progression (Arc 2)
3. **Disciple Recruitment** — Encounter and recruit party members through story events (Arc 3)

### Future Mini-Games (Arcs 4+)
- Resource transformation (Wedding at Cana)
- Crowd/chase sequences (Temple cleansing)
- Stealth/escape events (Nazareth rejection)
- Ship navigation (Calming the storm)
- Resource management (Feeding the 5,000)
- Platformer sequences (Walking on water / faith meter)
- Fishing (Sea of Galilee)
- Quick-time events (Trials, Crucifixion arcs)
- Parade/escort sequences (Triumphal Entry)

## Progression
- Story-driven linear progression through 16 arcs
- Optional side quests (primarily parables in Arc 7)
- Party growth through disciple recruitment and stat development
- Morale system influenced by player choices

### Map Progression (CRITICAL)
**The player must always be able to leave every map and progress to the next area.** Every map must have clearly reachable exit warps. After completing an area's objectives, the path forward must be obvious — either via an automatic transition or a clearly indicated exit. A map that traps the player is a game-breaking bug and must be treated as a P0 issue. See `tilemap-format.md` §12 for detailed requirements.

## Tone
- Reverent but engaging — not preachy
- Emotional weight in later arcs (Trials, Crucifixion, Resurrection)
- Moments of levity and warmth in early/mid arcs
- Post-resurrection world shift: brighter visuals, changed tone
