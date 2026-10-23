---
description: "Review a CI/CD workflow file for speed, caching, security and reliability issues"
argument-hint: "<workflow file contents or path>"
---

# /devops-engineer:pipeline-review

Review a CI/CD workflow file for speed, caching, security and reliability issues.

## Usage

```
/devops-engineer:pipeline-review $ARGUMENTS
```

## Steps

1. Parse the stages and identify serial work that could run in parallel.
2. Check caching, pinned versions, permissions and secret handling.
3. Estimate wall-clock savings for each suggested change.
4. Return findings sorted by impact with a corrected snippet for each.

## Output

A prioritised findings list with before/after snippets and expected time savings.

If the input is missing or ambiguous, ask one focused question before continuing.
