---
name: html5-canvas-platformer
description: |
  Generalized skill for building HTML5 canvas-based 2D platformer games without any framework. Use this when working on any single-file or multi-file vanilla JS platformer that uses a TileMap grid, entity-based physics, sprite strip rendering, and a game loop. Triggers on: tilemap collision, entity physics, jump mechanics, sprite animation strips, canvas rendering, platformer level design, or any canvas-based 2D game engine work.
---

# HTML5 Canvas Platformer — Development Skill

This skill captures patterns and pitfalls from building a production-quality HTML5 canvas platformer in vanilla JavaScript. These patterns apply to any game using tile-grid collision, entity physics, and sprite strips.

---

## Core Architecture Pattern

Single-file or minimal-file structure. Everything lives in one `<script>` tag:

```
Constants → Asset Loader → Input → Renderer → TileMap → Entity Classes → Level Classes → Game Loop
```

### Critical Constants
```javascript
const CW = 800;   // Canvas width
const CH = 480;   // Canvas height
const T  = 16;    // Tile size — ALL grid positions use this
const GR = 0.6;   // Gravity per frame (added to vy each frame)
const MF = 10;    // Max fall speed — MUST be less than T to prevent tunneling
```

**Why MF < T is critical:** If an entity falls faster than one tile per frame, it skips collision detection and falls through the floor. Always cap fall speed below T.

---

## TileMap System

```javascript
class TM {
  constructor(w, h) { this.w=w; this.h=h; this.d=new Uint8Array(w*h); }
  get(x,y)  { return (x<0||y<0||x>=this.w||y>=this.h)?1:this.d[y*this.w+x]; }
  set(x,y,v){ if(x>=0&&y>=0&&x<this.w&&y<this.h) this.d[y*this.w+x]=v; }
  sol(x,y)  { const v=this.get(x,y); return v>=1; }        // all solid tiles
  solUp(x,y){ const v=this.get(x,y); return v>=1&&v!==3; } // excludes one-way platforms
}
```

### Tile Values Convention
| Value | Meaning | Blocks Vertical | Blocks Horizontal |
|-------|---------|----------------|-------------------|
| 0 | Empty | No | No |
| 1 | Solid ground | Yes | Yes |
| 2 | Solid variant | Yes | Yes |
| 3 | One-way platform | **From above only** | No |
| 4–5 | Decorative solid | Yes | Yes |

### One-Way Platform Rule
Designate one tile value as your one-way platform (conventionally tile 3). Create a second solid-check function — `solUp()` — that returns false for this value. Use `solUp()` for `blockedH()` and `blockedUp()`. Use `sol()` only for `onSolid()` (feet check). This allows jumping through platforms from below and walking through them from the side.

---

## Physics System

```javascript
mv(tm) {
  // Horizontal movement
  if(this.vx!==0){
    const steps=Math.ceil(Math.abs(this.vx));
    const dx=this.vx/steps;
    for(let i=0;i<steps;i++){
      if(!this.blockedH(tm,dx)) this.x+=dx;
      else { this.vx=0; break; }
    }
  }
  // Vertical movement
  this.vy=Math.min(this.vy+GR, MF);  // gravity + cap
  if(this.vy!==0){
    if(this.vy>0 && this.onSolid(tm)){ this.vy=0; this.gnd=true; }
    else {
      if(!this.blockedVert(tm,this.vy)) this.y+=this.vy;
      else { if(this.vy>0)this.gnd=true; this.vy=0; }
    }
  }
}
```

### Jump Height Calculation
With `GR=0.6` and `jf=-9`: peak height ≈ `jf² / (2*GR)` = 81/1.2 ≈ **67.5px ≈ 4.2 tiles**

For double jump (two separate jf=-9 jumps): ≈ **8–9 tiles total** reachable height.

Platform placement safe zones:
- P2: H-7 (reachable from ground via single jump)
- P3: H-10 (reachable from P2 via single jump)
- P4: H-13 (reachable from P3 via single jump, or from ground via double jump)

---

## Ground Thickness Rule

**Always build ground 3 tiles deep:**
```javascript
for(let x=0;x<W;x++){
  tm.set(x,H-3,1);  // surface
  tm.set(x,H-2,1);  // subsurface
  tm.set(x,H-1,1);  // bottom
}
```

**Why:** Entities spawned at `(H-4)*T` have feet that extend past a single ground row. With 1 row, `onSolid()` checks the tile below ground (empty) → entity falls through the world. Three rows guarantee any entity finds solid ground on its next physics tick.

---

## Entity Spawning Pattern

Never hardcode exact pixel Y. Spawn above the floor and call `snapGnd()`:

```javascript
// Spawn at floor level (will be corrected by snapGnd)
const enemy = new Enem(300, (H-4)*T, 28, 40, ...);
// Then after all entities are created:
this.rebuildCompanions(); // calls snapGnd on all entities
```

### snapGnd Must Search from Entity TOP
```javascript
snapGnd(tm){
  const startY = Math.max(0, Math.floor(this.y/T)); // START FROM TOP, not feet
  for(let y=startY; y<tm.h; y++){
    if(tm.sol(Math.floor((this.x+this.w/2)/T), y)){
      this.y = y*T - this.h;
      break;
    }
  }
}
```
**Why:** Starting from feet embeds entities 16px into 3-layer ground, then `blockedH()` detects ground at lower body and the entity can't move.

---

## Sprite Strip System

Enemy sprites use horizontal animation strips: all frames left-to-right, uniform width, read by dividing image width by frame width.

```javascript
// SpriteConfig entry for strip-type enemy:
myEnemy: {
  type: 'strip',
  imgs: { idle: 'asset_key_idle', run: 'asset_key_run' },
  frameH: 64  // height of one frame = height of the strip image
}

// Rendering:
const img = Assets.get(cfg.imgs[state]);
const frameW = Math.floor(img.width / numFrames);
ctx.drawImage(img, frame*frameW, 0, frameW, img.height, dx, dy, dw, dh);
```

**frameH is the strip image height**, not the visible sprite height. It's used to calculate how the image maps to world-space.

**Verify actual dimensions** before setting frameH:
```python
from PIL import Image
img = Image.open('enemy/idle.png')
print(img.size)  # (totalWidth, frameH)
```

### Meta Sprite System (heroes/bosses)
Uses a `.txt` file with frame coordinates:
```
idle/0 = 0 0 64 64
idle/1 = 64 0 64 64
run/0 = 128 0 64 64
...
```
Frame is read as: `animName/frameN = x y w h`

---

## Asset Loading Pattern

```javascript
const MANIFEST = [
  {type:'image', key:'enemy_soldier_idle', path:'assets/enemies/castle_soldier/idle.png'},
  {type:'image', key:'tiles_castle',       path:'assets/env/castle/tiles.png'},
  {type:'meta',  key:'hero_kote',          path:'assets/chars/kote.png', meta:'assets/chars/kote.txt'},
];

// Loading with cache-busting and error resilience:
function loadAsset({type,key,path,meta}){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{ Assets.set(key,img); resolve(); };
    img.onerror=()=>{ console.warn('Asset missing:',path); resolve(); }; // graceful fail
    img.src=path+'?v='+Date.now();
  });
}
```

Missing assets do NOT crash the game — the renderer falls back to canvas primitive drawing.

---

## Dialogue System Pattern

```javascript
// Create dialogue entry
function d(speaker, text){ return {sp:speaker, tx:text}; }

// Show a sequence
D.show([
  d('Narrator', 'The battle begins.'),
  d('Hero', 'I\'m ready.'),
  d('Enemy', 'You won\'t survive.'),
], () => {
  // callback fires after last line is dismissed
  this.bAct2();
});
```

- Advance: Space or mouse click
- Max safe line length: ~160 characters (prevents overflow in standard dialogue box)
- Dialogue blocks physics: `if(D.on){ D.up(dt); return; }` at top of `update()`

---

## Level Class Architecture

```javascript
class Lv1 {
  enter(){ this.bAct1(); }

  bAct1(){
    this.act=1;
    const W=120, H=18;
    this.tm=new TM(W,H);
    buildArena(this.tm,W,H);  // or custom layout function
    this.heroes=this.createHeroes(50,(H-4)*T);
    this.enemies=[new Enem(400,(H-4)*T,28,40,'Guard','#555',50,8,'patrol','soldier')];
    this.npcs=[];
    this.decos=genDecos(W,H,'castle',1);
    this.rebuildCompanions();  // MUST be called last — snaps all entities
    this.hud();
    D.show([d('Narrator','Defeat the guards!')], ()=>{ /*act1 started*/ });
  }

  update(dt){
    if(D.on){ D.up(dt); return; }         // dialogue blocks everything
    if(!this.tm){ P.up(dt); return; }     // null-tilemap acts (cutscenes)
    // ... physics, AI, hit detection, win condition ...
  }

  draw(){ /* tilemap, decos, npcs, enemies, heroes, particles */ }
}
```

---

## Corridor/Wall Level Design

When placing vertical walls in a level, always place enemies at corridor **centers**, never at wall columns.

Example: walls at tile-x = 15, 32, 52 → corridors at tile-x 0–14, 16–31, 33–51
- Safe spawn x (pixels): 7*T=112, 23*T=368, 42*T=672

---

## Boss Phase Mechanics Pattern

Set custom properties on enemy instance after construction, guard them in the AI update:

```javascript
// Spawn
const boss=new Enem(...);
boss._phase2=false;       // triggers at 50% HP
boss._atkTimer=0;         // special attack timer

// In Enem.update() boss AI branch:
if(this._phase2===false && this.hp <= this.mhp*0.5){
  this._phase2=true;
  this.spd*=1.4;
  P.emit(this.x,this.y,20,'#f44',6,0.8,3); // visual cue
}
if(this._atkTimer!==undefined){
  this._atkTimer-=dt;
  if(this._atkTimer<=0){ this._atkTimer=2.5; /* do special attack */ }
}
```

All `this._prop!==undefined` guards ensure these branches only execute for bosses that have these properties set.

---

## Projectile Pattern

```javascript
class Proj {
  constructor(x,y,vx,vy,dmg){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.dmg=dmg;
    this.on=true;this.r=5;this.life=3.5;
  }
  update(dt,tm,heroes){
    if(!this.on)return;
    this.life-=dt; if(this.life<=0){this.on=false;return}
    this.x+=this.vx; this.y+=this.vy;
    this.vy=Math.min(this.vy+GR*0.4,MF*0.6); // light gravity
    const tx=Math.floor(this.x/T),ty=Math.floor(this.y/T);
    if(tm.sol(tx,ty)){this.on=false;return}
    for(const h of heroes){
      if(h.on&&Math.abs(h.x+h.w/2-this.x)<14&&Math.abs(h.y+h.h/2-this.y)<14){
        h.hurt(this.dmg);this.on=false;break;
      }
    }
  }
  draw(){ if(!this.on)return; R.rect(this.x-this.r,this.y-this.r,this.r*2,this.r*2,'#f84'); }
}
```

Level class manages: `this.projectiles=[]` → update loop → `this.projectiles=this.projectiles.filter(p=>p.on)` → draw loop.

---

## Per-Character Stats Pattern

Centralize character stats in a lookup object, apply after construction:

```javascript
const CHAR_STATS = {
  warrior: {hp:130, spd:1.8, atkDmg:26, skillMult:2.0},
  rogue:   {hp:80,  spd:2.8, atkDmg:28, skillMult:1.8},
  mage:    {hp:90,  spd:2.0, atkDmg:22, skillMult:2.8},
};

// In character class:
applyStats(type){
  const s=CHAR_STATS[type]; if(!s)return;
  this.hp=s.hp; this.mhp=s.hp; this.spd=s.spd; this.atkDmg=s.atkDmg;
  this._skillMult=s.skillMult||2;
}

// After construction:
const hero = new Hero(...);
hero.applyStats(hero.type);
```

---

## Companion Auto-Attack Pattern

```javascript
update(dt, active, tm, enemies){
  // ... movement following active hero ...

  if(enemies && this._atkCD<=0){
    const near=enemies.find(e=>e.on&&Math.abs(e.x-this.hero.x)<80&&Math.abs(e.y-this.hero.y)<40);
    if(near){
      this.hero.rt=(near.x>this.hero.x);
      this.hero.st='attack';
      this._atkCD=0.8; // slower cooldown than player
      near.hurt(Math.floor((this.hero.atkDmg||24)*0.6)); // 60% damage
    }
  }
  this._atkCD=Math.max(0,(this._atkCD||0)-dt);
}
```

All callers must pass `enemies` as the 4th argument.
