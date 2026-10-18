# Knative Serverless Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Infrastructure & K8s` |
| **Category** | `CLOUD` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `100% Non-Root Process Isolation & Sub-2s Daemon Bootstrap Latency` |
| **Artifact Target** | `service.yaml` |
| **Source Repository** | [Pradeeptalari14/tp-knative-routing](https://github.com/Pradeeptalari14/tp-knative-routing) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Configure serverless knative services with scale-to-zero thresholds. Map event-driven broker triggers and simulate live scaling container logs.

### Core Production Use Case
Hardening host OS runtime, optimizing daemon lifecycle management, and isolating microservice container processes in Knative Serverless Studio.

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
> Standardize on lightweight distroless container images, non-root systemd service cgroup limits, and read-only root filesystems.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Running container processes as root with unrestricted host PID/network namespaces and mutable disk volumes.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
systemctl status knative-serverless-studio --no-pager || docker inspect --format '{{.State.Status}}' container_app

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`service.yaml`)

```yaml
# Production Manifest: Knative Serverless Studio
# Domain: Cloud Infrastructure & K8s
# Target Artifact: service.yaml
# Target SRE Standard: 100% Non-Root Process Isolation & Sub-2s Daemon Bootstrap Latency
apiVersion: apps/v1
kind: Deployment
metadata:
  name: knative-serverless-studio
  namespace: production
  labels:
    app.kubernetes.io/name: knative-serverless-studio
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "100% Non-Root Process Isolation & Sub-2s Daemon Bootstrap Latency"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: knative-serverless-studio
  template:
    metadata:
      labels:
        app: knative-serverless-studio
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-knative-routing:v1.0.0
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

- **Interactive Simulator:** [Open Knative Serverless Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-knative-routing](https://github.com/Pradeeptalari14/tp-knative-routing)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

