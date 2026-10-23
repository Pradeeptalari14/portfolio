---
description: "Turn commit or pull-request history into structured release notes"
argument-hint: "<commit list, PR titles or changelog fragments>"
---

# /release-engineer:release-notes

Turn commit or pull-request history into structured release notes.

## Usage

```
/release-engineer:release-notes $ARGUMENTS
```

## Steps

1. Group changes into features, fixes, breaking changes and internal.
2. Rewrite entries in user-facing language.
3. Highlight breaking changes with migration steps.
4. Suggest the next semantic version.

## Output

Release notes in Markdown with a proposed version number.

If the input is missing or ambiguous, ask one focused question before continuing.
