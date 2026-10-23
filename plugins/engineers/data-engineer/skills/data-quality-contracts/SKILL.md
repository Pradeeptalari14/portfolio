---
name: data-quality-contracts
description: "Introduce data contracts and automated quality checks. Trigger with 'data quality', 'data contract', 'bad data in the dashboard', 'schema change broke us' or 'data observability'."
---

# Data Quality Contracts

> Part of the **Data Engineer** plugin (`data-engineer`).

## When to use

- Consumers find data issues before producers do
- Upstream changes break reports regularly

## Workflow

1. Agree a contract per dataset: schema, semantics, owner, freshness, volume and quality expectations.
2. Validate at the boundary: reject or quarantine records that violate the contract and report counts.
3. Add tests in the transformation layer for uniqueness, not-null, referential integrity and accepted values.
4. Monitor freshness, volume and distribution anomalies with alerts to the data owner.
5. Version contracts and require a deprecation period for breaking changes.

## Quality checklist

- [ ] Every critical dataset has a named owner
- [ ] Quarantined records are visible and recoverable
- [ ] Breaking changes go through a review with consumers
- [ ] Tests run in CI before deployment of models

## Output format

```markdown
## Data Contract: [Dataset]
**Owner:** [team] | **Freshness:** [target] | **Volume:** [range]
| Field | Type | Rule |
|-------|------|------|
| [order_id] | string | unique, not null |

**Breaking change policy:** [text]
```

## Common pitfalls

- Hundreds of low-value tests that nobody acts on.
- Contracts that exist only as documents without enforcement.
- Alerting consumers instead of the producing team.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
