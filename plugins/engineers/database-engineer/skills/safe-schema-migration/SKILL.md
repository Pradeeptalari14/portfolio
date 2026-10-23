---
name: safe-schema-migration
description: "Plan online schema migrations without downtime. Trigger with 'alter table', 'add column', 'migrate schema', 'zero downtime migration' or 'backfill'."
---

# Safe Schema Migration

> Part of the **Database Reliability Engineer** plugin (`database-engineer`).

## When to use

- A migration touches a large or hot table
- A release needs a schema change and must be reversible

## Workflow

1. Classify the change and its lock level. Check if the engine rewrites the table or takes an exclusive lock.
2. Use expand, migrate, contract: add the new structure, dual-write and backfill in batches, switch reads, then remove the old structure in a later release.
3. Set lock_timeout and statement_timeout, and create indexes concurrently where supported.
4. Backfill in small batches with throttling and replication-lag checks.
5. Define the rollback for every step and test it on a production-sized copy.

## Quality checklist

- [ ] No long exclusive locks on hot tables
- [ ] Application is compatible with both old and new schema during rollout
- [ ] Backfill is idempotent and resumable
- [ ] Replica lag is monitored during the migration

## Output format

```markdown
## Migration Plan: [Change]
| Step | Statement | Lock | Rollback |
|------|-----------|------|----------|
| 1 expand | [DDL] | [level] | [undo] |

**Backfill:** [batch size and throttle]
**Verification:** [queries]
```

## Common pitfalls

- Adding a NOT NULL column with a default on an engine that rewrites the table.
- Renaming a column in one step while old code is still running.
- Backfilling in one transaction and exhausting WAL or undo space.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
