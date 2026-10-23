---
description: "Draft SLIs, SLOs and burn-rate alert rules for a service"
argument-hint: "<service name and its main user journey>"
---

# /sre-engineer:slo-draft

Draft SLIs, SLOs and burn-rate alert rules for a service.

## Usage

```
/sre-engineer:slo-draft $ARGUMENTS
```

## Steps

1. Ask for the service, traffic profile and any existing metrics if they were not given.
2. Propose two or three SLIs with concrete PromQL or query expressions.
3. Calculate the error budget in minutes and in requests for the chosen window.
4. Generate multi-window burn-rate alert rules and the escalation policy.

## Output

An SLO spec table, PromQL recording and alert rules, and a one-paragraph budget policy.

If the input is missing or ambiguous, ask one focused question before continuing.
