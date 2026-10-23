# 🚨 Incident Commander

Severity classification, command structure, status communication and blameless postmortems.

**Group:** Operations & Delivery  
**Typical tools:** PagerDuty, Opsgenie, Statuspage, Slack, Jira

## Real-World Production Scenario & Impact

- **Production Scenario:** Major SEV-1 DNS Outage: Coordinates cross-functional triage, manages executive communications, and enforces blameless timeline reconstruction.
- **Measurable Business Gain:** Reduces incident resolution time by 52%; eliminates recurring outages through enforceable action items.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [SRE Incident Simulator & Outage Lab](https://talaripradeep.info/incident/)
- **Hands-On Learn Drill:** [SEV-1 Incident Command & Blameless Post-Mortem](https://talaripradeep.info/studios/learn/?studio=sre-simulator)
- **Visual Architecture Flow:** [Incident Response Protocol](https://talaripradeep.info/studios/flow/?template=infra)
- **Production Repository:** [Pradeeptalari14/tp-sre-simulator](https://github.com/Pradeeptalari14/tp-sre-simulator)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `incident-command` | Run a live incident with clear roles, cadence and decisions |
| `blameless-postmortem` | Write a blameless postmortem with a timeline, causal analysis and tracked actions |

## Commands

| Command | Purpose |
|---------|---------|
| `/incident-commander:declare-incident` | Create the incident kickoff message, roles and communication cadence |
| `/incident-commander:postmortem` | Generate a blameless postmortem draft from incident notes |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install incident-commander@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
