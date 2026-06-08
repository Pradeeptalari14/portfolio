// Azure Key Vault Secret Manager SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'kv_tf';
  let compiledCode = {};

  function compileConfigs() {
    
    const name = document.getElementById('kv_name').value;
    const sku = document.getElementById('kv_sku').value;
    const purge = document.getElementById('kv_purge').value;
    const tenant = document.getElementById('kv_tenant').value;

    compiledCode.kv_tf = "resource \"azurerm_key_vault\" \"kv\" {\n" + 
      "  name                        = \"" + name + "\"\n" + 
      "  location                    = \"westeurope\"\n" + 
      "  resource_group_name         = \"rg-core\"\n" + 
      "  tenant_id                   = \"" + tenant + "\"\n" + 
      "  sku_name                    = \"" + sku + "\"\n" + 
      "  purge_protection_enabled    = true\n" + 
      "  soft_delete_retention_days  = " + purge + "\n" + 
      "}\n";

    compiledCode.retrieve_sh = "#!/usr/bin/env bash\n" + 
      "az keyvault secret show --name \"database-password\" --vault-name \"" + name + "\" --query value -o tsv\n";

    compiledCode.kv_flow = "graph TD\n  Terraform -->|Provision| KV[Key Vault: " + name + "]\n  App[SRE Application] -->|az login Identity| Token[Retrieve OAuth Token]\n  Token -->|GET request| KV\n  KV -->|Secure Return| SecretValue[Return Database Secret]\n";
    
    let filename = 'keyvault.tf';
    if (activeTab === 'retrieve_sh') filename = 'retrieve.sh';
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
    ['kv_tf', 'retrieve_sh', 'kv_flow'],
    'kv_tf',
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
