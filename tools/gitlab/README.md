# GitLab CI/CD Pipeline Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Delivery & GitOps` |
| **Category** | `CICD` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `100% Trace Coverage & <1.2% Observability Agent CPU Overhead` |
| **Artifact Target** | `.gitlab-ci.yml` |
| **Source Repository** | [Pradeeptalari14/tp-gitlab](https://github.com/Pradeeptalari14/tp-gitlab) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Generate robust GitLab CI/CD pipelines (.gitlab-ci.yml) with SRE stages, dependency caching, container builds, and security scans.

### Core Production Use Case
Detecting kernel-level socket bottlenecks, memory leak regressions, and microservice trace latency spikes in production GitLab CI/CD Pipeline Studio.

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
> Deploy OpenTelemetry auto-instrumentation alongside in-kernel eBPF probes with continuous sampling, streaming unified metrics to Prometheus and Loki.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Scraping unaggregated debug logs or using invasive synchronous APM agents that introduce noticeable request latency overhead.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
curl -sSf http://localhost:9090/metrics | grep -E "p99_latency|error_rate|active_workers"

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`.gitlab-ci.yml`)

```yaml
# Production Manifest: GitLab CI/CD Pipeline Studio
# Domain: Cloud Delivery & GitOps
# Target Artifact: .gitlab-ci.yml
# Target SRE Standard: 100% Trace Coverage & <1.2% Observability Agent CPU Overhead
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gitlab-ci/cd-pipeline-studio
  namespace: production
  labels:
    app.kubernetes.io/name: gitlab-ci/cd-pipeline-studio
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "100% Trace Coverage & <1.2% Observability Agent CPU Overhead"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: gitlab-ci/cd-pipeline-studio
  template:
    metadata:
      labels:
        app: gitlab-ci/cd-pipeline-studio
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-gitlab:v1.0.0
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

- **Interactive Simulator:** [Open GitLab CI/CD Pipeline Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-gitlab](https://github.com/Pradeeptalari14/tp-gitlab)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

