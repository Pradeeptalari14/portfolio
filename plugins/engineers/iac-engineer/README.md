# 🧱 Infrastructure as Code Engineer

Terraform and OpenTofu module design, safe plan review, state hygiene and drift control.

**Group:** Infrastructure & Reliability  
**Typical tools:** Terraform, OpenTofu, Terragrunt, Pulumi, Atlantis

## Real-World Production Scenario & Impact

- **Production Scenario:** Multi-Account State Drift: Automated drift detection flags unauthorized manual security group changes within 5 minutes and applies declarative rollback.
- **Measurable Business Gain:** 100% reproducible cloud environments; zero configuration drift across staging and production.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Terraform Architect Studio](https://talaripradeep.info/tools/terraform/)
- **Hands-On Learn Drill:** [Module Design & Blast Radius Analysis](https://talaripradeep.info/studios/learn/?studio=terraform-drift)
- **Visual Architecture Flow:** [Declarative Infrastructure State](https://talaripradeep.info/studios/flow/?template=infra)
- **Production Repository:** [Pradeeptalari14/tp-terraform](https://github.com/Pradeeptalari14/tp-terraform)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `terraform-module-design` | Design reusable, versioned Terraform modules with clear interfaces |
| `iac-change-review` | Review an infrastructure plan for blast radius, destructive changes and state risks |

## Commands

| Command | Purpose |
|---------|---------|
| `/iac-engineer:tf-plan-review` | Review pasted Terraform plan output for destructive or risky changes |
| `/iac-engineer:drift-check` | Plan a drift detection and remediation process for an environment |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install iac-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
