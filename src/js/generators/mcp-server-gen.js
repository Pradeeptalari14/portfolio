// MCP Server Builder Studio compiler logic

function initMcpServerStudio() {
  const elements = {
    sdkType: document.getElementById('mcp_sdk_type'),
    authLevel: document.getElementById('mcp_auth_level'),
    toolProfile: document.getElementById('mcp_tool_profile'),
    enableTelemetry: document.getElementById('mcp_enable_telemetry'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-mcp'),
    btnDownload: document.getElementById('btn-download-mcp'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'mcp_code';
  let compiledCode = {
    mcp_code: '',
    mcp_config: '',
    mcp_flow: ''
  };

  function compileConfigs() {
    const sdk = elements.sdkType ? elements.sdkType.value : 'Python';
    const auth = elements.authLevel ? elements.authLevel.value : 'APIKey';
    const tool = elements.toolProfile ? elements.toolProfile.value : 'Triage';
    const isTelem = elements.enableTelemetry ? elements.enableTelemetry.checked : true;

    // 1. Compile code
    let code = '';
    if (sdk === 'Python') {
        code += `#!/usr/bin/env python3\n`;
        code += `# Model Context Protocol (MCP) Server\n`;
        code += `import os\n`;
        code += `import sys\n`;
        code += `from mcp.server import Server\n`;
        if (isTelem) {
            code += `from prometheus_client import start_http_server, Counter\n`;
        }
        code += `\n`;
        code += `app = Server("mcp-sre-server")\n\n`;
        
        if (isTelem) {
            code += `REQUESTS = Counter('mcp_requests_total', 'Total MCP request calls', ['tool'])\n\n`;
        }

        if (tool === 'Triage') {
            code += `@app.tool()\n`;
            code += `def inspect_logs(namespace: str, lines: int = 50) -> str:\n`;
            code += `    """Retrieve and audit cluster operations logs for SRE triage."""\n`;
            if (isTelem) {
                code += `    REQUESTS.labels(tool="inspect_logs").inc()\n`;
            }
            code += `    return f"Fetching last {lines} lines from namespace: {namespace}"\n`;
        } else if (tool === 'Scaling') {
            code += `@app.tool()\n`;
            code += `def scale_deployment(name: str, replicas: int) -> str:\n`;
            code += `    """Modify workload sizing scales directly in target cluster namespace."""\n`;
            if (isTelem) {
                code += `    REQUESTS.labels(tool="scale_deployment").inc()\n`;
            }
            code += `    return f"Deployment {name} scaled to {replicas} replicas."\n`;
        } else {
            code += `@app.tool()\n`;
            code += `def rotate_secrets(engine: str) -> str:\n`;
            code += `    """Trigger dynamic secrets lease key rotators inside secret manager."""\n`;
            if (isTelem) {
                code += `    REQUESTS.labels(tool="rotate_secrets").inc()\n`;
            }
            code += `    return f"Secret engine: {engine} database lease key rotated."\n`;
        }
        
        code += `\nif __name__ == '__main__':\n`;
        if (isTelem) {
            code += `    start_http_server(8000)\n`;
        }
        code += `    app.run()\n`;
    } else {
        code += `// Model Context Protocol (MCP) Server in TypeScript\n`;
        code += `import { Server } from "@modelcontextprotocol/sdk/server/index.js";\n`;
        code += `import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";\n\n`;
        code += `const server = new Server({ name: "mcp-sre-server", version: "1.0.0" }, { capabilities: { tools: {} } });\n\n`;
        
        if (tool === 'Triage') {
            code += `server.setRequestHandler(ListToolsRequestSchema, async () => ({\n`;
            code += `  tools: [{ name: "inspect_logs", description: "Retrieve and audit cluster operations logs for SRE triage" }]\n`;
            code += `}));\n`;
        } else if (tool === 'Scaling') {
            code += `server.setRequestHandler(ListToolsRequestSchema, async () => ({\n`;
            code += `  tools: [{ name: "scale_deployment", description: "Modify workload sizing scales directly" }]\n`;
            code += `}));\n`;
        } else {
            code += `server.setRequestHandler(ListToolsRequestSchema, async () => ({\n`;
            code += `  tools: [{ name: "rotate_secrets", description: "Trigger dynamic secrets lease key rotators" }]\n`;
            code += `}));\n`;
        }
        code += `\nconst transport = new StdioServerTransport();\n`;
        code += `server.connect(transport);\n`;
    }

    compiledCode.mcp_code = code;

    // 2. Compile mcp-config.json
    let configObj = {
        mcpServers: {
            "sre-mcp-server": {
                command: sdk === 'Python' ? "python" : "node",
                args: sdk === 'Python' ? ["mcp-server.py"] : ["dist/index.js"],
                env: {
                    MCP_AUTH_LEVEL: auth,
                    ENABLE_TELEMETRY: isTelem ? "true" : "false"
                }
            }
        }
    };
    compiledCode.mcp_config = JSON.stringify(configObj, null, 2);

    // 3. Compile Flow Graph
    let flow = 'graph TD\n';
    flow += `  Client[🤖 Claude / AI Client] -->|Call tool: ${tool === 'Triage' ? 'inspect_logs' : tool === 'Scaling' ? 'scale_deployment' : 'rotate_secrets'}| Trans[🔌 Stdio/SSE Transport]\n`;
    flow += `  Trans -->|Security Check: ${auth}| Server[⚡ MCP Server SDK: ${sdk}]\n`;
    flow += `  Server -->|Invoke Tool handler| Handler[🔧 Tool Action Handler]\n`;
    if (isTelem) {
        flow += `  Handler -->|Increment requests_total| Prom[📊 Prometheus Scraper: Port 8000]\n`;
        flow += `  Handler -->|Return result| Client\n`;
    } else {
        flow += `  Handler -->|Return result| Client\n`;
    }
    compiledCode.mcp_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'mcp_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.mcp_flow + '</div>';
      
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
      
      // Update filename box
      let filename = sdkTypeSelected() === 'Python' ? 'mcp-server.py' : 'mcp-server.ts';
      if (activeTab === 'mcp_config') filename = 'mcp-config.json';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  function sdkTypeSelected() {
    return elements.sdkType ? elements.sdkType.value : 'Python';
  }

  // Bind controls listeners
  if (elements.sdkType) elements.sdkType.addEventListener('change', compileConfigs);
  if (elements.authLevel) elements.authLevel.addEventListener('change', compileConfigs);
  if (elements.toolProfile) elements.toolProfile.addEventListener('change', compileConfigs);
  if (elements.enableTelemetry) elements.enableTelemetry.addEventListener('change', compileConfigs);

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
    ['mcp_code', 'mcp_config', 'mcp_flow'],
    'mcp_code',
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
  if (document.getElementById('mcp_sdk_type')) {
    initMcpServerStudio();
  }
});

window.initMcpServerStudio = initMcpServerStudio;
