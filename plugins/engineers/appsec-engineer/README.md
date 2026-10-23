# 🛑 Application Security Engineer

Threat modelling, secure code review, OWASP controls and LLM application security.

**Group:** Security, Quality & Application  
**Typical tools:** OWASP ASVS, Semgrep, CodeQL, Burp Suite, ZAP

## Real-World Production Scenario & Impact

- **Production Scenario:** OWASP Top 10 API Hardening: Conducts STRIDE threat model on user authentication flow; remediates BOLA (Broken Object Level Authorization) vulnerability.
- **Measurable Business Gain:** Guarantees zero unauthorized cross-tenant data leaks; remediates high-severity vulnerabilities before pen-test.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [LLM & AppSec Guardrails Studio](https://talaripradeep.info/tools/llm-guardrails/)
- **Hands-On Learn Drill:** [STRIDE Threat Modeling & OWASP Hardening](https://talaripradeep.info/studios/learn/?studio=llm-guardrails)
- **Visual Architecture Flow:** [STRIDE Threat Model & Defense](https://talaripradeep.info/studios/flow/?template=devsecops)
- **Production Repository:** [Pradeeptalari14/tp-llm-guardrails](https://github.com/Pradeeptalari14/tp-llm-guardrails)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `threat-modeling` | Run a structured threat model for a feature or system |
| `secure-code-review` | Review code for the OWASP Top 10 class of vulnerabilities |

## Commands

| Command | Purpose |
|---------|---------|
| `/appsec-engineer:threat-model` | Generate a STRIDE threat model from a design description |
| `/appsec-engineer:code-security-review` | Security review a code snippet or diff and return findings with fixes |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install appsec-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
