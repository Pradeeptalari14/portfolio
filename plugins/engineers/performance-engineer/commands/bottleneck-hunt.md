---
description: "Interpret metrics, traces or profiles to locate the bottleneck"
argument-hint: "<latency breakdown, profile output or metrics>"
---

# /performance-engineer:bottleneck-hunt

Interpret metrics, traces or profiles to locate the bottleneck.

## Usage

```
/performance-engineer:bottleneck-hunt $ARGUMENTS
```

## Steps

1. Locate where time is spent.
2. Classify the bottleneck as compute, I/O, locking or queueing.
3. Rank the hypotheses.
4. Propose experiments to confirm.

## Output

A ranked hypothesis list with experiments and expected evidence.

If the input is missing or ambiguous, ask one focused question before continuing.
