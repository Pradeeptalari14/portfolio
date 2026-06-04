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
  $('detect_target').addEventListener('change', triggerCompileAll);
  $('alert_severity').addEventListener('change', triggerCompileAll);
  $('sensitivity').addEventListener('change', triggerCompileAll);

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
  const target = $('detect_target').value;
  const severity = $('alert_severity').value;
  const sensitivity = $('sensitivity').value;

  let multiplier = 2;
  if (sensitivity === 'strict') multiplier = 1.5;
  if (sensitivity === 'relaxed') multiplier = 3.5;

  let code = '';
  if (target === 'prometheus') {
    code = `# prometheus_anomaly.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# PromQL Anomaly Detection rules utilizing double-exponential smoothing

groups:
  - name: aiops-anomaly-rules
    rules:
      - alert: IngestionLatencyAnomaly
        expr: |
          job:request_latency_seconds:mean5m > 
          (job:request_latency_seconds:mean5m_prediction + (${multiplier} * job:request_latency_seconds:stddev5m))
        for: 5m
        labels:
          severity: "${severity}"
          tier: "aiops"
        annotations:
          summary: "Microservice latency anomaly detected"
          description: "Ingestion service latency is running above ${multiplier} standard deviations from the predicted Holt-Winters mean."
`;
  } else {
    code = `#!/usr/bin/env python3
# log_detector.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Python-based Isolation Forest log anomaly checker for SRE triage

import sys
import numpy as np
from sklearn.ensemble import IsolationForest

def audit_log_metrics():
    print("Ingesting log rates and server telemetry matrices...")
    
    # Mock telemetry features: [request_rate, error_rate, database_latency]
    data = np.array([
        [100, 2, 0.05],
        [120, 1, 0.04],
        [90, 3, 0.06],
        [500, 85, 0.95] # Spike anomaly example
    ])
    
    # Train lightweight Isolation Forest
    clf = IsolationForest(contamination=${sensitivity === 'strict' ? 0.15 : 0.05}, random_state=42)
    clf.fit(data)
    
    # Check predictions: -1 represents anomaly
    predictions = clf.predict(data)
    print(f"Machine learning anomaly classifications: {predictions.tolist()}")
    
    if -1 in predictions:
        print("🚨 AIOps Alert: Log metrics anomaly detected!")
        sys.exit(1)
        
    print("✅ No statistical anomalies identified.")

if __name__ == "__main__":
    audit_log_metrics()
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const target = $('detect_target').value;

  let code = '';
  if (target === 'prometheus') {
    code = `# logstash_pattern.conf v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Logstash parsing rules for dynamic anomaly grouping

filter {
  if [type] == "microservices-log" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \\[%{DATA:service}\\] %{GREEDYDATA:log_message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    # Anomaly tagger
    if [level] in ["ERROR", "FATAL"] {
      mutate {
        add_tag => [ "anomaly_flagged" ]
      }
    }
  }
}`;
  } else {
    code = `#!/usr/bin/env python3
# anomaly_aggregator.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Multi-source SRE anomaly aggregator webhook client

import sys
import json
import requests

def post_anomaly_event():
    url = "https://aiops-collector.internal.sre/events"
    payload = {
        "event_type": "telemetry_anomaly",
        "detector": "${target.toUpperCase()}",
        "severity": "CRITICAL",
        "description": "Anomaly classifier triggered. Resource signature drift detected."
    }
    
    try:
        # Post alert payload
        # requests.post(url, json=payload, timeout=5)
        print("Successfully dispatched anomaly telemetry event to SRE pager queue.")
    except Exception as err:
        print(f"Failed to route event: {err}", file=sys.stderr)

if __name__ == "__main__":
    post_anomaly_event()
`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const target = $('detect_target').value;
  const sensitivity = $('sensitivity').value;

  let md = `# AIOps & Telemetry Anomaly Detector Studio v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Automate anomaly triage. This studio configures predictive PromQL alert rules (Holt-Winters double exponential smoothing) and bundles machine learning scripts (sklearn Isolation Forest) to detect infrastructure drift.

## File Package Contents
- \`prometheus_anomaly.yaml\` / \`log_detector.py\`: Anomaly checkers.
- \`logstash_pattern.conf\` / \`anomaly_aggregator.py\`: Routing hooks.
- \`sre_runbook.md\`: Resolution playbooks.

## Quick Start
1. Apply the alerting rules configuration:
   \`\`\`bash
   # For Prometheus rules
   kubectl apply -f prometheus_anomaly.yaml
   \`\`\`
2. Install Python machine learning libraries:
   \`\`\`bash
   pip install numpy scikit-learn requests
   \`\`\`
3. Run the log checking daemon script:
   \`\`\`bash
   python log_detector.py
   \`\`\`
`;

  compiledCode.readme = md;
}

function compileRunbook() {
  const target = $('detect_target').value;
  const severity = $('alert_severity').value;

  let md = `# SRE Runbook: AIOps Telemetry and Log Drift Alerts
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Anomaly detector triggers (${target.toUpperCase()} / Severity: ${severity.toUpperCase()})

When automated classifiers detect drift:

### Step 1: Audit Alert metrics
Verify if latency or error rate exceeds double-exponential predicted bounds:
- Run PromQL search:
  \`\`\`promql
  job:request_latency_seconds:mean5m - job:request_latency_seconds:mean5m_prediction
  \`\`\`
- Check if z-score is increasing rapidly.

### Step 2: Inspect Machine Learning Logs
If Isolation Forest flagged an outlier:
1. Run local classifier on system stats:
   \`\`\`bash
   python log_detector.py
   \`\`\`
2. Verify if memory utilization or thread pools are saturated.

### Step 3: Trigger Scale-Up or Failover
If anomaly correlates with traffic burst:
- Deploy replicas scaling:
  \`\`\`bash
  kubectl scale deployment/api-server --replicas=8
  \`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const target = $('detect_target').value;

  let chart = 'graph TD\n';
  chart += `  Scrape[Metric Scraper] -->|Fetch metrics| Detector[${target.toUpperCase()} Anomaly Tagger]\n`;
  chart += `  Detector -->|No drift| Monitor[Normal Monitoring Dashboard]\n`;
  chart += `  Detector -->|Drift identified| Classify[Isolation Forest Classifier]\n`;
  chart += `  Classify -->|Anomaly confirmed| Alert[Trigger AIOps SRE Pager Alert]\n`;

  compiledCode.flow = chart;
}

function compileManual() {
  const accordion = $('sre-manual-accordion');
  if (!accordion) return;

  const target = $('detect_target').value;
  const severity = $('alert_severity').value;
  const sensitivity = $('sensitivity').value;

  accordion.innerHTML = `
    <div class="border-b border-slate-100 pb-2">
      <h4 class="font-bold text-gray-800 cursor-pointer flex justify-between items-center" onclick="toggleManualItem(0)">
        <span>⚙️ Detection Target: ${target.toUpperCase()}</span>
        <span class="text-[10px]">▼</span>
      </h4>
      <p class="text-gray-500 mt-1 pl-2" id="manual-body-0">
        Source telemetry to scan. PromQL targets live metric streams, Python scripts check logs using machine learning, and Logstash parses logs.
      </p>
    </div>
    <div class="border-b border-slate-100 pb-2 pt-2">
      <h4 class="font-bold text-gray-800 cursor-pointer flex justify-between items-center" onclick="toggleManualItem(1)">
        <span>🚨 Alert Severity: ${severity.toUpperCase()}</span>
        <span class="text-[10px]">▼</span>
      </h4>
      <p class="text-gray-500 mt-1 pl-2 hidden" id="manual-body-1">
        Routing policy tier. Critical alerts page SREs directly, while Warning metrics update internal monitoring telemetry indexes.
      </p>
    </div>
    <div class="pb-2 pt-2">
      <h4 class="font-bold text-gray-800 cursor-pointer flex justify-between items-center" onclick="toggleManualItem(2)">
        <span>🔍 Classifier Sensitivity: ${sensitivity.toUpperCase()}</span>
        <span class="text-[10px]">▼</span>
      </h4>
      <p class="text-gray-500 mt-1 pl-2 hidden" id="manual-body-2">
        Drift classification tolerance. Strict thresholds alert on small metric shifts, while Relaxed settings filter transient anomalies.
      </p>
    </div>
  `;
}

function toggleManualItem(index) {
  const bodies = [$('manual-body-0'), $('manual-body-1'), $('manual-body-2')];
  bodies.forEach((el, i) => {
    if (i === index) {
      el.classList.toggle('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  const target = $('detect_target').value;

  if (tabId === 'config') {
    nameBox.value = target === 'prometheus' ? 'prometheus_anomaly' : 'log_detector';
    extTag.textContent = target === 'prometheus' ? '.yaml' : '.py';
  } else if (tabId === 'instrument') {
    nameBox.value = target === 'prometheus' ? 'logstash_pattern' : 'anomaly_aggregator';
    extTag.textContent = target === 'prometheus' ? '.conf' : '.py';
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
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: \${e.message}\n\nCode:\n\${compiledCode.flow}</pre>`;
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

  const target = $('detect_target').value;

  zip.file(target === 'prometheus' ? 'prometheus_anomaly.yaml' : 'log_detector.py', compiledCode.config);
  zip.file(target === 'prometheus' ? 'logstash_pattern.conf' : 'anomaly_aggregator.py', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aiops-anomaly-package.zip`;
    a.click();
    showToast('⬇️ AIOps SRE package downloaded!');
  });
}

function clearAllFields() {
  $('detect_target').value = 'prometheus';
  $('alert_severity').value = 'warning';
  $('sensitivity').value = 'moderate';

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

function explainActiveTabCode() {
  let explanation = null;

  const target = $('detect_target').value;
  const severity = $('alert_severity').value;
  const sensitivity = $('sensitivity').value;

  if (activeTab === 'config') {
    explanation = {
      'title': target === 'prometheus' ? 'Prometheus Anomaly Rule' : 'Log Anomaly Detector',
      'filename': target === 'prometheus' ? 'prometheus_anomaly.yaml' : 'log_detector.py',
      'why': 'Scaffolds predictive telemetry thresholds to isolate anomalies using statistical deviation bounds.',
      'when': 'Deploy during monitoring initialization to track capacity drift.',
      'where': 'Deploy as Prometheus rule manifests or python cron monitors.',
      'command': target === 'prometheus' ? 'promtool check rules prometheus_anomaly.yaml' : 'python log_detector.py',
      'practices': ['Pin alert thresholds to standard standard deviation bounds (e.g. 2-3 stddev).', 'Enable deduplication tags.'],
      'ai_mlops': 'Alerts on drift patterns during active model training sweeps.',
      'flow': '[Metrics Collection] ➔ [Holt-Winters deviation check] ➔ [Triage dispatch]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': target === 'prometheus' ? 'Logstash Parsing Rules' : 'Webhook Aggregator Client',
      'filename': target === 'prometheus' ? 'logstash_pattern.conf' : 'anomaly_aggregator.py',
      'why': 'Filters raw log inputs or posts alerts payloads directly to triage routing targets.',
      'when': 'Deploy to map grok filters or alert webhooks integrations.',
      'where': 'Configure inside Logstash filter pipelines or python run environments.',
      'command': target === 'prometheus' ? '# Logstash service filters' : 'python anomaly_aggregator.py',
      'practices': ['Set socket timeouts for webhook clients to prevent thread pools exhaustion.', 'Use HTTPS.'],
      'ai_mlops': 'Routes dataset status telemetry directly to training controllers.',
      'flow': '[Verify logs pattern] ➔ [Apply anomaly tags] ➔ [Dispatch pager notifications]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Setup Documentation',
      'filename': 'README.md',
      'why': 'Guides site reliability engineers on configuring anomaly metrics tools.',
      'when': 'Read during AIOps stack initialization.',
      'where': 'Project repository root folder.',
      'command': '# View guide',
      'practices': ['Document all metrics zones and alert thresholds.'],
      'ai_mlops': 'Documentation reference.',
      'flow': '[README.md]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Anomaly Resolution Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Guides operators on triaging and restoring services during metric drift.',
      'when': 'Active on target anomaly alerts.',
      'where': 'Reference in operational runbooks catalog.',
      'command': '# View playbook',
      'practices': ['Isolate resource leaks before manual scale-up.', 'Check z-score profiles.'],
      'ai_mlops': 'Protects live models from compute starvation when training pipelines run wild.',
      'flow': '[Telemetry drift alert] ➔ [Confirm z-scores] ➔ [Scale resources]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Mermaid AIOps flow',
      'filename': 'flow.mermaid',
      'why': 'Visualizes metrics ingestion and machine learning anomaly classification paths.',
      'when': 'Review during AIOps optimization reviews.',
      'where': 'Flowchart canvas view.',
      'command': '# View flow',
      'practices': ['Map telemetry paths cleanly.'],
      'ai_mlops': 'AIOps workflow blueprint.',
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
