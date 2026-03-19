# Sprite Assets

This directory contains all extracted and organized sprite assets for the Dragon Game.

## Sprite Summary

### Enemy Sprites (Strip Format)

| Sprite | File | Dimensions | Frames | Frame Size |
|--------|------|------------|--------|------------|
| Darkmantle (Idle) | `darkmantle_idle.png` | 384x16 | 16 | 24x16 |
| Spectator (Attack) | `spectator_attack.png` | 1056x96 | 11 | 96x96 |
| Spectator (Idle) | `spectator_idle.png` | 1920x96 | 20 | 96x96 |
| Mudman (Idle) | `mudman_idle.png` | 768x48 | 16 | 48x48 |
| Mudman (Appear) | `mudman_appear.png` | 288x48 | 6 | 48x48 |
| Mimic (Activate) | `mimic_activate.png` | 2088x48 | 29 | 72x48 |
| Mimic (Idle) | `mimic_idle.png` | 576x48 | 8 | 72x48 |

### Full-Sheet Sprites

| Sprite | File | Dimensions | Notes |
|--------|------|------------|-------|
| Dragonborn | `dragonborn.png` | 1408x768 | Boss sprite sheet |
| Kansaldi | `kansaldi.png` | 1680x2960 | Red-tinted copy of Minerva |

### Hero Sprites (Mana Seed Assets)

| Hero | File | Dimensions |
|------|------|------------|
| Kote (v01) | `mana_hero_v01.png` | 512x512 |
| Minerva (v02) | `mana_hero_v02.png` | 512x512 |
| Elber (v03) | `mana_hero_v03.png` | 512x512 |
| Nesta (v04) | `mana_hero_v04.png` | 512x512 |
| Nick (v05) | `mana_hero_v05.png` | 512x512 |

### Additional Files

| File | Purpose |
|------|---------|
| `kansaldi.txt` | Metadata for Kansaldi sprite (copied from minerva.txt) |

## Extraction Details

### Sources

1. **Darkmantle**: Super Pixel Alien Monster Pack 2.zip
   - Path: `Super Pixel Alien Monster Pack 2/PNG/exofish_A/frame0000-0015.png`

2. **Spectator**: Super Pixel Monsters Pack 2.zip
   - Attack path: `Super Pixel Monsters Pack 2/PNG/evil_eye_blue/attack/`
   - Idle path: `Super Pixel Monsters Pack 2/PNG/evil_eye_blue/idle/`

3. **Mudman**: Super Pixel Monsters Pack 1.zip
   - Idle path: `Super Pixel Monsters Pack 1/PNG/mudman_blue/idle/`
   - Appear path: `Super Pixel Monsters Pack 1/PNG/mudman_blue/appear/`

4. **Dragonborn**: Direct copy from `Assets/Dragonborn sprite.png`

5. **Mimic**: Mimic Chest.zip
   - Activate path: `Mimic Chest/style_A/PNG/activate/`
   - Idle path: `Mimic Chest/style_A/PNG/idle/`

6. **Mana Heroes**: FREE Mana Seed Character Base Demo 2.0.zip
   - Path: `char_a_p1/1out/char_a_p1_1out_fstr_v[01-05].png`

7. **Kansaldi**: Created from `game/assets/chars/minerva.png`
   - Applied red tint (increase red channel, decrease blue/green)

## Usage Notes

- **Strip Spritesheet Format**: Frames are arranged horizontally in PNG format with alpha transparency (RGBA)
- **Frame Indexing**: For strip spritesheets, frame index = pixel_x / frame_width
- **Mana Heroes**: 512x512 sheets appear to contain animation frames arranged in rows/columns
- **Dragonborn**: 1408x768 sheet needs analysis for frame layout

All sprites are stored in RGBA PNG format for compatibility with alpha transparency.
