---
description: "Recommend a chunking and metadata strategy for a document set"
argument-hint: "<document types and sample structure>"
---

# /rag-engineer:chunking-strategy

Recommend a chunking and metadata strategy for a document set.

## Usage

```
/rag-engineer:chunking-strategy $ARGUMENTS
```

## Steps

1. Classify documents by structure.
2. Recommend chunk boundaries, size and overlap per type.
3. Define metadata and permission fields.
4. Give an ingestion outline.

## Output

A chunking spec per document type with a metadata schema.

If the input is missing or ambiguous, ask one focused question before continuing.
