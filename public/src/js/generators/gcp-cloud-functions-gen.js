// GCP Cloud Functions Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'gcf_py';
  let compiledCode = {};

  function compileConfigs() {
    
    const id = document.getElementById('gcf_id').value;
    const runtime = document.getElementById('gcf_runtime').value;
    const trigger = document.getElementById('gcf_trigger').value;
    const memory = document.getElementById('gcf_memory').value;

    compiledCode.gcf_py = "def handler(event, context):\n" + 
      "    import base64\n" + 
      "    print('Google Cloud Function " + id + " Triggered successfully!')\n" + 
      "    if 'data' in event:\n" + 
      "        payload = base64.b64decode(event['data']).decode('utf-8')\n" + 
      "        print(f'Decoded Payload message: {payload}')\n";

    compiledCode.deploy_sh = "#!/usr/bin/env bash\n" + 
      "gcloud functions deploy " + id + " \\\n" + 
      "  --runtime=" + runtime + " \\\n" + 
      "  --memory=" + memory + " \\\n" + 
      "  " + (trigger === 'pubsub' ? "--trigger-topic=sensor-data-topic" : "--trigger-http") + "\n";

    compiledCode.gcf_flow = "graph TD\n  Event[Event Source: " + trigger + "] -->|Publish| Function[Cloud Function: " + id + "]\n  Function -->|Decoded stdout| CloudLogs[Stackdriver Logs]\n";
    
    let filename = 'main.py';
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
    ['gcf_py', 'deploy_sh', 'gcf_flow'],
    'gcf_py',
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
