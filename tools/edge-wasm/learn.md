# Edge WASM Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Infrastructure & K8s` |
| **Category** | `CLOUD` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `100% Non-Root Process Isolation & Sub-2s Daemon Bootstrap Latency` |
| **Artifact Target** | `spin.toml` |
| **Source Repository** | [Pradeeptalari14/tp-edge-wasm](https://github.com/Pradeeptalari14/tp-edge-wasm) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Orchestrate WebAssembly edge functions, Fermyon Spin configurations, and lightweight serverless runtimes.

### Core Production Use Case
Hardening host OS runtime, optimizing daemon lifecycle management, and isolating microservice container processes in Edge WASM Studio.

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
systemctl status edge-wasm-studio --no-pager || docker inspect --format '{{.State.Status}}' container_app

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`spin.toml`)

```toml
# Configuration Artifact: spin.toml
# Studio: Edge WASM Studio
# Domain: Cloud Infrastructure & K8s
# Target SRE Standard: 100% Non-Root Process Isolation & Sub-2s Daemon Bootstrap Latency

[service]
name = "edge-wasm-studio"
domain = "Cloud Infrastructure & K8s"
mode = "production"
slo_target = "100% Non-Root Process Isolation & Sub-2s Daemon Bootstrap Latency"

[telemetry]
enabled = true
endpoint = "otel-collector:4317"
sample_rate = 1.0

[resilience]
circuit_breaker = true
retry_count = 3
timeout_ms = 5000
```

---

## 5. Navigation & Next Steps

- **Interactive Simulator:** [Open Edge WASM Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-edge-wasm](https://github.com/Pradeeptalari14/tp-edge-wasm)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

