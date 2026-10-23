---
name: profiling-bottlenecks
description: "Find CPU, memory and latency bottlenecks with profiling and tracing. Trigger with 'why is it slow', 'flame graph', 'memory leak', 'high p99' or 'profile this service'."
---

# Profiling Bottlenecks

> Part of the **Performance Engineer** plugin (`performance-engineer`).

## When to use

- Latency is high but the cause is unclear
- Memory grows steadily until restart

## Workflow

1. Establish a repeatable benchmark or traffic replay and record the baseline.
2. Use traces to locate the slow span, then metrics to determine whether the time is compute, waiting or queueing.
3. Capture CPU and allocation profiles under load and read the flame graph for wide frames.
4. Check for lock contention, garbage collection pressure, connection pool exhaustion and N+1 calls.
5. Change one thing at a time, re-measure, and keep the profile as evidence.

## Quality checklist

- [ ] Optimisation targets the measured top contributor
- [ ] Improvement is shown with before and after numbers
- [ ] No change is accepted that worsens correctness or tail latency
- [ ] A regression benchmark is added to CI where practical

## Output format

```markdown
## Performance Investigation: [Service]
**Symptom:** [metric]
**Finding:** [bottleneck and evidence]
**Change:** [fix]
**Result:** [before] -> [after]
```

## Common pitfalls

- Optimising code that is not on the critical path.
- Profiling an idle service.
- Micro-optimising when a missing index or cache is the cause.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
