# Agile & ITSM Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Automation & SRE Runbooks` |
| **Category** | `AUTOMATION` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `85% Reduction in Alert Fatigue & MTTR < 8m on P1 Outages` |
| **Artifact Target** | `servicenow-change.json` |
| **Source Repository** | [Pradeeptalari14/tp-agile-itsm](https://github.com/Pradeeptalari14/tp-agile-itsm) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Automate IT service management delivery. Generate REST API request payloads and scripts to automate ServiceNow changes, Jira issue trackers, and PagerDuty alert triggers.

### Core Production Use Case
Eliminating alert fatigue, deduping flapping notifications, and dispatching webhook payloads during Sev-1 production outages in Agile & ITSM Studio.

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
> Configure Alertmanager inhibition rules, multi-receiver grouping windows (5m wait), and automated webhook escalations linked to SRE runbooks.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Firing unthrottled individual Slack/SMS notifications on every single CPU spike, leading SREs to ignore critical incident alerts.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
amtool check-config servicenow-change.json && amtool alert query alertname="HighErrorRate"

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`servicenow-change.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "studio": "agile-&-itsm-studio",
  "domain": "Automation & SRE Runbooks",
  "targetArtifact": "servicenow-change.json",
  "sreMetric": "85% Reduction in Alert Fatigue & MTTR < 8m on P1 Outages",
  "repository": "Pradeeptalari14/tp-agile-itsm",
  "service": {
    "name": "agile-&-itsm-studio",
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

- **Interactive Simulator:** [Open Agile & ITSM Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-agile-itsm](https://github.com/Pradeeptalari14/tp-agile-itsm)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

