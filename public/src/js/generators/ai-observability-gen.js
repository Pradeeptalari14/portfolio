// AI Observability & Trace Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'otel_compose_yaml';
  let compiledCode = {};

  function compileConfigs() {
    
    const back = document.getElementById('obs_backend').value;
    const sdk = document.getElementById('obs_sdk').value;
    const host = document.getElementById('obs_host').value;
    compiledCode.otel_compose_yaml = "version: '3.8'\nservices:\n  " + back.toLowerCase() + ":\n    image: " + (back === 'Langfuse' ? 'langfuse/langfuse:2' : 'arize-phoenix:latest') + "\n    ports:\n      - \"3000:3000\"\n    environment:\n      - BACKEND_URL=" + host + "\n";
    compiledCode.trace_py = "# Instrumentation using " + sdk + "\nos.environ[\"LANGFUSE_PUBLIC_KEY\"] = \"pk-lf...\"\nos.environ[\"LANGFUSE_SECRET_KEY\"] = \"sk-lf...\"\nos.environ[\"LANGFUSE_HOST\"] = \"" + host + "\"\n";
    compiledCode.observability_flow = "graph TD\n  App[Client Application] -->|Traces via " + sdk + "| Collector[Backend: " + back + "]\n  Collector -->|Visualize metrics| Dashboard[Trace Endpoint: " + host + "]";
    let filename = 'langfuse_otel.yaml';
    if (activeTab === 'trace_py') filename = 'trace.py';
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
    ['otel_compose_yaml', 'trace_py', 'observability_flow'],
    'otel_compose_yaml',
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
