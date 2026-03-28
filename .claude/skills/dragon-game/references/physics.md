# Physics System Reference

## Core Movement: `Ent.mv(tm)`

The `mv()` method handles all entity movement with tilemap collision. It runs every frame for heroes (via `Hero.update()`) and is also the basis for enemy movement.

### Horizontal Movement
```javascript
if(this.vx !== 0){
    if(!this.blockedH(tm, this.vx)) this.x += this.vx;
    else {
        // Snap to wall edge
        if(this.vx > 0) this.x = Math.floor((this.x+this.w-2)/T)*T - (this.w-2);
        else this.x = Math.ceil((this.x+2)/T)*T - 2;
        this.vx = 0;
    }
}
```

### Vertical Movement
```javascript
if(this.vy < 0) {
    // Moving UP (jumping)
    if(this.blockedUp(tm)){this.vy=0; this.y=Math.ceil(this.y/T)*T}
    else this.y += this.vy;
    this.gnd = false;
} else {
    // Moving DOWN or standing
    if(this.vy > 0 && this.onSolid(tm)){
        // Landing — snap feet to tile top
        this.y = Math.floor((this.y+this.h)/T)*T - this.h;
        this.vy = 0; this.gnd = true;
    } else if(this.vy === 0 && !this.onSolid(tm)){
        // Standing on nothing — start falling
        this.gnd = false; this.vy += GR; this.y += this.vy;
    } else {
        // Freefall
        this.y += this.vy; this.gnd = false;
    }
}
```

## Collision Methods

### onSolid(tm) — "Am I standing on something?"
```javascript
onSolid(tm){
    const bx1 = Math.floor((this.x+4)/T);
    const bx2 = Math.floor((this.x+this.w-4)/T);
    const by = Math.floor((this.y+this.h)/T);
    return tm.sol(bx1, by) || tm.sol(bx2, by);
}
```
Checks two points at the entity's feet (inset 4px from edges). Uses `sol()` which includes ALL solid tiles (1-5), so entities stand on both ground AND platforms.

### blockedH(tm, dx) — "Is there a wall in my way?"
```javascript
blockedH(tm, dx){
    const nx = this.x + dx;
    const tx = dx>0 ? Math.floor((nx+this.w-2)/T) : Math.floor((nx+2)/T);
    const ty1 = Math.floor((this.y+6)/T);
    const ty2 = Math.floor((this.y+this.h-2)/T);
    return tm.solUp(tx, ty1) || tm.solUp(tx, ty2);
}
```
Uses `solUp()` — platforms (tile 3) do NOT block horizontal movement. Checks two heights: near entity top (+6px) and near bottom (-2px). The bottom check at `this.h-2` is carefully positioned to NOT include the tile the entity is standing on.

### blockedUp(tm) — "Is there a ceiling above me?"
```javascript
blockedUp(tm){
    const tx1 = Math.floor((this.x+4)/T);
    const tx2 = Math.floor((this.x+this.w-4)/T);
    const ty = Math.floor((this.y-1)/T);
    return tm.solUp(tx1, ty) || tm.solUp(tx2, ty);
}
```
Uses `solUp()` — platforms (tile 3) do NOT block upward movement. This is what makes platforms "one-way": you can jump through them from below.

## Jump Mechanics

```javascript
// In Hero constructor:
this.jf = -9;        // Jump force (negative = upward)
this.maxJumps = 2;   // Double jump enabled

// In Hero.update():
this.vy = Math.min(this.vy + GR, MF);  // Apply gravity, cap at max fall
if(this.gnd) this.jumps = 0;            // Reset on landing

if((up pressed) && this.jumps < this.maxJumps){
    this.vy = this.jf;
    this.gnd = false;
    this.jumps++;
}
```

Jump height: ~4.5 tiles (single jump), ~9 tiles (double jump). Platform levels are tuned to these heights:
- P2 at H-7: reachable with single jump from ground
- P3 at H-10: reachable with double jump from ground, or single from P2
- P4 at H-13: reachable with double jump from P2

## Enemy Movement (differs from Hero)

Enemies do NOT call `this.mv(tm)`. They have inline physics in `Enem.update()`:

```javascript
this.vy = Math.min(this.vy + GR, MF);  // Gravity
if(this.vx !== 0 && !this.blockedH(tm, this.vx))
    this.x += this.vx;
else this.vx = 0;

if(this.vy > 0 && this.onSolid(tm)){
    this.y = Math.floor((this.y+this.h)/T)*T - this.h;
    this.vy = 0; this.gnd = true;
} else {
    this.y += this.vy; this.gnd = false;
}
```

The key difference: enemies don't handle the "vy===0 && not on solid" case explicitly — gravity handles it since `vy` increases each frame regardless. They also don't snap to walls (just stop moving).

## snapGnd(tm) — Ground Snapping

```javascript
snapGnd(tm){
    let startY = Math.max(0, Math.floor(this.y / T));
    for(let y = startY; y < tm.h; y++){
        const bx1 = Math.floor((this.x+4)/T);
        const bx2 = Math.floor((this.x+this.w-4)/T);
        if(tm.sol(bx1,y) || tm.sol(bx2,y)){
            this.y = y*T - this.h;
            this.gnd = true;
            this.vy = 0;
            return;
        }
    }
}
```

Searches downward from entity TOP to find the first solid tile. Places entity with feet touching the top of that tile. This handles:
- Entities spawned at arbitrary positions (lands on nearest surface)
- Character swapping (position transferred, then snapped)
- Level transitions
