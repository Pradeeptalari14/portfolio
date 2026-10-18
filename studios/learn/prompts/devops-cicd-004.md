# Add dependency caching without stale-build risk

**ID:** `devops-cicd-004`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Intermediate`  
**Tags:** `#performance` `#caching` `#dependencies`  

---

## Overview

Speed up builds while keeping cache keys correct and safe.

**Objective:** Recommend a cache strategy based on dependency lockfiles and the CI platform.

## Prerequisites

- Package manager and lockfile are known.
- Current pipeline timing or cache behavior is available if performance tuning is requested.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `CI_PLATFORM` | **Yes** | CI provider | `GitHub Actions` |
| `PACKAGE_MANAGER` | **Yes** | Package manager | `npm` |
| `LOCKFILE` | **Yes** | Lockfile path | `package-lock.json` |
| `OS_MATRIX` | **No** | Runner OS matrix | `ubuntu-latest` |
| `CURRENT_CACHE_CONFIG` | **No** | Existing cache configuration | `Paste redacted YAML or 'none'` |

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
> Never cache credentials, cloud profiles, .env files, or private package tokens.

> [!IMPORTANT]
> Do not disable lockfile integrity checks to make cache restoration succeed.

## Example Input

```json
{
  "CI_PLATFORM": "GitHub Actions",
  "PACKAGE_MANAGER": "npm",
  "LOCKFILE": "package-lock.json",
  "OS_MATRIX": "ubuntu-latest",
  "CURRENT_CACHE_CONFIG": "none"
}
```

## Copyable Prompt Template

```text
Design a safe dependency-cache strategy for CI_PLATFORM using PACKAGE_MANAGER and LOCKFILE. Runner matrix: OS_MATRIX. Existing configuration: CURRENT_CACHE_CONFIG. Explain cache contents, key composition, restore prefixes, OS/runtime separation, invalidation behavior, and how the package manager still verifies dependencies. Provide the smallest configuration and a before/after measurement plan. Explicitly exclude secrets and generated outputs that should be rebuilt.
```

## Expected Output

1. Cache design and key rationale.
1. Configuration snippet.
1. Cache invalidation examples.
1. Benchmark plan using repeated clean runs.

## Validation Criteria

- [ ] Changing the lockfile invalidates the primary cache key.
- [ ] Cold and warm builds both remain correct.
- [ ] No credentials or private configuration are cached.
- [ ] Build time is measured rather than assumed to improve.

## Troubleshooting & Diagnostics

### Symptom: Cache never hits

**Checks to perform:**
- Compare exact key strings and lockfile path.
- Check OS or runtime differences in the key.

**Recommended next step:** Add diagnostic output for the computed key and simplify key dimensions without weakening correctness.

### Symptom: Cached build behaves inconsistently

**Checks to perform:**
- Check whether generated artifacts are being cached.
- Compare lockfile and installed dependency state.

**Recommended next step:** Cache only reusable package-manager data and run a clean uncached build to establish a baseline.

## Related Learning & Studio Workspaces

- **Learn:** [CI caching](/tools/ci-caching/learn.html)
- **Lab:** [Configure dependency caching](/tools/dependency-cache-lab/learn.html)
- **Workflow:** [Cache hit/miss flow](/tools/cache-hit-miss-flow/learn.html)

