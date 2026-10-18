# Azure Cognitive Search AI Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `LLMOps & RAG Pipelines` |
| **Category** | `AI` |
| **Skill Level** | `Level 3 (Distributed & Compliance)` |
| **Target SRE Metric** | `93.5% Context Recall & <32ms End-to-End Retrieval Latency` |
| **Artifact Target** | `search_config.json` |
| **Source Repository** | [Pradeeptalari14/tp-azure-search-ai](https://github.com/Pradeeptalari14/tp-azure-search-ai) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Build and tune Azure Cognitive Search indexes with integrated Azure OpenAI embeddings. Generate search index schemas, indexing pull pipelines, and vector semantic configs.

### Core Production Use Case
Mitigating hallucination, context drift, and retrieval latency in enterprise Azure Cognitive Search AI Studio workloads over large multi-modal and structured knowledge bases.

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

## 4. Production Configuration & Code Artifact (`search_config.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "studio": "azure-cognitive-search-ai-studio",
  "domain": "LLMOps & RAG Pipelines",
  "targetArtifact": "search_config.json",
  "sreMetric": "93.5% Context Recall & <32ms End-to-End Retrieval Latency",
  "repository": "Pradeeptalari14/tp-azure-search-ai",
  "service": {
    "name": "azure-cognitive-search-ai-studio",
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

- **Interactive Simulator:** [Open Azure Cognitive Search AI Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-azure-search-ai](https://github.com/Pradeeptalari14/tp-azure-search-ai)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

