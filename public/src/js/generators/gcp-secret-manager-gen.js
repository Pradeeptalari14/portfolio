// GCP Secret Manager Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'gsm_tf';
  let compiledCode = {};

  function compileConfigs() {
    
    const secretId = document.getElementById('gsm_id').value;
    const repl = document.getElementById('gsm_replication').value;

    compiledCode.gsm_tf = "resource \"google_secret_manager_secret\" \"secret\" {\n" + 
      "  secret_id = \"" + secretId + "\"\n\n" + 
      "  replication {\n" + 
      "    " + (repl === 'automatic' ? "automatic = true" : "user_managed {\n      replicas {\n        location = \"us-central1\"\n      }\n    }") + "\n" + 
      "  }\n" + 
      "}\n";

    compiledCode.retrieve_py = "from google.cloud import secretmanager\n\n" + 
      "client = secretmanager.SecretManagerServiceClient()\n" + 
      "name = f'projects/my-project/secrets/" + secretId + "/versions/latest'\n" + 
      "response = client.access_secret_version(request={'name': name})\n" + 
      "secret_value = response.payload.data.decode('UTF-8')\n" + 
      "print('Successfully loaded database secret key.')\n";

    compiledCode.gsm_flow = "graph TD\n  Terraform -->|Provision| SecManager[Google Secret Manager Registry]\n  SecManager -->|Create key ID| SecretID[" + secretId + "]\n  PythonSDK[Python SecretClient SDK] -->|Access version latest| SecretID\n  SecretID -->|Return decrypted value| PythonSDK\n";
    
    let filename = 'secret_config.tf';
    if (activeTab === 'retrieve_py') filename = 'retrieve.py';
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
    ['gsm_tf', 'retrieve_py', 'gsm_flow'],
    'gsm_tf',
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
