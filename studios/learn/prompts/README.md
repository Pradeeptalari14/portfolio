# DevOps & CI/CD Prompt Engineering Library

A production-grade collection of verified, safety-constrained prompt templates for DevOps, Site Reliability Engineering, and CI/CD operations.

All templates enforce least privilege, input validation, human-in-the-loop review gates, and explicit safety constraints.

## Catalog Index

| ID | Title | Difficulty | Summary | Markdown Guide |
|---|---|:---:|---|:---:|
| `devops-cicd-001` | **Build a beginner-friendly CI/CD pipeline** | `Beginner` | Create a minimal pipeline from commit to test and build, with clear explanations. | [View .md](./devops-cicd-001.md) |
| `devops-cicd-002` | **Debug a failed GitHub Actions workflow** | `Beginner` | Triage a failed workflow using evidence rather than guessing. | [View .md](./devops-cicd-002.md) |
| `devops-cicd-003` | **Create a secure pull-request validation pipeline** | `Intermediate` | Validate code changes before merge while protecting repository secrets. | [View .md](./devops-cicd-003.md) |
| `devops-cicd-004` | **Add dependency caching without stale-build risk** | `Intermediate` | Speed up builds while keeping cache keys correct and safe. | [View .md](./devops-cicd-004.md) |
| `devops-cicd-005` | **Build and publish a container image securely** | `Intermediate` | Create a reproducible container build and a controlled image-publishing stage. | [View .md](./devops-cicd-005.md) |
| `devops-cicd-006` | **Add software composition analysis and secret scanning** | `Intermediate` | Integrate dependency and secret checks with actionable failure policies. | [View .md](./devops-cicd-006.md) |
| `devops-cicd-007` | **Design a safe deployment promotion workflow** | `Advanced` | Promote the same artifact through environments with approvals and rollback planning. | [View .md](./devops-cicd-007.md) |
| `devops-cicd-008` | **Implement canary or blue-green release planning** | `Advanced` | Compare rollout strategies and define measurable promotion and rollback gates. | [View .md](./devops-cicd-008.md) |
| `devops-cicd-009` | **Generate a release checklist and change record** | `Beginner` | Turn release details into a consistent, auditable checklist. | [View .md](./devops-cicd-009.md) |
| `devops-cicd-010` | **Measure DORA-style delivery performance** | `Intermediate` | Define reliable delivery metrics without gaming the numbers. | [View .md](./devops-cicd-010.md) |
| `devops-cicd-011` | **Create a reusable CI workflow template** | `Intermediate` | Standardize common pipeline stages while preserving safe customization. | [View .md](./devops-cicd-011.md) |
| `devops-cicd-012` | **Investigate flaky automated tests** | `Intermediate` | Separate product defects, environment instability, and test-design problems. | [View .md](./devops-cicd-012.md) |
| `devops-cicd-013` | **Create a build artifact provenance checklist** | `Advanced` | Improve traceability from source commit to released artifact. | [View .md](./devops-cicd-013.md) |
| `devops-cicd-014` | **Optimize slow CI pipelines using evidence** | `Intermediate` | Find the largest sources of pipeline delay before changing the design. | [View .md](./devops-cicd-014.md) |
| `devops-cicd-015` | **Generate an incident-ready CI/CD runbook** | `Beginner` | Document safe first-response steps for pipeline or release failures. | [View .md](./devops-cicd-015.md) |

## Core Experience Loop

```mermaid
flowchart LR
    A[Learn: Prompt Template] --> B[Lab: Interactive Studio]
    B --> C[Flow: Architecture Visualizer]
    C --> D[Troubleshoot: Failure Injection Drill]
    D --> E[Real Project: GitHub Repository]
```

---
*Maintained as part of the Talari Pradeep Interactive Studios Platform.*
