import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'rules';

let compiledCode = {
  rules: '',
  alerts: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('finops_provider').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileRules();
  compileAlerts();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileRules() {
  const provider = $('finops_provider').value;
  const target = $('finops_target').value;
  const action = $('finops_action').value;
  const schedule = $('finops_schedule').value;

  let code = '';

  if (provider === 'aws') {
    code = `# custodian_policy.yaml v${SCRIPT_VERSION} - Cloud Custodian SRE Policy
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

policies:
  - name: clean-unused-cloud-${target}
    resource: ${target === 'volumes' ? 'ebs' : (target === 'snapshots' ? 'ebs-snapshot' : 'elastic-ip')}
    comment: "Automatically sweeps ${target.replace('_', ' ')} based on FinOps schedules"
    filters:
      - ${target === 'volumes' ? 'State: available' : (target === 'snapshots' ? 'Age: {days: 30}' : 'AssociationId: null')}
    actions:
      - type: ${action === 'notify' ? 'notify' : 'delete'}
        ${action === 'notify' ? 'to: [sre-alerts@example.com]\n        transport: {type: sqs, queue: finops-billing-queue}' : ''}
`;
  } else {
    // GCP Python cleanup utility
    code = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# cleanup_gcp.py v${SCRIPT_VERSION} - GCP FinOps Cleanup script
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

from google.cloud import compute_v1
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def sweep_gcp_resources():
    logging.info("Starting GCP resource sweep for target: ${target}...")
    client = compute_v1.InstancesClient()
    # Mock GCP SDK sweeps
    # In production, check disk properties, detached states, and IPs.
    logging.info("GCP Resource sweep completed. Target action: ${action.toUpperCase()}")

if __name__ == '__main__':
    sweep_gcp_resources()
`;
  }

  compiledCode.rules = code;
}

function compileAlerts() {
  const provider = $('finops_provider').value;
  const target = $('finops_target').value;

  const alerts = {
    version: SCRIPT_VERSION,
    provider: provider,
    budget: {
      limit_amount: 5000,
      currency: "USD",
      thresholds: [
        { percentage: 80, notification_type: "ACTUAL", recipient: "sre-alerts@example.com" },
        { percentage: 100, notification_type: "FORECASTED", recipient: "billing-admin@example.com" }
      ],
      auto_remediate: target === 'volumes' ? true : false
    }
  };

  compiledCode.alerts = JSON.stringify(alerts, null, 2);
}

function compileReadme() {
  const provider = $('finops_provider').value;
  const target = $('finops_target').value;
  const schedule = $('finops_schedule').value;

  let md = `# FinOps Cloud Cost Optimization Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides automated rules and scripts to clear idle and detached cloud resources.

## Settings

- **Cloud Provider**: ${provider.toUpperCase()}
- **Target Waste**: ${target.toUpperCase()}
- **Optimization Schedule**: ${schedule.toUpperCase()}

## Usage

### ${provider === 'aws' ? 'Cloud Custodian Policy' : 'GCP python script'}
1. Install requirements:
   \`\`\`bash
   ${provider === 'aws' ? 'pip install c7n' : 'pip install google-cloud-compute'}
   \`\`\`
2. Execute the sweep tool:
   \`\`\`bash
   ${provider === 'aws' ? 'custodian run --output_dir=. custodian_policy.yaml' : 'python cleanup_gcp.py'}
   \`\`\`
3. Verify the generated logs to confirm billing reductions.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const target = $('finops_target').value;

  let md = `# SRE Runbook: FinOps Cost Sweeper & Resource Reclaiming
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Cost Alert - Budget Limit Exceeded (> 80% Threshold)

Follow these recovery steps if budget alarms trigger:

### Step 1: Query Detached Storage
Identify orphaned resources causing storage billing leaks:
- Detached Volumes: Check for \`available\` state.
- Snapshots: List snapshots older than 30 days.

### Step 2: Run Custodian Sweeper
Execute the dry-run command to audit how much budget will be saved:
\`\`\`bash
custodian run --dryrun --output_dir=dryrun custodian_policy.yaml
\`\`\`

### Step 3: Enforce Purge
If dry-run outputs verify safety compliance:
1. Apply the automated purge script.
2. Confirm the active cloud bill drops within the next reporting window.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n';

  chart += `  Cron[Billing Cron / Schedule] -->|1. Trigger sweep| Sweeper[FinOps Sweeper Engine]\n`;
  chart += `  Sweeper -->|2. Check Resource states| Cloud[AWS / GCP Cloud API]\n`;
  chart += `  Cloud -->|3. Return detached assets| Sweeper\n`;
  chart += `  Sweeper -->|4. Filter criteria| Filters{Is Idle / Orphaned?}\n`;
  chart += `  Filters -->|No| Safe[Leave resource untouched]\n`;
  chart += `  Filters -->|Yes| Action{Action Strategy}\n`;
  chart += `  Action -->|Notify| Slack[Send Alert & request owner cleanup]\n`;
  chart += `  Action -->|Delete| Purge[Purge Resource & update Billing ledger]\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'rules') {
    const provider = $('finops_provider').value;
    nameBox.value = provider === 'aws' ? 'custodian_policy' : 'cleanup_gcp';
    extTag.textContent = provider === 'aws' ? '.yaml' : '.py';
  } else if (tabId === 'alerts') {
    nameBox.value = 'budget_alerts';
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
  const provider = $('finops_provider').value;
  const zip = new JSZip();
  
  zip.file((provider === 'aws' ? 'custodian_policy.yaml' : 'cleanup_gcp.py'), compiledCode.rules);
  zip.file('budget_alerts.json', compiledCode.alerts);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `finops-sre-${provider}.zip`;
    a.click();
    showToast('⬇️ FinOps SRE package downloaded!');
  });
}

function clearAllFields() {
  $('finops_provider').value = 'aws';
  $('finops_target').value = 'volumes';
  $('finops_action').value = 'notify';
  $('finops_schedule').value = 'daily';

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
  const provider = $('finops_provider').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'aws': [
      {
        title: 'Cloud Custodian Policy Scans',
        why: 'Declarative YAML rules to sweep orphaned AWS volumes and snapshots continuously.',
        whyNot: 'Leaves unattached resources active, creating recurring monthly storage billing leakages.',
        runtime: 'Listens for EventBridge schedule notifications or scans via CLI.'
      }
    ],
    'gcp': [
      {
        title: 'GCP Python Cost Automation',
        why: 'Uses official Google Compute APIs to inspect instances and detached disks.',
        whyNot: 'SRE teams must manually audit GCP console to clean up orphaned assets.',
        runtime: 'Inspects GCP project metrics lists.'
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

  if (activeTab === 'rules') {
    explanation = {
      'title': 'Cost Sweeping Rules',
      'filename': 'custodian_policy.yaml',
      'why': 'Declares filtering logic to locate and delete/notify regarding idle cloud assets.',
      'when': 'Apply on weekly or monthly billing audits.',
      'where': 'Deploy as Lambda execution rules or run locally.',
      'command': 'custodian run --output_dir=. custodian_policy.yaml',
      'practices': ['Enforce dry-run mode first.', 'Set up owner tag checks before deleting.'],
      'ai_mlops': 'Used by autonomous optimization bots to reduce cloud footprints.',
      'flow': '[Cloud Custodian Rules evaluation]'
    };
  } else if (activeTab === 'alerts') {
    explanation = {
      'title': 'Budget Alert Specifications',
      'filename': 'budget_alerts.json',
      'why': 'Defines cost thresholds to notify teams when billing trends exceed expectations.',
      'when': 'Prior to deploying heavy resource environments.',
      'where': 'Store in cloud billing console configs.',
      'command': '# Setup AWS Budgets JSON API',
      'practices': ['Define both actual and forecasted metrics.', 'Assign different responders based on budget size.'],
      'ai_mlops': 'Used by MLOps monitors to control GPU clusters cost parameters.',
      'flow': '[Load Budget Thresholds]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'FinOps Setup Guide',
      'filename': 'README.md',
      'why': 'Installation checklists and dependency settings details.',
      'when': 'Consult prior to launching cost scripts.',
      'where': 'Save in root directory.',
      'command': '# Open in viewer',
      'practices': ['Pin dependencies versions.'],
      'ai_mlops': 'Context guidelines for autonomous builders.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Reclaiming Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Playbook to identify leaks and run manual cleanups.',
      'when': 'Triggered on billing alarm alerts.',
      'where': 'Store in Wiki.',
      'command': '# Open in viewer',
      'practices': ['Always verify volume metadata logs before executing deletion.'],
      'ai_mlops': 'Autonomously executed by self-healing agents.',
      'flow': '[Billing Alert] ➔ [Dry Run Audit] ➔ [Delete detached assets]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'FinOps Sweeping Pipeline',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram of billing sweeping phases.',
      'when': 'During design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all fallback/timeout rules.'],
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
