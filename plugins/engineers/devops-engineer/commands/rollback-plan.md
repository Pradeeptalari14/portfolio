---
description: "Produce a tested rollback plan with triggers and verification steps for a release"
argument-hint: "<release description>"
---

# /devops-engineer:rollback-plan

Produce a tested rollback plan with triggers and verification steps for a release.

## Usage

```
/devops-engineer:rollback-plan $ARGUMENTS
```

## Steps

1. List what changes in the release: code, schema, config, infrastructure.
2. Define the rollback trigger metrics and thresholds.
3. Write ordered rollback steps with the owner of each.
4. Add the post-rollback verification checks.

## Output

A one-page rollback runbook ready to paste into the change ticket.

If the input is missing or ambiguous, ask one focused question before continuing.
