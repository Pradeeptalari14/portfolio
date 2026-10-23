---
description: "Scaffold air-gapped Kubernetes Helm values, NetworkPolicies, and Docker Compose sandbox"
argument-hint: "<target namespace, industry compliance mode and model runtime>"
---

# /forward-deployed-engineer:deploy-agent

Scaffold air-gapped Kubernetes Helm values, NetworkPolicies, and Docker Compose sandbox.

## Usage

```
/forward-deployed-engineer:deploy-agent $ARGUMENTS
```

## Steps

1. Generate non-root Kubernetes deployment manifests.
2. Configure zero-egress NetworkPolicies and resource limits.
3. Build client staging Docker Compose sandbox with local vLLM serving.

## Output

Hardened Kubernetes Helm values and Docker Compose manifest.

If the input is missing or ambiguous, ask one focused question before continuing.
