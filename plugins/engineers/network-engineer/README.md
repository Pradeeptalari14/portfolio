# 🌐 Network Engineer

Cloud and hybrid network design, DNS, segmentation and connectivity troubleshooting.

**Group:** Operations & Delivery  
**Typical tools:** VPC, Transit Gateway, Route 53, Cilium, WireGuard

## Real-World Production Scenario & Impact

- **Production Scenario:** Hybrid Transit Gateway Routing: Diagnoses asymmetric MTU blackholes and overlapping CIDRs during cross-cloud DirectConnect expansion.
- **Measurable Business Gain:** Prevents packet loss on high-throughput database replication; eliminates cross-VPC data transfer bottlenecks.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Universal Engineering Toolbox & Subnetter](https://talaripradeep.info/toolbox/)
- **Hands-On Learn Drill:** [VPC Peering & Transit Gateway Routing](https://talaripradeep.info/studios/learn/?studio=localstack-dev)
- **Visual Architecture Flow:** [VPC & Ingress Mesh Topology](https://talaripradeep.info/studios/flow/?template=k8sEcosystem)
- **Production Repository:** [Pradeeptalari14/tp-localstack-dev](https://github.com/Pradeeptalari14/tp-localstack-dev)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `network-topology-design` | Design VPC and hybrid network topology with CIDR planning, segmentation and egress control |
| `connectivity-troubleshooting` | Troubleshoot reachability and latency problems layer by layer |

## Commands

| Command | Purpose |
|---------|---------|
| `/network-engineer:cidr-plan` | Create a non-overlapping CIDR allocation plan for multiple networks |
| `/network-engineer:trace-connection` | Generate a layer-by-layer diagnostic checklist for a failing connection |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install network-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
