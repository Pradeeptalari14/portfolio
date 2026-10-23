---
name: ml-pipeline-design
description: "Design reproducible training and deployment pipelines for machine learning. Trigger with 'ML pipeline', 'model registry', 'reproducible training', 'promote a model' or 'retraining'."
---

# Ml Pipeline Design

> Part of the **MLOps Engineer** plugin (`mlops-engineer`).

## When to use

- Models are trained from notebooks with no lineage
- Promotion to production is manual and undocumented

## Workflow

1. Version everything: code, data snapshot or hash, feature definitions, hyperparameters and environment image.
2. Split the pipeline into validate data, train, evaluate, register and deploy stages with explicit artifacts between them.
3. Log metrics, parameters and artifacts to an experiment tracker and register candidate models with lineage.
4. Gate promotion on evaluation against a champion model, fairness and latency checks.
5. Deploy behind a canary or shadow stage and keep the previous model ready for rollback.

## Quality checklist

- [ ] Any registered model can be reproduced from its recorded inputs
- [ ] Training and serving use the same feature logic
- [ ] Promotion requires passing automated evaluation, not a manual flag
- [ ] Model cards record intended use and known limits

## Output format

```markdown
## ML Pipeline: [Model]
| Stage | Input | Output | Gate |
|-------|-------|--------|------|
| Validate | raw data | clean data | schema and drift checks |

**Registry policy:** [stages and approvers]
**Rollback:** [mechanism]
```

## Common pitfalls

- Training-serving skew caused by duplicated feature code.
- Evaluating only on aggregate metrics while a key segment regresses.
- Overwriting the dataset in place and losing reproducibility.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
