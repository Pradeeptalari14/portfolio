---
name: threat-modeling
description: "Run a structured threat model for a feature or system. Trigger with 'threat model', 'STRIDE', 'security design review' or 'what could go wrong with this design'."
---

# Threat Modeling

> Part of the **Application Security Engineer** plugin (`appsec-engineer`).

## When to use

- A feature handles sensitive data or new trust boundaries
- Architecture changes introduce external integrations

## Workflow

1. Draw a data flow diagram with actors, processes, data stores and trust boundaries.
2. Apply STRIDE to each element and boundary crossing: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege.
3. Rate each threat by likelihood and impact, and note existing mitigations.
4. Define mitigations and map them to testable security requirements.
5. Track residual risk with an owner, and revisit when the design changes.

## Quality checklist

- [ ] Trust boundaries are explicit in the diagram
- [ ] Every high risk has a mitigation or an accepted-risk record
- [ ] Mitigations become tickets or tests
- [ ] Model is stored beside the design document

## Output format

```markdown
## Threat Model: [Feature]
| Threat | STRIDE | Likelihood | Impact | Mitigation |
|--------|--------|------------|--------|------------|
| [token theft] | S | M | H | [short-lived tokens] |

**Residual risk:** [text and owner]
```

## Common pitfalls

- A one-off exercise that is never updated.
- Listing threats without ranking them.
- Ignoring abuse of legitimate features.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
