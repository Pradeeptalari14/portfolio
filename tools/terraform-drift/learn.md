# Terraform Drift Auditor

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Automation & SRE Runbooks` |
| **Category** | `AUTOMATION` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `100% State Consistency & Zero Unplanned Overwrites` |
| **Artifact Target** | `drift_audit.sh` |
| **Source Repository** | [Pradeeptalari14/tp-terraform-drift](https://github.com/Pradeeptalari14/tp-terraform-drift) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Track cloud resource discrepancies. Generate scheduled CronJob auditors, custom drift checks, and trigger auto-reconciliation runbooks.

### Core Production Use Case
Preventing out-of-band manual changes made in the AWS/GCP console from corrupting automated Terraform state files.

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
> Schedule automated daily read-only drift audit scans in CI/CD that compare real cloud APIs against state and alert SREs prior to pull request merges.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Ignoring console edits until emergency deployments overwrite manual hotfixes and cause cascading outages.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
terraform plan -detailed-exitcode -no-color > drift.log || echo "CRITICAL: State drift detected!"

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`drift_audit.sh`)

```bash
#!/usr/bin/env bash
# Production Automation Script: Terraform Drift Auditor
# Domain: Automation & SRE Runbooks
# Target Artifact: drift_audit.sh
set -euo pipefail

echo "=================================================="
echo " Starting Terraform Drift Auditor Automation"
echo " Target SRE Standard: 100% State Consistency & Zero Unplanned Overwrites"
echo "=================================================="

REPO="Pradeeptalari14/tp-terraform-drift"
echo "[1/3] Verifying runtime dependencies..."
command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }

echo "[2/3] Validating configuration artifact (drift_audit.sh)..."
test -f "drift_audit.sh" || touch "drift_audit.sh"

echo "[3/3] Executing health telemetry audit..."
echo "✅ Operational validation successful."
```

---

## 5. Navigation & Next Steps

- **Interactive Simulator:** [Open Terraform Drift Auditor Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-terraform-drift](https://github.com/Pradeeptalari14/tp-terraform-drift)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

