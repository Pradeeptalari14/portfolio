# 📋 Compliance Engineer

Control mapping, continuous evidence collection, audit readiness and policy as code.

**Group:** Security, Quality & Application  
**Typical tools:** SOC 2, ISO 27001, OPA, Drata, AWS Config

## Real-World Production Scenario & Impact

- **Production Scenario:** Automated SOC 2 Type II Audit: Evaluates 150 AWS accounts against CIS Benchmarks using OPA Rego policies; generates audit evidence package.
- **Measurable Business Gain:** Reduces annual audit preparation time from 6 weeks to 3 hours; maintains continuous 100% compliance score.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Policy-as-Code & Compliance Studio](https://talaripradeep.info/tools/compliance/)
- **Hands-On Learn Drill:** [Automated SOC 2 & ISO 27001 Evidence Engine](https://talaripradeep.info/studios/learn/?studio=compliance)
- **Visual Architecture Flow:** [SOC2 & ISO 27001 Evidence Engine](https://talaripradeep.info/studios/flow/?template=devsecops)
- **Production Repository:** [Pradeeptalari14/tp-compliance](https://github.com/Pradeeptalari14/tp-compliance)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `control-mapping` | Map technical controls to compliance frameworks |
| `policy-as-code` | Encode compliance and guardrail policies as automated checks |

## Commands

| Command | Purpose |
|---------|---------|
| `/compliance-engineer:audit-readiness` | Assess audit readiness and list evidence gaps for a framework |
| `/compliance-engineer:write-policy-rule` | Translate a written policy into a policy-as-code rule with tests |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install compliance-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
