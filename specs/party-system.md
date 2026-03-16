# Party System Specification

## Overview
- Player controls Jesus as the protagonist from Arc 2 onward
- **Arc 1 exception:** Arc 1 is a tutorial arc where the player controls Mary and Joseph searching for young Jesus in the Temple (Luke 2:41-52); Jesus becomes the playable protagonist starting in Arc 2
- 12 disciples serve as recruitable party members (recruited primarily in Arc 3)

## Arc 1 — Mary Following Joseph

In Arc 1 (The Boy Jesus), the player controls Joseph. **Mary must visibly follow Joseph as an NPC companion** — she walks behind him, mirroring his movement with a 1-tile delay (classic RPG party-follow behavior). This makes it immediately obvious to the player that they are controlling Joseph and Mary together as a pair searching for their son.

- Mary is rendered as a separate sprite walking 1 tile behind Joseph at all times
- She follows Joseph's exact path with a step delay (breadcrumb-trail follower pattern)
- She faces the same direction Joseph last moved
- She does not block Joseph's movement or collide with him
- If Joseph talks to an NPC, Mary stops and waits
- During cutscenes (e.g., finding Jesus in the Temple), Mary moves to stand beside Joseph

This follower behavior clearly communicates "Joseph and Mary are searching together" without requiring the player to read dialogue first.

---

## Roster
All twelve apostles are usable party members:
1. **Peter (Simon)** — Strength / fishing nets — physical damage/tank
2. **Andrew** — Recruit/Rally — support buffer, buffs and calls allies
3. **James (son of Zebedee)** — Thunder/Zeal — offensive powerhouse, high damage dealer
4. **John** — Love/Devotion — healer, healing and restoration
5. **Philip** — Inquiry — enemy analysis, reveals stats and weaknesses
6. **Bartholomew (Nathanael)** — Sincerity/Purity — cleanser, removes debuffs and status effects
7. **Matthew (Levi)** — Gold / money / resource abilities
8. **Thomas** — Doubt / detection skill (can detect hidden stats, including Judas's betrayal stat)
9. **James (son of Alphaeus)** — TBD unique ability
10. **Thaddaeus** — TBD unique ability
11. **Simon the Zealot** — TBD unique ability
12. **Judas Iscariot** — Hidden "betrayal" stat; leaves party permanently in Arc 11

## Active Party
- Active party size: 5 (Jesus + 4 disciples), Pokemon-style
- Remaining disciples on the bench, swappable outside of combat
- Narrative party locking: certain story arcs restrict the party to only the disciples present in the biblical account (e.g., Peter, James, and John at the Transfiguration)

## Judas Mechanic
- Judas has a hidden "betrayal" stat invisible to the player by default
- Thomas's doubt/detection skill can sense something is off about Judas, rewarding observant players
- Judas leaves the party during the Last Supper (Arc 11) and becomes an antagonist in Arc 12

## Morale System
- Player choices throughout the game affect party morale
- **Meaningful consequences:** wrong choices create noticeable combat difficulty shifts, lock out some dialogue options, and visibly drop party morale. Players feel the weight of choices but can always recover.
- Morale influences combat effectiveness and dialogue options
- Key morale events: Sermon on the Mount choices (Arc 5), moral choice encounters, Scripture-selection results
