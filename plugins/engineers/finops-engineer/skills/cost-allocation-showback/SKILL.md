---
name: cost-allocation-showback
description: "Make cloud spend attributable to teams and products. Trigger with 'cost allocation', 'tagging strategy', 'showback', 'who is spending this' or 'unit cost'."
---

# Cost Allocation Showback

> Part of the **FinOps Engineer** plugin (`finops-engineer`).

## When to use

- A large share of spend is untagged
- Teams cannot see the cost of their services

## Workflow

1. Define a mandatory tag set: owner, product, environment, cost-centre.
2. Enforce tags at creation with policy and in IaC modules, and report untagged spend weekly.
3. For shared resources such as Kubernetes clusters, allocate by requests or usage with a cost tool.
4. Publish team dashboards with trend and anomaly alerts.
5. Define unit economics: cost per request, per customer or per inference.

## Quality checklist

- [ ] Over 90% of spend is allocated to an owner
- [ ] Allocation rules for shared costs are documented and agreed
- [ ] Anomaly alerts route to the owning team
- [ ] Unit cost is trended alongside total cost

## Output format

```markdown
## Cost Allocation: [Month]
| Team | Spend | Allocated % | Trend |
|------|-------|-------------|-------|
| [team] | [$] | [%] | [up or down] |

**Unit cost:** [metric] = [value]
```

## Common pitfalls

- Chasing 100% tagging instead of fixing the biggest gaps first.
- Charging teams for shared costs without explaining the method.
- Reporting total spend growth without relating it to usage growth.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
