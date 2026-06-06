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
  $('cluster_engine').addEventListener('change', triggerCompileAll);
  $('node_count').addEventListener('input', triggerCompileAll);
  $('sync_replication').addEventListener('change', triggerCompileAll);
  $('failover_threshold').addEventListener('input', triggerCompileAll);
  $('health_probe').addEventListener('change', triggerCompileAll);

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
  const engine = $('cluster_engine').value;
  const nodes = parseInt($('node_count').value) || 3;
  const isSync = $('sync_replication').checked;

  let code = '';
  if (engine === 'patroni') {
    code = `# patroni.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# PostgreSQL HA Patroni Configuration Blueprint

scope: postgres-cluster
namespace: /service
name: pg-node-1

etcd3:
  hosts:
    - etcd-0.etcd.default.svc.cluster.local:2379
    - etcd-1.etcd.default.svc.cluster.local:2379
    - etcd-2.etcd.default.svc.cluster.local:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    synchronous_mode: ${isSync}
    postgresql:
      use_pg_rewind: true
      use_slots: true
      parameters:
        max_connections: 100
        wal_level: replica
        hot_standby: "on"
        max_wal_senders: 10
        max_replication_slots: 10

  initdb:
    - encoding: UTF8
    - data-checksums

  pg_hba:
    - host replication replicator 0.0.0.0/0 md5
    - host all all 0.0.0.0/0 md5

postgresql:
  listen: 0.0.0.0:5432
  connect_address: pg-node-1.postgres.default.svc.cluster.local:5432
  data_dir: /var/lib/postgresql/data
  bin_dir: /usr/lib/postgresql/15/bin
  pgpass: /var/lib/postgresql/.pgpass
  authentication:
    replication:
      username: replicator
      password: ReplicatorPassword123
    superuser:
      username: postgres
      password: PostgresSuperuserPassword123
`;
  } else {
    code = `# sentinel.conf v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Redis Sentinel HA Configuration Blueprint

port 26379
dir /tmp

# monitor <master-name> <ip> <port> <quorum>
sentinel monitor redis-master redis-master-0.redis.default.svc.cluster.local 6379 2

# auth-pass <master-name> <password>
sentinel auth-pass redis-master RedisSecurePassword123

# sentinel down-after-milliseconds <master-name> <milliseconds>
sentinel down-after-milliseconds redis-master 10000

# sentinel failover-timeout <master-name> <milliseconds>
sentinel failover-timeout redis-master 180000

# sentinel parallel-syncs <master-name> <number>
sentinel parallel-syncs redis-master 1
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const engine = $('cluster_engine').value;
  const hasProbe = $('health_probe').checked;

  let code = `#!/usr/bin/env bash
# cluster_health.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Cluster replication verification check utility

set -euo pipefail

echo "==> Auditing replication status..."
`;

  if (engine === 'patroni') {
    code += `# Audit using patronictl CLI
if ! command -v patronictl &> /dev/null; then
    echo "patronictl could not be found. Installing client CLI dependencies..."
    pip install patroni[etcd3]
fi

# Print topology summary status
echo "Cluster Status Topology:"
patronictl -c /etc/patroni/patroni.yml list

${hasProbe ? `# Verify health check endpoint response
echo "Verifying local REST API health..."
curl -s http://localhost:8008/health | grep -q "running" && echo "Local Patroni Node is healthy!"` : ''}
`;
  } else {
    code += `# Check using redis-cli replication status
echo "Fetching Redis replication information..."
redis-cli -a RedisSecurePassword123 info replication

${hasProbe ? `# Query Sentinel Master status details
echo "Verifying Sentinel Master metrics..."
redis-cli -p 26379 sentinel master redis-master` : ''}
`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const engine = $('cluster_engine').value;

  let md = `# Database HA Clustering Configuration v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Scaffolding cluster configs for database failover and high availability replication topologies.

## Components
- **Orchestration**: ${engine === 'patroni' ? 'PostgreSQL Patroni (etcd DCS)' : 'Redis Sentinel'}
- **Replica Nodes**: Standard multi-replica topologies.

## How to Run
1. Launch cluster infrastructure:
   \`\`\`bash
   ${engine === 'patroni' ? 'patroni patroni.yaml' : 'redis-sentinel sentinel.conf'}
   \`\`\`
2. Check replication node lists:
   \`\`\`bash
   bash cluster_health.sh
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const engine = $('cluster_engine').value;

  let md = `# SRE Runbook: Database Split-Brain & Sync Lag Recovery
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Database Cluster Outage or Replica Divergence

If alerts trigger for database replication lag or primary node isolation:

### Step 1: Query Cluster Members Status
Identify current topology status:
\`\`\`bash
${engine === 'patroni' ? 'patronictl -c patroni.yaml list' : 'redis-cli -p 26379 sentinel master redis-master'}
\`\`\`

### Step 2: Handle Split-Brain Scenarios
If multiple nodes claim Primary status:
1. Isolate the network paths of the partitioned node immediately to avoid dirty writes.
2. Force-demote the partition runner node back to replica.
3. ${engine === 'patroni' ? 'Run `patronictl reinit` to force-sync tables from pg_rewind.' : 'Execute `SLAVEOF` to resync from master.'}

### Step 3: Verify Replication Sync Recovery
Confirm nodes are syncing cleanly:
\`\`\`bash
bash cluster_health.sh
\`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Primary[🗄️ Primary DB Node] -->|Replicate| Replica[(🗄️ Replica DB Node)]\n  Primary -->|Heartbeat| Patroni[⚙️ Patroni Failover Coordinator]\n  Patroni -->|Detect Node Outage| Failover[🚨 Primary Offline - Promote Replica]\n  Failover --> Promote[(🗄️ New Primary DB Node)]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const engine = $('cluster_engine').value;

  if (tabId === 'config') {
    if (engine === 'patroni') {
      nameBox.value = 'patroni';
      extTag.textContent = '.yaml';
    } else {
      nameBox.value = 'sentinel';
      extTag.textContent = '.conf';
    }
  } else if (tabId === 'instrument') {
    nameBox.value = 'cluster_health';
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
  const engine = $('cluster_engine').value;
  const zip = new JSZip();

  if (engine === 'patroni') {
    zip.file('patroni.yaml', compiledCode.config);
  } else {
    zip.file('sentinel.conf', compiledCode.config);
  }
  zip.file('cluster_health.sh', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `db-clustering-${engine}.zip`;
    a.click();
    showToast('⬇️ Database Clustering SRE package downloaded!');
  });
}

function clearAllFields() {
  $('cluster_engine').value = 'patroni';
  $('node_count').value = '3';
  $('sync_replication').checked = true;
  $('failover_threshold').value = '80';
  $('health_probe').checked = true;

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
  const engine = $('cluster_engine').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'patroni': [
      {
        title: 'Patroni DCS Heartbeats',
        why: 'Monitors PostgreSQL availability dynamically using key-value leases.',
        whyNot: 'Unchecked partitions cause split-brain scenarios where both nodes accept writes.',
        runtime: 'Performs continuous REST API status queries against local etcd pools.'
      },
      {
        title: 'pg_rewind Sync Mechanics',
        why: 'Enables replicas to fast-forward WAL states automatically during failover.',
        whyNot: 'Divergent nodes must download database backups from scratch, increasing recovery delay.',
        runtime: 'Checks WAL timelines difference during node bootstrap.'
      }
    ],
    'sentinel': [
      {
        title: 'Sentinel Quorum Parameters',
        why: 'Requires consensus amongst sentinel nodes before declaring master dead.',
        whyNot: 'Transient network blips trigger premature failovers, causing connection cuts.',
        runtime: 'Exchanges vote checks across ports.'
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
  const engine = $('cluster_engine').value;

  if (activeTab === 'config') {
    explanation = {
      'title': engine === 'patroni' ? 'Patroni Cluster Specification' : 'Sentinel Config Spec',
      'filename': engine === 'patroni' ? 'patroni.yaml' : 'sentinel.conf',
      'why': 'Configures network bindings, authorization parameters, replica endpoints, and quorum voters.',
      'when': 'Apply when bootstrapping a multi-replica database deployment.',
      'where': 'Deploy as systemd configs or container sidecars.',
      'command': engine === 'patroni' ? 'patroni patroni.yaml' : 'redis-sentinel sentinel.conf',
      'practices': ['Pin failover timeouts higher than transit blips.', 'Configure secure etcd key access.'],
      'ai_mlops': 'Guarantees continuous database access for model vectors store backends.',
      'flow': '[Start Node] ➔ [Register on DCS] ➔ [Determine Leader] ➔ [Listen Postgres]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'Cluster Health Checker Script',
      'filename': 'cluster_health.sh',
      'why': 'Validates cluster topologies and returns replica connection status queries.',
      'when': 'Run as a diagnostic tool during failover operations or system checks.',
      'where': 'Store in administrative script libraries.',
      'command': 'bash cluster_health.sh',
      'practices': ['Hook script outputs to Prometheus alert rules.', 'Do not hardcode master passwords.'],
      'ai_mlops': 'Validates storage states before initiating large analytics writes.',
      'flow': '[Check CLI] ➔ [Fetch Topology] ➔ [Inspect Heartbeats] ➔ [Return Health]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Setup Instructions Guide',
      'filename': 'README.md',
      'why': 'Contains quick-start commands, dependencies installers, and clustering tutorials.',
      'when': 'Prior to setting up fresh database nodes.',
      'where': 'Save in config repository root.',
      'command': '# Open in editor',
      'practices': ['Include configuration examples for all supported engines.'],
      'ai_mlops': 'Gives setup guidelines to deployment automations.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Database Recovery Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Provides critical recovery manuals for resolving split-brain divergence and replica sync delays.',
      'when': 'Use during database failover incidents.',
      'where': 'Store in SRE database playbook library.',
      'command': 'patronictl ... list',
      'practices': ['Always isolate split nodes first to protect data.', 'Automate failover tests in staging.'],
      'ai_mlops': 'Ensures high availability during high-throughput retraining cycles.',
      'flow': '[Detect Split-Brain] ➔ [Isolate partitioned Node] ➔ [Force Sync WAL]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Failover Data Flow Chart',
      'filename': 'flow.mermaid',
      'why': 'Visualizes the step-by-step consensus checking and promotion path during failover.',
      'when': 'Consult during disaster recovery simulations.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Verify quorum constraints are strictly set.'],
      'ai_mlops': 'Downtime reduction planner helper.',
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
