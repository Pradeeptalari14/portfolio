# 🧠 LLMOps Engineer

Prompt versioning, evaluation harnesses, guardrails, gateways and LLM cost control.

**Group:** AI & Data  
**Typical tools:** LangSmith, Langfuse, LiteLLM, Promptfoo, Guardrails

## Real-World Production Scenario & Impact

- **Production Scenario:** Prompt Caching & Cost Reduction: Implements Anthropic prompt caching headers across customer support agents with 80k token system prompts.
- **Measurable Business Gain:** 82% reduction in recurring LLM API costs; decreases Time-to-First-Token (TTFT) from 1.8s to 320ms.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [LLM Tracing & Langfuse Studio](https://talaripradeep.info/tools/llm-tracing/)
- **Hands-On Learn Drill:** [Anthropic Prompt Caching & TTFT Optimization](https://talaripradeep.info/studios/learn/?studio=llm-tracing)
- **Visual Architecture Flow:** [LLM Gateway & Prompt Caching](https://talaripradeep.info/studios/flow/?template=rag)
- **Production Repository:** [Pradeeptalari14/tp-llm-tracing](https://github.com/Pradeeptalari14/tp-llm-tracing)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `llm-evaluation-harness` | Build an offline and online evaluation system for LLM features |
| `llm-guardrails-gateway` | Design an LLM gateway with routing, caching, guardrails and spend controls |

## Commands

| Command | Purpose |
|---------|---------|
| `/llmops-engineer:eval-plan` | Create an evaluation plan with datasets, metrics and release gates for an LLM feature |
| `/llmops-engineer:prompt-review` | Review a prompt for clarity, injection risk and testability |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install llmops-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
