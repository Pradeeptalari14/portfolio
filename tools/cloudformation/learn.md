# AWS CloudFormation Studio

> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**

| Property | Value |
|---|---|
| **Domain** | `Cloud Infrastructure & K8s` |
| **Category** | `CLOUD` |
| **Skill Level** | `Level 2 (Scripting & Ops)` |
| **Target SRE Metric** | `100% S3 Remote State Locking & Sub-3m VPC Deployment Time` |
| **Artifact Target** | `template.yaml` |
| **Source Repository** | [Pradeeptalari14/tp-cloudformation](https://github.com/Pradeeptalari14/tp-cloudformation) |
| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |

---

## 1. Overview & Architectural Mission

Orchestrate full AWS stacks dynamically. Generate YAML/JSON templates for VPCs, EC2 instances, ECS clusters, S3 buckets, IAM roles, ELB load balancers, CloudWatch metrics, and Route53 DNS records.

### Core Production Use Case
Managing multi-region cloud topology, subnet CIDR allocations, and VPC peering connections declaratively without state corruption in AWS CloudFormation Studio.

```mermaid
flowchart LR
    A[Learn: Mental Model] --> B[Lab: Interactive Studio]
    B --> C[Flow: Architectural Diagram]
    C --> D[Troubleshoot: SRE Failure Drill]
    D --> E[Real Project: GitHub Repo]
```

---

## 2. Best Architectural Treatment vs. Anti-Pattern

### Recommended Production Practice
> [!TIP]
> Store remote state in S3/GCS with DynamoDB state locking, enforce pre-merge terraform plan approval gates, and run daily drift scanners.

### Dangerous Anti-Pattern to Avoid
> [!WARNING]
> Applying Terraform changes locally from developer laptops with shared static credentials or unencrypted local state files.

---

## 3. Real-Time SRE Incident Drill

**Target Failure Mode:**
terraform init && terraform plan -out=tfplan && terraform show -json tfplan | jq .resource_changes

### Drill Execution Checklist
1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.
2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.
3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.
4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.
5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.

---

## 4. Production Configuration & Code Artifact (`template.yaml`)

```yaml
# Production Manifest: AWS CloudFormation Studio
# Domain: Cloud Infrastructure & K8s
# Target Artifact: template.yaml
# Target SRE Standard: 100% S3 Remote State Locking & Sub-3m VPC Deployment Time
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aws-cloudformation-studio
  namespace: production
  labels:
    app.kubernetes.io/name: aws-cloudformation-studio
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "100% S3 Remote State Locking & Sub-3m VPC Deployment Time"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: aws-cloudformation-studio
  template:
    metadata:
      labels:
        app: aws-cloudformation-studio
    spec:
      containers:
        - name: core
          image: ghcr.io/pradeeptalari14/tp-cloudformation:v1.0.0
          imagePullPolicy: IfNotPresent
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2000m"
              memory: "4Gi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
```

---

## 5. Navigation & Next Steps

- **Interactive Simulator:** [Open AWS CloudFormation Studio Studio](./index.html)
- **Web Learning View:** [Interactive Guide](./learn.html)
- **GitHub Project Repository:** [Pradeeptalari14/tp-cloudformation](https://github.com/Pradeeptalari14/tp-cloudformation)
- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)

