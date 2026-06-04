import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'experiment';

let compiledCode = {
  experiment: '',
  rollback: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('chaos_target').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileExperiment();
  compileRollback();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileExperiment() {
  const target = $('chaos_target').value;
  const framework = $('chaos_framework').value;
  const intensity = $('chaos_intensity').value;
  const duration = $('chaos_duration').value;

  let code = '';

  if (framework === 'mesh') {
    if (target === 'network') {
      code = `# network_delay_experiment.yaml v${SCRIPT_VERSION}
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: network-latency-injector
  namespace: production
spec:
  action: delay
  mode: all
  selector:
    namespaces:
      - production
    labelSelectors:
      app: payment-api
  delay:
    latency: '${intensity}ms'
    jitter: '10ms'
  duration: '${duration}s'
  scheduler:
    cron: '*/5 * * * *'
`;
    } else if (target === 'resource') {
      code = `# cpu_burn_experiment.yaml v${SCRIPT_VERSION}
apiVersion: chaos-mesh.org/v1alpha1
kind: StressChaos
metadata:
  name: cpu-starvation-stress
  namespace: production
spec:
  mode: all
  selector:
    namespaces:
      - production
  stressors:
    cpu:
      workers: 2
      load: ${intensity}
  duration: '${duration}s'
`;
    } else {
      code = `# pod_kill_experiment.yaml v${SCRIPT_VERSION}
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-killer-anarchy
  namespace: production
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces:
      - production
    labelSelectors:
      app: database-replica
  duration: '${duration}s'
`;
    }
  } else if (framework === 'litmus') {
    code = `# litmus_experiment.yaml v${SCRIPT_VERSION}
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-production-chaos
  namespace: production
spec:
  engineState: 'active'
  appinfo:
    appns: 'production'
    applabel: 'app=payment-api'
    appkind: 'deployment'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: ${target}-chaos
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: '${duration}'
`;
  } else {
    // Pure Shell Simulation
    if (target === 'network') {
      code = `#!/usr/bin/env bash
# simulate_network_chaos.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Injects network interface latency using Linux traffic control (tc)

echo "💥 Injecting ${intensity}ms network latency on interface eth0..."
sudo tc qdisc add dev eth0 root netem delay ${intensity}ms
sleep ${duration}
echo "🧹 Auto-cleaning network rules..."
sudo tc qdisc del dev eth0 root netem
`;
    } else if (target === 'resource') {
      code = `#!/usr/bin/env bash
# simulate_resource_chaos.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Injects CPU/RAM starvation using standard stress-ng CLI

echo "💥 Injecting heavy CPU load (${intensity}%) for ${duration}s..."
stress-ng --cpu 2 --cpu-load ${intensity} --timeout ${duration}s
`;
    } else {
      code = `#!/usr/bin/env bash
# simulate_pod_chaos.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Randomly terminates local processes to simulate server daemon crashes

echo "💥 Simulating service daemon crash for ${duration}s..."
for i in {1..5}; do
  TARGET_PID=$(pgrep -f "gunicorn" | head -n 1)
  if [ -n "$TARGET_PID" ]; then
    echo "Killing target process PID: $TARGET_PID"
    kill -9 $TARGET_PID
  fi
  sleep 10
done
`;
    }
  }

  compiledCode.experiment = code;
}

function compileRollback() {
  const target = $('chaos_target').value;
  const framework = $('chaos_framework').value;

  let code = `#!/usr/bin/env bash
# rollback_chaos.sh v${SCRIPT_VERSION} - Disaster Recovery Rollback Playbook
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Forcefully terminates all active chaos injectors to restore system sanity

echo "🚨 [CRITICAL] Initiating emergency Chaos Rollback procedure..."
`;

  if (framework === 'mesh' || framework === 'litmus') {
    code += `
# 1. Delete all active Custom Resource manifests
kubectl delete networkchaos --all -n production
kubectl delete stresschaos --all -n production
kubectl delete podchaos --all -n production
kubectl delete chaosengine --all -n production

echo "✅ Kubernetes Chaos resources deleted. Verifying cluster reconciliation..."
kubectl rollout status deployment/payment-api -n production
`;
  } else {
    if (target === 'network') {
      code += `
# 1. Clean Linux Traffic Control network queues
sudo tc qdisc del dev eth0 root netem 2>/dev/null || true
echo "✅ Traffic control delay injection rules cleared."
`;
    } else if (target === 'resource') {
      code += `
# 1. Forcefully kill stress-ng instances
sudo pkill -f "stress-ng" || true
echo "✅ Resource stress processes terminated."
`;
    } else {
      code += `
# 1. Restart critical system services
sudo systemctl restart nginx gunicorn postgresql || true
echo "✅ Local service daemons restarted."
`;
    }
  }

  code += `
echo "🎉 Emergency rollback completed successfully! System steady state restored."
`;

  compiledCode.rollback = code;
}

function compileReadme() {
  const framework = $('chaos_framework').value;
  let md = `# SRE Chaos Engineering Engine v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This package provides custom YAML templates and shell script injectors to stress test infrastructure resilience.

## Prerequisites

- For Kubernetes Chaos: Ensure you have Chaos Mesh or Litmus installed in the cluster.
- For Shell simulation: Ensure the target system has \`stress-ng\` and traffic control (\`tc\`) installed:
  \`\`\`bash
  sudo apt-get update && sudo apt-get install -y stress-ng iproute2
  \`\`\`

## Run the Experiment
1. Apply the experiment manifest or run the shell script:
   \`\`\`bash
   # Kubernetes
   kubectl apply -f experiment.yaml
   # Local Shell
   bash simulate.sh
   \`\`\`
2. Monitor system metrics (CPU load, request latencies) via Grafana dashboard.
3. If things break, run the rollback script immediately:
   \`\`\`bash
   bash rollback.sh
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const target = $('chaos_target').value;
  const intensity = $('chaos_intensity').value;

  let md = `# SRE Runbook: Chaos Experimentation and Resilience Playbook
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🔬 Experiment Hypothesis: ${target.toUpperCase()} disruption

### 1. Steady State Hypothesis
Under normal operating parameters, the service error rate must remain below 0.1%, and latency p95 should remain under 200ms.

### 2. Failure Simulation parameters
- Target: \`${target}\`
- Load Metric: \`${intensity}\`

### 3. Emergency Incident Triage (If Steady State Fails)
If the application crashes completely or cascading failure occurs:
1. **Trigger Rollback Plan**: Immediately execute the rollback playbook.
   \`\`\`bash
   bash rollback.sh
   \`\`\`
2. **Review Ingress logs**: Confirm if the ingress gateway is routing traffic to fallback nodes.
3. **Audit Autoscaling**: Check if Horizontal Pod Autoscaler (HPA) fails to scale under CPU strain.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const target = $('chaos_target').value;
  let chart = 'graph TD\n';

  chart += `  SteadyState[1. System in Steady State] -->|2. Trigger Experiment| Injector[Inject ${target} Chaos]\n`;
  chart += `  Injector --> MetricAudits{3. Monitoring Telemetry Check}\n`;
  chart += `  MetricAudits -->|Healthy / Scaled| Success[Resilience Validated - Experiment Complete]\n`;
  chart += `  MetricAudits -->|Degraded / Outage| Rollback[4. Trigger Emergency Rollback]\n`;
  chart += `  Rollback --> Restore[5. Steady State Restored]\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'experiment') {
    nameBox.value = 'experiment';
    const framework = $('chaos_framework').value;
    extTag.textContent = (framework === 'mesh' || framework === 'litmus') ? '.yaml' : '.sh';
  } else if (tabId === 'rollback') {
    nameBox.value = 'rollback';
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
  const framework = $('chaos_framework').value;
  const zip = new JSZip();
  
  zip.file('experiment' + ((framework === 'mesh' || framework === 'litmus') ? '.yaml' : '.sh'), compiledCode.experiment);
  zip.file('rollback.sh', compiledCode.rollback);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chaos-sre-${framework}.zip`;
    a.click();
    showToast('⬇️ Chaos package downloaded!');
  });
}

function clearAllFields() {
  $('chaos_target').value = 'network';
  $('chaos_framework').value = 'mesh';
  $('chaos_intensity').value = '100';
  $('chaos_duration').value = '120';
  $('chaos_rollback_check').checked = true;

  switchTab('experiment');
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
  const framework = $('chaos_framework').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'mesh': [
      {
        title: 'Chaos Mesh CRD Experiment injection',
        why: 'Allows injecting systematic disruptions into specific pods safely using K8s native API controls.',
        whyNot: 'Leaves your testing dependent on manual process kills, which is hard to control and audit.',
        runtime: 'Injects proxy latency sidecars or CPU stress containers into namespaces.'
      }
    ],
    'litmus': [
      {
        title: 'Litmus ChaosEngine CRD setup',
        why: 'Standardizes experiment definitions and integrates with ArgoCD pipelines.',
        whyNot: 'Makes chaos deployment hard to track inside GitOps workflows.',
        runtime: 'Invokes specific Chaos runner pods mapping target namespaces.'
      }
    ],
    'shell': [
      {
        title: 'Safe Linux Shell stress simulation',
        why: 'Enables testing on local standalone servers without Kubernetes overhead.',
        whyNot: 'Risk of locking the target server if limits are not set correctly.',
        runtime: 'Executes tc and stress-ng parameters directly inside user-space.'
      }
    ]
  };

  const activeData = manualData[framework] || [];
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

  if (activeTab === 'experiment') {
    explanation = {
      'title': 'Chaos Experiment Configuration',
      'filename': 'experiment.yaml',
      'why': 'Specifies chaos triggers, target namespaces, and injection duration metrics.',
      'when': 'Apply during off-peak hours in staging or canary environments to validate system behaviors.',
      'where': 'Deploy as CRD inside target cluster namespace or execute as local stress script.',
      'command': 'kubectl apply -f experiment.yaml',
      'practices': ['Pin target scopes to a single label.', 'Set maximum duration limits.'],
      'ai_mlops': 'Used to test autonomous alert response models and HPA scaling thresholds.',
      'flow': '[Experiment Definition Manifest]'
    };
  } else if (activeTab === 'rollback') {
    explanation = {
      'title': 'Emergency Rollback Script',
      'filename': 'rollback.sh',
      'why': 'Guarantees immediate cleanup of injected chaos, restoring normal production configurations.',
      'when': 'Run instantly if metrics degraded states threaten user experience.',
      'where': 'Save in SRE runbook folder for immediate shell execution.',
      'command': 'bash rollback.sh',
      'practices': ['Always double check rollback script works before running the experiment.', 'Verify CRD cleanup commands.'],
      'ai_mlops': 'Automated rollback check triggered by AI monitors if SLA drops.',
      'flow': '[Force kill stress-ng] ➔ [Delete Chaos CRDs] ➔ [Reconciliation check]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Chaos Setup and Usage Instructions',
      'filename': 'README.md',
      'why': 'Details system prerequisites, packages, and quickstart commands.',
      'when': 'Review prior to launching the simulation experiments.',
      'where': 'Save in repository.',
      'command': '# Open in viewer',
      'practices': ['Ensure tc and stress-ng utilities are installed.'],
      'ai_mlops': 'Provides configuration context for automation runners.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Resilience Hypothesis & Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Defines testing goals, steady state benchmarks, and triage checklists.',
      'when': 'Consult throughout the design phases to build robust architectures.',
      'where': 'Store in team documentation.',
      'command': '# Open in viewer',
      'practices': ['Define clear validation queries.', 'Outline dependencies failure matrices.'],
      'ai_mlops': 'Used by auto-triage systems to read fallback paths.',
      'flow': '[Hypothesis validation checklist]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Chaos State Transitions Flowchart',
      'filename': 'flow.mermaid',
      'why': 'Maps out target experiment states.',
      'when': 'Review during game days onboarding.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Include all critical failure path branches.'],
      'ai_mlops': 'Visual check blueprint for automated chaos runners.',
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
