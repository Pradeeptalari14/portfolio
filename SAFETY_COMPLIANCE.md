# Portfolio Security, Legal Compliance & Architecture Governance

This document details the licensing status, security standards, regulatory alignment, and legal compliance structures implemented across all **341 interactive DevOps & SRE automation studios** and **6 flagship engineering platforms** hosted in this portfolio workspace.

---

## 1. Legal & Intellectual Property Rights

### Custom Code & Assets (Proprietary)
- **Copyright Status**: All custom-built studio HTML, CSS, JavaScript logic, simulation engines, and code-generation templates are **Copyright (c) 2026 Talari Pradeep. All rights reserved.**
- **Licensing Restrictions**: The project is governed by a **Proprietary License** (detailed in the root `LICENSE` file). Copying, modifying, distributing, or sub-licensing the proprietary portfolio layouts, templates, or generators without explicit written permission from the copyright holder is strictly prohibited.

### Third-Party Open Source Compliance
All open-source tools, runtime dependencies, and utility libraries referenced or loaded by the studios are handled strictly under their respective licensing terms:
1. **Apache 2.0 License**: Used by the **MLflow** SDK, **Valkey**, and tracking instrumentation. Apache 2.0 permits modification and commercial usage under standard patent grant and attribution requirements.
2. **MIT License**: Used by the **JSZip** library (compiles client-side project zip files), **Lucide Icons**, and **TailwindCSS** (CDN engine).
3. **SIL Open Font License (OFL)**: Used by fonts loaded via Google Fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`), allowing free personal and commercial web usage.
4. **PostgreSQL License & BSD 3-Clause**: Governing the PostgreSQL database, `pgvector`, and in-browser WASM SQLite engines deployed locally.

---

## 2. Secrets & Credentials Protection

### Zero Secret Leak Policy
- **No Hardcoded Secrets**: The repository contains **zero** hardcoded production API keys, authorization tokens, cloud service passwords, or private SSH/TLS keys.
- **Placeholder Standards**: Any references to HuggingFace tokens (`hf_...`), OpenAI keys (`sk-...`), AWS credentials (`AKIA...`), or database passwords utilize explicit mock placeholders (e.g. `YOUR_HF_TOKEN`, `AKIAIOSFODNN7EXAMPLE`) strictly inside instructions or mock test generation fixtures.
- **Automated Secret Filtering**: The [.gitignore](file:///d:/Domain/.gitignore) is configured to automatically exclude environment configuration files (`.env`, `.env.local`, `.env.*.local`), credential caches, and private key bundles from version control.

### SRE Security Design
All generated YAML manifests and scripts emitted by the studios enforce best-practice SRE security models:
- **Kubernetes Secret Bindings**: Generated configurations load sensitive environment variables using Kubernetes `Secret` namespaces and `valueFrom.secretKeyRef` bindings, preventing plain-text tokens inside workloads.
- **Docker Compose Environment Isolation**: Sensitive variables are mapped using `.env` file references or external secret managers (e.g., HashiCorp Vault) rather than hardcoded compose strings.
- **Network Interface Hardening**: Companion container definitions strictly bind service ports to the `127.0.0.1` loopback interface, preventing unauthorized exposure across public network interfaces.

---

## 3. Machine Learning & Model Licensing

- **No Weight Redistribution**: The portfolio **does not download, package, or distribute** large/small language model weights (such as Meta Llama, Google Gemma, Mistral, or Microsoft Phi).
- **Client-Side Model Fetching**: The generated bootstrapping scripts instruct the deployment environment to download base model weights directly from official sources (such as `ollama.com`, Hugging Face, or official Docker registries).
- **Model Terms of Use**: End users accept the respective model's Terms of Use (e.g., Llama 3 Community License, Mistral Commercial/Non-Commercial Terms, or Gemma Terms of Use) when executing the deployment scripts in their private cluster environments.

---

## 4. Dual Architecture & Zero-Attack-Surface Security

### Static Showcase Deployment (Production)
- **Zero Server-Side Attack Surface**: The public portfolio is deployed as a 100% static client-side bundle on GitHub Pages. It exposes no public server-side database endpoints, completely eliminating remote server-side SQL injection, unauthorized remote code execution, and backend database breach vectors.
- **Client-Side Input Sanitization**: All interactive components, Visual Flow Canvas topologies, search indices, and Command Palette queries strictly sanitize user-supplied input through HTML entity escaping, preventing DOM-based Cross-Site Scripting (XSS).

### Local Companion Backend (Optional Developer Service)
- **Local Sandbox Isolation**: For developers running the optional companion FastAPI backend locally (`backend/`), execution commands run in ephemeral Docker micro-containers configured with:
  - `network_mode="none"`: Complete network isolation preventing egress or SSRF.
  - `read_only=True`: Immutable root filesystem preventing disk tampering.
  - `mem_limit="512m"` & `pids_limit=64`: Hard resource ceilings mitigating denial-of-service and fork bombs.
  - `tini` init process: Zombie process harvesting.
  - Ephemeral `tmpfs` mounts with `noexec,nosuid` enforcement.
- **API Key Gating**: Administrative endpoints (`POST /api/studios`, `PATCH /api/studios/{id}`) and sandbox runners enforce optional `ADMIN_API_KEY` and `SANDBOX_API_KEY` header verification.

---

## 5. Regulatory Alignment & Audit Notice

> [!IMPORTANT]
> **Educational & Demonstration Notice**:
> Architectural references throughout this portfolio and its studios to regulatory and governance frameworks—including **SOC 2 Type II**, **HIPAA**, **PCI-DSS v4.0**, **GDPR**, **ISO/IEC 27001**, and India's **DPDP Act 2023**—represent engineering reference implementations, control pattern blueprints, and architectural design demonstrations.
> 
> They illustrate how modern SRE and DevSecOps pipelines can be constructed to satisfy technical control objectives (such as encryption in transit/rest, audit immutability, least privilege, and pseudonymization). They **do not** constitute certified legal compliance attestations, formal third-party audit opinions, or professional legal advice. Organizations deploying these patterns into production should perform independent compliance assessments and third-party audits.

---

## 6. Nominative Fair Use & Trademark Attribution

- All trademarks, service marks, trade names, trade dress, product names, and logos appearing on this site and within its studios are the property of their respective owners.
- References to specific commercial or open-source technologies (including **Amazon Web Services (AWS)**, **Microsoft Azure**, **Google Cloud Platform (GCP)**, **Docker**, **Kubernetes**, **Terraform**, **HashiCorp Vault**, **ArgoCD**, **Prometheus**, **Grafana**, **OpenTelemetry**, **Istio**, **MLflow**, **Ollama**, **Meta Llama**, and others) are made strictly for **nominative fair use**, educational identification, interoperability demonstrations, and systems architecture modeling.
- The use of these trademarks does not imply any affiliation with, sponsorship of, or endorsement by their respective trademark owners.

---

## 7. Vulnerability Disclosure & Responsible Reporting

Security and platform integrity are top priorities. If you discover a potential security vulnerability, bug, or compliance issue in any part of this repository:
- **Contact**: Reach out directly via email to `pradeeptalari14@gmail.com` with reproduction steps and details.
- **Response**: Inquiries will be reviewed and addressed promptly within 48 hours.
- **Responsible Disclosure**: Please allow a reasonable remediation window prior to public disclosure.
