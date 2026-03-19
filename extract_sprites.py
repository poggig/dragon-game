#!/usr/bin/env python3
"""
Comprehensive sprite extraction script for Dragon Game.
Extracts and organizes sprite assets from zip files.
"""

import os
import sys
import shutil
import zipfile
from pathlib import Path
from PIL import Image

# Base paths
BASE_DIR = Path("/sessions/jolly-festive-einstein/mnt/Project 1 - Dragon game")
ASSETS_DIR = BASE_DIR / "Assets"
GAME_ASSETS_DIR = BASE_DIR / "game" / "assets"
SPRITES_DIR = GAME_ASSETS_DIR / "sprites"
CHARS_DIR = GAME_ASSETS_DIR / "chars"

def create_sprites_dir():
    """Create the sprites directory if it doesn't exist."""
    SPRITES_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[SETUP] Created sprites directory: {SPRITES_DIR}")

def make_strip(frame_paths, output_path):
    """Combine frames into a horizontal strip spritesheet."""
    if not frame_paths:
        print(f"[ERROR] No frames found for {output_path}")
        return

    frames = [Image.open(p).convert('RGBA') for p in sorted(frame_paths)]
    w, h = frames[0].size
    strip = Image.new('RGBA', (w * len(frames), h), (0, 0, 0, 0))

    for i, frame in enumerate(frames):
        strip.paste(frame, (i * w, 0))

    strip.save(output_path)
    print(f"[STRIP] {output_path}")
    print(f"        Size: {strip.size}, Frames: {len(frames)}, Frame size: {w}x{h}")

def extract_darkmantle():
    """Extract Darkmantle (exofish_A) from Super Pixel Alien Monster Pack 2."""
    print("\n=== DARKMANTLE (exofish_A) ===")
    zip_path = ASSETS_DIR / "Super Pixel Alien Monster Pack 2.zip"

    if not zip_path.exists():
        print(f"[SKIP] {zip_path} not found")
        return

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            frame_paths = []
            for i in range(16):  # frame0000 through frame0015
                frame_name = f"Super Pixel Alien Monster Pack 2/PNG/exofish_A/frame{i:04d}.png"
                if frame_name in zf.namelist():
                    with zf.open(frame_name) as f:
                        frame_data = f.read()
                        temp_path = Path(f"/tmp/exofish_{i:04d}.png")
                        temp_path.write_bytes(frame_data)
                        frame_paths.append(temp_path)

            if frame_paths:
                output = SPRITES_DIR / "darkmantle_idle.png"
                make_strip(frame_paths, output)
                # Cleanup
                for p in frame_paths:
                    p.unlink()
            else:
                print("[ERROR] No frames found for exofish_A")
    except Exception as e:
        print(f"[ERROR] Failed to extract darkmantle: {e}")

def extract_spectator():
    """Extract Spectator (evil_eye_blue) from Super Pixel Monsters Pack 2."""
    print("\n=== SPECTATOR (evil_eye_blue) ===")
    zip_path = ASSETS_DIR / "Super Pixel Monsters Pack 2.zip"

    if not zip_path.exists():
        print(f"[SKIP] {zip_path} not found")
        return

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            # Extract attack frames
            attack_frames = []
            for name in sorted(zf.namelist()):
                if "evil_eye_blue/attack/" in name and name.endswith(".png"):
                    with zf.open(name) as f:
                        frame_data = f.read()
                        temp_path = Path(f"/tmp/{Path(name).name}")
                        temp_path.write_bytes(frame_data)
                        attack_frames.append(temp_path)

            if attack_frames:
                output = SPRITES_DIR / "spectator_attack.png"
                make_strip(attack_frames, output)
                for p in attack_frames:
                    p.unlink()

            # Extract idle frames
            idle_frames = []
            for name in sorted(zf.namelist()):
                if "evil_eye_blue/idle/" in name and name.endswith(".png"):
                    with zf.open(name) as f:
                        frame_data = f.read()
                        temp_path = Path(f"/tmp/{Path(name).name}")
                        temp_path.write_bytes(frame_data)
                        idle_frames.append(temp_path)

            if idle_frames:
                output = SPRITES_DIR / "spectator_idle.png"
                make_strip(idle_frames, output)
                for p in idle_frames:
                    p.unlink()
    except Exception as e:
        print(f"[ERROR] Failed to extract spectator: {e}")

def extract_mudman():
    """Extract Mudman (mudman_blue) from Super Pixel Monsters Pack 1 as fallback."""
    print("\n=== MUDMAN (mudman_blue - fallback) ===")
    zip_path = ASSETS_DIR / "Super Pixel Monsters Pack 1.zip"

    if not zip_path.exists():
        print(f"[SKIP] {zip_path} not found")
        return

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            # Extract idle frames
            idle_frames = []
            for name in sorted(zf.namelist()):
                if "mudman_blue/idle/" in name and name.endswith(".png"):
                    with zf.open(name) as f:
                        frame_data = f.read()
                        temp_path = Path(f"/tmp/{Path(name).name}")
                        temp_path.write_bytes(frame_data)
                        idle_frames.append(temp_path)

            if idle_frames:
                output = SPRITES_DIR / "mudman_idle.png"
                make_strip(idle_frames, output)
                for p in idle_frames:
                    p.unlink()

            # Extract appear frames
            appear_frames = []
            for name in sorted(zf.namelist()):
                if "mudman_blue/appear/" in name and name.endswith(".png"):
                    with zf.open(name) as f:
                        frame_data = f.read()
                        temp_path = Path(f"/tmp/{Path(name).name}")
                        temp_path.write_bytes(frame_data)
                        appear_frames.append(temp_path)

            if appear_frames:
                output = SPRITES_DIR / "mudman_appear.png"
                make_strip(appear_frames, output)
                for p in appear_frames:
                    p.unlink()
    except Exception as e:
        print(f"[ERROR] Failed to extract mudman: {e}")

def extract_dragonborn():
    """Copy Dragonborn sprite."""
    print("\n=== DRAGONBORN ===")
    src = ASSETS_DIR / "Dragonborn sprite.png"
    dst = SPRITES_DIR / "dragonborn.png"

    if not src.exists():
        print(f"[SKIP] {src} not found")
        return

    try:
        img = Image.open(src)
        print(f"[COPY] {src}")
        print(f"       Size: {img.size}")
        img.save(dst)
        print(f"       Saved to: {dst}")
    except Exception as e:
        print(f"[ERROR] Failed to extract dragonborn: {e}")

def extract_mimic():
    """Extract Mimic from Mimic Chest.zip."""
    print("\n=== MIMIC ===")
    zip_path = ASSETS_DIR / "Mimic Chest.zip"

    if not zip_path.exists():
        print(f"[SKIP] {zip_path} not found")
        return

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            # Extract activate frames
            activate_frames = []
            for name in sorted(zf.namelist()):
                if "style_A/PNG/activate/" in name and name.endswith(".png"):
                    with zf.open(name) as f:
                        frame_data = f.read()
                        temp_path = Path(f"/tmp/{Path(name).name}")
                        temp_path.write_bytes(frame_data)
                        activate_frames.append(temp_path)

            if activate_frames:
                output = SPRITES_DIR / "mimic_activate.png"
                make_strip(activate_frames, output)
                for p in activate_frames:
                    p.unlink()

            # Check for idle frames
            idle_frames = []
            for name in sorted(zf.namelist()):
                if "style_A/PNG/idle/" in name and name.endswith(".png"):
                    with zf.open(name) as f:
                        frame_data = f.read()
                        temp_path = Path(f"/tmp/{Path(name).name}")
                        temp_path.write_bytes(frame_data)
                        idle_frames.append(temp_path)

            if idle_frames:
                output = SPRITES_DIR / "mimic_idle.png"
                make_strip(idle_frames, output)
                for p in idle_frames:
                    p.unlink()
    except Exception as e:
        print(f"[ERROR] Failed to extract mimic: {e}")

def extract_mana_heroes():
    """Extract Mana Seed Character Base Demo heroes."""
    print("\n=== MANA SEED HEROES ===")
    zip_path = ASSETS_DIR / "FREE Mana Seed Character Base Demo 2.0.zip"

    if not zip_path.exists():
        print(f"[SKIP] {zip_path} not found")
        return

    hero_variants = [
        ("v01", "Kote"),
        ("v02", "Minerva"),
        ("v03", "Elber"),
        ("v04", "Nesta"),
        ("v05", "Nick"),
    ]

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            for variant, hero_name in hero_variants:
                frame_path = f"char_a_p1/1out/char_a_p1_1out_fstr_{variant}.png"
                if frame_path in zf.namelist():
                    with zf.open(frame_path) as f:
                        frame_data = f.read()
                        output = SPRITES_DIR / f"mana_hero_{variant}.png"
                        output.write_bytes(frame_data)

                        img = Image.open(output)
                        print(f"[EXTRACT] {frame_path}")
                        print(f"          Hero: {hero_name}, Size: {img.size}, Saved to: {output}")
                else:
                    print(f"[SKIP] {frame_path} not found")
    except Exception as e:
        print(f"[ERROR] Failed to extract mana heroes: {e}")

def create_kansaldi():
    """Create Kansaldi by red-tinting Minerva's sprite."""
    print("\n=== KANSALDI (Red-tinted Minerva) ===")
    src = CHARS_DIR / "minerva.png"
    src_txt = CHARS_DIR / "minerva.txt"
    dst = SPRITES_DIR / "kansaldi.png"
    dst_txt = SPRITES_DIR / "kansaldi.txt"

    if not src.exists():
        print(f"[SKIP] {src} not found")
        return

    try:
        # Load Minerva sprite
        img = Image.open(src).convert('RGBA')
        print(f"[LOAD] Minerva sprite: {img.size}")

        # Apply red tint
        data = img.getdata()
        new_data = []
        for item in data:
            r, g, b, a = item
            # Increase red, decrease blue and green for red tint
            new_r = min(255, int(r * 1.3))
            new_g = max(0, int(g * 0.6))
            new_b = max(0, int(b * 0.6))
            new_data.append((new_r, new_g, new_b, a))

        img.putdata(new_data)
        img.save(dst)
        print(f"[TINT] Applied red tint, saved to: {dst}")

        # Copy metadata txt file
        if src_txt.exists():
            shutil.copy(src_txt, dst_txt)
            print(f"[COPY] Copied {src_txt} to {dst_txt}")
    except Exception as e:
        print(f"[ERROR] Failed to create kansaldi: {e}")

def main():
    """Main extraction script."""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║     DRAGON GAME - SPRITE ASSET EXTRACTION SCRIPT          ║")
    print("╚════════════════════════════════════════════════════════════╝")

    # Setup
    create_sprites_dir()

    # Extract all sprites
    extract_darkmantle()
    extract_spectator()
    extract_mudman()
    extract_dragonborn()
    extract_mimic()
    extract_mana_heroes()
    create_kansaldi()

    print("\n╔════════════════════════════════════════════════════════════╗")
    print("║              EXTRACTION COMPLETE                           ║")
    print("╚════════════════════════════════════════════════════════════╝")

    # List all created sprites
    print("\n[SUMMARY] Created sprites in:", SPRITES_DIR)
    sprite_files = sorted(SPRITES_DIR.glob("*.png"))
    for sprite in sprite_files:
        img = Image.open(sprite)
        print(f"  - {sprite.name}: {img.size}")

if __name__ == "__main__":
    main()
