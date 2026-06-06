import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'policy';

let compiledCode = {
  policy: '',
  scan: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('compliance_engine').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compilePolicy();
  compileScan();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compilePolicy() {
  const engine = $('compliance_engine').value;
  const target = $('compliance_target').value;
  const action = $('compliance_action').value;
  const category = $('compliance_category').value;

  let code = '';

  if (engine === 'opa') {
    code = `# policy.rego v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Open Policy Agent security rule compliance policy

package security.admission

default allow = false

# Validate category constraints: ${category}
allow {
    not violation
}

violation {
    # Check if privilege escalation is requested
    input.request.object.spec.containers[_].securityContext.privileged == true
}

violation {
    # Check for public ingress endpoints
    input.request.object.spec.rules[_].http.paths[_].backend.service.name == "admin-dashboard"
}
`;
  } else {
    // Kyverno
    code = `# policy_rule.yaml v${SCRIPT_VERSION}
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: enforce-sre-safeguards
  annotations:
    policies.kyverno.io/category: SRE Security
spec:
  validationFailureAction: ${action === 'deny' ? 'Enforce' : 'Audit'}
  rules:
    - name: block-${category}-violations
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Resource validation failed. Category rules: ${category} violated."
        pattern:
          spec:
            containers:
              - name: "*"
                securityContext:
                  allowPrivilegeEscalation: false
`;
  }

  compiledCode.policy = code;
}

function compileScan() {
  const engine = $('compliance_engine').value;

  let code = `#!/usr/bin/env bash
# scan.sh v${SCRIPT_VERSION} - Policy Compliance Scan Runner
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Scans resources against OPA policies / Kyverno schemas

echo "🔍 Initiating security compliance scan..."
`;

  if (engine === 'opa') {
    code += `
# 1. Download OPA utility if not available
if ! command -v opa &> /dev/null; then
  echo "Downloading OPA binary..."
  curl -L -o opa https://openpolicyagent.org/downloads/v0.60.0/opa_linux_amd64
  chmod +x opa
  sudo mv opa /usr/local/bin/
fi

# 2. Run OPA evaluation check
opa eval -data policy.rego -input input.json "data.security.admission.violation"
`;
  } else {
    code += `
# 1. Evaluate Kyverno policies locally using Kyverno CLI
if ! command -v kyverno &> /dev/null; then
  echo "Downloading Kyverno CLI..."
  curl -LO https://github.com/kyverno/kyverno/releases/download/v1.10.0/kyverno-cli_v1.10.0_linux_x86_64.tar.gz
  tar -xf kyverno-cli_v1.10.0_linux_x86_64.tar.gz
  sudo mv kyverno /usr/local/bin/
fi

kyverno apply policy_rule.yaml --resource resource.yaml
`;
  }

  compiledCode.scan = code;
}

function compileReadme() {
  const engine = $('compliance_engine').value;
  let md = `# Policy-as-Code Compliance Engine v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides automated policy manifests and scanning shell scripts to enforce Kubernetes and Terraform compliance.

## Usage

1. Review policy rules:
   - File: \`${engine === 'opa' ? 'policy.rego' : 'policy_rule.yaml'}\`
2. Test resources locally:
   \`\`\`bash
   bash scan.sh
   \`\`\`
3. Integration:
   - Deploy as a Kubernetes Admission Webhook to reject insecure deployments automatically.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const action = $('compliance_action').value;

  let md = `# SRE Runbook: Policy-as-Code Admission Violations
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Resource Deployment Rejected (HTTP 400)

If developer resource deployments are blocked by policy controls:

### Step 1: Inspect Error Message
Identify which security context rule failed. The controller returns the exact policy rule violated:
- Action registered: \`${action.toUpperCase()}\`

### Step 2: Establish Compliance Exceptions (Policy Override)
If the deployment requires elevated privileges (e.g. storage provisioners):
1. Create a namespace exception rule in the Kyverno/OPA policy target files.
2. Commit changes to GitOps repository.
3. Rerun delivery pipelines.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Manifest[📄 Kubernetes Manifest] -->|Check Rules| Gate[🛡️ OPA Gatekeeper / Kyverno]\n  Gate -->|Validate| Compliance{{Compliant?}}\n  Compliance -->|Yes| Deploy[🚀 Deploy to Cluster]\n  Compliance -->|No| Block[🚫 Block Admission & Log Violation]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'policy') {
    nameBox.value = 'policy';
    const engine = $('compliance_engine').value;
    extTag.textContent = engine === 'opa' ? '.rego' : '.yaml';
  } else if (tabId === 'scan') {
    nameBox.value = 'scan';
    extTag.textContent = '.sh';
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
    
    if (typeof mermaid === 'undefined') {
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Please check your internet connection or reload the page.\n\nCode:\n${compiledCode.flow}</pre>`;
    } else {
      try {
        mermaid.run({
          nodes: [container.querySelector('.mermaid')]
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
      }
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
  const engine = $('compliance_engine').value;
  const zip = new JSZip();
  
  zip.file('policy' + (engine === 'opa' ? '.rego' : '.yaml'), compiledCode.policy);
  zip.file('scan.sh', compiledCode.scan);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `compliance-sre-${engine}.zip`;
    a.click();
    showToast('⬇️ Compliance SRE package downloaded!');
  });
}

function clearAllFields() {
  $('compliance_engine').value = 'opa';
  $('compliance_target').value = 'k8s';
  $('compliance_action').value = 'deny';
  $('compliance_category').value = 'privilege';

  switchTab('policy');
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
  const engine = $('compliance_engine').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'opa': [
      {
        title: 'OPA Rego Policy Enforcement',
        why: 'Enables custom declarative checks for JSON structures (Kubernetes specs, Terraform plans).',
        whyNot: 'Leaves your pipelines without automated checks, depending entirely on manual SRE reviews.',
        runtime: 'Evaluates inputs recursively using logic rules.'
      }
    ],
    'kyverno': [
      {
        title: 'Kyverno Admission Control Validation',
        why: 'Applies cluster-wide policy checks directly as native CRD definitions.',
        whyNot: 'Requires separate sidecar containers or extra proxy logic to parse requests.',
        runtime: 'Checks schema paths during API server validate call loops.'
      }
    ]
  };

  const activeData = manualData[engine] || [];
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

  if (activeTab === 'policy') {
    explanation = {
      'title': 'Compliance Policy Code',
      'filename': 'policy.rego',
      'why': 'Enforces security guardrails such as blocking root escalation and exposed ports.',
      'when': 'Apply in pre-commit git hooks or CI/CD static scan steps.',
      'where': 'Deploy as Admission controller rules in Kubernetes.',
      'command': 'opa test policy.rego',
      'practices': ['Maintain clear exception blocks.', 'Default deny all unknown inputs.'],
      'ai_mlops': 'Audited by SRE AI agents to verify security parameters.',
      'flow': '[Compliance Policy Definition]'
    };
  } else if (activeTab === 'scan') {
    explanation = {
      'title': 'Local Scan Runner Script',
      'filename': 'scan.sh',
      'why': 'Downloads necessary engine binaries and runs validation checks on local workspaces.',
      'when': 'Run during developer validation steps before code pushes.',
      'where': 'Save in repository.',
      'command': 'bash scan.sh',
      'practices': ['Log failures clearly.', 'Block CI build pipeline if compliance checks fail.'],
      'ai_mlops': 'Used by SRE checkers to validate environment compliance.',
      'flow': '[Download CLI] ➔ [Load Manifest] ➔ [Execute Scan] ➔ [Audit results]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'ReadMe Usage Guide',
      'filename': 'README.md',
      'why': 'Installation checklists and commands to configure policy runners.',
      'when': 'Consult prior to launching scan tests.',
      'where': 'Save in repository.',
      'command': '# Open in viewer',
      'practices': ['Document all policy exception cases.'],
      'ai_mlops': 'Context instructions for automation scripts.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Policy Violations Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Triage playbook to troubleshoot rejections and configure overrides.',
      'when': 'Triggered when deployments are blocked by OPA/Kyverno controllers.',
      'where': 'Store in wiki.',
      'command': '# Open in viewer',
      'practices': ['Enforce audit mode in dev namespaces.'],
      'ai_mlops': 'Guides SRE agents resolving admission blockages.',
      'flow': '[Policy Rejection] ➔ [Review logs] ➔ [Add namespace exception] ➔ [Rerun]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Admission webhook flow',
      'filename': 'flow.mermaid',
      'why': 'Maps admission checking steps.',
      'when': 'Consult during design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all fallback/timeout rules.'],
      'ai_mlops': 'Validation blueprint for admission checks.',
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
