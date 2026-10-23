---
description: "Analyse reference and current data summaries for drift and recommend actions"
argument-hint: "<feature statistics or sample descriptions for both windows>"
---

# /mlops-engineer:drift-report

Analyse reference and current data summaries for drift and recommend actions.

## Usage

```
/mlops-engineer:drift-report $ARGUMENTS
```

## Steps

1. Compare feature distributions between windows.
2. Score drift per feature and rank them.
3. Explain likely causes such as upstream change or seasonality.
4. Recommend investigate, retrain or ignore.

## Output

A ranked drift table and a recommended action.

If the input is missing or ambiguous, ask one focused question before continuing.
