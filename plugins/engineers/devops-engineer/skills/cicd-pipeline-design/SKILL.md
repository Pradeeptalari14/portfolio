---
name: cicd-pipeline-design
description: "Design or review a CI/CD pipeline for speed, safety and reproducibility. Trigger with 'design a pipeline', 'speed up CI', 'review this workflow' or 'add a deploy stage'."
---

# Cicd Pipeline Design

> Part of the **DevOps Engineer** plugin (`devops-engineer`).

## When to use

- Builds take longer than 10 minutes
- Deployments need manual steps or tribal knowledge

## Workflow

1. Map the stages: lint, unit test, build, scan, package, deploy to each environment.
2. Make build and test hermetic: pinned toolchain versions, locked dependencies, cached layers.
3. Run independent jobs in parallel and fail fast on the cheapest checks first.
4. Build the artifact once, tag it with the commit SHA, and promote the same artifact through every environment.
5. Add security gates: secret scan, dependency audit, image scan and SBOM generation.
6. Define the promotion rule per environment and the automated smoke test that gates it.

## Quality checklist

- [ ] No environment rebuilds the artifact
- [ ] Secrets come from OIDC or a vault, never from repository variables with long lifetimes
- [ ] Pipeline definition lives in the repository and is reviewed like code
- [ ] Failed deploys roll back without human intervention

## Output format

```markdown
## Pipeline Design: [Service]
| Stage | Tool | Gate | Target time |
|-------|------|------|-------------|
| Build | [tool] | unit tests green | 3 min |

**Promotion:** [artifact promotion path]
**Rollback:** [trigger and mechanism]
```

## Common pitfalls

- Running the full end-to-end suite on every commit instead of on merge.
- Using the latest tag for base images, which breaks reproducibility.
- Letting a flaky test be retried silently instead of quarantined.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
