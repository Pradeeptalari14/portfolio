---
description: "Generate a STRIDE threat model from a design description"
argument-hint: "<system or feature description>"
---

# /appsec-engineer:threat-model

Generate a STRIDE threat model from a design description.

## Usage

```
/appsec-engineer:threat-model $ARGUMENTS
```

## Steps

1. Extract components, data flows and trust boundaries.
2. Enumerate threats per element.
3. Rate and prioritise them.
4. Propose mitigations and security tests.

## Output

A threat table with ratings, mitigations and suggested tests.

If the input is missing or ambiguous, ask one focused question before continuing.
