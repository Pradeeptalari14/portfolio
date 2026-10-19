// GCP Cloud Run Serverless Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'run_tf';
  let compiledCode = {};

  function compileConfigs() {
    
    const service = document.getElementById('cr_service').value;
    const img = document.getElementById('cr_image').value;
    const region = document.getElementById('cr_region').value;
    const memory = document.getElementById('cr_memory').value;

    compiledCode.run_tf = "resource \"google_cloud_run_service\" \"cr\" {\n" + 
      "  name     = \"" + service + "\"\n" + 
      "  location = \"" + region + "\"\n\n" + 
      "  template {\n" + 
      "    spec {\n" + 
      "      containers {\n" + 
      "        image = \"" + img + "\"\n" + 
      "        resources {\n" + 
      "          limits = {\n" + 
      "            memory = \"" + memory + "\"\n" + 
      "          }\n" + 
      "        }\n" + 
      "      }\n" + 
      "    }\n" + 
      "  }\n" + 
      "}\n";

    compiledCode.deploy_sh = "#!/usr/bin/env bash\n" + 
      "gcloud run deploy " + service + " --image " + img + " --region " + region + " --platform managed --allow-unauthenticated\n";

    compiledCode.run_flow = "graph TD\n  ArtifactRegistry[Registry Image: " + img + "] -->|Deploy| Service[Cloud Run: " + service + "]\n  Client[User Request] -->|Route API| Service\n  Service -->|Auto scale down to 0| Sleep[Resource Sleep state]\n";
    
    let filename = 'cloud_run.tf';
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
    ['run_tf', 'deploy_sh', 'run_flow'],
    'run_tf',
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
