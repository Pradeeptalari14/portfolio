# Build a beginner-friendly CI/CD pipeline

**ID:** `devops-cicd-001`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Beginner`  
**Tags:** `#CI` `#pipeline` `#beginner` `#GitHub Actions`  

---

## Overview

Create a minimal pipeline from commit to test and build, with clear explanations.

**Objective:** Design a small, understandable CI pipeline for a sample application and explain each stage to a beginner.

## Prerequisites

- Application language and build command are known, or can be selected as an explicit assumption.
- A repository with source code and a basic test command, or a clearly labelled sample project.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `APP_STACK` | **Yes** | Language/framework | `Python 3.12 with pytest` |
| `CI_PLATFORM` | **Yes** | CI provider | `GitHub Actions` |
| `BUILD_COMMAND` | **No** | Build/package command | `python -m compileall .` |
| `TEST_COMMAND` | **Yes** | Automated test command | `pytest -q` |
| `DEFAULT_BRANCH` | **Yes** | Protected integration branch | `main` |

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
> Do not assume a deployment stage is required; begin with CI validation only unless explicitly requested.

## Example Input

```json
{
  "APP_STACK": "Python 3.12 with pytest",
  "CI_PLATFORM": "GitHub Actions",
  "BUILD_COMMAND": "python -m compileall .",
  "TEST_COMMAND": "pytest -q",
  "DEFAULT_BRANCH": "main"
}
```

## Copyable Prompt Template

```text
Act as a DevOps engineer and patient instructor. Design a beginner-friendly CI pipeline for APP_STACK using CI_PLATFORM. Use TEST_COMMAND and, if supplied, BUILD_COMMAND. Target branch: DEFAULT_BRANCH. Explain the purpose of each stage, the event triggers, runner requirements, dependency caching trade-offs, artifact handling, and failure behavior. Produce complete example configuration with comments, a short repository layout, setup steps, and a safe test procedure. Mark assumptions explicitly. Do not add deployment or production credentials. Include the expected result for a passing run and a failing test.
```

## Expected Output

1. A short architecture explanation and stage-by-stage flow.
1. Complete pipeline configuration with comments.
1. Required repository files and setup commands.
1. Passing/failing examples and safe validation steps.

## Validation Criteria

- [ ] Configuration parses in the selected CI platform.
- [ ] A deliberate failing test makes the job fail.
- [ ] A passing test produces a successful run.
- [ ] No secrets are hard-coded and no deployment occurs.

## Troubleshooting & Diagnostics

### Symptom: Dependency installation fails

**Checks to perform:**
- Confirm runtime version and lockfile are consistent.
- Inspect package index access and dependency constraints.

**Recommended next step:** Reproduce installation locally from a clean environment and update the lockfile only through review.

### Symptom: Tests pass locally but fail in CI

**Checks to perform:**
- Compare OS/runtime versions and environment variables.
- Check timezone, filesystem case sensitivity, and undeclared local files.

**Recommended next step:** Make dependencies and test setup explicit; add a minimal reproduction.

## Related Learning & Studio Workspaces

- **Learn:** [CI/CD fundamentals](/tools/ci-cd-fundamentals/learn.html)
- **Lab:** [Build your first CI pipeline](/tools/first-ci-pipeline/learn.html)
- **Workflow:** [Commit → test → build](/tools/commit-to-test/learn.html)
- **Repository:** [Starter pipeline repository](/tools/starter-ci-pipeline/learn.html)

