---
description: "Review a prompt for clarity, injection risk and testability"
argument-hint: "<prompt text and intended behaviour>"
---

# /llmops-engineer:prompt-review

Review a prompt for clarity, injection risk and testability.

## Usage

```
/llmops-engineer:prompt-review $ARGUMENTS
```

## Steps

1. Check role, task, constraints and output format are explicit.
2. Identify injection and leakage risks.
3. Suggest structured output and examples where useful.
4. Provide a test set of adversarial and normal inputs.

## Output

Annotated issues, an improved prompt and a starter test set.

If the input is missing or ambiguous, ask one focused question before continuing.
