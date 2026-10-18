# Generate an incident-ready CI/CD runbook

**ID:** `devops-cicd-015`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Beginner`  
**Tags:** `#runbook` `#incident response` `#operations` `#troubleshooting`  

---

## Overview

Document safe first-response steps for pipeline or release failures.

**Objective:** Produce a runbook that helps responders identify impact, collect evidence, and recover safely.

## Prerequisites

- Pipeline owner and supported platform are known.
- Common failure types and escalation path are available or marked TBD.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `PIPELINE_NAME` | **Yes** | Pipeline or workflow | `payments-api-release` |
| `CI_PLATFORM` | **Yes** | CI/CD platform | `GitHub Actions` |
| `COMMON_FAILURES` | **Yes** | Known failure scenarios | `Dependency install, test failure, registry auth, deployment health check` |
| `ESCALATION_TEAM` | **No** | Responsible team | `Developer Platform on-call` |

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
> Prefer read-only diagnosis before remediation.

> [!IMPORTANT]
> Do not include privileged tokens or instruct responders to bypass approvals.

> [!IMPORTANT]
> Clearly distinguish safe diagnostics from actions requiring change approval.

## Example Input

```json
{
  "PIPELINE_NAME": "payments-api-release",
  "CI_PLATFORM": "GitHub Actions",
  "COMMON_FAILURES": "Dependency install, test failure, registry auth, deployment health check",
  "ESCALATION_TEAM": "Developer Platform on-call"
}
```

## Copyable Prompt Template

```text
Write an incident-ready runbook for PIPELINE_NAME on CI_PLATFORM. Common failures: COMMON_FAILURES. Escalation: ESCALATION_TEAM if supplied. Include purpose, impact assessment, severity guidance, first-response checklist, safe read-only diagnostics, log locations, symptom-to-check mapping, remediation options with risk, approval gates, rollback criteria, escalation evidence, and recovery verification. Mark unknown owners and links as TBD. Never advise bypassing required checks or approvals. Separate commands that inspect state from commands that modify state.
```

## Expected Output

1. Readable runbook with a quick-start checklist.
1. Failure symptom and diagnostic decision table.
1. Safe commands/examples and clearly marked change actions.
1. Escalation packet and recovery verification checklist.

## Validation Criteria

- [ ] A new responder can identify the first safe diagnostic step.
- [ ] Every modifying action has a risk/approval note.
- [ ] Escalation information is explicit or marked TBD.
- [ ] Recovery is verified with observable success criteria.

## Troubleshooting & Diagnostics

### Symptom: Runbook points to outdated UI or logs

**Checks to perform:**
- Verify current platform navigation and permissions.
- Check whether the workflow has been renamed or moved.

**Recommended next step:** Assign a runbook owner and add a periodic review date.

### Symptom: Responder cannot determine whether to roll back

**Checks to perform:**
- Check impact, health indicators, release state, and rollback prerequisites.
- Confirm whether data/schema changes are reversible.

**Recommended next step:** Define owner-approved decision thresholds and document forward-recovery cases.

## Related Learning & Studio Workspaces

- **Learn:** [Operating CI/CD systems](/tools/ci-cd-operations/learn.html)
- **Lab:** [Practise pipeline incident response](/tools/incident-runbook-exercise/learn.html)
- **Workflow:** [CI/CD incident response](/tools/pipeline-incident-response/learn.html)
- **Repository:** [Runbook template](/tools/ci-cd-runbook-template/learn.html)

