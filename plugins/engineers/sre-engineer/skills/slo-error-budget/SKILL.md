---
name: slo-error-budget
description: "Define SLIs, SLOs and an error-budget policy for a service. Trigger with 'set SLOs', 'define SLIs', 'error budget', 'burn rate alerts' or when a team has uptime goals but no measurable targets."
---

# Slo Error Budget

> Part of the **Site Reliability Engineer** plugin (`sre-engineer`).

## When to use

- A service has no agreed reliability target
- Alerts are threshold-based (CPU, memory) rather than user-impact based

## Workflow

1. Identify the critical user journeys (login, checkout, inference request) and the component that serves each.
2. Choose SLIs as a ratio of good events to valid events: availability, latency below a threshold at p95/p99, freshness or correctness where relevant.
3. Set the SLO from 28-day historical performance, then round to a target the business can defend. Never start from an aspirational 99.99%.
4. Compute the error budget: (1 - SLO) x window. 99.9% over 30 days is 43.2 minutes of full outage.
5. Define multi-window multi-burn-rate alerts: 14.4x over 1h and 5m pages immediately, 6x over 6h and 30m pages, 1x over 3d opens a ticket.
6. Write the budget policy: what happens at 50%, 75% and 100% consumed (feature freeze, reliability sprint, exec review).

## Quality checklist

- [ ] Every SLI is measured at the load balancer or client edge, not only inside the pod
- [ ] Valid-event definition excludes health checks and bot traffic
- [ ] Alerts reference burn rate, not raw error count
- [ ] Budget policy is signed off by the product owner, not only by engineering

## Output format

```markdown
## SLO Specification: [Service]
| Journey | SLI | Target | Window |
|---------|-----|--------|--------|
| [Checkout] | good requests / valid requests | 99.9% | 28d rolling |

**Error budget:** [minutes or requests per window]
**Alerts:** [burn rate, long window, short window, action]
**Policy:** [what happens as the budget is consumed]
```

## Common pitfalls

- Averaging latency instead of using percentiles hides tail pain.
- Setting the SLO above what dependencies can deliver makes the budget unattainable.
- Counting planned maintenance against the budget without agreeing the exclusion first.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
