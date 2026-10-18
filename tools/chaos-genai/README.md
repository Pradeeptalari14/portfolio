# Chaos Engineering for GenAI

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `LLMOps & RAG Pipelines` |
| **Category** | `AI` |
| **Skill Level** | `Level 3 (Distributed & Compliance)` |
| **Target SRE Metric** | `Validated RTO < 5m & Zero Cascading Network Deadlocks` |
| **Artifact Target** | `chaos_mesh.yaml` |
| **Source Repository** | [Pradeeptalari14/tp-chaos-genai](https://github.com/Pradeeptalari14/tp-chaos-genai) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Chaos Mesh manifests simulating API response errors, container restarts, and embedding server delays.

### Core Production Use Case
Validating system fault tolerance against unexpected network latency, pod kills, and disk pressure before production rollout.

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
> Run automated Chaos Mesh / Litmus experiments in staging to verify that circuit breakers, retries, and fallback caches activate as designed.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Assuming multi-zone architectures are resilient without ever simulating active network partition or database failovers.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
kubectl apply -f network-latency-experiment.yaml && kubectl get chaos -n chaos-mesh

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`chaos_mesh.yaml`)

```yaml
# Production Manifest: Chaos Engineering for GenAI
# Domain: LLMOps & RAG Pipelines
# Target Artifact: chaos_mesh.yaml
# Target SRE Standard: Validated RTO < 5m & Zero Cascading Network Deadlocks
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chaos-engineering-for-genai
  namespace: production
  labels:
    app.kubernetes.io/name: chaos-engineering-for-genai
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "Validated RTO < 5m & Zero Cascading Network Deadlocks"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: chaos-engineering-for-genai
  template:
    metadata:
      labels:
        app: chaos-engineering-for-genai
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-chaos-genai:v1.0.0
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

- **Interactive Simulator:** [Open Chaos Engineering for GenAI Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-chaos-genai](https://github.com/Pradeeptalari14/tp-chaos-genai)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

