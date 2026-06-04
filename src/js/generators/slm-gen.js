import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'modelfile';

    // System Prompts Presets
    const systemPromptPresets = {
      devops: "You are TP DevOps Assistant, a specialist in resolving continuous integration builds, network routes, container setups, and Kubernetes events. Keep answers brief. Output commands in clean markdown shell blocks. Prioritize troubleshooting steps for CrashLoopBackOff, ImagePullBackOff, and Maven download failures.",
      sre: "You are a Senior Site Reliability Engineer. Focus on high availability, network routing, firewall policies, logging aggregations, and automatic recovery playbooks. Structure answers with a focus on metrics, alerting limits, and remediation steps. Avoid conversational filler.",
      coder: "You are a Python and Go coding assistant for DevOps. Generate highly optimized, security-conscious scripts containing detailed comments, error logging, and standard SDK calls. Avoid explanations unless specifically requested.",
      general: "You are a helpful AI assistant specialized in system administration, scripting, and cloud architecture operations."
    };

    // SRE Code Explanations Database
    const tabExplanations = {
      modelfile: {
        title: "Ollama Modelfile",
        filename: "Modelfile",
        why: "Defines the base model, parameters (temperature, token limits), and the exact system context/prompt instructions that lock the SLM into its dedicated DevOps or SRE persona.",
        when: "Use this to build a localized, private model executable tailored for offline developer troubleshooting.",
        where: "Compile using the Ollama CLI on your development host or edge environment.",
        command: "ollama create sre-assistant -f ./Modelfile",
        practices: [
          "Set low temperatures (e.g., 0.2) for deterministic script writing or command generation.",
          "Tune `num_ctx` to match log file payload lengths for deep trace analysis.",
          "Keep base models small (2B - 8B) for CPU/edge hosting constraints."
        ],
        ai_mlops: "Represents the core foundation of local Model Registry customization, enabling the transition of **DevOps Copilot** interfaces onto edge hosts.",
        flow: "[Base Model Weights] ➔ [Apply Modelfile overrides] ➔ [Compile custom model] ➔ [Register on local daemon]"
      },
      service: {
        title: "Systemd Service Config",
        filename: "ollama.service",
        why: "Orchestrates the Ollama inference server as a background daemon on Linux, providing env configurations for CORS, binding addresses, and execution directory variables.",
        when: "Use to ensure local SLM APIs stay healthy, restart after kernel panics, and serve applications continuously on local ports.",
        where: "Deploy to `/etc/systemd/system/` on Linux hosts.",
        command: "sudo systemctl enable --now ollama.service",
        practices: [
          "Restrict CORS origins (`OLLAMA_ORIGINS`) to authorized frontend ports in production.",
          "Bind to `0.0.0.0` with caution, securing host firewall ports to prevent external endpoint exploits.",
          "Mount weights directories strictly onto fast SSD storage partitions for lower model load delays."
        ],
        ai_mlops: "Provides the underlying operating-system service hosting layer that exposes internal completions to the local **RAG Knowledge Chatbot** and **Kubernetes Troubleshooting Agent** microservices.",
        flow: "[Linux Init] ➔ [Reads systemd Service] ➔ [Executes ollama serve] ➔ [Exposes port 11434]"
      },
      bootstrap: {
        title: "Edge Bootstrapping Automation",
        filename: "bootstrap.sh",
        why: "Automates the installation of the Ollama CLI, pulls base weights, writes custom parameter Modelfiles, compiles the customized engine model, and executes a completions health check.",
        when: "Run on initial laptop setup, local dev server configurations, or during edge machine installations.",
        where: "Execute locally on the target host terminal.",
        command: "bash bootstrap.sh",
        practices: [
          "Validate internet socket port outbound access to pull model weights from ollama.com registry.",
          "Execute script with non-root permissions if target platform has GPUs configured."
        ],
        ai_mlops: "Creates a repeatable one-click bootstrap setup for hosting local AI assistants within the **Self-Healing Infrastructure** model pipelines.",
        flow: "[Execute bootstrap.sh] ➔ [Installs Ollama Engine] ➔ [Compiles customized Modelfile] ➔ [Validates curl health]"
      },
      readme: {
        title: "Local Setup & Verification Guide",
        filename: "README.md",
        why: "Outlines edge commands, API request JSON structures, and system administration checks to verify SLM status.",
        when: "Include in localized code repositories to guide devops teams on edge setup instructions.",
        where: "Save in the root of your local workspace directory.",
        command: "# Open in previewer or terminal",
        practices: [
          "Verify system memory availability before loading multiple models concurrently.",
          "Document host API endpoints for simple team configurations."
        ],
        ai_mlops: "Outlines documentation for deploying, monitoring, and querying locally hosted Small Language Model APIs in production.",
        flow: "[README.md Guide] ➔ [Guides developers on local run commands]"
      }
    };

    let compiledCode = {
      modelfile: '',
      service: '',
      bootstrap: '',
      readme: ''
    ,
  flow: ''
};

    const tabConfigs = {
      modelfile: { label: 'Modelfile', filename: 'Modelfile', ext: '' ,
  flow: { label: '📊 Visual Flowchart', filename: 'flow', ext: '.mermaid' }
},
      service: { label: 'ollama.service', filename: 'ollama', ext: '.service' },
      bootstrap: { label: 'bootstrap.sh', filename: 'bootstrap', ext: '.sh' },
      readme: { label: 'README.md', filename: 'README', ext: '.md' }
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      setupCompilerTriggers(triggerCompileAll);
      $('slm_temp').addEventListener('input', (e) => {
        $('slm_temp_val').textContent = e.target.value;
      });
      $('slm_topp').addEventListener('input', (e) => {
        $('slm_topp_val').textContent = e.target.value;
      });
      $('slm_role').addEventListener('change', (e) => {
        const val = e.target.value;
        $('custom_system_prompt').value = systemPromptPresets[val] || '';
        triggerCompileAll();
      });
      // Initialize system prompt textarea with the default preset
      $('custom_system_prompt').value = systemPromptPresets.devops;
    }

    function triggerCompileAll() {
      compileModelfile();
      compileService();
      compileBootstrap();
      compileReadme();
      compileMermaidFlow();
  updateViewportContent();
    }

    function compileModelfile() {
      const baseModel = $('slm_model').value;
      const temp = $('slm_temp').value;
      const topp = $('slm_topp').value;
      const ctx = $('slm_ctx').value;
      const systemPrompt = $('custom_system_prompt').value.trim() || systemPromptPresets.devops;

      let code = `# Ollama Custom Modelfile
FROM ${baseModel}

# Set model execution parameters
PARAMETER temperature ${temp}
PARAMETER top_p ${topp}
PARAMETER num_ctx ${ctx}

# Set system instructions context
SYSTEM """${systemPrompt}"""
`;
      compiledCode.modelfile = code;
    }

    function compileService() {
      const platform = $('host_platform').value;
      const port = $('listen_port').value.trim() || '11434';
      const cors = $('enable_cors').checked;
      const expose = $('expose_network').checked;

      if (platform !== 'linux') {
        compiledCode.service = `# Systemd configuration is only applicable for Linux hosts.\n# Currently selected platform: ${platform.toUpperCase()}`;
        return;
      }

      let hostEnv = '127.0.0.1';
      if (expose) {
        hostEnv = '0.0.0.0';
      }

      let code = `[Unit]
Description=Ollama Service (Local Edge SLM Daemon)
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=${hostEnv}:${port}"
`;

      if (cors) {
        code += `Environment="OLLAMA_ORIGINS=*"\n`;
      }

      code += `Environment="OLLAMA_MODELS=/usr/share/ollama/.ollama/models"

[Install]
WantedBy=default.target
`;
      compiledCode.service = code;
    }

    function compileBootstrap() {
      const baseModel = $('slm_model').value;
      const platform = $('host_platform').value;
      const port = $('listen_port').value.trim() || '11434';
      const expose = $('expose_network').checked;

      let installCmd = '';
      if (platform === 'linux') {
        installCmd = `curl -fsSL https://ollama.com/install.sh | sh`;
      } else if (platform === 'macos') {
        installCmd = `# Download zip installer manually or via brew:\nbrew install ollama`;
      } else {
        installCmd = `# Install Ollama via winget or windows setup installer:\nwinget install Ollama.Ollama`;
      }

      let runCmd = '';
      if (platform === 'linux') {
        runCmd = `if systemctl is-active --quiet ollama; then
    echo "Ollama systemd daemon is active."
else
    echo "Starting Ollama engine..."
    export OLLAMA_HOST="${expose ? '0.0.0.0' : '127.0.0.1'}:${port}"
    ollama serve > /dev/null 2>&1 &
    sleep 4
fi`;
      } else {
        runCmd = `echo "Ensuring Ollama engine is running..."
ollama serve > /dev/null 2>&1 &
sleep 4`;
      }

      let code = `#!/bin/bash
# Local edge SLM Bootstrapping Script
# Target Platform: ${platform.toUpperCase()}
set -e

echo "=== 🚀 Initializing Local Edge SLM Workspace ==="

# 1. Install Ollama engine
if ! command -v ollama &> /dev/null; then
    echo "Ollama CLI not found. Running installer commands..."
    ${installCmd}
else
    echo "Ollama Engine is already installed."
fi

# 2. Verify server service status
${runCmd}

# 3. Create Modelfile
echo "Writing customized parameter Modelfile..."
cat << 'EOF' > Modelfile
${compiledCode.modelfile}
EOF

# 4. Pull base weights & build custom model
echo "Pulling base weights for ${baseModel}..."
ollama pull ${baseModel}

echo "Compiling customized custom model 'sre-assistant'..."
ollama create sre-assistant -f ./Modelfile

# 5. Run local completions validation query
echo "Verifying completions API endpoint on port ${port}..."
curl -X POST http://127.0.0.1:${port}/api/generate -d '{
  "model": "sre-assistant",
  "prompt": "List the best command to show active system limits in Linux.",
  "stream": false
}'

echo -e "\\n=== ✅ Local SLM Orchestration Complete! ==="
`;
      compiledCode.bootstrap = code;
    }

    function compileReadme() {
      const baseModel = $('slm_model').value;
      const port = $('listen_port').value.trim() || '11434';
      const role = $('slm_role').value;

      let code = `# Local SLM Local Deployment Guide

This workspace bootstraps a custom, locally-hosted Small Language Model (SLM) using **Ollama** and a custom **Modelfile**.

## Model Configurations
- **Base Model**: \`${baseModel}\`
- **System Preset**: \`${role.toUpperCase()}\`
- **Port Target**: \`${port}\`

## Quick Start (Unix/macOS hosts)

1.  **Configure execution permissions and run bootstrap script**:
    \`\`\`bash
    chmod +x bootstrap.sh
    ./bootstrap.sh
    \`\`\`
2.  **Verify registered model**:
    \`\`\`bash
    ollama list
    \`\`\`
3.  **Chat interactively via terminal**:
    \`\`\`bash
    ollama run sre-assistant
    \`\`\`

## Edge API Operations

Once active, query completions programmatically via the internal port \`${port}\`:

\`\`\`bash
curl http://localhost:${port}/api/chat -d '{
  "model": "sre-assistant",
  "messages": [
    { "role": "user", "content": "How do I check system resources limits?" }
  ],
  "stream": false
}'
\`\`\`
`;
      compiledCode.readme = code;
    }

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Model[📄 Ollama Modelfile] -->|ollama create| SLM[🧠 Small Language Model]\n  SLM -->|systemd service| Daemon[⚙️ Ollama Daemon]\n  Daemon -->|HTTP API| App[🖥️ Local Client App]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const config = tabConfigs[tabId];
      $('download-name-input').value = config.filename;
      $('file-extension-tag').textContent = config.ext;

      updateViewportContent();
    }

    function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    try {
      mermaid.run({
        nodes: [container.querySelector('.mermaid')]
      });
    } catch (e) {
      console.error("Mermaid render error:", e);
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      if (!content) {
        showToast("⚠️ Active tab is empty!");
        return;
      }
      
      navigator.clipboard.writeText(content).then(() => {
        showToast("📋 Copied to clipboard!");
      }).catch(err => {
        showToast("❌ Failed to copy to clipboard.");
      });
    }

    function clearAllFields() {
      compiledCode[activeTab] = '';
      updateViewportContent();
      showToast("🗑️ Viewport cleared.");
    }

    function downloadWorkspaceZip() {
      const zip = new JSZip();
      zip.file("README.md", compiledCode.readme);
      zip.file("Modelfile", compiledCode.modelfile);
      zip.file("bootstrap.sh", compiledCode.bootstrap);
      
      const platform = $('host_platform').value;
      if (platform === 'linux') {
        zip.file("ollama.service", compiledCode.service);
      }

      zip.generateAsync({ type: "blob" }).then(function (content) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "slm-local-project.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("⬇️ SLM Workspace zip downloaded!");
      });
    }

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      $('drawer-title').textContent = explanation.title;
      $('drawer-filename').textContent = explanation.filename;
      $('explain-why').innerHTML = explanation.why;
      $('explain-when').innerHTML = explanation.when;
      $('explain-where').innerHTML = explanation.where;
      $('explain-command').textContent = explanation.command;

      const practicesBox = $('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';
      $('explain-flow').textContent = explanation.flow;

      const drawer = $('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = $('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

    function showToast(message) {
      const wrapper = $('toast-wrapper');
      const content = $('toast-content');
      content.textContent = '';
      const icon = document.createElement('span');
      icon.textContent = '⚡ ';
      content.appendChild(icon);
      content.appendChild(document.createTextNode(message));
      
      wrapper.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
      wrapper.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        wrapper.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        wrapper.classList.remove('opacity-100', 'translate-y-0');
      }, 2500);
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadWorkspaceZip = downloadWorkspaceZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
