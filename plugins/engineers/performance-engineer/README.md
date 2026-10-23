# 🏎️ Performance Engineer

Load testing, profiling, capacity modelling and tail-latency analysis.

**Group:** Security, Quality & Application  
**Typical tools:** k6, Locust, async-profiler, pprof, Flame graphs

## Real-World Production Scenario & Impact

- **Production Scenario:** Cyber Monday Traffic Stress Simulation: Executes 50,000 RPS distributed k6 load test; uncovers thread-pool starvation in checkout microservice.
- **Measurable Business Gain:** Scales throughput capacity by 3.8x while reducing p99 latency under peak load from 1,200ms to 85ms.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [High-Throughput Load Testing Studio](https://talaripradeep.info/tools/performance/)
- **Hands-On Learn Drill:** [k6 Distributed Load Testing & Profiling](https://talaripradeep.info/studios/learn/?studio=performance)
- **Visual Architecture Flow:** [Distributed Load Profile](https://talaripradeep.info/studios/flow/?template=backend)
- **Production Repository:** [Pradeeptalari14/tp-performance](https://github.com/Pradeeptalari14/tp-performance)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `load-test-design` | Design realistic load and stress tests with clear pass criteria |
| `profiling-bottlenecks` | Find CPU, memory and latency bottlenecks with profiling and tracing |

## Commands

| Command | Purpose |
|---------|---------|
| `/performance-engineer:load-test-plan` | Create a load test plan with scenarios, load shape and pass criteria |
| `/performance-engineer:bottleneck-hunt` | Interpret metrics, traces or profiles to locate the bottleneck |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install performance-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
