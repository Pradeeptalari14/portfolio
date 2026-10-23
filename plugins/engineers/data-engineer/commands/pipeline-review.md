---
description: "Review a pipeline or DAG for idempotency, backfill safety and failure handling"
argument-hint: "<DAG code, SQL or description>"
---

# /data-engineer:pipeline-review

Review a pipeline or DAG for idempotency, backfill safety and failure handling.

## Usage

```
/data-engineer:pipeline-review $ARGUMENTS
```

## Steps

1. Check each task for idempotency and time-dependence.
2. Evaluate retries, timeouts and alerting.
3. Assess backfill and late data handling.
4. Return fixes ordered by risk.

## Output

A risk-ordered findings list with corrected examples.

If the input is missing or ambiguous, ask one focused question before continuing.
