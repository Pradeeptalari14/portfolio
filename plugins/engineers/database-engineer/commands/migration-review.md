---
description: "Review a SQL migration for locking, compatibility and rollback safety"
argument-hint: "<migration SQL and database engine/version>"
---

# /database-engineer:migration-review

Review a SQL migration for locking, compatibility and rollback safety.

## Usage

```
/database-engineer:migration-review $ARGUMENTS
```

## Steps

1. Identify each statement and its lock behaviour on the stated engine.
2. Check backward compatibility with the running application.
3. Rewrite risky steps into expand, migrate, contract stages.
4. List verification queries and the rollback.

## Output

A staged migration plan with lock analysis and rollback steps.

If the input is missing or ambiguous, ask one focused question before continuing.
