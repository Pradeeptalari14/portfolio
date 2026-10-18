# Jenkins CI/CD Pipeline

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Delivery & GitOps` |
| **Category** | `CICD` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `Zero Critical CVEs in Production & 100% Cryptographically Verified SLSA Provenance` |
| **Artifact Target** | `Jenkinsfile` |
| **Source Repository** | [Pradeeptalari14/tp-jenkins](https://github.com/Pradeeptalari14/tp-jenkins) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Standardize continuous integration cycles. Write automated multi-branch Jenkins pipelines with integrated static scanning triggers.

### Core Production Use Case
Securing the software supply chain against untrusted dependency vulnerabilities, image tampering, and deployment drift in Jenkins CI/CD Pipeline.

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
> Enforce cryptographic Sigstore cosign container signing, CycloneDX SBOM generation, and automated Trivy vulnerability gating before GitOps sync.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Pushing unsigned container images directly to production registries without vulnerability scan gates or immutable SHA256 digest pinning.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
trivy image --severity HIGH,CRITICAL ghcr.io/Pradeeptalari14/tp-jenkins:latest && cosign verify --key cosign.pub ghcr.io/Pradeeptalari14/tp-jenkins:latest

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`Jenkinsfile`)

```toml
# Configuration Artifact: Jenkinsfile
# Studio: Jenkins CI/CD Pipeline
# Domain: Cloud Delivery & GitOps
# Target SRE Standard: Zero Critical CVEs in Production & 100% Cryptographically Verified SLSA Provenance

[service]
name = "jenkins-ci/cd-pipeline"
domain = "Cloud Delivery & GitOps"
mode = "production"
slo_target = "Zero Critical CVEs in Production & 100% Cryptographically Verified SLSA Provenance"

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

- **Interactive Simulator:** [Open Jenkins CI/CD Pipeline Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-jenkins](https://github.com/Pradeeptalari14/tp-jenkins)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

