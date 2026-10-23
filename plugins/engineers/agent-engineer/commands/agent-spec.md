---
description: "Produce an agent specification with graph, tools, budgets and approvals"
argument-hint: "<task the agent must accomplish>"
---

# /agent-engineer:agent-spec

Produce an agent specification with graph, tools, budgets and approvals.

## Usage

```
/agent-engineer:agent-spec $ARGUMENTS
```

## Steps

1. Decide if a workflow is sufficient.
2. Draw the node and edge list.
3. Define tools, scopes and approval points.
4. Set budgets and the evaluation plan.

## Output

An agent specification with graph, tool table, budgets and evaluation plan.

If the input is missing or ambiguous, ask one focused question before continuing.
