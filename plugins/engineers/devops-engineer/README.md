# ⚙️ DevOps Engineer

CI/CD pipelines, deployment strategies, rollback safety and delivery metrics.

**Group:** Infrastructure & Reliability  
**Typical tools:** GitHub Actions, Jenkins, ArgoCD, Docker, Helm

## Real-World Production Scenario & Impact

- **Production Scenario:** Microservices Monorepo: Declarative GitHub Actions and ArgoCD GitOps synchronizer eliminates configuration drift across 45 microservices.
- **Measurable Business Gain:** Zero unreviewed production changes, 12-minute commit-to-production lead time, 99.9% build pass rate.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [GitLab & GitHub CI/CD Studio](https://talaripradeep.info/tools/gitlab/)
- **Hands-On Learn Drill:** [Deterministic CI/CD Pipeline Design](https://talaripradeep.info/studios/learn/?studio=gitlab)
- **Visual Architecture Flow:** [CI/CD Delivery Pipeline](https://talaripradeep.info/studios/flow/?template=pipeline)
- **Production Repository:** [Pradeeptalari14/tp-gitlab](https://github.com/Pradeeptalari14/tp-gitlab)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `cicd-pipeline-design` | Design or review a CI/CD pipeline for speed, safety and reproducibility |
| `deployment-strategy` | Choose and specify a deployment strategy (rolling, blue/green, canary) with explicit rollback criteria |

## Commands

| Command | Purpose |
|---------|---------|
| `/devops-engineer:pipeline-review` | Review a CI/CD workflow file for speed, caching, security and reliability issues |
| `/devops-engineer:rollback-plan` | Produce a tested rollback plan with triggers and verification steps for a release |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install devops-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
