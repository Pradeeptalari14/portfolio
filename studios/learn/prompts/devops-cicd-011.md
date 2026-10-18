# Create a reusable CI workflow template

**ID:** `devops-cicd-011`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Intermediate`  
**Tags:** `#reusable workflows` `#standards` `#platform engineering`  

---

## Overview

Standardize common pipeline stages while preserving safe customization.

**Objective:** Design a reusable workflow that reduces duplication without hiding important behavior.

## Prerequisites

- At least two similar workflows exist or common standards are documented.
- CI provider supports the intended reusable-workflow pattern.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `CI_PLATFORM` | **Yes** | CI provider | `GitHub Actions` |
| `COMMON_STAGES` | **Yes** | Reusable stages | `lint, test, build, scan` |
| `INPUTS` | **Yes** | Allowed configurable inputs | `runtime-version, test-command` |
| `PERMISSION_MODEL` | **Yes** | Token and secret strategy | `Read-only by default; explicit permissions per caller` |

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
> Avoid arbitrary shell command inputs from untrusted callers.

> [!IMPORTANT]
> Do not pass all secrets automatically to reusable workflows.

> [!IMPORTANT]
> Pin external reusable workflows or actions according to supply-chain policy.

## Example Input

```json
{
  "CI_PLATFORM": "GitHub Actions",
  "COMMON_STAGES": "lint, test, build, scan",
  "INPUTS": "runtime-version, test-command",
  "PERMISSION_MODEL": "Read-only by default; explicit permissions per caller"
}
```

## Copyable Prompt Template

```text
Design a reusable CI workflow for CI_PLATFORM with COMMON_STAGES. Configurable inputs: INPUTS. Permission model: PERMISSION_MODEL. Provide a reusable workflow and two example callers. Define typed inputs, defaults, outputs, artifact naming, failure propagation, concurrency, and versioning. Explain which behavior must remain standardized and which inputs are safe to customize. Avoid arbitrary command execution and implicit secret inheritance.
```

## Expected Output

1. Reusable workflow design and complete sample configuration.
1. Two caller examples.
1. Input/output contract and versioning policy.
1. Migration plan and compatibility test checklist.

## Validation Criteria

- [ ] Inputs have types, defaults, and documented constraints.
- [ ] Caller permissions are least-privilege.
- [ ] A failing required stage fails the caller workflow.
- [ ] Both sample callers validate against the same interface.

## Troubleshooting & Diagnostics

### Symptom: Reusable workflow input is unavailable

**Checks to perform:**
- Check input name, type, required flag, and caller syntax.
- Confirm reusable workflow invocation path and ref.

**Recommended next step:** Validate the declared contract and test a minimal caller.

### Symptom: Template becomes too configurable

**Checks to perform:**
- Identify inputs that allow arbitrary shell or permission escalation.
- Compare caller differences against the shared standard.

**Recommended next step:** Replace risky free-form inputs with enumerated options or separate reviewed templates.

## Related Learning & Studio Workspaces

- **Learn:** [Reusable CI workflows](/tools/reusable-ci-workflows/learn.html)
- **Lab:** [Build a reusable workflow](/tools/workflow-template-lab/learn.html)
- **Workflow:** [Shared pipeline contract](/tools/shared-pipeline-contract/learn.html)

