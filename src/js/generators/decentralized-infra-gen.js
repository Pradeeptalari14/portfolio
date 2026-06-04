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
  $('protocol_type').addEventListener('change', triggerCompileAll);
  $('metric_target').addEventListener('change', triggerCompileAll);
  $('alert_target').addEventListener('change', triggerCompileAll);

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
  const protocol = $('protocol_type').value;

  let code = '';

  if (protocol === 'ipfs') {
    code = `{
  "Identity": {
    "PeerID": "QmZtm29aE7BbcX5ZJ4mB4t5k6v78a9bcde1234567890",
    "PrivKey": "CAASpgkwgYQCgYEAnuB..."
  },
  "Datastore": {
    "Type": "leveldb",
    "Path": "blocks",
    "StorageMax": "100GB"
  },
  "Addresses": {
    "Swarm": [
      "/ip4/0.0.0.0/tcp/4001",
      "/ip6/::/tcp/4001"
    ],
    "API": "/ip4/127.0.0.1/tcp/5001",
    "Gateway": "/ip4/127.0.0.1/tcp/8080"
  },
  "metadata": {
    "version": "v${SCRIPT_VERSION}",
    "copyright": "Copyright (c) 2026 Talari Pradeep. All Rights Reserved."
  }
}`;
  } else if (protocol === 'eth_validator') {
    code = `# validator_settings.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
CONFIG_NAME: mainnet
PRESET_BASE: mainnet

# Consensus & Validator settings
MIN_GENESIS_ACTIVE_VALIDATOR_COUNT: 16384
GENESIS_FORK_VERSION: 0x00000000
SECONDS_PER_SLOT: 12
SLOTS_PER_EPOCH: 32

# Logging & Telemetry Scrapers
METRICS_PORT: 8008
METRICS_ADDRESS: 0.0.0.0
`;
  } else {
    code = `# solana_rpc.conf v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
RPC_PORT=8899
GOSSIP_PORT=8001
DYNAMIC_PORT_RANGE=8002-8020
EXPECTED_SHRED_VERSION=53221
MAX_GENESIS_ARCHIVE_UNPACKED_SIZE_B=10737418240
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const protocol = $('protocol_type').value;
  const metric = $('metric_target').value;
  const alertTarget = $('alert_target').value;

  let code = `#!/usr/bin/env bash
# node_health.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Health Monitor Daemon for ${protocol.toUpperCase()} Node tracking ${metric.toUpperCase()}

ALERT_URL="https://hooks.slack.com/services/mock/alert"
PEER_MIN_THRESHOLD=10
LAG_MAX_THRESHOLD=5 # blocks

check_health() {
`;

  if (protocol === 'ipfs') {
    code += `    echo "Auditing IPFS swarm connection configurations..."
    PEER_COUNT=$(ipfs swarm peers | wc -l)
    echo "Active IPFS peers connected: \${PEER_COUNT}"
    
    if [ "\${PEER_COUNT}" -lt "\${PEER_MIN_THRESHOLD}" ]; then
        echo "🚨 Warning: Connected peer count fell below safety limit (\${PEER_COUNT} < \${PEER_MIN_THRESHOLD})!"
        dispatch_alert "IPFS peer starvation: connected to only \${PEER_COUNT} peers."
    fi
`;
  } else if (protocol === 'eth_validator') {
    code += `    echo "Auditing Ethereum consensus node replication status..."
    # Query prysm/lighthouse execution JSON-RPC APIs
    SYNC_STATUS=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' http://localhost:8545)
    
    if [[ "\${SYNC_STATUS}" == *"false"* ]]; then
        echo "✅ Node is fully synchronized with blockchain mainnet."
    else
        echo "🚨 Warning: Validator node is lagging/syncing!"
        dispatch_alert "Ethereum node lag outlier: Active synchronization in progress."
    fi
`;
  } else {
    code += `    echo "Auditing Solana RPC service health..."
    SOLANA_HEALTH=$(curl -s http://localhost:8899/health)
    
    if [ "\${SOLANA_HEALTH}" != "ok" ]; then
        echo "🚨 Warning: Solana RPC API returned unhealthy: \${SOLANA_HEALTH}!"
        dispatch_alert "Solana RPC API unavailable."
    fi
`;
  }

  code += `}

dispatch_alert() {
    local MSG=\$1
    echo "Forwarding incident logs to ${alertTarget.toUpperCase()} gateway: \${MSG}"
    # curl -X POST -H "Content-Type: application/json" -d "{\\"text\\":\\"\${MSG}\\"}" \${ALERT_URL}
}

while true; do
    check_health
    sleep 30
done
`;

  compiledCode.instrument = code;
}

function compileReadme() {
  const protocol = $('protocol_type').value;

  let md = `# Web3 & Decentralized Infrastructure Node Monitoring Studio v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Monitor validator and storage node metrics. Scaffold configurations and health scripts that audit network topology peers, catch synchronization lag offsets, and trigger PagerDuty alerts before consensus rounds are missed.

## Prerequisites
- **Protocol**: ${protocol.toUpperCase()} Node active.
- **CLI Utilities**: \`ipfs\` CLI or \`curl\`.

## Quick Start
1. Apply the configuration file:
`;

  if (protocol === 'ipfs') {
    md += `   \`\`\`bash
   ipfs config replace ipfs_daemon.json
   ipfs daemon &
   \`\`\`
2. Start the automated monitor daemon script:
   \`\`\`bash
   bash node_health.sh
   \`\`\`
`;
  } else if (protocol === 'eth_validator') {
    md += `   \`\`\`bash
   # Launch validator node referencing configurations
   prysm.sh validator --config-file=validator_settings.yaml
   \`\`\`
2. Start the monitor script:
   \`\`\`bash
   bash node_health.sh
   \`\`\`
`;
  } else {
    md += `   \`\`\`bash
   solana-validator --ledger ledger/ --gossip-port 8001
   \`\`\`
2. Start the monitor:
   \`\`\`bash
   bash node_health.sh
   \`\`\`
`;
  }

  compiledCode.readme = md;
}

function compileRunbook() {
  const protocol = $('protocol_type').value;

  let md = `# SRE Runbook: Blockchain Validator Sync Lag & Peer Starvation
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Validator node misses slot consensus / peer count starves

When node monitors report connection latency or missing blocks:

### Step 1: Query Peer Swarm Connectivity
Check active peer lists:
- For IPFS: \`ipfs swarm peers\`
- For Eth: Query the consensus client peer count APIs.
- If peer counts are low, verify if swarms TCP port (e.g. 4001 or 30303) is open and accessible from external gateways.

### Step 2: Troubleshoot Synchronization Lag
If block height is flatlining:
1. Check storage filesystem disk capacity. Blockchain ledgers require high-write SSD nodes.
2. Confirm memory configurations limits. Heavy nodes can thrash swap disks when memory constraints are hit.

### Step 3: Hard Reboot Daemon Node
If validator processes lock up:
- Stop validator daemons.
- Wipe temporary cache structures (do NOT delete ledger blocks data folders).
- Run recovery restarts commands:
  \`\`\`bash
  # Force restart service
  sudo systemctl restart ${protocol}-node || true
  \`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const protocol = $('protocol_type').value;
  const metric = $('metric_target').value;

  let chart = 'graph TD\n';
  chart += `  Node[${protocol.toUpperCase()} Daemon Node] -->|Swarm Gossip| Net[P2P Network Swarm]\n`;
  chart += `  Node -->|Scrape API| Monitor[Health Checker: node_health.sh]\n`;
  chart += `  Monitor -->|Check: ${metric.toUpperCase()}| Validate{Metric Breached?}\n`;
  chart += `  Validate -->|Yes| Alert[Dispatch SRE alert logs]\n`;
  chart += `  Validate -->|No| Safe[Consensus OK: Sleep 30s]\n`;
  chart += `  Alert --> Action[Trigger peer discovery re-route / restarts]\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const protocol = $('protocol_type').value;

  if (tabId === 'config') {
    if (protocol === 'ipfs') {
      nameBox.value = 'ipfs_daemon';
      extTag.textContent = '.json';
    } else if (protocol === 'eth_validator') {
      nameBox.value = 'validator_settings';
      extTag.textContent = '.yaml';
    } else {
      nameBox.value = 'solana_rpc';
      extTag.textContent = '.conf';
    }
  } else if (tabId === 'instrument') {
    nameBox.value = 'node_health';
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
  const protocol = $('protocol_type').value;
  const zip = new JSZip();

  const file1 = protocol === 'ipfs' ? 'ipfs_daemon.json' : (protocol === 'eth_validator' ? 'validator_settings.yaml' : 'solana_rpc.conf');

  zip.file(file1, compiledCode.config);
  zip.file('node_health.sh', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `decentralized-node-monitor.zip`;
    a.click();
    showToast('⬇️ Web3 Monitor SRE package downloaded!');
  });
}

function clearAllFields() {
  $('protocol_type').value = 'ipfs';
  $('metric_target').value = 'peer_count';
  $('alert_target').value = 'slack';

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
  const protocol = $('protocol_type').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'ipfs': [
      {
        title: 'IPFS Swarm Configuration APIs',
        why: 'Enables routing files blocks across a decentralized DHT network with dynamic swarm socket port allocations.',
        whyNot: 'Isolates the storage node from peer discovery discovery pools, preventing data replication requests.',
        runtime: 'Listens on port 4001 for peer-to-peer DHT queries.'
      },
      {
        title: 'Swarm Peer Monitoring',
        why: 'Ensures the local node maintains enough gossip links to query block pieces quickly.',
        whyNot: 'Drops network discovery efficiency, preventing storage retrievals.',
        runtime: 'Checks active DHT nodes counts.'
      }
    ],
    'eth_validator': [
      {
        title: 'Ethereum Consensus Settings',
        why: 'Configures slot and genesis block boundaries to align the local consensus engine with the mainnet ledger.',
        whyNot: 'Causes validator signature failures, leading to key slashings.',
        runtime: 'Decodes blocks stream inputs.'
      }
    ],
    'solana_rpc': [
      {
        title: 'Solana RPC Gossip Configurations',
        why: 'Allocates RPC and gossip socket ports to coordinate block replication streams.',
        whyNot: 'Causes transaction ingestion delays, dropping RPC requests.',
        runtime: 'Exposes port 8899 for JSON-RPC APIs.'
      }
    ]
  };

  const activeData = manualData[protocol] || [];
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
  const protocol = $('protocol_type').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'P2P Node daemon configuration',
      'filename': protocol === 'ipfs' ? 'ipfs_daemon.json' : (protocol === 'eth_validator' ? 'validator_settings.yaml' : 'solana_rpc.conf'),
      'why': 'Declares identity peer hashes, swarm listeners, storage path indices, and consensus rules.',
      'when': 'Apply when starting new validator services nodes.',
      'where': 'Deploy in application configuration folders.',
      'command': protocol === 'ipfs' ? 'ipfs config replace ...' : '# Expose client RPC configurations',
      'practices': ['Keep node private keys highly secure and back them up off-disk.', 'Allocate high-speed SSDs.'],
      'ai_mlops': 'Used to orchestrate peer-to-peer storage models for distributed training checkpoints.',
      'flow': '[Load Node Identity] ➔ [Open Swarm ports] ➔ [Join Gossip Swarm]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'Node health daemon script',
      'filename': 'node_health.sh',
      'why': 'Scrapes local RPC interfaces and warns SRE bridges of sync lag breaches.',
      'when': 'Run as a continuous systemd health checker on node start.',
      'where': 'Deploy as a monitoring agent on node host.',
      'command': 'bash node_health.sh',
      'practices': ['Use low resource tools like curl and grep to keep monitor footprints light.', 'Enforce alerting cool-downs.'],
      'ai_mlops': 'Audits peer status when downloading models shards from decentralized IPFS stores.',
      'flow': '[Poll Node RPC] ➔ [Compare peer count / block lag] ➔ [Dispatch webhook alerts]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Developer Onboarding Guide',
      'filename': 'README.md',
      'why': 'Summarizes node setup prerequisites and commands execution sequences.',
      'when': 'Consult when bootstrapping fresh nodes developers workspaces.',
      'where': 'Save in repository project root.',
      'command': '# View README.md',
      'practices': ['Always verify block checksums before bootstrapping ledgers.'],
      'ai_mlops': 'Decentralized storage nodes operations guide.',
      'flow': '[README.md]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Validator Outage Mitigation Playbook',
      'filename': 'sre_runbook.md',
      'why': 'Coordinates triage operations for peer starvation, consensus slot misses, and disk failures.',
      'when': 'Alert on validator sync lag breaches.',
      'where': 'Publish in SRE runbooks portal.',
      'command': '# Access SRE portal',
      'practices': ['Validate storage disk IOPS capacity before resetting daemon services.', 'Backup keys.'],
      'ai_mlops': 'Ensures decentralized dataset feeds remain active and reachable.',
      'flow': '[Sync Alert] ➔ [Check Gossip connection] ➔ [Verify write-disk metrics]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Consensus Node Gossip sequence',
      'filename': 'flow.mermaid',
      'why': 'Models peer discovery handshake pipelines.',
      'when': 'Review during infrastructure network reviews.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Keep gossip ports firewall-restricted to secure network pools.'],
      'ai_mlops': 'Node interaction diagram reference.',
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
