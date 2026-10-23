---
name: network-topology-design
description: "Design VPC and hybrid network topology with CIDR planning, segmentation and egress control. Trigger with 'design the network', 'CIDR plan', 'hub and spoke', 'VPN or direct connect'."
---

# Network Topology Design

> Part of the **Network Engineer** plugin (`network-engineer`).

## When to use

- A new environment needs an address plan
- Networks must connect on premises and cloud without overlap

## Workflow

1. Allocate a non-overlapping CIDR plan from a documented supernet, leaving room for growth and peering.
2. Define tiers per VPC: public ingress, private application, private data, and management.
3. Choose the interconnect: transit gateway or hub and spoke, VPN for backup and dedicated link for primary.
4. Centralise egress through inspection and use private endpoints for cloud services.
5. Design DNS: private zones, split-horizon and forwarding rules for hybrid resolution.

## Quality checklist

- [ ] No overlapping ranges across any connected network
- [ ] Data tier has no route to the internet
- [ ] Flow logs are enabled and retained
- [ ] Failure of one availability zone does not isolate a tier

## Output format

```markdown
## Network Design: [Environment]
| Network | CIDR | Tier | Connected to |
|---------|------|------|--------------|
| prod-app | 10.20.0.0/16 | private | transit hub |

**Egress:** [path and inspection]
**DNS:** [zones and forwarding]
```

## Common pitfalls

- Choosing small CIDR blocks that cannot grow.
- Relying on public IPs for service-to-service traffic.
- Forgetting asymmetric routing when adding firewalls.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
