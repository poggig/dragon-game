---
name: game-brief
description: Turn a client's prompt + loose notes into a complete, structured game brief through a short interview. Use when a new client request arrives, before any design or build work. Args - the client's raw prompt and notes (or a path to a file containing them).
---

# /game-brief — client request → structured brief

## Steps

1. Read `templates/BRIEF_TEMPLATE.md` and any client material passed in args
   (inline text or file path).
2. Launch the **client-interviewer** agent with the raw material. It will:
   - mine the notes for everything already answered,
   - ask the user (acting as the client) up to two rounds of targeted
     questions via AskUserQuestion,
   - write `briefs/<recipient-slug>-brief.md` with an `Assumptions` section
     for anything unanswered.
3. Present the brief summary to the user: recipient, occasion, emotional
   goal, the 3 strongest personalization hooks, playtime/language/difficulty,
   and open questions.
4. Ask whether to proceed straight into `/new-minigame` with this brief.

## Quality bar

A brief is complete when a stranger could build the right game from it:
it names the moment (how/where the game is revealed), the cast with roles,
at least 5 concrete personalization details, tone boundaries, languages,
and target playtime. If any of these are missing, the interview isn't done.
