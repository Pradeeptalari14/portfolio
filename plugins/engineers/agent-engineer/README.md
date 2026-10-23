# 🤖 Agent Engineer

Tool-using agents, MCP servers, orchestration graphs, memory and safe autonomy.

**Group:** AI & Data  
**Typical tools:** LangGraph, MCP, OpenAI Agents SDK, Temporal, OpenTelemetry

## Real-World Production Scenario & Impact

- **Production Scenario:** Autonomous Pod Crash Remediation: LangGraph multi-agent swarm inspects container OOMKilled logs, patches deployment memory limits, and creates pull request.
- **Measurable Business Gain:** Autonomously resolves 48% of tier-1 production alerts without waking human engineers.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Strands Autonomous SRE Agent Studio](https://talaripradeep.info/tools/strands/)
- **Hands-On Learn Drill:** [LangGraph Multi-Agent Consensus & Safety](https://talaripradeep.info/studios/learn/?studio=strands)
- **Visual Architecture Flow:** [Autonomous Agent Swarm Consensus](https://talaripradeep.info/studios/flow/?template=agent)
- **Production Repository:** [Pradeeptalari14/tp-strands](https://github.com/Pradeeptalari14/tp-strands)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `agent-architecture` | Design a reliable tool-using agent or multi-agent workflow |
| `mcp-server-design` | Design and secure a Model Context Protocol server |

## Commands

| Command | Purpose |
|---------|---------|
| `/agent-engineer:agent-spec` | Produce an agent specification with graph, tools, budgets and approvals |
| `/agent-engineer:mcp-tool-review` | Review MCP tool definitions for clarity, safety and token efficiency |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install agent-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
