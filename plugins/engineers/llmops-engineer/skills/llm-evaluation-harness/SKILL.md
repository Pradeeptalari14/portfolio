---
name: llm-evaluation-harness
description: "Build an offline and online evaluation system for LLM features. Trigger with 'evaluate the prompt', 'LLM evals', 'regression tests for prompts', 'LLM as judge' or 'is the new model better'."
---

# Llm Evaluation Harness

> Part of the **LLMOps Engineer** plugin (`llmops-engineer`).

## When to use

- Prompt or model changes are shipped on intuition
- Quality complaints cannot be reproduced

## Workflow

1. Collect a golden dataset from real traffic with expected outputs or rubrics, covering common cases, edge cases and known failures.
2. Define metrics per task: exact match or schema validity for structured output, groundedness for RAG, rubric scores for open-ended text.
3. Use LLM-as-judge with a fixed rubric, calibrate it against human labels and track agreement.
4. Run the suite in CI on every prompt, model or retrieval change and block regressions beyond a tolerance.
5. Sample production traces for online evaluation and feed failures back into the golden set.

## Quality checklist

- [ ] The judge model differs from the generator where possible
- [ ] Results report variance across several runs, not one sample
- [ ] Cost and latency are evaluated alongside quality
- [ ] Prompt and model versions are stored with every score

## Output format

```markdown
## Eval Report: [Feature], [Candidate vs Baseline]
| Metric | Baseline | Candidate | Delta |
|--------|----------|-----------|-------|
| Groundedness | [x] | [y] | [d] |

**Regressions:** [cases]
**Decision:** [ship | hold]
```

## Common pitfalls

- Evaluating on the same examples used to craft the prompt.
- Trusting an uncalibrated judge.
- Ignoring non-determinism by drawing a single sample.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
