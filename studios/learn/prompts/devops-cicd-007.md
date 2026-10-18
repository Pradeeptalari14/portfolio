# Design a safe deployment promotion workflow

**ID:** `devops-cicd-007`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Advanced`  
**Tags:** `#CD` `#release management` `#approvals` `#rollback`  

---

## Overview

Promote the same artifact through environments with approvals and rollback planning.

**Objective:** Design a controlled release flow that avoids rebuilding different artifacts for each environment.

## Prerequisites

- Environment topology and release strategy are documented.
- Deployment mechanism and rollback capability are known.
- Approvers and change-management requirements are identified.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `CI_PLATFORM` | **Yes** | CI/CD platform | `GitHub Actions` |
| `ENVIRONMENTS` | **Yes** | Promotion sequence | `dev → staging → production` |
| `DEPLOY_TOOL` | **Yes** | Deployment technology | `Helm to Kubernetes` |
| `APPROVAL_POLICY` | **Yes** | Required approval gates | `Staging verification and production approval` |
| `ROLLBACK_METHOD` | **Yes** | Known rollback method | `Restore previous immutable image tag and Helm revision` |

## Safety Constraints & Guardrails

> [!IMPORTANT]
> Do not include secrets, tokens, passwords, private keys, customer data, or production identifiers in prompts, logs, examples, or generated files.

> [!IMPORTANT]
> Assume all changes are proposed until a human reviews and explicitly approves them; do not execute deployments or destructive commands.

> [!IMPORTANT]
> Prefer least-privilege permissions, pinned or verified dependencies, and reproducible builds.

> [!IMPORTANT]
> Clearly separate facts from assumptions and identify any missing context instead of inventing environment details.

> [!IMPORTANT]
> Do not deploy or change a real environment from the generated plan.

> [!IMPORTANT]
> Use environment-scoped credentials and approvals for sensitive targets.

> [!IMPORTANT]
> Do not use mutable tags as the sole release identity.

> [!IMPORTANT]
> Include database migration compatibility and rollback limitations.

## Example Input

```json
{
  "CI_PLATFORM": "GitHub Actions",
  "ENVIRONMENTS": "dev \u2192 staging \u2192 production",
  "DEPLOY_TOOL": "Helm to Kubernetes",
  "APPROVAL_POLICY": "Staging verification and production approval",
  "ROLLBACK_METHOD": "Restore previous immutable image tag and Helm revision"
}
```

## Copyable Prompt Template

```text
Design a safe artifact-promotion workflow using CI_PLATFORM. Environments: ENVIRONMENTS. Deployment tool: DEPLOY_TOOL. Approval policy: APPROVAL_POLICY. Rollback method: ROLLBACK_METHOD. Build the artifact once, identify it immutably, attach test/scan evidence, promote it through environment gates, and define smoke tests, health checks, audit records, and rollback decision criteria. Explain secrets isolation and migration risks. Produce pseudocode or provider-specific configuration, but mark all production actions as review-required and do not execute them.
```

## Expected Output

1. Promotion diagram and release state model.
1. Pipeline example with approval gates.
1. Artifact identity and evidence handling.
1. Smoke-test, rollback, and post-release verification checklist.

## Validation Criteria

- [ ] The same immutable artifact digest is promoted across environments.
- [ ] Production requires the specified approval.
- [ ] Rollback target is identifiable and operationally tested.
- [ ] Failure states stop further promotion and preserve useful audit evidence.

## Troubleshooting & Diagnostics

### Symptom: Different behavior across environments

**Checks to perform:**
- Compare artifact digest, configuration, feature flags, and dependencies.
- Check whether a rebuild occurred during promotion.

**Recommended next step:** Promote one immutable artifact and manage environment-specific configuration separately.

### Symptom: Rollback is blocked by a database change

**Checks to perform:**
- Review migration compatibility and backward-read/write requirements.
- Determine whether old and new application versions can coexist.

**Recommended next step:** Use a documented expand/contract migration plan or state that rollback requires a forward fix.

## Related Learning & Studio Workspaces

- **Learn:** [Release promotion strategies](/tools/release-promotion-strategies/learn.html)
- **Lab:** [Simulate staged promotion](/tools/staged-deployment-simulation/learn.html)
- **Workflow:** [Artifact to production](/tools/artifact-to-production/learn.html)
- **Repository:** [Promotion workflow example](/tools/deployment-promotion-example/learn.html)

