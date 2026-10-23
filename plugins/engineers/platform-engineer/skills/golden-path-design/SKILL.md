---
name: golden-path-design
description: "Design a paved-road template that gets a team from idea to production safely. Trigger with 'golden path', 'service template', 'paved road' or 'standardise how teams ship'."
---

# Golden Path Design

> Part of the **Platform Engineer** plugin (`platform-engineer`).

## When to use

- Each team provisions services differently
- New service setup takes more than a day

## Workflow

1. Interview two or three product teams and list every step they take from repository to production.
2. Identify what must be standard (security, observability, deployment) and what teams may choose.
3. Package the standard as a template: repository scaffold, pipeline, runtime manifests, dashboards and alerts.
4. Make the path self-service through a portal form or a single CLI command.
5. Measure time to first deploy and adoption, and publish both.

## Quality checklist

- [ ] A new service reaches production in under one hour using only the template
- [ ] The path ships with logging, metrics, tracing and an SLO by default
- [ ] Teams can leave the path with a documented, supported escape hatch
- [ ] Template versions are upgradable without manual merges

## Output format

```markdown
## Golden Path: [Service type]
**Includes:** [repo scaffold, pipeline, runtime, observability, security]
**Self-service entry:** [portal action or CLI]
**Time to first deploy:** [before] -> [after]
**Escape hatch:** [process]
```

## Common pitfalls

- Mandating a path nobody helped design leads to shadow platforms.
- Building features before validating demand with real teams.
- Treating the platform as a project instead of a product with a roadmap.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
