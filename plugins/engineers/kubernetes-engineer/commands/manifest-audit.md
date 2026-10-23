---
description: "Audit Kubernetes manifests against a production-readiness checklist"
argument-hint: "<manifest YAML or Helm values>"
---

# /kubernetes-engineer:manifest-audit

Audit Kubernetes manifests against a production-readiness checklist.

## Usage

```
/kubernetes-engineer:manifest-audit $ARGUMENTS
```

## Steps

1. Parse every workload resource in the input.
2. Check security, resources, probes, availability and networking controls.
3. Mark each control pass, fail or not applicable.
4. Return a patched manifest for the failures.

## Output

A control-by-control table and a corrected manifest.

If the input is missing or ambiguous, ask one focused question before continuing.
