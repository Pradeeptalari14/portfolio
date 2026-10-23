---
description: "Create an evaluation plan with datasets, metrics and release gates for an LLM feature"
argument-hint: "<feature description and failure modes seen>"
---

# /llmops-engineer:eval-plan

Create an evaluation plan with datasets, metrics and release gates for an LLM feature.

## Usage

```
/llmops-engineer:eval-plan $ARGUMENTS
```

## Steps

1. Define success criteria and unacceptable failures.
2. Propose dataset composition and size.
3. Select metrics and judge rubric.
4. Set CI gates and online monitoring.

## Output

An evaluation plan with dataset spec, metrics, thresholds and gating rules.

If the input is missing or ambiguous, ask one focused question before continuing.
