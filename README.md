# ⚔️ Chronicles of Azurerune

> *A 2D side-scrolling action platformer set in a world of magic academies, underwater dungeons, masked balls, and very angry skeletons.*

```
  🐉  ════════════════════════════════════════════  🐉
       ✨  Five heroes. Five levels. Zero chill.  ✨
  🐉  ════════════════════════════════════════════  🐉
```

---

## 🗺️ The Story

You and your party of five misfit students just accidentally turned a final exam into a bloodbath. Now you're being hunted across the kingdom — through flooded caverns, secret libraries, masquerade halls, and the burning ruins of home.

Classic school trip.

---

## 🎮 How to Play

### Option A — Play in Browser (easiest)

1. Clone or download this repo
2. Open a terminal in the project folder
3. Run a local server:
   ```bash
   python -m http.server 8003 --directory game_v3
   ```
4. Open `http://localhost:8003` in your browser
5. Pick a level and go

### Option B — Just open the file

Some browsers let you open `game_v3/index.html` directly. If assets don't load, use Option A.

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `← →` or `A D` | Move |
| `↑` / `W` / `Space` | Jump (double jump available!) |
| `Z` or `J` | Attack |
| `Q` or `L` | Skill ability |
| `K` | Dash |
| `X` | R-Ability *(once per level — make it count!)* |
| `R` | Revive a fallen ally *(uses a resurrection scroll)* |
| `1–5` | Swap active hero |
| `Tab` | Cycle heroes |
| `M` | Toggle music |
| `Space` / `Enter` | Advance dialogue |

---

## 🦸 The Party

| Hero | Role | Signature Move |
|------|------|---------------|
| 🛡️ **Minerva** | Tank | Titan Form — doubles size & damage for 20s, then Cleave AoE |
| ⚡ **Elber** | Balanced DPS | Fires amber energy bolts; R-Ability launches a massive fireball |
| 🗡️ **Kote** | Glass Cannon | Hits like a truck, dies like a napkin; R-Ability: 5-way barrage |
| 💀 **Nick** | Healer | Skills heal allies; R-Ability fires a bone projectile (yes, his own) |
| 🌀 **Nesta** | Ranged | Shoots violet lightning; R-Ability turns her *invisible for 4 seconds* |

> 🦊 Nesta's black fox familiar follows her everywhere.
> 💀 Nick's skeleton follows him. It's fine. He's fine.

---

## 📖 Levels

| # | Name | Vibe |
|---|------|------|
| 1 | 🏰 **School Day** | Castle, goblins, a stealth section, and a teacher who *really* won't let go |
| 2 | 🌊 **Kingfisher Festival** | Underwater arena, floating Darkmantles, and darkness-zone abilities |
| 3 | 📚 **Library of Secrets** | Stealth through a cursed library; animated swords want you gone |
| 4 | 🎭 **Yurthgreen Masquerade** | A fancy party gone completely wrong |
| 5 | 🔥 **When the Home Burns** | Ruins, a dragon, and whatever's left of your soul |

---

## 💡 Tips

- **Hero HP persists between levels** — if Kote barely survived Lv3, she starts Lv4 on 3 HP. Protect your glass cannons.
- **Stealth sections**: hug the safe path (green glow). Getting caught restarts the whole level. 😬
- **Resurrection Scrolls** (R key): you only get 2 across the whole game. Save them for bosses.
- **Swap often** — different heroes shine in different situations. Nick's heal mid-fight can turn a wipe.
- **X ability resets each level** — use it freely in every new stage.

---

## 🛠️ Tech

Built entirely in a **single HTML file** — no frameworks, no build step, no npm install. Pure canvas2D + Web Audio API.

```
game_v3/
├── index.html      ← the whole game (~4300 lines of JS)
└── assets/
    ├── heroes/     ← character spritesheets
    ├── enemies/    ← enemy sprites
    ├── tiles/      ← tileset PNGs
    └── fx/         ← animated effect strips
```

---

## 📦 Download & Run (one-liner)

```bash
git clone https://github.com/poggig/dragon-game.git && cd dragon-game && python -m http.server 8003 --directory game_v3
```

Then open `http://localhost:8003` 🎮

---

*Made with ❤️, cursed lore, and an unreasonable number of patch scripts.*
