# 🧩 Backend Engineer

API design, resilience patterns, idempotency, caching and service boundaries.

**Group:** Security, Quality & Application  
**Typical tools:** FastAPI, Node.js, Go, PostgreSQL, Redis

## Real-World Production Scenario & Impact

- **Production Scenario:** Distributed Circuit Breaking: Implements adaptive rate-limiting and fallback caching to isolate cascading third-party payment gateway failures.
- **Measurable Business Gain:** Ensures 100% uptime for core browsing and cart features even during complete downstream API outages.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Local Cloud Microservices Studio](https://talaripradeep.info/tools/local-cloud-dev/)
- **Hands-On Learn Drill:** [Circuit Breaking & API Contract Design](https://talaripradeep.info/studios/learn/?studio=local-cloud-dev)
- **Visual Architecture Flow:** [High-Throughput Microservice Architecture](https://talaripradeep.info/studios/flow/?template=backend)
- **Production Repository:** [Pradeeptalari14/tp-local-cloud-dev](https://github.com/Pradeeptalari14/tp-local-cloud-dev)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `api-design` | Design consistent, evolvable HTTP APIs |
| `resilience-patterns` | Make service-to-service calls resilient |

## Commands

| Command | Purpose |
|---------|---------|
| `/backend-engineer:api-review` | Review an API spec for consistency, safety and evolvability |
| `/backend-engineer:resilience-audit` | Audit a service dependency map for timeouts, retries and failure isolation |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install backend-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
