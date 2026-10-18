# AWS IAM Policy Analyzer

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Automation & SRE Runbooks` |
| **Category** | `AUTOMATION` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `99.95% Availability SLO & 100% Audited Reproducibility` |
| **Artifact Target** | `iam-policy.json` |
| **Source Repository** | [Pradeeptalari14/tp-aws-iam](https://github.com/Pradeeptalari14/tp-aws-iam) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Build secure IAM identity-based policies and permission boundaries. Evaluate API call permissions through a step-by-step evaluation logic flow simulator.

### Core Production Use Case
Production engineering: Deploying resilient, schema-validated AWS IAM Policy Analyzer services with audited compliance and zero-drift operational reliability.

```mermaid
flowchart LR
    A[Learn: Mental Model] --> B[Lab: Interactive Studio]
    B --> C[Flow: Architectural Diagram]
    C --> D[Troubleshoot: SRE Failure Drill]
    D --> E[Real Project: GitHub Repo]
```

---

## 2. Best Architectural Treatment vs. Anti-Pattern

### Recommended Production Practice
> [!TIP]
> Standardize on version-controlled declarations (iam-policy.json), enforce automated validation before commit, and monitor runtime telemetry against target SLOs.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Manual ad-hoc configuration adjustments in live environments without versioned state manifests or automated rollback testing.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
bash scripts/validate.sh --manifest iam-policy.json --verify-health --environment production

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`iam-policy.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "studio": "aws-iam-policy-analyzer",
  "domain": "Automation & SRE Runbooks",
  "targetArtifact": "iam-policy.json",
  "sreMetric": "99.95% Availability SLO & 100% Audited Reproducibility",
  "repository": "Pradeeptalari14/tp-aws-iam",
  "service": {
    "name": "aws-iam-policy-analyzer",
    "mode": "production",
    "version": "1.0.0",
    "resilience": {
      "circuitBreaker": true,
      "maxRetries": 3,
      "timeoutMs": 5000
    },
    "telemetry": {
      "enabled": true,
      "endpoint": "otel-collector:4317",
      "sampleRate": 1.0
    }
  }
}
```

---

## 5. Navigation & Next Steps

- **Interactive Simulator:** [Open AWS IAM Policy Analyzer Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-aws-iam](https://github.com/Pradeeptalari14/tp-aws-iam)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

