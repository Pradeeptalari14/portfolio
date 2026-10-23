---
description: "Review GPU utilisation data and find waste and scheduling fixes"
argument-hint: "<utilisation metrics or workload list>"
---

# /ai-infra-engineer:gpu-utilization-review

Review GPU utilisation data and find waste and scheduling fixes.

## Usage

```
/ai-infra-engineer:gpu-utilization-review $ARGUMENTS
```

## Steps

1. Group workloads by pool and utilisation.
2. Find idle, fragmented or oversized allocations.
3. Recommend sharing, repacking or priority changes.
4. Estimate the saving.

## Output

A findings table with changes and estimated GPU-hour savings.

If the input is missing or ambiguous, ask one focused question before continuing.
