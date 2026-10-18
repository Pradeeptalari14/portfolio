# Optimize slow CI pipelines using evidence

**ID:** `devops-cicd-014`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Intermediate`  
**Tags:** `#performance` `#pipeline optimization` `#measurement`  

---

## Overview

Find the largest sources of pipeline delay before changing the design.

**Objective:** Build a measurement-led optimization plan for a slow pipeline.

## Prerequisites

- Recent run durations and stage-level timings are available.
- Correctness checks and release requirements are understood.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `PIPELINE_CONFIG` | **Yes** | Current pipeline definition | `Redacted YAML or pipeline stages` |
| `RUN_TIMINGS` | **Yes** | Stage duration samples | `Build 4m, tests 9m, scan 3m over 20 runs` |
| `RUNNER_PROFILE` | **Yes** | Runner resources and OS | `4 vCPU Linux runner` |
| `CONSTRAINTS` | **Yes** | Must-preserve requirements | `Full test suite and security scan required before merge` |

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
> Do not remove required security or quality gates solely to improve speed.

> [!IMPORTANT]
> Do not infer performance improvements without measurements.

> [!IMPORTANT]
> Preserve reproducibility and explain cache invalidation and parallelism risks.

## Example Input

```json
{
  "PIPELINE_CONFIG": "Stages: install, lint, unit tests, integration tests, scan, package",
  "RUN_TIMINGS": "Install 2m, lint 1m, unit tests 8m, integration tests 12m, scan 4m",
  "RUNNER_PROFILE": "4 vCPU Linux runner",
  "CONSTRAINTS": "All tests and security scan required before merge"
}
```

## Copyable Prompt Template

```text
Analyze CI performance for this pipeline. Configuration: PIPELINE_CONFIG. Timings: RUN_TIMINGS. Runner: RUNNER_PROFILE. Constraints: CONSTRAINTS. Identify bottlenecks and classify optimizations by likely impact, confidence, effort, and risk. Consider dependency caching, safe parallelism, test selection, artifact reuse, runner sizing, and unnecessary checkout/setup work. Preserve required checks. Propose a baseline, one change at a time, and a measurement plan using median and percentile duration across comparable runs. Do not claim savings until measured.
```

## Expected Output

1. Baseline interpretation and bottleneck ranking.
1. Prioritized optimization backlog with risks.
1. Example configuration changes where justified.
1. Before/after measurement plan and rollback criteria.

## Validation Criteria

- [ ] Recommendations tie to observed timing evidence.
- [ ] Required checks remain enforced.
- [ ] Comparisons use comparable runs and report sample size.
- [ ] Optimization does not introduce race conditions or stale artifacts.

## Troubleshooting & Diagnostics

### Symptom: Pipeline duration varies widely

**Checks to perform:**
- Segment by runner type, cache state, and workload size.
- Check queue time separately from execution time.

**Recommended next step:** Collect enough comparable runs and optimize the dominant source of variance first.

### Symptom: Parallel jobs cause inconsistent results

**Checks to perform:**
- Check shared resources, test data, and artifact dependencies.
- Inspect race conditions and job-level permissions.

**Recommended next step:** Isolate shared state and define explicit dependencies before re-enabling parallelism.

## Related Learning & Studio Workspaces

- **Learn:** [CI performance engineering](/tools/ci-performance/learn.html)
- **Lab:** [Profile a pipeline](/tools/pipeline-profiling-lab/learn.html)
- **Workflow:** [Find the pipeline bottleneck](/tools/pipeline-bottleneck-analysis/learn.html)

