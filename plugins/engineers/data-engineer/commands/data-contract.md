---
description: "Draft a data contract for a dataset from sample schema and usage"
argument-hint: "<sample schema, producer and consumers>"
---

# /data-engineer:data-contract

Draft a data contract for a dataset from sample schema and usage.

## Usage

```
/data-engineer:data-contract $ARGUMENTS
```

## Steps

1. Infer fields, types and constraints.
2. Propose freshness and volume expectations.
3. List quality tests.
4. Draft the change policy.

## Output

A data contract document with tests and a change policy.

If the input is missing or ambiguous, ask one focused question before continuing.
