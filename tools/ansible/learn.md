# Ansible Playbook Builder

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Automation & SRE Runbooks` |
| **Category** | `AUTOMATION` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `100% Idempotent Execution & Zero Unplanned Configuration Drift` |
| **Artifact Target** | `playbook.yml` |
| **Source Repository** | [Pradeeptalari14/tp-ansible](https://github.com/Pradeeptalari14/tp-ansible) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Deploy applications instantly. Generate highly structured system updates, secure installation recipes, and customized role parameters in YAML syntax.

### Core Production Use Case
Automating zero-downtime configuration management, OS patching, and idempotent node provisioning in enterprise Ansible Playbook Builder.

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
> Structure roles with idempotent tasks, Vault-encrypted host variables, and pre-commit ansible-lint attestation before running in production.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Running unversioned imperative shell tasks within playbooks that break idempotency and fail upon re-execution.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
ansible-playbook -i inventory/hosts playbook.yml --check --diff

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`playbook.yml`)

```yaml
# Production Manifest: Ansible Playbook Builder
# Domain: Automation & SRE Runbooks
# Target Artifact: playbook.yml
# Target SRE Standard: 100% Idempotent Execution & Zero Unplanned Configuration Drift
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ansible-playbook-builder
  namespace: production
  labels:
    app.kubernetes.io/name: ansible-playbook-builder
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "100% Idempotent Execution & Zero Unplanned Configuration Drift"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ansible-playbook-builder
  template:
    metadata:
      labels:
        app: ansible-playbook-builder
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-ansible:v1.0.0
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

- **Interactive Simulator:** [Open Ansible Playbook Builder Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-ansible](https://github.com/Pradeeptalari14/tp-ansible)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

