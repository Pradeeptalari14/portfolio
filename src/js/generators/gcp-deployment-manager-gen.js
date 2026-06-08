// GCP Deployment Manager Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'gdm_yaml';
  let compiledCode = {};

  function compileConfigs() {
    
    const name = document.getElementById('gdm_name').value;
    const zone = document.getElementById('gdm_zone').value;
    const inst = document.getElementById('gdm_instance').value;
    const disk = document.getElementById('gdm_disk').value;

    compiledCode.gdm_yaml = "resources:\n" + 
      "  - name: " + name + "-vm\n" + 
      "    type: compute.v1.instance\n" + 
      "    properties:\n" + 
      "      zone: " + zone + "\n" + 
      "      machineType: zones/" + zone + "/machineTypes/" + inst + "\n" + 
      "      disks:\n" + 
      "        - deviceName: boot\n" + 
      "          type: PERSISTENT\n" + 
      "          boot: true\n" + 
      "          autoDelete: true\n" + 
      "          initializeParams:\n" + 
      "            sourceImage: projects/debian-cloud/global/images/family/debian-11\n" + 
      "            diskSizeGb: " + disk + "\n";

    compiledCode.deploy_sh = "#!/usr/bin/env bash\n" + 
      "gcloud deployment-manager deployments create " + name + " --config deployment.yaml\n";

    compiledCode.gdm_flow = "graph TD\n  YAML[deployment.yaml Spec] -->|CLI deployment command| Manager[GCP Deployment Manager Engine]\n  Manager -->|Provision Compute VM| VM[Virtual Machine: " + name + "-vm]\n  VM -->|Boot Disk| Disk[" + disk + "GB boot disk]\n";
    
    let filename = 'deployment.yaml';
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
    ['gdm_yaml', 'deploy_sh', 'gdm_flow'],
    'gdm_yaml',
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
