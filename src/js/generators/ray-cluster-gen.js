import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'config';

let compiledCode = {
  config: '',
  instrument: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('cluster_engine').addEventListener('change', triggerCompileAll);
  $('gpu_class').addEventListener('change', triggerCompileAll);
  $('scale_strategy').addEventListener('change', triggerCompileAll);
  $('max_nodes').addEventListener('input', triggerCompileAll);

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileConfig();
  compileInstrument();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileConfig() {
  const engine = $('cluster_engine').value;
  const gpu = $('gpu_class').value;
  const maxNodes = parseInt($('max_nodes').value) || 10;

  let code = '';
  if (engine === 'ray') {
    code = `# ray_cluster.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Ray Cluster Configuration for GPU-accelerated Distributed workloads

apiVersion: ray.io/v1
kind: RayCluster
metadata:
  name: ray-cluster-gpu
  namespace: ml-platform
spec:
  rayVersion: '2.9.0'
  headGroupSpec:
    rayStartParams:
      dashboard-host: '0.0.0.0'
    template:
      spec:
        containers:
        - name: ray-head
          image: rayproject/ray:2.9.0-py310
          resources:
            limits:
              cpu: "4"
              memory: "16Gi"
            requests:
              cpu: "2"
              memory: "8Gi"
  workerGroupSpecs:
  - groupName: gpu-workers
    replicas: 1
    minReplicas: 1
    maxReplicas: ${maxNodes}
    rayStartParams: {}
    template:
      spec:
        containers:
        - name: ray-worker
          image: rayproject/ray:2.9.0-py310-gpu
          resources:
            limits:
              cpu: "8"
              memory: "32Gi"
              nvidia.com/gpu: "1"
            requests:
              cpu: "4"
              memory: "16Gi"
              nvidia.com/gpu: "1"
        nodeSelector:
          instance-type: "gpu-${gpu}"
`;
  } else {
    code = `# kubeflow_job.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Kubeflow PyTorchJob Distributed Training Spec

apiVersion: "kubeflow.org/v1"
kind: "PyTorchJob"
metadata:
  name: "pytorch-dist-training"
  namespace: "ml-platform"
spec:
  pytorchReplicaSpecs:
    Master:
      replicas: 1
      restartPolicy: OnFailure
      template:
        spec:
          containers:
            - name: pytorch
              image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
              command:
                - "python"
                - "train.py"
                - "--epochs=10"
              resources:
                limits:
                  nvidia.com/gpu: "1"
    Worker:
      replicas: ${Math.min(maxNodes, 4)}
      restartPolicy: OnFailure
      template:
        spec:
          containers:
            - name: pytorch
              image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
              command:
                - "python"
                - "train.py"
                - "--epochs=10"
              resources:
                limits:
                  nvidia.com/gpu: "1"
          nodeSelector:
            instance-type: "gpu-${gpu}"
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const engine = $('cluster_engine').value;
  const strategy = $('scale_strategy').value;

  let code = `#!/usr/bin/env bash
# train_autoscaler.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Ray GPU Node group autoscaling verification script

set -euo pipefail

echo "==> Auditing GPU cluster usage stats..."

`;

  if (engine === 'ray') {
    code += `# Check active Ray cluster status
if ! command -v ray &> /dev/null; then
    echo "Ray CLI not found. Installing ray[default] dependency..."
    pip install ray[default]
fi

echo "Querying Ray cluster resource usage:"
ray status

# Scale worker nodes based on strategy
echo "Applying SRE Scale strategy: ${strategy.toUpperCase()}"
if [ "${strategy}" = "aggressive" ]; then
    echo "Aggressive Upscaling: Triggering proactive worker node pre-warm..."
    kubectl scale deployment ray-cluster-gpu-worker --replicas=4 -n ml-platform
else
    echo "Conservative Scaling: Allowing cluster autoscaler to scale down naturally."
fi
`;
  } else {
    code += `# Kubeflow job monitoring
echo "Querying Kubeflow PyTorchJob status..."
kubectl get pytorchjobs -n ml-platform

echo "Worker pods logs tailing:"
kubectl logs -l pytorch-replica-type=worker -n ml-platform --tail=50
`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const engine = $('cluster_engine').value;

  let md = `# Distributed ML Training Suite v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Orchestrating GPU clusters to train and scale Deep Learning models.

## Engines
- **Framework**: ${engine === 'ray' ? 'Ray Cluster Operator' : 'Kubeflow Training Operator'}
- **GPU Class**: NVIDIA GPU nodes.

## Commands
1. Deploy the cluster orchestration layer:
   \`\`\`bash
   kubectl apply -f ray_cluster.yaml
   \`\`\`
2. Monitor training workloads scaling:
   \`\`\`bash
   bash train_autoscaler.sh
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const engine = $('cluster_engine').value;

  let md = `# SRE Runbook: GPU Worker Scaling & Resource Starvation
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: GPU Out of Memory (OOM) or Pods Stuck in Pending

If training tasks fail due to GPU allocation limits or nodes fail to join the cluster:

### Step 1: Check Pod Scheduling Status
Verify why worker pods are pending allocation:
\`\`\`bash
kubectl get pods -n ml-platform -o wide
kubectl describe pod -l app=ray-worker -n ml-platform
\`\`\`
- Look for events like \`FailedScheduling\` due to insufficient \`nvidia.com/gpu\` resources.

### Step 2: Scale Worker Groups manually
If the cluster autoscaler is locked:
1. Run Ray CLI tool status to identify allocation requests:
   \`\`\`bash
   ray status --address=localhost:6379
   \`\`\`
2. Check GPU node selectors and increase instance limits inside cluster files.
3. ${engine === 'ray' ? 'Manual trigger warm nodes scaling: `kubectl scale deployment ray-cluster-gpu-worker --replicas=N`' : 'Restart PyTorchJob after scaling cluster node pool.'}

### Step 3: Run cluster validation diagnostics
\`\`\`bash
bash train_autoscaler.sh
\`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Job[🐍 Distributed Training Job] -->|Submit| Head[🧠 Ray Head Node]\n  Head -->|Schedule Tasks| Worker[🖥️ GPU Worker nodes]\n  Worker -->|Autoscaler| Scaling{{Resource Starvation?}}\n  Scaling -->|Yes| AddNode[☸️ Provision new GPU replicas]\n  Scaling -->|No| Train[⚡ Train Model]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const engine = $('cluster_engine').value;

  if (tabId === 'config') {
    nameBox.value = engine === 'ray' ? 'ray_cluster' : 'kubeflow_job';
    extTag.textContent = '.yaml';
  } else if (tabId === 'instrument') {
    nameBox.value = 'train_autoscaler';
    extTag.textContent = '.sh';
  } else if (tabId === 'readme') {
    nameBox.value = 'README';
    extTag.textContent = '.md';
  } else if (tabId === 'runbook') {
    nameBox.value = 'sre_runbook';
    extTag.textContent = '.md';
  } else if (tabId === 'flow') {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
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
    showToast('✅ Copied tab config to clipboard!');
  });
}

function downloadScriptZip() {
  const engine = $('cluster_engine').value;
  const zip = new JSZip();

  if (engine === 'ray') {
    zip.file('ray_cluster.yaml', compiledCode.config);
  } else {
    zip.file('kubeflow_job.yaml', compiledCode.config);
  }
  zip.file('train_autoscaler.sh', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ray-cluster-${engine}.zip`;
    a.click();
    showToast('⬇️ Ray Cluster SRE package downloaded!');
  });
}

function clearAllFields() {
  $('cluster_engine').value = 'ray';
  $('gpu_class').value = 'a100';
  $('scale_strategy').value = 'conservative';
  $('max_nodes').value = '10';

  switchTab('config');
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

function toggleManualItem(idx) {
  const el = $('manual-item-' + idx);
  if (el) {
    el.classList.toggle('hidden');
  }
}

function compileManual() {
  const engine = $('cluster_engine').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'ray': [
      {
        title: 'Ray Autoscale limits',
        why: 'Enforces GPU node allocation limits to balance workloads cost and training speed.',
        whyNot: 'Unregulated autoscale requests spin up unlimited GPU nodes, leading to cost overruns.',
        runtime: 'Integrates head node metrics with cluster node schedulers.'
      },
      {
        title: 'Head Node memory limits',
        why: 'Protects the central control plane from crashing when aggregating large weights arrays.',
        whyNot: 'Control head runs out of memory, shutting down the entire training job.',
        runtime: 'Sets requests limits on Head pod specifications.'
      }
    ],
    'kubeflow': [
      {
        title: 'Kubeflow PyTorchJob replicas',
        why: 'Coordinates master-worker training pools dynamically using Kubeflow CRDs.',
        whyNot: 'Isolated worker configurations cause desynchronization during epochs swaps.',
        runtime: 'Schedules distributed replica sets.'
      }
    ]
  };

  const activeData = manualData[engine] || [];
  activeData.forEach((item, idx) => {
    html += `
      <div class="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
        <button onclick="toggleManualItem(${idx})" class="w-full flex items-center justify-between font-bold text-slate-800 focus:outline-none">
          <span>⚙️ ${item.title}</span>
          <span class="text-xs text-slate-400">⚡ Info</span>
        </button>
        <div id="manual-item-${idx}" class="mt-2.5 pt-2.5 border-t border-slate-100 text-slate-600 space-y-2 hidden">
          <p><strong>Why configure:</strong> ${item.why}</p>
          <p class="text-rose-600"><strong>If left disabled:</strong> ${item.whyNot}</p>
          <p class="text-slate-500"><strong>Runtime Operation:</strong> ${item.runtime}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function explainActiveTabCode() {
  let explanation = null;
  const engine = $('cluster_engine').value;

  if (activeTab === 'config') {
    explanation = {
      'title': engine === 'ray' ? 'Ray Cluster YAML' : 'Kubeflow PyTorchJob YAML',
      'filename': engine === 'ray' ? 'ray_cluster.yaml' : 'kubeflow_job.yaml',
      'why': 'Declares GPU classes, node selector pools, and head/worker replicas scaling constraints.',
      'when': 'Deploy before starting long-running model training or fine-tuning pipelines.',
      'where': 'Apply inside Kubernetes workspaces dedicated to ML workloads.',
      'command': engine === 'ray' ? 'kubectl apply -f ray_cluster.yaml' : 'kubectl apply -f kubeflow_job.yaml',
      'practices': ['Match node selectors to active cloud instance pools.', 'Limit maximum workers size.'],
      'ai_mlops': 'Core deployment manifest configuration for MLOps platform engineers.',
      'flow': '[Apply Spec] ➔ [Schedule Head Node] ➔ [Scale Worker Nodes] ➔ [Execute Job]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'Autoscaler Verification Script',
      'filename': 'train_autoscaler.sh',
      'why': 'Validates cluster resource availability and applies scale policies based on SRE strategy.',
      'when': 'Run prior to training execution or during cluster scaling audits.',
      'where': 'Execute on administrative terminals or orchestration nodes.',
      'command': 'bash train_autoscaler.sh',
      'practices': ['Test CLI access permissions.', 'Monitor active CPU/GPU resources prior to manual scaling.'],
      'ai_mlops': 'Assists ML teams when verifying pipeline limits.',
      'flow': '[Fetch Status] ➔ [Analyze Allocation] ➔ [Verify Nodes] ➔ [Trigger Scale]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Setup Instructions Guide',
      'filename': 'README.md',
      'why': 'Guides engineers through setting up the Ray/Kubeflow operators and executing scripts.',
      'when': 'Consult when setting up fresh workspace environments.',
      'where': 'Save in pipeline root.',
      'command': '# Open in viewer',
      'practices': ['Keep commands aligned with active cluster versions.'],
      'ai_mlops': 'Platform setup guide template.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Resource Starvation Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Provides action directions for resolving GPU OOM errors and pending node allocations.',
      'when': 'Consult when training tasks stall or node scaling locks.',
      'where': 'Publish in SRE Wiki.',
      'command': 'ray status ...',
      'practices': ['Release unused resources before scaling.', 'Keep replica counts within cloud budget limits.'],
      'ai_mlops': 'Ensures high availability during high-intensity fine-tuning loops.',
      'flow': '[Pending Allocations] ➔ [Check GPU Limits] ➔ [Scale Manually]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'GPU Scaling Flow Chart',
      'filename': 'flow.mermaid',
      'why': 'Visualizes GPU scaling evaluations from job submission to node provisioning.',
      'when': 'Review during scalability audits.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Validate both automated and SRE manual scale-up paths.'],
      'ai_mlops': 'Platform scaling architecture reference.',
      'flow': '[Mermaid Canvas Diagram]'
    };
  }

  if (!explanation) {
    showToast("⚠️ No explanation available for this tab.");
    return;
  }

  $('drawer-title').textContent = explanation.title;
  $('drawer-filename').textContent = explanation.filename;
  $('explain-why').innerHTML = explanation.why;
  $('explain-when').innerHTML = explanation.when;

  $('explain-where').innerHTML = explanation.where;
  $('explain-command').textContent = explanation.command;

  const practicesBox = $('explain-practices');
  practicesBox.innerHTML = '';
  explanation.practices.forEach(practice => {
    const li = document.createElement('li');
    li.innerHTML = practice;
    practicesBox.appendChild(li);
  });

  $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';
  $('explain-flow').textContent = explanation.flow;

  const drawer = $('explanation-drawer');
  drawer.classList.remove('translate-x-full');
  drawer.classList.add('translate-x-0');
}

function closeExplanationDrawer() {
  const drawer = $('explanation-drawer');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
}

window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
window.closeExplanationDrawer = closeExplanationDrawer;
