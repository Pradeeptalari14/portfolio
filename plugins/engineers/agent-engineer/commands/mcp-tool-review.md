---
description: "Review MCP tool definitions for clarity, safety and token efficiency"
argument-hint: "<tool definitions JSON>"
---

# /agent-engineer:mcp-tool-review

Review MCP tool definitions for clarity, safety and token efficiency.

## Usage

```
/agent-engineer:mcp-tool-review $ARGUMENTS
```

## Steps

1. Check names, descriptions and schemas for ambiguity.
2. Flag overlapping or destructive tools.
3. Estimate output size and suggest trimming.
4. Rewrite the weakest definitions.

## Output

Findings per tool and rewritten definitions.

If the input is missing or ambiguous, ask one focused question before continuing.
