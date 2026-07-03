# Chronicles of Azurerune — Full Audit & Refactor (v2.0)

This document records every problem found in the original single-file build
(`game_v3/index.html`, ~4,400 lines) and what was done about it, and why.
The refactor was verified end-to-end in headless Chromium: all five levels
boot clean, dash/combat/ultimates/healing/fishing/stealth/pause/game-over/
victory were exercised programmatically.

---

## 1. Architecture

**Problem.** One 4,423-line HTML file. The five level classes duplicated
~60–70% of their code verbatim (`createHeroes`, `rebuildCompanions`, `swap`,
`hud`, `_triggerRAbility`, projectile updates, the whole draw scaffolding —
the ultimate-ability switch alone was copy-pasted **five times**). Every
balance tweak had to be made in five places, which is exactly how the bugs
below accumulated.

**Fix.** Split into four modules, still zero build step / zero dependencies:

```
game_v3/
├── index.html        ← DOM shell only (~80 lines)
└── src/
    ├── engine.js     ← game-agnostic: assets, input, renderer, physics,
    │                    entities, dialogue, particles, FX, music
    ├── data.js       ← game content config: stats, sprites, manifest,
    │                    map builders, full i18n table
    ├── scenes.js     ← Scene base class + the 5 levels as thin subclasses
    └── main.js       ← fixed-timestep loop + title/pause/gameover/victory
```

`Scene` now owns all shared behaviour once. A new level is ~100 lines of
content instead of ~350 lines of copy-paste. `data.js` is deliberately the
"replace me to make a different game" file — the engine has no knowledge of
Azurerune.

---

## 2. Physics bugs

| # | Bug | Fix |
|---|-----|-----|
| P1 | **Game speed was tied to the display refresh rate.** The loop passed a hardcoded `dt=1/60` on every `requestAnimationFrame` tick — 2× speed on a 120 Hz monitor, slow-motion under throttling. | Fixed-timestep accumulator in `main.js`: real elapsed time is accumulated and simulated in exact 1/60 s steps (max 4/frame, clamped on tab-switch gaps). Identical gameplay at any refresh rate. |
| P2 | **Dash was broken.** It set `vx=7` for a single frame; the next frame's input handling overwrote `vx`, so "dash" moved you ~7 px. The `dashDur` stat (0.07–0.20 s) was read but never used. | Dash now holds `vx = dir × 7` for the whole `dashDur` window, sets the `dash` state (its animation finally plays) and grants i-frames for the dash duration. |
| P3 | **Heroes spawned embedded in solid tiles.** `snapGnd` snapped to the first solid row below, even when the entity's body would overlap a wall (the Lv1 left tower) — you had to jump to un-stick yourself. | `snapGnd` now only accepts a surface with enough clear tiles above for the entity's body; Lv1 spawns moved clear of the tower. |
| P4 | **Charging enemies ignored collision.** The charge branch did `this.x += sign(dx)*spd` directly — enemies walked through walls. | Charge movement goes through `blockedH` like everything else. |
| P5 | **Enemies froze mid-air.** The chase branch `if(d>280){this.ai='patrol';return}` returned before gravity was applied — an enemy that lost aggro while airborne hovered forever. | Gravity/landing extracted to `_applyGravity()` and always applied. |
| P6 | **Double gravity.** `Ent.mv()`'s `vy===0` branch added gravity *and* moved, on top of the gravity the owner's `update()` had already applied. | `mv()` never applies gravity; owners apply it exactly once per step. |
| P7 | **Projectiles were frame-rate scaled.** `HeroProj`/`Proj` moved `vx` px/frame (unlike `MegaProj` which was dt-scaled). | All projectiles dt-scaled (`vx*dt*60`). |
| P8 | Wall collision sampled only head and feet; tall entities could clip through single-tile walls at torso height. | `blockedH` samples head, middle and feet. |
| P9 | **Skills could double-hit.** Skill swings last 0.5 s but enemy invulnerability is 0.4 s, so one swing could apply full skill damage twice. | Per-swing hit registry (`_swingHit`): a swing damages each enemy at most once; damage no longer depends on the invuln window. |
| P10 | Enemy projectiles collided with one-way platforms (tile 3), exploding on pass-through floors. | Projectile tile collision uses `solUp` (ignores platforms), matching entity semantics. |

## 3. Playability / player-POV gaps

| # | Problem | Fix |
|---|---------|-----|
| G1 | **No defeat state.** A party wipe soft-locked the game: enemies idled, input dead, only recourse was reloading the page. | Game-over screen with **Retry act** / **Quit to title**. Retrying rebuilds the current act (heroes restored to level-entry HP). |
| G2 | **Controlled hero death did nothing.** The screen just stopped responding until you guessed Tab. | Auto-swap to the next living hero (at their position, no teleport) with a "DOWN!" indicator; portraits of dead heroes grey out. |
| G3 | **No pause, no exit.** There was no way to leave a level short of reloading; `G.title()` existed but was wired to nothing. | ESC pauses: Resume / Restart act / Quit to title. |
| G4 | **Bosses lost their brains when shot.** Hero projectiles set `e.ai='chase'` permanently — one Elber bolt disabled Bakaris' phase-2 projectiles and the Sivak's stomp for the rest of the fight. | Enemies remember `_aiOrig`; retaliation charges are temporary and always restore the original AI. Losing aggro also restores it. |
| G5 | **Stale run state.** `heroHPs` and resurrection scrolls persisted across "new game" — starting a fresh run with 3 HP heroes and 0 scrolls. | `G.start()` (any entry from the title) resets both. |
| G6 | **Spongy trash mobs.** Every basic enemy had 120–150 HP (5–6 hits each, and Lv1 demanded killing 11 of them spread across 3.8 km of map). | Tiered HP (`grunt 60 / soldier 85 / elite 120 / miniboss 200 / boss 300`), fewer and closer-packed kill-all targets. |
| G7 | **Kill-all objectives with no direction** — the last goblin could be anywhere. | Live enemy counter moved into a clean status column + a pulsing edge arrow pointing to remaining enemies when ≤3 are left and off-screen. |
| G8 | **HUD overlaps.** "Enemies: n/n" rendered on top of the hero portraits; "Scrolls" overlapped the music indicator. | Single right-aligned canvas status column: music / scrolls / ultimate / enemy count. |
| G9 | **Confusing ability naming.** README called X the "R-Ability" while R was revive. | It's the **Ultimate [X]** everywhere now (HUD, dialogue, README). |
| G10 | **Stealth guard walked off its platforms.** The patrol clamp used `5*32..75*32` with 16 px tiles (wrong unit, 2× too far). | Clamped in tile units (`5*T..78*T`); platform hops emit a particle cue. |
| G11 | **Fishing minigame flow.** Every catch/miss opened a modal dialogue that ate the next input; no difficulty signal. | Inline toast feedback, marker speeds up per round while the zone shrinks, round counter on screen. |
| G12 | **The Lv2 timer said "ESCAPE"** but the objective was kill-all; the timer was actually your air. | Renamed to **AIR**, explained in the intro, and running out drowns the party into the (new) game-over flow instead of a silent freeze. |
| G13 | **Stealth retries replayed the intro dialogue** every single time you were caught. | All act builders take a `retry` flag: instant restart, no dialogue replay. |
| G14 | Win conditions could re-trigger while their dialogue was open (double `bAct` calls). | One-shot guards on every act transition. |

## 4. Story & content

| # | Problem | Fix |
|---|---------|-----|
| S1 | **Nesta vanished in Lv2–Lv3 with zero explanation** — and Lv3's stealth tip was *spoken by Nesta*, who wasn't there. | Story beat added at Lv2 start: she stays at the academy to heal her wounded fox and face the Tribunal; Lv4 explicitly welcomes her back. The Lv3 tip line is now Kote's. |
| S2 | **The Mayor of Vogler used Bakaris' (the villain's) sprite**, as did several friendly NPCs using hero sprites — the cast looked like clones. | Generic NPCs render as a hooded-villager fallback sprite; Bakaris' sprite is reserved for Bakaris. |
| S3 | **Bakaris appeared as a cheerful masquerade guest** one level after being scarred for life, with no comment. | Rewritten as a story beat: a masked noble watching you coldly — the scar visible under the mask. He says nothing. *Yet.* |
| S4 | **Lv3 Act 2 said "Descend… watch for trap platforms"** while the goal was to *climb up* and no traps existed; the win check (`y<100`) was tuned to a map size that no longer existed. | Rewritten as "The Restricted Archive — climb to the top balcony", with an objective marker; win check computed from the actual map height. |
| S5 | **Beating the game silently dumped you back into Level 1.** | Proper victory/credits screen ("Book One Complete"), then the title. |
| S6 | **The EN/ES/IT buttons only translated the title screen** — all dialogue was hardcoded English. | Every player-facing string (≈180 lines × 3 languages) now lives in the i18n table and resolves at display time; you can switch language mid-game. |
| S7 | The unbeatable Kansaldi fight said "Escape!" but there was nothing to do and it ended after 10 s regardless. | It's an explicit **SURVIVE 20 s** encounter with an on-screen countdown. |

## 5. Rendering & polish

- **The world was smaller than the screen.** Maps were 16–20 tiles tall
  (256–320 px) against a 480 px viewport, so the bottom ~40% of the screen
  showed parallax sky *below* the floor, with background castle windows
  floating in the void. All maps are now ≥34 tiles (`MAP_H`), the vertical
  camera clamp finally has something to clamp to, and the ground reaches the
  bottom of the screen.
- Wall decorations were scattered across the (previously enormous) empty sky;
  they're now placed in the visible band above the floor.
- Cache busting used `?v=Date.now()` — every reload re-downloaded ~100 PNGs.
  Now keyed to `GAME_VERSION`.
- `Date.now()` in render paths replaced with `performance.now()`.
- Removed dead code (`R._floats`, duplicate `NPC.up`, unused `#ecount`/`#actT`
  DOM paths) and 14 orphaned `*.del` asset files.

## 6. Verification

Automated in headless Chromium (Playwright) against a local server:

- Title renders; all five levels enter cleanly with zero console errors.
- Map height ≥ viewport; no void below the ground.
- Dash moves ~35 px with i-frames (was −4 px…).
- Melee kills, ultimates, and Nick's party heal all fire.
- Boss AI survives being hit by hero projectiles.
- Party wipe → game-over screen → Retry restores a full party in the same act.
- ESC pause opens/resumes; fishing completes 3 catches and advances to Act 4.
- Spanish/Italian strings reach in-game dialogue.
- Victory screen reachable and returns to title.

---

## Post-release fix log

### 2026-07-03 — Lv4 "buried in the floor" (placement inside terrain)

**Symptom.** Level 4 (Masquerade) started with the whole party embedded in
the floor and unable to move; two NPCs (masked Bakaris, Levna) sunk waist-deep.

**Root cause.** Levels spawn entities at ground height `(H-4)*T`, but Lv4's
spawn zone sits on the raised left *balcony* (solid rows H-6..H-4, x<~690).
Both placement routines assumed spawns start in open air:
`snapGnd` only scanned **downward** and required body headroom — impossible
from inside a solid block — so it silently did nothing; the NPC snap accepted
the solid row it was already inside. Lv1 had the same latent bug at its tower
(dodged earlier by moving the spawn); Lv4 was the remaining case.

**Fix.** Placement now self-heals: if an entity's feet are inside solid
terrain, it rises to the top of that block and stands on it; otherwise the
downward headroom scan runs as before (`engine.js snapGnd`, plus the NPC
snap in `scenes.js`). Same fix applied to the studio engine template.

**Lesson (saved to the playtester agent's mandatory checks).** "Level enters
cleanly" is not enough: at the start of EVERY act, assert the controlled
hero (a) is not overlapping solid tiles and (b) can actually move ±30px.
Placement code must never trust level data to put spawns in open air.
