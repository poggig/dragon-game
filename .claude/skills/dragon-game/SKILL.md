---
name: dragon-game
description: |
  Chronicles of Azurerune — HTML5 canvas platformer game development skill. Use this skill whenever working on the Dragon Game project: modifying game physics, adding/editing levels, fixing sprite rendering, enemy AI, entity spawning, tilemap generation, dialogue/translation, or asset management. Trigger on: Azurerune, dragon game, game/index.html, game_v2/index.html, sprite sheets, tile collision, enemy movement, level design, character abilities. This is a single-file engine (~2700 lines) with many interconnected systems — always read before making changes to avoid reintroducing known bugs. The active development file is game_v2/index.html; game/index.html is the frozen MVP and must not be modified.
---

# Chronicles of Azurerune — Game Development Skill

This skill captures hard-won knowledge about the Chronicles of Azurerune HTML5 platformer. It's a side-scrolling action-platformer with 5 levels, 6 playable heroes, multiple enemy types, and a dialogue/translation system.

Two versions exist:
- `game/index.html` — frozen original MVP. **Do not modify.**
- `game_v2/index.html` — active development target (~2700 lines of JavaScript). All new work goes here.

Before making any changes, read the relevant reference file for the system you're working on. The `game_v2/references/` directory contains detailed documentation on each subsystem.

## Project Structure

```
game/          # Original MVP — DO NOT MODIFY
game_v2/       # Improved version — active development target
├── index.html          # The entire game (HTML + CSS + JS)
├── assets/
│   ├── chars/          # Hero spritesheets (.png) + metadata (.txt)
│   ├── sprites/        # Enemy/boss spritesheets
│   ├── enemies/        # Enemy animation strips (idle/, run/ subdirs)
│   │   ├── lib_cataloguer/, lib_censor/, lib_director/, lib_researcher/  # Library enemies (ACTIVE)
│   │   ├── hideout_scout/, skeleton/  # Additional enemies (ACTIVE)
│   │   └── castle_knight/, castle_archer/, etc.  # Castle enemies (ACTIVE)
│   ├── env/            # Tilesets (castle/, garden/, library/, dungeon/)
│   ├── fx/             # Per-hero attack/skill effects
│   └── ui/             # UI sprites (currently unused)
├── start_game.bat      # Windows launcher
├── start_game.command  # macOS launcher
└── start_game.sh       # Linux launcher
```

## Critical Constants

```javascript
const CW = 800;   // Canvas width (pixels)
const CH = 480;   // Canvas height (pixels)
const T  = 16;    // Tile size (pixels) — ALL positions snap to this grid
const GR = 0.6;   // Gravity per frame
const MF = 10;    // Max fall speed (< T, so entities never skip tiles)
```

## Core Systems at a Glance

| System | Class/Object | What It Does |
|--------|-------------|--------------|
| Tilemap | `TM` | Grid-based collision. `sol()` = all solid, `solUp()` = excludes platforms |
| Entities | `Ent` → `Hero`, `Enem` | Physics, collision, health, animation |
| Companions | `Companion` | AI-controlled party members following active hero |
| NPCs | `NPC` | Static dialogue triggers (not an Ent subclass) |
| Renderer | `R` | Canvas drawing, camera, sprite rendering |
| Dialogue | `D` | Queued text display with Space/click advancement |
| Particles | `P` | Simple emission particles for VFX |
| Effects | `FX` | Sprite-based attack/skill animations |
| Translation | `Lang` | EN/ES/IT string lookup |
| Levels | `Lv1`–`Lv5` | Multi-act level state machines |

For detailed documentation on any system, read the corresponding file in `references/`.

## Known Bugs & Hard-Won Fixes (DO NOT REVERT)

These fixes were discovered through painful debugging. Each one prevents a specific, non-obvious failure:

### 1. Ground Must Be 3 Tiles Deep
```javascript
// In buildArena(): Ground is H-3, H-2, H-1 (all value 1)
for(let x=0;x<W;x++){tm.set(x,H-3,1);tm.set(x,H-2,1);tm.set(x,H-1,1)}
```
**Why**: Entities spawned at `(H-4)*T` have their feet extending past a single ground row. With only 1 row of ground, `onSolid()` checks the tile below ground (empty) and entities fall through the world. Three rows ensures any entity's feet always find solid ground.

### 2. Platforms Are One-Way (solUp Excludes Tile 3)
```javascript
solUp(x,y){const v=this.get(x,y);return v>=1&&v<=5&&v!==3}
```
**Why**: Platform tiles (value 3) should only be solid when standing ON them, not when jumping through from below or walking through from the side. Both `blockedUp()` and `blockedH()` use `solUp()` instead of `sol()`. If you change this, characters will hit invisible ceilings and get stuck on platform edges.

### 3. snapGnd Searches from Entity TOP, Not Feet
```javascript
snapGnd(tm){
    let startY=Math.max(0,Math.floor(this.y/T));  // TOP, not feet
    for(let y=startY;y<tm.h;y++){...}
}
```
**Why**: If you search from the feet position (`this.y + this.h`), entities spawned partially inside the thick ground land on the SECOND ground row instead of the surface. This embeds them 16px deep, and then `blockedH()` detects the ground tile at their lower body, making them completely unable to move horizontally. The fix is simple: search from the top of the entity downward, finding the ground surface first.

### 4. rebuildCompanions() Snaps ALL Entities
```javascript
rebuildCompanions(){
    // ... companion setup ...
    if(this.tm){
      for(const h of this.heroes) h.snapGnd(this.tm);
      if(this.enemies) for(const e of this.enemies) e.snapGnd(this.tm);
      // NPCs use manual snap (not Ent subclass)
      if(this.npcs) for(const n of this.npcs){...}
    }
}
```
**Why**: This is the universal "place everything correctly" function. It's called after every level setup and character swap. Without it, entities spawn at hard-coded pixel positions that may not align with the actual ground surface.

### 5. Enemy Patrol Animation Should Be 'run', Not 'idle'
Patrol enemies set `this.st='run'` while moving. Previously this was `'idle'`, making patrolling enemies appear frozen even though they were moving.

## Tile Values

| Value | Meaning | sol() | solUp() | Notes |
|-------|---------|-------|---------|-------|
| 0 | Empty/sky | false | false | Dark background with overlay |
| 1 | Solid ground/wall | true | true | Primary ground tile |
| 2 | Solid variant | true | true | Alternative ground texture |
| 3 | One-way platform | true | **false** | Stand on top, jump through from below |
| 4 | Gold/special | true | true | Decorative solid |
| 5 | Alt solid | true | true | Alternative wall texture |

## Sprite System Quick Reference

Three rendering types for enemies:

- **meta**: PNG spritesheet + .txt metadata file. Frame positions defined as `animName/frameN = x y w h`. Used for heroes and Kansaldi boss.
- **strip**: Horizontal animation strip. Frames arranged left-to-right, uniform cell size. `frameW` and `frameH` define cell dimensions. Frame count auto-calculated: `floor(imageWidth / frameW)`.
- **single**: Static full image, no animation.

When extracting/fixing sprite sheets:
- Sprite sheets often contain text labels, multiple animation rows, and inconsistent spacing
- Use Python + PIL to analyze alpha channels and find actual frame boundaries
- Create clean horizontal strips with uniform cell sizes
- Align sprite feet to the bottom of each cell (for ground anchoring)
- Both idle and run strips for the same enemy should use matching cell dimensions

See `references/sprites.md` for detailed sprite configuration and extraction procedures.

## Entity Spawning Coordinates

Heroes are created via `createHeroes(x, y, includeNesta)` — they get horizontal offsets of 0, 30, 60, 90, 120 pixels. All heroes have hitbox size 20x36.

Enemies use `new Enem(x, y, w, h, name, color, hp, dmg, ai, customType)`. Common sizes: 28x40 (soldiers), 24x36 (bosses), 20x24 (small), 16x20 (tiny).

Spawn Y is typically `(H-4)*T` or `(H-5)*T` — then `snapGnd()` corrects them to the actual ground surface. You don't need to calculate exact pixel positions; just spawn above ground level and `rebuildCompanions()` handles the rest.

## Level Architecture

Each level (Lv1–Lv5) is a class with:
- `enter()` — entry point, calls first act builder
- `bActN()` — builds act N (tilemap, entities, dialogue, objectives)
- `update(dt)` — per-frame logic (physics, AI, win/lose conditions)
- `draw()` — render everything in correct z-order
- `hud()` — update the hero-swap HUD
- `swap(i)` — switch active hero
- `rebuildCompanions()` — recreate companion AI + snap entities

Acts progress by calling the next `bActN()` method when objectives are met (all enemies dead, reaching an x-coordinate, dialogue finished, etc.).

See `references/levels.md` for per-level act breakdowns and design notes.

## Hero Stats System (game_v2 only)

All heroes have differentiated stats via the `HERO_STATS` constant (placed after `SpriteConfig`):

```javascript
const HERO_STATS={
  kote:    {hp:120,spd:2.4,jf:-9.5,atkDmg:20,skillMult:2.2,dashDur:0.10,atkRange:28,skillRange:45},
  minerva: {hp:90, spd:2.0,jf:-9.0,atkDmg:22,skillMult:2.8,dashDur:0.14,atkRange:36,skillRange:70},
  elber:   {hp:100,spd:1.9,jf:-8.5,atkDmg:18,skillMult:3.0,dashDur:0.16,atkRange:30,skillRange:60},
  nesta:   {hp:80, spd:2.8,jf:-9.8,atkDmg:28,skillMult:1.8,dashDur:0.08,atkRange:24,skillRange:40},
  nick:    {hp:130,spd:1.8,jf:-8.0,atkDmg:26,skillMult:2.0,dashDur:0.18,atkRange:34,skillRange:50},
  bakaris: {hp:100,spd:2.1,jf:-9.0,atkDmg:24,skillMult:2.0,dashDur:0.12,atkRange:30,skillRange:50},
};
```

Applied via `hero.applyStats(hero.customType)` called in `createHeroes()` after construction. The `atkBox()` method uses `this._skillRange`, `this._atkRange`, and `this._skillMult` set by `applyStats()`.

To add stats for a new hero: add an entry to `HERO_STATS` and call `applyStats()`.

## Boss Phase Mechanics (game_v2 only)

Bosses have special behavior via custom properties set at spawn time. All properties are guarded with `if(this._prop!==undefined)` checks inside `Enem.update()`.

```javascript
// Phase 2 (Bakaris) — at 50% HP, speed increases + projectiles fire
const boss = new Enem(...);
boss._phase2=false;       // flip to true when HP crosses 50%
boss._projTimer=3.0;      // seconds between projectile fires
boss._scene=this;         // reference to level instance for projectiles array

// Platform jumping (Draconian Kapak)
kapak._jumpTimer=2.0;     // seconds between jumps

// Teleport (Spectator)
spec._teleTimer=4.0;      // seconds between teleports
spec._tpMinDist=80;       // only teleports when hero is within this distance

// AOE stomp + enrage (Sivak Draconian)
sivak._stompTimer=3.5;    // seconds between stomps
sivak._enraged=false;     // flip to true at 30% HP

// Fire breath (Kansaldi)
kansaldi._breathTimer=4.0;
kansaldi._breathActive=false;
kansaldi._breathDur=0;
```

Projectiles use the `Proj` class (defined before Lv1). Levels that use projectiles need `this.projectiles=[]` and must update/draw them in `update()`/`draw()`.

## Level Layout Functions (game_v2 only)

Four level-specific tilemap builders are defined after `buildArena()`:

| Function | Used In | Description |
|----------|---------|-------------|
| `buildLevel1Arena(tm,W,H)` | Lv1 bAct1 | Raised balcony right side, 2 pits, 3 platform tiers |
| `buildLevel2Arena(tm,W,H)` | Lv2 acts 1/2/4 | Water area left, rolling hills, wide festival platforms |
| `buildLevel3Library(tm,W,H)` | All Lv3 acts | Ceiling, corridor walls at x=15,32,52,72,92,108, bookshelf obstacles |
| `buildLevel5Ruins(tm,W,H)` | Lv5 acts 2–7 | Rubble mounds, collapsed pillars, center pit |

**Level 3 corridor enemy placement:** Walls are at tile-x = 15,32,52,72,92,108 (pixel-x = 240,512,832,1152,1472,1728). Enemy spawn x must be at corridor centers, not on wall columns. Safe pixels: ~368, ~672, ~992, ~1312.

## Companion Auto-Attack (game_v2 only)

`Companion.update(dt, active, tm, enemies)` now accepts an `enemies` array (4th parameter). Companions auto-attack enemies within 80px at 0.8s cooldown for 60% of hero's `atkDmg`. All `companions.forEach` calls must pass `this.enemies` as the 4th argument.

## Enemy AI Types

| AI | Behavior | Speed | Trigger |
|----|----------|-------|---------|
| `patrol` | Walk back and forth | 0.7 | Switches to chase if hero < 130px |
| `chase` | Pursue active hero | 0.7 × 1.4 | Returns to patrol if hero > 280px |
| `boss` | Always chase | 0.7 × 1.8 | Never disengages |
| `static` | Stand still | 0 | Attacks if hero < 60px |

## Available Enemy Types in SpriteConfig (game_v2)

All active enemies with working sprites (64px frameH unless noted):

| customType | Sprites | Used In |
|-----------|---------|---------|
| castle_soldier | idle, run | Lv1, Lv5 |
| castle_knight | idle, run | Lv1, Lv5 |
| castle_archer | idle, run | Lv1, Lv5 |
| castle_priest | idle, run | Various |
| hideout_fighter | idle, run | Lv1, Lv4 combat |
| hideout_scout | idle, run | Available |
| lib_cataloguer | idle, run | Lv3 bAct3 |
| lib_censor | idle, run | Lv3 bAct1 |
| lib_director | idle, run | Available |
| lib_researcher | idle, run | Available |
| skeleton | idle(32px), run | Available |
| darkmantle | idle | Lv2 |
| draconian | idle, run | Lv2, Lv5 |
| spectator | idle, attack | Lv3 bAct4 |
| bakaris | meta sprite | Lv1 boss |
| kansaldi | meta sprite | Lv5 final |

## Lore Reference

| Term | Meaning |
|------|---------|
| Azurerune Fortress | Magic academy where the heroes trained |
| Dragon Armies | The antagonist military force advancing on the realm |
| Solamnic Knights | Honorable order of knights; Helena Starmantle was one |
| Neraka | Site of a historic catastrophic battle |
| The Cataclysm | Ancient world-altering disaster; dragons supposedly went extinct |
| Blue dragon | Rare, powerful; their wounds leave spiral scars that never fade |
| The Masquerade | Yurthgreen festival; cover for political events in Act 4 |
| Lohezet | Shadow mage offering a pact to Nesta |
| Ispin | Keeper of old scryer knowledge |
| Arturito | Loyal AI/construct companion; sacrifices himself at the end |

---

## Adding New Content — Checklist

### New Enemy Type
1. Add sprite strip(s) to `assets/enemies/<type>/idle.png` and `run.png`
2. Add to SpriteConfig.enemies: `{type:'strip', imgs:{idle:'key_idle',run:'key_run'}, frameH:64}`
3. Add asset entries to the manifest: `{type:'image',key:'enemy_<type>_idle',path:'assets/enemies/<type>/idle.png'}`
4. Add fallback drawing in `R._drawEnemyFallback()` (canvas primitives)
5. Spawn with `new Enem(x, y, w, h, name, color, hp, dmg, ai, customType)`

### New Level Act
1. Add `bActN()` method to the level class
2. Create tilemap: `const W=150, H=18; this.tm=new TM(W,H); buildArena(this.tm,W,H,this.act);`
3. Set heroes, enemies, NPCs
4. Call `this.rebuildCompanions()` (this also snaps entities to ground)
5. Set up dialogue with `D.show([...], callback)`
6. Add win condition in `update()` to trigger next act

### New Hero
1. Add spritesheet + metadata to `assets/chars/`
2. Add to SpriteConfig.heroes
3. Add asset entries to manifest
4. Add to `createHeroes()` method and call `h.applyStats(h.customType)` after construction
5. Add stats entry to `HERO_STATS` constant
6. Add fallback drawing in `R._drawHeroFallback()`
