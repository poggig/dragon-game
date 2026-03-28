# Level Design Reference

## Level Overview

| Level | Name | Class | Tilesets | Heroes | Combat? |
|-------|------|-------|----------|--------|---------|
| 1 | School Day | Lv1 | tiles_castle | All 5 (incl. Nesta) | Yes |
| 2 | Kingfisher Festival | Lv2 | tiles_garden | 4 (no Nesta) | Yes + fishing |
| 3 | Library of Secrets | Lv3 | tiles_library | 4 (no Nesta) | Yes + stealth |
| 4 | Yurthgreen Masquerade | Lv4 | tiles_castle | All 5 (Nesta returns) | No (story) |
| 5 | When the Home Burns | Lv5 | tiles_dungeon | All 5 | Yes (6 acts) |

## Heroes

| Name | Color | customType | Role |
|------|-------|------------|------|
| Kote | #40aa88 | kote | Rogue — protagonist |
| Minerva | #cc44cc | minerva | Warrior — Solamnic knight |
| Elber | #44aa44 | elber | Druid — nature magic |
| Nesta | #4488cc | nesta | Dark mage — absent in Levels 2-3 |
| Nick | #d0a066 | nick | Necromancer |
| Bakaris | #aa5533 | bakaris | Rival — enemy in L1, NPC in L4 |

## buildArena(tm, W, H, seed)

Procedurally generates a tilemap with ground and platforms.

```
Parameters:
  W     — map width in tiles (typically 120-180)
  H     — map height in tiles (typically 16-20)
  seed  — deterministic seed (usually this.act)

Generated layout:
  Ground:  rows H-3, H-2, H-1 (3 rows deep, tile value 1)
  P2:      row H-7   (~60% coverage, tile 3, 5-8 tile wide platforms)
  P3:      row H-10  (~30% coverage, tile 3, 4-6 tiles wide)
  P4:      row H-13  (~15% coverage, tile 3, 3-4 tiles wide)
```

Platform placement uses seeded pseudo-random gaps. The seed affects starting positions and gap widths, but the general distribution stays consistent.

## Level 1: School Day (Lv1)

**Story**: Heroes take their final exam at Azurerune Fortress. Bakaris is their rival.

### Acts
1. **The Final Exam** — Arena combat tutorial. Defeat Bakaris + 3 students (castle_soldier, castle_archer, hideout_fighter). W=120, H=18.
2. **Blood and Grudge** — Pure cutscene. Bakaris kills Nesta's fox. Nesta retaliates, scarring Bakaris forever.
3. **The Hallway** — Exploration. Talk to NPCs (Levna Drakehorn, Clystran, Darrett, Andir). Walk right to progress. W=150, H=16.
4. **The Library** — Stealth + combat. Avoid guard, defeat 2 Mimic Books. Reach x>700. W=150, H=18.
5. **Story ending** — Cutscene transition to Level 2.

## Level 2: Kingfisher Festival (Lv2)

**Story**: Heroes travel to Vogler village for the Kingfisher Festival. Nesta is absent (punished for scarring Bakaris).

### Acts
1. **River Ambush** — Combat. 3 Darkmantles. W=150, H=18.
2. **Festival Center** — Exploration with NPCs. W=150, H=18.
3. **Fishing Competition** — Minigame. Timing-based (cast with Space, reel when bobber dips). W=150, H=18.
4. **Kapak Attack** — Boss fight. Draconian Kapak (120 HP, boss AI). W=150, H=18.

## Level 3: Library of Secrets (Lv3)

**Story**: Heroes infiltrate the Library of Secrets.

### Acts
1. **Silent Entry** — Stealth zone. W=120, H=20.
2. **The Stacks** — Platforming. W=120, H=20.
3. **Cursed Armory** — Boss: Cursed Sword (80 HP, static). W=120, H=20.
4. **The Inner Sanctum** — Boss: The Spectator (110 HP, static, beholder-like). W=120, H=20.
5. **Escape** — Timed escape sequence. W=120, H=20.

## Level 4: Yurthgreen Masquerade (Lv4)

**Story**: A masquerade ball. Nesta returns to the party. Story-focused, no combat.

### Acts
1. **Ballroom** — NPC conversations (Bakaris as NPC, Levna, Clystran, Becklin, Cudgel, Tem Temble). W=180, H=16.
2. **Armor Ceremony** — Minerva receives Solamnic armor.
3. **Dark Pact** — Lohezet offers Nesta a dark pact.
4. **The Ritual** — Ispin's ritual; Kote sees a vision of his mother.
5. **Farewell** — Story conclusion.

## Level 5: When the Home Burns (Lv5)

**Story**: Vogler is attacked. Multiple escalating battles culminating in an unwinnable boss.

### Acts
1. **Calm Before Storm** — NPC: Armory Master. W=150, H=18.
2. **Mercenary Ambush** — 4 castle soldiers. W=150, H=18.
3. **Draconian Reinforcements** — 2 draconians. W=150, H=18.
4. **Sivak Draconian** — Boss (150 HP, 32x40). W=150, H=18.
5. **Boilerdrak** — Mechanical dragon boss (200 HP, 28x36). Fire overlay. W=150, H=18.
6. **Ogre & Goblin** — Dual boss. Goblin Chief rides Ogre; falls when Ogre dies. W=150, H=18.
7. **Kansaldi Fire Eyes** — Unwinnable escape sequence. 999 HP, must flee right to x>1800. W=150, H=18.

## Common Level Setup Pattern

```javascript
bActN(){
    this.act = N;
    this.tileset = 'tiles_castle';  // or garden/library/dungeon
    const W = 150, H = 18;
    this.tm = new TM(W, H);
    this.enemies = []; this.npcs = [];
    this.tut = false;

    buildArena(this.tm, W, H, this.act);
    this.decos = genDecos(W, H, 'castle', this.act);

    this.heroes = this.createHeroes(50, (H-4)*T, includeNesta);
    this.heroes[0].ctrl = true;
    this.ai = 0;

    this.enemies = [
        new Enem(500, (H-4)*T, 28, 40, 'Guard', '#4466aa', 40, 8, 'patrol', 'castle_knight'),
    ];

    this.rebuildCompanions();  // MUST call — snaps all entities to ground
    this.hud();
    document.getElementById('hud').style.display = 'flex';

    D.show([d('Speaker','Text')], () => { this.tut = true; });
}
```

## Win Conditions (checked in update())

- **Combat**: `this.enemies.filter(e=>e.on).length === 0` → all enemies dead
- **Exploration**: `activeHero.x > targetX` → reached exit point
- **Stealth**: `activeHero.x > targetX` without being detected
- **Boss**: Specific boss's `hp <= 0`
- **Escape**: `activeHero.x > escapeX` (Kansaldi fight)

## Decoration Themes

```javascript
DecoThemes = {
    castle:  { ground: ['barrel','pot','bench','rock_sm'], wall: ['banner_red','banner_blue','window','candelabra'] },
    garden:  { ground: ['tree','bush','rock_lg','rock_md','mushroom'], wall: ['tree','dead_tree'] },
    library: { ground: ['barrel','pot','candle','potion'], wall: ['candelabra','banner_blue','window'] },
    dungeon: { ground: ['rock_lg','rock_md','barrel','weapons'], wall: ['chain','candelabra','banner_red'] }
}
```

Decorations are generated by `genDecos(W, H, theme, seed)` and drawn behind entities at reduced opacity for depth.
