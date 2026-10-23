---
description: "Generate an end-to-end ML pipeline blueprint for a use case"
argument-hint: "<model type, data source and serving target>"
---

# /mlops-engineer:pipeline-blueprint

Generate an end-to-end ML pipeline blueprint for a use case.

## Usage

```
/mlops-engineer:pipeline-blueprint $ARGUMENTS
```

## Steps

1. Confirm data sources, training cadence and serving latency.
2. Lay out stages, artifacts and gates.
3. Choose tooling for tracking, registry and serving.
4. Provide a rollout and rollback plan.

## Output

A stage-by-stage blueprint with tools, gates and rollout plan.

If the input is missing or ambiguous, ask one focused question before continuing.
