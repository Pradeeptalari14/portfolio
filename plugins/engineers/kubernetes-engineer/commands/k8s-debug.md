---
description: "Walk through a structured diagnosis for a failing pod or service"
argument-hint: "<symptom, kubectl output or logs>"
---

# /kubernetes-engineer:k8s-debug

Walk through a structured diagnosis for a failing pod or service.

## Usage

```
/kubernetes-engineer:k8s-debug $ARGUMENTS
```

## Steps

1. Identify the failure class from the supplied output.
2. List the exact kubectl commands to gather missing evidence.
3. Propose the most likely causes ranked by evidence.
4. Give the fix and a guard to prevent recurrence.

## Output

A ranked cause list, the commands to confirm each, and the fix.

If the input is missing or ambiguous, ask one focused question before continuing.
