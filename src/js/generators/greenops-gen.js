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
  $('carbon_source').addEventListener('change', triggerCompileAll);
  $('cloud_provider').addEventListener('change', triggerCompileAll);
  $('carbon_threshold').addEventListener('input', triggerCompileAll);

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
  const provider = $('cloud_provider').value;
  const threshold = parseInt($('carbon_threshold').value) || 250;

  let code = `apiVersion: kepler.system.k8s.io/v1alpha1
kind: KeplerPolicy
metadata:
  name: "carbon-aware-scaling-policy"
  namespace: "production"
  annotations:
    version: "v${SCRIPT_VERSION}"
    author: "Talari Pradeep"
    copyright: "Copyright (c) 2026 Talari Pradeep. All Rights Reserved."
spec:
  targetProvider: "${provider}"
  carbonThresholdGrams: ${threshold}
  # Kepler energy metrics monitoring configurations
  energySource:
    - cpu
    - memory
    - platform
  prometheusScraping:
    enabled: true
    interval: "15s"
    path: "/metrics"
`;

  compiledCode.config = code;
}

function compileInstrument() {
  const source = $('carbon_source').value;
  const threshold = parseInt($('carbon_threshold').value) || 250;

  let code = `#!/usr/bin/env python3
# carbon_scheduler.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Carbon-Aware Cloud Workload Rescheduler using ${source.toUpperCase()} API

import os
import sys
import time
import requests

CARBON_API_URL = "https://api.electricitymaps.com/v3/carbon-intensity/latest" if "${source}" == "electricity_maps" else "https://api.watttime.org/v2/index"
CARBON_THRESHOLD = ${threshold} # gCO2eq/kWh

def check_carbon_intensity():
    headers = {"auth-token": os.getenv("CARBON_API_KEY", "mock-token-123")}
    params = {"zone": "US-CAL-CISO"}
    
    try:
        # Fetch dynamic carbon emissions metrics
        response = requests.get(CARBON_API_URL, headers=headers, params=params, timeout=10)
        data = response.json()
        
        # Extract carbon index
        intensity = data.get("carbonIntensity", 180) if "${source}" == "electricity_maps" else data.get("percent", 50)
        print(f"Current carbon intensity footprint: {intensity} gCO2eq/kWh")
        
        if intensity > CARBON_THRESHOLD:
            print(f"⚠️ Carbon threshold exceeded ({intensity} > {CARBON_THRESHOLD})!")
            trigger_scale_down()
        else:
            print("✅ Carbon intensity within safe thresholds. Restoring standard workload scales.")
            trigger_scale_up()
            
    except Exception as e:
        print(f"Error checking carbon telemetry: {e}", file=sys.stderr)

def trigger_scale_down():
    print("Initiating GreenOps Scaling Rule: Suspending non-prod workloads, reducing replica scales...")
    # Execute K8s scaling command
    # os.system("kubectl scale deployment/batch-analyzer-worker --replicas=1 -n batch")

def trigger_scale_up():
    print("Restoring standard operations scales: Scaling up batch-analyzer-worker workers deployment...")
    # os.system("kubectl scale deployment/batch-analyzer-worker --replicas=5 -n batch")

if __name__ == "__main__":
    check_carbon_intensity()
`;

  compiledCode.instrument = code;
}

function compileReadme() {
  const provider = $('cloud_provider').value;

  let md = `# GreenOps & Carbon-Aware Cloud Scheduler v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Optimize your cloud footprint dynamically. This studio integrates Kepler energy-monitoring metrics with live carbon intensity APIs to automatically scale down non-prod resources when grid carbon emissions peak.

## Prerequisites
- **Cloud Provider**: ${provider.toUpperCase()}
- **Kubernetes**: Kepler metrics exporter installed in cluster.
- **Python**: \`requests\` library package.

## Quick Start
1. Apply the Kepler metrics configuration:
   \`\`\`bash
   kubectl apply -f kepler_policy.yaml
   \`\`\`
2. Install python dependencies:
   \`\`\`bash
   pip install requests
   \`\`\`
3. Run the scheduler execution cron job:
   \`\`\`bash
   python carbon_scheduler.py
   \`\`\`
`;

  compiledCode.readme = md;
}

function compileRunbook() {
  const threshold = parseInt($('carbon_threshold').value) || 250;

  let md = `# SRE Runbook: Grid Carbon Peak and Resource Starvation
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Grid carbon intensity exceeds threshold (> ${threshold} gCO2eq/kWh)

When telemetry informs carbon emission peaks:

### Step 1: Confirm Automatic Scale-down
Verify that Kepler-based policy rules have successfully triggered:
- Scale down of non-prod namespaces (e.g. \`dev\`, \`staging\`).
- Reduction of replica counts on batch processing workers.

### Step 2: Validate Energy Exporters
If Kepler metrics are missing or flatlined:
1. Check Kepler daemon pods status:
   \`\`\`bash
   kubectl get pods -n kepler
   \`\`\`
2. Check Prometheus scrapes endpoint configurations.

### Step 3: Emergency Override
If critical batch pipelines are blocked during a prolonged carbon peak:
- Disable the scheduler script or run standard overrides:
  \`\`\`bash
  kubectl scale deployment/batch-analyzer-worker --replicas=5 -n batch
  \`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Metrics[📊 Kepler Energy Metrics] -->|Scrape| Prometheus[📈 Prometheus Server]\n  Prometheus -->|Carbon Intensity| Intensity{{Grid Carbon Peak?}}\n  Intensity -->|Yes| ScaleDown[🌱 Scale Down Replicas / Reschedule Jobs]\n  Intensity -->|No| Normal[Run Normal Workloads]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'config') {
    nameBox.value = 'kepler_policy';
    extTag.textContent = '.yaml';
  } else if (tabId === 'instrument') {
    nameBox.value = 'carbon_scheduler';
    extTag.textContent = '.py';
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
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: \${e.message}\\n\\nCode:\\n\${compiledCode.flow}</pre>`;
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

  zip.file('kepler_policy.yaml', compiledCode.config);
  zip.file('carbon_scheduler.py', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `greenops-carbon-scheduler.zip`;
    a.click();
    showToast('⬇️ GreenOps SRE package downloaded!');
  });
}

function clearAllFields() {
  $('carbon_source').value = 'electricity_maps';
  $('cloud_provider').value = 'aws';
  $('carbon_threshold').value = '250';

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
  const source = $('carbon_source').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'electricity_maps': [
      {
        title: 'Electricity Maps API Integration',
        why: 'Enables precise, real-time grid emissions telemetry for carbon-aware serverless schedulers.',
        whyNot: 'Workloads execute indiscriminately during coal/gas peak hours, increasing total carbon footprint.',
        runtime: 'Performs REST HTTP requests to obtain hourly grid emissions data.'
      },
      {
        title: 'Kepler Energy Metrics Exporter',
        why: 'Measures CPU and memory power consumption in watts directly at the Kubernetes pod level.',
        whyNot: 'Requires deploying privileged daemonsets that consume small kernel cycles.',
        runtime: 'Attaches energy metrics collectors to eBPF hooks.'
      }
    ],
    'watttime': [
      {
        title: 'WattTime API Integration',
        why: 'Provides marginal operating emissions rates (MOER) data to dynamically reschedule heavy training jobs.',
        whyNot: 'Limits scheduler awareness to static average models.',
        runtime: 'Submits user credentials and queries localized grid coordinates.'
      }
    ]
  };

  const activeData = manualData[source] || [];
  activeData.forEach((item, idx) => {
    html += `
      <div class="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
        <button onclick="toggleManualItem(\${idx})" class="w-full flex items-center justify-between font-bold text-slate-800 focus:outline-none">
          <span>⚙️ \${item.title}</span>
          <span class="text-xs text-slate-400">⚡ Info</span>
        </button>
        <div id="manual-item-\${idx}" class="mt-2.5 pt-2.5 border-t border-slate-100 text-slate-600 space-y-2 hidden">
          <p><strong>Why configure:</strong> \${item.why}</p>
          <p class="text-rose-600"><strong>If left disabled:</strong> \${item.whyNot}</p>
          <p class="text-slate-500"><strong>Runtime Operation:</strong> \${item.runtime}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function explainActiveTabCode() {
  let explanation = null;
  const source = $('carbon_source').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'Kepler Kubernetes Policy',
      'filename': 'kepler_policy.yaml',
      'why': 'Defines Kepler target metrics mappings and Prometheus scraping ports configurations.',
      'when': 'Deploy during cluster bootstrapping or when monitoring tools are installed.',
      'where': 'Deploy in core monitoring namespaces.',
      'command': 'kubectl apply -f kepler_policy.yaml',
      'practices': ['Pin energy-monitoring probes to bare-metal nodes for maximum precision.'],
      'ai_mlops': 'Used to measure deep learning training run power profiles.',
      'flow': '[Read Kepler Policy] ➔ [Scrape eBPF energy counters] ➔ [Export Prometheus metrics]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'Carbon-Aware Rescheduler script',
      'filename': 'carbon_scheduler.py',
      'why': 'Fetches live grid carbon index figures and scales K8s workers counts dynamically.',
      'when': 'Run as a background systemd worker daemon or periodic cron scheduler.',
      'where': 'Deploy as a background control manager worker inside target clusters namespaces.',
      'command': 'python carbon_scheduler.py',
      'practices': ['Enforce timeouts on external API fetch calls.', 'Always provide local failover default levels.'],
      'ai_mlops': 'Dynamically pauses heavy models training runs when emissions peak.',
      'flow': '[Query Carbon API] ➔ [Evaluate Threshold constraints] ➔ [Scale deployments replica bounds]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Developer Onboarding Guide',
      'filename': 'README.md',
      'why': 'Provides guidelines for bootstrapping carbon-aware cloud schedulers.',
      'when': 'Consult when configuring fresh cloud resource environments.',
      'where': 'Save in repository project root.',
      'command': '# View README.md',
      'practices': ['Lock pipeline package requirements.'],
      'ai_mlops': 'GreenOps onboarding reference document.',
      'flow': '[README.md]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Carbon Peak Mitigation Playbook',
      'filename': 'sre_runbook.md',
      'why': 'Guides operators on managing resource limitations during peak grid emissions.',
      'when': 'Alert on grid emissions intensity exceeds threshold limits.',
      'where': 'Publish in company SRE runbooks index.',
      'command': '# View runbook',
      'practices': ['Isolate developer environments scaling bugs before manual restarts.', 'Provide emergency overrides.'],
      'ai_mlops': 'Prevents runaway compute costs and high carbon profiles for LLM pipelines.',
      'flow': '[Carbon Alert] ➔ [Audit Kepler exporter stats] ➔ [Confirm scaling limits]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Carbon-Aware Scheduling sequence',
      'filename': 'flow.mermaid',
      'why': 'Visualizes the cron loop pipeline.',
      'when': 'Review during GreenOps reviews.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Keep scaling checks intervals moderate (15m+) to prevent pod thrashing.'],
      'ai_mlops': 'Sequence flowchart reference.',
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

  $('explain-ai-mlops').innerHTML = explanation.ai_mlops;
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
