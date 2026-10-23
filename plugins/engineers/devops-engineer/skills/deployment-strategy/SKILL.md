---
name: deployment-strategy
description: "Choose and specify a deployment strategy (rolling, blue/green, canary) with explicit rollback criteria. Trigger with 'canary release', 'zero downtime deploy', 'blue green' or 'how do we roll this out safely'."
---

# Deployment Strategy

> Part of the **DevOps Engineer** plugin (`devops-engineer`).

## When to use

- A change carries user-facing risk
- A previous release caused an incident

## Workflow

1. Classify the change: stateless code, schema migration, config, or infrastructure.
2. Pick the strategy: rolling for low risk, blue/green for fast switch-back, canary for gradual exposure with metrics.
3. For canaries define the steps (1%, 5%, 25%, 100%), the bake time per step and the comparison metrics.
4. Write automatic abort criteria: error rate, p99 latency and saturation versus baseline.
5. Make database changes backward compatible (expand, migrate, contract) so rollback never needs a restore.

## Quality checklist

- [ ] Rollback has been exercised in a non-production environment
- [ ] Abort thresholds are numeric, not subjective
- [ ] Feature flags decouple deploy from release
- [ ] On-call knows the rollout window

## Output format

```markdown
## Rollout Plan: [Change]
**Strategy:** [rolling | blue-green | canary]
| Step | Traffic | Bake | Abort if |
|------|---------|------|----------|
| 1 | 5% | 15 min | error rate > baseline + 0.5% |

**Rollback:** [command or automated trigger]
```

## Common pitfalls

- Canary metrics that lack enough traffic to be statistically meaningful.
- Dropping a column in the same release that stops using it.
- Rolling back code while the schema has already moved on.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
