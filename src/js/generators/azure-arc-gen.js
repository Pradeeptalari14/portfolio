// Azure Arc Hybrid Management Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'arc_sh';
  let compiledCode = {};

  function compileConfigs() {
    
    const resource = document.getElementById('arc_resource').value;
    const rg = document.getElementById('arc_rg').value;
    const loc = document.getElementById('arc_location').value;
    const infra = document.getElementById('arc_infra').value;

    compiledCode.arc_sh = "#!/usr/bin/env bash\n# Azure Connected Machine Agent Onboarding Script\n" + 
      "wget https://aka.ms/azcmagent -O ~/install_linux_azcmagent.sh\n" + 
      "bash ~/install_linux_azcmagent.sh\n\n" + 
      "azcmagent connect \\\n" + 
      "  --resource-group \"" + rg + "\" \\\n" + 
      "  --tenant-id \"my-azure-tenant-id\" \\\n" + 
      "  --subscription-id \"my-subscription-id\" \\\n" + 
      "  --location \"" + loc + "\" \\\n" + 
      "  --resource-name \"" + resource + "\" \\\n" + 
      "  --cloud \"AzureCloud\"\n";

    compiledCode.policy_json = JSON.stringify({
      "policyAssignment": {
        "displayName": "Azure Monitor baseline monitoring for " + resource,
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/baseline-def",
        "parameters": {
          "effect": { "value": "DeployIfNotExists" }
        }
      }
    }, null, 2);

    compiledCode.arc_flow = "graph TD\n  Host[" + infra + " Local Machine] -->|Run arc_onboard.sh| Agent[azcmagent Connected]\n  Agent -->|Secure WAN TLS| ArcControl[Azure Arc Control Plane]\n  ArcControl -->|Apply policy.json| Policy[Azure Monitor Diagnostic Configs]\n";
    
    let filename = 'arc_onboard.sh';
    if (activeTab === 'policy_json') filename = 'policy.json';
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
    ['arc_sh', 'policy_json', 'arc_flow'],
    'arc_sh',
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
