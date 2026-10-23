---
name: resilience-patterns
description: "Make service-to-service calls resilient. Trigger with 'timeouts', 'retries', 'circuit breaker', 'cascading failure', 'backpressure' or 'service is slow when a dependency is slow'."
---

# Resilience Patterns

> Part of the **Backend Engineer** plugin (`backend-engineer`).

## When to use

- A dependency outage takes down callers
- Retries amplify load during incidents

## Workflow

1. Set a timeout on every outbound call, shorter than the caller timeout so the budget shrinks along the chain.
2. Retry only safe or idempotent operations, with exponential backoff, jitter and a retry budget.
3. Add circuit breakers and bulkheads so a failing dependency cannot exhaust shared threads or connections.
4. Apply load shedding and backpressure with bounded queues and concurrency limits.
5. Define graceful degradation: cached or default responses, and feature fallbacks, then test with fault injection.

## Quality checklist

- [ ] No unbounded queue or unlimited retry exists
- [ ] Deadlines propagate across service calls
- [ ] Fallback behaviour is exercised in tests
- [ ] Dashboards show retry rate, breaker state and queue depth

## Output format

```markdown
## Resilience Review: [Service]
| Dependency | Timeout | Retry | Breaker | Fallback |
|------------|---------|-------|---------|----------|
| [payments] | 800 ms | 2, jitter | yes | queue |
```

## Common pitfalls

- Retrying at every layer, multiplying load.
- Timeouts longer than the upstream caller deadline.
- Circuit breakers with no half-open probing or metrics.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
