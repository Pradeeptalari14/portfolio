---
name: query-performance-tuning
description: "Diagnose and fix slow queries using plans and statistics. Trigger with 'slow query', 'explain analyze', 'index recommendation' or 'database CPU is high'."
---

# Query Performance Tuning

> Part of the **Database Reliability Engineer** plugin (`database-engineer`).

## When to use

- A query dominates database load
- Latency regressed after a data growth milestone

## Workflow

1. Find the top queries by total time from pg_stat_statements or the slow log, not only by single-run time.
2. Run EXPLAIN (ANALYZE, BUFFERS) on representative parameters and note scan types, row estimate errors and sort or hash spills.
3. Check statistics freshness and fix bad estimates with ANALYZE or extended statistics.
4. Design indexes to match the filter, join and sort order. Prefer partial or covering indexes where useful.
5. Verify improvement on a production-like dataset and confirm write overhead is acceptable.

## Quality checklist

- [ ] The fix is validated against real data volumes
- [ ] New indexes do not duplicate existing ones
- [ ] Plan stability is checked for different parameter values
- [ ] Connection pooling is configured sensibly

## Output format

```markdown
## Query Tuning: [Query id]
**Before:** [time, plan summary]
**Cause:** [reason]
**Change:** [index or rewrite]
**After:** [time, plan summary]
```

## Common pitfalls

- Adding an index for every slow query and degrading writes.
- Tuning against a tiny development dataset.
- Ignoring N+1 patterns in the application that no index can fix.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
