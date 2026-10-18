# Alertmanager Visualizer

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Incident Triage & Observability` |
| **Category** | `OBSERVABILITY` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `85% Reduction in Alert Fatigue & MTTR < 8m on P1 Outages` |
| **Artifact Target** | `alertmanager.yaml` |
| **Source Repository** | [Pradeeptalari14/tp-alertmanager-visualizer](https://github.com/Pradeeptalari14/tp-alertmanager-visualizer) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Design nested alert dispatch trees. Map matching labels, PagerDuty receivers, grouping windows, and visualize alert escalation paths in real-time.

### Core Production Use Case
Eliminating alert fatigue, deduping flapping notifications, and dispatching webhook payloads during Sev-1 production outages in Alertmanager Visualizer.

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
amtool check-config alertmanager.yaml && amtool alert query alertname="HighErrorRate"

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`alertmanager.yaml`)

```yaml
# Production Manifest: Alertmanager Visualizer
# Domain: Incident Triage & Observability
# Target Artifact: alertmanager.yaml
# Target SRE Standard: 85% Reduction in Alert Fatigue & MTTR < 8m on P1 Outages
apiVersion: apps/v1
kind: Deployment
metadata:
  name: alertmanager-visualizer
  namespace: production
  labels:
    app.kubernetes.io/name: alertmanager-visualizer
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "85% Reduction in Alert Fatigue & MTTR < 8m on P1 Outages"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: alertmanager-visualizer
  template:
    metadata:
      labels:
        app: alertmanager-visualizer
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-alertmanager-visualizer:v1.0.0
          imagePullPolicy: IfNotPresent
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2000m"
              memory: "4Gi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
```

---

## 5. Navigation & Next Steps

- **Interactive Simulator:** [Open Alertmanager Visualizer Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-alertmanager-visualizer](https://github.com/Pradeeptalari14/tp-alertmanager-visualizer)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

