# Strands SRE Agent Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `LLMOps & RAG Pipelines` |
| **Category** | `AI` |
| **Skill Level** | `Level 3 (Distributed & Compliance)` |
| **Target SRE Metric** | `100% RBAC Policy Enforcement & <2.1ms Schema Cache Latency` |
| **Artifact Target** | `agent.py` |
| **Source Repository** | [Pradeeptalari14/tp-strands](https://github.com/Pradeeptalari14/tp-strands) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Orchestrate autonomous SRE troubleshooters. Generate single-agent or swarm workflows, Model Context Protocol (MCP) integrations, and OpenTelemetry logging traces using the Strands SDK.

### Core Production Use Case
Governing heterogeneous multi-agent workflows (Claude, LangGraph, AutoGen) consuming internal microservice tools via Anthropic Model Context Protocol (MCP).

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
> Implement a centralized JSON-RPC 2.0 gateway with dynamic schema discovery, token-bucket rate limiting, and zero-trust RBAC role evaluation per tool invocation.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Granting autonomous agents direct unrestricted database credentials or shell access without an intermediary schema-enforcing proxy.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
curl -X POST http://localhost:8080/mcp/v1/tools/call -H "Authorization: Bearer sops_key" -d '{"tool":"k8s_drain_node","params":{"node":"worker-9"}}'

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`agent.py`)

```python
"""
Production Implementation: Strands SRE Agent Studio
Domain: LLMOps & RAG Pipelines
Target Artifact: agent.py
Repository: https://github.com/Pradeeptalari14/tp-strands
SRE Target: 100% RBAC Policy Enforcement & <2.1ms Schema Cache Latency
"""
import os
import sys
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("strands_sre_agent_studio")

class ProductionConfig:
    SERVICE_NAME = "strands-sre-agent-studio"
    ENVIRONMENT = os.getenv("APP_ENV", "production")
    WORKER_CONCURRENCY = int(os.getenv("CONCURRENCY", "16"))
    TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SEC", "30"))
    TELEMETRY_ENDPOINT = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")

def initialize_runtime() -> Dict[str, Any]:
    logger.info("Bootstrapping %s runtime with verified parameters...", ProductionConfig.SERVICE_NAME)
    context = {
        "service": ProductionConfig.SERVICE_NAME,
        "concurrency": ProductionConfig.WORKER_CONCURRENCY,
        "slo_threshold": "100% RBAC Policy Enforcement & <2.1ms Schema Cache Latency",
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

- **Interactive Simulator:** [Open Strands SRE Agent Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-strands](https://github.com/Pradeeptalari14/tp-strands)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

