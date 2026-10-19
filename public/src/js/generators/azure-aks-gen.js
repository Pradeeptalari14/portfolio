// Azure AKS Cluster Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'aks_tf';
  let compiledCode = {};

  function compileConfigs() {
    
    const cluster = document.getElementById('aks_cluster_name').value;
    const rg = document.getElementById('aks_rg').value;
    const nodes = document.getElementById('aks_node_count').value;
    const vmSize = document.getElementById('aks_vm_size').value;

    compiledCode.aks_tf = "resource \"azurerm_kubernetes_cluster\" \"aks\" {\n" + 
      "  name                = \"" + cluster + "\"\n" + 
      "  location            = \"eastus\"\n" + 
      "  resource_group_name = \"" + rg + "\"\n" + 
      "  dns_prefix          = \"" + cluster + "-dns\"\n\n" + 
      "  default_node_pool {\n" + 
      "    name       = \"default\"\n" + 
      "    node_count = " + nodes + "\n" + 
      "    vm_size    = \"" + vmSize + "\"\n" + 
      "    network_policy = \"azure\"\n" + 
      "  }\n\n" + 
      "  identity {\n" + 
      "    type = \"SystemAssigned\"\n" + 
      "  }\n" + 
      "}\n";

    compiledCode.auth_sh = "#!/usr/bin/env bash\n" + 
      "az aks get-credentials --resource-group \"" + rg + "\" --name \"" + cluster + "\" --overwrite-existing\n" + 
      "kubectl get nodes\n";

    compiledCode.aks_flow = "graph TD\n  Terraform -->|Provision| AKS[AKS Cluster: " + cluster + "]\n  AKS -->|Host Nodes| Pool[default NodePool: " + nodes + " Nodes]\n  AZCLI[az cli] -->|Retrieve Creds| Kubeconfig[kubectl access]\n  Kubeconfig --> Pool\n";
    
    let filename = 'aks_cluster.tf';
    if (activeTab === 'auth_sh') filename = 'auth.sh';
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
    ['aks_tf', 'auth_sh', 'aks_flow'],
    'aks_tf',
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
