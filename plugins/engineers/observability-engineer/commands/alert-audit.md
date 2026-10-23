---
description: "Audit alert rules for noise, missing runbooks and cause-based alerting"
argument-hint: "<alert rules file or alert history export>"
---

# /observability-engineer:alert-audit

Audit alert rules for noise, missing runbooks and cause-based alerting.

## Usage

```
/observability-engineer:alert-audit $ARGUMENTS
```

## Steps

1. Classify each rule as symptom or cause based.
2. Estimate actionability from the history if provided.
3. Recommend remove, merge, retune or keep for every rule.
4. Rewrite the top offenders.

## Output

A decision table per alert and rewritten rules for the worst offenders.

If the input is missing or ambiguous, ask one focused question before continuing.
