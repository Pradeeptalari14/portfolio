# Developer Onboarding & Contribution Guide

Welcome to the DevOps & SRE Script Tools portfolio repository! This guide will help you set up your local workspace and explain how to add new interactive studios.

---

## 💻 1. Local Workspace Setup

### Prerequisites
* **Node.js:** version 20.x or higher installed.
* **NPM:** version 10.x or higher installed.

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/Pradeeptalari14/portfolio.git
cd portfolio

# Install development node packages
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
Vite will compile files dynamically and host the local hot-reloaded dev server at [http://localhost:5173](http://localhost:5173).

---

## 🧪 2. Quality Assurance & Testing

### Run Tests Suite
We utilize Vitest + JSDOM to simulate DOM nodes parsing and event timelines:
```bash
npm test
```

### Build Verification
Before staging changes, compile a production bundle locally:
```bash
npm run build
```
Verify that the bundler outputs build files in the `dist/` directory without syntax warnings.

---

## 🏗️ 3. How to Add a New Studio

To add a new interactive generator studio to the launcher dashboard, follow these steps:

### Step 1: Register in `tools/tools.json`
Add a new metadata record configuration to [tools/tools.json](file:///d:/Domain/tools/tools.json) matching your studio info:
```json
  {
    "title": "New Kubernetes Operator Studio",
    "desc": "Orchestrate custom operator controllers. Generate Go structs, CRD manifests, and deployment specs.",
    "category": "cloud",
    "icon": "☸️",
    "color": "rgb(50, 108, 229)",
    "borderClass": "",
    "bgClass": "",
    "tag": "controller.go",
    "link": "k8s-operator/"
  }
```

### Step 2: Create Studio HTML File
Create a new directory under `tools/` (e.g. `tools/k8s-operator/index.html`) using HTML templates:
```html
<head>
  <!-- Load SreCore UI Library helper -->
  <script src="../../src/js/core-tool.js"></script>
</head>
```

### Step 3: Create Generator Script
Create your generator script under `src/js/generators/` (e.g. `src/js/generators/k8s-operator-gen.js`). Utilize `window.SreCore` APIs for tab routing and simulation logs to maintain shared core compliance.

### Step 4: Register Entry Point
Add the index file path to `vite.config.js` under `build.rollupOptions.input` so Vite bundles it:
```javascript
k8soperator: resolve(__dirname, 'tools/k8s-operator/index.html')
```
