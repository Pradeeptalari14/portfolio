---
description: "Audit a service dependency map for timeouts, retries and failure isolation"
argument-hint: "<dependency list with current timeout and retry settings>"
---

# /backend-engineer:resilience-audit

Audit a service dependency map for timeouts, retries and failure isolation.

## Usage

```
/backend-engineer:resilience-audit $ARGUMENTS
```

## Steps

1. Check each call for timeout, retry and breaker configuration.
2. Find retry amplification and shared-pool risks.
3. Recommend limits and fallbacks.
4. List fault-injection tests to run.

## Output

A per-dependency table with recommended settings and fault tests.

If the input is missing or ambiguous, ask one focused question before continuing.
