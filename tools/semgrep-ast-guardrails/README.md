# Semgrep AST Policy Guardrails Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Local Sandbox & Emulation` |
| **Category** | `AUTOMATION` |
| **Skill Level** | `Level 1 (Foundations & Sandbox)` |
| **Target SRE Metric** | `100% OWASP LLM01-LLM10 Threat Interception & <18ms Sub-Reflex Gating` |
| **Artifact Target** | `semgrep-rules.yml` |
| **Source Repository** | [Pradeeptalari14/tp-semgrep-ast-guardrails](https://github.com/Pradeeptalari14/tp-semgrep-ast-guardrails) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Author custom Semgrep AST static analysis policies, taint tracking rules for SQL injection and SSRF, and automated SARIF publishing to GitHub Security tab.

### Core Production Use Case
Defending LLM and agent workflows against adversarial prompt injections, persona jailbreaks, and sensitive data leakage in Semgrep AST Policy Guardrails Studio.

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
> Apply layered zero-trust defense: sub-reflex regex heuristics, Llama-Guard classifier inspection, and isolated gVisor containerized execution sandboxes.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Relying solely on system prompt instructions ("Do not reveal secrets") without programmatic input filtering or output sanitizers.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
pytest -v tests/security_scan.py --test-prompts ./adversarial_drills.json --enforce-fail-closed

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`semgrep-rules.yml`)

```yaml
# Production Manifest: Semgrep AST Policy Guardrails Studio
# Domain: Local Sandbox & Emulation
# Target Artifact: semgrep-rules.yml
# Target SRE Standard: 100% OWASP LLM01-LLM10 Threat Interception & <18ms Sub-Reflex Gating
apiVersion: apps/v1
kind: Deployment
metadata:
  name: semgrep-ast-policy-guardrails-studio
  namespace: production
  labels:
    app.kubernetes.io/name: semgrep-ast-policy-guardrails-studio
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "100% OWASP LLM01-LLM10 Threat Interception & <18ms Sub-Reflex Gating"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: semgrep-ast-policy-guardrails-studio
  template:
    metadata:
      labels:
        app: semgrep-ast-policy-guardrails-studio
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-semgrep-ast-guardrails:v1.0.0
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

- **Interactive Simulator:** [Open Semgrep AST Policy Guardrails Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-semgrep-ast-guardrails](https://github.com/Pradeeptalari14/tp-semgrep-ast-guardrails)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

