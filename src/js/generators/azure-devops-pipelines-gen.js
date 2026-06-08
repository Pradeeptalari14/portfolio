// Azure DevOps Pipelines Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'azp_yaml';
  let compiledCode = {};

  function compileConfigs() {
    
    const name = document.getElementById('azp_name').value;
    const pool = document.getElementById('azp_pool').value;
    const trigger = document.getElementById('azp_trigger').value;
    const scan = document.getElementById('azp_scan').value;

    compiledCode.azp_yaml = "trigger:\n" + 
      "  - " + trigger + "\n\n" + 
      "pool:\n" + 
      "  vmImage: '" + pool + "'\n\n" + 
      "stages:\n" + 
      "  - stage: Build\n" + 
      "    displayName: 'Build and Scan App'\n" + 
      "    jobs:\n" + 
      "      - job: Compile\n" + 
      "        steps:\n" + 
      "          - script: echo 'Installing Node libraries...'\n" + 
      "          - script: npm run build\n" + 
      "          - script: echo 'Starting " + scan + " security metrics scanner...'\n";

    compiledCode.verify_sh = "#!/usr/bin/env bash\n" + 
      "az pipelines run --name \"" + name + "\" --branch " + trigger + "\n";

    compiledCode.azp_flow = "graph TD\n  GitPush[Git Push trigger: " + trigger + "] -->|Azure DevOps Webhook| AZP[Pipeline VM: " + pool + "]\n  AZP -->|npm build| Compile[Static Bundle compiled]\n  Compile -->|Security scan| Scan[Scan: " + scan + " gate check]\n";
    
    let filename = 'azure-pipelines.yml';
    if (activeTab === 'verify_sh') filename = 'run_pipeline.sh';
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
    ['azp_yaml', 'verify_sh', 'azp_flow'],
    'azp_yaml',
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
