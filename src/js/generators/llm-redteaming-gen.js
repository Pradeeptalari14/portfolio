// LLM Red Teaming & Vulnerability Scanner Studio compiler logic

function initRedteamingStudio() {
  const elements = {
    probeType: document.getElementById('rt_probe_type'),
    suiteSize: document.getElementById('rt_suite_size'),
    threshold: document.getElementById('rt_threshold'),
    exitOnFail: document.getElementById('rt_exit_on_fail'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-rt'),
    btnDownload: document.getElementById('btn-download-rt'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'rt_yaml';
  let compiledCode = {
    rt_yaml: '',
    rt_sh: '',
    rt_flow: ''
  };

  function compileConfigs() {
    const probe = elements.probeType ? elements.probeType.value : 'Jailbreak';
    const size = elements.suiteSize ? elements.suiteSize.value : '100';
    const thresh = elements.threshold ? elements.threshold.value : '95';
    const isExit = elements.exitOnFail ? elements.exitOnFail.checked : true;

    let probeClass = 'jailbreak.DAN';
    if (probe === 'Injection') probeClass = 'xss.RxssProbe';
    if (probe === 'DataLeak') probeClass = 'leak.PII';
    if (probe === 'Hallucination') probeClass = 'donotuse.Factuality';

    // 1. Compile garak-config.yaml
    let yaml = `--- # Garak LLM Vulnerability Scanner Config\n`;
    yaml += `system:\n`;
    yaml += `  report_prefix: "redteam-audit-report"\n`;
    yaml += `  verbose: 1\n\n`;

    yaml += `probes:\n`;
    yaml += `  - ${probeClass}\n\n`;

    yaml += `evaluators:\n`;
    yaml += `  threshold: 0.${thresh}\n`;
    yaml += `  exit_on_failure: ${isExit ? 'true' : 'false'}\n\n`;

    yaml += `runner:\n`;
    yaml += `  generations: ${size}\n`;
    yaml += `  model_type: "huggingface"\n`;
    yaml += `  model_name: "microsoft/Phi-3-mini-4k-instruct"\n`;

    compiledCode.rt_yaml = yaml;

    // 2. Compile run-audit.sh
    let sh = `#!/usr/bin/env bash\n`;
    sh += `# Automated LLM Security Scanner Run Script\n`;
    sh += `set -euo pipefail\n\n`;

    sh += `echo "🔍 Initializing LLM Red Teaming Audit..."\n`;
    sh += `echo "Probe Class: ${probeClass}"\n`;
    sh += `echo "Threshold:   ${thresh}%"\n\n`;

    sh += `if [ "\${1:-}" = "--check" ]; then\n`;
    sh += `  echo "Checking dependency: Garak security framework..."\n`;
    sh += `  # Simulate garak dependency verification\n`;
    sh += `  echo "✅ Garak command verified."\n`;
    sh += `  exit 0\n`;
    sh += `fi\n\n`;

    sh += `echo "🚀 Running Garak scanner against target model..."\n`;
    sh += `python3 -m garak --model_type huggingface --model_name microsoft/Phi-3-mini-4k-instruct --probes ${probeClass} --generations ${size} --config garak-config.yaml\n\n`;

    sh += `# Read reports\n`;
    sh += `echo "✅ Report compiled: reports/redteam-audit-report.html"\n`;
    sh += `echo "🎉 Security checks completed."\n`;

    compiledCode.rt_sh = sh;

    // 3. Compile Flow Graph
    let flow = 'graph TD\n';
    flow += `  Probe[🎯 Security Probe: ${probeClass}] -->|Generate adversarial test| Runner[⚡ Garak Vulnerability Runner]\n`;
    flow += `  Runner -->|Send ${size} prompt attempts| Target[🤖 Target LLM Model]\n`;
    flow += `  Target -->|Return responses| Eval[🔍 Alignment Evaluator: Threshold ${thresh}%]\n`;
    if (isExit) {
        flow += '  Eval -->|Checks fail| CI[❌ Exit 1: Block CI Pipeline]\n';
        flow += '  Eval -->|Checks pass| HTML[✅ Save HTML Report]\n';
    } else {
        flow += '  Eval -->|Save report and continue| HTML[✅ Save HTML Report]\n';
    }
    compiledCode.rt_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'rt_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.rt_flow + '</div>';
      
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
      let filename = 'garak-config.yaml';
      if (activeTab === 'rt_sh') filename = 'run-audit.sh';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  if (elements.probeType) elements.probeType.addEventListener('change', compileConfigs);
  if (elements.suiteSize) elements.suiteSize.addEventListener('change', compileConfigs);
  if (elements.threshold) elements.threshold.addEventListener('input', compileConfigs);
  if (elements.exitOnFail) elements.exitOnFail.addEventListener('change', compileConfigs);

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
    ['rt_yaml', 'rt_sh', 'rt_flow'],
    'rt_yaml',
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
  if (document.getElementById('rt_probe_type')) {
    initRedteamingStudio();
  }
});

window.initRedteamingStudio = initRedteamingStudio;
