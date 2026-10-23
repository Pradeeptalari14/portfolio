---
description: "Build a release readiness checklist and decision record"
argument-hint: "<release scope and date>"
---

# /release-engineer:go-no-go

Build a release readiness checklist and decision record.

## Usage

```
/release-engineer:go-no-go $ARGUMENTS
```

## Steps

1. Create gates for quality, security, operations and communication.
2. Mark each gate based on supplied evidence and list gaps.
3. Recommend go or no-go with conditions.
4. Produce the decision record.

## Output

A gate table with a recommended decision and the open conditions.

If the input is missing or ambiguous, ask one focused question before continuing.
