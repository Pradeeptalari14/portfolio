# 📈 Observability Engineer

Metrics, logs and traces with OpenTelemetry, cardinality control and actionable alerting.

**Group:** Operations & Delivery  
**Typical tools:** OpenTelemetry, Prometheus, Loki, Tempo, Grafana

## Real-World Production Scenario & Impact

- **Production Scenario:** Microservices Latency Spike: Distributed OpenTelemetry tracing identifies an unindexed Redis call nested 4 layers deep inside the checkout service.
- **Measurable Business Gain:** Pins down root-cause span in under 2 minutes; eliminates 65% of false-positive telemetry alerts.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Enterprise Observability Studio](https://talaripradeep.info/tools/monitoring/)
- **Hands-On Learn Drill:** [OpenTelemetry Distributed Tracing](https://talaripradeep.info/studios/learn/?studio=ebpf-tracing)
- **Visual Architecture Flow:** [Distributed Tracing Topology](https://talaripradeep.info/studios/flow/?template=infra)
- **Production Repository:** [Pradeeptalari14/tp-ebpf-tracing](https://github.com/Pradeeptalari14/tp-ebpf-tracing)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `telemetry-instrumentation` | Plan and review instrumentation for metrics, logs and traces |
| `alert-quality` | Improve alert signal-to-noise |

## Commands

| Command | Purpose |
|---------|---------|
| `/observability-engineer:instrument-service` | Generate an OpenTelemetry instrumentation plan for a service |
| `/observability-engineer:alert-audit` | Audit alert rules for noise, missing runbooks and cause-based alerting |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install observability-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
