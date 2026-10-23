---
name: policy-as-code
description: "Encode compliance and guardrail policies as automated checks. Trigger with 'policy as code', 'OPA', 'Rego', 'Conftest', 'Kyverno' or 'enforce this in CI'."
---

# Policy As Code

> Part of the **Compliance Engineer** plugin (`compliance-engineer`).

## When to use

- The same review comments repeat on pull requests
- Violations are found after deployment

## Workflow

1. Convert written policies into testable rules with an id, rationale and severity.
2. Implement them in the right layer: CI checks for IaC and manifests, admission control for clusters, cloud config rules for drift.
3. Start in audit mode, measure violations, then switch to enforce for each rule with an exception workflow.
4. Write unit tests for the policies using passing and failing fixtures.
5. Publish a policy catalogue explaining each rule and how to fix a violation.

## Quality checklist

- [ ] Every rule has a clear failure message with remediation
- [ ] Exceptions are time-limited and approved
- [ ] Policy tests run in CI
- [ ] Violation trends are reported to owners

## Output format

```markdown
## Policy Catalogue
| Rule id | Layer | Mode | Rationale | Remediation |
|---------|-------|------|-----------|-------------|
| S3-001 | CI | enforce | no public buckets | [link] |
```

## Common pitfalls

- Enforcing on day one and blocking all deployments.
- Rules with cryptic failure messages.
- Policies without tests that drift out of sync.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
