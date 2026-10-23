---
description: "Plan a drift detection and remediation process for an environment"
argument-hint: "<environment and tooling description>"
---

# /iac-engineer:drift-check

Plan a drift detection and remediation process for an environment.

## Usage

```
/iac-engineer:drift-check $ARGUMENTS
```

## Steps

1. Choose the detection method: scheduled plan, cloud config rules, or a drift tool.
2. Define what counts as drift versus accepted manual change.
3. Set the alert route and the reconcile policy.
4. Write the weekly review checklist.

## Output

A drift process document with schedule, alerting and remediation rules.

If the input is missing or ambiguous, ask one focused question before continuing.
