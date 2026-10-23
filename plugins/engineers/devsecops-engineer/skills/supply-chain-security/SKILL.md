---
name: supply-chain-security
description: "Secure the build and delivery supply chain. Trigger with 'SBOM', 'sign images', 'SLSA', 'dependency risk', 'supply chain attack' or 'harden the pipeline'."
---

# Supply Chain Security

> Part of the **DevSecOps Engineer** plugin (`devsecops-engineer`).

## When to use

- Artifacts are deployed without proof of origin
- Dependencies are not tracked or scanned

## Workflow

1. Pin dependencies and base images by digest, use lockfiles and a private proxy registry.
2. Generate an SBOM (CycloneDX or SPDX) for every build and store it with the artifact.
3. Scan source, dependencies, containers and IaC in CI with severity gates and a documented exception process.
4. Build on ephemeral, isolated runners, and produce signed provenance (SLSA) with keyless signing from CI identity.
5. Verify signatures and provenance at admission in the cluster and refuse unsigned images.

## Quality checklist

- [ ] CI tokens are short-lived and scoped to the job
- [ ] No build step can be modified by an untrusted pull request
- [ ] Exceptions to scan failures expire
- [ ] Admission policy runs in enforce mode in production

## Output format

```markdown
## Supply Chain Review: [Pipeline]
| Control | Status | Gap | Fix |
|---------|--------|-----|-----|
| Signed images | [yes/no] | [detail] | [action] |

**SLSA level today / target:** [x] / [y]
```

## Common pitfalls

- Scanning without gating, so findings pile up unread.
- Using long-lived registry credentials in CI.
- Signing images but never verifying them at deploy time.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
