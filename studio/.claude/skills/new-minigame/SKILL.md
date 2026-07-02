---
name: new-minigame
description: Build a complete personalized mini-game from a client brief - design, story, implementation on the engine template, and headless playtest. Use when a brief exists (from /game-brief) or the user provides enough detail to skip the interview. Args - path to the brief file, or inline description.
---

# /new-minigame — brief → playable game

## Pipeline

Run these stages in order. Stages 2 and 3 can run as parallel agents once
stage 1 is done; stage 4 iterates with stage 5 until green.

1. **Slug + workspace.** Derive `<slug>` from recipient+occasion
   (`sofia-bday-30`). Create `games/<slug>/`.
2. **Design** — launch **game-designer** with the brief path. Output:
   `games/<slug>/GAMESPEC.md`. Review it yourself: every mechanic must map
   to the engine cheat-sheet in CLAUDE.md; every level must consume ≥2 brief
   details; total playtime 10–15 min. Fix the spec before building — specs
   are cheap, rebuilds are not.
3. **Story** — launch **story-writer** with the spec + brief. Output:
   `games/<slug>/strings.js` (full i18n table, all brief languages).
4. **Build** — launch **game-builder**. Output: runnable
   `games/<slug>/` (engine template copy + game data.js + scenes.js +
   DELIVERY.md).
5. **Playtest** — launch **playtester** on the folder. If FAIL: send the
   failure report back to game-builder (SendMessage to the same agent keeps
   its context) and re-test. Loop until PASS, max 4 iterations — then
   escalate remaining failures to the user with the playtest report.
6. **Deliver.** Present to the user: how to run
   (`python3 -m http.server 8003 --directory games/<slug>`), a screenshot of
   the title and one level, the personalization map (brief detail → where it
   appears), assumptions made, and 2–3 iteration ideas.

## Guardrails

- Engine files are never edited per-game (see CLAUDE.md rule 1).
- If the user asked for something the engine can't express even by reskin,
  say so at stage 2 and offer the nearest reskin — do not silently drop it.
- Total time target: a first playable in minutes, not hours. Prefer the
  provided map builders and fallback art over custom work unless the brief
  demands otherwise.
