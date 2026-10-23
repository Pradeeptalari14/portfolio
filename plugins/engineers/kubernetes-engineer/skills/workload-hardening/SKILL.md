---
name: workload-hardening
description: "Harden Kubernetes workloads for security and resilience. Trigger with 'harden this manifest', 'pod security', 'production readiness for k8s' or 'review this deployment'."
---

# Workload Hardening

> Part of the **Kubernetes Engineer** plugin (`kubernetes-engineer`).

## When to use

- Promoting a manifest to production
- A cluster policy audit has failed

## Workflow

1. Set a securityContext: runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities, no privilege escalation, seccomp RuntimeDefault.
2. Declare resource requests and limits based on observed usage, and set memory limit equal to request for guaranteed behaviour.
3. Add readiness, liveness and startup probes with distinct purposes and sensible thresholds.
4. Add a PodDisruptionBudget, topologySpreadConstraints across zones, and a preStop hook for graceful drain.
5. Restrict traffic with a default-deny NetworkPolicy and explicit allow rules.
6. Pin images by digest and set imagePullPolicy appropriately.

## Quality checklist

- [ ] No container runs as root or privileged
- [ ] Every deployment has a PDB and at least two replicas where traffic matters
- [ ] ServiceAccount tokens are not mounted unless needed
- [ ] Manifests pass policy checks in CI before merge

## Output format

```markdown
## Hardening Report: [Workload]
| Control | Before | After |
|---------|--------|-------|
| runAsNonRoot | false | true |

**Patched manifest:** [diff]
```

## Common pitfalls

- Liveness probes that depend on downstream services cause restart storms.
- CPU limits that throttle latency-sensitive services.
- Setting readOnlyRootFilesystem without mounting writable temp volumes.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
