# Chronicles of Azurerune — Asset Catalog
# Edit this file to remap assets. The game reads from these paths.

## HEROES (Playable Characters)
All use spritesheet + .txt metadata for frame positions.

| Character | File | Type | Frame Size | Description |
|-----------|------|------|-----------|-------------|
| Kote | chars/kote.png + .txt | Classic | 40x40 | Green-tunicked rogue. Animations: idle_A(7f), run(10f), punch_A(8f), dash_attack(9f), jump(3f), fall(3f), die(4f) |
| Minerva | chars/minerva.png + .txt | Knight Red | 112x80 | Red-haired warrior. Animations: idle(12f), run(8f), attack_A(13f), attack_C(15f), jump_loop(4f), fall(4f), dash_loop(4f), die(12f) |
| Elber | chars/elber.png + .txt | Knight Green | 112x80 | Inventor/druid with goggles. Same animation set as Minerva but green palette. |
| Nesta | chars/nesta.png + .txt | Knight Violet | 112x80 | Dark mage, hooded. Same animation set as Minerva but violet palette. |
| Nick | chars/nick.png + .txt | Knight Blue | 112x80 | Necromancer. Same animation set as Minerva but blue palette. Used as NPC in some acts. |
| Bakaris | chars/bakaris.png + .txt | Classic | 40x40 | Antagonist. Same animation set as Kote but different palette (style_4). |

## SKILL & ATTACK EFFECTS
Horizontal sprite strips. All attacks are 448x64 (7 frames of 64x64).

| Effect | File | Dimensions | Frames | Description |
|--------|------|-----------|--------|-------------|
| Kote Attack | fx/kote_atk.png | 448x64 | 7x 64x64 | Blue impact burst |
| Kote Skill | fx/kote_skill.png | 896x128 | 7x 128x128 | Lightning strike (blue) |
| Minerva Attack | fx/minerva_atk.png | 448x64 | 7x 64x64 | Red impact burst |
| Minerva Skill | fx/minerva_skill.png | 576x96 | 6x 96x96 | Fire burst (yellow) |
| Elber Attack | fx/elber_atk.png | 448x64 | 7x 64x64 | Green impact burst |
| Elber Skill | fx/elber_skill.png | 2048x128 | 16x 128x128 | Nature heal (green) |
| Nesta Attack | fx/nesta_atk.png | 448x64 | 7x 64x64 | Dark impact burst |
| Nesta Skill | fx/nesta_skill.png | 3200x64 | 50x 64x64 | Death spell (violet) |

## ENEMIES — Pixel Crawler Style (horizontal strips, 64x64 frames)
Format: Idle = 256x64 (4 frames), Run = 384x64 (6 frames), Death = 384x64 (6 frames), Hit = 256x64 (4 frames)

### Castle Enemies (Act 1 — Arena)
| Enemy | Folder | Description |
|-------|--------|-------------|
| Royal Knight | enemies/castle_knight/ | Armored knight, melee |
| Royal Archer | enemies/castle_archer/ | Bow-wielding guard |
| Royal Soldier | enemies/castle_soldier/ | Foot soldier |
| Royal Priest | enemies/castle_priest/ | Magic-using cleric |

### Library Enemies (Act 4 — Library infiltration)
| Enemy | Folder | Description |
|-------|--------|-------------|
| Cataloguer | enemies/lib_cataloguer/ | Library scholar, catalogues forbidden books |
| Censor | enemies/lib_censor/ | Book-burning inquisitor |
| Director | enemies/lib_director/ | Head librarian boss |
| Researcher | enemies/lib_researcher/ | Knowledge-seeking scholar |

### Hideout Enemies (for bandits/rogues scenes)
| Enemy | Folder | Description |
|-------|--------|-------------|
| Fighter | enemies/hideout_fighter/ | Bandit melee fighter |
| Scout | enemies/hideout_scout/ | Bandit scout/lookout |

### Dungeon/General Enemies
| Enemy | Folder | Frame Size | Description |
|-------|--------|-----------|-------------|
| Orc | enemies/orc/ | 32x32 idle, 64x64 run/death | Basic orc grunt |
| Orc Warrior | enemies/orc_warrior/ | 32x32 idle, 64x64 run, 80x80 death | Heavy orc fighter |
| Skeleton | enemies/skeleton/ | 32x32 idle, 64x64 run/death | Basic undead |
| Skeleton Mage | enemies/skeleton_mage/ | 32x32 idle, 64x64 run/death | Magic-casting skeleton |

### Original Pack Enemies (from Gigapack)
| Enemy | File | Frame Size | Description |
|-------|------|-----------|-------------|
| Evil Eye Red | enemies/evil_eye_red.png + .txt | 96x96 | Floating eye, red. idle(20f), attack(11f) |
| Evil Eye Blue | enemies/evil_eye_blue.png | 96x96 | Floating eye, blue variant. Same layout as red. |
| Mimic Chest | enemies/mimic.png + .txt OR mimic/spritesheet.png + .txt | 72x48 | Animated chest. idle(8f), activate(29f), attack_A(13f), hit(8f), die_A(17f) |
| Hell Hand Red | enemies/hell_hand_red.png | — | Reaching hand enemy, red |
| Hell Hand Violet | enemies/hell_hand_violet.png | — | Reaching hand enemy, violet |
| Bat | enemies/bat_idle/move/atk.png | 96x96 | Bat with idle, movement, attack strips |

## ENVIRONMENT TILESETS
All tilesets are grids of 16x16 tiles.

| Tileset | File | Dimensions | Description |
|---------|------|-----------|-------------|
| Castle | env/castle/tiles.png | 416x400 | Castle stone walls, floors, pillars, windows, doors |
| Castle (hideout) | env/castle/hideout_tiles.png | 416x400 | Alternative castle/hideout style |
| Library | env/library/tiles.png | 400x400 | Bookshelves, reading desks, scrolls, candles |
| Library 4x | env/library/tiles_4x.png | 1600x1600 | Same tiles at 4x resolution for reference |
| Dungeon | env/dungeon/dungeon_tiles.png | 400x400 | Generic dungeon floors and walls |
| Floors | env/dungeon/floors_tiles.png | 400x416 | Various floor patterns (stone, wood, grass) |
| Walls | env/dungeon/wall_tiles.png | 400x400 | Wall tiles with variations |
| Wall Variations | env/dungeon/wall_variations.png | — | Additional wall styles |
| Water | env/dungeon/water_tiles.png | 400x400 | Water and liquid tiles |
| Garden | env/garden/tiles.png | 480x480 | Outdoor garden/festival tiles (for Level 2) |
| Castle Mockup | env/castle/mockup.png | — | Example scene layout using castle tiles |

## PROPS & DECORATIONS
| Prop | File | Description |
|------|------|-------------|
| Dungeon Props | env/props/dungeon_props.png | Chains, cages, barrels, crates, bones |
| Furniture | env/props/furniture.png | Tables, chairs, beds, shelves |
| Rocks | env/props/rocks.png | Various rock formations |
| Vegetation | env/props/vegetation.png | Plants, bushes, flowers |
| Esoteric | env/props/esoteric.png | Magic circles, runes, crystals |
| Building Walls | env/props/building_walls.png | Structural wall pieces |
| Building Floors | env/props/building_floors.png | Floor sections |
| Building Props | env/props/building_props.png | Doors, windows, stairs |

## WEAPONS
| Weapon Set | File | Description |
|------------|------|-------------|
| Castle | env/weapons/castle_weapons.png | Swords, shields, maces |
| Library | env/weapons/library_weapons.png | Staves, scrolls, quills |
| Bone | env/weapons/bone.png | Bone weapons |
| Hands | env/weapons/hands.png | Unarmed/hand sprites |
| Wood | env/weapons/wood.png | Wooden weapons (clubs, bows) |

## UI ELEMENTS
| UI Piece | Files | Description |
|----------|-------|-------------|
| HP Meters | ui/meter_{left,center,right}_{red,green,blue,violet}.png | Health bar segments for each hero color |

## HOW TO SWAP ASSETS
1. Replace any .png file with your own at the same dimensions
2. For Pixel Crawler enemies: maintain the strip format (Idle=4f, Run=6f, Death=6f, Hit=4f at 64x64 per frame)
3. For characters with .txt metadata: update the .txt file if frame positions change
4. For effect strips: keep the same width-per-frame ratio

## ORIGINAL ASSET PACKS (in /Assets/ zips)
- Super Pixel Heroes - Knight (Dark, Ranger, Warrior) — 3 complete knight variants
- Super Pixel Heroes - Classic Character — Lightweight 40x40 character
- Pixel Crawler — Castle, Cave, Cemetery, Desert, Fairy Forest, Forge, Garden, Hideout, Library, Sewer, Free Pack
- Super Pixel Effects Gigapack v1.9.0 — 100+ effect types
- Fantasy FX Pack 3, Explosion FX Pack 1, Projectiles Pack 4
- Mimic Chest, Bat Fur, Alien Monster Pack 2, Monsters Pack 2
- Objects & Items packs, Skill Icons packs
- Royal Crown UI, Viking Hearth UI
