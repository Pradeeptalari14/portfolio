---
name: llm-guardrails-gateway
description: "Design an LLM gateway with routing, caching, guardrails and spend controls. Trigger with 'LLM gateway', 'prompt injection defence', 'PII in prompts', 'LLM cost control' or 'rate limit the model'."
---

# Llm Guardrails Gateway

> Part of the **LLMOps Engineer** plugin (`llmops-engineer`).

## When to use

- Several teams call model APIs directly
- LLM spend or safety incidents are unmanaged

## Workflow

1. Route all model traffic through one gateway that handles authentication, per-team quotas and retries with fallback models.
2. Add input controls: PII redaction, prompt-injection detection and size limits.
3. Add output controls: schema validation, policy classification and secret or PII filtering.
4. Enable semantic and exact caching where answers are stable, and log token usage per team and feature.
5. Alert on spend anomalies and set hard budget limits.

## Quality checklist

- [ ] No application holds raw provider API keys
- [ ] Tool-calling agents have least-privilege tool scopes
- [ ] Logs avoid storing sensitive prompts unredacted
- [ ] Fallback behaviour is tested during provider outages

## Output format

```markdown
## LLM Gateway Design
| Layer | Control | Tool | Failure mode |
|-------|---------|------|--------------|
| Input | PII redaction | [tool] | fail closed |

**Budgets:** [per team limits]
**Fallback:** [model order]
```

## Common pitfalls

- Treating guardrails as a replacement for least-privilege tool access.
- Caching responses that depend on user-specific context.
- Blocking traffic on a guardrail timeout instead of defining a safe default.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
