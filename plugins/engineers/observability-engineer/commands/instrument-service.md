---
description: "Generate an OpenTelemetry instrumentation plan for a service"
argument-hint: "<language, framework and dependencies>"
---

# /observability-engineer:instrument-service

Generate an OpenTelemetry instrumentation plan for a service.

## Usage

```
/observability-engineer:instrument-service $ARGUMENTS
```

## Steps

1. Identify the entry points and outbound calls.
2. Select the SDK, auto-instrumentation and manual spans required.
3. Define metric names, units and low-cardinality labels.
4. Provide a collector configuration snippet.

## Output

An instrumentation checklist, example code and a collector pipeline config.

If the input is missing or ambiguous, ask one focused question before continuing.
