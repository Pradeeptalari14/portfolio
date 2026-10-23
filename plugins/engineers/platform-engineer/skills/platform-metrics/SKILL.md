---
name: platform-metrics
description: "Measure platform and delivery health using DORA and developer-experience signals. Trigger with 'DORA metrics', 'platform adoption', 'developer productivity' or 'is the platform working'."
---

# Platform Metrics

> Part of the **Platform Engineer** plugin (`platform-engineer`).

## When to use

- Leadership asks for platform ROI
- Adoption is flat and the reason is unknown

## Workflow

1. Capture the four DORA metrics: deployment frequency, lead time for changes, change failure rate, time to restore.
2. Add platform signals: onboarding time, self-service ratio, ticket volume per team and adoption of each capability.
3. Segment by team so averages do not hide outliers.
4. Pair the numbers with a short developer survey to explain the why.
5. Choose one metric to improve this quarter and name the owner.

## Quality checklist

- [ ] Metrics come from systems of record, not self-reporting
- [ ] Definitions are written down and stable between quarters
- [ ] Metrics are never used to rank individual engineers
- [ ] There is a qualitative signal alongside every number

## Output format

```markdown
## Platform Health: [Quarter]
| Metric | Last | Now | Trend |
|--------|------|-----|-------|
| Lead time | [x] | [y] | [up or down] |

**Focus metric:** [one] — **Owner:** [name]
```

## Common pitfalls

- Gaming deployment frequency with trivial releases.
- Reporting only averages instead of medians and percentiles.
- Measuring output volume rather than outcomes for developers.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
