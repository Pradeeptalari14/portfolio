// Tekton CI/CD Pipeline DAG logic

const SCRIPT_VERSION = "1.0.0";

function initTektonStudio() {
  const elements = {
    trigger: document.getElementById('tekton_trigger'),
    tasks: document.getElementById('tekton_tasks'),
    pvc: document.getElementById('tekton_workspace_pvc'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator elements
    btnRun: document.getElementById('btn_run_tekton'),
    dagRender: document.getElementById('tekton-dag-render'),
    logs: document.getElementById('tekton-logs-output'),
    simStatus: document.getElementById('sim-status-val'),
  };

  let activeTab = 'pipeline';
  let isRunning = false;

  function getTasksList() {
    const taskConfig = elements.tasks ? elements.tasks.value : 'linter-test-build';
    if (taskConfig === 'linter-test-build') {
      return ['lint-code', 'run-tests', 'docker-build'];
    } else if (taskConfig === 'test-build-deploy') {
      return ['run-tests', 'docker-build', 'helm-deploy'];
    } else {
      return ['docker-build', 'trivy-scan', 'kustomize-deploy'];
    }
  }

  function generateTektonPipelineYaml() {
    const pvcSize = elements.pvc ? elements.pvc.value : '10Gi';
    const tasks = getTasksList();

    let yaml = `# Tekton Pipeline CRD - Compiled v${SCRIPT_VERSION}
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: dynamic-cicd-pipeline
  namespace: tekton-pipelines
spec:
  workspaces:
    - name: shared-workspace
  tasks:
`;

    tasks.forEach((task, idx) => {
      yaml += `    - name: ${task}-step
      taskRef:
        name: ${task}
      workspaces:
        - name: source
          workspace: shared-workspace
`;
      if (idx > 0) {
        yaml += `      runAfter:
        - ${tasks[idx - 1]}-step
`;
      }
    });

    return yaml;
  }

  function generateTektonPipelineRunYaml() {
    const triggerSrc = elements.trigger ? elements.trigger.value : 'commit';
    const pvcSize = elements.pvc ? elements.pvc.value : '10Gi';

    return `# Tekton PipelineRun CRD - Compiled v${SCRIPT_VERSION}
# Trigger Source: ${triggerSrc.toUpperCase()}
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  generateName: dynamic-cicd-pipeline-run-
  namespace: tekton-pipelines
spec:
  pipelineRef:
    name: dynamic-cicd-pipeline
  workspaces:
    - name: shared-workspace
      volumeClaimTemplate:
        spec:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: ${pvcSize}
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'pipeline') {
      elements.outputBox.textContent = generateTektonPipelineYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'pipeline.yaml';
    } else if (activeTab === 'pipelinerun') {
      elements.outputBox.textContent = generateTektonPipelineRunYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'pipelinerun.yaml';
    }
  }

  function renderDagGraph(activeNodeIdx = -1, failedNodeIdx = -1) {
    if (!elements.dagRender) return;

    const tasks = getTasksList();
    elements.dagRender.innerHTML = '';

    tasks.forEach((task, idx) => {
      const node = document.createElement('div');
      let statusClass = 'border-slate-800 bg-slate-950 text-slate-500';
      let statusIndicator = 'Pending';

      if (isRunning) {
        if (idx < activeNodeIdx) {
          statusClass = 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold';
          statusIndicator = 'Success';
        } else if (idx === activeNodeIdx) {
          statusClass = 'border-purple-500 bg-purple-950/20 text-purple-400 font-bold animate-pulse';
          statusIndicator = 'Running';
        }
      } else if (activeNodeIdx === tasks.length) {
        statusClass = 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold';
        statusIndicator = 'Success';
      }

      if (idx === failedNodeIdx) {
        statusClass = 'border-rose-500 bg-rose-950/20 text-rose-400 font-bold';
        statusIndicator = 'Failed';
      }

      node.className = `p-2.5 border rounded flex flex-col gap-1 items-center justify-center w-[30%] ${statusClass}`;
      node.innerHTML = `
        <span class="font-bold truncate text-[8px]">${task}</span>
        <span class="text-[7px] uppercase tracking-wider">${statusIndicator}</span>
      `;
      elements.dagRender.appendChild(node);
    });
  }

  function addLog(msg, type = 'info') {
    if (!elements.logs) return;
    const el = document.createElement('div');
    el.className = type === 'error' ? 'text-rose-500' : (type === 'warn' ? 'text-amber-500' : 'text-slate-300');
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    elements.logs.appendChild(el);
    elements.logs.scrollTop = elements.logs.scrollHeight;
  }

  async function executePipelineRun() {
    if (isRunning) return;
    isRunning = true;

    if (elements.logs) elements.logs.innerHTML = '';
    if (elements.simStatus) {
      elements.simStatus.textContent = 'RUNNING...';
      elements.simStatus.className = 'text-xs font-bold text-purple-500';
    }

    addLog("Tekton PipelineRun: initializing workspace claim PVC binding...");
    addLog(`Workspace volume configured: size=${elements.pvc ? elements.pvc.value : '10Gi'}`);

    const tasks = getTasksList();

    for (let i = 0; i < tasks.length; i++) {
      renderDagGraph(i);
      addLog(`Task '${tasks[i]}': starting execution step container...`, "info");
      
      await new Promise(resolve => setTimeout(resolve, 600));

      if (tasks[i] === 'lint-code') {
        addLog("Task: running syntax linter rules check...");
        addLog("linter checks: 0 security errors, all files formatted successfully.", "info");
      } else if (tasks[i] === 'run-tests') {
        addLog("Task: launching vitest tests run suite...");
        addLog("Vitest tests: 64 unit tests run, 64 tests passed successfully.", "info");
      } else if (tasks[i] === 'docker-build') {
        addLog("Task: executing dynamic docker container build...");
        addLog("docker-build: image tagged ghcr.io/app:v1.0.0 compiled.", "info");
        addLog("docker-push: successfully uploaded assets to container registry.", "info");
      } else if (tasks[i] === 'trivy-scan') {
        addLog("Task: launching container vulnerabilities scanner...");
        addLog("trivy-scan: 0 High, 2 Low vulnerabilities reported. Scan audit passed.", "info");
      } else if (tasks[i] === 'helm-deploy' || tasks[i] === 'kustomize-deploy') {
        addLog("Task: launching Kubernetes deploy controller apply...");
        addLog("k8s deploy: workload configurations patched successfully.", "info");
      }
    }

    isRunning = false;
    renderDagGraph(tasks.length);
    addLog("PipelineRun successfully executed in all tasks stages.", "info");

    if (elements.simStatus) {
      elements.simStatus.textContent = 'SUCCESS';
      elements.simStatus.className = 'text-xs font-bold text-emerald-500';
    }
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    ['pipeline', 'pipelinerun', 'simulator'].forEach(tab => {
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
      renderDagGraph();
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.trigger, elements.tasks, elements.pvc].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', () => {
      updateOutput();
      if (activeTab === 'simulator') renderDagGraph();
    });
  });

  if (elements.btnRun) elements.btnRun.addEventListener('click', executePipelineRun);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tekton_trigger')) {
    initTektonStudio();
  }
});
window.initTektonStudio = initTektonStudio;
