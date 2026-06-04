import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'pipeline';

    let compiledCode = {
      pipeline: '',
      variables: '',
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
      compileVariables();
      compileReadme();
      updateViewportContent();
    }

    function compilePipeline() {
      const appStack = $('app_stack').value;
      const runnerTag = $('runner_tag').value;
      const registryUrl = $('registry_url').value;
      const deployTarget = $('target_deploy').value;

      const hasLint = $('stage_lint').checked;
      const hasTest = $('stage_test').checked;
      const hasCache = $('stage_cache').checked;
      const hasDocker = $('docker_build').checked;

      const secTrivy = $('sec_trivy').checked;
      const secSonar = $('sec_sonar').checked;
      const secDetect = $('sec_secrets').checked;

      let code = `# .gitlab-ci.yml v${SCRIPT_VERSION} - Production GitLab CI/CD Pipeline compiled client-side\n\n`;

      // Templates integration
      if (secDetect) {
        code += `include:\n  - template: Jobs/Secret-Detection.gitlab-ci.yml\n\n`;
      }

      // Stages
      code += `stages:\n`;
      if (hasLint) code += `  - lint\n`;
      if (hasTest) code += `  - test\n`;
      if (secSonar) code += `  - analyze\n`;
      if (hasDocker) code += `  - build\n`;
      if (secTrivy) code += `  - scan\n`;
      code += `  - deploy\n\n`;

      // Globals
      code += `variables:\n`;
      code += `  DOCKER_DRIVER: overlay2\n`;
      code += `  IMAGE_TAG: $CI_COMMIT_SHORT_SHA\n`;
      code += `  REGISTRY_PATH: "${registryUrl}"\n\n`;

      code += `default:\n`;
      code += `  tags:\n`;
      code += `    - ${runnerTag}\n\n`;

      // Caching block
      if (hasCache) {
        code += `# ── DEPENDENCY CACHING ──\n`;
        code += `cache:\n`;
        code += `  key: "$CI_COMMIT_REF_SLUG"\n`;
        code += `  paths:\n`;
        if (appStack === 'node') {
          code += `    - .npm/\n    - node_modules/\n\n`;
        } else if (appStack === 'python') {
          code += `    - .cache/pip/\n    - venv/\n\n`;
        } else if (appStack === 'maven') {
          code += `    - .m2/repository/\n\n`;
        } else {
          code += `    - .cache/\n\n`;
        }
      }

      // Lint stage
      if (hasLint) {
        code += `lint-job:\n  stage: lint\n`;
        if (appStack === 'node') {
          code += `  image: node:18-alpine\n  script:\n    - npm ci --cache .npm --prefer-offline\n    - npm run lint || echo "Lint warning bypass"\n\n`;
        } else if (appStack === 'python') {
          code += `  image: python:3.10-slim\n  script:\n    - pip install flake8\n    - flake8 . --exclude=venv\n\n`;
        } else if (appStack === 'maven') {
          code += `  image: maven:3.8-openjdk-17-slim\n  script:\n    - mvn clean checkstyle:check || echo "Style issues found"\n\n`;
        } else {
          code += `  image: alpine:latest\n  script:\n    - echo "Running generic syntax check..."\n\n`;
        }
      }

      // Test stage
      if (hasTest) {
        code += `unit-testing-job:\n  stage: test\n`;
        if (appStack === 'node') {
          code += `  image: node:18-alpine\n  script:\n    - npm ci --cache .npm --prefer-offline\n    - npm test\n\n`;
        } else if (appStack === 'python') {
          code += `  image: python:3.10-slim\n  script:\n    - pip install pytest\n    - pytest\n\n`;
        } else if (appStack === 'maven') {
          code += `  image: maven:3.8-openjdk-17-slim\n  script:\n    - mvn test\n\n`;
        } else {
          code += `  image: alpine:latest\n  script:\n    - echo "Running tests..."\n\n`;
        }
      }

      // SonarQube stage
      if (secSonar) {
        code += `sonarqube-analysis-job:\n  stage: analyze\n  image: sonarsource/sonar-scanner-cli:latest\n  variables:\n    SONAR_USER_HOME: "\${CI_PROJECT_DIR}/.sonar"\n  script:\n    - sonar-scanner -Dsonar.projectKey=sre-app -Dsonar.sources=. -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_TOKEN\n  allow_failure: true\n\n`;
      }

      // Docker build stage
      if (hasDocker) {
        code += `docker-build-job:\n  stage: build\n  image: gcr.io/kaniko-project/executor:debug\n  script:\n    - mkdir -p /kaniko/.docker\n    - echo "{\\"auths\\":{\\"$CI_REGISTRY\\":{\\"username\\":\\"$CI_REGISTRY_USER\\",\\"password\\":\\"$CI_REGISTRY_PASSWORD\\"}}}" > /kaniko/.docker/config.json\n    - /kaniko/executor --context $CI_PROJECT_DIR --dockerfile $CI_PROJECT_DIR/Dockerfile --destination $REGISTRY_PATH:$IMAGE_TAG\n\n`;
      }

      // Trivy scanning
      if (secTrivy) {
        code += `trivy-security-scan-job:\n  stage: scan\n  image:\n    name: aquasec/trivy:latest\n    entrypoint: [""]\n  script:\n    - trivy image --exit-code 0 --severity HIGH --format table $REGISTRY_PATH:$IMAGE_TAG\n    - trivy image --exit-code 1 --severity CRITICAL --format table $REGISTRY_PATH:$IMAGE_TAG\n\n`;
      }

      // Deploy stage
      code += `deploy-production-job:\n  stage: deploy\n`;
      if (deployTarget === 'aws_s3') {
        code += `  image: amazon/aws-cli:latest\n  script:\n    - aws s3 sync dist/ s3://$AWS_S3_BUCKET_NAME/ --delete\n`;
      } else if (deployTarget === 'aws_ecs') {
        code += `  image: amazon/aws-cli:latest\n  script:\n    - aws ecs update-service --cluster $AWS_ECS_CLUSTER --service $AWS_ECS_SERVICE --force-new-deployment\n`;
      } else if (deployTarget === 'k8s') {
        code += `  image: bitnami/kubectl:latest\n  script:\n    - kubectl config set-cluster sre-k8s --server=$K8S_SERVER_IP --insecure-skip-tls-verify=true\n    - kubectl config set-credentials admin --token=$K8S_TOKEN\n    - kubectl config set-context default --cluster=sre-k8s --user=admin\n    - kubectl config use-context default\n    - sed -i "s|IMAGE_PLACEHOLDER|$REGISTRY_PATH:$IMAGE_TAG|g" deployment.yaml\n    - kubectl apply -f deployment.yaml\n`;
      } else if (deployTarget === 'pages') {
        code += `  image: alpine:latest\n  script:\n    - mkdir public\n    - cp -r dist/* public/\n  artifacts:\n    paths:\n      - public\n`;
      }
      code += `  rules:\n    - if: '$CI_COMMIT_BRANCH == "main"'\n`;

      compiledCode.pipeline = code;
    }

    function compileVariables() {
      let code = `# GitLab CI/CD Repository Variables (.env simulation)\n`;
      code += `# Register these parameters securely inside GitLab Settings -> CI/CD -> Variables\n\n`;
      code += `CI_REGISTRY_USER="gitlab-ci-token"\n`;
      code += `CI_REGISTRY_PASSWORD="<auto-generated-token>"\n`;
      code += `AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"\n`;
      code += `AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"\n`;
      code += `AWS_S3_BUCKET_NAME="production-sre-static-assets"\n`;
      code += `K8S_SERVER_IP="https://10.0.0.1:6443"\n`;
      code += `K8S_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI..."\n`;
      code += `SONAR_HOST_URL="https://sonarcloud.io"\n`;
      code += `SONAR_TOKEN="sqa_0a1b2c3d4e5f6g7h8i9j..."\n`;

      compiledCode.variables = code;
    }

    function compileReadme() {
      let code = `# GitLab CI/CD Pipeline Package\n\n`;
      code += `This package contains dynamic pipeline templates for automated building, scanning, and staging operations.\n\n`;
      code += `## Files Checklist\n`;
      code += `* \`.gitlab-ci.yml\`: The root pipelines description file.\n`;
      code += `* \`ci-vars.env\`: Guide outlining credentials variable keys.\n\n`;
      code += `## How to Deploy\n`;
      code += `1. Place the generated \`.gitlab-ci.yml\` file at the absolute root of your GitLab repository.\n`;
      code += `2. Commit and push changes:\n`;
      code += `   \`\`\`bash\n`;
      code += `   git add .gitlab-ci.yml\n`;
      code += `   git commit -m "chore: integrate production-grade SRE pipelines"\n`;
      code += `   git push origin main\n`;
      code += `   \`\`\`\n`;
      code += `3. Navigate to **Settings -> CI/CD -> Variables** in GitLab UI to register the key/value parameters listed in \`ci-vars.env\` securely.\n`;

      compiledCode.readme = code;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      if (tabId === 'pipeline') {
        nameBox.value = '.gitlab-ci';
        extTag.textContent = '.yml';
      } else if (tabId === 'variables') {
        nameBox.value = 'ci-vars';
        extTag.textContent = '.env';
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

    function downloadScriptZip() {
      const zip = new JSZip();
      
      zip.file('.gitlab-ci.yml', compiledCode.pipeline);
      zip.file('ci-vars.env', compiledCode.variables);
      zip.file('README.md', compiledCode.readme);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `gitlab-pipeline.zip`;
        a.click();
        showToast('⬇️ GitLab Pipeline configs downloaded successfully!');
      });
    }

    function clearAllFields() {
      $('app_stack').value = 'node';
      $('runner_tag').value = 'sre-docker-runner';
      $('registry_url').value = '$CI_REGISTRY_IMAGE';
      $('target_deploy').value = 'aws_s3';
      $('stage_lint').checked = true;
      $('stage_test').checked = true;
      $('stage_cache').checked = true;
      $('docker_build').checked = true;
      $('sec_trivy').checked = true;
      $('sec_sonar').checked = false;
      $('sec_secrets').checked = true;

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
  
    const tabExplanations = {'pipeline': {'title': 'GitLab CI Pipeline Configuration', 'filename': '.gitlab-ci.yml', 'why': 'Defines multi-stage pipelines (build, test, deploy) with GitLab runners tags, pipeline caching, and job dependencies.', 'when': 'Use to manage continuous integration and deployment inside GitLab repositories.', 'where': 'Save as `.gitlab-ci.yml` in the project root.', 'command': 'git push origin main # Triggers GitLab runner pipeline run', 'practices': ['Utilize YAML extends and anchors to avoid pipeline configurations duplication.', 'Define folder caching keys to speed up npm/pip imports.', 'Set up specific runner tags to align jobs with targets.'], 'ai_mlops': 'Automates pipeline runs on GitLab Runners to build SRE AI deployment containers.', 'flow': '[Git Commit Push] ➔ [GitLab Coordinator] ➔ [Trigger Runners] ➔ [Execute Pipeline Stages]'}, 'readme': {'title': 'GitLab CI Deployment Guide', 'filename': 'README.md', 'why': 'Outlines environment configurations, runner setup, and mandatory variables inside GitLab.', 'when': 'Include in the source repository to help maintainers manage pipeline executions.', 'where': 'Save in the root of your repository.', 'command': '# View in GitLab project workspace', 'practices': ['Document the pipeline variable configurations.', 'Detail runner deployment states.', 'List cache clearing commands.'], 'ai_mlops': 'Guides GitLab pipeline variables setup for MLOps services.', 'flow': '[README.md Guide] ➔ [Directs GitLab Runner Maintenance]'}};

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
window.downloadScriptZip = downloadScriptZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
