---
description: "Review pasted Terraform plan output for destructive or risky changes"
argument-hint: "<terraform plan output>"
---

# /iac-engineer:tf-plan-review

Review pasted Terraform plan output for destructive or risky changes.

## Usage

```
/iac-engineer:tf-plan-review $ARGUMENTS
```

## Steps

1. Extract all create, update, replace and destroy actions.
2. Flag stateful resources and permission changes.
3. Explain what forces each replacement.
4. Give a verdict and the safest apply order.

## Output

A risk table per resource and an approve, conditional or block verdict.

If the input is missing or ambiguous, ask one focused question before continuing.
