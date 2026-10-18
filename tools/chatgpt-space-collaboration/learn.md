# ChatGPT Space Collaboration Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `LLMOps & RAG Pipelines` |
| **Category** | `AI` |
| **Skill Level** | `Level 3 (Distributed & Compliance)` |
| **Target SRE Metric** | `100% Deterministic State Recovery & Zero Unbounded Delegation Cascades` |
| **Artifact Target** | `space-crdt.json` |
| **Source Repository** | [Pradeeptalari14/tp-chatgpt-space-collab](https://github.com/Pradeeptalari14/tp-chatgpt-space-collab) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Multi-user, multi-agent collaborative canvas with CRDT state sync over WebSockets, presence and conflict-free merges.

### Core Production Use Case
Orchestrating autonomous multi-agent tool execution in ChatGPT Space Collaboration Studio while preventing infinite delegation loops, cascading errors, and unbounded API costs.

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
> Deploy deterministic LangGraph state machine graphs with checkpointed PostgreSQL state persistence, human-in-the-loop gates, and bounded tool execution steps.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Allowing unconstrained recursive agent dispatch without max-iteration budgets, structured schema constraints, or circuit-breakers.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
python3 -m agents.runner --graph-config space-crdt.json --max-steps 8 --verify-tool-schemas --trace-otel

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`space-crdt.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "studio": "chatgpt-space-collaboration-studio",
  "domain": "LLMOps & RAG Pipelines",
  "targetArtifact": "space-crdt.json",
  "sreMetric": "100% Deterministic State Recovery & Zero Unbounded Delegation Cascades",
  "repository": "Pradeeptalari14/tp-chatgpt-space-collab",
  "service": {
    "name": "chatgpt-space-collaboration-studio",
    "mode": "production",
    "version": "1.0.0",
    "resilience": {
      "circuitBreaker": true,
      "maxRetries": 3,
      "timeoutMs": 5000
    },
    "telemetry": {
      "enabled": true,
      "endpoint": "otel-collector:4317",
      "sampleRate": 1.0
    }
  }
}
```

---

## 5. Navigation & Next Steps

- **Interactive Simulator:** [Open ChatGPT Space Collaboration Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-chatgpt-space-collab](https://github.com/Pradeeptalari14/tp-chatgpt-space-collab)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

