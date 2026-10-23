---
name: load-test-design
description: "Design realistic load and stress tests with clear pass criteria. Trigger with 'load test', 'performance test', 'how many users can we handle', 'stress test' or 'soak test'."
---

# Load Test Design

> Part of the **Performance Engineer** plugin (`performance-engineer`).

## When to use

- A launch or campaign will raise traffic significantly
- Capacity limits are unknown

## Workflow

1. Model the workload from production: request mix, think time, payload sizes and data cardinality.
2. Choose the test type: baseline, load to expected peak, stress to failure, spike and soak for leaks.
3. Use an open model (arrival rate) for internet traffic so latency growth does not hide overload.
4. Define pass criteria from SLOs: p95 and p99 latency, error rate and saturation limits.
5. Run against a production-like environment, observe every tier, and identify the first bottleneck.

## Quality checklist

- [ ] Test data and caches resemble production
- [ ] Load generators are not the bottleneck
- [ ] Results include percentiles, not averages
- [ ] The bottleneck is explained, not only observed

## Output format

```markdown
## Load Test Report: [System]
| Scenario | Load | p95 | p99 | Errors | Verdict |
|----------|------|-----|-----|--------|---------|
| peak | [rps] | [ms] | [ms] | [%] | [pass] |

**First bottleneck:** [component and evidence]
**Max sustainable load:** [rps]
```

## Common pitfalls

- Testing with a tiny dataset that fits in cache.
- Closed-loop tests that slow down as the system degrades.
- Reporting averages that hide tail latency.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
