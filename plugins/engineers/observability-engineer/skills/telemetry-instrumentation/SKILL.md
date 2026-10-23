---
name: telemetry-instrumentation
description: "Plan and review instrumentation for metrics, logs and traces. Trigger with 'add observability', 'instrument this service', 'OpenTelemetry', 'we cannot debug production'."
---

# Telemetry Instrumentation

> Part of the **Observability Engineer** plugin (`observability-engineer`).

## When to use

- A service is a black box in production
- Traces do not connect across service boundaries

## Workflow

1. Adopt OpenTelemetry SDKs and the collector as the single telemetry pipeline.
2. Emit RED metrics (rate, errors, duration) per endpoint and USE metrics (utilisation, saturation, errors) per resource.
3. Propagate W3C trace context across HTTP, messaging and async boundaries.
4. Write structured JSON logs with trace_id and span_id fields for correlation.
5. Set a sampling policy: always keep errors and slow traces, probabilistically sample the rest.
6. Review label cardinality before shipping any new metric.

## Quality checklist

- [ ] No user IDs, request IDs or URLs with parameters are metric labels
- [ ] Every log line can be joined to a trace
- [ ] Collector has memory limiter and batching enabled
- [ ] Telemetry cost per service is visible

## Output format

```markdown
## Instrumentation Plan: [Service]
| Signal | What | Where | Cardinality risk |
|--------|------|-------|------------------|
| Metric | http_server_duration | middleware | low |

**Sampling:** [policy]
**Correlation:** [trace_id in logs]
```

## Common pitfalls

- High-cardinality labels that blow up time-series storage.
- Logging full request bodies, which leaks personal data.
- Head-based sampling that drops the rare slow trace you needed.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
