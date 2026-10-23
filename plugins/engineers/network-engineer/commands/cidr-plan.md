---
description: "Create a non-overlapping CIDR allocation plan for multiple networks"
argument-hint: "<environments, regions and expected host counts>"
---

# /network-engineer:cidr-plan

Create a non-overlapping CIDR allocation plan for multiple networks.

## Usage

```
/network-engineer:cidr-plan $ARGUMENTS
```

## Steps

1. Choose a supernet and note reserved ranges.
2. Size each network with growth headroom.
3. Allocate by region and environment.
4. Flag any overlap with on-premises ranges.

## Output

An allocation table with CIDR, usable hosts and growth headroom.

If the input is missing or ambiguous, ask one focused question before continuing.
