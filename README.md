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
| `Z` or `J` | Attack *(also talks to NPCs)* |
| `Q` or `L` | Skill ability |
| `K` | Dash *(brief invulnerability!)* |
| `X` | Ultimate *(once per level — make it count!)* |
| `R` | Revive a fallen ally *(uses a resurrection scroll)* |
| `1–5` | Swap active hero |
| `Tab` | Cycle heroes |
| `ESC` | Pause *(resume / restart act / quit to title)* |
| `M` | Toggle music |
| `Space` / `Enter` | Advance dialogue |

---

## 🦸 The Party

| Hero | Role | Signature Move |
|------|------|---------------|
| 🛡️ **Minerva** | Tank | Titan Form — doubles size & damage for 20s; Ultimate: Cleave AoE |
| ⚡ **Elber** | Balanced DPS | Fires amber energy bolts; Ultimate: freezing amber shot |
| 🗡️ **Kote** | Glass Cannon | Hits like a truck, dies like a napkin; Ultimate: 5-way barrage |
| 💀 **Nick** | Healer | Skills heal allies; Ultimate fires a bone projectile (yes, his own) |
| 🌀 **Nesta** | Ranged | Shoots violet lightning; Ultimate turns the *whole party invisible* |

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
- **Stealth sections**: hug the safe path (green glow). Getting caught restarts the act (not the whole level, and no dialogue replay).
- **Resurrection Scrolls** (R key): you only get 2 across the whole game. Save them for bosses.
- **Swap often** — different heroes shine in different situations. Nick's heal mid-fight can turn a wipe.
- **Ultimate [X] resets each level** — use it freely in every new stage.
- **If the party wipes**, you can retry the current act — no page reloads needed.
- **EN/ES/IT**: the language toggle now translates the entire story, and you can switch mid-game.

---

## 🛠️ Tech

No frameworks, no build step, no npm install. Pure canvas2D + Web Audio API,
organized as four plain-JS modules (see [AUDIT.md](AUDIT.md) for the full
refactor story):

```
game_v3/
├── index.html      ← DOM shell (~80 lines)
├── src/
│   ├── engine.js   ← game-agnostic engine: rendering, physics, entities, audio
│   ├── data.js     ← game content: stats, sprites, maps, full EN/ES/IT i18n
│   ├── scenes.js   ← Scene base class + the five levels
│   └── main.js     ← fixed-timestep loop, title/pause/game-over/victory
└── assets/
    ├── chars/      ← character spritesheets
    ├── enemies/    ← enemy sprites
    ├── env/        ← tilesets & props
    └── fx/         ← animated effect strips
```

Want to build your own game on this engine? `engine.js` knows nothing about
Azurerune — swap `data.js` and `scenes.js` for your own content.

---

## 📦 Download & Run (one-liner)

```bash
git clone https://github.com/poggig/dragon-game.git && cd dragon-game && python -m http.server 8003 --directory game_v3
```

Then open `http://localhost:8003` 🎮

---

*Made with ❤️, cursed lore, and an unreasonable number of patch scripts.*
