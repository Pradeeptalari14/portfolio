---
name: model-monitoring
description: "Monitor deployed models for data drift, concept drift and performance decay. Trigger with 'model drift', 'monitor the model', 'accuracy dropped in production' or 'when to retrain'."
---

# Model Monitoring

> Part of the **MLOps Engineer** plugin (`mlops-engineer`).

## When to use

- Ground truth arrives late
- Business metrics moved but model metrics look fine

## Workflow

1. Track service health first: latency, errors, throughput and resource use.
2. Monitor input drift per feature with population stability index or distribution tests, against a reference window.
3. Monitor prediction drift and, when labels arrive, quality metrics with delay handled explicitly.
4. Define alert thresholds and a retraining trigger based on drift plus quality, not drift alone.
5. Keep an audit log of predictions and model version for debugging and compliance.

## Quality checklist

- [ ] Reference data is versioned alongside the model
- [ ] Thresholds are tuned to avoid constant false alarms
- [ ] Retraining is automated but promotion remains gated
- [ ] Segment-level performance is visible

## Output format

```markdown
## Model Monitoring: [Model]
| Signal | Method | Threshold | Action |
|--------|--------|-----------|--------|
| Feature drift | PSI | > 0.2 | investigate |

**Retrain trigger:** [rule]
```

## Common pitfalls

- Treating any drift as an error when it is seasonal.
- Waiting for labels that never arrive instead of using proxies.
- Retraining automatically on corrupted data.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
