// GCP GKE Autopilot Cluster Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'gke_tf';
  let compiledCode = {};

  function compileConfigs() {
    
    const name = document.getElementById('gke_name').value;
    const net = document.getElementById('gke_network').value;
    const reg = document.getElementById('gke_region').value;
    const chan = document.getElementById('gke_channel').value;

    compiledCode.gke_tf = "resource \"google_container_cluster\" \"autopilot\" {\n" + 
      "  name     = \"" + name + "\"\n" + 
      "  location = \"" + reg + "\"\n\n" + 
      "  enable_autopilot = true\n" + 
      "  network    = \"" + net + "\"\n" + 
      "  subnetwork = \"" + net + "-subnet\"\n\n" + 
      "  release_channel {\n" + 
      "    channel = \"" + chan + "\"\n" + 
      "  }\n" + 
      "}\n";

    compiledCode.kubeconfig_sh = "#!/usr/bin/env bash\n" + 
      "gcloud container clusters get-credentials " + name + " --region " + reg + "\n" + 
      "kubectl cluster-info\n";

    compiledCode.gke_flow = "graph TD\n  Terraform -->|Apply tf plan| GKE[GKE Cluster: " + name + "]\n  GKE -->|Release Channel| Chan[Channel: " + chan + "]\n  GCLI[gcloud sdk] -->|Connect kube| Config[Access Credentials]\n  Config --> GKE\n";
    
    let filename = 'gke_autopilot.tf';
    if (activeTab === 'kubeconfig_sh') filename = 'kubeconfig.sh';
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
    ['gke_tf', 'kubeconfig_sh', 'gke_flow'],
    'gke_tf',
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
