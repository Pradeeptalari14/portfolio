---
description: "Plan a cloud migration using the 6R strategy per workload"
argument-hint: "<list of applications and constraints>"
---

# /cloud-engineer:migration-plan

Plan a cloud migration using the 6R strategy per workload.

## Usage

```
/cloud-engineer:migration-plan $ARGUMENTS
```

## Steps

1. Classify each application as rehost, replatform, refactor, repurchase, retire or retain.
2. Order the waves by dependency and risk.
3. Define cutover and rollback for the first wave.
4. Estimate effort and highlight data-transfer constraints.

## Output

A wave plan with 6R classification, dependencies and a cutover checklist.

If the input is missing or ambiguous, ask one focused question before continuing.
