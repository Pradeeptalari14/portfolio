---
description: "Create the incident kickoff message, roles and communication cadence"
argument-hint: "<symptom and observed impact>"
---

# /incident-commander:declare-incident

Create the incident kickoff message, roles and communication cadence.

## Usage

```
/incident-commander:declare-incident $ARGUMENTS
```

## Steps

1. Suggest a severity with the reasoning.
2. Draft the channel topic and the first status update.
3. List role assignments to confirm.
4. Set the update cadence and the next checkpoint.

## Output

A kickoff message, a role table and the first customer-facing update draft.

If the input is missing or ambiguous, ask one focused question before continuing.
