# 🚀 Enterprise Forward Deployed Engineer (FDE) AI Systems Deployer (`tp-fde-enterprise-deployer`)

> **Production-grade engineering framework for Forward Deployed Engineers (FDEs)** bridging raw AI models and enterprise production environments. Built to discover real business problems, architect agentic MCP workflows, deploy into air-gapped private VPCs, and enforce continuous evaluation, observability, and safety.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Air--Gapped%20EKS-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![Model Context Protocol](https://img.shields.io/badge/MCP-JSON--RPC%202.0-8A2BE2)](https://modelcontextprotocol.io)
[![OWASP LLM Top 10](https://img.shields.io/badge/Security-OWASP%20LLM01--10-critical)](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
[![Evaluations](https://img.shields.io/badge/Evals-Ragas%20%26%20DeepEval-10b981)](https://docs.ragas.io)

---

## 🏛️ What is a Forward Deployed Engineer (FDE)?

A **Forward Deployed Engineer (FDE)** is a high-leverage hybrid role combining:
- **Software Engineering:** Writing clean, scalable Python/TypeScript services, robust APIs, and deterministic integration layers.
- **AI Systems Engineering:** Structuring agentic swarms, stateful graphs (LangGraph), MCP tool calling, vector search, and local SLM inference (vLLM/Ollama).
- **Product Thinking & Discovery:** Directly interviewing client stakeholders, translating messy business complaints into quantifiable requirements, and scoping ROI.
- **Technical Consulting:** Aligning with client CISOs, compliance officers, and enterprise architects to pass strict security reviews.
- **Customer Production Deployment:** Packaging systems into air-gapped VPCs, writing Kubernetes Helm charts, configuring zero-egress NetworkPolicies, and establishing Day-2 SRE alerting.

```
┌────────────────────────────────────────────────────────────────────────┐
│             FORWARD DEPLOYED ENGINEER (FDE) LIFECYCLE                  │
└────────────────────────────────────────────────────────────────────────┘
        │
        ▼
[ 1. Discovery & Problem Framing ] ──► Map business bottleneck & create Golden Dataset
        │
        ▼
[ 2. Solution Architecture ]       ──► Multi-Agent LangGraph + MCP Tool Registry
        │
        ▼
[ 3. Air-Gapped VPC Deployment ]   ──► Private K8s, Helm, Local vLLM, Zero-Egress NetPol
        │
        ▼
[ 4. Safety & Evals Gate ]         ──► OWASP Shield, Presidio PII Scrub, Ragas (Faithfulness >95%)
        │
        ▼
[ 5. Production Handover & SOW ]   ──► SRE Runbooks, Prometheus alerts, Client enablement
```

---

## 📁 Repository Directory Structure

```text
tp-fde-enterprise-deployer/
├── core/
│   ├── __init__.py
│   ├── pipeline.py                 # Core production agentic pipeline
│   ├── mcp_bridge.py               # Model Context Protocol JSON-RPC router
│   └── security_shield.py          # OWASP LLM guardrails & Presidio PII redaction
├── deploy/
│   ├── helm/
│   │   ├── Chart.yaml              # Kubernetes Helm packaging
│   │   ├── values.yaml             # Hardened air-gapped values
│   │   └── templates/
│   │       ├── deployment.yaml     # Non-root pod specification
│   │       └── netpol.yaml         # Zero-egress network isolation
│   └── docker-compose.enterprise.yml # Client local staging sandbox
├── evals/
│   ├── golden_set.json             # 100 enterprise client validation scenarios
│   └── test_acceptance_evals.py    # Automated Ragas/DeepEval benchmark
├── docs/
│   ├── FDE_FIELD_PLAYBOOK.md       # Step-by-step client engagement field manual
│   └── SOW_TEMPLATE.md             # Enterprise Statement of Work template
└── README.md
```

---

## ⚡ Quickstart: Local Enterprise Client Sandbox

### 1. Clone & Bootstrap
```bash
git clone https://github.com/Pradeeptalari14/tp-fde-enterprise-deployer.git
cd tp-fde-enterprise-deployer
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run Local Air-Gapped Simulation
```bash
docker compose -f deploy/docker-compose.enterprise.yml up -d
python3 core/pipeline.py --client enterprise-acme --query "Audit claim #9410"
```

### 3. Run Automated Acceptance Evals
```bash
pytest -v evals/test_acceptance_evals.py --threshold-faithfulness 0.95
```

---

## 🛡️ Enterprise Compliance & Security Matrix

| Compliance Domain | Implementation | Verification Method |
| :--- | :--- | :--- |
| **Air-Gap Egress** | Deny all `0.0.0.0/0` outbound traffic | Cilium eBPF network probe |
| **PII Redaction** | Local Microsoft Presidio + regex filters | 0 SSN / credit cards leaked in logs |
| **Prompt Injection** | Sub-reflex heuristic regex + embedding gate | Blocked within `<4ms` before LLM invocation |
| **Auditability** | Ed25519 cryptographic response signatures | Verifiable immutable audit trail |

---

## 🔗 Connected Studios & Learning Paths

- **Interactive Studio:** [Forward Deployed Engineer AI Systems Studio](https://talaripradeep.info/tools/forward-deployed-engineer/)
- **Learning Journey:** [Track 05: Forward Deployed AI Engineer](https://talaripradeep.info/learning/)
- **Developer Studios Hub:** [Studios Learn Hub](https://talaripradeep.info/studios/learn/)
- **Interview Vault:** [FDE Technical Defense Drills](https://talaripradeep.info/interview/)

---

## 📄 License
MIT License. Maintained by [Talari Pradeep](https://talaripradeep.info).
