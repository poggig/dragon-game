---
name: sprite-extractor
description: Extract, upscale, tint, and stitch pixel-art sprite frames from a source sheet into a uniform strip PNG. Use when asked to "rebuild sprites", "extract frames from sheet", "create sprite strip", "recolor sprite", or "use X.png as source for character Y".
---

# Sprite Extractor Skill

## When to Trigger
- "Rebuild sprites", "extract frames from sheet", "create sprite strip"
- "Use X.png as the base for character Y's sprite"
- "Recolor the draconian sprite to silver/copper/bronze"
- Sprite renders incorrectly in-game and source sheet needs to be re-extracted

## Core Workflow

### 1. Inspect the source sheet
```python
from PIL import Image
img = Image.open('source_sheet.png').convert('RGBA')
print(img.size)  # e.g. (1408, 768)
```

### 2. Locate frame rows by scanning blank columns
```python
# Find column groups separated by fully-transparent columns
import numpy as np
arr = np.array(img)
# Column is blank if all pixels have alpha=0
blank_cols = [x for x in range(arr.shape[1]) if arr[:, x, 3].max() == 0]
# Frame boundaries = consecutive groups of non-blank columns
```

### 3. Extract frames and find bounding boxes
```python
frames = []
for x_start, x_end in frame_ranges:  # computed from blank column scan
    frame = img.crop((x_start, y_start, x_end, y_end))
    # Tight bounding box (exclude transparent rows/cols)
    bbox = frame.getbbox()
    frames.append(frame.crop(bbox))
```

### 4. Create uniform cells — ALWAYS bottom-align
```python
CELL_W, CELL_H = 80, 96  # adjust to content; use largest bounding box + padding
strip = Image.new('RGBA', (CELL_W * len(frames), CELL_H), (0, 0, 0, 0))
for i, frame in enumerate(frames):
    # Bottom-align: feet at same baseline
    x_off = (CELL_W - frame.width) // 2
    y_off = CELL_H - frame.height
    strip.paste(frame, (i * CELL_W + x_off, y_off), frame)
```

### 5. Upscale — ALWAYS use NEAREST for pixel art
```python
# Never use LANCZOS/BICUBIC — they blur pixel art
upscaled = frame.resize((frame.width * 4, frame.height * 4), Image.NEAREST)
```

### 6. Save strip
```python
strip.save('output_idle.png')
print(strip.size)  # verify: (CELL_W * num_frames, CELL_H)
```

## Recoloring (Tinted Variants)
```python
# Multiply-blend a color onto the sprite (preserves shading, changes hue)
def tint_sprite(img_path, tint_rgb, out_path):
    img = Image.open(img_path).convert('RGBA')
    r, g, b, a = img.split()
    tr, tg, tb = [c / 255.0 for c in tint_rgb]
    r = r.point(lambda v: int(v * tr))
    g = g.point(lambda v: int(v * tg))
    b = b.point(lambda v: int(v * tb))
    Image.merge('RGBA', (r, g, b, a)).save(out_path)

tint_sprite('dragonborn_idle.png', (192, 200, 208), 'dragonborn_sivak.png')   # silver
tint_sprite('dragonborn_idle.png', (184, 115, 51),  'dragonborn_kapak.png')   # copper
tint_sprite('dragonborn_idle.png', (205, 127, 50),  'dragonborn_bozak.png')   # bronze
```

## SpriteConfig Update (game_v2/index.html)
After saving the new strip, update `SpriteConfig`:
```javascript
// frameW × numFrames = strip width, frameH = strip height
dragonborn_sivak: { type:'strip', frameW:80, frameH:96, ... }
```
Frame count is auto-computed: `Math.floor(imgWidth / frameW)`.

## Key Pitfalls
- **Source padding:** Sheets often have blank borders. Always use `getbbox()` to find actual content.
- **Inconsistent frame sizes:** Use the LARGEST bounding box as the uniform cell so nothing is clipped.
- **Bottom-align:** All sprites must share the same baseline (feet row) so jump/run animations look correct.
- **NEAREST only:** Any other filter destroys pixel art crispness.
- **Verify output:** `print(strip.size)` — width must equal `CELL_W * numFrames`, height must equal `CELL_H`.

## Files in This Project
- Source sheet: `Assets/Dragonborn sprite.png` (1408×768)
- Output strips: `game_v2/assets/sprites/dragonborn_idle.png`, `dragonborn_run.png`
- SpriteConfig: `game_v2/index.html` ~line 648
