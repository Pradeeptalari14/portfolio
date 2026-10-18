# Create a secure pull-request validation pipeline

**ID:** `devops-cicd-003`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Intermediate`  
**Tags:** `#security` `#pull requests` `#branch protection` `#least privilege`  

---

## Overview

Validate code changes before merge while protecting repository secrets.

**Objective:** Design pull-request checks that run tests, linting, and policy checks with safe permissions.

## Prerequisites

- Repository branch strategy is documented.
- Required checks and code-quality tools are identified.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `CI_PLATFORM` | **Yes** | CI provider | `GitHub Actions` |
| `APP_STACK` | **Yes** | Application stack | `Node.js 22` |
| `CHECKS` | **Yes** | Required checks | `lint, unit tests, dependency audit` |
| `PROTECTED_BRANCH` | **Yes** | Protected branch name | `main` |

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
> Do not expose repository secrets to untrusted fork pull requests.

> [!IMPORTANT]
> Use read-only default token permissions and grant narrower write permissions only to a justified job.

> [!IMPORTANT]
> Avoid executing untrusted pull-request code in privileged contexts.

## Example Input

```json
{
  "CI_PLATFORM": "GitHub Actions",
  "APP_STACK": "Node.js 22",
  "CHECKS": "lint, unit tests, dependency audit",
  "PROTECTED_BRANCH": "main"
}
```

## Copyable Prompt Template

```text
Design a secure pull-request validation pipeline on CI_PLATFORM for APP_STACK. Required checks: CHECKS. Protected branch: PROTECTED_BRANCH. Provide complete configuration, least-privilege permissions, event trigger rationale, fork/Dependabot considerations where relevant, branch-protection settings, concurrency cancellation, and failure reporting. Separate untrusted validation from any privileged workflow. Explain how each required check becomes a merge gate. Flag platform-specific assumptions and do not add secrets or deploy steps.
```

## Expected Output

1. Threat-aware pipeline design.
1. Complete configuration and permission explanation.
1. Branch protection and required-check setup.
1. Test plan covering same-repository and fork pull requests.

## Validation Criteria

- [ ] Default permissions are read-only unless a permission is justified.
- [ ] Fork PRs cannot access privileged secrets.
- [ ] All required checks report deterministic statuses.
- [ ] Branch protection blocks merge when required checks fail.

## Troubleshooting & Diagnostics

### Symptom: Required check does not appear in branch protection

**Checks to perform:**
- Inspect the exact check name and workflow trigger.
- Confirm the workflow runs for the target branch/PR event.

**Recommended next step:** Run a test PR and select the exact emitted check status.

### Symptom: Fork pull request fails because a secret is missing

**Checks to perform:**
- Verify whether the event originates from a fork.
- Check whether the job actually needs that secret.

**Recommended next step:** Remove the secret dependency from untrusted validation or move privileged work behind an explicit trusted approval.

## Related Learning & Studio Workspaces

- **Learn:** [Secure CI design](/tools/secure-ci-design/learn.html)
- **Lab:** [Build PR checks](/tools/pr-validation-pipeline/learn.html)
- **Workflow:** [Pull request to merge](/tools/pull-request-to-merge/learn.html)
- **Repository:** [Secure PR checks](/tools/secure-pr-checks/learn.html)

