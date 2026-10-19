// MCP & Tool Integration Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'mcp_config_json';
  let compiledCode = {};

  function compileConfigs() {
    
    const model = document.getElementById('mcp_model').value;
    const tool = document.getElementById('mcp_tool').value;
    const param = document.getElementById('mcp_param').value;
    compiledCode.mcp_config_json = JSON.stringify({
      "mcpServers": {
        "sre-tools": {
          "command": "python",
          "args": ["mcp_server.py"],
          "env": { "MODEL_NAME": model }
        }
      }
    }, null, 2);
    compiledCode.mcp_server_py = "from mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP(\"SRE Tools Server\")\n\n@mcp.tool()\ndef " + tool + "(" + param + ": str) -> str:\n    \"\"\"SRE diagnostic tool.\"\"\"\n    return f\"Executed " + tool + " with parameter {" + param + "} successfully.\"\n";
    compiledCode.mcp_flow = "graph TD\n  Client[Model: " + model + "] -->|Request Tool| Server[MCP Server]\n  Server -->|Execute tool| Tool[Tool: " + tool + " args: " + param + "]";
    let filename = 'mcp_config.json';
    if (activeTab === 'mcp_server_py') filename = 'mcp_server.py';
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
    ['mcp_config_json', 'mcp_server_py', 'mcp_flow'],
    'mcp_config_json',
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
