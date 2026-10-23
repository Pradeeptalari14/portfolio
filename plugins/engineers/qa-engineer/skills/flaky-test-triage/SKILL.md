---
name: flaky-test-triage
description: "Find and fix flaky tests systematically. Trigger with 'flaky test', 'intermittent failure', 'passes locally fails in CI' or 'rerun fixes it'."
---

# Flaky Test Triage

> Part of the **QA and Test Automation Engineer** plugin (`qa-engineer`).

## When to use

- Developers rerun CI as a habit
- A test fails less than 10% of the time with no code change

## Workflow

1. Collect failure history per test over 30 days and rank by flake rate and impact.
2. Reproduce locally by running the test repeatedly, in isolation and in parallel, with the CI seed and timing.
3. Classify the cause: timing and waits, shared state, ordering, external dependency, resource limits or randomness.
4. Fix the cause: wait on conditions rather than sleeps, isolate data, mock the network, fix clocks and seeds.
5. Quarantine while fixing, with an expiry date, and track the flake rate as a metric.

## Quality checklist

- [ ] No fixed sleeps remain in the fixed test
- [ ] Fix is verified with at least 100 consecutive passes
- [ ] Quarantined tests are reviewed weekly
- [ ] Retries are limited and reported, not silent

## Output format

```markdown
## Flaky Test Report
| Test | Flake rate | Cause | Fix | Status |
|------|-----------|-------|-----|--------|
| [name] | 8% | shared state | isolate fixtures | fixed |
```

## Common pitfalls

- Adding blanket retries that hide real defects.
- Quarantining tests permanently.
- Fixing symptoms with longer timeouts.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
