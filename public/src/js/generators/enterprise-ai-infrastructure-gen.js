// Enterprise AI Infrastructure Integration Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'integration_plan_md';
  let compiledCode = {};

  function compileConfigs() {
    
    const host = document.getElementById('gw_host').value;
    const target = document.getElementById('proxy_target').value;
    const cache = document.getElementById('cache_strat').value;
    compiledCode.integration_plan_md = "# Enterprise AI Infrastructure Integration Plan\n\n" +
      "1. **Core Gateway Hostname**: " + host + "\n" +
      "2. **Legacy Proxy Target**: " + target + "\n" +
      "3. **Semantic Cache**: Enabled via " + cache + "\n";
    compiledCode.nginx_conf = "server {\n  listen 80;\n  server_name " + host + ";\n  location /v1/chat {\n    proxy_pass " + target + ";\n    proxy_set_header X-Cache-Strategy \"" + cache + "\";\n  }\n}";
    compiledCode.integration_flow = "graph TD\n  Client[App Client] -->|HTTPS| Proxy[Nginx ESB Proxy: " + host + "]\n  Proxy -->|Triage API| GW[AI Gateway: " + target + "]\n  GW -->|Cache| Redis[Redis Strategy: " + cache + "]";
    let filename = 'integration_plan.md';
    if (activeTab === 'nginx_conf') filename = 'nginx.conf';
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
    ['integration_plan_md', 'nginx_conf', 'integration_flow'],
    'integration_plan_md',
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
