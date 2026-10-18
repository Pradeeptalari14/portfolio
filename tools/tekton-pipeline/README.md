# Tekton Pipeline Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Delivery & GitOps` |
| **Category** | `CICD` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `Sub-45s Node Autoscaling & Zero Unplanned Service Disruption` |
| **Artifact Target** | `pipeline.yaml` |
| **Source Repository** | [Pradeeptalari14/tp-tekton-pipeline](https://github.com/Pradeeptalari14/tp-tekton-pipeline) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Author declarative Kubernetes-native CI/CD build definitions. Scaffold Tekton Tasks, Pipelines, and PipelineRuns, and execute interactive DAG steps runs.

### Core Production Use Case
Eliminating node provisioning lag, pod scheduling starvation, and network policy drift in enterprise Tekton Pipeline Studio Kubernetes environments.

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
> Standardize on declarative GitOps manifests with Karpenter fast node consolidation, eBPF Cilium network policies, and rolling zero-downtime updates.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Manually editing live cluster resources with kubectl edit or running static oversized node groups that waste idle cloud compute.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
kubectl apply -f pipeline.yaml --dry-run=server && kubectl get pods -l app=tekton-pipeline-studio -w

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`pipeline.yaml`)

```yaml
# Production Manifest: Tekton Pipeline Studio
# Domain: Cloud Delivery & GitOps
# Target Artifact: pipeline.yaml
# Target SRE Standard: Sub-45s Node Autoscaling & Zero Unplanned Service Disruption
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tekton-pipeline-studio
  namespace: production
  labels:
    app.kubernetes.io/name: tekton-pipeline-studio
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "Sub-45s Node Autoscaling & Zero Unplanned Service Disruption"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: tekton-pipeline-studio
  template:
    metadata:
      labels:
        app: tekton-pipeline-studio
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-tekton-pipeline:v1.0.0
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

- **Interactive Simulator:** [Open Tekton Pipeline Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-tekton-pipeline](https://github.com/Pradeeptalari14/tp-tekton-pipeline)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

