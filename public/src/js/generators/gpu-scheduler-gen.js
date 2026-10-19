// GPU Scheduler & K8s Allocator Studio compiler logic

function initGpuSchedulerStudio() {
  const elements = {
    shareMode: document.getElementById('gpu_share_mode'),
    fairShare: document.getElementById('kueue_fair_share'),
    limitWeight: document.getElementById('gpu_limit_weight'),
    exitOnDrift: document.getElementById('gpu_exit_on_drift'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-gpu'),
    btnDownload: document.getElementById('btn-download-gpu'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'gpu_yaml';
  let compiledCode = {
    gpu_yaml: '',
    gpu_k8s: '',
    gpu_flow: ''
  };

  function compileConfigs() {
    const share = elements.shareMode ? elements.shareMode.value : 'MIG';
    const policy = elements.fairShare ? elements.fairShare.value : 'Weighted';
    const weight = elements.limitWeight ? elements.limitWeight.value : '4';
    const isExit = elements.exitOnDrift ? elements.exitOnDrift.checked : true;

    // 1. Compile gpu-policy.yaml
    let yaml = `apiVersion: nvidia.com/v1\n`;
    yaml += `kind: ClusterPolicy\n`;
    yaml += `metadata:\n`;
    yaml += `  name: gpu-sharing-policy\n`;
    yaml += `spec:\n`;
    yaml += `  sharing:\n`;
    yaml += `    mode: "${share}"\n`;
    if (share === 'MIG') {
        yaml += `    mig:\n`;
        yaml += `      strategy: "mixed"\n`;
        yaml += `      profiles:\n`;
        yaml += `        - "1g.5gb"\n`;
        yaml += `        - "2g.10gb"\n`;
    } else if (share === 'Fractional') {
        yaml += `    mps:\n`;
        yaml += `      defaultWeight: 50\n`;
    } else {
        yaml += `    passthrough: {}\n`;
    }
    yaml += `  allocator:\n`;
    yaml += `    strategy: "spread"\n`;
    yaml += `    limits:\n`;
    yaml += `      gpu_weight: ${weight}\n`;
    yaml += `      evict_on_drift: ${isExit ? 'true' : 'false'}\n`;

    compiledCode.gpu_yaml = yaml;

    // 2. Compile kueue-config.yaml
    let k8s = `apiVersion: kueue.x-k8s.io/v1beta1\n`;
    k8s += `kind: ClusterQueue\n`;
    k8s += `metadata:\n`;
    k8s += `  name: gpu-batch-queue\n`;
    k8s += `spec:\n`;
    k8s += `  cohort: gpu-cohort\n`;
    k8s += `  queueingStrategy: "${policy}"\n`;
    k8s += `  resourceGroups:\n`;
    k8s += `    - coveredResources: ["nvidia.com/gpu"]\n`;
    k8s += `      flavors:\n`;
    k8s += `        - name: "on-demand-gpu"\n`;
    k8s += `          resources:\n`;
    k8s += `            - name: "nvidia.com/gpu"\n`;
    k8s += `              nominalQuota: ${weight}\n`;

    compiledCode.gpu_k8s = k8s;

    // 3. Compile Flow Graph
    let flow = 'graph TD\n';
    flow += `  Job[🚀 Batch Training Job] -->|Submit| Queue[⚡ Kueue ClusterQueue: ${policy}]\n`;
    flow += `  Queue -->|Evaluate resources| Alloc[🎛️ Allocator strategy: spread]\n`;
    flow += `  Alloc -->|Apply partition| Share[🏎️ GPU Share: ${share}]\n`;
    flow += `  Share -->|Reserve ${weight} units| GPU[🤖 Physical NVIDIA GPU Cluster]\n`;
    if (isExit) {
        flow += '  GPU -->|Capacity drifts| Evict[❌ Evict Job & Trigger Triage]\n';
    } else {
        flow += '  GPU -->|Capacity drifts| Alarm[⚠️ Trigger Warning Log]\n';
    }
    compiledCode.gpu_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'gpu_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.gpu_flow + '</div>';
      
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
      let filename = 'gpu-policy.yaml';
      if (activeTab === 'gpu_k8s') filename = 'kueue-config.yaml';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  if (elements.shareMode) elements.shareMode.addEventListener('change', compileConfigs);
  if (elements.fairShare) elements.fairShare.addEventListener('change', compileConfigs);
  if (elements.limitWeight) elements.limitWeight.addEventListener('input', compileConfigs);
  if (elements.exitOnDrift) elements.exitOnDrift.addEventListener('change', compileConfigs);

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        const originalText = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = originalText;
        }, 1500);
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
    ['gpu_yaml', 'gpu_k8s', 'gpu_flow'],
    'gpu_yaml',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('gpu_share_mode')) {
    initGpuSchedulerStudio();
  }
});

window.initGpuSchedulerStudio = initGpuSchedulerStudio;
