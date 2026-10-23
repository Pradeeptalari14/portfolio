# 🗃️ Data Engineer

Pipelines, data contracts, quality checks, lakehouse modelling and streaming reliability.

**Group:** AI & Data  
**Typical tools:** Airflow, dbt, Spark, Kafka, Great Expectations

## Real-World Production Scenario & Impact

- **Production Scenario:** Zero-Downtime Data Pipeline Migration: Migrates 15TB daily streaming clickstream data to Apache Iceberg and dbt with automated Great Expectations schema validation.
- **Measurable Business Gain:** Reduces ETL compute costs by 54%; guarantees zero corrupted data rows reach executive dashboards.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Snowflake Lakehouse & dbt Studio](https://talaripradeep.info/tools/snowflake-warehouse/)
- **Hands-On Learn Drill:** [Apache Iceberg Lakehouse & Data Quality Contracts](https://talaripradeep.info/studios/learn/?studio=snowflake-warehouse)
- **Visual Architecture Flow:** [Lakehouse Pipeline & Quality Contracts](https://talaripradeep.info/studios/flow/?template=rag)
- **Production Repository:** [Pradeeptalari14/tp-snowflake-warehouse](https://github.com/Pradeeptalari14/tp-snowflake-warehouse)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `data-pipeline-design` | Design reliable batch or streaming data pipelines |
| `data-quality-contracts` | Introduce data contracts and automated quality checks |

## Commands

| Command | Purpose |
|---------|---------|
| `/data-engineer:pipeline-review` | Review a pipeline or DAG for idempotency, backfill safety and failure handling |
| `/data-engineer:data-contract` | Draft a data contract for a dataset from sample schema and usage |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install data-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
