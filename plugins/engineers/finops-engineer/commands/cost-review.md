---
description: "Analyse a cost export and rank savings opportunities"
argument-hint: "<cost report or billing export summary>"
---

# /finops-engineer:cost-review

Analyse a cost export and rank savings opportunities.

## Usage

```
/finops-engineer:cost-review $ARGUMENTS
```

## Steps

1. Group spend by service, team and environment.
2. Spot anomalies and untagged spend.
3. Rank opportunities by monthly saving and effort.
4. Highlight quick wins that need no engineering work.

## Output

A ranked savings table with quick wins and owners to confirm.

If the input is missing or ambiguous, ask one focused question before continuing.
