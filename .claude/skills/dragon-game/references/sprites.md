# Sprite System Reference

## Asset Loading

Assets are loaded via a manifest array in `G.init()`. Each entry has:
- `{type:'image', key:'hero_kote', path:'assets/chars/kote.png'}` — loads a PNG
- `{type:'meta', key:'hero_kote', path:'assets/chars/kote.txt'}` — loads frame metadata

Cache-busting is automatic: `?v=` + timestamp appended to all URLs.

## SpriteConfig Structure

### Heroes (meta type)
```javascript
SpriteConfig.heroes = {
    kote: {
        img: 'hero_kote',      // Asset key for spritesheet PNG
        meta: 'hero_kote',     // Asset key for .txt metadata
        stateMap: {             // Game state → animation name mapping
            idle: 'idle',
            run: 'run',
            jump: 'jump',
            fall: 'fall',
            attack: 'attack_A',
            skill: 'attack_B',
            dash: 'dash_attack_A'
        }
    },
    // minerva, elber, nesta, nick, bakaris follow same pattern
}
```

### Enemies (various types)
```javascript
SpriteConfig.enemies = {
    // Strip type — horizontal animation strips
    castle_knight: {
        type: 'strip',
        imgs: {idle: 'enemy_castle_knight_idle', run: 'enemy_castle_knight_run'},
        frameH: 64       // Frame height; width auto-detected or specified
    },

    // Meta type — same as heroes
    bakaris: {
        type: 'meta',
        img: 'hero_bakaris', meta: 'hero_bakaris',
        stateMap: {idle: 'idle', run: 'run', attack: 'attack_A'}
    },

    // Strip with explicit frameW
    draconian: {
        type: 'strip',
        imgs: {idle: 'enemy_dragonborn_idle', run: 'enemy_dragonborn_run'},
        frameW: 82, frameH: 54
    },
}
```

## How Strip Frame Width Is Determined

```javascript
const fH = img.height;
const fW = cfg.frameW && cfg.frameH === img.height ? cfg.frameW : fH;
const numFrames = Math.max(1, Math.floor(img.width / fW));
```

The logic: if `frameW` is specified AND `frameH` matches the image height, use `frameW`. Otherwise, assume square frames (width = height). This means:
- If your strip image height doesn't match `frameH`, the frameW is ignored and square frames are assumed
- Always make sure `frameH` exactly matches the actual image height

## Hero Metadata Format (.txt files)

Located in `assets/chars/`. Format per line:
```
animName/frameNNNN = x y width height
```

Example (kote.txt):
```
idle/frame0000 = 0 0 64 64
idle/frame0001 = 64 0 64 64
idle/frame0002 = 128 0 64 64
idle/frame0003 = 192 0 64 64
run/frame0000 = 256 0 64 64
...
attack_A/frame0000 = 704 0 64 64
```

All hero frames are 64x64. The metadata parser (`Assets.parseMeta`) extracts the animation name and frame number, sorts frames by number, and groups by animation name.

## Drawing Pipeline

### R.drawHero(type, state, frame, x, y, w, h, flip)
1. Look up SpriteConfig.heroes[type]
2. Map game state to animation name via stateMap
3. Find frame data from parsed metadata
4. Scale: `dh = h * 1.5`, `dw = dh * (frameW/frameH)` (aspect-ratio preserving, 1.5x scale)
5. Position: feet anchored at entity bottom (`py = y + h - dh`)
6. Flip: if `flip`, use ctx.translate + ctx.scale(-1,1)
7. Draw the frame region from spritesheet

### R.drawEnemy(type, state, frame, x, y, w, h, flip)
Same pipeline but dispatches based on SpriteConfig.enemies[type].type:
- **meta**: Same as hero drawing
- **strip**: Calculate frame index, extract horizontal slice
- **single**: Draw entire image
- **fallback**: Programmatic canvas drawing if no sprite found

## Fixing Broken Sprite Sheets

Sprite sheets from free asset packs often have issues:
- Text labels ("SPRITESHEET", "16x16px") mixed into the image
- Multiple animation rows at different scales
- Inconsistent frame spacing

### Extraction Procedure (Python + PIL)

```python
from PIL import Image
import numpy as np

img = Image.open('original_sheet.png')
arr = np.array(img)
alpha = arr[:,:,3]

# 1. Find content bands (horizontal rows of sprites)
row_alpha = alpha.sum(axis=1)
# Look for gaps where row_alpha drops near zero

# 2. For each band, find frame boundaries
band_alpha = alpha[y0:y1+1, :].sum(axis=0)
# Look for vertical gaps in column alpha sums

# 3. Extract frames and create clean strip
# Normalize to uniform cell size
# Align feet to cell bottom (oy = cell_h - frame.height)
# Save as horizontal strip
```

Key points:
- Use alpha channel analysis (threshold ~30) to find content vs whitespace
- Look for vertical gaps of 3+ pixels between frames
- Normalize all frames to the same cell size (max_width + 4px padding)
- Align sprites to cell BOTTOM for ground anchoring
- Both idle and run strips for the same enemy should use matching cell dimensions

## Current Enemy Sprite Sizes

| Enemy | Type | Frame Size | States |
|-------|------|------------|--------|
| castle_knight | strip | auto/64 | idle, run |
| castle_archer | strip | auto/64 | idle, run |
| castle_priest | strip | auto/64 | idle, run |
| castle_soldier | strip | auto/64 | idle, run |
| hideout_fighter | strip | auto/64 | idle, run |
| darkmantle | strip | 24x16 | idle |
| draconian | strip | 82x54 | idle, run |
| spectator | strip | auto/96 | idle, attack |
| mimic | strip | 72x48 | idle, attack |
| ogre (mudman) | strip | auto/48 | idle |
| boilerdrak | strip | auto/48 | idle |
| goblin (orc_warrior) | strip | 32x32 | idle, run |
| bakaris | meta | 64x64 | idle, run, attack |
| kansaldi | meta | 64x64 | idle, run, attack, skill |

## Fallback Drawing

If a sprite is missing or fails to load, `R._drawEnemyFallback()` and `R._drawHeroFallback()` render characters using canvas primitives (rectangles, ellipses, gradients). This ensures the game never crashes from a missing sprite — it just looks less polished. Each character type has a unique programmatic appearance defined in these methods.
