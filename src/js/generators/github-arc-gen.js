// GitHub Actions Runner Controller (ARC) logic

const SCRIPT_VERSION = "1.0.0";

function initGitHubArcStudio() {
  const elements = {
    targetUrl: document.getElementById('github_target'),
    minRunners: document.getElementById('min_runners'),
    maxRunners: document.getElementById('max_runners'),
    cpuLimit: document.getElementById('runner_cpu'),
    memLimit: document.getElementById('runner_mem'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator inputs
    simJobs: document.getElementById('sim_jobs_range'),
    simJobsVal: document.getElementById('sim-jobs-val'),
    simRunnersVal: document.getElementById('sim-runners-val'),
    simStatusVal: document.getElementById('sim-status-val'),
    podsGrid: document.getElementById('pods-render-grid'),
  };

  let activeTab = 'runnerset';

  function generateRunnerSetYaml() {
    const target = elements.targetUrl ? elements.targetUrl.value : 'Pradeeptalari14/portfolio';
    const min = elements.minRunners ? elements.minRunners.value : '0';
    const max = elements.maxRunners ? elements.maxRunners.value : '10';
    const cpu = elements.cpuLimit ? elements.cpuLimit.value : '1';
    const mem = elements.memLimit ? elements.memLimit.value : '2Gi';

    return `# AutoscalingRunnerSet manifest - Compiled v${SCRIPT_VERSION}
apiVersion: actions.github.com/v1alpha1
kind: AutoscalingRunnerSet
metadata:
  name: dynamic-runner-set
  namespace: arc-runners
spec:
  githubConfigUrl: "https://github.com/${target}"
  minRunners: ${min}
  maxRunners: ${max}
  template:
    spec:
      containers:
        - name: runner
          image: ghcr.io/actions/actions-runner:latest
          command: ["/home/runner/run.sh"]
          resources:
            limits:
              cpu: "${cpu}"
              memory: "${mem}"
            requests:
              cpu: "${Math.max(0.1, parseFloat(cpu) / 2)}"
              memory: "${mem}"
`;
  }

  function generateHelmCommands() {
    const target = elements.targetUrl ? elements.targetUrl.value : 'Pradeeptalari14/portfolio';
    return `# Actions Runner Controller (ARC) Helm deployment guide
# 1. Add Actions Runner Controller repository
helm repo add actions-runner-controller https://actions-runner-controller.github.io/actions-runner-controller
helm repo update

# 2. Install ARC operator manager
helm upgrade --install arc-operator actions-runner-controller/gha-runner-scale-operator \\
  --namespace arc-systems --create-namespace

# 3. Provision secure personal access token credentials
kubectl create secret generic pre-defined-secret \\
  --namespace arc-runners \\
  --from-literal=github_token="ghp_secureTokenKeyHere123456"

# 4. Deploy the dynamic runner set values
helm upgrade --install runner-set actions-runner-controller/gha-runner-scale-operator-instance \\
  --namespace arc-runners --create-namespace \\
  --set githubConfigUrl="https://github.com/${target}" \\
  --set githubConfigSecret="pre-defined-secret"
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'runnerset') {
      elements.outputBox.textContent = generateRunnerSetYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'runnerset.yaml';
    } else if (activeTab === 'cli') {
      elements.outputBox.textContent = generateHelmCommands();
      if (elements.downloadInput) elements.downloadInput.value = 'deploy-arc.sh';
    }
  }

  // Workload runner scaling rendering
  function runRunnerAutoscaleSimulator() {
    if (!elements.podsGrid) return;

    const jobsCount = parseInt(elements.simJobs ? elements.simJobs.value : '0', 10);
    const min = parseInt(elements.minRunners ? elements.minRunners.value : '0', 10);
    const max = parseInt(elements.maxRunners ? elements.maxRunners.value : '10', 10);

    if (elements.simJobsVal) elements.simJobsVal.textContent = jobsCount;

    let targetRunners = min;
    if (jobsCount > 0) {
      targetRunners = Math.min(max, Math.max(min, jobsCount));
    }

    if (elements.simRunnersVal) elements.simRunnersVal.textContent = targetRunners;

    if (targetRunners === 0) {
      elements.podsGrid.innerHTML = `<div class="text-slate-500 font-mono text-[10px] w-full text-center py-8">Scale-to-zero active state. Trigger simulated workflow jobs backlog.</div>`;
      if (elements.simStatusVal) {
        elements.simStatusVal.textContent = 'INACTIVE (IDLE)';
        elements.simStatusVal.className = 'text-xs font-bold text-slate-500';
      }
      return;
    }

    if (elements.simStatusVal) {
      if (jobsCount > 0 && targetRunners > min) {
        elements.simStatusVal.textContent = `RECONCILING (Active Runners: ${targetRunners})`;
        elements.simStatusVal.className = 'text-xs font-bold text-violet-500';
      } else {
        elements.simStatusVal.textContent = 'STANDBY (Min Warm Pools)';
        elements.simStatusVal.className = 'text-xs font-bold text-slate-400';
      }
    }

    elements.podsGrid.innerHTML = '';
    for (let r = 1; r <= targetRunners; r++) {
      const runnerId = Math.random().toString(36).substring(2, 7);
      const runnerDiv = document.createElement('div');
      runnerDiv.className = 'bg-slate-900 border border-purple-500/30 p-2 rounded flex flex-col gap-1.5 font-mono text-[9px] text-slate-300 w-[48%] sm:w-[31%]';
      runnerDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-white text-[8px]">Runner #${r}</span>
          <span class="text-emerald-500 font-bold uppercase text-[7px]">Active</span>
        </div>
        <div class="text-slate-400 truncate">arc-runner-${runnerId}</div>
        <div class="text-[7px] text-slate-500 border-t border-slate-800 pt-1">Processing GitHub Job...</div>
      `;
      elements.podsGrid.appendChild(runnerDiv);
    }
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    // Toggle active classes on tab buttons
    ['runnerset', 'cli', 'simulator'].forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      if (btn) {
        if (tab === tabName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    const outputBox = elements.outputBox;
    const simViewport = document.getElementById('simulator-viewport');

    if (tabName === 'simulator') {
      if (outputBox) outputBox.classList.add('hidden');
      if (simViewport) simViewport.classList.remove('hidden');
      runRunnerAutoscaleSimulator();
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.targetUrl, elements.minRunners, elements.maxRunners, elements.cpuLimit, elements.memLimit].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.simJobs) {
    elements.simJobs.addEventListener('input', runRunnerAutoscaleSimulator);
  }

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('github_target')) {
    initGitHubArcStudio();
  }
});
window.initGitHubArcStudio = initGitHubArcStudio;
