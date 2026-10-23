---
name: blameless-postmortem
description: "Write a blameless postmortem with a timeline, causal analysis and tracked actions. Trigger with 'write a postmortem', 'RCA', 'incident review' or 'five whys'."
---

# Blameless Postmortem

> Part of the **Incident Commander** plugin (`incident-commander`).

## When to use

- An incident of SEV2 or higher has been resolved
- A near miss revealed a systemic weakness

## Workflow

1. Reconstruct the timeline from alerts, chat, deploy logs and metrics in UTC.
2. Describe impact in user terms: who, how many, for how long, and any business effect.
3. Analyse contributing factors across detection, response, design and process, not individuals.
4. Use the five whys to reach systemic causes, and note what went well.
5. Write action items that are specific, owned, dated and prioritised, then track them to completion.

## Quality checklist

- [ ] Language is about systems and decisions, never blaming people
- [ ] Every action item has an owner and a due date
- [ ] At least one action reduces detection or recovery time
- [ ] The review is shared beyond the responding team

## Output format

```markdown
## Postmortem: [Title]
**Date:** [date] | **Duration:** [x] | **Severity:** SEV[x]
### Summary
### Impact
### Timeline (UTC)
### Contributing factors
### Action items
| Action | Owner | Priority | Due |
|--------|-------|----------|-----|
```

## Common pitfalls

- Stopping at human error as the root cause.
- Action items that are vague wishes such as be more careful.
- Never revisiting the actions after the review meeting.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
