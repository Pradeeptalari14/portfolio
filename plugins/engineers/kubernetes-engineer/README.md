# ⎈ Kubernetes Engineer

Workload hardening, resource tuning and systematic cluster troubleshooting.

**Group:** Infrastructure & Reliability  
**Typical tools:** kubectl, Helm, Kyverno, Karpenter, Cilium

## Real-World Production Scenario & Impact

- **Production Scenario:** Cluster-Wide Node Pressure: Custom CRD controller dynamically drains tainted spot nodes and re-schedules workloads with topology spread constraints.
- **Measurable Business Gain:** Zero customer-facing downtime during spot instance preemption; 35% compute cost savings.

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [Kubernetes Cluster Studio](https://talaripradeep.info/tools/kubernetes/)
- **Hands-On Learn Drill:** [Workload Hardening & CrashLoop Triage](https://talaripradeep.info/studios/learn/?studio=kubernetes)
- **Visual Architecture Flow:** [Kubernetes Cluster Ecosystem](https://talaripradeep.info/studios/flow/?template=k8sEcosystem)
- **Production Repository:** [Pradeeptalari14/tp-kubernetes](https://github.com/Pradeeptalari14/tp-kubernetes)

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
| `workload-hardening` | Harden Kubernetes workloads for security and resilience |
| `cluster-troubleshooting` | Diagnose failing pods, nodes and networking in a systematic order |

## Commands

| Command | Purpose |
|---------|---------|
| `/kubernetes-engineer:manifest-audit` | Audit Kubernetes manifests against a production-readiness checklist |
| `/kubernetes-engineer:k8s-debug` | Walk through a structured diagnosis for a failing pod or service |

## Install

```
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install kubernetes-engineer@talari-engineering-plugins
```

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
