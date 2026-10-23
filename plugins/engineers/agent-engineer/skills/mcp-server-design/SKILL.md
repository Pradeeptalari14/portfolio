---
name: mcp-server-design
description: "Design and secure a Model Context Protocol server. Trigger with 'build an MCP server', 'expose this API to the agent', 'MCP tool design' or 'MCP security'."
---

# Mcp Server Design

> Part of the **Agent Engineer** plugin (`agent-engineer`).

## When to use

- An internal system should be usable by AI clients
- An existing MCP server has too many or unsafe tools

## Workflow

1. List the user tasks, then expose a small set of task-oriented tools instead of mirroring every API endpoint.
2. Write precise tool names, descriptions and JSON schemas with enums and constraints. Return concise structured results.
3. Choose transport and authentication: stdio for local, streamable HTTP with OAuth for remote, with per-user authorisation.
4. Treat tool output as untrusted input to the model, and defend against prompt injection from fetched content.
5. Add logging, rate limits, timeouts and a read-only mode, and test with an MCP inspector and an evaluation set.

## Quality checklist

- [ ] Destructive tools require confirmation or are omitted
- [ ] Secrets never appear in tool results
- [ ] Servers enforce authorisation themselves, not through the model
- [ ] Tool descriptions are tested for correct selection by the model

## Output format

```markdown
## MCP Server Spec: [System]
| Tool | Input | Output | Risk |
|------|-------|--------|------|
| [search_tickets] | query, limit | list | read-only |

**Transport and auth:** [choice]
**Controls:** [limits, logging]
```

## Common pitfalls

- One tool per endpoint, overwhelming model tool selection.
- Returning huge payloads that waste context.
- Trusting the model to enforce access rules.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
