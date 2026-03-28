---
name: atomic-patch
description: Safe single-replacement script pattern for editing large HTML/JS files (500+ lines) where the Edit tool may fail due to ambiguous matches. Use when editing game_v2/index.html and an Edit tool call fails, or when renaming a function across many call sites.
---

# Atomic Patch Skill

## When to Use
- File is 500+ lines AND Edit tool fails with "ambiguous match" or finds wrong location
- Renaming a function/variable across N call sites simultaneously
- Making a replacement where the target string appears in multiple places

## When NOT to Use
- Small files (<200 lines) — just use Edit
- Edit tool succeeds on first try — don't over-engineer

## The Pattern

### Single replacement (most common)
```python
# patch.py
with open('game_v2/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'EXACT_STRING_TO_REPLACE'
new = 'REPLACEMENT_STRING'

cnt = content.count(old)
assert cnt == 1, f"Expected 1 match, got {cnt}"
content = content.replace(old, new, 1)

with open('game_v2/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
```

### Multi-site replacement (rename across all callers)
```python
old = 'buildLevel1Arena(this.tm,W,H)'
new = 'buildCastleArena(this.tm,W,H)'
cnt = content.count(old)
assert cnt == 3, f"Expected 3, got {cnt}"
content = content.replace(old, new)  # no limit = replace all
print(f"Replaced {cnt} sites.")
```

### Multiple replacements in one script
```python
replacements = [
    ('buildLevel1Arena(', 'buildCastleArena(', 1),   # (old, new, expected_count)
    ('buildLevel2Arena(', 'buildGardenPath(',  3),
    ('buildLevel5Ruins(', 'buildRuinsField(',  6),
]
for old, new, expected in replacements:
    cnt = content.count(old)
    assert cnt == expected, f"{old}: expected {expected}, got {cnt}"
    content = content.replace(old, new)
    print(f"OK: {old} -> {new} ({cnt} sites)")
```

## Workflow
1. Write script to `patch.py` (temp file in project root)
2. Run: `python patch.py`
3. Verify all "OK" / "Patch applied." lines printed
4. Delete `patch.py` with `rm patch.py`

## Uniqueness Strategy
If `content.count(old) != 1`, extend the old string with surrounding context:
```python
# Add 1-2 lines of surrounding unique context
old = (
    "buildArena(this.tm,W,H,this.act);\n"
    "    this.decos=genDecos(W,H,'castle',this.act);\n"
    "\n"
    "    this.heroes=this.createHeroes(50,"
)
```

## Windows Gotcha: Print Encoding
On Windows with CP1252 shell, avoid non-ASCII characters in print statements:
```python
# WRONG — crashes on Windows
print(f"Step 1 OK: buildLevel1Arena -> buildCastleArena")  # -> is fine
print(f"Step 1 OK: buildLevel1Arena \u2192 buildCastleArena")  # \u2192 crashes

# RIGHT — use ASCII arrows
print(f"Step 1 OK: {old} -> {new} ({cnt} sites)")
```

## Active File
`game_v2/index.html` (~2700 lines) — as documented in CLAUDE.md.
