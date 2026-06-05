// FluxCD GitOps Generator logic

const SCRIPT_VERSION = "1.0.0";

function initFluxCDStudio() {
  const elements = {
    repoUrl: document.getElementById('flux_repo'),
    interval: document.getElementById('flux_interval'),
    prune: document.getElementById('flux_prune'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator elements
    btnCommit: document.getElementById('btn_commit_push'),
    syncLogs: document.getElementById('sync-logs-output'),
    simStatusVal: document.getElementById('sim-status-val'),
  };

  let activeTab = 'gitrepository';

  function generateGitRepositoryYaml() {
    const url = elements.repoUrl ? elements.repoUrl.value : 'https://github.com/Pradeeptalari14/portfolio';
    const interval = elements.interval ? elements.interval.value : '1m';

    return `# FluxCD GitRepository Source - Compiled v${SCRIPT_VERSION}
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: dynamic-source
  namespace: flux-system
spec:
  interval: ${interval}
  url: "${url}"
  ref:
    branch: main
  timeout: 60s
  secretRef:
    name: git-credentials
`;
  }

  function generateKustomizationYaml() {
    const interval = elements.interval ? elements.interval.value : '1m';
    const pruneMode = elements.prune ? elements.prune.checked : true;

    return `# FluxCD Kustomization reconciliation - Compiled v${SCRIPT_VERSION}
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: cluster-reconciliation
  namespace: flux-system
spec:
  interval: ${interval}
  prune: ${pruneMode}
  sourceRef:
    kind: GitRepository
    name: dynamic-source
  path: "./deploy/production"
  targetNamespace: default
  validation: client
  timeout: 2m
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'gitrepository') {
      elements.outputBox.textContent = generateGitRepositoryYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'gitrepository.yaml';
    } else if (activeTab === 'kustomization') {
      elements.outputBox.textContent = generateKustomizationYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'kustomization.yaml';
    }
  }

  function runGitOpsSyncLoop() {
    if (!elements.syncLogs) return;

    elements.syncLogs.innerHTML = '';
    const commitId = Math.random().toString(16).substring(2, 9);
    
    const addLog = (msg, type = 'info') => {
      const el = document.createElement('div');
      el.className = type === 'error' ? 'text-rose-500' : (type === 'warn' ? 'text-amber-500' : 'text-slate-300');
      el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      elements.syncLogs.appendChild(el);
      elements.syncLogs.scrollTop = elements.syncLogs.scrollHeight;
    };

    addLog(`Git CLI: push triggered (commit=${commitId}).`);
    addLog("Flux Source Controller: reconciliation polling loop wake-up.");
    
    if (elements.simStatusVal) {
      elements.simStatusVal.textContent = 'RECONCILING...';
      elements.simStatusVal.className = 'text-xs font-bold text-cyan-500';
    }

    setTimeout(() => {
      addLog(`Flux Source Controller: fetched git reference commit hash: ${commitId}`);
      addLog("Flux Kustomize Controller: comparing target templates namespace manifest hashes.");
      
      setTimeout(() => {
        addLog("Flux Kustomize Controller: drift detected. Applying namespace overrides...");
        addLog("API Server: Deployment 'order-processor' replicas updated (3 -> 5).", "info");
        addLog("API Server: ConfigMap 'app-config' values patched.", "info");
        addLog(`Flux Kustomize Controller: reconciliation completed (commit=${commitId} synchronized)`, "info");

        if (elements.simStatusVal) {
          elements.simStatusVal.textContent = 'SYNCHRONIZED';
          elements.simStatusVal.className = 'text-xs font-bold text-emerald-500';
        }
      }, 800);
    }, 150);
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    // Toggle active classes on tab buttons
    ['gitrepository', 'kustomization', 'simulator'].forEach(tab => {
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
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.repoUrl, elements.interval, elements.prune].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.btnCommit) elements.btnCommit.addEventListener('click', runGitOpsSyncLoop);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('flux_repo')) {
    initFluxCDStudio();
  }
});
window.initFluxCDStudio = initFluxCDStudio;
