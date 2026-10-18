# Implement canary or blue-green release planning

**ID:** `devops-cicd-008`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Advanced`  
**Tags:** `#canary` `#blue-green` `#SLO` `#release safety`  

---

## Overview

Compare rollout strategies and define measurable promotion and rollback gates.

**Objective:** Select a low-risk rollout approach using explicit service health signals and decision thresholds.

## Prerequisites

- Service architecture and traffic routing are known.
- Baseline service-level indicators and rollback controls are available.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `SERVICE_TYPE` | **Yes** | Service and traffic profile | `HTTP API behind a load balancer` |
| `ROLLOUT_STRATEGY` | **Yes** | Strategy to evaluate | `Canary versus blue-green` |
| `HEALTH_SIGNALS` | **Yes** | Signals for decisions | `Error rate, latency p95, saturation` |
| `OBSERVATION_WINDOW` | **Yes** | Minimum evaluation window | `10 minutes, subject to traffic volume` |
| `ROLLBACK_THRESHOLD` | **Yes** | Approved trigger thresholds | `Error rate exceeds agreed SLO budget` |

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
> Treat all thresholds as proposals until calibrated against real baselines and SLOs.

> [!IMPORTANT]
> Do not change live traffic or production routing.

> [!IMPORTANT]
> Include low-traffic limitations and avoid relying on a single metric.

## Example Input

```json
{
  "SERVICE_TYPE": "HTTP API behind a load balancer",
  "ROLLOUT_STRATEGY": "Canary versus blue-green",
  "HEALTH_SIGNALS": "Error rate, latency p95, saturation",
  "OBSERVATION_WINDOW": "10 minutes, subject to traffic volume",
  "ROLLBACK_THRESHOLD": "Error rate exceeds agreed SLO budget"
}
```

## Copyable Prompt Template

```text
Evaluate ROLLOUT_STRATEGY for SERVICE_TYPE using HEALTH_SIGNALS. Observation window: OBSERVATION_WINDOW. Proposed rollback threshold: ROLLBACK_THRESHOLD. Compare blast radius, infrastructure cost, routing complexity, database compatibility, and observability needs. Define staged traffic increments, minimum sample volume, promotion gates, automatic rollback signals, manual override, and post-release verification. Clearly label thresholds requiring service-owner approval. Do not operate a live deployment.
```

## Expected Output

1. Strategy comparison and recommendation with assumptions.
1. Rollout stages and decision table.
1. Metric thresholds, sample-volume caveats, and rollback steps.
1. Pre-production simulation and operational runbook.

## Validation Criteria

- [ ] Each promotion stage has an explicit go/no-go condition.
- [ ] Rollback is testable and does not depend on unavailable old infrastructure.
- [ ] Health signals include user impact and capacity/saturation where relevant.
- [ ] Thresholds have an owner and are calibrated to baseline behavior.

## Troubleshooting & Diagnostics

### Symptom: Canary metrics are too noisy

**Checks to perform:**
- Check traffic volume, seasonality, and metric aggregation.
- Compare canary and baseline cohorts under similar conditions.

**Recommended next step:** Increase the observation window or sample size and use multiple independent health signals.

### Symptom: Rollback does not restore service

**Checks to perform:**
- Check schema compatibility, state changes, and routing configuration.
- Verify that the previous artifact and capacity remain available.

**Recommended next step:** Test rollback in staging and document cases requiring forward recovery instead.

## Related Learning & Studio Workspaces

- **Learn:** [Progressive delivery](/tools/progressive-delivery/learn.html)
- **Lab:** [Simulate a canary rollout](/tools/canary-rollout-simulation/learn.html)
- **Workflow:** [Release health gates](/tools/release-health-gates/learn.html)

