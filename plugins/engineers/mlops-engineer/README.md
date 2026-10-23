# 🧪 MLOps Engineer

Reproducible training pipelines, model registry, deployment gates and drift monitoring.

**Group:** AI & Data  
**Typical tools:** MLflow, Kubeflow, DVC, KServe, Evidently

## Real-World Production Scenario & Impact

- **Production Scenario:** Automated Model Retraining: Detects statistical covariate shift in fraud detection model; triggers Kubeflow pipeline for retraining and canary deployment.
- **Measurable Business Gain:** Reduces model degradation detection time from 2 weeks to 15 minutes; protects against fraudulent transactions.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [MLflow Tracking & Model Registry Studio](https://talaripradeep.info/tools/mlflow/)
- **Hands-On Learn Drill:** [Kubeflow Pipelines & Drift Detection](https://talaripradeep.info/studios/learn/?studio=mlflow)
- **Visual Architecture Flow:** [ML Pipeline & Model Registry](https://talaripradeep.info/studios/flow/?template=rag)
- **Production Repository:** [Pradeeptalari14/tp-mlflow](https://github.com/Pradeeptalari14/tp-mlflow)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `ml-pipeline-design` | Design reproducible training and deployment pipelines for machine learning |
| `model-monitoring` | Monitor deployed models for data drift, concept drift and performance decay |

## Commands

| Command | Purpose |
|---------|---------|
| `/mlops-engineer:pipeline-blueprint` | Generate an end-to-end ML pipeline blueprint for a use case |
| `/mlops-engineer:drift-report` | Analyse reference and current data summaries for drift and recommend actions |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install mlops-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
