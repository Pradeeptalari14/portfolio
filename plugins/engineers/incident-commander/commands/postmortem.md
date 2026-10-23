---
description: "Generate a blameless postmortem draft from incident notes"
argument-hint: "<timeline notes, chat excerpts or alert data>"
---

# /incident-commander:postmortem

Generate a blameless postmortem draft from incident notes.

## Usage

```
/incident-commander:postmortem $ARGUMENTS
```

## Steps

1. Order events into a UTC timeline.
2. Extract impact and contributing factors.
3. Run a five whys analysis.
4. Propose owned action items.

## Output

A complete postmortem draft ready for review.

If the input is missing or ambiguous, ask one focused question before continuing.
