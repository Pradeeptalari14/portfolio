---
description: "Diagnose why a RAG answer was wrong from the question, chunks and answer"
argument-hint: "<question, retrieved chunks and generated answer>"
---

# /rag-engineer:rag-debug

Diagnose why a RAG answer was wrong from the question, chunks and answer.

## Usage

```
/rag-engineer:rag-debug $ARGUMENTS
```

## Steps

1. Check whether the needed evidence was retrieved at all.
2. If retrieved, check ranking and whether the answer used it.
3. Classify the failure as retrieval, ranking, context or generation.
4. Recommend the specific fix.

## Output

A failure classification and a targeted fix recommendation.

If the input is missing or ambiguous, ask one focused question before continuing.
