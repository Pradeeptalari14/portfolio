---
name: release-readiness
description: "Run a go or no-go readiness review before shipping. Trigger with 'ready to release', 'go no go', 'release checklist' or 'launch review'."
---

# Release Readiness

> Part of the **Release Engineer** plugin (`release-engineer`).

## When to use

- A significant release is scheduled
- Several teams contribute to the same release

## Workflow

1. Confirm scope: list included changes and any flagged-off features.
2. Verify quality gates: tests, security scans, performance baseline and migration rehearsal.
3. Check operational readiness: dashboards, alerts, runbooks, on-call coverage and capacity.
4. Confirm communication: customer notes, support briefing and status page plan.
5. Record the go or no-go decision with named approvers and the rollback trigger.

## Quality checklist

- [ ] No open blocker defects
- [ ] Rollback was tested for this release
- [ ] On-call knows the release window
- [ ] Release is not scheduled right before a holiday or freeze

## Output format

```markdown
## Release Readiness: [Version]
| Gate | Status | Owner | Notes |
|------|--------|-------|-------|
| Tests | [pass] | [name] | |

**Decision:** [go | no-go] — **Approvers:** [names]
```

## Common pitfalls

- Treating the checklist as a formality with no authority to stop the release.
- Shipping on Friday afternoon without coverage.
- Skipping the migration rehearsal on production-sized data.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
