---
name: iac-change-review
description: "Review an infrastructure plan for blast radius, destructive changes and state risks. Trigger with 'review terraform plan', 'is this plan safe', 'destroy detected' or 'state migration'."
---

# Iac Change Review

> Part of the **Infrastructure as Code Engineer** plugin (`iac-engineer`).

## When to use

- A plan shows replacements or destroys
- State is being moved, imported or split

## Workflow

1. Read the plan summary and list every resource marked destroy or replace.
2. For each replacement find the attribute that forces it and decide if a lifecycle or moved block avoids it.
3. Check for data-bearing resources (databases, volumes, buckets) and require a backup or prevent_destroy.
4. Review IAM and network changes for widened access.
5. Confirm state is remote, locked and encrypted, and that the apply will use the reviewed plan file.

## Quality checklist

- [ ] The applied plan is the reviewed plan
- [ ] Stateful resources have deletion protection
- [ ] State refactors use moved or import blocks instead of manual state edits where possible
- [ ] Cost impact is estimated for new resources

## Output format

```markdown
## Plan Review: [Stack]
| Resource | Action | Risk | Mitigation |
|----------|--------|------|------------|
| [aws_db_instance.main] | replace | high | [snapshot, moved block] |

**Verdict:** [approve | approve with conditions | block]
```

## Common pitfalls

- Approving based on the summary count without reading each replace reason.
- Running apply without a saved plan after a long review gap.
- Importing resources without matching configuration, causing a surprise diff.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
