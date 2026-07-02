# 🎮 Minigame Studio

**Personalized mini-games for special moments — built by AI in minutes.**

This repository is an agent + skill toolkit for Claude Code (Fable/Opus) that
turns a client conversation into a playable, personalized browser game:

- 🎂 a birthday game where the guest of honor fights their inside jokes
- 💍 a proposal game whose final level pops the question
- 🐉 a D&D one-shot replayed as a side-scroller with the party's real characters
- 🏆 a farewell/retirement game starring the whole team

Every game ships as a **single folder you can open in a browser** — no build
step, no dependencies, no install. Send the client a zip or a link; it just runs.

## How it works

```
client prompt + notes
        │
        ▼
 /game-brief          ← interview the client, produce a structured brief
        │
        ▼
 /new-minigame        ← design → write → build → playtest, on the engine template
        │
        ▼
 playable game folder (+ AUDIT of what was personalized where)
```

The pipeline is powered by five specialized agents (`.claude/agents/`) and a
battle-tested engine template (`templates/engine/`) extracted from a real
shipped game ([Chronicles of Azurerune](https://github.com/poggig/dragon-game)):
fixed-timestep physics, party system with hero swapping, companion AI, enemy
AI archetypes (patrol/chase/static/boss with phases), dialogue + full i18n,
stealth and minigame scaffolding, pause/game-over/victory states, and a
procedural Web Audio chiptune system. **The engine is content-agnostic** —
games are defined entirely in `data.js` (stats, strings, maps) and
`scenes.js` (levels), so a new game never touches engine code.

## Quick start

1. Open this repo in Claude Code.
2. Paste the client's request and any notes, then run:
   ```
   /game-brief <client prompt + notes>
   ```
   Claude interviews you (as many questions as needed) and writes
   `briefs/<client>-brief.md`.
3. Run:
   ```
   /new-minigame briefs/<client>-brief.md
   ```
   Claude designs the GameSpec, builds the game in `games/<slug>/`,
   playtests it in a headless browser, and hands you the folder.
4. Iterate with plain requests ("make level 2 easier", "add grandma as an NPC")
   — or run `/playtest games/<slug>` after manual edits.

## Repo layout

```
.claude/
├── agents/
│   ├── client-interviewer.md   ← extracts the emotional brief from a client chat
│   ├── game-designer.md        ← brief → GameSpec (mechanics, levels, beats)
│   ├── story-writer.md         ← dialogue, personalization, i18n table
│   ├── game-builder.md         ← implements GameSpec on the engine template
│   └── playtester.md           ← drives the game in headless Chromium, reports
└── skills/
    ├── game-brief/             ← /game-brief  — client interview → brief
    ├── new-minigame/           ← /new-minigame — brief → playable game
    └── playtest/               ← /playtest   — verify any game build
templates/
├── BRIEF_TEMPLATE.md           ← what a complete client brief contains
├── GAMESPEC.md                 ← the game specification format
└── engine/                     ← the reusable engine (index.html + src/)
examples/
└── birthday-brief.md           ← a filled-in example brief
briefs/                         ← client briefs land here
games/                          ← built games land here (one folder each)
```

## The business in one paragraph

People pay for *moments*, not software. A 10-minute game where the birthday
girl's dog is a companion character and the final boss is her fear of turning
30 is a gift nobody else can give — and with this toolkit it costs minutes,
not weeks. The engine guarantees the floor (it always plays well); the agents
spend their effort on the ceiling: the personal details that make the
recipient laugh, cry, or say yes.
