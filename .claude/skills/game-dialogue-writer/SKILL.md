---
name: game-dialogue-writer
description: |
  Generalized skill for writing and expanding in-game dialogue for story-driven RPGs and action-platformers. Use when writing NPC conversations, cutscene scripts, character voice lines, boss dialogue, or tutorial text for any game project. Triggers on: writing game dialogue, expanding NPC text, creating character voice lines, writing cutscene scripts, narrative pacing, or any in-game text content.
---

# Game Dialogue Writer — Development Skill

This skill captures patterns for writing compelling, character-consistent in-game dialogue for story-driven games. Based on work on Chronicles of Azurerune (Dragonlance-inspired fantasy platformer).

---

## Core Dialogue Writing Principles

### 1. Character Voice Before Plot
Every line should sound like this specific character, not like "a character delivering information." Ask: would this person use this word? This sentence length?

**Short-sentence characters** (direct, guarded, action-oriented):
- Skip filler words: no "well," "you know," "I think"
- End on action or consequence
- Never explain their feelings — show them

**Long-sentence characters** (intellectual, reflective, formal):
- Complete thoughts, not fragments
- May use embedded clauses or qualifications
- Reference frameworks (lore, history, principles)

### 2. Subtext Over Statement
Never state what can be implied. If a character is afraid, they don't say "I'm afraid" — they change the subject, ask a question, or make a practical remark.

**Weak:** `d('Nesta', 'I am nervous about this mission.')`
**Strong:** `d('Nesta', 'How many exits does this building have?')`

### 3. Reveal Character Through Disagreement
The richest dialogue moments are when characters respond to the same event differently. Use these moments to establish:
- Who asks questions vs. who acts
- Who trusts authority vs. who questions it
- Who thinks about others vs. who thinks about the task

### 4. The Last Line of a Scene
The final line of any dialogue sequence is what the player carries forward. It should either:
- Set up the next action (informational)
- Leave a question unanswered (tension)
- Land on a character's defining trait

---

## Technical Constraints

### Dialogue Box Limits
```javascript
// Format:
d('Speaker Name', 'Dialogue text here.')

// Max safe line length: 160 characters
// Speaker name appears bold above text
// Advances on Space or mouse click
```

Long lines wrap gracefully, but over 200 characters becomes hard to read at 14px font size. Split into two beats rather than one long sentence.

### Sequence Format
```javascript
D.show([
  d('Narrator', 'The vault door opens slowly.'),
  d('Guard',    'Nobody passes here. Nobody.'),
  d('Hero',     'Then I suppose this is goodbye.'),
], () => { /* callback: next act, next scene, etc. */ });
```

Keep callbacks intact when editing existing sequences. Only replace the array content.

### Escape Characters
Use `\'` for apostrophes inside single-quoted strings:
```javascript
d('Lohezet', 'Don\'t think too long.')  // correct
d('Lohezet', "Don't think too long.")   // also fine if consistent
```

---

## Character Voice Reference (Chronicles of Azurerune)

### Kote (Protagonist)
- Earnest, curious, loyal, discovering his heritage
- Asks questions others avoid ("Why didn't she tell me?")
- Doesn't hide vulnerability but doesn't wallow in it
- References: things he learned, things he was told
- Avoid: cynicism, sarcasm, lengthy speeches

### Nesta (Shadow Assassin)
- Guarded, precise, self-reliant
- Short sentences. Fragments acceptable.
- Reveals nothing about feelings
- Uses practical framing for emotional moments ("How many exits?")
- Avoid: emotional declarations, trust declarations, explaining her motivations

### Minerva (Scholar/Mage)
- Intellectual, observant, slightly formal
- Notices specific details ("The grain of this wood is wrong")
- Frames uncertainty as hypothesis ("This suggests...")
- Hesitates out loud when uncertain about identity/role
- Avoid: slang, fragmented sentences

### Elber (Druid)
- Calm, nature-connected, philosophical
- Speaks in complete, unhurried thoughts
- References natural cycles and interconnection
- Rarely challenges directly — poses alternatives
- Avoid: urgency, anger, rapid-fire responses

### Nick (Knight)
- Practical, direct, slight dry humor
- Former military bearing — short tactical assessments
- Processes grief by focusing on what was accomplished
- "We're alive. They made sure of that." not "I'll miss them."
- Avoid: sentimentality, lengthy moral reasoning

### Bakaris (Rival/Antagonist)
- Proud, wounded (literally scarred), oscillates between contempt and hidden respect
- References family, honor, status
- Never admits error directly — deflects to circumstances
- Occasional moments where the mask slips
- Avoid: mustache-twirling villainy, pure cruelty

### Lohezet (Mysterious Mentor)
- Enigmatic, measured, never reveals more than needed
- States facts as invitations ("The Dragon Armies are moving")
- Answers questions with observations, not answers
- Never explains her own motivations
- Avoid: exposition dumps, explicit threats

### Becklin (Mentor/Protector)
- Maternal authority, protects others instinctively
- Warmth with practical urgency ("I shouldn't do this here. But I've run out of time.")
- Self-sacrificing without sentimentality
- In final moments: giving orders, not farewells
- Avoid: excessive sentiment, self-pity

---

## Lore Reference (Chronicles of Azurerune / Dragonlance-Adjacent)

| Term | Meaning |
|------|---------|
| Azurerune Fortress | Magic academy where the heroes trained |
| Dragon Armies | The antagonist military force advancing on the realm |
| Solamnic Knights | Honorable order of knights; Helena Starmantle was one |
| Neraka | Site of a historic catastrophic battle |
| The Cataclysm | Ancient world-altering disaster; dragons supposedly went extinct |
| Blue dragon | Rare, powerful; their wounds leave spiral scars that never fade |
| The Masquerade | Yurthgreen festival; cover for political events in Act 4 |
| Lohezet | Shadow mage offering a pact to Nesta |
| Ispin | Keeper of old scryer knowledge |
| Arturito | Loyal AI/construct companion; sacrifices himself at the end |

---

## NPC Dialogue Patterns

### Tutorial NPCs
- Integrate instructions into character voice, never fourth-wall break
- **Weak:** `d('Guard', 'Press Z to attack.')`
- **Strong:** `d('Combat Master', 'Your footwork is wrong. Get in close, then strike.')` (then the mechanic is demonstrated)

### One-Time NPCs (lore delivery)
- They should have a reason to tell the player this
- Use "I heard / my uncle told me / the records show" framing
- Leave one detail unexplained as a hook

### Recurring Characters
- Repeat a verbal tic or phrase structure across appearances to build recognition
- Their attitude should shift based on how the story has progressed

### Enemy Taunts
- Short (1 line max)
- Specific to the hero's identity or situation
- Reveals something about the enemy's values

---

## Pacing Guidelines

### Scene Types and Line Counts

| Scene Type | Ideal Lines | Notes |
|------------|------------|-------|
| Tutorial prompt | 1–2 | Immediate, actionable |
| NPC conversation | 3–5 | One revelation per NPC |
| Story cutscene | 6–10 | Setup + turn + consequence |
| Major reveal | 8–14 | Earn the space; plant subtext |
| Final scene / epilogue | 10–16 | Don't rush. Last impression. |

### The Three-Beat Structure
Even short sequences benefit from three beats:
1. **Setup:** What's happening / what's at stake
2. **Turn:** A reveal, challenge, or disagreement
3. **Button:** The line that sends you forward

---

## Common Mistakes to Avoid

1. **Information dumps** — Characters don't say "As you know, Bob..." Reveal lore through conversation, not monologue.
2. **Everyone agrees** — Conflict reveals character. Even allies should have different instincts.
3. **Describing the obvious** — If the player can see the burning building, the character doesn't need to say "The building is on fire."
4. **Forgetting the callback** — Always check the `()=>{...}` callback on D.show and preserve it exactly.
5. **Identical sentence length** — Vary the rhythm. A long line followed by a short one lands harder than two long lines.
6. **Missing apostrophe escapes** — `don\'t`, `won\'t`, `I\'ve` or use double-quoted strings.
