---
name: gpu-capacity-planning
description: "Plan and schedule GPU capacity across training and inference. Trigger with 'GPU shortage', 'GPU utilisation', 'MIG', 'gang scheduling' or 'GPU cost'."
---

# Gpu Capacity Planning

> Part of the **AI Infrastructure Engineer** plugin (`ai-infra-engineer`).

## When to use

- GPU queues are long while some GPUs sit idle
- Training and inference compete for hardware

## Workflow

1. Measure real utilisation and memory per workload, and identify idle or fragmented GPUs.
2. Separate pools by workload class: latency-sensitive inference, batch inference, and training with preemption allowed.
3. Use sharing where suitable: MIG partitions or time-slicing for small models.
4. Adopt gang scheduling and priority classes so distributed jobs start together and high priority work preempts low.
5. Forecast demand and decide the reserved, on-demand and spot mix.

## Quality checklist

- [ ] Idle GPU time is reported per team
- [ ] Training jobs checkpoint so spot preemption is safe
- [ ] Quotas prevent a single team from monopolising a pool
- [ ] Driver and CUDA versions are standardised

## Output format

```markdown
## GPU Capacity Plan: [Quarter]
| Pool | GPUs | Workload | Utilisation | Purchase |
|------|------|----------|-------------|----------|
| inference-a | [n] | online | [%] | reserved |

**Forecast:** [demand]
```

## Common pitfalls

- Static partitioning that strands capacity.
- Running training on spot without checkpointing.
- Mixing driver versions and debugging mysterious failures.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
