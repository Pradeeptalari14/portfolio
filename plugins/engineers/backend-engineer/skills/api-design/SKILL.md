---
name: api-design
description: "Design consistent, evolvable HTTP APIs. Trigger with 'design an API', 'REST endpoints', 'pagination', 'versioning', 'error format' or 'idempotency'."
---

# Api Design

> Part of the **Backend Engineer** plugin (`backend-engineer`).

## When to use

- A new service exposes an API to other teams
- Existing endpoints are inconsistent

## Workflow

1. Model resources and relationships first, then name endpoints with nouns and use HTTP methods and status codes consistently.
2. Use cursor-based pagination, filtering and sorting conventions across all list endpoints.
3. Return a standard error body with a stable code, message and request id (for example RFC 9457 problem details).
4. Require idempotency keys on unsafe operations that clients may retry, such as payments.
5. Plan evolution: additive changes, deprecation headers, and explicit versions only for breaking changes. Publish an OpenAPI description and test against it.

## Quality checklist

- [ ] Every endpoint documents authentication and rate limits
- [ ] Breaking changes are detected automatically in CI
- [ ] Timeouts and limits are defined for request size and duration
- [ ] Responses never leak internal identifiers or stack traces

## Output format

```markdown
## API Design: [Service]
| Method | Path | Purpose | Idempotent | Auth |
|--------|------|---------|------------|------|
| POST | /orders | create order | key | OAuth |

**Errors:** [format]
**Versioning:** [policy]
```

## Common pitfalls

- Using offset pagination on large mutable lists.
- Returning 200 with an error in the body.
- Verbs in paths and inconsistent naming across teams.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
