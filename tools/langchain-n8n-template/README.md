# LangChain + n8n Template

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `FinOps & Cost Optimization` |
| **Category** | `AI` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `93.5% Context Recall & <32ms End-to-End Retrieval Latency` |
| **Artifact Target** | `workflow_cache.json` |
| **Source Repository** | [Pradeeptalari14/tp-langchain-n8n-template](https://github.com/Pradeeptalari14/tp-langchain-n8n-template) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Production-ready n8n RAG workflow template with semantic caching and cache hit tracking dashboards.

### Core Production Use Case
Mitigating hallucination, context drift, and retrieval latency in enterprise LangChain + n8n Template workloads over large multi-modal and structured knowledge bases.

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
> Implement hybrid dense-sparse retrieval (BM25 + pgvector/Qdrant cosine fusion) with Cross-Encoder reranking and semantic chunk windowing.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Dumping raw unchunked documents directly into high-dimensional vector stores without deduplication, sparse keyword indexes, or relevance thresholds.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
python3 -m rag.retriever --query "Audit production cluster state" --hybrid-rrf --top-k 5 --rerank-threshold 0.75

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`workflow_cache.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "studio": "langchain-+-n8n-template",
  "domain": "FinOps & Cost Optimization",
  "targetArtifact": "workflow_cache.json",
  "sreMetric": "93.5% Context Recall & <32ms End-to-End Retrieval Latency",
  "repository": "Pradeeptalari14/tp-langchain-n8n-template",
  "service": {
    "name": "langchain-+-n8n-template",
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

- **Interactive Simulator:** [Open LangChain + n8n Template Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-langchain-n8n-template](https://github.com/Pradeeptalari14/tp-langchain-n8n-template)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

