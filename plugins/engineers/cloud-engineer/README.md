# ☁️ Cloud Engineer

Landing zones, Well-Architected reviews, migration planning and multi-account governance.

**Group:** Infrastructure & Reliability  
**Typical tools:** AWS, Azure, GCP, Terraform, Organizations

## Real-World Production Scenario & Impact

- **Production Scenario:** Active-Active Multi-Region Failover: Resilient AWS/Azure topology dynamically redirects ingress via Route53 latency routing during regional cloud outage.
- **Measurable Business Gain:** RPO < 1s, RTO < 30s, achieves AWS Well-Architected Reliability Pillar compliance.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Enterprise Cloud Architecture Center](https://talaripradeep.info/architecture/)
- **Hands-On Learn Drill:** [Multi-Account Well-Architected Review](https://talaripradeep.info/studios/learn/?studio=azure-aks)
- **Visual Architecture Flow:** [Multi-Region Cloud Topology](https://talaripradeep.info/studios/flow/?template=infra)
- **Production Repository:** [Pradeeptalari14/tp-azure-aks](https://github.com/Pradeeptalari14/tp-azure-aks)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `landing-zone-review` | Review a cloud landing zone for account structure, guardrails, networking and logging |
| `well-architected-review` | Run a Well-Architected style review across operational excellence, security, reliability, performance, cost and sustainability |

## Commands

| Command | Purpose |
|---------|---------|
| `/cloud-engineer:waf-review` | Run a six-pillar architecture review on a described workload |
| `/cloud-engineer:migration-plan` | Plan a cloud migration using the 6R strategy per workload |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install cloud-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
