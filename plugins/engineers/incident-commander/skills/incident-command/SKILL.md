---
name: incident-command
description: "Run a live incident with clear roles, cadence and decisions. Trigger with 'we have an incident', 'production is down', 'declare an incident' or 'who is incident commander'."
---

# Incident Command

> Part of the **Incident Commander** plugin (`incident-commander`).

## When to use

- Customer impact is confirmed or probable
- More than two people are working one problem

## Workflow

1. Declare the incident, set severity SEV1 to SEV4 from customer impact, and open a dedicated channel and bridge.
2. Assign roles: incident commander, operations lead, communications lead and scribe. The commander coordinates and does not debug.
3. State the current hypothesis and impact in one sentence, then set the update cadence (every 15 to 30 minutes for SEV1 or SEV2).
4. Prioritise mitigation over root cause: rollback, failover, feature-flag off, scale up.
5. Record decisions and timeline in real time, and declare resolved only after metrics confirm recovery.

## Quality checklist

- [ ] There is exactly one commander at any time, with explicit handover
- [ ] Customer communication goes out before engineers are certain of the cause
- [ ] Changes during the incident are announced in the channel
- [ ] A postmortem owner is assigned before closing

## Output format

```markdown
## Incident Update: [Title]
**Severity:** SEV[1-4] | **Status:** Investigating | Identified | Monitoring | Resolved
**Impact:** [who and what]
**Current action:** [mitigation in progress]
**Next update:** [time]
```

## Common pitfalls

- Everyone debugging and nobody coordinating.
- Silent periods longer than the stated update cadence.
- Declaring resolved on a hunch rather than on recovery metrics.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
