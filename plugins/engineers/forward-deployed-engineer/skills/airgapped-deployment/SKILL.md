---
name: airgapped-deployment
description: "Architect and package zero-egress containerized AI systems into private enterprise VPCs. Trigger with 'air-gapped', 'private VPC', 'on-prem AI', 'no internet egress'."
---

# Airgapped Deployment

> Part of the **Forward Deployed AI Engineer** plugin (`forward-deployed-engineer`).

## When to use

- Client forbids public LLM APIs
- Deploying AI workloads into private enterprise VPCs or GovCloud

## Workflow

1. Pre-package all model weights (vLLM/Ollama) and base container images into internal registries.
2. Apply Kubernetes NetworkPolicies denying all 0.0.0.0/0 external internet egress.
3. Run container pods with non-root security contexts (runAsUser: 10001, readOnlyRootFilesystem: true).
4. Enforce Presidio PII redaction on all inbound requests before dispatching to local model workers.

## Quality checklist

- [ ] Zero outbound network sockets permitted by NetworkPolicy
- [ ] All container images pinned to internal SHA256 digests
- [ ] Non-root user execution attested

## Output format

```markdown
## Air-Gapped Deployment Plan: [Client VPC]
| Component | Namespace | Image Digest | Egress Rules |
|---|---|---|---|
| Agent Worker | fde-ai-system | internal-registry/fde:v1 | Internal DB & vLLM only |
```

## Common pitfalls

- Assuming public HuggingFace hub access is available at runtime.
- Missing pod anti-affinity across availability zones.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
