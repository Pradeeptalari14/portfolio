---
description: "Translate a written policy into a policy-as-code rule with tests"
argument-hint: "<policy statement and target (Terraform, Kubernetes, etc.)>"
---

# /compliance-engineer:write-policy-rule

Translate a written policy into a policy-as-code rule with tests.

## Usage

```
/compliance-engineer:write-policy-rule $ARGUMENTS
```

## Steps

1. Restate the policy as a precise condition.
2. Write the rule in the appropriate language.
3. Create passing and failing fixtures.
4. Add a remediation message.

## Output

A policy rule, test fixtures and a remediation message.

If the input is missing or ambiguous, ask one focused question before continuing.
