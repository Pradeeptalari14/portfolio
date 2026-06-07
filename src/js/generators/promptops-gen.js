// Prompt Registry & Versioning Studio compiler logic

function initPromptopsStudio() {
  const elements = {
    category: document.getElementById('prompt_category'),
    routing: document.getElementById('prompt_routing'),
    version: document.getElementById('prompt_version'),
    format: document.getElementById('prompt_format'),
    systemDesc: document.getElementById('prompt_system_desc'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-prompt'),
    btnDownload: document.getElementById('btn-download-prompt'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'prompt_yaml';
  let compiledCode = {
    prompt_yaml: '',
    prompt_py: '',
    prompt_flow: ''
  };

  function compileConfigs() {
    const cat = elements.category ? elements.category.value : 'Remediation';
    const route = elements.routing ? elements.routing.value : 'Phi3_Llama3';
    const ver = elements.version ? elements.version.value : '1.2.0';
    const fmt = elements.format ? elements.format.value : 'JSON';
    const sysPrompt = elements.systemDesc ? elements.systemDesc.value : 'You are a specialized SRE assistant.';

    // Setup models routing variables
    let primaryModel = "microsoft/Phi-3-mini-4k-instruct";
    let fallbackModel = "meta-llama/Meta-Llama-3-8B-Instruct";
    if (route === 'vLLM') {
      primaryModel = "vllm-endpoint/custom-model";
      fallbackModel = "vllm-endpoint/backup-model";
    } else if (route === 'Ollama') {
      primaryModel = "ollama/phi3:latest";
      fallbackModel = "ollama/llama3:8b";
    }

    // 1. Compile prompts.yaml
    let yaml = `prompts:\n`;
    yaml += `  - id: "sre-${cat.toLowerCase()}-task"\n`;
    yaml += `    version: "${ver}"\n`;
    yaml += `    model_routing:\n`;
    yaml += `      primary: "${primaryModel}"\n`;
    yaml += `      fallback: "${fallbackModel}"\n`;
    yaml += `    system_template: |\n`;
    
    // Indent system template lines
    const lines = sysPrompt.split('\n');
    lines.forEach(l => {
      yaml += `      ${l}\n`;
    });

    yaml += `    parameters:\n`;
    yaml += `      temperature: 0.2\n`;
    yaml += `      max_tokens: 1024\n`;
    yaml += `    schema:\n`;
    
    if (fmt === 'JSON') {
      yaml += `      type: "object"\n`;
      yaml += `      properties:\n`;
      yaml += `        status: { type: "string" }\n`;
      yaml += `        details: { type: "string" }\n`;
      yaml += `        remediation_steps: { type: "array", items: { type: "string" } }\n`;
      yaml += `      required: ["status", "details", "remediation_steps"]\n`;
    } else if (fmt === 'XML') {
      yaml += `      root_element: "remediation"\n`;
      yaml += `      tags: ["status", "details", "steps"]\n`;
    } else {
      yaml += `      type: "plaintext"\n`;
    }

    compiledCode.prompt_yaml = yaml;

    // 2. Compile validate_prompts.py
    let py = `#!/usr/bin/env python3\n`;
    py += `# -*- coding: utf-8 -*-\n`;
    py += `"""\n`;
    py += `Prompt Registry Schema Validation Utility\n`;
    py += `"""\n\n`;
    py += `import sys\n`;
    py += `import yaml\n\n`;
    py += `def validate_registry_file(file_path="prompts.yaml"):\n`;
    py += `    print(f"🔍 Checking prompt registry: {file_path}")\n`;
    py += `    try:\n`;
    py += `        with open(file_path, 'r') as f:\n`;
    py += `            data = yaml.safe_load(f)\n`;
    py += `        if not data or "prompts" not in data:\n`;
    py += `            print("❌ Invalid: Root 'prompts' key is missing.")\n`;
    py += `            return False\n\n`;
    py += `        for p in data["prompts"]:\n`;
    py += `            print(f"  Checking Prompt: {p.get('id')} v{p.get('version')}")\n`;
    py += `            if not p.get("system_template"):\n`;
    py += `                print(f"❌ Invalid: Prompt {p.get('id')} has no system template.")\n`;
    py += `                return False\n`;
    py += `            if "model_routing" not in p:\n`;
    py += `                print(f"❌ Invalid: Prompt {p.get('id')} has no routing configured.")\n`;
    py += `                return False\n`;
    py += `        print("✅ Prompt registry structure is valid.")\n`;
    py += `        return True\n`;
    py += `    except Exception as e:\n`;
    py += `        print(f"❌ Loading error: {e}")\n`;
    py += `        return False\n\n`;
    py += `if __name__ == '__main__':\n`;
    py += `    success = validate_registry_file()\n`;
    py += `    sys.exit(0 if success else 1)\n`;

    compiledCode.prompt_py = py;

    // 3. Compile Flow Graph
    let flow = 'graph TD\n';
    flow += `  REG[📝 prompts.yaml: sre-${cat.toLowerCase()}-task v${ver}] -->|Load configurations| R[🔀 Prompt Router]\n`;
    flow += `  R -->|1. Request Primary| PM[🤖 ${primaryModel.split('/').pop()}]\n`;
    flow += `  PM -->|Failover case| FM[🤖 Backup: ${fallbackModel.split('/').pop()}]\n`;
    flow += `  PM & FM -->|Receive Raw Text| V[🔍 Output Parser Validation]\n`;
    if (fmt === 'JSON') {
      flow += '  V -->|Enforce structure| JSON[💾 JSON Schema Object Output]\n';
    } else if (fmt === 'XML') {
      flow += '  V -->|Enforce tags| XML[💾 XML Tagged Response Output]\n';
    } else {
      flow += '  V -->|Plain Text| Text[💾 Plaintext Response Output]\n';
    }
    compiledCode.prompt_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'prompt_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.prompt_flow + '</div>';
      
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
      let filename = 'prompts.yaml';
      if (activeTab === 'prompt_py') filename = 'validate_prompts.py';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  if (elements.category) elements.category.addEventListener('change', compileConfigs);
  if (elements.routing) elements.routing.addEventListener('change', compileConfigs);
  if (elements.version) elements.version.addEventListener('input', compileConfigs);
  if (elements.format) elements.format.addEventListener('change', compileConfigs);
  if (elements.systemDesc) elements.systemDesc.addEventListener('input', compileConfigs);

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
    ['prompt_yaml', 'prompt_py', 'prompt_flow'],
    'prompt_yaml',
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
  if (document.getElementById('prompt_category')) {
    initPromptopsStudio();
  }
});

window.initPromptopsStudio = initPromptopsStudio;
