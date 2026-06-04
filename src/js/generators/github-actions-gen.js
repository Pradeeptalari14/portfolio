import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'pipeline';

    let compiledCode = {
      pipeline: '',
      sonar: '',
      readme: ''
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      setupCompilerTriggers(triggerCompileAll);
    }

    function triggerCompileAll() {
      compilePipeline();
      compileSonar();
      compileReadme();
      updateViewportContent();
    }

    function compilePipeline() {
      const lang = $('gh_lang').value;
      const branches = $('gh_branch').value.split(',').map(b => b.trim()).filter(Boolean);
      const isPush = $('trigger_push').checked;
      const isPR = $('trigger_pr').checked;

      const isTrivy = $('scan_trivy').checked;
      const isSnyk = $('scan_snyk').checked;
      const isSonar = $('scan_sonar').checked;

      const isAWS = $('deploy_aws').checked;
      const isGCP = $('deploy_gcp').checked;
      const isDocker = $('push_docker').checked;

      let code = `# .github/workflows/ci.yml\nname: Enterprise CI/CD Pipeline\n\non:\n`;
      
      if (isPush && branches.length > 0) {
        code += `  push:\n    branches:\n`;
        branches.forEach(b => {
          code += `      - "${b}"\n`;
        });
      }
      if (isPR && branches.length > 0) {
        code += `  pull_request:\n    branches:\n`;
        branches.forEach(b => {
          code += `      - "${b}"\n`;
        });
      }

      code += `\njobs:\n`;

      // 1. Build and Test Job
      code += `  build-and-test:\n    runs-on: ubuntu-latest\n    steps:\n`;
      code += `      - name: Checkout Source Code\n        uses: actions/checkout@v4\n\n`;

      if (lang === 'node') {
        code += `      - name: Setup Node.js Environment\n        uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n          cache: "npm"\n\n`;
        code += `      - name: Install Packages\n        run: npm ci\n\n`;
        code += `      - name: Run Tests\n        run: npm test --if-present\n\n`;
      } else if (lang === 'python') {
        code += `      - name: Setup Python Environment\n        uses: actions/setup-python@v5\n        with:\n          python-version: "3.11"\n          cache: "pip"\n\n`;
        code += `      - name: Install Dependencies\n        run: |\n          pip install -r requirements.txt\n          pip install pytest\n\n`;
        code += `      - name: Run Tests\n        run: pytest\n\n`;
      } else if (lang === 'go') {
        code += `      - name: Setup Go Environment\n        uses: actions/setup-go@v5\n        with:\n          go-version: "1.21"\n\n`;
        code += `      - name: Fetch Dependencies\n        run: go mod download\n\n`;
        code += `      - name: Run Tests\n        run: go test ./...\n\n`;
      } else if (lang === 'java') {
        code += `      - name: Setup JDK Runtime\n        uses: actions/setup-java@v4\n        with:\n          distribution: "temurin"\n          java-version: "17"\n          cache: "maven"\n\n`;
        code += `      - name: Compile and Test\n        run: mvn test\n\n`;
      } else if (lang === 'docker') {
        code += `      - name: Compile local configuration validator\n        run: echo "Validating local scripts files..."\n\n`;
      }

      // Security Checks inside job
      if (isSnyk) {
        code += `      - name: Run Snyk Security Vulnerability Scan\n        uses: snyk/actions/node@master\n        env:\n          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}\n        with:\n          command: monitor\n\n`;
      }

      if (isSonar) {
        code += `      - name: Run Static Code Analysis via SonarCloud\n        uses: sonarsource/sonarcloud-github-action@master\n        env:\n          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}\n          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}\n\n`;
      }

      // 2. Containerization and Distribution Job
      if (isDocker || isTrivy || isAWS || isGCP) {
        code += `  publish-and-deploy:\n    needs: build-and-test\n    runs-on: ubuntu-latest\n    steps:\n`;
        code += `      - name: Checkout Source Code\n        uses: actions/checkout@v4\n\n`;
        
        if (isDocker || isTrivy) {
          code += `      - name: Set up Docker Buildx\n        uses: docker/setup-buildx-action@v3\n\n`;
          code += `      - name: Sign into DockerHub Registry\n        uses: docker/login-action@v3\n        with:\n          username: \${{ secrets.DOCKERHUB_USERNAME }}\n          password: \${{ secrets.DOCKERHUB_TOKEN }}\n\n`;
          code += `      - name: Build local container\n        uses: docker/build-push-action@v5\n        with:\n          context: .\n          load: true\n          tags: my-app:latest\n\n`;
        }

        if (isTrivy) {
          code += `      - name: Scan Image via Trivy Security Scanner\n        uses: aquasecurity/trivy-action@master\n        with:\n          image-ref: "my-app:latest"\n          format: "table"\n          exit-code: "1"\n          ignore-unfixed: true\n          vuln-type: "os,library"\n          severity: "CRITICAL,HIGH"\n\n`;
        }

        if (isDocker) {
          code += `      - name: Push Container to DockerHub Registry\n        uses: docker/build-push-action@v5\n        with:\n          context: .\n          push: true\n          tags: \${{ secrets.DOCKERHUB_USERNAME }}/my-app:\${{ github.sha }}\n\n`;
        }

        if (isAWS) {
          code += `      - name: Authenticate to AWS CLI via IAM OIDC Role\n        uses: aws-actions/configure-aws-credentials@v4\n        with:\n          role-to-assume: arn:aws:iam::123456789012:role/github-actions-gke-role\n          aws-region: us-east-1\n\n`;
          code += `      - name: Set Kubernetes targets via EKS\n        run: aws eks update-kubeconfig --name enterprise-cluster\n\n`;
          code += `      - name: Deploy manifests to EKS Cluster\n        run: kubectl rollout restart deployment/app-deployment\n\n`;
        } else if (isGCP) {
          code += `      - name: Sign into Google Cloud SDK\n        uses: google-github-actions/auth@v2\n        with:\n          credentials_json: \${{ secrets.GCP_CREDENTIALS }}\n\n`;
          code += `      - name: Set GKE Target Access\n        uses: google-github-actions/get-gke-credentials@v2\n        with:\n          cluster_name: enterprise-cluster\n          location: us-central1\n\n`;
          code += `      - name: Rollout manifest updates on GKE\n        run: kubectl rollout restart deployment/app-deployment\n\n`;
        }
      }

      compiledCode.pipeline = code;
    }

    function compileSonar() {
      const isSonar = $('scan_sonar').checked;
      if (!isSonar) {
        compiledCode.sonar = `# SonarCloud analysis is currently disabled. Toggle the checkbox in the settings panel to generate rules.`;
        return;
      }
      let code = `# sonar-project.properties\n`;
      code += `sonar.projectKey=TalariPradeep_enterprise-devops-app\n`;
      code += `sonar.organization=talaripradeep\n`;
      code += `sonar.host.url=https://sonarcloud.io\n\n`;
      code += `sonar.sources=.\n`;
      code += `sonar.exclusions=**/node_modules/**,**/dist/**,**/*.spec.js,**/test/**\n\n`;
      code += `sonar.sourceEncoding=UTF-8\n`;
      compiledCode.sonar = code;
    }

    function compileReadme() {
      let code = `# Enterprise CI/CD Pipeline Setup Guide\n\n`;
      code += `This directory houses the dynamic configuration templates compiled client-side.\n\n`;
      code += `## Required GitHub Repository Secrets\n\n`;
      code += `To execute the generated pipeline workflow successfully, configure the following secrets within your GitHub Repository Settings:\n\n`;
      code += `1. **DOCKERHUB_USERNAME**: Your DockerHub username profile ID.\n`;
      code += `2. **DOCKERHUB_TOKEN**: Secure registry access token (do not use raw accounts passwords).\n`;
      code += `3. **SONAR_TOKEN**: Organization SonarCloud key credential (required if static scan is enabled).\n`;
      code += `4. **SNYK_TOKEN**: Snyk CLI access security token (if snyk is selected).\n`;
      code += `5. **GCP_CREDENTIALS**: Google Cloud IAM keys JSON payload block (required if GKE deploy is enabled).\n\n`;
      code += `## Workflow Path Location\n\n`;
      code += `Place the compiled workflow script inside your repository path: \`.github/workflows/ci.yml\`.\n`;

      compiledCode.readme = code;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      if (tabId === 'pipeline') {
        nameBox.value = 'ci';
        extTag.textContent = '.yml';
      } else if (tabId === 'sonar') {
        nameBox.value = 'sonar-project';
        extTag.textContent = '.properties';
      } else if (tabId === 'readme') {
        nameBox.value = 'README';
        extTag.textContent = '.md';
      }
      updateViewportContent();
    }

    function updateViewportContent() {
      $('output-box').textContent = compiledCode[activeTab];
    }

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        showToast('✅ Copied tab config to clipboard!');
      });
    }

    function downloadWorkflowZip() {
      const zip = new JSZip();
      zip.file('.github/workflows/ci.yml', compiledCode.pipeline);
      zip.file('sonar-project.properties', compiledCode.sonar);
      zip.file('README.md', compiledCode.readme);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'github-actions-workflow.zip';
        a.click();
        showToast('⬇️ github-actions-workflow.zip downloaded successfully!');
      });
    }

    function clearAllFields() {
      $('gh_lang').value = 'node';
      $('gh_branch').value = 'main, dev';
      $('trigger_push').checked = true;
      $('trigger_pr').checked = true;
      $('scan_trivy').checked = true;
      $('scan_snyk').checked = false;
      $('scan_sonar').checked = true;
      $('deploy_aws').checked = false;
      $('deploy_gcp').checked = false;
      $('push_docker').checked = true;

      triggerCompileAll();
      showToast('🗑️ Defaults configurations successfully restored!');
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  
    const tabExplanations = {'pipeline': {'title': 'GitHub Actions CI Pipeline', 'filename': 'ci-pipeline.yml', 'why': 'Defines an automated CI workflow that tests, scans, compiles, and packages your code on code repository triggers.', 'when': 'Use to validate software quality and secure build processes on repository pushes and pull requests.', 'where': 'Place under `.github/workflows/ci-pipeline.yml`.', 'command': 'git push origin main # Triggers GitHub workflow run', 'practices': ['Run scans in parallel jobs to drop pipeline duration.', 'Always use OIDC roles to sign into AWS/GCP (exclude static keys).', 'Pin actions to specific versions/shas for build safety.'], 'ai_mlops': 'Runs quality checks, Trivy scans, and container compilation for the **SRE GenAI Copilot**.', 'flow': '[Code Push] ➔ [Checkout] ➔ [Lints/Tests] ➔ [Trivy Scan] ➔ [Build & Publish to GHCR]'}, 'sonar': {'title': 'SonarQube Scan Properties', 'filename': 'sonar-project.properties', 'why': 'Configures static analysis criteria for SonarQube, setting source directories and excluding compile files.', 'when': 'Include when static quality checks (SonarCloud) are enabled in the CI workflow.', 'where': 'Place in the project root directory.', 'command': '# Automatically read by SonarQube runner during analysis step', 'practices': ['Exclude testing directories and node_modules from code coverage stats.', 'Define project keys clearly to avoid project collisions in SonarCloud.', 'Maintain code smell/bug thresholds strictly.'], 'ai_mlops': 'Validates code bases quality gates of automation tools before release.', 'flow': '[Sonar Action] ➔ [Reads sonar-project.properties] ➔ [Scans source] ➔ [Pushes stats to SonarQube]'}, 'readme': {'title': 'Actions CI Guide', 'filename': 'README.md', 'why': 'Outlines required repository secret definitions and setup requirements for the pipeline.', 'when': 'Include in the code repository to guide DevOps engineers setting up repo integrations.', 'where': 'Save in the root of your workflows folder.', 'command': '# View on GitHub repo page', 'practices': ['List all mandatory secret keys.', 'Document environment tags.', 'Detail build badges status.'], 'ai_mlops': 'Outlines CI/CD configurations for packaging SRE AI packages.', 'flow': '[README.md Guide] ➔ [Guides Repository secrets configurations]'}};

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      // Populate drawer content
      document.getElementById('drawer-title').textContent = explanation.title;
      document.getElementById('drawer-filename').textContent = explanation.filename;
      document.getElementById('explain-why').innerHTML = explanation.why;
      document.getElementById('explain-when').innerHTML = explanation.when;
      
      document.getElementById('explain-where').innerHTML = explanation.where;
      document.getElementById('explain-command').textContent = explanation.command;

      const practicesBox = document.getElementById('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      // Populate AI/MLOps Integration
      document.getElementById('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';

      document.getElementById('explain-flow').textContent = explanation.flow;

      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadWorkflowZip = downloadWorkflowZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
