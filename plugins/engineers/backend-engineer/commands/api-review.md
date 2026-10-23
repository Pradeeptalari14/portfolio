---
description: "Review an API spec for consistency, safety and evolvability"
argument-hint: "<OpenAPI spec or endpoint list>"
---

# /backend-engineer:api-review

Review an API spec for consistency, safety and evolvability.

## Usage

```
/backend-engineer:api-review $ARGUMENTS
```

## Steps

1. Check naming, methods and status codes.
2. Review pagination, errors and idempotency.
3. Check auth, limits and versioning.
4. Return fixes ordered by impact.

## Output

A prioritised list of API issues with corrected examples.

If the input is missing or ambiguous, ask one focused question before continuing.
