// Azure Bicep/ARM Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'bicep_code';
  let compiledCode = {};

  function compileConfigs() {
    
    const prefix = document.getElementById('bicep_storage').value;
    const rg = document.getElementById('bicep_rg').value;
    const kind = document.getElementById('bicep_kind').value;
    const repl = document.getElementById('bicep_repl').value;

    compiledCode.bicep_code = "param storageAccountName string = '" + prefix + "'\n" + 
      "param location string = resourceGroup().location\n\n" + 
      "resource sa 'Microsoft.Storage/storageAccounts@2022-09-01' = {\n" + 
      "  name: storageAccountName\n" + 
      "  location: location\n" + 
      "  sku: {\n" + 
      "    name: '" + repl + "'\n" + 
      "  }\n" + 
      "  kind: '" + kind + "'\n" + 
      "  properties: {\n" + 
      "    supportsHttpsTrafficOnly: true\n" + 
      "  }\n" + 
      "}\n";

    compiledCode.bicep_deploy = "#!/usr/bin/env bash\n" + 
      "az deployment group create --resource-group \"" + rg + "\" --template-file main.bicep\n";

    compiledCode.bicep_flow = "graph TD\n  Bicep[main.bicep Template] -->|Compile ARM| ARMJson[ARM JSON Object]\n  ARMJson -->|Deployment script| Azure[Resource Group: " + rg + "]\n  Azure -->|Provisioned| SA[Storage Account: " + prefix + "]\n";
    
    let filename = 'main.bicep';
    if (activeTab === 'bicep_deploy') filename = 'deploy.sh';
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
    ['bicep_code', 'bicep_deploy', 'bicep_flow'],
    'bicep_code',
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
