# Build and publish a container image securely

**ID:** `devops-cicd-005`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Intermediate`  
**Tags:** `#Docker` `#container registry` `#image scanning` `#supply chain`  

---

## Overview

Create a reproducible container build and a controlled image-publishing stage.

**Objective:** Design a pipeline that tests, builds, scans, and publishes an image only under approved conditions.

## Prerequisites

- Dockerfile and application build steps are known.
- Container registry and image naming convention are documented.
- A non-production test registry or dry-run plan is available.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `CI_PLATFORM` | **Yes** | CI provider | `GitHub Actions` |
| `IMAGE_NAME` | **Yes** | Registry image name | `ghcr.io/example/sample-api` |
| `DOCKERFILE_PATH` | **Yes** | Dockerfile location | `./Dockerfile` |
| `TARGET_BRANCH` | **Yes** | Publishing branch or tag rule | `main and version tags` |
| `SCANNER` | **No** | Container scanner | `Trivy` |

## Safety Constraints & Guardrails

> [!IMPORTANT]
> Do not include secrets, tokens, passwords, private keys, customer data, or production identifiers in prompts, logs, examples, or generated files.

> [!IMPORTANT]
> Assume all changes are proposed until a human reviews and explicitly approves them; do not execute deployments or destructive commands.

> [!IMPORTANT]
> Prefer least-privilege permissions, pinned or verified dependencies, and reproducible builds.

> [!IMPORTANT]
> Clearly separate facts from assumptions and identify any missing context instead of inventing environment details.

> [!IMPORTANT]
> Never embed registry credentials in Docker build arguments or image layers.

> [!IMPORTANT]
> Pin base images by digest where operationally appropriate and explain update policy.

> [!IMPORTANT]
> Publish only from trusted events; do not grant registry write credentials to untrusted pull requests.

> [!IMPORTANT]
> Do not push to a production registry during demonstration.

## Example Input

```json
{
  "CI_PLATFORM": "GitHub Actions",
  "IMAGE_NAME": "ghcr.io/example/sample-api",
  "DOCKERFILE_PATH": "./Dockerfile",
  "TARGET_BRANCH": "main and version tags",
  "SCANNER": "Trivy"
}
```

## Copyable Prompt Template

```text
Create a secure container CI pipeline for IMAGE_NAME using CI_PLATFORM and DOCKERFILE_PATH. Publish eligibility: TARGET_BRANCH. Scanner: SCANNER if supplied. Include tests, image build, metadata/tags, vulnerability scan, artifact provenance or equivalent available controls, registry authentication using the platform's secret mechanism, and a non-production validation procedure. Use least privilege and explain trusted versus untrusted events. Do not perform a real push; clearly mark the command that an authorized operator would run.
```

## Expected Output

1. Stage flow from source to scanned image.
1. Complete workflow example with placeholders.
1. Image tagging and credential handling guidance.
1. Local/dry-run validation and registry verification steps.

## Validation Criteria

- [ ] Image builds reproducibly from the documented context.
- [ ] Scanner results have an explicit severity policy and exception process.
- [ ] Untrusted PRs cannot publish images.
- [ ] Image tags are traceable to a commit or release.

## Troubleshooting & Diagnostics

### Symptom: Registry authentication fails

**Checks to perform:**
- Verify registry hostname, username/token type, scope, and expiry without printing the token.
- Confirm the job is a trusted publishing event.

**Recommended next step:** Rotate an exposed credential if necessary and retry with a least-privilege token.

### Symptom: Image scan fails the pipeline

**Checks to perform:**
- Review vulnerability severity, fix availability, base-image age, and affected package.
- Confirm scanner database/update access.

**Recommended next step:** Upgrade or mitigate affected packages; document time-bound exceptions with an owner rather than silently suppressing findings.

## Related Learning & Studio Workspaces

- **Learn:** [Container CI security](/tools/container-ci-security/learn.html)
- **Lab:** [Build and scan an image](/tools/build-scan-image/learn.html)
- **Workflow:** [Source to registry](/tools/source-to-container-registry/learn.html)
- **Repository:** [Secure image pipeline](/tools/secure-container-pipeline/learn.html)

