---
name: retrieval-evaluation
description: "Measure and improve retrieval quality with labelled queries. Trigger with 'RAG evaluation', 'recall at k', 'retrieval is poor', 'compare embedding models'."
---

# Retrieval Evaluation

> Part of the **RAG Engineer** plugin (`rag-engineer`).

## When to use

- Changing embeddings, chunking or reranker
- Quality is judged only by anecdotes

## Workflow

1. Build a query set with known relevant chunks from support logs and subject experts.
2. Measure recall at k, MRR and nDCG for retrieval, before generation.
3. Measure answer faithfulness and relevance for generation using a calibrated judge.
4. Run ablations: chunk size, embedding model, hybrid weight and reranker on or off.
5. Review failures by category and fix the biggest bucket first.

## Quality checklist

- [ ] The query set includes hard and out-of-scope questions
- [ ] Each experiment changes one variable
- [ ] Latency and cost are measured per configuration
- [ ] Results are reproducible with versioned indexes

## Output format

```markdown
## Retrieval Evaluation
| Config | Recall@5 | MRR | Faithfulness | p95 latency |
|--------|----------|-----|--------------|-------------|
| [baseline] | [x] | [y] | [z] | [ms] |

**Winner and rationale:** [text]
```

## Common pitfalls

- Tuning on the test queries.
- Optimising recall while ignoring precision and context length.
- Evaluating only on easy factual questions.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
