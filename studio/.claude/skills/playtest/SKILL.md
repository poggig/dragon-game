---
name: playtest
description: Verify a built game end-to-end in headless Chromium - boot, levels, physics, combat, win/lose paths, pause, i18n. Use before delivering any game and after any nontrivial edit. Args - path to the game folder (e.g. games/sofia-bday-30).
---

# /playtest — verify a game build

1. Launch the **playtester** agent on the folder given in args (default:
   the most recently modified folder under `games/`).
2. Relay the verdict to the user: the pass/fail table from
   `games/<slug>/PLAYTEST.md` plus screenshots.
3. On failures, offer to fix: send the report to the **game-builder** agent
   and re-run until green (max 4 rounds, then surface what's left).
