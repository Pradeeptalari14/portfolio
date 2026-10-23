---
name: alert-quality
description: "Improve alert signal-to-noise. Trigger with 'too many alerts', 'alert fatigue', 'review alert rules' or 'actionable alerts'."
---

# Alert Quality

> Part of the **Observability Engineer** plugin (`observability-engineer`).

## When to use

- Responders ignore pages
- More than a third of pages need no action

## Workflow

1. Export 30 days of alerts with outcome: actioned, auto-resolved or ignored.
2. Delete or downgrade alerts that were never actioned.
3. Convert cause-based alerts (CPU high) into symptom-based alerts tied to an SLO.
4. Add for-durations, grouping and inhibition so one fault creates one page.
5. Attach a runbook link and a dashboard link to every paging alert.

## Quality checklist

- [ ] Every page requires a human decision
- [ ] Every alert has an owner and a runbook
- [ ] Severity maps to response time expectations
- [ ] Alert rules are version controlled and tested with promtool or equivalent

## Output format

```markdown
## Alert Review: [Team]
| Alert | Fired | Actioned | Decision |
|-------|-------|----------|----------|
| [HighCPU] | 120 | 2 | remove |

**Pages per week:** [before] -> [after]
```

## Common pitfalls

- Silencing alerts instead of fixing their cause.
- Paging on symptoms that a retry resolves.
- Alert descriptions that state the metric but not the impact.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
