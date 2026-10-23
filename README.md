# Talari Pradeep · AI Infrastructure & Platform Engineering Portfolio
### 🌐 [talaripradeep.info](https://talaripradeep.info)

A personal portfolio website and interactive DevOps, MLOps, & AI Infrastructure console hub for **Talari Pradeep** — AI Infrastructure & Platform Engineer. 

Features **77 interactive code generators** (SRE, pipelines, infrastructure provisioning, and container setups) served dynamically from a client-side JSON database.

---

## 🏗️ Architectural Framework

The platform is designed around zero runtime server overhead:
* **Core Logic:** HTML5, Vanilla JavaScript, and Vanilla CSS design tokens.
* **Central Card Database:** [tools/tools.json](file:///d:/Domain/tools/tools.json) holds the schema configurations for all interactive cards, compiled at DOM load.
* **Shared UI Core:** [src/js/core-tool.js](file:///d:/Domain/src/js/core-tool.js) handles sandboxed logging, visual tabs, and clipboard write handlers.

Detailed information can be found in the [ARCHITECTURE.md](file:///d:/Domain/ARCHITECTURE.md) document.

---

## 📁 Repository Directory Map

```
Domain/
├── .github/workflows/       # CI/CD pipelines
│   ├── deploy.yml           # GitHub Pages auto-deploy
│   └── security-scan.yml    # Gitleaks, Trivy, and npm audit scans
├── infra/                   # Infrastructure as Code (IaC) configurations
│   ├── terraform/           # AWS S3 and CloudFront hosting tf configs
│   ├── k8s/                 # Kubernetes Deployment, Service, Ingress, HPA
│   ├── helm/portfolio/      # Parameterized Helm deployment chart
│   └── monitoring/          # Prometheus targets & Grafana dashboards
├── src/js/                  # Frontend core script directories
│   ├── core-tool.js         # Shared SRE UI helpers library
│   └── generators/          # Individual tool generator scripts
├── tests/                   # JSDOM unit test scripts
├── tools/                   # Interactive console studio layouts
│   ├── tools.json           # Unified card database schema
│   └── index.html           # Main tools grid dashboard launcher
├── plugins/                 # Claude Code & Cowork Engineering Plugins Marketplace
│   ├── engineers/           # 24 engineer-role plugins (48 skills, 48 slash commands)
│   ├── anthropic/           # 17 knowledge-work plugins (vendored Apache-2.0)
│   └── catalog.json         # Unified machine-readable plugin manifest
├── Dockerfile               # Multi-stage production container setup
├── nginx.conf               # Production Nginx reverse proxy settings
├── vite.config.js           # Rollup and HTML bundler settings
├── README.md                # Project guideline entrypoint
└── CNAME                    # DNS routing identifier
```

---

## 🧩 Claude Plugins Marketplace
### 🌐 [talaripradeep.info/plugins/](https://talaripradeep.info/plugins/)

Turn Claude Code & Cowork into dedicated engineering specialists across **41 production plugins**:
* **24 Engineer Roles:** SRE, DevOps, Platform, Cloud, Kubernetes, IaC, Observability, Network, Database, FinOps, Incident Commander, Release, DevSecOps, AppSec, Compliance, QA, Performance, Backend, MLOps, LLMOps, AI Infra, RAG, Agent, and Data Engineers (48 skills, 48 slash commands).
* **17 Knowledge-Work Plugins:** First-party tools vendored from [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) under Apache-2.0.

```bash
# Add the marketplace
claude plugin marketplace add Pradeeptalari14/portfolio

# Install any plugin
claude plugin install sre-engineer@talari-engineering-plugins
```

---

## 🛠️ Local Setup & Commands

### Prerequisites
* Node.js v20+ and NPM v10+

### Install Packages
```bash
npm install
```

### Start Development Mode
```bash
npm run dev
```

### Compile Production Build
```bash
npm run build
```

### Run Automated Unit Tests
```bash
npm test
```

---

## 🐋 Production Operations

For complete step-by-step guidance on running, upgrading, and maintaining the platform, refer to these operational references:
* **[DEPLOYMENT.md](file:///d:/Domain/DEPLOYMENT.md):** Guides detailing GitHub Pages, Docker runs, Kubernetes, Helm rollouts, and AWS pipelines.
* **[DEVSECOPS_PORTFOLIO_GUIDE.md](file:///d:/Domain/DEVSECOPS_PORTFOLIO_GUIDE.md):** DevSecOps Supply Chain Architecture, Sigstore Cosign SLSA Provenance, and in-kernel Tetragon runtime enforcement.
* **[GITHUB_PROVISIONING_GUIDE.md](file:///d:/Domain/GITHUB_PROVISIONING_GUIDE.md):** Provisioning & execution matrix for Developer Studios repositories.
* **[RUNBOOK.md](file:///d:/Domain/RUNBOOK.md):** SLA/SLO metrics checklists, fallback recovery steps, alert runbooks, and rollback procedures.
* **[TROUBLESHOOTING.md](file:///d:/Domain/TROUBLESHOOTING.md):** Diagnostics logs check for local browsers, CORS errors, Docker ports, and Kubernetes Pod crashes.
* **[SECURITY.md](file:///d:/Domain/SECURITY.md):** Vuln disclosure policies, client-side XSS standards, and secrets management.
* **[ONBOARDING.md](file:///d:/Domain/ONBOARDING.md):** Developer setup instructions for building new studios.
* **[API_DOCUMENTATION.md](file:///d:/Domain/API_DOCUMENTATION.md):** Reference documentation mapping SreCore framework methods and parameters.
