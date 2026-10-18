# Karpenter Node Autoscaler

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Infrastructure & K8s` |
| **Category** | `CLOUD` |
| **Skill Level** | `Level 3 (Distributed & Compliance)` |
| **Target SRE Metric** | `Sub-15s Scale Reaction & 65% Idle Compute Cost Savings` |
| **Artifact Target** | `nodepool.yaml` |
| **Source Repository** | [Pradeeptalari14/tp-karpenter-autoscaler](https://github.com/Pradeeptalari14/tp-karpenter-autoscaler) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Provision rapid Kubernetes nodes based on pending workload constraints. Pack pods dynamically by GPU, architecture, spot/on-demand ratios, and simulate EKS costs.

### Core Production Use Case
Scaling Kubernetes worker pods based on real-time event queue depth (SQS, Kafka, RabbitMQ) instead of sluggish CPU/memory metrics.

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
> Deploy KEDA ScaledObjects configured with proactive target queue length triggers and scale-to-zero when queues are idle.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Using basic Kubernetes HPA based solely on CPU, leaving queue processing delayed while pods fail to trigger scale thresholds.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
kubectl apply -f keda-scaledobject.yaml && kubectl get scaledobject -w

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`nodepool.yaml`)

```yaml
# Production Manifest: Karpenter Node Autoscaler
# Domain: Cloud Infrastructure & K8s
# Target Artifact: nodepool.yaml
# Target SRE Standard: Sub-15s Scale Reaction & 65% Idle Compute Cost Savings
apiVersion: apps/v1
kind: Deployment
metadata:
  name: karpenter-node-autoscaler
  namespace: production
  labels:
    app.kubernetes.io/name: karpenter-node-autoscaler
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "Sub-15s Scale Reaction & 65% Idle Compute Cost Savings"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: karpenter-node-autoscaler
  template:
    metadata:
      labels:
        app: karpenter-node-autoscaler
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-karpenter-autoscaler:v1.0.0
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

- **Interactive Simulator:** [Open Karpenter Node Autoscaler Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-karpenter-autoscaler](https://github.com/Pradeeptalari14/tp-karpenter-autoscaler)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

