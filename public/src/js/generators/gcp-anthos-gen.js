// GCP Anthos Service Mesh Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'asm_yaml';
  let compiledCode = {};

  function compileConfigs() {
    
    const mesh = document.getElementById('asm_mesh_id').value;
    const cluster = document.getElementById('asm_cluster').value;
    const istio = document.getElementById('asm_istio').value;
    const telemetry = document.getElementById('asm_telemetry').value;

    compiledCode.asm_yaml = "apiVersion: security.istio.io/v1beta1\n" + 
      "kind: PeerAuthentication\n" + 
      "metadata:\n" + 
      "  name: default\n" + 
      "  namespace: default\n" + 
      "spec:\n" + 
      "  mtls:\n" + 
      "    mode: STRICT\n" + 
      "---\n" + 
      "apiVersion: telemetry.istio.io/v1alpha1\n" + 
      "kind: Telemetry\n" + 
      "metadata:\n" + 
      "  name: default-telemetry\n" + 
      "  namespace: istio-system\n" + 
      "spec:\n" + 
      "  metrics:\n" + 
      "    - providers:\n" + 
      "        - name: " + telemetry + "\n";

    compiledCode.auth_sh = "#!/usr/bin/env bash\n" + 
      "curl https://storage.googleapis.com/csm-artifacts/asm/install_asm > install_asm\n" + 
      "chmod +x install_asm\n" + 
      "./install_asm --project_id my-project --cluster_name " + cluster + " --cluster_location us-central1 --mode install --enable_all\n";

    compiledCode.asm_flow = "graph TD\n  MeshControl[Anthos Service Mesh: " + mesh + "] -->|Inject Sidecar| Pods[App Pods on " + cluster + "]\n  Pods -->|PeerAuthentication| mTLS[STRICT Mutual TLS Enforced]\n  Pods -->|Telemetry| CloudOps[" + telemetry + " Dashboard]\n";
    
    let filename = 'asm_policy.yaml';
    if (activeTab === 'auth_sh') filename = 'install.sh';
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
    ['asm_yaml', 'auth_sh', 'asm_flow'],
    'asm_yaml',
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
