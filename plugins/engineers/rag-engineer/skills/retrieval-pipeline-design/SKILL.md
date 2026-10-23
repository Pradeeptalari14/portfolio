---
name: retrieval-pipeline-design
description: "Design a retrieval-augmented generation pipeline. Trigger with 'build RAG', 'chunking strategy', 'hybrid search', 'reranker' or 'the bot gives wrong answers from our docs'."
---

# Retrieval Pipeline Design

> Part of the **RAG Engineer** plugin (`rag-engineer`).

## When to use

- Answers are fluent but ungrounded
- Retrieval misses obvious documents

## Workflow

1. Inventory sources and access rules, and carry document-level permissions into the index so retrieval respects them.
2. Chunk by structure (headings, sections, tables) with modest overlap, and store metadata such as source, date and ACL.
3. Use hybrid retrieval: dense vectors plus BM25, fused with reciprocal rank fusion.
4. Rerank the top candidates with a cross-encoder and pass only the best few to the model.
5. Prompt for grounded answers with citations and an explicit refusal when evidence is missing.

## Quality checklist

- [ ] Retrieval is evaluated separately from generation
- [ ] Index updates handle deletes and permission changes
- [ ] Answers include citations to retrieved chunks
- [ ] Embedding model and chunking version are recorded

## Output format

```markdown
## RAG Design: [Use case]
| Stage | Choice | Parameter |
|-------|--------|-----------|
| Chunking | structural | 400 tokens, 10% overlap |

**Retrieval:** [hybrid, k, rerank k]
**Refusal rule:** [text]
```

## Common pitfalls

- Fixed-size chunks that split tables and code.
- Stuffing too much context, which lowers answer quality.
- Leaking documents the asking user is not allowed to read.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
