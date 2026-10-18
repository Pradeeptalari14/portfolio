# Measure DORA-style delivery performance

**ID:** `devops-cicd-010`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Intermediate`  
**Tags:** `#DORA` `#metrics` `#observability` `#continuous improvement`  

---

## Overview

Define reliable delivery metrics without gaming the numbers.

**Objective:** Create metric definitions and a measurement plan for delivery speed and stability.

## Prerequisites

- Deployment, incident, and change events are recorded.
- Measurement period and service/team boundaries are agreed.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `SERVICE_SCOPE` | **Yes** | Service/team measured | `payments-api team` |
| `TIME_WINDOW` | **Yes** | Reporting period | `Last 90 days` |
| `DATA_SOURCES` | **Yes** | Available event sources | `CI runs, deployment records, incident tracker` |
| `SEGMENTATION` | **No** | Useful slices | `Service, environment, release type` |

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
> Do not fabricate metric values from missing data.

> [!IMPORTANT]
> Avoid using team-level metrics as simplistic individual performance scores.

> [!IMPORTANT]
> Document definitions, exclusions, data quality, and uncertainty.

## Example Input

```json
{
  "SERVICE_SCOPE": "payments-api team",
  "TIME_WINDOW": "Last 90 days",
  "DATA_SOURCES": "CI runs, deployment records, incident tracker",
  "SEGMENTATION": "Service, environment, release type"
}
```

## Copyable Prompt Template

```text
Design a delivery-performance measurement plan for SERVICE_SCOPE over TIME_WINDOW using DATA_SOURCES. Segmentation: SEGMENTATION. Define deployment frequency, change lead time, change failure rate, and failed-deployment recovery time in operationally precise terms. Specify event fields, formulas, inclusion/exclusion rules, edge cases, data-quality checks, and a dashboard layout. Do not invent actual values. Explain how to interpret metrics as system-improvement signals rather than individual rankings.
```

## Expected Output

1. Metric dictionary and formulas.
1. Required event schema and data-quality rules.
1. Dashboard and trend-analysis proposal.
1. Caveats, anti-gaming guidance, and improvement questions.

## Validation Criteria

- [ ] Every metric has a reproducible definition and time basis.
- [ ] Numerators and denominators are explicit.
- [ ] Missing or duplicate events are detected.
- [ ] No unsupported numerical result or causal claim is made.

## Troubleshooting & Diagnostics

### Symptom: Deployment frequency differs between reports

**Checks to perform:**
- Compare deployment event definitions and environment filters.
- Check duplicate retries and automated rollback events.

**Recommended next step:** Agree on a canonical event schema and rerun both reports.

### Symptom: Recovery time is missing for some incidents

**Checks to perform:**
- Check incident start/end timestamps and service mapping.
- Determine whether recovery was partial or full.

**Recommended next step:** Report missingness explicitly and improve incident event capture before comparing teams.

## Related Learning & Studio Workspaces

- **Learn:** [Delivery metrics](/tools/delivery-metrics/learn.html)
- **Lab:** [Calculate metrics from events](/tools/dora-metrics-from-events/learn.html)
- **Workflow:** [Deployment event to dashboard](/tools/deployment-event-to-dashboard/learn.html)

