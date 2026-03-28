# Chronicles of Azurerune — Project Rules

## Active Development File

- **Edit this:** `game_v2/index.html` — the improved version (~2700 lines)
- **Never touch:** `game/index.html` — frozen MVP kept for comparison

## Editing Large Files

`game_v2/index.html` is ~2700 lines. The Edit tool sometimes fails on files this large due to ambiguous string matches. If an Edit fails, use a Python atomic-patch script:

```python
with open('game_v2/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'EXACT_STRING_TO_REPLACE'
new = 'REPLACEMENT_STRING'

assert content.count(old) == 1, f"Expected 1 match, got {content.count(old)}"
content = content.replace(old, new, 1)

with open('game_v2/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
```

1. Write the script to a temp file (e.g., `patch.py`)
2. Run: `python patch.py`
3. Verify the change looks correct
4. Delete `patch.py`

This pattern guarantees exactly one replacement and is safe to use on any large single-file project.

## Dev Servers

Configured in `.claude/launch.json`. Start with Claude Preview:
- Port 8000 → `game/` (original MVP, for comparison)
- Port 8001 → `game_v2/` (active version)

Runtime: `python -m http.server <port> --bind 127.0.0.1 --directory <folder>`
