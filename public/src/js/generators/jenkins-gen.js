import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '3.0.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// Active state
let activeTab = 'jenkinsfile';
let activeProjectId = 'springboot-eks';
let isSimulating = false;
let currentSimStep = 0;
let simulationInterval = null;

// Custom environment variables
let customEnvVars = [
  { name: 'SONAR_URL', value: 'http://sonar-sre-prod:9000' }
];

// Compiled code buffers
let compiledCode = {
  jenkinsfile: '',
  sonar: '',
  k8s: '',
  dockerfile: '',
  flow: '',
  console: ''
};

// 5 Comprehensive Real-Time Enterprise Project Blueprints
export const REALTIME_PROJECTS = {
  'springboot-eks': {
    id: 'springboot-eks',
    name: 'Spring Boot Microservice + Amazon EKS (Real-Time Script)',
    badge: '⭐ REAL-TIME IMAGE SCRIPT',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    desc: 'The exact 10-stage declarative pipeline from production architecture: Maven packaging, SonarQube SAST, Trivy filesystem & image audits, AWS ECR push, Amazon EKS rolling deploy, and rollout status verification.',
    techStack: ['Java 17', 'Maven 3.9', 'SonarQube', 'Trivy', 'Docker', 'Amazon ECR', 'Amazon EKS', 'kubectl'],
    env: {
      eksCluster: 'dev-eks-cluster',
      awsRegion: 'us-east-1',
      awsAccountId: '123456789012',
      ecrRepo: 'springboot-app',
      appName: 'springboot-app',
      k8sNamespace: 'default',
      sonarKey: 'springboot-app',
      slackChannel: '#devsecops-alerts'
    },
    flags: {
      toolJava: true,
      toolJavaVer: 'JDK17',
      toolMaven: true,
      toolMavenVer: 'maven-3.9',
      toolNode: false,
      toolPython: false,
      secSonar: true,
      secTrivy: true,
      secSnyk: false,
      scanSonar: true,
      scanTrivy: true,
      useDocker: true,
      enhK8s: true,
      enhSonarGate: true,
      enhSlack: true
    },
    flowSteps: [
      { num: '01', title: 'Checkout Source', sub: 'GitHub Pull', cmd: "git branch: 'main', credentialsId: 'github-creds', url: 'https://github.com/username/repository.git'" },
      { num: '02', title: 'Maven Build', sub: 'JAR Package', cmd: "sh 'mvn clean package -DskipTests'" },
      { num: '03', title: 'SonarQube Scan', sub: 'SAST Audit', cmd: "withSonarQubeEnv('SonarQube') { sh 'mvn sonar:sonar' }" },
      { num: '04', title: 'Trivy File Scan', sub: 'Repo & Secrets', cmd: "sh 'trivy fs .'" },
      { num: '05', title: 'Docker Build', sub: 'OCI Container', cmd: "sh 'docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} .'" },
      { num: '06', title: 'Trivy Image Scan', sub: 'OS CVE Audit', cmd: "sh 'trivy image ${ECR_REPOSITORY}:${IMAGE_TAG}'" },
      { num: '07', title: 'Push to Amazon ECR', sub: 'AWS Registry', cmd: "aws ecr get-login-password | docker login && docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}" },
      { num: '08', title: 'Deploy to Amazon EKS', sub: 'Rolling Update', cmd: "aws eks update-kubeconfig && kubectl set image deployment/${APP_NAME} ${APP_NAME}=${IMAGE} -n ${K8S_NAMESPACE}" },
      { num: '09', title: 'Verify Deployment', sub: 'Rollout Status', cmd: "sh 'kubectl rollout status deployment/${APP_NAME} -n ${K8S_NAMESPACE} --timeout=120s'" },
      { num: '10', title: 'Post Actions', sub: 'Slack & Cleanup', cmd: "echo 'SUCCESS' && curl -X POST webhook && cleanWs()" }
    ]
  },
  'nodejs-react': {
    id: 'nodejs-react',
    name: 'Node.js & React SPA + ArgoCD GitOps',
    badge: '⚡ FULL-STACK GITOPS',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    desc: 'Modern TypeScript frontend and Node.js microservice pipeline with npm ci, ESLint SAST, Snyk open-source dependency check, multi-stage Docker build, and automated GitOps manifest commit for ArgoCD.',
    techStack: ['Node.js 20', 'npm', 'ESLint', 'Snyk', 'Gitleaks', 'Docker', 'ArgoCD', 'Cloud Run'],
    env: {
      eksCluster: 'production-mesh-k8s',
      awsRegion: 'us-east-1',
      awsAccountId: '123456789012',
      ecrRepo: 'react-web-frontend',
      appName: 'react-web-frontend',
      k8sNamespace: 'frontend',
      sonarKey: 'react-web-frontend',
      slackChannel: '#frontend-deployments'
    },
    flags: {
      toolJava: false,
      toolMaven: false,
      toolNode: true,
      toolNodeVer: 'node-20',
      toolPython: false,
      secSonar: true,
      secTrivy: true,
      secSnyk: true,
      scanSonar: true,
      scanTrivy: true,
      useDocker: true,
      enhK8s: true,
      enhSonarGate: false,
      enhSlack: true
    },
    flowSteps: [
      { num: '01', title: 'Checkout SCM', sub: 'Git Clone', cmd: "checkout scm" },
      { num: '02', title: 'Install & Build', sub: 'npm ci & vite', cmd: "sh 'npm ci && npm run build'" },
      { num: '03', title: 'Lint & Test', sub: 'ESLint & Jest', cmd: "sh 'npm run lint && npm test -- --coverage'" },
      { num: '04', title: 'Snyk Dependencies', sub: 'CVE Blocker', cmd: "sh 'snyk test --severity-threshold=high'" },
      { num: '05', title: 'Multi-Stage Build', sub: 'Nginx Dist', cmd: "sh 'docker build -t ${ECR_REPO}:${IMAGE_TAG} .'" },
      { num: '06', title: 'Container Audit', sub: 'Trivy Scan', cmd: "sh 'trivy image --severity HIGH,CRITICAL ${ECR_REPO}:${IMAGE_TAG}'" },
      { num: '07', title: 'Push Registry', sub: 'OCI Push', cmd: "sh 'docker push ${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}'" },
      { num: '08', title: 'GitOps Commit', sub: 'ArgoCD Tag Bump', cmd: "sh 'git clone $GITOPS_REPO && yq e \".image.tag = \\\"$IMAGE_TAG\\\"\" values.yaml -i && git commit -m \"chore: bump tag\" && git push'" },
      { num: '09', title: 'ArgoCD Sync', sub: 'Health Check', cmd: "sh 'argocd app wait ${APP_NAME} --health --timeout 180'" },
      { num: '10', title: 'Slack Notify', sub: 'Release Complete', cmd: "slackSend channel: env.SLACK_CHANNEL, message: 'Deployed React v2.4'" }
    ]
  },
  'python-vllm-ai': {
    id: 'python-vllm-ai',
    name: 'Python AI Inference (vLLM / FastAPI) + GPU EKS',
    badge: '🤖 LLMOPS & GENAI',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    desc: 'High-throughput LLM serving pipeline with PyTest, Bandit SAST, model weights validation, NVIDIA CUDA containerization, and GPU node deployment with automated health checks.',
    techStack: ['Python 3.11', 'PyTest', 'Bandit', 'NVIDIA CUDA 12.4', 'vLLM', 'RayCluster', 'GPU EKS'],
    env: {
      eksCluster: 'ai-gpu-prod-cluster',
      awsRegion: 'us-east-1',
      awsAccountId: '123456789012',
      ecrRepo: 'vllm-inference-engine',
      appName: 'vllm-serving-service',
      k8sNamespace: 'ai-serving',
      sonarKey: 'vllm-inference-engine',
      slackChannel: '#ai-sre-oncall'
    },
    flags: {
      toolJava: false,
      toolMaven: false,
      toolNode: false,
      toolPython: true,
      toolPythonVer: 'python3',
      secSonar: true,
      secTrivy: true,
      secSnyk: false,
      scanSonar: true,
      scanTrivy: true,
      useDocker: true,
      enhK8s: true,
      enhSonarGate: true,
      enhSlack: true
    },
    flowSteps: [
      { num: '01', title: 'Checkout SCM', sub: 'Inference Engine', cmd: "checkout scm" },
      { num: '02', title: 'PyTest & Bandit', sub: 'Unit & SAST', cmd: "sh 'pytest tests/ && bandit -r app/ -ll'" },
      { num: '03', title: 'Weights Check', sub: 'SHA256 Manifest', cmd: "sh 'python3 scripts/verify_weights_checksum.py'" },
      { num: '04', title: 'Trivy File Scan', sub: 'Secrets Audit', cmd: "sh 'trivy fs --security-checks secret,config .'" },
      { num: '05', title: 'CUDA Build', sub: 'vLLM Multi-GPU', cmd: "sh 'docker build --build-arg CUDA_VERSION=12.4 -t ${ECR_REPO}:${IMAGE_TAG} .'" },
      { num: '06', title: 'Container Audit', sub: 'Trivy Image Scan', cmd: "sh 'trivy image --severity CRITICAL ${ECR_REPO}:${IMAGE_TAG}'" },
      { num: '07', title: 'Push Image ECR', sub: 'AWS GPU Registry', cmd: "aws ecr get-login-password | docker login && docker push ${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}" },
      { num: '08', title: 'Deploy GPU Pods', sub: 'EKS GPU NodeGroup', cmd: "kubectl apply -f k8s/vllm-deployment.yaml -n ${K8S_NAMESPACE}" },
      { num: '09', title: 'Latency Probe', sub: '/v1/models Check', cmd: "sh 'kubectl rollout status deployment/${APP_NAME} --timeout=300s && curl -f http://${APP_NAME}/v1/models'" },
      { num: '10', title: 'SRE Post Alert', sub: 'Inference Ready', cmd: "slackSend channel: env.SLACK_CHANNEL, message: 'vLLM Engine Ready on 8x H100'" }
    ]
  },
  'golang-slsa3': {
    id: 'golang-slsa3',
    name: 'Go Microservice + Sigstore Cosign (SLSA Level 3)',
    badge: '🛡️ ZERO-TRUST SLSA L3',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    desc: 'Enterprise zero-trust Go service with golangci-lint, govulncheck, minimal distroless containerization, CycloneDX SBOM generation, and Sigstore Cosign cryptographic signing with AWS KMS.',
    techStack: ['Go 1.23', 'golangci-lint', 'govulncheck', 'Distroless', 'Cosign', 'CycloneDX', 'Kyverno'],
    env: {
      eksCluster: 'fintech-core-cluster',
      awsRegion: 'us-east-1',
      awsAccountId: '123456789012',
      ecrRepo: 'payment-gateway-service',
      appName: 'payment-gateway-service',
      k8sNamespace: 'fintech-core',
      sonarKey: 'payment-gateway-service',
      slackChannel: '#fintech-secops'
    },
    flags: {
      toolJava: false,
      toolMaven: false,
      toolNode: false,
      toolPython: false,
      secSonar: true,
      secTrivy: true,
      secSnyk: false,
      scanSonar: true,
      scanTrivy: true,
      useDocker: true,
      enhK8s: true,
      enhSonarGate: true,
      enhSlack: true
    },
    flowSteps: [
      { num: '01', title: 'Checkout SCM', sub: 'Protected Main', cmd: "checkout scm" },
      { num: '02', title: 'Go Build & Test', sub: 'Race Detector', cmd: "sh 'go test -v -race ./... && CGO_ENABLED=0 go build -o server .'" },
      { num: '03', title: 'GolangCI-Lint', sub: 'SAST & Govuln', cmd: "sh 'golangci-lint run && govulncheck ./...'" },
      { num: '04', title: 'CycloneDX SBOM', sub: 'BOM Generation', cmd: "sh 'cyclonedx-gomod app -output bom.json'" },
      { num: '05', title: 'Distroless Build', sub: 'Zero Shell Image', cmd: "sh 'docker build -f Dockerfile.distroless -t ${REGISTRY}/${ECR_REPO}:${IMAGE_TAG} .'" },
      { num: '06', title: 'Trivy Image Scan', sub: 'CVE Verification', cmd: "sh 'trivy image --exit-code 1 --severity CRITICAL ${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}'" },
      { num: '07', title: 'Push to ECR', sub: 'Signed Registry', cmd: "docker push ${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}" },
      { num: '08', title: 'Cosign Signing', sub: 'AWS KMS Keyless', cmd: "sh 'cosign sign --key awskms://... ${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}'" },
      { num: '09', title: 'Kyverno Verify', sub: 'Admission Check', cmd: "kubectl apply -f k8s/ -n ${K8S_NAMESPACE} && kubectl rollout status deployment/${APP_NAME}" },
      { num: '10', title: 'Audit Archival', sub: 'Immutable Log', cmd: "aws s3 cp bom.json s3://fintech-audit-vault/bom-${BUILD_NUMBER}.json" }
    ]
  },
  'multibranch-pr': {
    id: 'multibranch-pr',
    name: 'Multi-Branch PR Preview + Ephemeral K8s',
    badge: '🌐 PROGRESSIVE DELIVERY',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    desc: 'Dynamic branch routing with ephemeral PR namespace provisioning, automated preview URLs, parallel lint & security matrices, and automatic namespace teardown upon pull request closure.',
    techStack: ['Multi-Branch', 'Helm 3', 'Docker', 'Trivy', 'GitHub PR Webhook', 'Ephemeral Namespaces'],
    env: {
      eksCluster: 'preview-k8s-cluster',
      awsRegion: 'us-east-1',
      awsAccountId: '123456789012',
      ecrRepo: 'ecommerce-api-pr',
      appName: 'ecommerce-api',
      k8sNamespace: 'pr-preview',
      sonarKey: 'ecommerce-api',
      slackChannel: '#pr-notifications'
    },
    flags: {
      toolJava: false,
      toolMaven: false,
      toolNode: true,
      toolNodeVer: 'node-20',
      toolPython: false,
      secSonar: true,
      secTrivy: true,
      secSnyk: false,
      scanSonar: true,
      scanTrivy: true,
      useDocker: true,
      enhK8s: true,
      enhSonarGate: false,
      enhSlack: true
    },
    flowSteps: [
      { num: '01', title: 'Checkout PR Branch', sub: 'Change Request', cmd: "checkout scm" },
      { num: '02', title: 'Parallel Tests', sub: 'Unit & Lint', cmd: "parallel { stage('Lint') { sh 'npm run lint' }; stage('Test') { sh 'npm test' } }" },
      { num: '03', title: 'Trivy PR Audit', sub: 'Diff Security', cmd: "sh 'trivy fs --severity HIGH,CRITICAL .'" },
      { num: '04', title: 'Build PR Image', sub: 'Ephemeral Tag', cmd: "sh 'docker build -t ${ECR_REPO}:pr-${CHANGE_ID} .'" },
      { num: '05', title: 'Push PR Registry', sub: 'ECR Push', cmd: "docker push ${REGISTRY}/${ECR_REPO}:pr-${CHANGE_ID}" },
      { num: '06', title: 'Create PR Namespace', sub: 'k8s Ephemeral', cmd: "sh 'kubectl create namespace pr-${CHANGE_ID} --dry-run=client -o yaml | kubectl apply -f -'" },
      { num: '07', title: 'Helm Deploy Preview', sub: 'Dynamic Domain', cmd: "sh 'helm upgrade --install pr-${CHANGE_ID} ./helm --namespace pr-${CHANGE_ID} --set image.tag=pr-${CHANGE_ID}'" },
      { num: '08', title: 'Smoke Test URL', sub: 'HTTP 200 Probe', cmd: "sh 'curl -f https://pr-${CHANGE_ID}.preview.talaripradeep.info/healthz'" },
      { num: '09', title: 'Comment GitHub PR', sub: 'Bot Webhook', cmd: "sh 'gh pr comment ${CHANGE_ID} --body \"🚀 PR Preview Ready: https://pr-${CHANGE_ID}.preview.talaripradeep.info\"'" },
      { num: '10', title: 'Teardown Hook', sub: 'Resource Reclaim', cmd: "post { always { cleanWs() } }" }
    ]
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    renderProjectBlueprints();
    renderCustomEnvTable();
    setupInteractiveListeners();
    loadProjectBlueprint('springboot-eks');
  });
}

// Setup input listeners
function setupInteractiveListeners() {
  $('agent_any')?.addEventListener('change', function() {
    if (this.checked) {
      $('agent_custom').checked = false;
      $('custom-agent-name-box').classList.add('hidden');
    }
    triggerCompileAll();
  });

  $('agent_custom')?.addEventListener('change', function() {
    if (this.checked) {
      $('agent_any').checked = false;
      $('custom-agent-name-box').classList.remove('hidden');
    } else {
      $('custom-agent-name-box').classList.add('hidden');
    }
    triggerCompileAll();
  });

  // Watch real-time parameters
  ['rt_eks_cluster', 'rt_aws_region', 'rt_aws_account', 'rt_ecr_repo', 'rt_app_name', 'rt_k8s_namespace', 'rt_sonar_key', 'rt_slack_channel'].forEach(id => {
    $(id)?.addEventListener('input', () => {
      triggerCompileAll();
    });
  });

  setupCompilerTriggers(triggerCompileAll);
}

// Render Project Blueprint Cards
export function renderProjectBlueprints() {
  const container = $('project-blueprints-container');
  if (!container) return;

  const projectKeys = Object.keys(REALTIME_PROJECTS);
  container.innerHTML = projectKeys.map(key => {
    const proj = REALTIME_PROJECTS[key];
    const isActive = key === activeProjectId;
    return `
      <div class="blueprint-card p-4 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}" onclick="selectProjectBlueprint('${proj.id}')" data-proj="${proj.id}">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${proj.badgeColor}">${proj.badge}</span>
          <span class="text-xs text-slate-400 font-mono">${proj.flowSteps.length} Stages</span>
        </div>
        <h4 class="font-bold text-sm text-slate-900 mb-1.5">${proj.name}</h4>
        <p class="text-xs text-slate-600 line-clamp-2 mb-3">${proj.desc}</p>
        <div class="flex flex-wrap gap-1">
          ${proj.techStack.map(t => `<span class="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${t}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Select and load a real-time project blueprint
export function selectProjectBlueprint(projectId) {
  if (!REALTIME_PROJECTS[projectId]) projectId = 'springboot-eks';
  activeProjectId = projectId;
  loadProjectBlueprint(projectId);
  showToast(`✅ Loaded Blueprint: ${REALTIME_PROJECTS[projectId].name}`);
}

function loadProjectBlueprint(projectId) {
  const proj = REALTIME_PROJECTS[projectId];
  if (!proj) return;

  // Update card active states
  document.querySelectorAll('.blueprint-card').forEach(card => {
    if (card.getAttribute('data-proj') === projectId) {
      card.className = 'blueprint-card p-4 rounded-xl border transition-all cursor-pointer bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20';
    } else {
      card.className = 'blueprint-card p-4 rounded-xl border transition-all cursor-pointer bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm';
    }
  });

  // Populate Real-Time parameters
  if ($('rt_eks_cluster')) $('rt_eks_cluster').value = proj.env.eksCluster;
  if ($('rt_aws_region')) $('rt_aws_region').value = proj.env.awsRegion;
  if ($('rt_aws_account')) $('rt_aws_account').value = proj.env.awsAccountId;
  if ($('rt_ecr_repo')) $('rt_ecr_repo').value = proj.env.ecrRepo;
  if ($('rt_app_name')) $('rt_app_name').value = proj.env.appName;
  if ($('rt_k8s_namespace')) $('rt_k8s_namespace').value = proj.env.k8sNamespace;
  if ($('rt_sonar_key')) $('rt_sonar_key').value = proj.env.sonarKey;
  if ($('rt_slack_channel')) $('rt_slack_channel').value = proj.env.slackChannel;

  // Populate form flags
  if ($('tool_java')) $('tool_java').checked = proj.flags.toolJava;
  if ($('tool_java_version')) $('tool_java_version').value = proj.flags.toolJavaVer || 'JDK17';
  if ($('tool_maven')) $('tool_maven').checked = proj.flags.toolMaven;
  if ($('tool_maven_version')) $('tool_maven_version').value = proj.flags.toolMavenVer || 'maven-3.9';
  if ($('tool_node')) $('tool_node').checked = proj.flags.toolNode;
  if ($('tool_node_version')) $('tool_node_version').value = proj.flags.toolNodeVer || 'node-20';
  if ($('tool_python')) $('tool_python').checked = proj.flags.toolPython;
  if ($('sectool_sonar')) $('sectool_sonar').checked = proj.flags.secSonar;
  if ($('sectool_trivy')) $('sectool_trivy').checked = proj.flags.secTrivy;
  if ($('sectool_snyk')) $('sectool_snyk').checked = proj.flags.secSnyk;
  if ($('sec_sonar_scan')) $('sec_sonar_scan').checked = proj.flags.scanSonar;
  if ($('sec_trivy_scan')) $('sec_trivy_scan').checked = proj.flags.scanTrivy;
  if ($('docker_cli')) $('docker_cli').checked = proj.flags.useDocker;
  if ($('enh_k8s')) $('enh_k8s').checked = proj.flags.enhK8s;
  if ($('enh_sonar_gate')) $('enh_sonar_gate').checked = proj.flags.enhSonarGate;
  if ($('enh_slack')) $('enh_slack').checked = proj.flags.enhSlack;

  // Render Horizontal Pipeline Flow Tracker
  renderPipelineFlowTrack(proj);

  // Reset simulation state
  resetSimulation();

  // Compile all
  triggerCompileAll();
}

// Render Horizontal Pipeline Flow Tracker (Matching the user's image bottom bar)
function renderPipelineFlowTrack(proj) {
  const track = $('pipeline-flow-track');
  if (!track) return;

  track.innerHTML = proj.flowSteps.map((st, i) => `
    <div class="flow-stage-chip flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs transition cursor-pointer hover:border-indigo-400" id="stage-chip-${i}" onclick="inspectStageCode(${i})">
      <span class="font-mono text-[10px] text-indigo-400 font-bold">${st.num}</span>
      <div class="flex flex-col">
        <span class="font-bold text-slate-100 text-[11px] whitespace-nowrap">${st.title}</span>
        <span class="text-[9px] text-slate-400 whitespace-nowrap">${st.sub}</span>
      </div>
      <span class="status-dot w-2 h-2 rounded-full bg-slate-600 ml-1" id="stage-dot-${i}"></span>
    </div>
    ${i < proj.flowSteps.length - 1 ? '<span class="text-slate-600 font-mono text-xs flex-shrink-0">→</span>' : ''}
  `).join('');
}

// Inspect a specific stage code
export function inspectStageCode(stepIdx) {
  const proj = REALTIME_PROJECTS[activeProjectId];
  if (!proj || !proj.flowSteps[stepIdx]) return;
  const st = proj.flowSteps[stepIdx];
  showToast(`Stage ${st.num} [${st.title}]: ${st.cmd.slice(0, 45)}...`);
}

// Custom Env Variables Table
function renderCustomEnvTable() {
  const tbody = $('custom-env-tbody');
  if (!tbody) return;
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

// Master compilation
export function triggerCompileAll() {
  compileJenkinsfile();
  compileSonar();
  compileK8sManifest();
  compileDockerfile();
  compileMermaidFlow();
  compileConsoleLog();
  updateViewportContent();
}

// Compile Jenkinsfile
function compileJenkinsfile() {
  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];

  const eksCluster = $('rt_eks_cluster')?.value.trim() || proj.env.eksCluster;
  const awsRegion = $('rt_aws_region')?.value.trim() || proj.env.awsRegion;
  const awsAccount = $('rt_aws_account')?.value.trim() || proj.env.awsAccountId;
  const ecrRepo = $('rt_ecr_repo')?.value.trim() || proj.env.ecrRepo;
  const appName = $('rt_app_name')?.value.trim() || proj.env.appName;
  const k8sNamespace = $('rt_k8s_namespace')?.value.trim() || proj.env.k8sNamespace;
  const sonarKey = $('rt_sonar_key')?.value.trim() || proj.env.sonarKey;

  const isAgentCustom = $('agent_custom')?.checked;
  const agentLabel = $('agent_label')?.value.trim() || 'aws-sre-runner';

  // If springboot-eks, output the exact production architecture script matching user image
  if (activeProjectId === 'springboot-eks') {
    let script = `pipeline {\n`;
    script += isAgentCustom ? `  agent { label '${agentLabel}' }\n` : `  agent any\n`;
    script += `  environment {\n`;
    script += `    EKS_CLUSTER    = '${eksCluster}'\n`;
    script += `    AWS_REGION     = '${awsRegion}'\n`;
    script += `    AWS_ACCOUNT_ID = '${awsAccount}'\n`;
    script += `    ECR_REPOSITORY = '${ecrRepo}'\n`;
    script += `    IMAGE_TAG      = "v1.0.\${BUILD_NUMBER}"\n`;
    script += `    APP_NAME       = '${appName}'\n`;
    script += `    K8S_NAMESPACE  = '${k8sNamespace}'\n`;

    customEnvVars.forEach(v => {
      if (v.name.trim()) script += `    ${v.name.trim()} = '${v.value.trim()}'\n`;
    });

    script += `  }\n\n`;
    script += `  stages {\n`;
    script += `    stage('1. Checkout Source') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Checking out code from GitHub'\n`;
    script += `        git branch: 'main', credentialsId: 'github-creds', url: 'https://github.com/Pradeeptalari14/portfolio.git'\n`;
    script += `      }\n`;
    script += `    }\n\n`;
    script += `    stage('2. Maven Build') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Building the application with Maven'\n`;
    script += `        sh 'mvn clean package -DskipTests'\n`;
    script += `      }\n`;
    script += `    }\n\n`;
    script += `    stage('3. SonarQube Scan') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Running SonarQube analysis'\n`;
    script += `        withSonarQubeEnv('SonarQube') {\n`;
    script += `          sh 'mvn sonar:sonar -Dsonar.projectKey=${sonarKey}'\n`;
    script += `        }\n`;
    script += `      }\n`;
    script += `    }\n\n`;
    script += `    stage('4. Trivy File Scan') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Scanning project files with Trivy'\n`;
    script += `        sh 'trivy fs .'\n`;
    script += `      }\n`;
    script += `    }\n\n`;
    script += `    stage('5. Docker Build') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Building Docker image'\n`;
    script += `        sh 'docker build -t \${ECR_REPOSITORY}:\${IMAGE_TAG} .'\n`;
    script += `      }\n`;
    script += `    }\n\n`;
    script += `    stage('6. Trivy Image Scan') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Scanning Docker image with Trivy'\n`;
    script += `        sh 'trivy image \${ECR_REPOSITORY}:\${IMAGE_TAG}'\n`;
    script += `      }\n`;
    script += `    }\n\n`;
    script += `    stage('7. Push Image to Amazon ECR') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Pushing Docker image to Amazon ECR'\n`;
    script += `        withCredentials([\n`;
    script += `          [class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']\n`;
    script += `        ]) {\n`;
    script += `          sh '''\n`;
    script += `            aws ecr get-login-password --region \${AWS_REGION} | docker login --username AWS --password-stdin \${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com\n`;
    script += `            docker tag \${ECR_REPOSITORY}:\${IMAGE_TAG} \${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com/\${ECR_REPOSITORY}:\${IMAGE_TAG}\n`;
    script += `            docker push \${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com/\${ECR_REPOSITORY}:\${IMAGE_TAG}\n`;
    script += `          '''\n`;
    script += `        }\n`;
    script += `      }\n`;
    script += `    }\n\n`;
    script += `    stage('8. Deploy to Amazon EKS') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Deploying to Amazon EKS'\n`;
    script += `        sh '''\n`;
    script += `          aws eks update-kubeconfig --region \${AWS_REGION} --name \${EKS_CLUSTER}\n`;
    script += `          kubectl set image deployment/\${APP_NAME} \${APP_NAME}=\${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com/\${ECR_REPOSITORY}:\${IMAGE_TAG} -n \${K8S_NAMESPACE}\n`;
    script += `        '''\n`;
    script += `      }\n`;
    script += `    }\n\n`;
    script += `    stage('9. Verify Deployment') {\n`;
    script += `      steps {\n`;
    script += `        echo 'Verifying deployment'\n`;
    script += `        sh 'kubectl rollout status deployment/\${APP_NAME} -n \${K8S_NAMESPACE} --timeout=120s'\n`;
    script += `        sh 'kubectl get pods -n \${K8S_NAMESPACE}'\n`;
    script += `        sh 'kubectl get svc -n \${K8S_NAMESPACE}'\n`;
    script += `      }\n`;
    script += `    }\n`;
    script += `  }\n\n`;
    script += `  post {\n`;
    script += `    success {\n`;
    script += `      echo "✅ SUCCESS: \${JOB_NAME} #\${BUILD_NUMBER}"\n`;
    script += `      sh 'curl -X POST -H "Content-Type: application/json" -d \\'{"status":"SUCCESS","build":"\\'"\${BUILD_NUMBER}"\\'"}\\' https://webhook.site/notification'\n`;
    script += `    }\n`;
    script += `    failure {\n`;
    script += `      echo 'Cleaning workspace'\n`;
    script += `      cleanWs()\n`;
    script += `    }\n`;
    script += `  }\n`;
    script += `}\n`;

    compiledCode.jenkinsfile = script;
    return;
  }

  // Generic dynamic pipeline generator for other blueprints
  let code = `pipeline {\n`;
  code += isAgentCustom ? `    agent { label '${agentLabel}' }\n\n` : `    agent any\n\n`;

  // Tools block
  let toolsBlock = '';
  if ($('tool_java')?.checked) toolsBlock += `        jdk '${$('tool_java_version')?.value || 'JDK17'}'\n`;
  if ($('tool_maven')?.checked) toolsBlock += `        maven '${$('tool_maven_version')?.value || 'maven-3.9'}'\n`;
  if ($('tool_node')?.checked) toolsBlock += `        nodejs '${$('tool_node_version')?.value || 'node-20'}'\n`;
  if ($('tool_python')?.checked) toolsBlock += `        python 'python3'\n`;
  if (toolsBlock) code += `    tools {\n${toolsBlock}    }\n\n`;

  // Environment block
  code += `    environment {\n`;
  code += `        APP_NAME       = '${appName}'\n`;
  code += `        ECR_REPOSITORY = '${ecrRepo}'\n`;
  code += `        AWS_REGION     = '${awsRegion}'\n`;
  code += `        AWS_ACCOUNT_ID = '${awsAccount}'\n`;
  code += `        EKS_CLUSTER    = '${eksCluster}'\n`;
  code += `        K8S_NAMESPACE  = '${k8sNamespace}'\n`;
  code += `        IMAGE_TAG      = "v1.0.\${BUILD_NUMBER}"\n`;

  customEnvVars.forEach(v => {
    if (v.name.trim()) code += `        ${v.name.trim()} = '${v.value.trim()}'\n`;
  });
  code += `    }\n\n`;

  code += `    stages {\n`;
  proj.flowSteps.forEach(st => {
    code += `        stage('${st.num}. ${st.title}') {\n`;
    code += `            steps {\n`;
    code += `                echo '${st.title}: ${st.sub}'\n`;
    code += `                ${st.cmd.includes('sh ') || st.cmd.includes('checkout') || st.cmd.includes('parallel') || st.cmd.includes('withSonarQube') ? st.cmd : `sh '${st.cmd}'`}\n`;
    code += `            }\n`;
    code += `        }\n\n`;
  });
  code += `    }\n\n`;

  code += `    post {\n`;
  code += `        always {\n            cleanWs()\n        }\n`;
  code += `        success {\n            echo "✅ Pipeline successfully executed."\n        }\n`;
  code += `        failure {\n            echo "❌ Pipeline failed at stage."\n        }\n`;
  code += `    }\n`;
  code += `}\n`;

  compiledCode.jenkinsfile = code;
}

// Compile Sonar project properties
function compileSonar() {
  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];
  const sonarKey = $('rt_sonar_key')?.value.trim() || proj.env.sonarKey;

  let code = `# SonarQube Static Analysis Properties\n`;
  code += `sonar.projectKey=${sonarKey}\n`;
  code += `sonar.projectName=${proj.name}\n`;
  code += `sonar.projectVersion=2.4.0\n`;
  code += `sonar.sources=.\n`;
  code += `sonar.exclusions=**/target/**, **/dist/**, **/node_modules/**, **/*.spec.ts, **/tests/**\n`;
  code += `sonar.sourceEncoding=UTF-8\n`;
  code += `sonar.qualitygate.wait=true\n`;
  code += `sonar.java.binaries=target/classes\n`;
  compiledCode.sonar = code;
}

// Compile Kubernetes Deployment Manifest
function compileK8sManifest() {
  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];
  const appName = $('rt_app_name')?.value.trim() || proj.env.appName;
  const ecrRepo = $('rt_ecr_repo')?.value.trim() || proj.env.ecrRepo;
  const awsAccount = $('rt_aws_account')?.value.trim() || proj.env.awsAccountId;
  const awsRegion = $('rt_aws_region')?.value.trim() || proj.env.awsRegion;
  const k8sNamespace = $('rt_k8s_namespace')?.value.trim() || proj.env.k8sNamespace;

  let k8s = `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${appName}\n  namespace: ${k8sNamespace}\n  labels:\n    app: ${appName}\n    managed-by: jenkins-devsecops\nspec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0\n  selector:\n    matchLabels:\n      app: ${appName}\n  template:\n    metadata:\n      labels:\n        app: ${appName}\n    spec:\n      securityContext:\n        runAsNonRoot: true\n        runAsUser: 10001\n        fsGroup: 10001\n      containers:\n        - name: ${appName}\n          image: ${awsAccount}.dkr.ecr.${awsRegion}.amazonaws.com/${ecrRepo}:v1.0.100\n          imagePullPolicy: IfNotPresent\n          ports:\n            - containerPort: 8080\n              name: http\n          resources:\n            requests:\n              cpu: "250m"\n              memory: "512Mi"\n            limits:\n              cpu: "1000m"\n              memory: "1024Mi"\n          readinessProbe:\n            httpGet:\n              path: /actuator/health/readiness\n              port: 8080\n            initialDelaySeconds: 15\n            periodSeconds: 10\n          livenessProbe:\n            httpGet:\n              path: /actuator/health/liveness\n              port: 8080\n            initialDelaySeconds: 30\n            periodSeconds: 15\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: ${appName}-svc\n  namespace: ${k8sNamespace}\nspec:\n  type: ClusterIP\n  selector:\n    app: ${appName}\n  ports:\n    - port: 80\n      targetPort: 8080\n      name: http\n`;

  compiledCode.k8s = k8s;
}

// Compile Production Dockerfile
function compileDockerfile() {
  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];
  let df = '';

  if (activeProjectId === 'springboot-eks') {
    df = `# Multi-Stage Production Build for Spring Boot\nFROM eclipse-temurin:17-jdk-alpine AS builder\nWORKDIR /build\nCOPY pom.xml ./\nCOPY src ./src\nRUN apk add --no-cache maven && mvn clean package -DskipTests\n\nFROM eclipse-temurin:17-jre-alpine AS runner\nWORKDIR /app\nRUN addgroup -S appgroup && adduser -S appuser -G appgroup\nUSER appuser:appgroup\nCOPY --from=builder /build/target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]\n`;
  } else if (activeProjectId === 'nodejs-react') {
    df = `# Multi-Stage Node.js & Nginx Production Dockerfile\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:1.25-alpine AS runner\nCOPY --from=builder /app/dist /usr/share/nginx/html\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]\n`;
  } else if (activeProjectId === 'python-vllm-ai') {
    df = `# GPU Serving Dockerfile for vLLM & FastAPI\nFROM nvidia/cuda:12.4.1-runtime-ubuntu22.04\nWORKDIR /app\nRUN apt-get update && apt-get install -y python3-pip && rm -rf /var/lib/apt/lists/*\nCOPY requirements.txt .\nRUN pip3 install --no-cache-dir -r requirements.txt vllm\nCOPY . .\nUSER 1000\nEXPOSE 8000\nCMD ["python3", "-m", "vllm.entrypoints.openai.api_server", "--model", "meta-llama/Llama-3-8B-Instruct", "--port", "8000"]\n`;
  } else {
    df = `# Multi-Stage Distroless Go Dockerfile\nFROM golang:1.23-alpine AS builder\nWORKDIR /build\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server .\n\nFROM gcr.io/distroless/static-debian12\nWORKDIR /\nCOPY --from=builder /build/server /server\nUSER 65532:65532\nEXPOSE 8080\nENTRYPOINT ["/server"]\n`;
  }

  compiledCode.dockerfile = df;
}

// Compile Visual Mermaid Flow
function compileMermaidFlow() {
  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];
  let chart = 'flowchart LR\n';
  chart += '  classDef stage fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;\n';
  chart += '  classDef post fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ecfdf5;\n';

  proj.flowSteps.forEach((st, i) => {
    const id = `S${i + 1}`;
    chart += `  ${id}["${st.num}. ${st.title}<br/><small>${st.sub}</small>"]\n`;
    chart += `  class ${id} ${i === proj.flowSteps.length - 1 ? 'post' : 'stage'};\n`;
    if (i < proj.flowSteps.length - 1) {
      chart += `  S${i + 1} --> S${i + 2}\n`;
    }
  });

  compiledCode.flow = chart;
}

// Compile Real-Time Console Simulator Log
function compileConsoleLog() {
  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];
  let log = `Started by user Talari Pradeep (Senior Platform Architect)\n`;
  log += `[Pipeline] Start of Pipeline\n`;
  log += `[Pipeline] Running on k8s-agent-9b48c in /home/jenkins/agent/workspace/${proj.env.appName}\n`;
  log += `[Pipeline] Selected Blueprint: ${proj.name}\n\n`;

  proj.flowSteps.forEach((st, i) => {
    log += `[STAGE ${st.num}/10: ${st.title}]\n`;
    log += `$ ${st.cmd.slice(0, 80)}\n`;
    log += `>> [STATUS: SUCCESS] Duration: ${(Math.random() * 4 + 1).toFixed(1)}s\n\n`;
  });

  log += `[Pipeline] Finished: SUCCESS (0 errors, 100% security quality gates passed)\n`;
  compiledCode.console = log;
}

// Switch IDE Tabs
export function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId)?.classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'flow') {
    if (nameBox) nameBox.value = 'pipeline-flow';
    if (extTag) extTag.textContent = '.mermaid';
  } else if (tabId === 'jenkinsfile') {
    if (nameBox) nameBox.value = 'Jenkinsfile';
    if (extTag) extTag.textContent = '';
  } else if (tabId === 'sonar') {
    if (nameBox) nameBox.value = 'sonar-project';
    if (extTag) extTag.textContent = '.properties';
  } else if (tabId === 'k8s') {
    if (nameBox) nameBox.value = 'deployment';
    if (extTag) extTag.textContent = '.yaml';
  } else if (tabId === 'dockerfile') {
    if (nameBox) nameBox.value = 'Dockerfile';
    if (extTag) extTag.textContent = '';
  } else if (tabId === 'console') {
    if (nameBox) nameBox.value = 'console-execution';
    if (extTag) extTag.textContent = '.log';
  }
  updateViewportContent();
}

// Update Viewport
function updateViewportContent() {
  const outputBox = $('output-box');
  const mermaidContainer = $('mermaid-container');
  const consoleContainer = $('console-simulator-container');

  if (!outputBox) return;

  if (activeTab === 'flow') {
    outputBox.classList.add('hidden');
    consoleContainer?.classList.add('hidden');
    mermaidContainer?.classList.remove('hidden');

    if (mermaidContainer) {
      mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({ nodes: [mermaidContainer.querySelector('.mermaid')] });
        } catch (e) {
          mermaidContainer.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">${e.message}\n\n${compiledCode.flow}</pre>`;
        }
      }
    }
  } else if (activeTab === 'console') {
    outputBox.classList.add('hidden');
    mermaidContainer?.classList.add('hidden');
    consoleContainer?.classList.remove('hidden');
  } else {
    outputBox.classList.remove('hidden');
    mermaidContainer?.classList.add('hidden');
    consoleContainer?.classList.add('hidden');
    outputBox.textContent = compiledCode[activeTab] || '# No code generated for this tab';
  }
}

// Real-Time Simulation Stepper & Runner
export function runRealTimeSimulation() {
  if (isSimulating) return;
  switchTab('console');
  isSimulating = true;
  currentSimStep = 0;

  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];
  const consoleBox = $('console-log-stream');
  if (consoleBox) {
    consoleBox.innerHTML = `
      <div class="text-indigo-400">[Pipeline] Initiating Real-Time Execution for: ${proj.name}</div>
      <div class="text-slate-400">[Agent] k8s-pod-agent-77a on node-pool-production (Allocated: 2 CPU, 4GB RAM)</div>
    `;
  }

  // Update button state
  const btnRun = $('btn-run-sim');
  if (btnRun) btnRun.innerHTML = '<span>⏳ Executing Stages...</span>';

  simulationInterval = setInterval(() => {
    if (currentSimStep >= proj.flowSteps.length) {
      clearInterval(simulationInterval);
      isSimulating = false;
      if (btnRun) btnRun.innerHTML = '<span>▶️ Re-Run Simulation</span>';
      showToast('🎉 Real-Time Pipeline Execution Completed: SUCCESS');

      if (consoleBox) {
        const doneLine = document.createElement('div');
        doneLine.className = 'text-emerald-400 font-bold mt-2';
        doneLine.textContent = `[Pipeline] Finished: SUCCESS. 100% Quality Gates Passed. Deployment Active.`;
        consoleBox.appendChild(doneLine);
        consoleBox.scrollTop = consoleBox.scrollHeight;
      }
      return;
    }

    stepSimulationStage();
  }, 950);
}

export function stepSimulationStage() {
  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];
  if (currentSimStep >= proj.flowSteps.length) return;

  const st = proj.flowSteps[currentSimStep];
  const consoleBox = $('console-log-stream');

  // Highlight stage chip in flow track
  document.querySelectorAll('.flow-stage-chip').forEach((c, idx) => {
    const dot = $(`stage-dot-${idx}`);
    if (idx < currentSimStep) {
      c.classList.add('border-emerald-500');
      c.classList.remove('border-indigo-400');
      if (dot) dot.className = 'status-dot w-2 h-2 rounded-full bg-emerald-400';
    } else if (idx === currentSimStep) {
      c.classList.add('border-indigo-400', 'bg-indigo-950/60');
      if (dot) dot.className = 'status-dot w-2 h-2 rounded-full bg-indigo-400 animate-pulse';
    } else {
      c.classList.remove('border-indigo-400', 'border-emerald-500', 'bg-indigo-950/60');
      if (dot) dot.className = 'status-dot w-2 h-2 rounded-full bg-slate-600';
    }
  });

  if (consoleBox) {
    const stageLog = document.createElement('div');
    stageLog.className = 'p-2 my-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono';
    stageLog.innerHTML = `
      <div class="text-indigo-400 font-bold flex justify-between">
        <span>[STAGE ${st.num}/10] ${st.title} (${st.sub})</span>
        <span class="text-emerald-400">PASSED</span>
      </div>
      <div class="text-slate-300 mt-1">$ ${escapeHtml(st.cmd)}</div>
      <div class="text-slate-500 text-[10px] mt-0.5">&gt;&gt; Audit exitCode=0 • Duration: ${(Math.random() * 2 + 0.8).toFixed(1)}s</div>
    `;
    consoleBox.appendChild(stageLog);
    consoleBox.scrollTop = consoleBox.scrollHeight;
  }

  currentSimStep++;
}

export function resetSimulation() {
  if (simulationInterval) clearInterval(simulationInterval);
  isSimulating = false;
  currentSimStep = 0;

  const btnRun = $('btn-run-sim');
  if (btnRun) btnRun.innerHTML = '<span>▶️ Run Live Simulation</span>';

  document.querySelectorAll('.flow-stage-chip').forEach((c, idx) => {
    c.classList.remove('border-indigo-400', 'border-emerald-500', 'bg-indigo-950/60');
    const dot = $(`stage-dot-${idx}`);
    if (dot) dot.className = 'status-dot w-2 h-2 rounded-full bg-slate-600';
  });

  const consoleBox = $('console-log-stream');
  if (consoleBox) {
    consoleBox.innerHTML = `
      <div class="text-slate-400 font-mono text-xs"># Real-Time Execution Console Ready.</div>
      <div class="text-slate-500 font-mono text-xs"># Click "▶ Run Live Simulation" above to step through all 10 stages live with authentic log outputs.</div>
    `;
  }
}

// Copy active tab content
export function copyActiveTabContent() {
  const content = compiledCode[activeTab] || '';
  navigator.clipboard.writeText(content).then(() => {
    showToast('✅ Copied file to clipboard!');
  });
}

// Download single file
export function downloadActiveFile() {
  const content = compiledCode[activeTab] || '';
  let filename = 'Jenkinsfile';
  if (activeTab === 'sonar') filename = 'sonar-project.properties';
  else if (activeTab === 'k8s') filename = 'deployment.yaml';
  else if (activeTab === 'dockerfile') filename = 'Dockerfile';
  else if (activeTab === 'flow') filename = 'pipeline-flow.mermaid';
  else if (activeTab === 'console') filename = 'console-execution.log';

  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  showToast(`⬇️ Downloaded ${filename}`);
}

// Export All Files in ZIP
export function exportAllZip() {
  if (typeof JSZip === 'undefined') {
    showToast('⚠️ JSZip library loading, please retry in a moment');
    return;
  }
  const zip = new JSZip();
  zip.file('Jenkinsfile', compiledCode.jenkinsfile);
  zip.file('sonar-project.properties', compiledCode.sonar);
  zip.file('deployment.yaml', compiledCode.k8s);
  zip.file('Dockerfile', compiledCode.dockerfile);
  zip.file('pipeline-flow.mermaid', compiledCode.flow);

  zip.generateAsync({ type: 'blob' }).then(content => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${activeProjectId}-pipeline-artifacts.zip`;
    a.click();
    showToast(`📦 Exported ZIP: ${activeProjectId}-pipeline-artifacts.zip`);
  });
}

export function exportEnvBlock() {
  const proj = REALTIME_PROJECTS[activeProjectId] || REALTIME_PROJECTS['springboot-eks'];
  let code = `environment {\n`;
  code += `    EKS_CLUSTER    = '${$('rt_eks_cluster')?.value || proj.env.eksCluster}'\n`;
  code += `    AWS_REGION     = '${$('rt_aws_region')?.value || proj.env.awsRegion}'\n`;
  code += `    AWS_ACCOUNT_ID = '${$('rt_aws_account')?.value || proj.env.awsAccountId}'\n`;
  code += `    ECR_REPOSITORY = '${$('rt_ecr_repo')?.value || proj.env.ecrRepo}'\n`;
  code += `    APP_NAME       = '${$('rt_app_name')?.value || proj.env.appName}'\n`;
  code += `    K8S_NAMESPACE  = '${$('rt_k8s_namespace')?.value || proj.env.k8sNamespace}'\n`;
  customEnvVars.forEach(item => {
    if (item.name.trim()) code += `    ${item.name.trim()} = '${item.value.trim()}'\n`;
  });
  code += `}\n`;

  const blob = new Blob([code], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'env-block.groovy';
  a.click();
  showToast('⬇️ Exported environment variables block!');
}

export function resetEnvVars() {
  customEnvVars = [{ name: 'SONAR_URL', value: 'http://sonar-sre-prod:9000' }];
  renderCustomEnvTable();
  triggerCompileAll();
  showToast('🔄 Reset environment variables to defaults');
}

export function clearAllFields() {
  customEnvVars = [];
  $('agent_any').checked = true;
  $('agent_custom').checked = false;
  $('custom-agent-name-box')?.classList.add('hidden');

  renderCustomEnvTable();
  triggerCompileAll();
  showToast('🗑️ Form reset to defaults');
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
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const tabExplanations = {
  'jenkinsfile': {
    title: 'Jenkins Declarative Pipeline',
    filename: 'Jenkinsfile',
    why: 'Defines real-time CI/CD execution stages: Source Checkout, Maven packaging, SonarQube SAST, Trivy CVE audits, Docker OCI builds, ECR registry pushes, and Amazon EKS rolling deploy.',
    when: 'Used to automate zero-downtime, continuous deployment across cloud Kubernetes environments.',
    where: 'Place in the root of your source repository.',
    command: '# Jenkins reads Jenkinsfile automatically on repository webhook trigger',
    practices: [
      'Enforce quality gates and CVE blockers with --exit-code 1.',
      'Use AWS IAM Roles for Service Accounts (IRSA) instead of static keys.',
      'Always clean workspace in post { always { cleanWs() } }.'
    ],
    ai_mlops: 'Automates model weights validation and containerized serving deployment.',
    flow: '[Code Push] ➔ [Maven Build] ➔ [SonarQube] ➔ [Trivy Scan] ➔ [Docker Push] ➔ [EKS Deploy]'
  },
  'sonar': {
    title: 'SonarQube Scan Properties',
    filename: 'sonar-project.properties',
    why: 'Directs SonarScanner on project identification, sources paths, and binary inspection targets.',
    when: 'Used during static code analysis to enforce clean code and zero security hotspots.',
    where: 'Root directory alongside pom.xml or package.json.',
    command: '# Executed via mvn sonar:sonar or sonar-scanner CLI',
    practices: ['Exclude test artifacts from coverage stats.', 'Maintain strict quality gates.'],
    ai_mlops: 'Scans custom Python and Java inference controllers for vulnerabilities.',
    flow: '[Source Code] ➔ [SonarScanner] ➔ [SonarQube Server] ➔ [Quality Gate Evaluation]'
  },
  'k8s': {
    title: 'Kubernetes Production Manifest',
    filename: 'deployment.yaml',
    why: 'Declaratively models Deployment, Service, and Liveness/Readiness probes for zero-downtime rolling updates.',
    when: 'Applied during the deploy stage to update cluster workloads.',
    where: 'In k8s/ or deploy/ directory in repository.',
    command: 'kubectl apply -f deployment.yaml -n <namespace>',
    practices: ['Configure resource requests and limits.', 'Run with non-root securityContext.'],
    ai_mlops: 'Configures GPU requests (nvidia.com/gpu) for model serving nodes.',
    flow: '[kubectl set image] ➔ [Kubelet Pulls Image] ➔ [Rolling Pod Replacement] ➔ [Healthcheck]'
  },
  'dockerfile': {
    title: 'Multi-Stage Production Dockerfile',
    filename: 'Dockerfile',
    why: 'Builds lightweight, secure OCI container images with unprivileged user execution.',
    when: 'Executed in the containerization stage before vulnerability scanning.',
    where: 'Repository root.',
    command: 'docker build -t <repo>:<tag> .',
    practices: ['Use multi-stage builds to exclude compiler tools from final image.', 'Run as non-root UID 10001.'],
    ai_mlops: 'Installs NVIDIA runtime drivers and optimized vLLM / PyTorch serving engines.',
    flow: '[Source Code] ➔ [Builder Stage] ➔ [Minimal Runner Stage] ➔ [Signed Image]'
  }
};

export function explainActiveTabCode() {
  const explanation = tabExplanations[activeTab] || tabExplanations['jenkinsfile'];
  if (!explanation) return;

  $('drawer-title').textContent = explanation.title;
  $('drawer-filename').textContent = explanation.filename;
  $('explain-why').innerHTML = explanation.why;
  $('explain-when').innerHTML = explanation.when;
  $('explain-where').innerHTML = explanation.where;
  $('explain-command').textContent = explanation.command;

  const practicesBox = $('explain-practices');
  if (practicesBox) {
    practicesBox.innerHTML = '';
    explanation.practices.forEach(practice => {
      const li = document.createElement('li');
      li.innerHTML = practice;
      practicesBox.appendChild(li);
    });
  }

  $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrates with SRE observability and AI workloads.';
  $('explain-flow').textContent = explanation.flow;

  const drawer = $('explanation-drawer');
  drawer?.classList.remove('translate-x-full');
  drawer?.classList.add('translate-x-0');
}

export function closeExplanationDrawer() {
  const drawer = $('explanation-drawer');
  drawer?.classList.remove('translate-x-0');
  drawer?.classList.add('translate-x-full');
}

// Expose globally for HTML inline event handlers
if (typeof window !== 'undefined') {
  window.addCustomEnvRow = addCustomEnvRow;
  window.clearAllFields = clearAllFields;
  window.closeExplanationDrawer = closeExplanationDrawer;
  window.copyActiveTabContent = copyActiveTabContent;
  window.deleteCustomEnvRow = deleteCustomEnvRow;
  window.downloadActiveFile = downloadActiveFile;
  window.escapeHtml = escapeHtml;
  window.explainActiveTabCode = explainActiveTabCode;
  window.exportAllZip = exportAllZip;
  window.exportEnvBlock = exportEnvBlock;
  window.inspectStageCode = inspectStageCode;
  window.resetEnvVars = resetEnvVars;
  window.resetSimulation = resetSimulation;
  window.runRealTimeSimulation = runRealTimeSimulation;
  window.selectProjectBlueprint = selectProjectBlueprint;
  window.stepSimulationStage = stepSimulationStage;
  window.switchTab = switchTab;
  window.triggerCompileAll = triggerCompileAll;
  window.updateCustomEnvCell = updateCustomEnvCell;
}
