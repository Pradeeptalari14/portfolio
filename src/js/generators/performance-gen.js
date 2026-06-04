import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'script';

let compiledCode = {
  script: '',
  run: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('performance_tool').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileScript();
  compileRun();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileScript() {
  const tool = $('performance_tool').value;
  const proto = $('performance_proto').value;
  const vus = $('performance_vus').value;
  const duration = $('performance_duration').value;
  const target = $('performance_target').value || 'https://api.example.com/v1';

  let code = '';

  if (tool === 'k6') {
    if (proto === 'http') {
      code = `// load_test.js v${SCRIPT_VERSION} - k6 HTTP Performance Test
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: ${vus} }, // Ramp-up
    { duration: '${duration}', target: ${vus} }, // Sustained load
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // less than 1% errors
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
  },
};

export default function () {
  const url = '${target}';
  const payload = JSON.stringify({
    client: 'k6-load-test',
    timestamp: new Date().toISOString()
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-SRE-Trace': 'k6-perf-test'
    },
  };

  const res = http.get(url, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
`;
    } else {
      code = `// ws_test.js v${SCRIPT_VERSION} - k6 WebSockets Load Test
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  vus: ${vus},
  duration: '${duration}',
};

export default function () {
  const url = '${target.replace('http', 'ws')}';

  ws.connect(url, null, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({ event: 'ping' }));
    });

    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      check(msg, {
        'received message event': (m) => m.event === 'pong',
      });
      socket.close();
    });
  });
}
`;
    }
  } else {
    // Locust (Python)
    if (proto === 'http') {
      code = `# locustfile.py v${SCRIPT_VERSION} - Locust HTTP Load Test
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

from locust import HttpUser, task, between, events

class APIPerformanceUser(HttpUser):
    wait_time = between(1, 2.5)

    @task
    def test_endpoint(self):
        headers = {
            "Content-Type": "application/json",
            "X-SRE-Trace": "locust-perf-test"
        }
        with self.client.get(
            "/v1", 
            headers=headers, 
            catch_response=True,
            name="load_test_target"
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"HTTP error: {response.status_code}")
`;
    } else {
      code = `# locustfile.py v${SCRIPT_VERSION} - Locust WebSocket Load Test
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

import time
from locust import User, task, between
import websocket
import json

class WebSocketPerformanceUser(User):
    wait_time = between(1, 2)

    @task
    def test_websocket(self):
        start_time = time.time()
        try:
            ws = websocket.create_connection("${target.replace('http', 'ws')}")
            ws.send(json.dumps({"event": "ping"}))
            result = ws.recv()
            ws.close()
            
            # Record response time metrics
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="WebSocket",
                name="ping-pong",
                response_time=total_time,
                response_length=len(result),
                exception=None
            )
        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="WebSocket",
                name="ping-pong",
                response_time=total_time,
                response_length=0,
                exception=e
            )
base_user = WebSocketPerformanceUser
`;
    }
  }

  compiledCode.script = code;
}

function compileRun() {
  const tool = $('performance_tool').value;
  const target = $('performance_target').value || 'https://api.example.com/v1';

  let code = `#!/usr/bin/env bash
# run_test.sh v${SCRIPT_VERSION} - Load Test Runner script
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

echo "🚀 Initiating performance benchmark..."
`;

  if (tool === 'k6') {
    code += `
# 1. Check if k6 is installed
if ! command -v k6 &> /dev/null; then
  echo "Installing k6..."
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17DEC7239F79
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
fi

# 2. Run load test script
k6 run load_test.js
`;
  } else {
    code += `
# 1. Install Locust and WebSocket dependencies
pip install locust websocket-client

# 2. Run Locust in headless mode pointing to target
locust -f locustfile.py --headless -u 100 -r 10 --run-time 1m --host=${target}
`;
  }

  compiledCode.run = code;
}

function compileReadme() {
  const tool = $('performance_tool').value;
  const vus = $('performance_vus').value;
  const duration = $('performance_duration').value;

  let md = `# Load Testing & Performance Benchmark v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides automated load scripts to measure resource scalability boundaries.

## Configurations

- **Load Runner Engine**: ${tool.toUpperCase()}
- **Target Concurrency**: ${vus} Virtual Users
- **Load Duration**: ${duration}

## Execution

1. Deploy target application in staging.
2. Run load test executor:
   \`\`\`bash
   bash run_test.sh
   \`\`\`
3. Monitor performance dashboards (CPU, Memory, Latencies) to verify SLO boundaries.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  let md = `# SRE Runbook: Target Scalability Boundary Breached (HTTP 504 / Latency Spikes)
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Performance Degradation During Load Tests

Follow these steps if latencies spike or error rates exceed 1% threshold:

### Step 1: Check Target API Resources
Inspect memory and CPU utilization of target API servers:
\`\`\`bash
kubectl top pods -n staging
\`\`\`
If CPU utilization is > 85%, horizontal scaling is required.

### Step 2: Identify Connection pool Exhaustion
Verify database connection logs for connection drops. Under heavy concurrency, connection limits might bottle.
- Action: Scale application pool size or database read replica endpoints.

### Step 3: Stop / Abort Run
If performance degrades to a state causing cascading down-times:
1. Kill load runner process:
   \`\`\`bash
   pkill -f "${$('performance_tool').value}"
   \`\`\`
2. Verify system recovery, clear cache pools, and run diagnostics.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  VirtualUsers[👥 k6 / Locust users] -->|Inject Traffic| Host[🖥️ Target Application]\n  Host -->|Latency Stats| Collector[⚙️ Performance Metrics collector]\n  Collector -->|Assess Metrics| Validate{{SLA Breached?}}\n  Validate -->|Yes| Abort[🚨 Abort Load Test & Alert SRE]\n  Validate -->|No| Complete[✅ Performance sweep OK]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'script') {
    nameBox.value = 'load_test';
    const tool = $('performance_tool').value;
    extTag.textContent = tool === 'k6' ? '.js' : '.py';
  } else if (tabId === 'run') {
    nameBox.value = 'run_test';
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
  const tool = $('performance_tool').value;
  const zip = new JSZip();
  
  zip.file('load_test' + (tool === 'k6' ? '.js' : '.py'), compiledCode.script);
  zip.file('run_test.sh', compiledCode.run);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `performance-sre-${tool}.zip`;
    a.click();
    showToast('⬇️ Performance SRE package downloaded!');
  });
}

function clearAllFields() {
  $('performance_tool').value = 'k6';
  $('performance_proto').value = 'http';
  $('performance_vus').value = '100';
  $('performance_duration').value = '5m';
  $('performance_target').value = 'https://api.example.com/v1';

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
  const tool = $('performance_tool').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'k6': [
      {
        title: 'k6 JavaScript Benchmarks',
        why: 'Lightweight JavaScript engine based on Go, optimized for developers to run high-concurrency checks with minimal RAM usage.',
        whyNot: 'Requires Node.js integrations or learning JS scripting conventions.',
        runtime: 'Spins up light JavaScript virtual machines in parallel threads.'
      }
    ],
    'locust': [
      {
        title: 'Locust Python Tasks',
        why: 'Enables writing standard Python classes to construct request scenario logic, highly readable and modular.',
        whyNot: 'Requires Python interpreter runtimes, which can consume more memory per VU.',
        runtime: 'Leverages gevent coroutines to scale user loops.'
      }
    ]
  };

  const activeData = manualData[tool] || [];
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

  if (activeTab === 'script') {
    explanation = {
      'title': 'Performance Test Script',
      'filename': 'load_test.js',
      'why': 'Simulates virtual users querying endpoints, checking responses and status codes.',
      'when': 'Apply in staging environments before system promotions.',
      'where': 'Store in automated testing folders.',
      'command': 'k6 run load_test.js',
      'practices': ['Pin test thresholds.', 'Run tests in off-peak hours.'],
      'ai_mlops': 'Aggregates response metrics utilized by capacity planners.',
      'flow': '[Load Test script execution]'
    };
  } else if (activeTab === 'run') {
    explanation = {
      'title': 'Load Test Runner Script',
      'filename': 'run_test.sh',
      'why': 'Automates dependencies setups and runner executions.',
      'when': 'Run as pipeline steps.',
      'where': 'Save in testing repository.',
      'command': 'bash run_test.sh',
      'practices': ['Log run output files.', 'Include status checks.'],
      'ai_mlops': 'Autonomously triggered by CI security agents.',
      'flow': '[Setup dependencies] ➔ [Execute Runner]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Usage instructions Guide',
      'filename': 'README.md',
      'why': 'Deployment configurations and execution checklists.',
      'when': 'Prior to benchmark testing.',
      'where': 'Save in repository.',
      'command': '# Open in viewer',
      'practices': ['Document all baseline parameters.'],
      'ai_mlops': 'Context inputs for AI testing executors.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'High Latency Triage Playbook',
      'filename': 'sre_runbook.md',
      'why': 'Detailed incident diagnostics steps.',
      'when': 'Consult when alerts trigger during load tests.',
      'where': 'Store in wiki.',
      'command': '# Open in viewer',
      'practices': ['Establish horizontal auto-scaling rules.'],
      'ai_mlops': 'Context playbook used by AI autocompleter agents.',
      'flow': '[Incident Warning] ➔ [Scale up pods] ➔ [Investigate DB pools]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Load Test Data Flow',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram details request paths.',
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
