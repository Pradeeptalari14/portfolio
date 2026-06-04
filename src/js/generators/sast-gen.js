import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'rules';

let compiledCode = {
  rules: '',
  ci: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('sast_tool').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileRules();
  compileCI();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileRules() {
  const tool = $('sast_tool').value;
  const target = $('sast_target').value;
  const severity = $('sast_severity').value;

  let code = '';

  if (tool === 'semgrep') {
    code = `# semgrep_rules.yaml v${SCRIPT_VERSION} - Custom Semgrep SAST rule
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

rules:
  - id: custom-sre-${target}-security-rules
    patterns:
      - pattern: |
          ${target === 'python' ? 'eval(...)' : (target === 'go' ? 'os.exec(...)' : (target === 'nodejs' ? 'exec(...)' : 'provider "aws" { ... }'))}
    message: "Security violation: insecure pattern/provider detected in ${target} code base."
    languages: [${target === 'python' ? 'python' : (target === 'go' ? 'go' : (target === 'nodejs' ? 'javascript' : 'hcl'))}]
    severity: ${severity.toUpperCase()}
`;
  } else {
    // Trivy
    code = `# trivy.yaml v${SCRIPT_VERSION} - Trivy Scanner Configuration
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

clear-cache: false
severity: "${severity.toUpperCase()}"
format: "table"
exit-code: 1 # Fail CI build on vulnerability findings
vuln-type: "os,library"
ignore-unfixed: true
`;
  }

  compiledCode.rules = code;
}

function compileCI() {
  const tool = $('sast_tool').value;
  const ci = $('sast_ci').value;

  let code = '';

  if (ci === 'github') {
    code = `# ci_scan.yml v${SCRIPT_VERSION} - GitHub Actions security scan job
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

name: Security SAST Scan

on: [push, pull_request]

jobs:
  sast_scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Run Security Scanner
        run: |
          ${tool === 'semgrep' ? 'pip install semgrep && semgrep --config=semgrep_rules.yaml .' : 'curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin && trivy fs --config trivy.yaml .'}
`;
  } else {
    // GitLab
    code = `# .gitlab-ci.yml snippet v${SCRIPT_VERSION} - GitLab CI security scan job
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

stages:
  - test

sast_scan:
  stage: test
  image: ${tool === 'semgrep' ? 'returntocorp/semgrep' : 'aquasec/trivy:latest'}
  script:
    - ${tool === 'semgrep' ? 'semgrep --config=semgrep_rules.yaml .' : 'trivy fs --config trivy.yaml .'}
`;
  }

  compiledCode.ci = code;
}

function compileReadme() {
  const tool = $('sast_tool').value;
  const target = $('sast_target').value;
  const ci = $('sast_ci').value;

  let md = `# SAST Security & Guardrails Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides security configuration matrices and automated CI scan rules.

## Configurations

- **SAST Tool**: ${tool === 'semgrep' ? 'Semgrep (Static Analysis)' : 'Trivy (Vulnerability Scanner)'}
- **Scan Target**: ${target.toUpperCase()} codebase
- **CI System**: ${ci === 'github' ? 'GitHub Actions' : 'GitLab CI/CD'}

## Integration

1. Place security rule configuration file (\`${tool === 'semgrep' ? 'semgrep_rules.yaml' : 'trivy.yaml'}\`) in repository root.
2. Setup CI pipeline configuration in your workflow files.
3. The build pipeline will block deployments automatically if scanning triggers violations.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const tool = $('sast_tool').value;
  const severity = $('sast_severity').value;

  let md = `# SRE Runbook: Security Scan Violations Blocked Pipeline
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: CI/CD Build Halted by SAST Scanner (Exit Code 1)

Follow these recovery steps if scanning rules block code promotions due to a \`${severity.toUpperCase()}\` violation:

### Step 1: Locate Security Report Logs
Identify the rule ID or package path causing the scanner failure from pipeline outputs:
- Semgrep: Look for rule triggers matching custom IDs.
- Trivy: Identify CVE numbers or package version vulnerability indexes.

### Step 2: Remediate the Defect
- If dependency vulnerability: Upgrade target packages to the recommended patched version.
- If code pattern violation: Refactor the code block to avoid deprecated/unsafe APIs (e.g. replacing eval).

### Step 3: Establish Safe Overrides
If it is a confirmed false positive and cannot be easily refactored:
1. Add an inline ignore tag (e.g., \`# nosemgrep\` for Semgrep).
2. Or add the CVE ID to a \`.trivyignore\` ignore definition file.
3. Push overrides to Git and trigger the rerun.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Code[📄 Source Code] -->|Static Scan| Semgrep[🛡️ Semgrep / Trivy rules]\n  Semgrep -->|Match Vulnerability| Check{{Security Leak?}}\n  Check -->|Yes| Block[🚫 Block CI Pipeline Build]\n  Check -->|No| Pass[✅ Quality Gate Passed]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'rules') {
    const tool = $('sast_tool').value;
    nameBox.value = tool === 'semgrep' ? 'semgrep_rules' : 'trivy';
    extTag.textContent = '.yaml';
  } else if (tabId === 'ci') {
    const ci = $('sast_ci').value;
    nameBox.value = ci === 'github' ? 'ci_scan' : '.gitlab-ci';
    extTag.textContent = ci === 'github' ? '.yml' : '.yml';
  } else if (tabId === 'readme') {
    nameBox.value = 'README';
    extTag.textContent = '.md';
  } else if (tabId === 'runbook') {
    nameBox.value = 'sre_runbook';
    extTag.textContent = '.md';
  } else if (tabId === 'flow') {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
  }
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
  navigator.clipboard.writeText(content).then(() => {
    showToast('✅ Copied tab config to clipboard!');
  });
}

function downloadScriptZip() {
  const tool = $('sast_tool').value;
  const zip = new JSZip();
  
  zip.file((tool === 'semgrep' ? 'semgrep_rules' : 'trivy') + '.yaml', compiledCode.rules);
  zip.file('ci_scan.yml', compiledCode.ci);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sast-sre-${tool}.zip`;
    a.click();
    showToast('⬇️ SAST SRE package downloaded!');
  });
}

function clearAllFields() {
  $('sast_tool').value = 'semgrep';
  $('sast_target').value = 'python';
  $('sast_severity').value = 'warning';
  $('sast_ci').value = 'github';

  switchTab('rules');
  triggerCompileAll();
  showToast('🗑️ Defaults configurations successfully restored!');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function toggleManualItem(idx) {
  const el = $('manual-item-' + idx);
  if (el) {
    el.classList.toggle('hidden');
  }
}

function compileManual() {
  const tool = $('sast_tool').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'semgrep': [
      {
        title: 'Semgrep Custom SAST Guardrails',
        why: 'Scans source files for customized insecure programming syntax patterns, runs completely locally and integrates into CI pre-commits.',
        whyNot: 'Leaves insecure code snippets (like eval or shell injections) unmonitored inside your application codebase.',
        runtime: 'Performs syntax parsing tree matches based on patterns.'
      }
    ],
    'trivy': [
      {
        title: 'Trivy Software Supply Chain Scans',
        why: 'Scans third-party libraries, container layers, and Kubernetes configs for CVE dependency vulnerability warnings.',
        whyNot: 'Allows packages with severe security exploits into staging/production clusters.',
        runtime: 'Checks registry databases and library packages.'
      }
    ]
  };

  const activeData = manualData[tool] || [];
  activeData.forEach((item, idx) => {
    html += `
      <div class="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
        <button onclick="toggleManualItem(${idx})" class="w-full flex items-center justify-between font-bold text-slate-800 focus:outline-none">
          <span>⚙️ ${item.title}</span>
          <span class="text-xs text-slate-400">⚡ Info</span>
        </button>
        <div id="manual-item-${idx}" class="mt-2.5 pt-2.5 border-t border-slate-100 text-slate-600 space-y-2 hidden">
          <p><strong>Why configure:</strong> ${item.why}</p>
          <p class="text-rose-600"><strong>If left disabled:</strong> ${item.whyNot}</p>
          <p class="text-slate-500"><strong>Runtime Operation:</strong> ${item.runtime}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function explainActiveTabCode() {
  let explanation = null;

  if (activeTab === 'rules') {
    explanation = {
      'title': 'SAST Configuration Rules',
      'filename': 'semgrep_rules.yaml',
      'why': 'Defines custom syntax validation logic or vulnerability scanning rules.',
      'when': 'Apply in pre-commit git triggers or build/release pipelines.',
      'where': 'Store in security or repository root folders.',
      'command': 'semgrep --config=semgrep_rules.yaml .',
      'practices': ['Pin rules version.', 'Default block build on critical severity.'],
      'ai_mlops': 'Used by SRE auditing agents to evaluate codebase vulnerabilities.',
      'flow': '[SAST Rules Definition]'
    };
  } else if (activeTab === 'ci') {
    explanation = {
      'title': 'CI Pipeline integration',
      'filename': 'ci_scan.yml',
      'why': 'Automates security verification audits during code delivery cycles.',
      'when': 'On every git push action.',
      'where': 'Save in .github/workflows/ or .gitlab-ci.yml.',
      'command': '# Auto-run by GitHub / GitLab',
      'practices': ['Cache scanner databases to optimize run times.', 'Ensure strict exit-code configs.'],
      'ai_mlops': 'Self-contained security gates in GitOps pipelines.',
      'flow': '[Run Pipeline] ➔ [Checkout Code] ➔ [Execute SAST] ➔ [Verify results]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Scan Setup README',
      'filename': 'README.md',
      'why': 'Integration instructions and dependency requirements.',
      'when': 'Prior to setting up CI workflows.',
      'where': 'Save in repository root.',
      'command': '# Open in viewer',
      'practices': ['Document exception ignore guidelines.'],
      'ai_mlops': 'Context manuals for pipeline setups.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Scan Violations Playbook',
      'filename': 'sre_runbook.md',
      'why': 'Triage actions to resolve vulnerabilities or configure overrides.',
      'when': 'Consult when pipelines fail due to security checks.',
      'where': 'Store in wiki.',
      'command': '# Open in viewer',
      'practices': ['Enforce code reviews prior to ignoring rules.'],
      'ai_mlops': 'Incident context utilized by recovery bots.',
      'flow': '[Failed pipeline] ➔ [Inspect report] ➔ [Remediate / Ignore]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Security Pipeline Flowchart',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram details audit data path.',
      'when': 'During security reviews.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all fallback/timeout rules.'],
      'ai_mlops': 'Visual topology.',
      'flow': '[Mermaid Canvas Diagram]'
    };
  }

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

window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
window.closeExplanationDrawer = closeExplanationDrawer;
