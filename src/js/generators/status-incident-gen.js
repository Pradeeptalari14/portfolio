import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'script';

let compiledCode = {
  script: '',
  escalation: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('incident_provider').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileScript();
  compileEscalation();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileScript() {
  const provider = $('incident_provider').value;
  const severity = $('incident_severity').value;
  const integration = $('incident_integration').value;

  const config = {
    version: SCRIPT_VERSION,
    status_page: {
      provider: provider,
      component_name: "API Gateway Cluster",
      monitored_region: "us-east-1",
      reported_severity: severity,
      notification_channels: [integration],
      branding: {
        company_name: "Talari Pradeep SRE",
        support_url: "https://support.talaripradeep.info"
      }
    }
  };

  compiledCode.script = JSON.stringify(config, null, 2);
}

function compileEscalation() {
  const provider = $('incident_provider').value;
  const severity = $('incident_severity').value;
  const integration = $('incident_integration').value;

  let code = '';

  if (provider === 'pagerduty') {
    code = `{
  "escalation_policy": {
    "name": "SRE Production Escalation - ${severity}",
    "description": "Auto-generated escalation policy for PagerDuty v${SCRIPT_VERSION}",
    "num_loops": 2,
    "escalation_rules": [
      {
        "escalation_delay_in_minutes": ${severity === 'critical' ? 5 : (severity === 'high' ? 15 : 30)},
        "targets": [
          {
            "id": "PRADEEP_ONCALL_PRIMARY",
            "type": "user_reference"
          }
        ]
      },
      {
        "escalation_delay_in_minutes": 15,
        "targets": [
          {
            "id": "SRE_LEAD_SECONDARY",
            "type": "user_reference"
          }
        ]
      }
    ],
    "integration_key": "pd-integration-token-here",
    "target_channel": "${integration}"
  }
}
`;
  } else if (provider === 'opsgenie') {
    code = `{
  "opsgenie_routing": {
    "name": "SRE Route Rule - ${severity}",
    "target_team": "SRE-OnCall",
    "priority": "${severity === 'critical' ? 'P1' : (severity === 'high' ? 'P2' : 'P3')}",
    "integration": {
      "type": "${integration}",
      "channel_id": "sre-incidents-stream"
    }
  }
}
`;
  } else {
    // Statuspage.io Component Config
    code = `{
  "component": {
    "name": "API Gateway Cluster Service",
    "description": "Core routing gateway infrastructure",
    "status": "${severity === 'critical' ? 'major_outage' : (severity === 'high' ? 'partial_outage' : 'operational')}",
    "group_id": "sre-core-components",
    "show_on_status_page": true
  }
}
`;
  }

  compiledCode.escalation = code;
}

function compileReadme() {
  const provider = $('incident_provider').value;
  const severity = $('incident_severity').value;
  const integration = $('incident_integration').value;

  let md = `# Status Page & Incident Response Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Automated SRE alert routing rules, escalation matrices, and status page schema mappings.

## Configuration Details

- **Alert Manager**: ${provider.toUpperCase()}
- **Incident Severity**: ${severity.toUpperCase()}
- **Integration Target**: ${integration.toUpperCase()}

## How to Deploy

1. Configure PagerDuty / Opsgenie API endpoint tokens.
2. Setup Status Page component schemas inside status dashboard.
3. Import the escalation JSON profiles to provision corresponding alert paths.
4. Verify notifications stream correctly in ${integration.toUpperCase()} workspace channel.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const severity = $('incident_severity').value;
  const integration = $('incident_integration').value;

  let md = `# SRE Runbook: Incident Response & Critical Triage
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Scenario: Priority ${severity.toUpperCase()} Outage Detected

Follow these SRE steps to resolve incidents and update status dashboards:

### Step 1: Declare Incident & Open Bridge
1. Alert the primary on-call engineer using automated escalation policies.
2. Create dedicated incident channel:
   \`\`\`bash
   /incident declare --severity ${severity === 'critical' ? 'P1' : (severity === 'high' ? 'P2' : 'P3')}
   \`\`\`
3. Launch video bridge URL and post to ${integration.toUpperCase()} workspace channel.

### Step 2: Update Public Status Page
Acknowledge the incident immediately to notify users:
- **Status update template**: "We are currently investigating latency spikes and routing failures in the API Gateway Cluster. Next update in 15 minutes."
- **Action**: Update status dashboard state to ${severity === 'critical' ? 'Major Outage' : 'Partial Outage'}.

### Step 3: Mitigate & Isolate
1. Inspect trace logs and telemetry spans:
   \`\`\`bash
   kubectl logs -l app=api-gateway -n production --tail=100 --timestamps
   \`\`\`
2. Rollback recent deployments if changesets were pushed within the outage window:
   \`\`\`bash
   helm rollback api-gateway-release
   \`\`\`
3. Execute smoke-test API requests to verify resolution.

### Step 4: Resolve & Post-Mortem
1. Resolve the PagerDuty alert page.
2. Update public status page to **Operational**.
3. Generate incident timeline report and schedule post-mortem audit.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Alarm[🚨 System Outage Alert] -->|Route| Pager[☎️ PagerDuty / Opsgenie]\n  Pager -->|Escalate| SRE[🛠️ On-Call SRE engineer]\n  SRE -->|Declare Incident| Bridge[💬 Open Incident Slack Bridge]\n  Bridge -->|Resolve| Status[🟢 Update Public Status Page]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  const provider = $('incident_provider').value;

  if (tabId === 'script') {
    nameBox.value = 'status_page';
    extTag.textContent = '.json';
  } else if (tabId === 'escalation') {
    if (provider === 'pagerduty' || provider === 'opsgenie') {
      nameBox.value = 'escalation_rules';
      extTag.textContent = '.json';
    } else {
      nameBox.value = 'component_settings';
      extTag.textContent = '.json';
    }
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
  const provider = $('incident_provider').value;
  const zip = new JSZip();

  const escalationName = (provider === 'pagerduty' || provider === 'opsgenie') ? 'escalation_rules.json' : 'component_settings.json';
  
  zip.file('status_page.json', compiledCode.script);
  zip.file(escalationName, compiledCode.escalation);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `incident-sre-${provider}.zip`;
    a.click();
    showToast('⬇️ Incident SRE package downloaded!');
  });
}

function clearAllFields() {
  $('incident_provider').value = 'pagerduty';
  $('incident_severity').value = 'critical';
  $('incident_integration').value = 'slack';

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
  const provider = $('incident_provider').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'pagerduty': [
      {
        title: 'PagerDuty Escalation Policy Routing',
        why: 'Automates on-call dispatching schedules and alerts primary responders within critical downtime windows.',
        whyNot: 'Manual dispatching causes response delays, increasing systems mean time to resolution (MTTR).',
        runtime: 'Injects policy objects config parameters.'
      }
    ],
    'opsgenie': [
      {
        title: 'Opsgenie Routing Rules Mapping',
        why: 'Configures severity filters routing logic to dispatch pagers to appropriate product operations groups.',
        whyNot: 'Critical alerts go to general mailing lists, causing responder alert fatigue.',
        runtime: 'Evaluates alert payloads fields.'
      }
    ],
    'statuspage': [
      {
        title: 'Public Status Component Configurations',
        why: 'Enables automatic API-driven status indicators updates on public user landing status page.',
        whyNot: 'Users inundate customer support queues during service degradations.',
        runtime: 'Directly displays REST service status.'
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
  const provider = $('incident_provider').value;
  const integration = $('incident_integration').value;

  if (activeTab === 'script') {
    explanation = {
      'title': 'Status Page Configuration',
      'filename': 'status_page.json',
      'why': 'Specifies public components details and channel notification paths.',
      'when': 'Prior to setting up public status dashboards.',
      'where': 'Deploy in statuspage engine parameters.',
      'command': '# Setup status component payload',
      'practices': ['Acknowledge failures publicly within 5 minutes.', 'Automate public postings via monitoring metrics API triggers.'],
      'ai_mlops': 'Allows monitoring agents to report training service statuses.',
      'flow': '[Status update sequence]'
    };
  } else if (activeTab === 'escalation') {
    explanation = {
      'title': 'Escalation Rules Mapping',
      'filename': (provider === 'pagerduty' || provider === 'opsgenie') ? 'escalation_rules.json' : 'component_settings.json',
      'why': 'Maps alert delays and paging targets to guarantee secondary backup responder coverage.',
      'when': 'Prior to deploying production clusters.',
      'where': 'Upload directly to PagerDuty/Opsgenie routing configurations.',
      'command': '# Upload via incident manager client CLI/API',
      'practices': ['Establish fallback loops.', 'Adjust paging delay limits based on severity.'],
      'ai_mlops': 'Used by auto-remediator agents to summon human assistance.',
      'flow': '[Apply routing escalation rules]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Response Setup Guide',
      'filename': 'README.md',
      'why': 'Installation details and API integration keys settings documentation.',
      'when': 'Prior to setting up incident systems.',
      'where': 'Save in incident directory.',
      'command': '# Open in viewer',
      'practices': ['Do not commit plain text API keys.'],
      'ai_mlops': 'Setup guide context.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Incident Response Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Playbook to declare critical incidents, notify teams, isolate faults, and audit root causes.',
      'when': 'Immediately when priority metrics trigger pager alerts.',
      'where': 'Store in incident room wiki pages.',
      'command': '# Refer to runbook instructions',
      'practices': ['Isolate incident channels immediately.', 'Define responder roles explicitly (Incident Commander, Comms Lead).'],
      'ai_mlops': 'Executed by self-healing agents to mitigate service errors.',
      'flow': '[Alert fired] ➔ [Status Page updated] ➔ [Mitigate / Rollback] ➔ [Post-mortem]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Incident Lifecycle & Escalation',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram of alert dispatching and resolution phases.',
      'when': 'During design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all communication feeds.'],
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
