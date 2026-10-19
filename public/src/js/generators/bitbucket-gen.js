// Bitbucket Pipelines build compiler logic

const SCRIPT_VERSION = "1.0.0";

function initBitbucketStudio() {
  const elements = {
    stack: document.getElementById('bb_stack'),
    branch: document.getElementById('bb_branch'),
    cache: document.getElementById('bb_cache'),
    trivy: document.getElementById('bb_trivy'),
    sonar: document.getElementById('bb_sonar'),
    deploy: document.getElementById('bb_deploy'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-bb'),
    btnDownload: document.getElementById('btn-download-bb'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'bb_yaml';
  let compiledCode = {
    bb_yaml: '',
    bb_steps: '',
    bb_flow: ''
  };

  function compilePipeline() {
    const app = elements.stack ? elements.stack.value : 'java-maven';
    const targetBranch = elements.branch ? elements.branch.value : 'main';
    const useCache = elements.cache ? elements.cache.checked : true;
    const runTrivy = elements.trivy ? elements.trivy.checked : true;
    const runSonar = elements.sonar ? elements.sonar.checked : true;
    const doDeploy = elements.deploy ? elements.deploy.checked : true;

    // Compile Bitbucket Pipelines YAML
    let yaml = `# Bitbucket Pipelines CI/CD definition for ${app.toUpperCase()} stack\n`;
    yaml += `image: `;
    if (app === 'java-maven') yaml += `maven:3.8-openjdk-17-slim\n`;
    else if (app === 'nodejs') yaml += `node:18-slim\n`;
    else if (app === 'python') yaml += `python:3.10-slim\n`;
    else if (app === 'docker') yaml += `docker:20.10-dind\n`;

    yaml += `\npipelines:\n`;
    yaml += `  branches:\n`;
    yaml += `    '${targetBranch === 'all' ? '*' : targetBranch}':\n`;
    yaml += `      - step:\n`;
    yaml += `          name: Build and Test Application\n`;
    
    if (useCache) {
      yaml += `          caches:\n`;
      if (app === 'java-maven') yaml += `            - maven\n`;
      else if (app === 'nodejs') yaml += `            - node\n`;
      else if (app === 'python') yaml += `            - pip\n`;
      else if (app === 'docker') yaml += `            - docker\n`;
    }

    yaml += `          script:\n`;
    if (app === 'java-maven') {
      yaml += `            - mvn clean test\n`;
    } else if (app === 'nodejs') {
      yaml += `            - npm install\n`;
      yaml += `            - npm test\n`;
    } else if (app === 'python') {
      yaml += `            - pip install -r requirements.txt\n`;
      yaml += `            - pytest\n`;
    } else if (app === 'docker') {
      yaml += `            - docker build -t app-service .\n`;
    }

    if (runSonar) {
      yaml += `      - step:\n`;
      yaml += `          name: SonarQube Quality Scan Gate\n`;
      yaml += `          script:\n`;
      yaml += `            - pipe: sonarsource/sonarcloud-scan:2.0.0\n`;
      yaml += `              variables:\n`;
      yaml += `                SONAR_TOKEN: $SONAR_TOKEN\n`;
    }

    if (runTrivy) {
      yaml += `      - step:\n`;
      yaml += `          name: Trivy Security Scan Gate\n`;
      yaml += `          script:\n`;
      yaml += `            - pipe: aquasecurity/trivy-pipe:0.1.0\n`;
      yaml += `              variables:\n`;
      yaml += `                IMAGE_NAME: 'app-service'\n`;
      yaml += `                SEVERITY: 'CRITICAL'\n`;
    }

    if (doDeploy) {
      yaml += `      - step:\n`;
      yaml += `          name: Deploy to Cloud Stack (AWS)\n`;
      yaml += `          script:\n`;
      yaml += `            - pipe: atlassian/aws-ecs-deploy:1.6.2\n`;
      yaml += `              variables:\n`;
      yaml += `                AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID\n`;
      yaml += `                AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY\n`;
      yaml += `                CLUSTER_NAME: 'production-cluster'\n`;
      yaml += `                SERVICE_NAME: 'app-service'\n`;
    }

    compiledCode.bb_yaml = yaml;

    // Compile Local commands
    let steps = `# Shell script steps dry-run simulation of pipelines\n`;
    steps += `echo "Initializing pipeline runtime..."\n`;
    if (app === 'java-maven') {
      steps += `mvn clean compile\n`;
      steps += `mvn test\n`;
    } else if (app === 'nodejs') {
      steps += `npm ci\n`;
      steps += `npm run test\n`;
    } else if (app === 'python') {
      steps += `pip install -r requirements.txt\n`;
      steps += `python -m pytest\n`;
    } else if (app === 'docker') {
      steps += `docker build -t app-service:latest .\n`;
    }

    if (runSonar) {
      steps += `sonar-scanner -Dsonar.projectKey=sre-app\n`;
    }
    if (runTrivy) {
      steps += `trivy image --severity CRITICAL app-service:latest\n`;
    }
    if (doDeploy) {
      steps += `aws ecs update-service --cluster production-cluster --service app-service --force-new-deployment\n`;
    }
    compiledCode.bb_steps = steps;

    // Compile Mermaid Flow
    let flow = 'graph TD\n';
    flow += '  Code[🐱 Code Push] --> Build[🛠️ Build & Test]\n';
    if (useCache) {
      flow += '  Cache[🗄️ Cache Check] --> Build\n';
    }
    if (runSonar) {
      flow += '  Build --> Sonar[🛡️ SonarQube Gate]\n';
      if (runTrivy) {
        flow += '  Sonar --> Trivy[🔎 Trivy Security scan]\n';
        if (doDeploy) {
          flow += '  Trivy --> Deploy[🚀 AWS Cloud Deploy]\n';
        }
      } else if (doDeploy) {
        flow += '  Sonar --> Deploy[🚀 AWS Cloud Deploy]\n';
      }
    } else {
      if (runTrivy) {
        flow += '  Build --> Trivy[🔎 Trivy Security scan]\n';
        if (doDeploy) {
          flow += '  Trivy --> Deploy[🚀 AWS Cloud Deploy]\n';
        }
      } else if (doDeploy) {
        flow += '  Build --> Deploy[🚀 AWS Cloud Deploy]\n';
      }
    }
    compiledCode.bb_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'bb_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.bb_flow + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
      
      // Update filename box
      let filename = 'bitbucket-pipelines.yml';
      if (activeTab === 'bb_steps') filename = 'pipeline-steps.sh';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  [elements.stack, elements.branch, elements.cache, elements.trivy, elements.sonar, elements.deploy].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', compilePipeline);
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        alert("✅ Copied to clipboard!");
      });
    };
  }

  if (elements.btnDownload) {
    elements.btnDownload.onclick = () => {
      const content = elements.outputBox.textContent;
      const filename = elements.downloadInput.value;
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = filename;
      a.click();
    };
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['bb_yaml', 'bb_steps', 'bb_flow'],
    'bb_yaml',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compilePipeline();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('bb_stack')) {
    initBitbucketStudio();
  }
});

window.initBitbucketStudio = initBitbucketStudio;
