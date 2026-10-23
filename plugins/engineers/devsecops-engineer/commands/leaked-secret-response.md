---
description: "Generate an incident checklist for a leaked credential"
argument-hint: "<secret type, where it was exposed and for how long>"
---

# /devsecops-engineer:leaked-secret-response

Generate an incident checklist for a leaked credential.

## Usage

```
/devsecops-engineer:leaked-secret-response $ARGUMENTS
```

## Steps

1. Assess the blast radius and exposure window.
2. List revocation and rotation steps for the specific provider.
3. Plan audit-log review for misuse.
4. Add preventive controls.

## Output

A time-ordered response checklist with owners and verification steps.

If the input is missing or ambiguous, ask one focused question before continuing.
