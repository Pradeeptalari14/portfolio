import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'config';

let compiledCode = {
  config: '',
  instrument: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('signing_tool').addEventListener('change', triggerCompileAll);
  $('registry_type').addEventListener('change', triggerCompileAll);
  $('retention_days').addEventListener('input', triggerCompileAll);
  $('vuln_action').addEventListener('change', triggerCompileAll);
  $('registry_scan').addEventListener('change', triggerCompileAll);

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileConfig();
  compileInstrument();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileConfig() {
  const tool = $('signing_tool').value;
  const registry = $('registry_type').value;

  let code = `#!/usr/bin/env bash
# sign_image.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Container Image Verification Script using ${tool.toUpperCase()}

set -euo pipefail

IMAGE_TAG="my-registry.local/production/payment-api:latest"
KEY_PATH="./cosign.key"

echo "==> Initiating Container Image Signature validation..."

`;

  if (tool === 'cosign') {
    code += `# Generate key pair if not exists
if [ ! -f "$KEY_PATH" ]; then
    echo "Cosign key not found. Generating new key pair..."
    cosign generate-key-pair
fi

# Sign target image
echo "Signing image $IMAGE_TAG..."
cosign sign --key "$KEY_PATH" --yes "$IMAGE_TAG"

# Verify signature
echo "Verifying image signature..."
cosign verify --key cosign.pub "$IMAGE_TAG"
`;
  } else {
    code += `# Notary signing flow
export DOCKER_CONTENT_TRUST=1
export DOCKER_CONTENT_TRUST_SERVER="https://notary.service.local:4443"

echo "Signing image with Notary..."
docker trust sign "$IMAGE_TAG"

echo "Verifying signature validation..."
docker trust inspect --pretty "$IMAGE_TAG"
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const registry = $('registry_type').value;
  const days = parseInt($('retention_days').value) || 30;
  const action = $('vuln_action').value;
  const scan = $('registry_scan').checked;

  let code = '';
  if (registry === 'harbor') {
    code = `{
  "id": 1,
  "name": "Harbor Image Retention & Security Spec",
  "version": "v${SCRIPT_VERSION}",
  "copyright": "Copyright (c) 2026 Talari Pradeep. All Rights Reserved.",
  "rules": [
    {
      "disabled": false,
      "trigger": "cron",
      "trigger_config": {
        "cron": "0 0 0 * * *"
      },
      "action": "retention",
      "action_config": {
        "days": ${days},
        "keep_tags": ["latest", "stable", "v*"]
      }
    },
    {
      "action": "security_block",
      "action_config": {
        "prevent_vuln": ${action === 'block'},
        "severity_threshold": "high",
        "scanner": "trivy",
        "auto_scan": ${scan}
      }
    }
  ]
}`;
  } else if (registry === 'ecr') {
    code = `{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Retain stable tags, expire older images after ${days} days",
      "selection": {
        "tagStatus": "any",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": ${days}
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}`;
  } else {
    code = `{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": ${days},
          "tagState": "any"
        }
      }
    ]
  }
}`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const registry = $('registry_type').value;

  let md = `# Container Security & Registry Policies v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Securing container deployment loops with image signing and tag lifecycle management policies.

## Targets
- **Registry Integration**: ${registry.toUpperCase()}
- **Image Signing**: Cosign / Notary metadata validators.

## Installation
1. Install Cosign CLI:
   \`\`\`bash
   go install github.com/sigstore/cosign/v2/cmd/cosign@latest
   \`\`\`
2. Sign images inside CI workflow:
   \`\`\`bash
   bash sign_image.sh
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const action = $('vuln_action').value;

  let md = `# SRE Runbook: Container Registry Signature & Vulnerability Triage
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Pod Deployment Blocked due to Verification Failure

If Kubernetes deployments throw \`ImagePullBackOff\` or admission webhook blocks image pull:

### Step 1: Inspect Policy Logs
Confirm why the image was blocked (Unsigned vs Vulnerable):
- Run registry security scan audits.
- If policy action is set to **${action.toUpperCase()}**, the image will fail checks if CVEs are found.

### Step 2: Validate Image Signatures
Manually check container signatures against public key keys:
\`\`\`bash
cosign verify --key cosign.pub my-registry.local/production/payment-api:latest
\`\`\`

### Step 3: Mitigation for Urgent Fixes
If a critical production hotfix is blocked:
1. Verify the vulnerability path is not exploitable.
2. Add the CVE ID to the registry ignore list or bypass webhook temporarily using admin credentials.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const action = $('vuln_action').value;
  let chart = 'graph TD\n';

  chart += `  Push[CI Push Image to Registry] --> Scan[Trigger Vulnerability Scan]\n`;
  chart += `  Scan --> CheckVuln{Vulnerability Severity?}\n`;
  if (action === 'block') {
    chart += `  CheckVuln -->|High/Critical| Block[Block Pull & Reject Deploy]\n`;
    chart += `  CheckVuln -->|Low/Medium| Sign[Sign Image with Cosign]\n`;
  } else {
    chart += `  CheckVuln -->|High/Critical| Warn[Warn Operator & Allow Pull]\n`;
    chart += `  CheckVuln -->|Low/Medium| Sign[Sign Image with Cosign]\n`;
    chart += `  Warn --> Sign\n`;
  }
  chart += `  Sign --> Deploy[Apply to Kubernetes Cluster]\n`;
  chart += `  Deploy --> Validate[K8s Admission Webhook verify signature]\n`;
  chart += `  Validate -->|Valid| Run[Run Pod Container]\n`;
  chart += `  Validate -->|Invalid| Terminate[Block Scheduling & Throw Error]\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const registry = $('registry_type').value;

  if (tabId === 'config') {
    nameBox.value = 'sign_image';
    extTag.textContent = '.sh';
  } else if (tabId === 'instrument') {
    if (registry === 'harbor') {
      nameBox.value = 'retention_policy';
    } else {
      nameBox.value = 'registry_config';
    }
    extTag.textContent = '.json';
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
  const tool = $('signing_tool').value;
  const registry = $('registry_type').value;
  const zip = new JSZip();

  zip.file('sign_image.sh', compiledCode.config);
  if (registry === 'harbor') {
    zip.file('retention_policy.json', compiledCode.instrument);
  } else {
    zip.file('registry_config.json', compiledCode.instrument);
  }
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `container-registry-${registry}.zip`;
    a.click();
    showToast('⬇️ Container Registry SRE package downloaded!');
  });
}

function clearAllFields() {
  $('signing_tool').value = 'cosign';
  $('registry_type').value = 'harbor';
  $('retention_days').value = '30';
  $('vuln_action').value = 'block';
  $('registry_scan').checked = true;

  switchTab('config');
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
  const registry = $('registry_type').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'harbor': [
      {
        title: 'Harbor Vulnerability Scanners',
        why: 'Prevents insecure image pulls by scanning tags dynamically using Trivy.',
        whyNot: 'Vulnerable containers migrate to workloads unchallenged, risking exposures.',
        runtime: 'Performs webhook validation callbacks upon registry push events.'
      },
      {
        title: 'Harbor Tag Retention Loops',
        why: 'Clears orphan image tags systematically to prevent storage leaks.',
        whyNot: 'Storage volumes fill up, blocking future image push operations.',
        runtime: 'Applies cron matching retention patterns.'
      }
    ],
    'ecr': [
      {
        title: 'ECR Lifecycle Policies',
        why: 'Removes untagged images automatically to optimize AWS storage fees.',
        whyNot: 'Accumulated untagged containers increase monthly AWS billings.',
        runtime: 'Pipes rules directly into ECR lifecycle managers.'
      }
    ],
    'gcr': [
      {
        title: 'GCR Lifecycle Storage Actions',
        why: 'Ties images lifespan directly to system age policies.',
        whyNot: 'Old debug artifacts persist forever, leaking storage budgets.',
        runtime: 'Applies google storage lifecycle filters.'
      }
    ]
  };

  const activeData = manualData[registry] || [];
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
  const registry = $('registry_type').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'Image Sign Bash Script',
      'filename': 'sign_image.sh',
      'why': 'Invokes cosign / notary tools to append crypto verification keys onto pushed image paths.',
      'when': 'Execute after artifact compilation inside CI build pipelines.',
      'where': 'Deploy as a build worker runner script.',
      'command': 'bash sign_image.sh',
      'practices': ['Generate Cosign keys with secure passwords.', 'Do not expose private keys in repositories.'],
      'ai_mlops': 'Secures AI models bundled inside docker images, validating code origins.',
      'flow': '[Pushed Image] ➔ [Generate Keys] ➔ [Sign Digests] ➔ [Publish Metadata]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'Registry Lifecycle Policy',
      'filename': registry === 'harbor' ? 'retention_policy.json' : 'registry_config.json',
      'why': 'Declaratively dictates how long images are cached and what vulnerability checks to run.',
      'when': 'Apply when organizing registry storage plans.',
      'where': 'Upload configuration via registry REST APIs or system portals.',
      'command': '# Configure via Registry Console',
      'practices': ['Keep stable tag rules intact.', 'Enable automatic scans on image push.'],
      'ai_mlops': 'Prunes heavy outdated model files, keeping cloud budgets minimal.',
      'flow': '[Push Image] ➔ [Trigger Policy] ➔ [Evaluate Age] ➔ [Expire/Block]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Setup Instructions Guide',
      'filename': 'README.md',
      'why': 'Installation manuals for cosign CLI dependencies and execution parameters.',
      'when': 'Consult when setting up fresh CI pipeline runners.',
      'where': 'Save in pipeline folder.',
      'command': '# View in console',
      'practices': ['Pin cosign dependencies version tags.'],
      'ai_mlops': 'Gives setup directions for secure deployment bots.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Registry Triage Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Guides operations staff to bypass signature errors or isolate unsafe image tags.',
      'when': 'Use when production deployments fail image verification validations.',
      'where': 'Publish in SRE manuals catalog.',
      'command': 'cosign verify ...',
      'practices': ['Verify CVE CVE-IDs before adding temporary bypass rules.', 'Pin trusted registries.'],
      'ai_mlops': 'Resolves container blocks during automated retraining loops.',
      'flow': '[Deployment Blocked] ➔ [Audit CVE status] ➔ [Override or Re-build]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Registry Execution Flow Chart',
      'filename': 'flow.mermaid',
      'why': 'Tracks container verification from registry push to kubernetes schedule.',
      'when': 'Consult during security audits.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Enforce hard blocks for critical security threats.'],
      'ai_mlops': 'Assurance checklist for compliance managers.',
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
