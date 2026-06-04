import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'script';

let compiledCode = {
  script: '',
  encrypt: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('sops_provider').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileScript();
  compileEncrypt();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileScript() {
  const provider = $('sops_provider').value;
  const target = $('sops_target').value;
  const env = $('sops_env').value;
  const keyId = $('sops_key').value || 'age1y3djpelg8k3y56v2uwr5g0v3uhrqsp9gcyv3rsqdps6q3q6cswgqjup39p';

  let code = `# .sops.yaml v${SCRIPT_VERSION} - GitOps Secrets Encryption Schema
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

creation_rules:
  - path_regex: .*${env}.*\\.${target === 'secrets.yaml' ? 'yaml' : 'json'}
`;

  if (provider === 'age') {
    code += `    age: "${keyId}"\n`;
  } else if (provider === 'kms_aws') {
    code += `    kms: "${keyId || 'arn:aws:kms:us-east-1:123456789012:key/sops-key-uuid'}"\n`;
  } else {
    // GCP KMS
    code += `    gcp_kms: "${keyId || 'projects/company-prod/locations/global/keyRings/sops-ring/cryptoKeys/sops-key'}"\n`;
  }

  compiledCode.script = code;
}

function compileEncrypt() {
  const provider = $('sops_provider').value;
  const target = $('sops_target').value;

  let code = `#!/usr/bin/env bash
# encrypt_secrets.sh v${SCRIPT_VERSION} - SOPS Encrypt/Decrypt Automation Runner
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

set -euo pipefail

SECRETS_FILE="${target}"
DECRYPTED_FILE="decrypted_\${SECRETS_FILE}"

# 1. Verify SOPS CLI is available
if ! command -v sops &> /dev/null; then
  echo "❌ SOPS CLI is required. Install from: https://github.com/getsops/sops"
  exit 1
fi
`;

  if (provider === 'age') {
    code += `
# 2. Configure AGE private key environment if available
export SOPS_AGE_KEY_FILE="\${HOME}/.sops/key.txt"
if [ ! -f "\${SOPS_AGE_KEY_FILE}" ]; then
  echo "⚠️ Age key file not found at \${SOPS_AGE_KEY_FILE}. Ensure SOPS_AGE_KEY env is set."
fi
`;
  }

  code += `
# 3. Perform Actions
ACTION=\${1:-encrypt}

if [ "\${ACTION}" = "encrypt" ]; then
  echo "🔒 Encrypting \${SECRETS_FILE} in place..."
  sops --encrypt --in-place "\${SECRETS_FILE}"
  echo "✅ Encryption complete. Safe to commit to Git repository!"
elif [ "\${ACTION}" = "decrypt" ]; then
  echo "🔓 Decrypting \${SECRETS_FILE} to \${DECRYPTED_FILE}..."
  sops --decrypt "\${SECRETS_FILE}" > "\${DECRYPTED_FILE}"
  echo "✅ Decryption complete. Do NOT commit \${DECRYPTED_FILE} to Git!"
else
  echo "Usage: $0 [encrypt|decrypt]"
  exit 1
fi
`;

  compiledCode.encrypt = code;
}

function compileReadme() {
  const provider = $('sops_provider').value;
  const target = $('sops_target').value;
  const env = $('sops_env').value;

  let md = `# GitOps Secrets Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package configures Mozilla SOPS to encrypt credentials files before checking them into Git repositories.

## Settings

- **Encryption Provider**: ${provider.toUpperCase()}
- **Target File**: \`${target}\`
- **Deployment Environment**: ${env.toUpperCase()}

## Operational Checklist

1. Configure public/private keys using ${provider.toUpperCase()}.
2. Save the `.sops.yaml` configuration in the root directory.
3. Encrypt the secrets file before pushing to Git:
   \`\`\`bash
   bash encrypt_secrets.sh encrypt
   \`\`\`
4. Configure GitOps controllers (ArgoCD / Flux) to decrypt manifests natively during sync using plugins.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const provider = $('sops_provider').value;

  let md = `# SRE Runbook: Leaked Credentials Triage & SOPS Key Rotation
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Encrypted secrets files exposed or decryption keys leaked

Follow this containment playbook:

### Step 1: Revoke Compromised Keys
- For Age keys:
  Generate a new private key immediately and discard the leaked key.
- For Cloud KMS (AWS/GCP):
  Disable/Revoke the compromised KMS key version immediately via IAM.

### Step 2: Generate New Secret Key
Generate the new key signature details:
`;

  if (provider === 'age') {
    md += `\`\`\`bash
age-keygen -o new_key.txt
cat new_key.txt | grep 'public key'
\`\`\`
`;
  } else {
    md += `Create a new key version inside cloud console and fetch the target ARN/ID.
`;
  }

  md += `
### Step 3: Rotate Keys inside SOPS
1. Update public key details in \`.sops.yaml\`.
2. Decrypt target secrets using the old key:
   \`\`\`bash
   sops --decrypt secrets.yaml > decrypted_secrets.yaml
   \`\`\`
3. Re-encrypt the raw file using the new key rule config:
   \`\`\`bash
   sops --encrypt --in-place secrets.yaml
   \`\`\`
4. Push rotated encrypted changes to Git repository.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Secrets[🔑 Plain Secrets] -->|SOPS Encrypt| Encrypted[🔐 SOPS Encrypted Secrets YAML]\n  Encrypted -->|Commit| Git[🐱 Git Repository]\n  Git -->|Detect change| Flux[🐙 FluxCD / ArgoCD decryptor]\n  Flux -->|Inject| Pods[🚀 Pod Environments]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'script') {
    nameBox.value = '.sops';
    extTag.textContent = '.yaml';
  } else if (tabId === 'encrypt') {
    nameBox.value = 'encrypt_secrets';
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
  const zip = new JSZip();
  
  zip.file('.sops.yaml', compiledCode.script);
  zip.file('encrypt_secrets.sh', compiledCode.encrypt);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gitops-secrets-sre.zip`;
    a.click();
    showToast('⬇️ GitOps Secrets SRE package downloaded!');
  });
}

function clearAllFields() {
  $('sops_provider').value = 'age';
  $('sops_target').value = 'secrets.yaml';
  $('sops_env').value = 'production';
  $('sops_key').value = 'age1y3djpelg8k3y56v2uwr5g0v3uhrqsp9gcyv3rsqdps6q3q6cswgqjup39p';

  switchTab('script');
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
  const provider = $('sops_provider').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'age': [
      {
        title: 'Age Encrypted Secrets Keys',
        why: 'Enables simple, lightweight local key-based file encryption suitable for GitOps workflows.',
        whyNot: 'Relies on system keys files which must be distributed securely among engineering teams.',
        runtime: 'Uses local age private/public keys.'
      }
    ],
    'kms_aws': [
      {
        title: 'AWS KMS Key Policies integrations',
        why: 'Leverages central cloud keys policies, simplifying rotation and access logging rules.',
        whyNot: 'Requires active internet access to AWS KMS endpoint during developer checks.',
        runtime: 'Queries AWS KMS APIs.'
      }
    ],
    'kms_gcp': [
      {
        title: 'GCP Cloud KMS Auth Rules',
        why: 'Centralizes encryption management within Google Cloud Project policies scopes.',
        whyNot: 'Requires explicit cloud IAM permissions setups for developers and CI/CD service accounts.',
        runtime: 'Queries GCP KMS APIs.'
      }
    ]
  };

  const activeData = manualData[provider] || [];
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
  const provider = $('sops_provider').value;
  const target = $('sops_target').value;

  if (activeTab === 'script') {
    explanation = {
      'title': 'SOPS Configuration',
      'filename': '.sops.yaml',
      'why': 'Maps encryption public key rules to files matching path regex patterns.',
      'when': 'Prior to running SOPS commands on target folders.',
      'where': 'Deploy at the root of Git repositories.',
      'command': '# Evaluated by SOPS automatically',
      'practices': ['Pin exact regex matching rules.', 'Limit key permissions scopes.'],
      'ai_mlops': 'Allows secure checking of database keys used by AI models.',
      'flow': '[Load path matching rules]'
    };
  } else if (activeTab === 'encrypt') {
    explanation = {
      'title': 'SOPS Runner Script',
      'filename': 'encrypt_secrets.sh',
      'why': 'Standardizes how developers encrypt or decrypt secrets locally to prevent accidental commits.',
      'when': 'Run before committing files or during local setups.',
      'where': 'Save in config directories.',
      'command': 'bash encrypt_secrets.sh encrypt',
      'practices': ['Enforce check limits in pre-commit hooks.', 'Ensure decrypted files are gitignored.'],
      'ai_mlops': 'Used by developers to decrypt API keys for local model testing.',
      'flow': '[Run sops runner]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Operational Guide',
      'filename': 'README.md',
      'why': 'Walks through setting up SOPS and integrating it with GitOps tools.',
      'when': 'Prior to onboarding new team members.',
      'where': 'Save in secrets directory.',
      'command': '# Open in viewer',
      'practices': ['Document target key configurations.'],
      'ai_mlops': 'Onboarding guide contexts.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Rotations Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Emergency containment guide to rotate keys and re-encrypt secrets files.',
      'when': 'On credential exposures or keys revocation incidents.',
      'where': 'Store in SRE handbook.',
      'command': '# Review rotation instructions',
      'practices': ['Execute dry runs first.', 'Validate decryption sanity check metrics.'],
      'ai_mlops': 'Auto-rotation triggers.',
      'flow': '[Incident] ➔ [Revoke key] ➔ [Update .sops.yaml] ➔ [Re-encrypt]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Encryption Lifecycle Flow',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram showing GitOps encryption pipeline.',
      'when': 'During design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all decryption environments.'],
      'ai_mlops': 'Validation blueprint.',
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

window.closeExplanationDrawer = closeExplanationDrawer;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
