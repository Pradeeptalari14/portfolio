---
name: control-mapping
description: "Map technical controls to compliance frameworks. Trigger with 'SOC 2', 'ISO 27001', 'GDPR', 'control mapping', 'audit prep' or 'what evidence do auditors need'."
---

# Control Mapping

> Part of the **Compliance Engineer** plugin (`compliance-engineer`).

## When to use

- A customer requires a compliance attestation
- Evidence is gathered manually in the weeks before an audit

## Workflow

1. Define the scope: systems, data classes, locations and teams in the audit boundary.
2. Create a unified control set and map each control to the framework requirements it satisfies.
3. For each control name the implementation, the owner and the automated evidence source.
4. Identify gaps and plan remediation with dates.
5. Schedule recurring control tests and evidence capture.

## Quality checklist

- [ ] Every control has an owner and an evidence source
- [ ] Scope is documented and agreed with the auditor
- [ ] Exceptions are recorded with compensating controls
- [ ] Evidence is timestamped and tamper evident

## Output format

```markdown
## Control Map: [Framework]
| Control | Requirement | Implementation | Evidence | Owner |
|---------|-------------|----------------|----------|-------|
| [Access reviews] | [CC6.x] | [process] | [report] | [name] |

**Gaps:** [list with dates]
```

## Common pitfalls

- Treating compliance as a yearly event instead of a continuous process.
- Writing policies nobody follows.
- Over-scoping the audit boundary.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
