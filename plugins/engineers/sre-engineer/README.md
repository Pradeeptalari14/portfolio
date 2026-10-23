# 🛡️ Site Reliability Engineer

SLOs, error budgets, burn-rate alerting and toil elimination for production services.

**Group:** Infrastructure & Reliability  
**Typical tools:** Prometheus, Grafana, Alertmanager, PagerDuty, OpenTelemetry

## Real-World Production Scenario & Impact

- **Production Scenario:** E-commerce Flash Sale: Burn-rate alerting detects payment gateway degradation in 3 minutes; automated runbook throttles non-critical ingress before SLO violation.
- **Measurable Business Gain:** 78% faster alert triage, 42% MTTR reduction, guaranteed 99.95% availability budget compliance.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [SRE Incident Simulator](https://talaripradeep.info/incident/)
- **Hands-On Learn Drill:** [SLO Burn-Rate & Incident Triage Drill](https://talaripradeep.info/studios/learn/?studio=sre-simulator)
- **Visual Architecture Flow:** [Cloud Multi-Region SRE Topology](https://talaripradeep.info/studios/flow/?template=infra)
- **Production Repository:** [Pradeeptalari14/tp-sre-simulator](https://github.com/Pradeeptalari14/tp-sre-simulator)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `slo-error-budget` | Define SLIs, SLOs and an error-budget policy for a service |
| `toil-reduction` | Find, measure and eliminate operational toil |

## Commands

| Command | Purpose |
|---------|---------|
| `/sre-engineer:slo-draft` | Draft SLIs, SLOs and burn-rate alert rules for a service |
| `/sre-engineer:toil-audit` | Analyse pages, tickets and runbooks to rank toil by cost and propose fixes |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install sre-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
