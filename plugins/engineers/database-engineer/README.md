# 🗄️ Database Reliability Engineer

Schema migrations, query tuning, replication, backups and restore verification.

**Group:** Operations & Delivery  
**Typical tools:** PostgreSQL, MySQL, Redis, pgBouncer, pgBackRest

## Real-World Production Scenario & Impact

- **Production Scenario:** High-Volume Postgres Lock Contention: Identifies unvacuumed bloated tables and creates partial indexes on 40-million row payment tables.
- **Measurable Business Gain:** Reduces p99 query latency from 4.2s to 18ms; guarantees zero data loss (RPO=0) with Patroni failover.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Database Clustering & HA Studio](https://talaripradeep.info/tools/db-clustering/)
- **Hands-On Learn Drill:** [Postgres Lock Contention & Indexing](https://talaripradeep.info/studios/learn/?studio=db-clustering)
- **Visual Architecture Flow:** [High Availability Database Topology](https://talaripradeep.info/studios/flow/?template=database)
- **Production Repository:** [Pradeeptalari14/tp-db-clustering](https://github.com/Pradeeptalari14/tp-db-clustering)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `safe-schema-migration` | Plan online schema migrations without downtime |
| `query-performance-tuning` | Diagnose and fix slow queries using plans and statistics |

## Commands

| Command | Purpose |
|---------|---------|
| `/database-engineer:migration-review` | Review a SQL migration for locking, compatibility and rollback safety |
| `/database-engineer:restore-drill` | Design a backup restore drill with RTO and RPO measurement |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install database-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
