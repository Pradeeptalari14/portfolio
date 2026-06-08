// Azure ACR Security Guardrails SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'acr_tf';
  let compiledCode = {};

  function compileConfigs() {
    
    const name = document.getElementById('acr_name').value;
    const sku = document.getElementById('acr_sku').value;
    const isTrust = document.getElementById('acr_trust').checked;

    compiledCode.acr_tf = "resource \"azurerm_container_registry\" \"acr\" {\n" + 
      "  name                = \"" + name + "\"\n" + 
      "  resource_group_name = \"rg-security\"\n" + 
      "  location            = \"northeurope\"\n" + 
      "  sku                 = \"" + sku + "\"\n" + 
      "  admin_enabled       = false\n\n" + 
      "  georeplications {\n" + 
      "    location = \"westeurope\"\n" + 
      "  }\n\n" + 
      "  public_network_access_enabled = false\n" + 
      "}\n";

    compiledCode.sign_sh = "#!/usr/bin/env bash\n" + 
      "export DOCKER_CONTENT_TRUST=" + (isTrust ? "1" : "0") + "\n" + 
      "cosign sign --key cosign.key " + name + ".azurecr.io/my-app:latest\n";

    compiledCode.acr_flow = "graph TD\n  ACR[Azure Container Registry: " + name + "] -->|Enforce Content Trust| Signed[Only sign validated tags]\n  Dev[Developer client] -->|Push signed image| ACR\n  Dev -->|Sign signature keys| Cosign[Cosign signature store]\n";
    
    let filename = 'acr_policy.tf';
    if (activeTab === 'sign_sh') filename = 'sign_image.sh';
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
    ['acr_tf', 'sign_sh', 'acr_flow'],
    'acr_tf',
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
