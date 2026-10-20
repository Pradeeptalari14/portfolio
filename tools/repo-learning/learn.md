# Unified Repository Learning Workspace & Real Project Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Delivery & GitOps` |
| **Category** | `DEVOPS` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `99.95% Availability SLO & 100% Audited Reproducibility` |
| **Artifact Target** | `repository-workspace.yaml` |
| **Source Repository** | [Pradeeptalari14/tp-repo-learning](https://github.com/Pradeeptalari14/tp-repo-learning) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Understand real codebases, trace architectural request execution, follow guided 10-point courses, launch one-click setups, test in-browser code diffs, and bridge directly into 347 engineering studios.

### Core Production Use Case
Production engineering: Deploying resilient, schema-validated Unified Repository Learning Workspace & Real Project Studio services with audited compliance and zero-drift operational reliability.

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
> Standardize on version-controlled declarations (repository-workspace.yaml), enforce automated validation before commit, and monitor runtime telemetry against target SLOs.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Manual ad-hoc configuration adjustments in live environments without versioned state manifests or automated rollback testing.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
bash scripts/validate.sh --manifest repository-workspace.yaml --verify-health --environment production

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`repository-workspace.yaml`)

```yaml
# Production Manifest: Unified Repository Learning Workspace & Real Project Studio
# Domain: Cloud Delivery & GitOps
# Target Artifact: repository-workspace.yaml
# Target SRE Standard: 99.95% Availability SLO & 100% Audited Reproducibility
apiVersion: apps/v1
kind: Deployment
metadata:
  name: unified-repository-learning-workspace-&-real-project-studio
  namespace: production
  labels:
    app.kubernetes.io/name: unified-repository-learning-workspace-&-real-project-studio
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "99.95% Availability SLO & 100% Audited Reproducibility"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: unified-repository-learning-workspace-&-real-project-studio
  template:
    metadata:
      labels:
        app: unified-repository-learning-workspace-&-real-project-studio
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-repo-learning:v1.0.0
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

- **Interactive Simulator:** [Open Unified Repository Learning Workspace & Real Project Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-repo-learning](https://github.com/Pradeeptalari14/tp-repo-learning)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

