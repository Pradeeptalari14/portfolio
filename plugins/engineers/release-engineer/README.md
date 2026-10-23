# 🚀 Release Engineer

Versioning, changelogs, release trains, hotfix flow and supply-chain-safe publishing.

**Group:** Operations & Delivery  
**Typical tools:** Semantic Release, Conventional Commits, Cosign, GitHub Releases, Feature Flags

## Real-World Production Scenario & Impact

- **Production Scenario:** Zero-Downtime Canary Rollout: Routes 5% of production traffic to new microservice version; automatically rolls back when HTTP 5xx error rate exceeds 0.2%.
- **Measurable Business Gain:** Zero customer-impacted regressions; automated rollbacks complete in under 20 seconds.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [ArgoCD & Progressive Delivery Studio](https://talaripradeep.info/tools/argocd/)
- **Hands-On Learn Drill:** [Canary Deployment & Rollback Safety](https://talaripradeep.info/studios/learn/?studio=jenkins)
- **Visual Architecture Flow:** [Canary & Progressive Rollout](https://talaripradeep.info/studios/flow/?template=pipeline)
- **Production Repository:** [Pradeeptalari14/tp-gitlab](https://github.com/Pradeeptalari14/tp-gitlab)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `release-process-design` | Design a predictable release process with versioning, branching and changelog automation |
| `release-readiness` | Run a go or no-go readiness review before shipping |

## Commands

| Command | Purpose |
|---------|---------|
| `/release-engineer:release-notes` | Turn commit or pull-request history into structured release notes |
| `/release-engineer:go-no-go` | Build a release readiness checklist and decision record |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install release-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
