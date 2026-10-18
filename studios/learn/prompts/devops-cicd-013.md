# Create a build artifact provenance checklist

**ID:** `devops-cicd-013`  
**Category:** DevOps & CI/CD  
**Difficulty:** `Advanced`  
**Tags:** `#provenance` `#SLSA` `#attestation` `#supply chain`  

---

## Overview

Improve traceability from source commit to released artifact.

**Objective:** Define the metadata and verification needed to establish where a build came from.

## Prerequisites

- Build platform and artifact registry are known.
- Release integrity requirements and available signing/attestation tools are identified.

## Prompt Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `BUILD_PLATFORM` | **Yes** | Build system | `GitHub Actions` |
| `ARTIFACT_TYPE` | **Yes** | Artifact being released | `OCI container image` |
| `REGISTRY` | **Yes** | Artifact registry | `GHCR or approved internal registry` |
| `ATTESTATION_STANDARD` | **No** | Available provenance format | `SLSA-aligned provenance where supported` |

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
> Do not claim an artifact is signed, trusted, or compliant without verification evidence.

> [!IMPORTANT]
> Protect signing identities and avoid exposing private signing material to build scripts.

> [!IMPORTANT]
> Do not use provenance as a substitute for source review and vulnerability management.

## Example Input

```json
{
  "BUILD_PLATFORM": "GitHub Actions",
  "ARTIFACT_TYPE": "OCI container image",
  "REGISTRY": "Approved container registry",
  "ATTESTATION_STANDARD": "SLSA-aligned provenance where supported"
}
```

## Copyable Prompt Template

```text
Create an artifact provenance and verification plan for BUILD_PLATFORM producing ARTIFACT_TYPE in REGISTRY. Preferred standard/tooling: ATTESTATION_STANDARD if supplied. Specify source commit, workflow identity, builder identity, dependency metadata, artifact digest, signature/attestation generation, storage, verification policy, and release gate. Distinguish what the platform supports natively from optional tooling. Provide example commands only as reviewable examples and explain trust roots and key handling. Do not claim verification has passed without actual output.
```

## Expected Output

1. Provenance data model and trust boundaries.
1. Build and verification workflow outline.
1. Example verification procedure with placeholders.
1. Threat model, operational ownership, and failure policy.

## Validation Criteria

- [ ] Artifact is referenced by immutable digest.
- [ ] Provenance binds source revision and builder identity.
- [ ] Verification fails for missing or invalid evidence.
- [ ] Signing credentials are isolated from untrusted code.

## Troubleshooting & Diagnostics

### Symptom: Attestation verification fails

**Checks to perform:**
- Confirm subject digest matches the downloaded artifact.
- Check signer identity, trust root, issuer, and predicate type.

**Recommended next step:** Resolve identity or digest mismatch; do not bypass verification for release.

### Symptom: Provenance exists but cannot be trusted

**Checks to perform:**
- Review who can modify the workflow and who controls the signing identity.
- Check whether untrusted pull requests can access privileged credentials.

**Recommended next step:** Restrict workflow changes, isolate credentials, and define an independently enforced verification policy.

## Related Learning & Studio Workspaces

- **Learn:** [Software supply-chain security](/tools/software-supply-chain/learn.html)
- **Lab:** [Verify build provenance](/tools/verify-build-provenance/learn.html)
- **Workflow:** [Source to verified artifact](/tools/source-to-verified-artifact/learn.html)

