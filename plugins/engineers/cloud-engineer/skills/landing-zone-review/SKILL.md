---
name: landing-zone-review
description: "Review a cloud landing zone for account structure, guardrails, networking and logging. Trigger with 'landing zone', 'multi-account setup', 'cloud foundation' or 'review our AWS organisation'."
---

# Landing Zone Review

> Part of the **Cloud Engineer** plugin (`cloud-engineer`).

## When to use

- A new cloud estate is being set up
- Workloads share one account or subscription

## Workflow

1. Check the account hierarchy separates production, non-production, security, logging and shared services.
2. Verify preventive guardrails exist (SCPs, Azure Policy, org policies): region restriction, deny public storage, deny disabling logs.
3. Review identity: federated SSO, no long-lived keys, least-privilege roles and break-glass access.
4. Review network topology: hub and spoke or transit, egress control, private endpoints and DNS.
5. Confirm central audit logging and security tooling are enabled in every account and region.

## Quality checklist

- [ ] Root credentials are vaulted with MFA and alerting on use
- [ ] Logs are immutable and stored in a separate account
- [ ] New accounts are vended through code, not clicked
- [ ] Budgets and anomaly alerts exist per account

## Output format

```markdown
## Landing Zone Review: [Org]
| Area | Status | Finding | Fix |
|------|--------|---------|-----|
| Guardrails | [ok / gap] | [detail] | [action] |

**Top three risks:** [list]
```

## Common pitfalls

- Applying restrictive SCPs without a staging OU to test them first.
- Allowing every team a direct route to the internet.
- Forgetting to cover all enabled regions with the logging baseline.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
