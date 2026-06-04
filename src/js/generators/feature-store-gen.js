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
  $('online_store').addEventListener('change', triggerCompileAll);
  $('offline_store').addEventListener('change', triggerCompileAll);
  $('sync_interval').addEventListener('input', triggerCompileAll);

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
  const onlineStore = $('online_store').value;
  const offlineStore = $('offline_store').value;

  let code = `project: production_feature_store
registry: data/registry.db
provider: local
offline_store:
`;

  if (offlineStore === 'parquet') {
    code += `  type: file
  file_path: data/offline_store.parquet
`;
  } else {
    code += `  type: bigquery
  dataset: production_features
  location: US
`;
  }

  code += `online_store:
`;

  if (onlineStore === 'redis') {
    code += `  type: redis
  connection_string: redis://production-redis-master.shared.svc.cluster.local:6379
  key_ttl: 2592000 # 30 days
`;
  } else {
    code += `  type: postgres
  connection_string: postgresql://feast:feast_pass@production-postgres.db.svc.cluster.local:5432/feast_registry
  sslmode: disable
`;
  }

  code += `flags:
  alpha_features: false
metadata:
  version: "v${SCRIPT_VERSION}"
  copyright: "Copyright (c) 2026 Talari Pradeep. All Rights Reserved."
`;

  compiledCode.config = code;
}

function compileInstrument() {
  const offlineStore = $('offline_store').value;

  let code = `#!/usr/bin/env python3
# features.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Feast Feature Definitions for ML Pipeline Ingestion

from datetime import timedelta
from feast import (
    Entity,
    FeatureView,
    Field,
    FileSource,
    Project,
)
from feast.types import Float32, Int64

# Define the user entity
user = Entity(name="user_id", value_type=Entity.ValueType.INT64, description="Unique user identifier")

# Feature source definition (Offline Store: ${offlineStore.toUpperCase()})
`;

  if (offlineStore === 'parquet') {
    code += `user_stats_source = FileSource(
    path="data/offline_store.parquet",
    event_timestamp_column="event_timestamp",
    created_timestamp_column="created_timestamp",
)
`;
  } else {
    code += `from feast.infra.offline_stores.bigquery_source import BigQuerySource

user_stats_source = BigQuerySource(
    table="gcp-project.production_features.user_activity_stats",
    event_timestamp_column="event_timestamp",
    created_timestamp_column="created_timestamp",
)
`;
  }

  code += `
# Feature View definition
user_activity_v1 = FeatureView(
    name="user_activity_v1",
    entities=[user],
    ttl=timedelta(days=30),
    schema=[
        Field(name="failed_logins_1h", dtype=Int64),
        Field(name="api_calls_count_5m", dtype=Int64),
        Field(name="avg_response_latency_1h", dtype=Float32),
    ],
    online=True,
    source=user_stats_source,
    tags={"team": "sre_mlops", "stage": "production"},
)
`;

  compiledCode.instrument = code;
}

function compileReadme() {
  const onlineStore = $('online_store').value;

  let md = `# MLOps Feature Store Registry v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Scaffold and synchronize Feast feature stores. Manages features consistency between offline databases (Parquet/BigQuery) and low-latency online databases (${onlineStore.toUpperCase()}).

## Installation & Setup
1. Install Feast library package:
   \`\`\`bash
   pip install feast
   \`\`\`
2. Deploy the Feast local/cloud schema registry:
   \`\`\`bash
   feast apply
   \`\`\`
3. Perform feature synchronization (Offline ➔ Online):
   \`\`\`bash
   feast materialize-incremental $(date -u +"%Y-%m-%dT%H:%M:%S")
   \`\`\`
`;

  compiledCode.readme = md;
}

function compileRunbook() {
  const onlineStore = $('online_store').value;
  const syncInterval = $('sync_interval').value || 10;

  let md = `# SRE Runbook: Offline-to-Online Feature Store Drift
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Outdated feature inputs serving model requests

When feature replication sync latency exceeds the threshold:

### Step 1: Audit Feature Ingestion Timestamps
Check last materialization timestamp inside the registry database:
- Read active keys in ${onlineStore.toUpperCase()} database.
- Compare with raw data source timestamps.

### Step 2: Manually Force Sync (Materialize)
If automated sync cron jobs fail:
1. Trigger Feast manual materialization run:
   \`\`\`bash
   feast materialize 1970-01-01T00:00:00 $(date -u +"%Y-%m-%dT%H:%M:%S")
   \`\`\`
2. Audit target replication logs to verify connection states.

### Step 3: Monitor Database CPU Profiles
If ${onlineStore.toUpperCase()} returns read timeouts:
- Check connection pooling configurations in \`feature_store.yaml\`.
- Check CPU capacity limits.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const onlineStore = $('online_store').value;
  const offlineStore = $('offline_store').value;

  let chart = 'graph TD\n';
  chart += `  Source[Operational Raw Events] -->|Ingestion Worker| Offline[Offline Store: ${offlineStore.toUpperCase()}]\n`;
  chart += `  Offline -->|feast apply| Registry[Feast SQLite/GCS Registry]\n`;
  chart += `  Offline -->|feast materialize| Online[Online Database: ${onlineStore.toUpperCase()}]\n`;
  chart += `  App[ML Model Inference App] -->|Request Real-time features| Online\n`;
  chart += `  App -->|Failover request| Offline\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'config') {
    nameBox.value = 'feature_store';
    extTag.textContent = '.yaml';
  } else if (tabId === 'instrument') {
    nameBox.value = 'features';
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

  zip.file('feature_store.yaml', compiledCode.config);
  zip.file('features.py', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `feast-feature-store.zip`;
    a.click();
    showToast('⬇️ Feature Store SRE package downloaded!');
  });
}

function clearAllFields() {
  $('online_store').value = 'redis';
  $('offline_store').value = 'parquet';
  $('sync_interval').value = '10';

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
  const onlineStore = $('online_store').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'redis': [
      {
        title: 'Redis Online Storage Cluster',
        why: 'Enables sub-millisecond retrieval of feature vectors during real-time model scoring/inference loops.',
        whyNot: 'Leads to high latency model executions, violating front-end SLAs/SLOs.',
        runtime: 'Direct key lookup from memory using Feast Redis connector.'
      },
      {
        title: 'Offline Database Ingestion',
        why: 'Stores historical features for model training and periodic batch materialize routines.',
        whyNot: 'Makes it impossible to query historical training features, causing features leakage and model decay.',
        runtime: 'Performs batch SQL loads or queries raw parquet objects.'
      }
    ],
    'postgres': [
      {
        title: 'PostgreSQL Online Features Storage',
        why: 'Provides robust transaction isolation and structured SQL indices for consistent features access.',
        whyNot: 'Limits reads speeds under high request concurrency.',
        runtime: 'Executes indexed SELECT queries on feast_registry tables.'
      }
    ]
  };

  const activeData = manualData[onlineStore] || [];
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
  const onlineStore = $('online_store').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'Feast configuration file',
      'filename': 'feature_store.yaml',
      'why': 'Specifies configuration pointers for registry files, offline databases, and online low-latency caches.',
      'when': 'Run feast commands or start inference services.',
      'where': 'Deploy in root folder of the ML runtime namespace.',
      'command': 'feast apply',
      'practices': ['Pin key time-to-live settings to avoid leaking database disk space.', 'Use SSL connection strings.'],
      'ai_mlops': 'Mandatory MLOps config mapping to link training datasets with production inference.',
      'flow': '[Read yaml config] ➔ [Initialize connections] ➔ [Load Feast features]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'Feast features schema definitions',
      'filename': 'features.py',
      'why': 'Defines entity primary keys, features data types, TTL windows, and offline data sources.',
      'when': 'Add new features or modify existing parameters variables.',
      'where': 'Commit to feature store repository.',
      'command': 'python features.py',
      'practices': ['Structure features into clear namespaces.', 'Never mix development and production schemas.'],
      'ai_mlops': 'Codifies feature schemas as code to prevent offline-online skew.',
      'flow': '[Load Entities] ➔ [Map schemas types] ➔ [Export definitions]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Feature Store Setup Guide',
      'filename': 'README.md',
      'why': 'Provides onboarding commands for initializing Feast datasets registries.',
      'when': 'Review when setting up fresh deployment clusters.',
      'where': 'Store in project registry root.',
      'command': '# View file',
      'practices': ['Always test materialization steps in staging before applying.'],
      'ai_mlops': 'Manual reference for DevOps engineers managing MLOps clusters.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Drift Recovery Manual',
      'filename': 'sre_runbook.md',
      'why': 'Details diagnostic protocols for synchronization latency issues and connection drifts.',
      'when': 'Alert on materialization lag exceeds thresholds.',
      'where': 'Publish in SRE catalogs portal.',
      'command': '# View in console',
      'practices': ['Test manual materialization run first before scaling databases clusters.', 'Audit sync crons.'],
      'ai_mlops': 'Ensures the ML model is receiving fresh input parameters.',
      'flow': '[Replication Alert] ➔ [Feast Materialize manual run] ➔ [Clear stale caches]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Features Ingestion Dataflow',
      'filename': 'flow.mermaid',
      'why': 'Visualizes the offline-to-online sync flow.',
      'when': 'Review during data architecture design reviews.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Ensure model failovers are enabled if database is unreachable.'],
      'ai_mlops': 'Data pipelines flowchart reference.',
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
