---
description: "Run a six-pillar architecture review on a described workload"
argument-hint: "<architecture description or diagram notes>"
---

# /cloud-engineer:waf-review

Run a six-pillar architecture review on a described workload.

## Usage

```
/cloud-engineer:waf-review $ARGUMENTS
```

## Steps

1. Extract components, data flows and failure domains.
2. Evaluate each pillar and rate the risk.
3. List high risks with a concrete mitigation each.
4. Give a go or no-go recommendation.

## Output

A pillar-by-pillar risk table and a prioritised mitigation plan.

If the input is missing or ambiguous, ask one focused question before continuing.
