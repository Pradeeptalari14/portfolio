# Enterprise K8s AI Platform Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `LLMOps & AI Runtime` |
| **Category** | `AI` |
| **Skill Level** | `Level 4 (Kernel & Deep AI)` |
| **Target SRE Metric** | `2.8x Higher Concurrency & <4% VRAM External Fragmentation` |
| **Artifact Target** | `k8s_platform.yaml` |
| **Source Repository** | [Pradeeptalari14/tp-enterprise-ai-k8s](https://github.com/Pradeeptalari14/tp-enterprise-ai-k8s) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Orchestrate end-to-end AI platform environments on Kubernetes. Provision Ray clusters, GPU node pools, and vLLM scale rules.

### Core Production Use Case
High-throughput LLM production serving handling bursty traffic where traditional contiguous KV-caches waste up to 70% of GPU VRAM via external fragmentation.

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
> Implement vLLM PagedAttention v2 with virtual memory block tables (16/32 token pages) and dynamic chunked prefill co-scheduled alongside token decode batches.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Allocating static contiguous max_tokens buffers upfront per request, resulting in severe GPU memory starvation and low concurrent batch sizes.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
python3 -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-3-8B-Instruct --gpu-memory-utilization 0.92 --block-size 16 --enable-chunked-prefill

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`k8s_platform.yaml`)

```yaml
# Production Manifest: Enterprise K8s AI Platform Studio
# Domain: LLMOps & AI Runtime
# Target Artifact: k8s_platform.yaml
# Target SRE Standard: 2.8x Higher Concurrency & <4% VRAM External Fragmentation
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enterprise-k8s-ai-platform-studio
  namespace: production
  labels:
    app.kubernetes.io/name: enterprise-k8s-ai-platform-studio
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "2.8x Higher Concurrency & <4% VRAM External Fragmentation"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: enterprise-k8s-ai-platform-studio
  template:
    metadata:
      labels:
        app: enterprise-k8s-ai-platform-studio
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-enterprise-ai-k8s:v1.0.0
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

- **Interactive Simulator:** [Open Enterprise K8s AI Platform Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-enterprise-ai-k8s](https://github.com/Pradeeptalari14/tp-enterprise-ai-k8s)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

