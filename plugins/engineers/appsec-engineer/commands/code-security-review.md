---
description: "Security review a code snippet or diff and return findings with fixes"
argument-hint: "<code or diff>"
---

# /appsec-engineer:code-security-review

Security review a code snippet or diff and return findings with fixes.

## Usage

```
/appsec-engineer:code-security-review $ARGUMENTS
```

## Steps

1. Trace untrusted inputs to sensitive sinks.
2. Check auth, authorisation and data exposure.
3. Rate findings by severity.
4. Provide patches and regression tests.

## Output

Findings with severity, patches and regression tests.

If the input is missing or ambiguous, ask one focused question before continuing.
