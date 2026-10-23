---
description: "Analyse CI failure history and classify likely flaky tests and causes"
argument-hint: "<test results history or failure logs>"
---

# /qa-engineer:flaky-triage

Analyse CI failure history and classify likely flaky tests and causes.

## Usage

```
/qa-engineer:flaky-triage $ARGUMENTS
```

## Steps

1. Group failures by test and compute flake rate.
2. Classify the likely cause from the logs.
3. Rank by impact on the pipeline.
4. Propose a fix for each top offender.

## Output

A ranked flaky-test table with cause classification and fixes.

If the input is missing or ambiguous, ask one focused question before continuing.
