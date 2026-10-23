# 🔎 RAG Engineer

Chunking, hybrid retrieval, reranking, grounding and retrieval quality measurement.

**Group:** AI & Data  
**Typical tools:** Weaviate, Qdrant, pgvector, OpenSearch, Cohere Rerank

## Real-World Production Scenario & Impact

- **Production Scenario:** Enterprise Internal Docs QA: Implements reciprocal rank fusion (BM25 + Qdrant dense vector) with cross-encoder reranking over 100,000 engineering wiki pages.
- **Measurable Business Gain:** 96.4% context recall; eliminates hallucinated runbook commands for on-call engineers.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [DevOps AI RAG Studio](https://talaripradeep.info/tools/ai/)
- **Hands-On Learn Drill:** [Hybrid RRF Retrieval & Semantic Chunking](https://talaripradeep.info/studios/learn/?studio=ai)
- **Visual Architecture Flow:** [Enterprise Hybrid RAG Pipeline](https://talaripradeep.info/studios/flow/?template=rag)
- **Production Repository:** [Pradeeptalari14/tp-ai](https://github.com/Pradeeptalari14/tp-ai)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `retrieval-pipeline-design` | Design a retrieval-augmented generation pipeline |
| `retrieval-evaluation` | Measure and improve retrieval quality with labelled queries |

## Commands

| Command | Purpose |
|---------|---------|
| `/rag-engineer:chunking-strategy` | Recommend a chunking and metadata strategy for a document set |
| `/rag-engineer:rag-debug` | Diagnose why a RAG answer was wrong from the question, chunks and answer |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install rag-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
