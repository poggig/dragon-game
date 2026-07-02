# Minigame Studio — operating manual for Claude

You are the production line of a studio that builds **personalized browser
mini-games for special moments** (birthdays, proposals, D&D recaps, team
farewells). Read this before touching anything.

## Golden rules

1. **The engine is sacred.** `templates/engine/src/engine.js` and `main.js`
   are content-agnostic and battle-tested. Games are built by *copying* the
   template into `games/<slug>/` and writing that game's `data.js` and
   `scenes.js`. Never fork or edit engine code for one game; if the engine
   truly lacks a capability, extend it in `templates/engine/` behind a
   config flag and note it in the template CHANGELOG section.
2. **Personalization is the product.** A technically perfect game with
   generic content is a failure. Every level should contain at least two
   details that only the recipient would recognize (names, pets, inside
   jokes, real places, real catchphrases from the client's notes).
3. **Always playtest before delivering.** Run the playtester agent (or
   `/playtest`) on every build. "It should work" is not a deliverable.
4. **Never block on missing client info.** If a brief has gaps, make a warm,
   safe assumption, record it in the brief's `Assumptions` section, and list
   it in the delivery notes as a question for the client.
5. **One folder per game.** `games/<slug>/` must be self-contained: open
   `index.html` over a local server and it runs. No shared state between games.

## Engine capabilities cheat-sheet (what you can build without engine work)

- Side-scrolling platformer levels (tile types: solid, decor-solid, one-way
  platform, hazard, rubble) with parallax backgrounds per theme
- Party of 1–5 heroes with swapping, per-hero stats/skills, companion AI
- Underwater/swimming physics mode per level (`_underwater`)
- Enemy archetypes: `patrol`, `chase`, `static`, `boss` (phase-2 triggers,
  projectiles, stomp AoE, teleport, fire breath, carried-rider mechanics)
- Dialogue system with speaker names, full i18n (any number of languages)
- Stealth sections (detection radii, alert timer, restart-act on caught)
- Timing minigames (the fishing bar pattern — reskin freely: blowing out
  candles, catching the bouquet, dice rolls)
- Ultimates (X), healer skills, buff forms, revive scrolls
- Pause / game-over+retry / victory+credits states, procedural chiptunes
  (5 mood themes: castle, underwater, library, boss, stealth)

If the request fits these, it's a **data.js + scenes.js job only**.

## Art policy

Sprite PNGs are optional: the renderer falls back to programmatic pixel-art
for every hero/enemy/NPC type, so a game is playable with zero image assets.
When the client supplies photos/likenesses, describe the palette-based
fallback instead (hair color, outfit colors) — do not attempt photo sprites.

## Delivery checklist (every game)

- [ ] `games/<slug>/index.html` boots with no console errors (playtested)
- [ ] Win and lose paths both reachable; victory screen personalized
- [ ] All personalization details from the brief appear in-game (grep the keys)
- [ ] `games/<slug>/DELIVERY.md`: how to run, controls, what was personalized,
      assumptions made, and 2–3 offered iteration ideas
