# 🔐 DevSecOps Engineer

Shift-left scanning, SBOMs, signed artifacts, SLSA provenance and runtime enforcement.

**Group:** Security, Quality & Application  
**Typical tools:** Trivy, Cosign, Semgrep, Gitleaks, Kyverno

## Real-World Production Scenario & Impact

- **Production Scenario:** Pre-Merge Supply Chain Defense: Blocks malicious npm dependency containing cryptomining payloads before it reaches staging container registry.
- **Measurable Business Gain:** 100% automated vulnerability scanning; reduces critical vulnerabilities in production containers to zero.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [SAST & Pipeline Security Gate Studio](https://talaripradeep.info/tools/sast/)
- **Hands-On Learn Drill:** [Supply Chain Security & Trivy Scanning](https://talaripradeep.info/studios/learn/?studio=sast)
- **Visual Architecture Flow:** [DevSecOps Pipeline Security](https://talaripradeep.info/studios/flow/?template=devsecops)
- **Production Repository:** [Pradeeptalari14/tp-sast](https://github.com/Pradeeptalari14/tp-sast)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `supply-chain-security` | Secure the build and delivery supply chain |
| `secrets-management` | Eliminate hard-coded secrets and design rotation |

## Commands

| Command | Purpose |
|---------|---------|
| `/devsecops-engineer:pipeline-security-review` | Review a CI workflow for supply chain and permission weaknesses |
| `/devsecops-engineer:leaked-secret-response` | Generate an incident checklist for a leaked credential |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install devsecops-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
