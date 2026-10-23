---
description: "Analyse pages, tickets and runbooks to rank toil by cost and propose fixes"
argument-hint: "<paste of on-call pages or ticket export>"
---

# /sre-engineer:toil-audit

Analyse pages, tickets and runbooks to rank toil by cost and propose fixes.

## Usage

```
/sre-engineer:toil-audit $ARGUMENTS
```

## Steps

1. Group the supplied events by root cause and service.
2. Estimate hours per month for each group.
3. Rank by cost and label each as remove, self-heal or automate.
4. Return the top five items with an effort estimate.

## Output

A ranked toil table with proposed fixes and an expected on-call reduction.

If the input is missing or ambiguous, ask one focused question before continuing.
