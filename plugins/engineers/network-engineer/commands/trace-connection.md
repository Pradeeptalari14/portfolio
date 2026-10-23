---
description: "Generate a layer-by-layer diagnostic checklist for a failing connection"
argument-hint: "<source, destination, port and error message>"
---

# /network-engineer:trace-connection

Generate a layer-by-layer diagnostic checklist for a failing connection.

## Usage

```
/network-engineer:trace-connection $ARGUMENTS
```

## Steps

1. Classify the symptom as timeout, refused, reset or slow.
2. Select the commands for DNS, route, firewall and transport checks.
3. Explain how to interpret each result.
4. List the most probable causes in order.

## Output

An ordered command list with interpretations and ranked likely causes.

If the input is missing or ambiguous, ask one focused question before continuing.
