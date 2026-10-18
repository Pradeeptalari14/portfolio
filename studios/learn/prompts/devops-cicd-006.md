# Add software composition analysis and secret scanning

**ID:** `devops-cicd-006`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Intermediate`  
**Tags:** `#DevSecOps` `#SCA` `#secret scanning` `#policy`  

---

## Overview

Integrate dependency and secret checks with actionable failure policies.

**Objective:** Recommend security checks that detect known vulnerable dependencies and accidental secret exposure.

## Prerequisites

- Repository language and package manifests are known.
- Security policy or risk tolerance is available; otherwise propose a conservative baseline.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `REPOSITORY_STACK` | **Yes** | Languages and package managers | `Python/Poetry and JavaScript/npm` |
| `CI_PLATFORM` | **Yes** | CI provider | `GitHub Actions` |
| `SEVERITY_THRESHOLD` | **Yes** | Fail threshold | `High and Critical, with documented exceptions` |
| `EXCEPTION_OWNER` | **No** | Team responsible for approved exceptions | `Application Security` |

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
> Never print detected secret values in logs or generated reports.

> [!IMPORTANT]
> Do not treat a scanner's absence of findings as proof that software is secure.

> [!IMPORTANT]
> Use reviewed, maintained scanner actions and pin versions according to organizational policy.

## Example Input

```json
{
  "REPOSITORY_STACK": "Python/Poetry and JavaScript/npm",
  "CI_PLATFORM": "GitHub Actions",
  "SEVERITY_THRESHOLD": "High and Critical, with documented exceptions",
  "EXCEPTION_OWNER": "Application Security"
}
```

## Copyable Prompt Template

```text
Design CI security checks for REPOSITORY_STACK on CI_PLATFORM. Define dependency vulnerability scanning, lockfile coverage, secret detection, severity threshold SEVERITY_THRESHOLD, reporting, suppression governance, and ownership by EXCEPTION_OWNER if supplied. Provide a sample pipeline, explain false positives and exception expiry, and describe what happens when a real secret is detected. Never reveal the secret in output. Separate blocking findings from advisory findings and avoid promising complete security coverage.
```

## Expected Output

1. Recommended scanners and placement in CI.
1. Pipeline configuration and policy table.
1. Redacted finding examples and remediation workflow.
1. Exception ownership, expiry, and audit guidance.

## Validation Criteria

- [ ] A test fixture with a known dummy secret is detected without printing the value.
- [ ] A controlled vulnerable dependency fixture demonstrates the configured policy.
- [ ] Exceptions are traceable and time-bounded.
- [ ] Scanner failures are distinguishable from clean scan results.

## Troubleshooting & Diagnostics

### Symptom: Scanner reports no dependencies

**Checks to perform:**
- Check whether lockfiles are committed and supported.
- Inspect scanner paths and working directory.

**Recommended next step:** Configure explicit manifest/lockfile paths and test against a known fixture.

### Symptom: Secret scanner produces noisy findings

**Checks to perform:**
- Review finding context without copying sensitive values.
- Check whether the finding is a placeholder or a real credential.

**Recommended next step:** Use narrow, reviewed suppressions; rotate any credential that may have been exposed.

## Related Learning & Studio Workspaces

- **Learn:** [DevSecOps scanning](/tools/devsecops-scanning/learn.html)
- **Lab:** [Add security scans](/tools/dependency-secret-scanning/learn.html)
- **Workflow:** [Finding to remediation](/tools/security-finding-to-remediation/learn.html)

