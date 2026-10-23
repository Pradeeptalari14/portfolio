---
description: "Design a backup restore drill with RTO and RPO measurement"
argument-hint: "<database, backup tool and targets>"
---

# /database-engineer:restore-drill

Design a backup restore drill with RTO and RPO measurement.

## Usage

```
/database-engineer:restore-drill $ARGUMENTS
```

## Steps

1. State the RTO and RPO targets.
2. Define the drill: restore to an isolated host and replay to a point in time.
3. List integrity checks to run after restore.
4. Record timings and compare with the targets.

## Output

A drill runbook, validation queries and a results template.

If the input is missing or ambiguous, ask one focused question before continuing.
