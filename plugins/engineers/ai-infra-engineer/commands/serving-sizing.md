---
description: "Estimate replicas and GPU count for a model from traffic and latency targets"
argument-hint: "<model, GPU type, request rate, token lengths, latency target>"
---

# /ai-infra-engineer:serving-sizing

Estimate replicas and GPU count for a model from traffic and latency targets.

## Usage

```
/ai-infra-engineer:serving-sizing $ARGUMENTS
```

## Steps

1. Estimate memory for weights and KV cache per concurrent request.
2. Estimate tokens per second per GPU and required concurrency.
3. Compute replicas with headroom for failure and bursts.
4. State assumptions and what to measure to verify.

## Output

A sizing table, assumptions and a load-test checklist.

If the input is missing or ambiguous, ask one focused question before continuing.
