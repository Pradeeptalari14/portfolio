# 💰 FinOps Engineer

Cloud cost allocation, rightsizing, commitment strategy and unit economics.

**Group:** Operations & Delivery  
**Typical tools:** Cost Explorer, Kubecost, OpenCost, Savings Plans, Infracost

## Real-World Production Scenario & Impact

- **Production Scenario:** Cloud Waste Reclamation: Discovers unattached GP3 EBS volumes, idle NAT gateways, and unallocated Graviton compute instances.
- **Measurable Business Gain:** $28,000/month recurring cloud cost savings; increases Compute Savings Plan coverage from 45% to 88%.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Cloud FinOps Center & AWS Calculator](https://talaripradeep.info/finops/)
- **Hands-On Learn Drill:** [Cloud Cost Allocation & Rightsizing](https://talaripradeep.info/studios/learn/?studio=finops)
- **Visual Architecture Flow:** [FinOps Unit Cost Allocation](https://talaripradeep.info/studios/flow/?template=infra)
- **Production Repository:** [Pradeeptalari14/tp-finops](https://github.com/Pradeeptalari14/tp-finops)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `cost-allocation-showback` | Make cloud spend attributable to teams and products |
| `rightsizing-commitments` | Rightsize resources and plan commitment purchases |

## Commands

| Command | Purpose |
|---------|---------|
| `/finops-engineer:cost-review` | Analyse a cost export and rank savings opportunities |
| `/finops-engineer:unit-economics` | Define unit cost metrics for a product or service |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install finops-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
