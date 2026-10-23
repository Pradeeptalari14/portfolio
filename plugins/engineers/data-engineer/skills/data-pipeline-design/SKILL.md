---
name: data-pipeline-design
description: "Design reliable batch or streaming data pipelines. Trigger with 'ETL', 'ELT', 'data pipeline', 'idempotent', 'backfill' or 'late arriving data'."
---

# Data Pipeline Design

> Part of the **Data Engineer** plugin (`data-engineer`).

## When to use

- A pipeline produces duplicates or gaps on retry
- Backfills are manual and risky

## Workflow

1. Define source, sink, freshness target and acceptable latency, and choose batch, micro-batch or streaming accordingly.
2. Make every task idempotent: overwrite partitions or merge on keys so reruns converge to the same result.
3. Parameterise by data interval rather than wall-clock time so backfills use the same code path.
4. Handle late and out-of-order data with watermarks or reprocessing windows.
5. Layer the model: raw, cleaned, and curated marts, with lineage between layers.

## Quality checklist

- [ ] Rerunning any task never creates duplicates
- [ ] Schema changes are detected before they break downstream jobs
- [ ] Failures alert the owner with the failing partition
- [ ] Raw data is retained so any layer can be rebuilt

## Output format

```markdown
## Pipeline Design: [Dataset]
| Stage | Mode | Key | Idempotency method |
|-------|------|-----|--------------------|
| ingest | [batch] | [id] | partition overwrite |

**Freshness SLO:** [target]
**Backfill:** [procedure]
```

## Common pitfalls

- Using now() inside transformations, which breaks reruns.
- Append-only loads with no deduplication.
- Silent schema drift from upstream sources.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
