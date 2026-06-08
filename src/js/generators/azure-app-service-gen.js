// Azure App Service Deployer SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'webapp_tf';
  let compiledCode = {};

  function compileConfigs() {
    
    const appName = document.getElementById('app_service_name').value;
    const runtime = document.getElementById('app_runtime').value;
    const sku = document.getElementById('app_sku').value;
    const scaling = document.getElementById('app_scaling').value;

    compiledCode.webapp_tf = "resource \"azurerm_service_plan\" \"asp\" {\n" + 
      "  name                = \"" + appName + "-plan\"\n" + 
      "  location            = \"westeurope\"\n" + 
      "  resource_group_name = \"rg-prod\"\n" + 
      "  os_type             = \"Linux\"\n" + 
      "  sku_name            = \"" + sku + "\"\n" + 
      "}\n\n" +
      "resource \"azurerm_linux_web_app\" \"webapp\" {\n" + 
      "  name                = \"" + appName + "\"\n" + 
      "  location            = \"westeurope\"\n" + 
      "  resource_group_name = \"rg-prod\"\n" + 
      "  service_plan_id     = azurerm_service_plan.asp.id\n\n" + 
      "  site_config {\n" + 
      "    application_stack {\n" + 
      "      linux_fx_version = \"" + runtime + "\"\n" + 
      "    }\n" + 
      "  }\n" + 
      "}\n";

    compiledCode.deploy_sh = "#!/usr/bin/env bash\n" + 
      "az webapp deployment source config-zip --resource-group rg-prod --name \"" + appName + "\" --src build.zip\n";

    compiledCode.app_flow = "graph TD\n  Dev[Developer Code] -->|Zip Build| Deploy[deploy.sh]\n  Deploy --> WebApp[App Service: " + appName + "]\n  WebApp -->|Scaling up to| Nodes[" + scaling + " Plan Instances]\n";
    
    let filename = 'webapp_config.tf';
    if (activeTab === 'deploy_sh') filename = 'deploy.sh';
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
    ['webapp_tf', 'deploy_sh', 'app_flow'],
    'webapp_tf',
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
