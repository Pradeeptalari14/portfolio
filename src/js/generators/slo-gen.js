import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'rules';

let compiledCode = {
  rules: '',
  config: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('slo_metric').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileRules();
  compileConfig();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileRules() {
  const service = $('slo_service').value || 'payment-api';
  const metric = $('slo_metric').value;
  const target = parseFloat($('slo_target').value);
  const windowVal = $('slo_window').value;
  const threshold = $('slo_threshold').value;

  let code = '';

  if (metric === 'success_rate') {
    code = `# slo_rules.yaml v${SCRIPT_VERSION} - Prometheus Alert Rules for SLO Burn Rates
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

groups:
  - name: ${service}-slo-alerts
    rules:
      - alert: ${service}ErrorBudgetBurnRateHigh
        expr: |
          (
            sum(rate(http_requests_total{service="${service}", status=~"5.."}[${windowVal === '7d' ? '1h' : '6h'}])) 
            / 
            sum(rate(http_requests_total{service="${service}"}[${windowVal === '7d' ? '1h' : '6h'}]))
          ) > (1 - ${target / 100}) * ${threshold}
        for: 5m
        labels:
          severity: critical
          sre_owner: talari_pradeep
        annotations:
          summary: "High error budget burn rate detected on ${service} service"
          description: "The error budget for ${service} is burning at rate multiplier ${threshold} over the window."
`;
  } else {
    // Latency
    code = `# slo_rules.yaml v${SCRIPT_VERSION} - Prometheus Alert Rules for Latency SLOs
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

groups:
  - name: ${service}-latency-slo-alerts
    rules:
      - alert: ${service}LatencySLOBurnRateHigh
        expr: |
          (
            sum(rate(http_request_duration_seconds_bucket{service="${service}", le="0.5"}[${windowVal === '7d' ? '1h' : '6h'}]))
            /
            sum(rate(http_request_duration_seconds_count{service="${service}"}[${windowVal === '7d' ? '1h' : '6h'}]))
          ) < ${target / 100}
        for: 5m
        labels:
          severity: critical
          sre_owner: talari_pradeep
        annotations:
          summary: "Latency SLO breached on ${service} service"
          description: "Less than ${target}% of requests were completed under 500ms over the window."
`;
  }

  compiledCode.rules = code;
}

function compileConfig() {
  const service = $('slo_service').value || 'payment-api';
  const metric = $('slo_metric').value;
  const target = parseFloat($('slo_target').value);
  const windowVal = $('slo_window').value;

  const config = {
    version: SCRIPT_VERSION,
    service: service,
    sli: {
      name: metric === 'latency' ? 'http_request_duration_less_than_500ms' : 'http_requests_success_rate',
      numerator: metric === 'latency' ? 'http_request_duration_seconds_bucket{le="0.5"}' : 'http_requests_total{status!~"5.."}',
      denominator: 'http_requests_total'
    },
    slo: {
      target: target / 100,
      window: windowVal
    }
  };

  compiledCode.config = JSON.stringify(config, null, 2);
}

function compileReadme() {
  const service = $('slo_service').value || 'payment-api';
  const target = $('slo_target').value;
  const windowVal = $('slo_window').value;

  let md = `# SLO & SLI Monitoring Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides Prometheus alerting rules and JSON configs to measure service level agreements.

## Configurations

- **Service**: \`${service}\`
- **SLO Target**: ${target}%
- **Uptime Window**: ${windowVal}

## How to Apply

1. Place \`slo_rules.yaml\` inside your Prometheus alert config path.
2. Reload Prometheus system daemon:
   \`\`\`bash
   curl -X POST http://localhost:9090/-/reload
   \`\`\`
3. Verify alert rules are listed on the alerts dashboard.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const service = $('slo_service').value || 'payment-api';
  const threshold = $('slo_threshold').value;

  let md = `# SRE Runbook: Error Budget Burn Rate Warning (Threshold: ${threshold}x)
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: High SLO Burn Rate Detected on \`${service}\`

Follow these steps if Prometheus triggers error budget burn notifications:

### Step 1: Detect Source of Error Spikes
Query active HTTP status rates to isolate the error types:
\`\`\`promql
sum(rate(http_requests_total{service="${service}"}[5m])) by (status)
\`\`\`
If status code 500s are spiking, check application stack traces.

### Step 2: Establish Rollback Gate
If the burn rate spike is associated with a recent deployment release:
1. Verify the release version inside the deployment config.
2. Initiate a roll back to the previous stable release version.
3. Lock further deployments to staging/prod until error budget recovers.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n';

  chart += `  User[User Traffic] -->|1. Generate HTTP requests| API[Ingress / API Gateway]\n`;
  chart += `  API -->|2. Scrape metric endpoints| Prom[Prometheus Server]\n`;
  chart += `  Prom -->|3. Evaluate alert rules| BurnRate{Burn Rate > Threshold?}\n`;
  chart += `  BurnRate -->|Yes| Alert[4. Trigger AlertManager notification]\n`;
  chart += `  Alert -->|Page SRE| Pager[PagerDuty / Slack Alert]\n`;
  chart += `  Pager -->|5. SRE Action| Runbook[Follow SLO Triage Runbook]\n`;
  chart += `  Runbook -->|Fix & Rollback| Recover[Uptime Restored & Error Budget recovers]\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'rules') {
    nameBox.value = 'slo_rules';
    extTag.textContent = '.yaml';
  } else if (tabId === 'config') {
    nameBox.value = 'sli_config';
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
  const service = $('slo_service').value || 'payment-api';
  const zip = new JSZip();
  
  zip.file('slo_rules.yaml', compiledCode.rules);
  zip.file('sli_config.json', compiledCode.config);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `slo-sre-${service}.zip`;
    a.click();
    showToast('⬇️ SLO SRE package downloaded!');
  });
}

function clearAllFields() {
  $('slo_service').value = 'payment-api';
  $('slo_metric').value = 'success_rate';
  $('slo_target').value = '99.9';
  $('slo_window').value = '28d';
  $('slo_threshold').value = '2';

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
  const metric = $('slo_metric').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'success_rate': [
      {
        title: 'HTTP Success Rate SLOs',
        why: 'Enforces service reliability by ensuring at least 99.9% of user requests do not end in 5xx server errors.',
        whyNot: 'Leaves systems vulnerable to unmonitored silent errors, compromising the customer experience.',
        runtime: 'Calculates the division of HTTP 5xx responses against total requests.'
      }
    ],
    'latency': [
      {
        title: 'Request Latency SLOs',
        why: 'Guarantees fast API response speeds by enforcing latencies under 500ms for a target percent of calls.',
        whyNot: 'System bottlenecks could cause extremely sluggish responses without triggering alert thresholds.',
        runtime: 'Divides the count of latency buckets <= 0.5s by the total request counts.'
      }
    ]
  };

  const activeData = manualData[metric] || [];
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
      'title': 'Prometheus Alerting Rules',
      'filename': 'slo_rules.yaml',
      'why': 'Defines Prometheus rules to monitor error budget burn rates and alert SRE on violations.',
      'when': 'Apply alongside application metrics collectors.',
      'where': 'Store in Prometheus rules configurations.',
      'command': 'promtool check rules slo_rules.yaml',
      'practices': ['Pin alert thresholds.', 'Audit alerts frequently.'],
      'ai_mlops': 'Alert metrics are consumed by AI self-healing controllers.',
      'flow': '[SLO Prometheus rules checking]'
    };
  } else if (activeTab === 'config') {
    explanation = {
      'title': 'SLI JSON Specification',
      'filename': 'sli_config.json',
      'why': 'Provides structured mapping details of numerator and denominator components.',
      'when': 'Apply in telemetry reporting metrics generators.',
      'where': 'Store in API dashboard config.',
      'command': '# Read by reporter daemon',
      'practices': ['Match identical PromQL variables.', 'Maintain versioning records.'],
      'ai_mlops': 'Used by auto-scalers to retrieve system thresholds.',
      'flow': '[Load SLI parameters]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Usage & Documentation Guide',
      'filename': 'README.md',
      'why': 'Deployment configurations and execution checklists.',
      'when': 'Prior to setting up metric alerts.',
      'where': 'Save in repository.',
      'command': '# Open in viewer',
      'practices': ['Document all baseline parameters.'],
      'ai_mlops': 'Context inputs for telemetry setups.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'High Burn Rate Triage Playbook',
      'filename': 'sre_runbook.md',
      'why': 'Detailed incident diagnostics steps.',
      'when': 'Consult when alerts trigger on error budget burns.',
      'where': 'Store in wiki.',
      'command': '# Open in viewer',
      'practices': ['Deploy rollbacks quickly under severe budget burns.'],
      'ai_mlops': 'Playbook context utilized by triage agents.',
      'flow': '[Burn Rate alert] ➔ [Identify source] ➔ [Trigger rollback]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'SLO Alerting Flowchart',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram details alert data path.',
      'when': 'During design reviews.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all components limits.'],
      'ai_mlops': 'Visual system topology.',
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
