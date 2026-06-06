# Infrastructure Deployment Guide

This guide details the steps required to compile, package, and deploy the portfolio platform to various hosting environments.

---

## ☁️ Option 1: GitHub Pages Deployment (Default)

The portfolio is set up with GitHub Actions pipelines to automatically compile and host the static files on GitHub Pages when pushed to the `main` branch.

1. **Commit and Push:**
   ```bash
   git add .
   git commit -m "feat: deploy portfolio updates"
   git push origin main
   ```
2. **Monitor Actions:** Go to your GitHub Repository -> **Actions** tab -> verify the `Deploy Portfolio to GitHub Pages` workflow succeeds.
3. **Custom Domain:** GitHub Pages configuration points to `CNAME` specifying `talaripradeep.info`.

---

## 🐳 Option 2: Containerized (Docker) Deployment

For deploying the portfolio site inside local virtual environments, VMs, or container registries:

1. **Build Docker Image:**
   ```bash
   docker build -t pradeep-portfolio:latest .
   ```
2. **Run Local Container:**
   ```bash
   docker run -d -p 8080:80 --name portfolio-site pradeep-portfolio:latest
   ```
3. **Verify App:** Access [http://localhost:8080](http://localhost:8080) in your web browser.

---

## ☸️ Option 3: Kubernetes Manifests Rollout

For deploying to production Kubernetes clusters:

1. **Create Namespace:**
   ```bash
   kubectl create namespace portfolio
   ```
2. **Apply Configurations:**
   ```bash
   kubectl apply -f infra/k8s/deployment.yaml
   ```
3. **Expose and Route:**
   ```bash
   kubectl apply -f infra/k8s/service.yaml
   kubectl apply -f infra/k8s/ingress.yaml
   kubectl apply -f infra/k8s/hpa.yaml
   ```

---

## ☸️ Option 4: Helm Chart Installation

For enterprise deployments managing releases through Helm charts:

1. **Lint Helm Chart:**
   ```bash
   helm lint infra/helm/portfolio
   ```
2. **Install or Upgrade Release:**
   ```bash
   helm upgrade --install portfolio infra/helm/portfolio --namespace portfolio --create-namespace
   ```
3. **Override Values dynamically:**
   ```bash
   helm upgrade --install portfolio infra/helm/portfolio \
     --namespace portfolio \
     --set replicaCount=5 \
     --set image.tag="v2.0.0"
   ```

---

## 🏗️ Option 5: AWS Static Pipeline (Terraform)

For hosting the platform completely on AWS S3 with CloudFront CDN proxy limits:

1. **Initialize Workspace:**
   ```bash
   cd infra/terraform
   terraform init
   ```
2. **Audit Execution Plan:**
   ```bash
   terraform plan -out=tfplan
   ```
3. **Deploy Assets Pipeline:**
   ```bash
   terraform apply tfplan
   ```
4. **Deploy static build assets to S3:** Build the site via `npm run build` and upload content of `dist/` directory directly into the S3 bucket output.
