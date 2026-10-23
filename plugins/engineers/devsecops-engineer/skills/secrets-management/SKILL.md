---
name: secrets-management
description: "Eliminate hard-coded secrets and design rotation. Trigger with 'secret leaked', 'rotate credentials', 'vault', 'secrets in git' or 'workload identity'."
---

# Secrets Management

> Part of the **DevSecOps Engineer** plugin (`devsecops-engineer`).

## When to use

- A scanner found a credential in the repository
- Services share static keys

## Workflow

1. Treat any exposed secret as compromised: revoke and rotate first, then clean history.
2. Replace static credentials with workload identity or OIDC federation wherever the provider supports it.
3. Store the remaining secrets in a vault with per-service paths, audit logging and short TTLs or dynamic secrets.
4. Add pre-commit and CI secret scanning with blocking on verified secrets.
5. Document rotation procedures and test them on a schedule.

## Quality checklist

- [ ] No secrets in environment files committed to Git
- [ ] Each service has its own identity and least-privilege policy
- [ ] Rotation does not require downtime
- [ ] Access to secrets is logged and reviewed

## Output format

```markdown
## Secrets Remediation
| Secret | Exposure | Action | Status |
|--------|----------|--------|--------|
| [API key] | public repo | revoked and rotated | done |

**Prevention:** [controls added]
```

## Common pitfalls

- Rewriting git history without rotating the secret.
- Sharing one credential across environments.
- Storing secrets in container images or build logs.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
