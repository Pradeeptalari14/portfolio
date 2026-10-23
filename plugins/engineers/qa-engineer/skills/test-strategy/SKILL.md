---
name: test-strategy
description: "Create a risk-based test strategy and automation pyramid. Trigger with 'test strategy', 'what should we test', 'increase coverage', 'test plan' or 'reduce regression bugs'."
---

# Test Strategy

> Part of the **QA and Test Automation Engineer** plugin (`qa-engineer`).

## When to use

- Bugs escape to production repeatedly
- The test suite is slow, flaky or mostly end-to-end

## Workflow

1. List the product risks by user impact and change frequency, and focus test effort there.
2. Shape the pyramid: many fast unit tests, a moderate number of integration and contract tests, few end-to-end tests for critical journeys.
3. Use contract tests between services so teams can release independently.
4. Define test data strategy: factories, isolated state and no dependence on shared mutable environments.
5. Set quality gates for CI with a time budget, and track escape rate and flake rate.

## Quality checklist

- [ ] Critical journeys have at least one reliable end-to-end test
- [ ] Tests are independent and can run in any order
- [ ] Failing tests block merges, and flaky tests are quarantined with an owner
- [ ] Coverage is used to find gaps, not as a target to game

## Output format

```markdown
## Test Strategy: [Product]
| Risk | Level | Test type | Owner |
|------|-------|-----------|-------|
| [Payment failure] | high | contract + e2e | [team] |

**CI budget:** [minutes]
**Metrics:** escape rate, flake rate, suite time
```

## Common pitfalls

- An ice-cream cone of slow UI tests on top of few unit tests.
- Shared test environments with data collisions.
- Chasing a coverage percentage with meaningless assertions.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
