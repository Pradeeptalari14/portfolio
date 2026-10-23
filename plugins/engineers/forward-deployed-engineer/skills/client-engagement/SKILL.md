---
name: client-engagement
description: "Frame vague customer complaints into deterministic architectural requirements & golden datasets. Trigger with 'client discovery', 'FDE', 'customer deployment', 'enterprise AI scoping'."
---

# Client Engagement

> Part of the **Forward Deployed AI Engineer** plugin (`forward-deployed-engineer`).

## When to use

- Customer requirements are ambiguous
- Scoping a new AI deployment for an enterprise client

## Workflow

1. Interview front-line operators and map the current value stream and latency bottlenecks.
2. Curate a Golden Dataset of 50–100 realistic customer queries with verified expected outputs.
3. Define contractually clear acceptance criteria: Faithfulness >= 95%, Hallucination <= 1%, P99 <= 2000ms.
4. Produce an Architecture Decision Record (ADR) and formal Statement of Work (SOW).

## Quality checklist

- [ ] Golden dataset has human-verified ground truth
- [ ] Client security constraints (air-gap, PII) are documented
- [ ] SLA targets are measurable via automated tests

## Output format

```markdown
## Client Problem Framing: [Client Name]
| Metric | Baseline | Target SLA | Validation Engine |
|---|---|---|---|
| Latency P99 | 12,000ms | < 2,000ms | Prometheus probe |
| Faithfulness | 72% | >= 95.0% | Ragas Golden Set |
```

## Common pitfalls

- Relying on executive opinions without observing real frontline operator workflows.
- Deploying without a baseline evaluation benchmark.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
