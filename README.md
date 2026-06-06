# Talari Pradeep · Cloud & SRE Script Tools Portfolio
### 🌐 [talaripradeep.info](https://talaripradeep.info)

A personal portfolio website and interactive DevOps & SRE console hub for **Talari Pradeep** — Cloud & DevOps Engineer. 

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
├── Dockerfile               # Multi-stage production container setup
├── nginx.conf               # Production Nginx reverse proxy settings
├── vite.config.js           # Rollup and HTML bundler settings
├── README.md                # Project guideline entrypoint
└── CNAME                    # DNS routing identifier
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
* **[RUNBOOK.md](file:///d:/Domain/RUNBOOK.md):** SLA/SLO metrics checklists, fallback recovery steps, alert runbooks, and rollback procedures.
* **[TROUBLESHOOTING.md](file:///d:/Domain/TROUBLESHOOTING.md):** Diagnostics logs check for local browsers, CORS errors, Docker ports, and Kubernetes Pod crashes.
* **[SECURITY.md](file:///d:/Domain/SECURITY.md):** Vuln disclosure policies, client-side XSS standards, and secrets management.
* **[ONBOARDING.md](file:///d:/Domain/ONBOARDING.md):** Developer setup instructions for building new studios.
* **[API_DOCUMENTATION.md](file:///d:/Domain/API_DOCUMENTATION.md):** Reference documentation mapping SreCore framework methods and parameters.
