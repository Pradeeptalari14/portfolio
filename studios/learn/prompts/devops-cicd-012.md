# Investigate flaky automated tests

**ID:** `devops-cicd-012`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Intermediate`  
**Tags:** `#testing` `#flaky tests` `#quality engineering`  

---

## Overview

Separate product defects, environment instability, and test-design problems.

**Objective:** Create an evidence-driven plan to diagnose and reduce flaky CI tests.

## Prerequisites

- Failing test names and timestamps are available.
- Logs and retry history can be shared in redacted form.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `TEST_FRAMEWORK` | **Yes** | Framework | `pytest` |
| `FAILURE_HISTORY` | **Yes** | Observed failures and passes | `Fails intermittently on CI, passes locally` |
| `ENVIRONMENT` | **Yes** | Runner and dependency details | `Ubuntu runner, Python 3.12` |
| `TEST_SCOPE` | **Yes** | Unit/integration/e2e | `Integration test using a temporary database` |

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
> Do not recommend hiding flakiness by permanently skipping tests or increasing retries without diagnosis.

> [!IMPORTANT]
> Do not expose production data or credentials in test fixtures.

## Example Input

```json
{
  "TEST_FRAMEWORK": "pytest",
  "FAILURE_HISTORY": "Same test fails intermittently on CI but passes locally",
  "ENVIRONMENT": "Ubuntu runner, Python 3.12",
  "TEST_SCOPE": "Integration test using a temporary database"
}
```

## Copyable Prompt Template

```text
Investigate flaky tests using TEST_FRAMEWORK. Failure history: FAILURE_HISTORY. Environment: ENVIRONMENT. Test scope: TEST_SCOPE. Build a hypothesis table covering race conditions, shared state, timing, network dependencies, test ordering, resource exhaustion, and environment mismatch. For each hypothesis, specify evidence to collect and a minimal experiment. Recommend deterministic test isolation, bounded waits, cleanup, and observability. Treat retries as temporary diagnostics, not the final fix. Do not assert a root cause without evidence.
```

## Expected Output

1. Ranked hypotheses tied to observed evidence.
1. Instrumentation and reproduction plan.
1. Minimal code/config changes with trade-offs.
1. Flake-rate measurement and regression prevention.

## Validation Criteria

- [ ] Proposed experiments distinguish between hypotheses.
- [ ] Test cleanup and isolation are explicit.
- [ ] Flake rate is measured across repeated runs.
- [ ] Retries or skips are not used to conceal unresolved failures.

## Troubleshooting & Diagnostics

### Symptom: Failure cannot be reproduced locally

**Checks to perform:**
- Compare runner OS, CPU/memory, dependency versions, and parallelism.
- Capture seed, ordering, timestamps, and resource usage.

**Recommended next step:** Add deterministic diagnostics and reproduce in a CI-like isolated container.

### Symptom: Test passes only when retried

**Checks to perform:**
- Inspect timing assumptions and shared mutable state.
- Check whether retry changes load or ordering.

**Recommended next step:** Use retry data to narrow the failure window, then fix synchronization or isolation.

## Related Learning & Studio Workspaces

- **Learn:** [Reliable automated tests](/tools/test-reliability/learn.html)
- **Lab:** [Investigate a flaky test](/tools/flaky-test-investigation/learn.html)
- **Workflow:** [Test failure to root cause](/tools/test-failure-to-root-cause/learn.html)

