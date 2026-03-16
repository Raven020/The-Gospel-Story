# Dialogue System Specification

## Overview

The dialogue system drives all NPC interaction, story cutscenes, and branching narrative events. It operates as a tree of **nodes** where each node represents one screen of text (one speaker, one page). Dialogue data lives in plain ES module files; the engine loads and walks the tree at runtime. No build step is required.

---

## 1. Dialogue Data Format

Each dialogue tree is a named export from a JS module. The engine imports trees lazily by key. All dialogue files live under `data/dialogue/`.

```js
// data/dialogue/arc1/townsperson_miriam.js

export const miriam = {
  root: "greet_default",
  nodes: {
    greet_default: { /* ... */ },
    greet_seen_temple: { /* ... */ },
    // ...
  }
};
```

The `root` field is the id of the starting node. The engine always begins traversal there unless a calling context overrides it (e.g. a cutscene jumping mid-tree).

**NPC entity data** references its dialogue by module path and export name:

```js
// data/npcs/arc1_npcs.js
export const npcs = [
  {
    id: "miriam",
    name: "Miriam",
    sprite: "npc_woman_a",
    dialogueModule: "arc1/townsperson_miriam",
    dialogueKey: "miriam",
  },
  // ...
];
```

The dialogue system resolves `dialogueModule` via a dynamic import (`import('./data/dialogue/' + module + '.js')`), then reads the named export identified by `dialogueKey`.

---

## 2. Node Structure

Every node in the `nodes` object follows this shape:

```js
{
  id: String,           // matches its key in nodes{}; redundant but useful for validation
  speaker: String,      // display name shown above the text box; "" for narration
  text: String,         // full text for this page; auto-wrapped and paginated at runtime
  next: String | null,  // id of next node after player advances (null = end dialogue)
  choices: Array,       // if non-empty, player selects; overrides `next`
  effects: Array,       // side effects applied when this node is displayed (see §6)
  condition: Object,    // if present, node is skipped when condition is false (see §3)
}
```

Rules:
- If `choices` is a non-empty array, `next` is ignored. The player must pick a choice.
- If `choices` is empty (or absent), `next` drives progression.
- `next: null` closes the dialogue box and returns control to the player.
- A node with no `text` and only `effects` is a silent "action node" — effects fire and the system immediately advances to `next`.

### Choice Object

```js
{
  text: String,         // label shown in the choice menu (≤ ~28 chars for GBA width)
  next: String | null,  // node to jump to when chosen
  condition: Object,    // optional — hide this choice when condition is false (see §3)
}
```

Choice arrays support 2–4 entries. The engine renders them as a vertical menu below the text box using the same 8px font and a cursor sprite.

---

## 3. Conditions

Conditions gate whether a node (or individual choice) is shown. They compare a named quest flag against a literal value.

### Condition Object

```js
{
  flag: String,                   // quest flag name, e.g. "found_jesus_in_temple"
  op:   "eq" | "neq" | "gt" | "lt" | "gte" | "lte",
  value: Boolean | Number,        // the right-hand side of the comparison
}
```

### Evaluation

```js
// engine/dialogue/conditionEval.js
export function evalCondition(condition, questFlags) {
  if (!condition) return true;
  const actual = questFlags[condition.flag] ?? false;
  const { op, value } = condition;
  switch (op) {
    case "eq":  return actual === value;
    case "neq": return actual !== value;
    case "gt":  return actual >   value;
    case "lt":  return actual <   value;
    case "gte": return actual >=  value;
    case "lte": return actual <=  value;
    default:    return false;
  }
}
```

### Node-Level Condition (skip logic)

When the system resolves which node to display next, it checks the target node's `condition`. If the condition is false, the engine automatically follows that node's `next` without displaying it. This chain continues until a node passes its condition or `next` is null.

This lets writers insert "invisible" bridging nodes that set flags or skip content based on game state without cluttering visible dialogue flow.

### Choice-Level Condition (hide logic)

Before rendering the choice menu, the engine filters the choices array: any choice whose `condition` evaluates to false is removed. The remaining choices are displayed. If filtering reduces choices to one, the engine can optionally auto-advance rather than show a single-option menu (configurable per-tree via `autoAdvanceSingleChoice: true`).

---

## 4. Text Features

### 4a. Typewriter Reveal

Text renders character by character at a configurable rate (default: 2 characters per frame at 60 fps, i.e. ~30 chars/sec). The engine maintains a `revealIndex` counter incremented each frame.

- Pressing the action button while text is revealing **snaps** it to fully revealed instantly.
- Pressing the action button again after full reveal **advances** to the next node.

### 4b. Auto Line-Wrap

The text box renders at internal resolution. The box is **240 × 42 px** (full screen width, positioned at y=118). Inner padding is 2 px on all sides. Using the 5×7 bitmap font with 6 px cell width (see `ui-hud.md` §1), each line holds `floor((240 - 8) / 6)` = **38 characters**. The engine pre-processes `text` strings into wrapped lines before revealing begins.

Word-wrap algorithm: split text on spaces, accumulate words into a line until adding the next word would exceed 38 chars, then start a new line. Hard `\n` characters in the source string force a line break.

### 4c. Multi-Page Splitting

The text box displays **2 lines at a time** (below the speaker name row). If wrapped text exceeds 2 lines, the engine splits it into pages of 2 lines each. After the player advances past the last character on a page, a down-arrow indicator pulses in the bottom-right corner of the text box. Pressing the action button loads the next page of the same node. Only after the final page does the system advance to `next` or show the choice menu.

Page boundaries are computed at load time from the wrapped line array: `pages = chunk(lines, 2)`.

---

## 5. Speaker Display

A name tag is drawn directly above the left edge of the text box. It uses a 9-slice NPC-name-plate sprite and the 8px font in a highlight color distinct from body text.

Rules:
- `speaker: ""` — name plate is not rendered (used for narration or divine voice).
- `speaker: "???"` — name plate shows "???" for unknown speakers.
- The name plate width scales to fit the speaker string (min 48 px, max 112 px).

Speaker identity does not need to match any loaded entity; it is a pure display string.

---

## 6. Side Effects

The `effects` array on a node lists operations applied immediately when the node is first entered (before text begins revealing). Effects do not repeat if the player returns to the same node via save/load of dialogue state.

### Effect Object

```js
{ type: String, ...params }
```

### Supported Effect Types

| type | params | description |
|---|---|---|
| `"setFlag"` | `flag: String, value: Boolean\|Number` | Write to quest flags |
| `"giveItem"` | `item: String, qty: Number` | Add item(s) to inventory |
| `"removeItem"` | `item: String, qty: Number` | Remove item(s) from inventory |
| `"recruitMember"` | `memberId: String` | Add party member |
| `"triggerEvent"` | `eventId: String` | Fire a named engine event (cutscene, transition, battle, etc.) |
| `"playSound"` | `soundId: String` | Play a one-shot sound effect |
| `"playMusic"` | `trackId: String` | Transition to a new music track |
| `"setNpcState"` | `npcId: String, state: String` | Change NPC sprite/behaviour state |

Effects execute in array order. `triggerEvent` fires asynchronously after the current node's text completes and the player advances, so it does not interrupt typewriter reveal.

### Example

```js
// Recruiting Andrew as a party member
{
  id: "andrew_joins",
  speaker: "Andrew",
  text: "Then I will follow you.",
  next: "andrew_joins_narration",
  effects: [
    { type: "setFlag",     flag: "recruited_andrew", value: true },
    { type: "recruitMember", memberId: "andrew" },
    { type: "playSound",   soundId: "party_join_chime" },
  ],
  choices: [],
}
```

---

## 7. NPC Dialogue Lookup

### Flow

1. Player presses the action button facing an NPC.
2. The engine reads the NPC entity's `dialogueModule` and `dialogueKey`.
3. The engine calls `DialogueSystem.open(dialogueModule, dialogueKey)`.
4. `DialogueSystem` dynamically imports the module (cached after first load).
5. The tree's `root` node id is resolved, and the engine enters the main dialogue loop.
6. When `next === null` on a terminal node, `DialogueSystem.close()` is called and control returns to the overworld.

### DialogueSystem API (engine-facing)

```js
// engine/dialogue/DialogueSystem.js

export class DialogueSystem {
  constructor(questFlags, inventory, party, eventBus) { ... }

  async open(modulePath, exportKey, startNodeId = null) { ... }
  // startNodeId overrides tree.root — used by cutscenes mid-tree

  close() { ... }

  // Called each frame by the game loop
  update(dt) { ... }

  // Called by input handler on action button press
  onActionPress() { ... }

  // Called by input handler on directional input (choice cursor)
  onDirectional(dir) { ... }

  get isOpen() { return this._open; }
}
```

`DialogueSystem` is instantiated once and shared across the game session. It holds references to `questFlags`, `inventory`, `party`, and an `EventBus` so effects can be applied without tight coupling to individual subsystems.

---

## 8. Rendering Architecture

The dialogue UI draws to the main canvas on top of the overworld layer each frame while `DialogueSystem.isOpen` is true.

```
Canvas layers (bottom to top):
  [0] Tilemap (background)
  [1] Sprites (NPCs, player)
  [2] Dialogue UI (text box, name plate, choice menu, cursor)
```

The dialogue renderer is a standalone module (`engine/dialogue/DialogueRenderer.js`) that receives the current display state from `DialogueSystem` each frame:

```js
{
  speakerName: String,
  lines: String[],        // current page's wrapped lines (max 2)
  revealIndex: Number,    // total chars revealed so far on this page
  totalChars: Number,     // total chars on this page
  hasMorePages: Boolean,
  choices: Array | null,  // filtered choices ready to render
  selectedChoice: Number, // cursor index
}
```

---

## 9. Complete Example — Arc 1 Townsperson

This tree models **Miriam**, a townsperson in Jerusalem. She has default dialogue, a special branch if the player has already found Jesus (`found_jesus_in_temple`), and a conditional choice that only appears if the player has talked to the temple guard (`talked_to_temple_guard`).

```js
// data/dialogue/arc1/townsperson_miriam.js

export const miriam = {
  root: "greet",
  nodes: {

    // Entry point — condition routes to different greet based on game state
    greet: {
      id: "greet",
      speaker: "",
      text: "",
      next: "greet_seen_temple",
      condition: { flag: "found_jesus_in_temple", op: "eq", value: true },
      choices: [],
      effects: [],
    },

    // Fallback entry when jesus has NOT been found yet
    // (greet's condition fails → it skips to its own next, but we need
    // the pre-found path as the actual display. Use a redirect node.)
    // Better pattern: make greet the visible pre-found node directly:

    greet: {
      id: "greet",
      speaker: "Miriam",
      text: "Welcome to Jerusalem, pilgrim! The city is full for Passover. Have you lost someone? I saw a woman weeping near the south gate.",
      next: "greet_choice",
      condition: null,
      choices: [],
      effects: [],
    },

    greet_choice: {
      id: "greet_choice",
      speaker: "Miriam",
      text: "Can I help you find your way?",
      next: null,
      condition: null,
      choices: [
        {
          text: "We are searching for our son.",
          next: "ask_about_boy",
          condition: null,
        },
        {
          text: "Have you seen a boy, about twelve?",
          next: "ask_about_boy",
          condition: null,
        },
        {
          text: "Did you hear about the Temple teachers?",
          next: "ask_about_temple",
          condition: { flag: "talked_to_temple_guard", op: "eq", value: true },
        },
        {
          text: "No, thank you.",
          next: "farewell",
          condition: null,
        },
      ],
      effects: [],
    },

    ask_about_boy: {
      id: "ask_about_boy",
      speaker: "Miriam",
      text: "A boy? There are thousands of children here for the feast.",
      next: "ask_about_boy_2",
      condition: null,
      choices: [],
      effects: [],
    },

    ask_about_boy_2: {
      id: "ask_about_boy_2",
      speaker: "Miriam",
      text: "Though — I did hear something. The teachers at the Temple have been in quite an uproar. Something about a young boy asking questions none of them could answer.",
      next: "ask_about_boy_3",
      condition: null,
      choices: [],
      effects: [
        { type: "setFlag", flag: "heard_about_temple_boy", value: true },
      ],
    },

    ask_about_boy_3: {
      id: "ask_about_boy_3",
      speaker: "Miriam",
      text: "You might try the Temple courts. Just follow the main road north.",
      next: null,
      condition: null,
      choices: [],
      effects: [],
    },

    ask_about_temple: {
      id: "ask_about_temple",
      speaker: "Miriam",
      text: "Oh, I heard the commotion! The guard said there is a child who has been sitting with the teachers for three days. They say his understanding is beyond his years.",
      next: "ask_about_temple_2",
      condition: null,
      choices: [],
      effects: [],
    },

    ask_about_temple_2: {
      id: "ask_about_temple_2",
      speaker: "Miriam",
      text: "Three days! His poor mother must be beside herself. Go quickly — the Temple is straight north.",
      next: null,
      condition: null,
      choices: [],
      effects: [
        { type: "setFlag", flag: "miriam_gave_directions", value: true },
      ],
    },

    farewell: {
      id: "farewell",
      speaker: "Miriam",
      text: "God's peace be with you, pilgrim.",
      next: null,
      condition: null,
      choices: [],
      effects: [],
    },

    // Post-discovery branch — shown after jesus has been found
    greet_seen_temple: {
      id: "greet_seen_temple",
      speaker: "Miriam",
      text: "I heard you found your son safe in the Temple! Praise God. What a remarkable boy.",
      next: "greet_seen_temple_2",
      condition: { flag: "found_jesus_in_temple", op: "eq", value: true },
      choices: [],
      effects: [],
    },

    greet_seen_temple_2: {
      id: "greet_seen_temple_2",
      speaker: "Miriam",
      text: "The teachers are still talking about him. Whatever he said left quite an impression.",
      next: null,
      condition: null,
      choices: [],
      effects: [],
    },

  },
};
```

> Note on the `greet` redirect pattern: when a tree has two entry paths, the cleanest approach is to check the condition in the engine before entering and pass a `startNodeId` override, rather than using an empty redirect node. Cutscene scripts and NPC interaction code may pass `startNodeId: "greet_seen_temple"` directly when `questFlags.found_jesus_in_temple === true`. The `root` field then serves as the default (pre-discovery) entry only.

---

## 10. File & Module Layout

```
data/
  dialogue/
    arc1/
      townsperson_miriam.js
      temple_teacher_eli.js
      joseph.js           ← playable character dialogue (cutscene)
      mary.js
    arc2/
      john_the_baptist.js
      satan_temptation.js
    arc3/
      peter_recruitment.js
      andrew_recruitment.js
      james_john_recruitment.js
      philip_nathanael.js

engine/
  dialogue/
    DialogueSystem.js     ← main state machine and public API
    DialogueRenderer.js   ← canvas draw calls each frame
    conditionEval.js      ← pure condition evaluation
    effectApply.js        ← effect dispatch
    textWrap.js           ← word-wrap and page-split utilities
```

---

## 11. Quest Flag Conventions

All quest flags live in a single flat object in game save state (`save.questFlags`). Naming convention: `snake_case`, prefixed by arc where relevant.

| Flag | Type | Set When |
|---|---|---|
| `heard_about_temple_boy` | Boolean | Miriam or other NPC mentions the Temple boy |
| `talked_to_temple_guard` | Boolean | Player speaks to the guard at the Temple entrance |
| `found_jesus_in_temple` | Boolean | Player reaches the Temple inner court cutscene |
| `baptism_complete` | Boolean | Baptism visual event triggers |
| `temptation_1_resolved` | Boolean | First Satan encounter ends |
| `temptation_2_resolved` | Boolean | Second Satan encounter ends |
| `temptation_3_resolved` | Boolean | Third Satan encounter ends |
| `recruited_peter` | Boolean | Peter joins the party |
| `recruited_andrew` | Boolean | Andrew joins the party |
| `recruited_james` | Boolean | James joins the party |
| `recruited_john` | Boolean | John joins the party |
| `recruited_philip` | Boolean | Philip joins the party |
| `recruited_nathanael` | Boolean | Nathanael joins the party |

Numeric flags are used for morale scores, stat deltas from choices, and multi-step quest stages (e.g. `disciples_recruited_count: Number`).

---

## 12. Design Constraints & Notes

- **No build tools**: All module imports use standard ES module `import` syntax or dynamic `import()`. Module paths must be relative to the web root.
- **Internal resolution**: All UI coordinates are in 240×160 space. The renderer scales to viewport using the same integer-scaling logic as the rest of the engine.
- **Font**: 8px pixel font, monospace. Character cell width = 8 px (including 1 px letter-spacing). Used for both body text and choice labels.
- **Action button**: Mapped to `Z` (keyboard) or `A` (gamepad). Advances text, selects choices.
- **Cancel / Back**: There is no "back" in dialogue. Once started, the player can only advance or select. This is intentional — it preserves narrative flow and avoids dialogue tree edge cases.
- **Dialogue during cutscenes**: Cutscenes use the same `DialogueSystem` API but pass `startNodeId` explicitly and may lock player input between nodes. The system does not distinguish between NPC dialogue and cutscene dialogue at the data level.
- **Localization**: Future-proofed by keeping all user-visible strings inside dialogue data files. Speaker names and text strings should not be embedded in engine code.

---

## 13. Known Issues

| ID | Description | Status |
|---|---|---|
| DLG-BUG-01 | Dialogue sequences are being automatically skipped — the system advances through nodes without waiting for player input, causing players to miss dialogue text entirely. The typewriter reveal and/or advance logic is not gating on an explicit action button press before moving to the next node. | Resolved |
