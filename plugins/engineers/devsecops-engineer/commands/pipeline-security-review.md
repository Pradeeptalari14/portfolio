---
description: "Review a CI workflow for supply chain and permission weaknesses"
argument-hint: "<workflow file contents>"
---

# /devsecops-engineer:pipeline-security-review

Review a CI workflow for supply chain and permission weaknesses.

## Usage

```
/devsecops-engineer:pipeline-security-review $ARGUMENTS
```

## Steps

1. Check token permissions, third-party action pinning and untrusted input use.
2. Check secret handling and artifact integrity.
3. Identify missing scans, SBOM and signing.
4. Return a hardened version of the workflow.

## Output

A findings list with severity and a hardened workflow snippet.

If the input is missing or ambiguous, ask one focused question before continuing.
