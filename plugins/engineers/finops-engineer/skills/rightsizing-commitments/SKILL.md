---
name: rightsizing-commitments
description: "Rightsize resources and plan commitment purchases. Trigger with 'reduce cloud cost', 'rightsizing', 'savings plan', 'reserved instances' or 'spot instances'."
---

# Rightsizing Commitments

> Part of the **FinOps Engineer** plugin (`finops-engineer`).

## When to use

- Utilisation is consistently below 40%
- Steady baseline workloads are running on-demand

## Workflow

1. Collect at least 14 days of utilisation for CPU, memory, network and storage.
2. Rightsize first: pick smaller or newer instance families, or move to autoscaling.
3. Eliminate waste: unattached volumes, idle load balancers, old snapshots and oversized non-production environments.
4. Move fault-tolerant workloads to spot with diversification and graceful interruption handling.
5. Cover the stable baseline with commitments after rightsizing, starting around 60 to 70% coverage.

## Quality checklist

- [ ] Rightsizing precedes commitment purchase
- [ ] Performance headroom is validated after each change
- [ ] Non-production schedules shut down outside working hours
- [ ] Commitment coverage and utilisation are tracked monthly

## Output format

```markdown
## Savings Plan: [Account or cluster]
| Action | Monthly saving | Risk | Effort |
|--------|----------------|------|--------|
| [Rightsize] | [$] | low | S |

**Commitment recommendation:** [type, term, coverage]
```

## Common pitfalls

- Buying commitments before cleaning up waste, locking in the waste.
- Rightsizing on average CPU while ignoring memory or peak.
- Using spot for stateful workloads without checkpointing.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
