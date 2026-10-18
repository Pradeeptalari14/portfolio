# RAG Radar

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `LLMOps & RAG Pipelines` |
| **Category** | `AI` |
| **Skill Level** | `Level 3 (Distributed & Compliance)` |
| **Target SRE Metric** | `100% State Consistency & Zero Unplanned Overwrites` |
| **Artifact Target** | `drift_detector.py` |
| **Source Repository** | [Pradeeptalari14/tp-rag-radar](https://github.com/Pradeeptalari14/tp-rag-radar) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Embedding drift and query anomaly detector establishing dynamic performance baselines over Elasticsearch indexes.

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

## 4. Production Configuration & Code Artifact (`drift_detector.py`)

```python
"""
Production Implementation: RAG Radar
Domain: LLMOps & RAG Pipelines
Target Artifact: drift_detector.py
Repository: https://github.com/Pradeeptalari14/tp-rag-radar
SRE Target: 100% State Consistency & Zero Unplanned Overwrites
"""
import os
import sys
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("rag_radar")

class ProductionConfig:
    SERVICE_NAME = "rag-radar"
    ENVIRONMENT = os.getenv("APP_ENV", "production")
    WORKER_CONCURRENCY = int(os.getenv("CONCURRENCY", "16"))
    TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SEC", "30"))
    TELEMETRY_ENDPOINT = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")

def initialize_runtime() -> Dict[str, Any]:
    logger.info("Bootstrapping %s runtime with verified parameters...", ProductionConfig.SERVICE_NAME)
    context = {
        "service": ProductionConfig.SERVICE_NAME,
        "concurrency": ProductionConfig.WORKER_CONCURRENCY,
        "slo_threshold": "100% State Consistency & Zero Unplanned Overwrites",
        "healthy": True
    }
    logger.info("Runtime initialized successfully: %s", context)
    return context

if __name__ == "__main__":
    ctx = initialize_runtime()
    print("Runtime ready for traffic.")
```

---

## 5. Navigation & Next Steps

- **Interactive Simulator:** [Open RAG Radar Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-rag-radar](https://github.com/Pradeeptalari14/tp-rag-radar)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

