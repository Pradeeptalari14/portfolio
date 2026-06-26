// AI Security & Governance Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'guardrails_yaml';
  let compiledCode = {};

  function compileConfigs() {
    
    const provider = document.getElementById('sec_provider').value;
    const shield = document.getElementById('shield_key').value;
    const action = document.getElementById('scan_action').value;
    compiledCode.guardrails_yaml = "apiVersion: guardrails/v1\nkind: SafetyPolicy\nmetadata:\n  name: enterprise-safety\nspec:\n  provider: " + provider + "\n  rules:\n    - category: " + shield + "\n      action: " + action + "\n";
    compiledCode.shield_py = "# Python security shield wrapper\ndef inspect_prompt(prompt: str):\n    print(\"Scanning for: " + shield + "\")\n    if detects_anomaly(prompt):\n        return \"" + (action === 'block' ? 'BLOCKED' : 'ANONYMIZED') + "\"\n";
    compiledCode.security_flow = "graph TD\n  Request[Input Prompt] -->|Check Safety| Guard[Safety Policy: " + provider + "]\n  Guard -->|Trigger: " + shield + "| Decision[Action: " + action + "]";
    let filename = 'security_rules.yaml';
    if (activeTab === 'shield_py') filename = 'shield.py';
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
    ['guardrails_yaml', 'shield_py', 'security_flow'],
    'guardrails_yaml',
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
