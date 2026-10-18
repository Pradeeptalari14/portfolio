# GitHub Actions Workflow Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Delivery & GitOps` |
| **Category** | `CICD` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `Zero Critical CVEs in Production & 100% Cryptographically Verified SLSA Provenance` |
| **Artifact Target** | `ci.yml` |
| **Source Repository** | [Pradeeptalari14/tp-github-actions](https://github.com/Pradeeptalari14/tp-github-actions) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Generate high-level, production-ready CI/CD pipelines with integrated Snyk/Trivy scans and secure multi-platform container pushes.

### Core Production Use Case
Securing the software supply chain against untrusted dependency vulnerabilities, image tampering, and deployment drift in GitHub Actions Workflow Studio.

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
trivy image --severity HIGH,CRITICAL ghcr.io/Pradeeptalari14/tp-github-actions:latest && cosign verify --key cosign.pub ghcr.io/Pradeeptalari14/tp-github-actions:latest

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`ci.yml`)

```yaml
# Production Manifest: GitHub Actions Workflow Studio
# Domain: Cloud Delivery & GitOps
# Target Artifact: ci.yml
# Target SRE Standard: Zero Critical CVEs in Production & 100% Cryptographically Verified SLSA Provenance
apiVersion: apps/v1
kind: Deployment
metadata:
  name: github-actions-workflow-studio
  namespace: production
  labels:
    app.kubernetes.io/name: github-actions-workflow-studio
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "Zero Critical CVEs in Production & 100% Cryptographically Verified SLSA Provenance"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: github-actions-workflow-studio
  template:
    metadata:
      labels:
        app: github-actions-workflow-studio
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-github-actions:v1.0.0
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

- **Interactive Simulator:** [Open GitHub Actions Workflow Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-github-actions](https://github.com/Pradeeptalari14/tp-github-actions)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

