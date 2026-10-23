---
name: agent-architecture
description: "Design a reliable tool-using agent or multi-agent workflow. Trigger with 'build an agent', 'multi-agent', 'LangGraph', 'agent keeps looping' or 'which tools should the agent have'."
---

# Agent Architecture

> Part of the **Agent Engineer** plugin (`agent-engineer`).

## When to use

- A workflow needs model-driven decisions across several tools
- An agent is unreliable or too expensive

## Workflow

1. Start with the simplest design that works: a fixed workflow before an agent, a single agent before a swarm.
2. Model the work as a state graph with explicit nodes, edges, retries and termination conditions.
3. Define each tool with a narrow purpose, typed input schema, clear description and least-privilege credentials.
4. Add budgets: maximum steps, tokens, wall-clock time and spend per run.
5. Add human approval for irreversible or high-impact actions, and persist state so runs can resume.

## Quality checklist

- [ ] Every loop has a hard exit
- [ ] Tool errors return structured messages the model can act on
- [ ] Runs are traced end to end with inputs, outputs and cost
- [ ] Evaluations cover multi-step success, not only single responses

## Output format

```markdown
## Agent Design: [Task]
**Pattern:** [workflow | single agent | supervisor]
| Tool | Purpose | Scope | Approval needed |
|------|---------|-------|-----------------|

**Budgets:** [steps, tokens, time]
**Failure handling:** [rules]
```

## Common pitfalls

- Giving one agent dozens of overlapping tools.
- Unbounded retry loops that burn budget.
- Letting an agent hold broad credentials for convenience.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
