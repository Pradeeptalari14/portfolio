---
name: toil-reduction
description: "Find, measure and eliminate operational toil. Trigger with 'toil audit', 'reduce manual work', 'on-call is too noisy' or 'automate this runbook'."
---

# Toil Reduction

> Part of the **Site Reliability Engineer** plugin (`sre-engineer`).

## When to use

- On-call load exceeds roughly 50% reactive work
- The same runbook has been executed manually more than twice a month

## Workflow

1. Collect 4 weeks of pages, tickets and manual runbook executions.
2. Classify each item against the toil definition: manual, repetitive, automatable, tactical, no enduring value, scales linearly with service growth.
3. Rank by hours per month multiplied by the number of people affected.
4. For the top three items choose the cheapest fix: remove the cause, self-heal, or automate the response.
5. Set a measurable target (for example, pages per shift below 2) and review it monthly.

## Quality checklist

- [ ] Each toil item has a measured monthly cost in hours
- [ ] A fix exists for the cause, not only for the symptom
- [ ] Automation has a dry-run mode and an audit log
- [ ] Toil percentage is tracked as a team metric

## Output format

```markdown
## Toil Audit: [Team], [Period]
| Item | Hours/month | Frequency | Proposed fix | Effort |
|------|-------------|-----------|--------------|--------|
| [Cert rotation] | 6 | weekly | cert-manager | S |

**Toil share:** [x]% of on-call time. **Target:** [y]%
```

## Common pitfalls

- Automating a broken process only makes it fail faster.
- Building tooling that costs more to maintain than the toil it removes.
- Ignoring noisy alerts that are the real source of interrupt work.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
