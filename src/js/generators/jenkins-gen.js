import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'jenkinsfile';

    let customEnvVars = [
      { name: 'SONAR_URL', value: 'http://sonar-sre-prod:9000' }
    ];

    let compiledCode = {
      jenkinsfile: '',
      sonar: ''
    ,
  flow: ''
};

    window.addEventListener('DOMContentLoaded', () => {
      renderCustomEnvTable();
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      // Toggle Agent labels
      $('agent_any').addEventListener('change', function() {
        if (this.checked) {
          $('agent_custom').checked = false;
          $('custom-agent-name-box').classList.add('hidden');
        }
        triggerCompileAll();
      });

      $('agent_custom').addEventListener('change', function() {
        if (this.checked) {
          $('agent_any').checked = false;
          $('custom-agent-name-box').classList.remove('hidden');
        } else {
          $('custom-agent-name-box').classList.add('hidden');
        }
        triggerCompileAll();
      });

      setupCompilerTriggers(triggerCompileAll);
    }

    // Custom Env Variables Table
    function renderCustomEnvTable() {
      const tbody = $('custom-env-tbody');
      tbody.innerHTML = '';

      customEnvVars.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full font-semibold" value="${escapeHtml(item.name)}" onchange="updateCustomEnvCell(${index}, 'name', this.value)" /></td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full text-slate-500" value="${escapeHtml(item.value)}" onchange="updateCustomEnvCell(${index}, 'value', this.value)" /></td>
          <td>
            <button onclick="deleteCustomEnvRow(${index})" class="text-rose-500 hover:text-rose-700 text-sm font-semibold p-1">✕</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function addCustomEnvRow() {
      customEnvVars.push({ name: 'NEW_VAR', value: 'value' });
      renderCustomEnvTable();
      triggerCompileAll();
    }

    function deleteCustomEnvRow(index) {
      customEnvVars.splice(index, 1);
      renderCustomEnvTable();
      triggerCompileAll();
    }

    function updateCustomEnvCell(index, key, val) {
      customEnvVars[index][key] = val;
      triggerCompileAll();
    }

    function triggerCompileAll() {
      compileJenkinsfile();
      compileSonar();
      compileMermaidFlow();
  updateViewportContent();
    }

    // Compile DEVSECOPS Declarative Pipeline
    function compileJenkinsfile() {
      const isAgentAny = $('agent_any').checked;
      const isAgentCustom = $('agent_custom').checked;
      const agentLabel = $('agent_label').value.trim() || 'aws-sre-runner';

      // Tools checkbox mapping
      const toolJava = $('tool_java').checked;
      const toolJavaVer = $('tool_java_version').value;
      const toolMvn = $('tool_maven').checked;
      const toolMvnVer = $('tool_maven_version').value;
      const toolGradle = $('tool_gradle').checked;
      const toolGradleVer = $('tool_gradle_version').value;
      const toolNode = $('tool_node').checked;
      const toolNodeVer = $('tool_node_version').value;
      const toolPython = $('tool_python').checked;
      const toolPythonVer = $('tool_python_version').value;
      const toolAnt = $('tool_ant').checked;
      const toolAntVer = $('tool_ant_version').value;

      // Security tools
      const secSonar = $('sectool_sonar').checked;
      const secSonarVer = $('sectool_sonar_version').value;
      const secSnyk = $('sectool_snyk').checked;
      const secSnykVer = $('sectool_snyk_version').value;
      const secTrivy = $('sectool_trivy').checked;
      const secTrivyVer = $('sectool_trivy_version').value;
      const secZap = $('sectool_zap').checked;
      const secZapVer = $('sectool_zap_version').value;

      // Additional Stages
      const addTest = $('stage_test_add').checked;
      const addDeploy = $('stage_deploy_add').checked;

      // Security Stages
      const scanSonar = $('sec_sonar_scan').checked;
      const scanSnyk = $('sec_snyk_scan').checked;
      const scanTrivy = $('sec_trivy_scan').checked;
      const scanZap = $('sec_zap_scan').checked;
      const uploadDt = $('sec_dep_track').checked;
      const uploadArt = $('sec_artifactory').checked;
      const secYelp = $('sec_secrets_yelp').checked;
      const secGitleaks = $('sec_secrets_gitleaks').checked;
      const secTruffle = $('sec_secrets_truffle').checked;

      // Environment Variables checkboxes
      const envImgName = $('env_image_name').checked;
      const envContName = $('env_container_name').checked;
      const envGitRepo = $('env_git_repo').checked;
      const envGitBranch = $('env_git_branch').checked;
      const envJavaHome = $('env_java_home').checked;
      const envMvnHome = $('env_mvn_home').checked;

      // Pipeline Enhancements
      const enhK8s = $('enh_k8s').checked;
      const enhTar = $('enh_tar').checked;
      const enhSonarGate = $('enh_sonar_gate').checked;
      const enhUploadTarget = $('enh_upload').value;
      const enhSlack = $('enh_slack').checked;
      const enhEmail = $('enh_email').checked;

      // Docker Section
      const useDocker = $('docker_cli').checked;

      // STARTING JENKINSFILE PARSE
      let code = `pipeline {\n`;

      if (isAgentCustom) {
        code += `    agent {\n        label '${agentLabel}'\n    }\n\n`;
      } else {
        code += `    agent any\n\n`;
      }

      // 1. Build Tools Block
      let toolsBlock = '';
      if (toolJava) toolsBlock += `        jdk '${toolJavaVer}'\n`;
      if (toolMvn) toolsBlock += `        maven '${toolMvnVer}'\n`;
      if (toolGradle) toolsBlock += `        gradle '${toolGradleVer}'\n`;
      if (toolNode) toolsBlock += `        nodejs '${toolNodeVer}'\n`;
      if (toolPython) toolsBlock += `        python '${toolPythonVer}'\n`;
      if (toolAnt) toolsBlock += `        ant '${toolAntVer}'\n`;

      if (toolsBlock) {
        code += `    tools {\n${toolsBlock}    }\n\n`;
      }

      // 2. Environment Block
      let envBlock = '';
      if (envImgName) envBlock += `        IMAGE_NAME = 'devops-app-image'\n`;
      if (envContName) envBlock += `        CONTAINER_NAME = 'devops-app-container'\n`;
      if (envGitRepo) envBlock += `        GIT_REPO = 'https://github.com/Pradeeptalari14/portfolio.git'\n`;
      if (envGitBranch) envBlock += `        GIT_BRANCH = 'main'\n`;
      if (envJavaHome) envBlock += `        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk'\n`;
      if (envMvnHome) envBlock += `        MVN_HOME = '/opt/maven'\n`;

      // Custom variables
      customEnvVars.forEach(item => {
        if (item.name.trim()) {
          envBlock += `        ${item.name.trim()} = '${item.value.trim()}'\n`;
        }
      });

      if (envBlock) {
        code += `    environment {\n${envBlock}    }\n\n`;
      }

      code += `    stages {\n`;

      // Stage: Clone Repository
      code += `        stage('Clone Repository') {\n`;
      code += `            steps {\n`;
      if (envGitRepo) {
        code += `                git url: env.GIT_REPO\n`;
      } else {
        code += `                checkout scm\n`;
      }
      code += `            }\n`;
      code += `        }\n\n`;

      // Stage: Secret Detection
      if (secYelp || secGitleaks || secTruffle) {
        code += `        stage('Secret Scan Audits') {\n`;
        code += `            steps {\n`;
        if (secYelp) code += `                sh 'detect-secrets scan .'\n`;
        if (secGitleaks) code += `                sh 'gitleaks detect --source=. --verbose'\n`;
        if (secTruffle) code += `                sh 'trufflehog filesystem .'\n`;
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: SonarQube Scan
      if (scanSonar) {
        code += `        stage('Static Quality Analysis') {\n`;
        code += `            steps {\n`;
        code += `                withSonarQubeEnv('SonarQube') {\n`;
        code += `                    sh '${secSonar ? 'sonar-scanner' : 'sonar-scanner'} -Dsonar.projectKey=devops-core-app'\n`;
        code += `                }\n`;
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: SonarQube Quality Gate
      if (enhSonarGate && scanSonar) {
        code += `        stage('SonarQube Quality Gate') {\n`;
        code += `            steps {\n`;
        code += `                timeout(time: 5, unit: 'MINUTES') {\n`;
        code += `                    waitForQualityGate abortPipeline: true\n`;
        code += `                }\n`;
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: Snyk / Trivy scan
      if (scanSnyk || scanTrivy) {
        code += `        stage('Vulnerability Security Audits') {\n`;
        code += `            steps {\n`;
        if (scanTrivy) code += `                sh 'trivy fs --severity HIGH,CRITICAL --format table .'\n`;
        if (scanSnyk) code += `                sh 'snyk test'\n`;
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: Test stage
      if (addTest) {
        code += `        stage('Execute Unit Tests') {\n`;
        code += `            steps {\n`;
        if (toolMvn) {
          code += `                sh 'mvn test'\n`;
        } else if (toolNode) {
          code += `                sh 'npm test'\n`;
        } else {
          code += `                echo 'Executing unit testing sweeps...'\n`;
        }
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: Dependency Track
      if (uploadDt) {
        code += `        stage('Supply Chain Dependency-Track') {\n`;
        code += `            steps {\n`;
        code += `                sh 'curl -X POST -H "X-API-Key: $DT_API_KEY" -F "bom=@target/bom.xml" http://dependencytrack/api/v1/bom'\n`;
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: Package Artifact
      if (enhTar) {
        code += `        stage('Package Deployment Artifact') {\n`;
        code += `            steps {\n`;
        code += `                sh 'tar -czf deployment-artifact.tar.gz .'\n`;
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: Artifact Upload
      if (enhUploadTarget !== 'none' || uploadArt) {
        code += `        stage('Archive Deployment Artifact') {\n`;
        code += `            steps {\n`;
        if (enhUploadTarget === 'artifactory' || uploadArt) {
          code += `                sh 'jfrog rt u "deployment-artifact.tar.gz" libs-release-local/'\n`;
        } else if (enhUploadTarget === 's3') {
          code += `                sh 'aws s3 cp deployment-artifact.tar.gz s3://my-s3-production-bucket/'\n`;
        } else {
          code += `                echo 'Archiving artifact to local repository targets...'\n`;
        }
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: Docker Build
      if (useDocker) {
        code += `        stage('Docker Core Containerization') {\n`;
        code += `            steps {\n`;
        code += `                sh 'docker build -t \${IMAGE_NAME}:latest .'\n`;
        code += `                sh 'docker tag \${IMAGE_NAME}:latest \${IMAGE_NAME}:\${BUILD_NUMBER}'\n`;
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: OWASP ZAP
      if (scanZap) {
        code += `        stage('OWASP ZAP baseline scan') {\n`;
        code += `            steps {\n`;
        code += `                sh 'zap-baseline.py -t http://localhost:8080 -r zap_report.html'\n`;
        code += `            }\n`;
        code += `        }\n\n`;
      }

      // Stage: SRE Deploy
      if (addDeploy || enhK8s) {
        code += `        stage('Orchestrate SRE Deploy') {\n`;
        code += `            steps {\n`;
        if (enhK8s) {
          code += `                sh 'kubectl apply -f k8s/'\n`;
        } else {
          code += `                echo 'Triggering environment deploy hook...'\n`;
        }
        code += `            }\n`;
        code += `        }\n\n`;
      }

      code += `    }\n\n`;

      // Post SRE Alerts Block
      if (enhSlack || enhEmail) {
        code += `    post {\n`;
        code += `        failure {\n`;
        code += `            echo 'Build failed.'\n`;
        if (enhSlack) {
          code += `            slackSend channel: '#devsecops-alerts', color: 'danger', message: "🔴 DevSecOps Alert: Build Failed - '\${env.JOB_NAME}' (Build #\${env.BUILD_NUMBER})"\n`;
        }
        if (enhEmail) {
          code += `            mail to: 'devsecops-alerts@talaripradeep.info', subject: "Failed DevSecOps Build: \${env.JOB_NAME}", body: "Diagnose stages logs for failure details."\n`;
        }
        code += `        }\n`;
        
        code += `        success {\n`;
        code += `            echo 'Container started successfully.'\n`;
        if (enhSlack) {
          code += `            slackSend channel: '#devsecops-alerts', color: 'good', message: "🚀 DevSecOps Alert: Build Success - '\${env.JOB_NAME}' (Build #\${env.BUILD_NUMBER})"\n`;
        }
        code += `        }\n`;
        code += `    }\n`;
      }

      code += `}\n`;

      compiledCode.jenkinsfile = code;
    }

    // Compile Sonar project properties
    function compileSonar() {
      let code = `# SonarQube scan configuration properties\n`;
      code += `sonar.projectKey=devops-core-app\n`;
      code += `sonar.projectName=Talari Pradeep DEVSECOPS Pipeline\n`;
      code += `sonar.projectVersion=2.0.0\n`;
      code += `sonar.sources=.\n`;
      code += `sonar.exclusions=**/node_modules/**, **/dist/**, **/target/**\n`;
      code += `sonar.sourceEncoding=UTF-8\n`;
      compiledCode.sonar = code;
    }

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Git[🐱 Git Push] -->|Webhook| Jenkins[🏭 Jenkins Pipeline]\n  Jenkins -->|Lint| SonarQube[🛡️ Quality Analysis]\n  SonarQube -->|Test| Test[🧪 Execute Unit Tests]\n  Test -->|Containerize| Docker[🐳 Docker Build & Push]\n  Docker -->|Deploy| K8s[☸️ Kubernetes cluster]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      if (tabId === 'flow') {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
  } else if (tabId === 'jenkinsfile') {
        nameBox.value = 'Jenkinsfile';
        extTag.textContent = '';
      } else if (tabId === 'sonar') {
        nameBox.value = 'sonar-project';
        extTag.textContent = '.properties';
      }
      updateViewportContent();
    }

    function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    if (typeof mermaid === 'undefined') {
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Please check your internet connection or reload the page.\n\nCode:\n${compiledCode.flow}</pre>`;
    } else {
      try {
        mermaid.run({
          nodes: [container.querySelector('.mermaid')]
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
      }
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        showToast('✅ Copied file to clipboard!');
      });
    }

    function downloadActiveFile() {
      const content = compiledCode[activeTab];
      let filename = 'Jenkinsfile';
      if (activeTab === 'sonar') filename = 'sonar-project.properties';
      
      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      showToast(`⬇️ Downloaded ${filename}`);
    }

    function exportEnvBlock() {
      // Export environment variables block only
      let code = `environment {\n`;
      if ($('env_image_name').checked) code += `    IMAGE_NAME = 'devops-app-image'\n`;
      if ($('env_container_name').checked) code += `    CONTAINER_NAME = 'devops-app-container'\n`;
      if ($('env_git_repo').checked) code += `    GIT_REPO = 'https://github.com/Pradeeptalari14/portfolio.git'\n`;
      if ($('env_git_branch').checked) code += `    GIT_BRANCH = 'main'\n`;
      
      customEnvVars.forEach(item => {
        if (item.name.trim()) {
          code += `    ${item.name.trim()} = '${item.value.trim()}'\n`;
        }
      });
      code += `}\n`;

      const blob = new Blob([code], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'env-block.groovy';
      a.click();
      showToast('⬇️ Exported environment variables block!');
    }

    function resetEnvVars() {
      customEnvVars = [
        { name: 'SONAR_URL', value: 'http://sonar-sre-prod:9000' }
      ];
      renderCustomEnvTable();
      triggerCompileAll();
      showToast('🔄 Reset custom environment variables to defaults');
    }

    function clearAllFields() {
      customEnvVars = [];
      
      $('agent_any').checked = true;
      $('agent_custom').checked = false;
      $('custom-agent-name-box').classList.add('hidden');

      $('tool_java').checked = false;
      $('tool_maven').checked = false;
      $('tool_gradle').checked = false;
      $('tool_node').checked = false;
      $('tool_python').checked = false;
      $('tool_ant').checked = false;

      $('sectool_sonar').checked = false;
      $('sectool_snyk').checked = false;
      $('sectool_trivy').checked = false;
      $('sectool_zap').checked = false;

      $('stage_test_add').checked = false;
      $('stage_deploy_add').checked = false;

      $('sec_sonar_scan').checked = false;
      $('sec_snyk_scan').checked = false;
      $('sec_trivy_scan').checked = false;
      $('sec_zap_scan').checked = false;
      $('sec_dep_track').checked = false;
      $('sec_artifactory').checked = false;
      $('sec_secrets_yelp').checked = false;
      $('sec_secrets_gitleaks').checked = false;
      $('sec_secrets_truffle').checked = false;

      $('env_image_name').checked = false;
      $('env_container_name').checked = false;
      $('env_git_repo').checked = false;
      $('env_git_branch').checked = false;
      $('env_java_home').checked = false;
      $('env_mvn_home').checked = false;

      $('enh_k8s').checked = false;
      $('enh_tar').checked = false;
      $('enh_sonar_gate').checked = false;
      $('enh_upload').value = 'none';
      $('enh_slack').checked = false;
      $('enh_email').checked = false;

      $('docker_cli').checked = false;

      renderCustomEnvTable();
      triggerCompileAll();
      showToast('🗑️ Layout outputs cleared and reset to blank');
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

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
    }
  
    const tabExplanations = {'jenkinsfile': {'title': 'Jenkins Declarative Pipeline', 'filename': 'Jenkinsfile', 'why': 'Builds a structured CI/CD pipeline inside Jenkins, managing tools declarations, environment variables, stages (Clone, Lint, Test, Scan, Deploy), and failure handlers.', 'when': 'Use to orchestrate legacy or custom continuous integration pipelines inside self-hosted enterprise setups.', 'where': 'Place in the root of your codebase repository.', 'command': '# Point Jenkins Server Job to Jenkinsfile repo', 'practices': ['Use Declarative syntax over Scripted pipelines to enforce structured phases.', 'Implement shared library blocks for reusable SRE pipeline steps.', 'Enclose secrets pulling inside credentials helper blocks (`withCredentials`).'], 'ai_mlops': 'Triggers build scans and quality pipeline gates for **SRE GenAI Copilot** builds.', 'flow': '[Commit Push] ➔ [Webhook Trigger] ➔ [Jenkins Agent Run] ➔ [Execute Pipeline Stages]'}, 'sonar': {'title': 'SonarQube Scan Properties', 'filename': 'sonar-project.properties', 'why': 'Sets static analysis variables for the Sonar scanner run, specifying sources paths and excluding compile folders.', 'when': 'Include when static quality checks are enabled in the Jenkinsfile pipeline run.', 'where': 'Place in the project root directory.', 'command': '# Read by sonar-scanner CLI during build task execution', 'practices': ['Exclude testing directories and node_modules from code coverage stats.', 'Define project keys clearly to avoid project collisions in SonarCloud.', 'Maintain code smell/bug thresholds strictly.'], 'ai_mlops': 'Reviews custom SRE scripts for vulnerability leaks before deployment.', 'flow': '[Sonar step] ➔ [Reads sonar-project.properties] ➔ [Analyzes Code] ➔ [Pushes Quality Stats]'}};

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
window.addCustomEnvRow = addCustomEnvRow;
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.deleteCustomEnvRow = deleteCustomEnvRow;
window.downloadActiveFile = downloadActiveFile;
window.escapeHtml = escapeHtml;
window.explainActiveTabCode = explainActiveTabCode;
window.exportEnvBlock = exportEnvBlock;
window.resetEnvVars = resetEnvVars;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.updateCustomEnvCell = updateCustomEnvCell;
