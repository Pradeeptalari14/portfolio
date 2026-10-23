---
name: secure-code-review
description: "Review code for the OWASP Top 10 class of vulnerabilities. Trigger with 'security review this code', 'is this SQL injection', 'check auth', 'XSS' or 'SSRF'."
---

# Secure Code Review

> Part of the **Application Security Engineer** plugin (`appsec-engineer`).

## When to use

- A change touches authentication, authorisation, input parsing or file handling
- A scanner reports a finding that needs triage

## Workflow

1. Trace untrusted input from entry point to sinks: queries, commands, templates, file paths, URLs and deserialisers.
2. Verify authentication and object-level authorisation on every route, checking ownership, not only login state.
3. Check output encoding, content security policy and cookie flags for browser-facing code.
4. Check outbound requests for SSRF controls, and secrets, logging and error handling for leakage.
5. Report each finding with proof of concept, impact, a code-level fix and a regression test.

## Quality checklist

- [ ] Queries are parameterised and commands avoid shell interpolation
- [ ] Authorisation is enforced server-side per object
- [ ] Dependencies with known critical issues are flagged
- [ ] Fixes include automated tests

## Output format

```markdown
## Security Review: [Change]
| # | Severity | Location | Issue | Fix |
|---|----------|----------|-------|-----|
| 1 | High | [file:line] | [issue] | [fix] |

**Verdict:** [approve | fix before merge]
```

## Common pitfalls

- Checking authentication but not authorisation (broken object-level access).
- Relying on client-side validation.
- Fixing the instance without fixing the vulnerable pattern.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
