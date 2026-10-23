---
description: "Create a load test plan with scenarios, load shape and pass criteria"
argument-hint: "<system description, expected traffic and SLOs>"
---

# /performance-engineer:load-test-plan

Create a load test plan with scenarios, load shape and pass criteria.

## Usage

```
/performance-engineer:load-test-plan $ARGUMENTS
```

## Steps

1. Derive the workload mix and peak rate.
2. Define scenarios and load profiles.
3. Set pass criteria from the SLOs.
4. Provide a starter script outline.

## Output

A load test plan and a starter k6 script outline.

If the input is missing or ambiguous, ask one focused question before continuing.
