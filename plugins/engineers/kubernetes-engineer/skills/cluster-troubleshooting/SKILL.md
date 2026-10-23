---
name: cluster-troubleshooting
description: "Diagnose failing pods, nodes and networking in a systematic order. Trigger with 'pod is pending', 'CrashLoopBackOff', 'OOMKilled', 'ImagePullBackOff' or 'service not reachable'."
---

# Cluster Troubleshooting

> Part of the **Kubernetes Engineer** plugin (`kubernetes-engineer`).

## When to use

- A workload will not start or keeps restarting
- A service is reachable inside the cluster but not outside

## Workflow

1. Read the state: kubectl get pod, then describe for events and last state.
2. Pending: check scheduling constraints, resource requests, taints, PVC binding and quota.
3. CrashLoopBackOff: read previous container logs, exit code and probe failures. Exit 137 means OOMKilled or SIGKILL.
4. ImagePullBackOff: verify the image name, tag, registry credentials and node egress.
5. Network: confirm endpoints exist for the Service, label selectors match, NetworkPolicy allows the flow and DNS resolves.
6. Escalate to node-level checks (kubelet, disk pressure, conntrack) only when workload-level checks pass.

## Quality checklist

- [ ] The first action is always reading events, not restarting
- [ ] The root cause is recorded, not only the workaround
- [ ] A guard (alert, policy or test) is added to prevent recurrence
- [ ] Production changes are made through Git, not kubectl edit

## Output format

```markdown
## Troubleshooting Record: [Workload]
**Symptom:** [what was seen]
**Evidence:** [events, logs, exit codes]
**Root cause:** [explanation]
**Fix and guard:** [change and prevention]
```

## Common pitfalls

- Deleting the pod and losing the evidence needed for diagnosis.
- Raising memory limits without checking for a leak.
- Blaming the network before verifying selectors and endpoints.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
