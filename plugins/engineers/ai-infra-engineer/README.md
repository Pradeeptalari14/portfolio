# ⚡ AI Infrastructure Engineer

GPU scheduling, inference serving, batching, quantisation and capacity planning.

**Group:** AI & Data  
**Typical tools:** vLLM, KServe, NVIDIA GPU Operator, Ray, Triton

## Real-World Production Scenario & Impact

- **Production Scenario:** Distributed Inference Serving: Deploys DeepSeek-V3 across 8x H100 GPUs with vLLM PagedAttention and TensorRT-LLM tensor parallelism.
- **Measurable Business Gain:** Maximizes GPU memory utilization from 42% to 94%; handles 4.5x higher concurrent inference requests.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Distributed Ray & vLLM Cluster Studio](https://talaripradeep.info/tools/ray-cluster/)
- **Hands-On Learn Drill:** [GPU Clustering, PagedAttention & NCCL Tuning](https://talaripradeep.info/studios/learn/?studio=ray-cluster)
- **Visual Architecture Flow:** [vLLM High-Throughput Serving Engine](https://talaripradeep.info/studios/flow/?template=rag)
- **Production Repository:** [Pradeeptalari14/tp-ray-cluster](https://github.com/Pradeeptalari14/tp-ray-cluster)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `inference-serving-design` | Design a production LLM or model inference service |
| `gpu-capacity-planning` | Plan and schedule GPU capacity across training and inference |

## Commands

| Command | Purpose |
|---------|---------|
| `/ai-infra-engineer:serving-sizing` | Estimate replicas and GPU count for a model from traffic and latency targets |
| `/ai-infra-engineer:gpu-utilization-review` | Review GPU utilisation data and find waste and scheduling fixes |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install ai-infra-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
