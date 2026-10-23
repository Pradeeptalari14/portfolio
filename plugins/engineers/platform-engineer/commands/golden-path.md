---
description: "Generate a golden-path template specification for a type of service"
argument-hint: "<service type, language and runtime>"
---

# /platform-engineer:golden-path

Generate a golden-path template specification for a type of service.

## Usage

```
/platform-engineer:golden-path $ARGUMENTS
```

## Steps

1. Confirm language, runtime and hosting target.
2. List the mandatory controls and the optional choices.
3. Produce the file tree for the scaffold and the pipeline outline.
4. State the onboarding steps a developer follows.

## Output

A scaffold file tree, a pipeline outline and a developer onboarding checklist.

If the input is missing or ambiguous, ask one focused question before continuing.
