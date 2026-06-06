# Cloud Migration & Deployment Strategy Guide

This guide provides a decision-making framework, migration instructions, and architecture options for hosting the portfolio website, helping you decide when to transition from free hosting to cloud infrastructure.

---

## 🚦 Decision Framework: When to Migrate?

```mermaid
graph TD
    A[Start: Website on GitHub Pages] --> B{Need Backend API or DB?}
    B -->|Yes| C[Option 3: Kubernetes / Helm on EKS]
    B -->|No| D{Need Custom Edge Rules / WAF / Traffic Logs?}
    D -->|Yes| E[Option 2: AWS S3 + CloudFront CDN]
    D -->|No| F[Option 1: Keep on GitHub Pages (Recommended)]
```

---

## 🏗️ Deployment Architecture Options

### Option 1: Static Hosting via GitHub Pages (Current Setup)
* **Best For:** Personal portfolio, resume hosting, and static interactive studio simulations.
* **Monthly Cost:** **$0.00** (Free).
* **Maintenance Overhead:** **$0.00** (Zero servers to manage, automated deployments on git push).
* **SSL:** Auto-renewing certificates via Let's Encrypt.

### Option 2: Serverless Static CDN via AWS S3 + CloudFront
* **Best For:** When you want custom request header filtering, detailed visitor geographic logs, or a Web Application Firewall (WAF) to block bots.
* **Monthly Cost:** **~$0.50** (Standard Route53 Hosted Zone query fees, bandwidth falls inside Free Tier).
* **How to deploy:**
  1. Initialize and apply the Terraform modules in your repo:
     ```bash
     cd infra/terraform
     terraform init
     terraform apply
     ```
  2. Build and sync assets to S3 bucket output:
     ```bash
     npm run build
     aws s3 sync ../../dist s3://YOUR-BUCKET-NAME
     ```

### Option 3: Container Orchestration via Kubernetes (EKS / EC2)
* **Best For:** Expanding the website to run server-side workloads (e.g. Node.js backend, Python machine learning scripts, user databases) or as a live DevOps showcase project.
* **Monthly Cost:** **~$153.00 / month** (EKS plane + EC2 instance capacity).
* **How to deploy:**
  1. Build the production Docker container:
     ```bash
     docker build -t portfolio:latest .
     ```
  2. Deploys container to cluster namespace using the Helm chart:
     ```bash
     helm upgrade --install portfolio infra/helm/portfolio --create-namespace --namespace portfolio
     ```
