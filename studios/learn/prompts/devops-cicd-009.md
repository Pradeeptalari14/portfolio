# Generate a release checklist and change record

**ID:** `devops-cicd-009`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Beginner`  
**Tags:** `#change management` `#release checklist` `#documentation`  

---

## Overview

Turn release details into a consistent, auditable checklist.

**Objective:** Create a release checklist that covers readiness, communication, verification, and recovery.

## Prerequisites

- Release scope, owner, target window, and service are known.
- Change-management requirements are available or explicitly marked unknown.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `SERVICE_NAME` | **Yes** | Service being released | `sample-api` |
| `RELEASE_VERSION` | **Yes** | Version or artifact digest | `v2.4.1 / sha256 digest` |
| `CHANGE_SUMMARY` | **Yes** | User-visible and technical changes | `Add endpoint and fix timeout handling` |
| `RELEASE_WINDOW` | **Yes** | Proposed time window | `2026-11-05 20:00–21:00 IST` |
| `OWNER_AND_APPROVER` | **Yes** | Accountable people or teams | `Service owner / change approver` |

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
> Do not invent approvals, change IDs, test results, or maintenance windows.

> [!IMPORTANT]
> Do not include personal contact details or confidential customer data unless explicitly authorized and necessary.

## Example Input

```json
{
  "SERVICE_NAME": "sample-api",
  "RELEASE_VERSION": "v2.4.1 / sha256:REDACTED",
  "CHANGE_SUMMARY": "Add endpoint and fix timeout handling",
  "RELEASE_WINDOW": "Proposed window; pending approval",
  "OWNER_AND_APPROVER": "Service owner / change approver"
}
```

## Copyable Prompt Template

```text
Create a release checklist and change-record draft for SERVICE_NAME, version RELEASE_VERSION. Change summary: CHANGE_SUMMARY. Proposed window: RELEASE_WINDOW. Owner/approver: OWNER_AND_APPROVER. Include scope, dependencies, risk, prechecks, test evidence, backup/state considerations, communication, execution steps, smoke tests, monitoring, rollback triggers, rollback steps, and closure evidence. Mark all unconfirmed facts as TBD and never claim an approval or test has occurred. Format it for an operator to review and complete.
```

## Expected Output

1. Release summary and risk statement.
1. Pre-release, execution, validation, and closure checklists.
1. Rollback decision criteria and communication plan.
1. List of missing approvals/evidence marked TBD.

## Validation Criteria

- [ ] Every action has an owner or an explicit TBD.
- [ ] Release version is immutable or traceable.
- [ ] Rollback triggers are measurable.
- [ ] No approval, result, or change ID is fabricated.

## Troubleshooting & Diagnostics

### Symptom: Checklist lacks service-specific checks

**Checks to perform:**
- Confirm dependency map, health endpoint, and key user journeys.
- Review prior incident and release notes.

**Recommended next step:** Add owner-verified checks and label assumptions.

### Symptom: Rollback steps are vague

**Checks to perform:**
- Confirm previous artifact, configuration version, and data compatibility.
- Check access and expected recovery time.

**Recommended next step:** Run a rollback rehearsal in a safe environment before production use.

## Related Learning & Studio Workspaces

- **Learn:** [Release management](/tools/release-management-basics/learn.html)
- **Lab:** [Build a release checklist](/tools/release-checklist-builder/learn.html)
- **Workflow:** [Change to closure](/tools/change-to-release-closure/learn.html)

