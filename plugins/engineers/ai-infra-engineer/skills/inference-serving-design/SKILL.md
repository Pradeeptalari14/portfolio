---
name: inference-serving-design
description: "Design a production LLM or model inference service. Trigger with 'serve a model', 'vLLM', 'GPU inference', 'reduce latency of the model' or 'time to first token'."
---

# Inference Serving Design

> Part of the **AI Infrastructure Engineer** plugin (`ai-infra-engineer`).

## When to use

- A model needs to serve interactive traffic
- GPU utilisation is low while latency is high

## Workflow

1. Characterise the workload: input and output token lengths, concurrency, latency targets for time to first token and inter-token latency.
2. Choose the engine and features: continuous batching, paged KV cache, prefix caching and tensor parallelism if the model does not fit one GPU.
3. Pick precision and quantisation (FP8, INT8, AWQ or GPTQ) and verify quality on your evaluation set.
4. Size replicas from measured tokens per second per GPU and target utilisation, with headroom for failure.
5. Autoscale on queue depth or concurrency, not CPU, and plan cold-start time for model weights.

## Quality checklist

- [ ] Load test uses realistic prompt and output length distributions
- [ ] Quantised model passes the quality evaluation
- [ ] Model weights are cached close to nodes to cut cold starts
- [ ] GPU, KV-cache and queue metrics are on dashboards

## Output format

```markdown
## Inference Design: [Model]
| Item | Choice | Reason |
|------|--------|--------|
| Engine | [vLLM] | continuous batching |

**Capacity:** [replicas x tokens/s]
**SLO:** TTFT [x] ms, ITL [y] ms
```

## Common pitfalls

- Sizing from peak throughput benchmarks with short prompts.
- Autoscaling on GPU utilisation, which saturates before latency degrades.
- Ignoring model load time in scale-up decisions.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
