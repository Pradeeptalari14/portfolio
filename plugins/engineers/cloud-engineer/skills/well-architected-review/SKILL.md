---
name: well-architected-review
description: "Run a Well-Architected style review across operational excellence, security, reliability, performance, cost and sustainability. Trigger with 'architecture review', 'well-architected', 'is this design production ready'."
---

# Well Architected Review

> Part of the **Cloud Engineer** plugin (`cloud-engineer`).

## When to use

- Before launching a new workload
- After a major incident or cost spike

## Workflow

1. Capture the workload context: criticality, data classification, RTO and RPO.
2. Walk each pillar with five or six targeted questions.
3. Record each answer as risk: none, medium or high, with the evidence.
4. Prioritise high risks by blast radius and effort.
5. Produce an improvement plan with owners and dates.

## Quality checklist

- [ ] RTO and RPO are stated and tested
- [ ] Single points of failure are listed explicitly
- [ ] Every high-risk item has an owner
- [ ] The review is repeated on a schedule

## Output format

```markdown
## Architecture Review: [Workload]
| Pillar | Risk | Evidence | Action |
|--------|------|----------|--------|
| Reliability | [level] | [detail] | [fix] |

**Go / no-go recommendation:** [decision and conditions]
```

## Common pitfalls

- Treating the review as a one-time gate instead of a recurring process.
- Scoring pillars subjectively with no evidence.
- Ignoring cost and sustainability until the bill arrives.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
