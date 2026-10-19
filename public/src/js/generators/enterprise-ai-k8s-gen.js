// Enterprise K8s AI Platform Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'k8s_deployment_yaml';
  let compiledCode = {};

  function compileConfigs() {
    
    const cluster = document.getElementById('k8s_cluster').value;
    const gpu = document.getElementById('k8s_gpu').value;
    const scale = document.getElementById('k8s_scale').value;
    compiledCode.k8s_deployment_yaml = "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: vllm-gpu-platform\n  namespace: " + cluster + "\nspec:\n  replicas: 2\n  template:\n    spec:\n      containers:\n      - name: inference-engine\n        resources:\n          limits:\n            nvidia.com/gpu: \"1\"\n# Scalability settings: " + scale + "\n";
    compiledCode.ray_cluster_yaml = "apiVersion: ray.io/v1\nkind: RayCluster\nmetadata:\n  name: ray-cluster-" + cluster + "\nspec:\n  rayVersion: '2.9.0'\n  headGroupSpec:\n    rayStartParams:\n      dashboard-host: '0.0.0.0'\n  workerGroupSpecs:\n  - groupName: gpu-group\n    replicas: 2\n    minReplicas: 1\n    maxReplicas: 10\n    template:\n      spec:\n        containers:\n        - name: ray-worker\n          resources:\n            limits:\n              nvidia.com/gpu: \"1\"\n";
    compiledCode.k8s_flow = "graph TD\n  Ingress[Client LoadBalancer] --> HeadNode[Ray Head Node]\n  HeadNode -->|Scale limits: " + scale + "| Worker[GPU Workers: " + gpu + "]";
    let filename = 'k8s_platform.yaml';
    if (activeTab === 'ray_cluster_yaml') filename = 'ray_cluster.yaml';
    if (document.getElementById('download-name-input')) document.getElementById('download-name-input').value = filename;
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab.includes('flow')) {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      const flowVal = compiledCode[activeTab];
      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + flowVal + '</div>';
      
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
    }
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select, .custom-checkbox');
  inputs.forEach(input => {
    input.addEventListener('input', compileConfigs);
    input.addEventListener('change', compileConfigs);
  });

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
    ['k8s_deployment_yaml', 'ray_cluster_yaml', 'k8s_flow'],
    'k8s_deployment_yaml',
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
  initStudio();
});

window.initStudio = initStudio;
