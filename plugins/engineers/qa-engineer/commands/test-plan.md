---
description: "Generate a risk-based test plan for a feature"
argument-hint: "<feature description and acceptance criteria>"
---

# /qa-engineer:test-plan

Generate a risk-based test plan for a feature.

## Usage

```
/qa-engineer:test-plan $ARGUMENTS
```

## Steps

1. Identify risks and edge cases.
2. Map each risk to a test level.
3. List concrete test cases with data needs.
4. Define entry and exit criteria.

## Output

A test plan with cases by level, data requirements and exit criteria.

If the input is missing or ambiguous, ask one focused question before continuing.
