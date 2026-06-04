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
  $('delivery_type').addEventListener('change', triggerCompileAll);
  $('flags_engine').addEventListener('change', triggerCompileAll);
  $('metrics_source').addEventListener('change', triggerCompileAll);
  $('delivery_steps').addEventListener('input', triggerCompileAll);
  $('rollout_metrics').addEventListener('change', triggerCompileAll);

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
  const type = $('delivery_type').value;
  const steps = parseInt($('delivery_steps').value) || 3;
  const hasMetrics = $('rollout_metrics').checked;

  let code = '';
  if (type === 'canary') {
    let stepYaml = '';
    const stepIncrement = Math.round(100 / steps);
    for (let i = 1; i < steps; i++) {
      const setWeight = Math.min(i * stepIncrement, 90);
      stepYaml += `    - setWeight: ${setWeight}\n    - pause: { duration: 10m }\n`;
    }

    code = `# rollout.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Argo Rollouts Canary Deployment Specification

apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: payment-service-rollout
  namespace: production
spec:
  replicas: 5
  strategy:
    canary:
      analysis:
        templates:
          - templateName: payment-success-rate
        args:
          - name: service-name
            value: payment-service
      steps:
    - setWeight: 10
      # Pause indefinitely until manually promoted or automated analysis finishes
      - pause: {}
${stepYaml}    - setWeight: 100
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
      - name: payment-service
        image: argoproj/rollouts-demo:blue
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
`;
  } else {
    code = `# rollout.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Argo Rollouts Blue-Green Deployment Specification

apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: payment-service-rollout
  namespace: production
spec:
  replicas: 4
  strategy:
    blueGreen:
      activeService: payment-service-active
      previewService: payment-service-preview
      autoPromotionEnabled: false
      prePromotionAnalysis:
        templates:
          - templateName: smoke-tests
      postPromotionAnalysis:
        templates:
          - templateName: regression-tests
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
      - name: payment-service
        image: argoproj/rollouts-demo:blue
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const engine = $('flags_engine').value;
  const metrics = $('metrics_source').value;

  let code = '';
  if (engine === 'openfeature') {
    code = `{
  "$schema": "https://openfeature.dev/schemas/flags.json",
  "version": "v${SCRIPT_VERSION}",
  "copyright": "Copyright (c) 2026 Talari Pradeep. All Rights Reserved.",
  "flags": {
    "payment-gateway-v2": {
      "state": "ENABLED",
      "variants": {
        "legacy": false,
        "stripe-v2": true
      },
      "defaultVariant": "legacy",
      "targeting": {
        "if": [
          {
            "var": "email"
          },
          {
            "in": [
              "@talari.com",
              "@test.com"
            ]
          }
        ],
        "then": "stripe-v2",
        "else": "legacy"
      }
    }
  }
}`;
  } else {
    code = `# analysis.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Argo Rollouts AnalysisTemplate configuration using ${metrics.toUpperCase()}

apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: payment-success-rate
  namespace: production
spec:
  metrics:
  - name: success-rate
    interval: 1m
    successCondition: result[0] >= 0.995
    failureLimit: 2
    provider:
      ${metrics === 'prometheus' ? `prometheus:
        address: http://prometheus.monitoring.svc.cluster.local:9090
        query: |
          sum(rate(http_requests_total{service="{{args.service-name}}",status=~"2.*"}[2m]))
          /
          sum(rate(http_requests_total{service="{{args.service-name}}"}[2m]))` : `web:
        url: http://metric-analyser.sre.svc.cluster.local/api/v1/validate
        headers:
          - key: Authorization
            value: Bearer token-1234
        jsonPath: "$.success_ratio"`}
`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const type = $('delivery_type').value;
  const engine = $('flags_engine').value;

  let md = `# Progressive Delivery & Feature Flags Suite v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This repository facilitates secure canary rollouts and dynamic flag updates.

## Architecture Elements
- **Argo Rollouts**: Coordinates ${type.toUpperCase()} traffic splits.
- **${engine === 'openfeature' ? 'OpenFeature' : 'LaunchDarkly'}**: Manages application runtime flag state switches.

## Quick Start
1. Apply the rollouts controller:
   \`\`\`bash
   kubectl apply -f rollout.yaml
   \`\`\`
2. Monitor deployment steps:
   \`\`\`bash
   kubectl argo rollouts get rollout payment-service-rollout -n production
   \`\`\`
3. Promote canary release manually:
   \`\`\`bash
   kubectl argo rollouts promote payment-service-rollout -n production
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const type = $('delivery_type').value;

  let md = `# SRE Runbook: Progressive Delivery Rollout Triage
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Canary Failure & Auto-Rollback

If Prometheus reports HTTP 5xx error spikes during deployment:

### Step 1: Query Current Rollout Phase
Identify the active step and status of the rollout:
\`\`\`bash
kubectl argo rollouts get rollout payment-service-rollout -n production
\`\`\`

### Step 2: Emergency Rollback (Abort Release)
If automated AnalysisTemplate has not automatically aborted, trigger a manual undo:
\`\`\`bash
kubectl argo rollouts abort payment-service-rollout -n production
\`\`\`
This immediately switches traffic back to the stable replica set and scales down the preview container cluster.

### Step 3: Flag Hot-Disable
If the bug is gated behind a feature flag, switch the default variant to \`legacy\` or set the flag state to \`DISABLED\` to stop execution instantly without code redeployment.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Version[🚀 New Service Image] -->|Deploy| Rollout[⚙️ Argo Rollouts Deploy]\n  Rollout -->|Route 10% traffic| Canary[🕸️ Canary Replica set]\n  Canary -->|Query Prometheus| Analyze{{Error rate < 1%?}}\n  Analyze -->|Yes| Promote[🚀 Promote to 100% stable]\n  Analyze -->|No| Rollback[🚨 Automatically Rollback to Stable]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const engine = $('flags_engine').value;

  if (tabId === 'config') {
    nameBox.value = 'rollout';
    extTag.textContent = '.yaml';
  } else if (tabId === 'instrument') {
    if (engine === 'openfeature') {
      nameBox.value = 'flags';
      extTag.textContent = '.json';
    } else {
      nameBox.value = 'analysis';
      extTag.textContent = '.yaml';
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
  const type = $('delivery_type').value;
  const engine = $('flags_engine').value;
  const zip = new JSZip();

  zip.file('rollout.yaml', compiledCode.config);
  if (engine === 'openfeature') {
    zip.file('flags.json', compiledCode.instrument);
  } else {
    zip.file('analysis.yaml', compiledCode.instrument);
  }
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `progressive-delivery-${type}.zip`;
    a.click();
    showToast('⬇️ Progressive Delivery SRE package downloaded!');
  });
}

function clearAllFields() {
  $('delivery_type').value = 'canary';
  $('flags_engine').value = 'openfeature';
  $('metrics_source').value = 'prometheus';
  $('delivery_steps').value = '3';
  $('rollout_metrics').checked = true;

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
  const type = $('delivery_type').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'canary': [
      {
        title: 'Argo Rollouts Traffic Split',
        why: 'Gradually diverts user traffic to limit the blast radius of regressions.',
        whyNot: 'High-risk deployments route 100% of users immediately, maximizing outage impact.',
        runtime: 'Injects headers or updates local VirtualServices at scheduled steps.'
      },
      {
        title: 'Active AnalysisTemplate Monitoring',
        why: 'Fails and rolls back deployments automatically if metrics degrade.',
        whyNot: 'Requires manual 24/7 operator checks to capture silent failures.',
        runtime: 'Runs prometheus rate queries at designated intervals.'
      }
    ],
    'blue-green': [
      {
        title: 'Argo Rollouts Service Swap',
        why: 'Creates dual staging pools to execute zero-downtime cutovers.',
        whyNot: 'Requires extra resource overhead, running double replicas temporarily.',
        runtime: 'Updates Kubernetes Selector references during transition.'
      }
    ]
  };

  const activeData = manualData[type] || [];
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
  const engine = $('flags_engine').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'Argo Rollouts Spec',
      'filename': 'rollout.yaml',
      'why': 'Configures deployment strategy routes, sets weights, and attaches telemetry checks.',
      'when': 'Apply during system build steps on staging/production environments.',
      'where': 'Store in Kubernetes continuous deployment repositories.',
      'command': 'kubectl apply -f rollout.yaml',
      'practices': ['Pin low canary weights initially (e.g. 5-10%).', 'Limit maximum replicas drift.'],
      'ai_mlops': 'Allows pipeline models to run shadow evaluations before final promotions.',
      'flow': '[Apply Rollout] ➔ [Route Canary] ➔ [Validate Metrics] ➔ [Promote/Abort]'
    };
  } else if (activeTab === 'instrument') {
    if (engine === 'openfeature') {
      explanation = {
        'title': 'OpenFeature Target Configuration',
        'filename': 'flags.json',
        'why': 'Dynamically sets flag values and segment targeting variables without deployment cycles.',
        'when': 'When releasing early-stage integrations behind gates.',
        'where': 'Store in configuration servers or secret store paths.',
        'command': '# Load configuration in application memory',
        'practices': ['Define fallback values in code.', 'Clean up feature flags regularly after release.'],
        'ai_mlops': 'Gates experimental ML models dynamically for targeted user buckets.',
        'flow': '[Evaluate Context] ➔ [Check Flag Rule] ➔ [Execute Path]'
      };
    } else {
      explanation = {
        'title': 'Telemetry Analysis Template',
        'filename': 'analysis.yaml',
        'why': 'Validates request success rates against metrics databases.',
        'when': 'Consult when configuring canary release loops.',
        'where': 'Deploy as a cluster-wide AnalysisTemplate resource.',
        'command': 'kubectl apply -f analysis.yaml',
        'practices': ['Keep success rates standards high (>99.5%).', 'Add enough interval buffer to collect logs.'],
        'ai_mlops': 'Gives continuous quality data to autonomous auto-remediator endpoints.',
        'flow': '[Start Interval] ➔ [Fetch Metrics] ➔ [Compare Threshold] ➔ [Set Status]'
      };
    }
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Release Documentation Guide',
      'filename': 'README.md',
      'why': 'Step-by-step guidance on how to manage and monitor rollouts.',
      'when': 'Prior to releasing new container packages.',
      'where': 'Save in repository root.',
      'command': '# View in editor',
      'practices': ['Keep commands up-to-date with active clusters.'],
      'ai_mlops': 'Context sheet for continuous deployment agents.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'SRE Rollout Recovery Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Action instructions to resolve deployment failures and isolate bad code branches.',
      'when': 'Consult when alerts report canary failures or high response latency.',
      'where': 'Publish in SRE Wiki.',
      'command': 'kubectl argo rollouts abort ...',
      'practices': ['Define clear ownership matrix for emergency promotions.', 'Automate fast rollbacks.'],
      'ai_mlops': 'Self-healing trigger definitions used by autonomic responders.',
      'flow': '[Detect Anomaly] ➔ [Abort Rollout] ➔ [Deactivate Flag]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Deployment Flow Chart',
      'filename': 'flow.mermaid',
      'why': 'Visualizes the state updates of progressive delivery.',
      'when': 'During architectural design discussions.',
      'where': 'Mermaid rendering console.',
      'command': '# Render in browser',
      'practices': ['Validate both successful promotion and failures recovery loops.'],
      'ai_mlops': 'Validation validation flow for MLOps engineers.',
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
