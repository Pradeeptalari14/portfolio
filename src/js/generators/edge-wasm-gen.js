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
  $('wasm_framework').addEventListener('change', triggerCompileAll);
  $('wasm_lang').addEventListener('change', triggerCompileAll);
  $('edge_provider').addEventListener('change', triggerCompileAll);
  $('latency_budget').addEventListener('input', triggerCompileAll);

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
  const framework = $('wasm_framework').value;
  const provider = $('edge_provider').value;

  let code = '';

  if (framework === 'spin') {
    code = `spin_manifest_version = "2"
project = { name = "edge-wasm-service", version = "0.1.0", description = "Serverless WASM Route Handler" }

[[trigger.http]]
route = "/..."
component = "handler"

[component.handler]
source = "target/wasm32-wasi/release/handler.wasm"
allowed_outbound_hosts = ["http://api.production-db.svc.cluster.local:8080"]
metadata = { version = "v${SCRIPT_VERSION}", author = "Talari Pradeep", copyright = "Copyright (c) 2026 Talari Pradeep. All Rights Reserved." }
`;
  } else {
    // wrangler
    code = `# wrangler.toml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
name = "edge-wasm-worker"
main = "build/worker.js"
compatibility_date = "2026-06-04"

[wasm_modules]
HANDLER_WASM = "target/wasm32-unknown-unknown/release/handler.wasm"

[vars]
ENVIRONMENT = "production"
LATENCY_LIMIT = "50ms"
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const lang = $('wasm_lang').value;
  const budget = parseInt($('latency_budget').value) || 50;

  let code = '';

  if (lang === 'rust') {
    code = `// main.rs v${SCRIPT_VERSION}
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
// Rust WASM Request Handler for ultra-low latency edge routing

use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;

#[http_component]
fn handle_request(req: Request) -> anyhow::Result<impl IntoResponse> {
    let start_time = std::time::Instant::now();
    
    // Extract query parameters
    let path = req.header("spin-path-info").map(|h| h.as_str().unwrap_or("")).unwrap_or("");
    println!("Intercepted edge request for path: {}", path);
    
    // SLA Latency Budget Check: ${budget}ms
    let elapsed = start_time.elapsed().as_millis();
    if elapsed > ${budget} {
        eprintln!("🚨 SLA Alert: Request latency is {}ms, budget limit of ${budget}ms exceeded!", elapsed);
    }

    Ok(Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .header("x-edge-latency", &format!("{}ms", elapsed))
        .body("{\\"status\\": \\"success\\", \\"message\\": \\"WASM Edge payload processed successfully\\"}")
        .build())
}
`;
  } else {
    // go
    code = `package main
// main.go v${SCRIPT_VERSION}
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
// Go WebAssembly edge serverless service handler

import (
	"fmt"
	"net/http"
	"time"

	spin "github.com/fermyon/spin/sdk/go/v2/http"
)

func init() {
	spin.Handle(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()
		
		// Setup response headers
		w.Header().Set("Content-Type", "application/json")
		
		elapsed := time.Since(startTime).Milliseconds()
		// SLA Latency Budget Check: ${budget}ms
		if elapsed > ${budget} {
			fmt.Printf("🚨 SLA Warning: Latency target missed: %d ms (Target: ${budget} ms)\\n", elapsed)
		}
		
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(\`{"status":"success","latency":"%dms"}\`, elapsed)))
	})
}

func main() {}
`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const framework = $('wasm_framework').value;
  const lang = $('wasm_lang').value;

  let md = `# Edge WASM & Serverless Orchestration Studio v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Scaffold and compile high-performance WebAssembly edge microservices. Enforce latency SLA budgets and deployment packaging rules with cold-start times below 1ms.

## Pre-requisites
- **Runtime Toolchain**: WASI SDK, Cargo Rust toolchain (for Rust) or Go TinyGo compiler (for Go).
- **Framework**: ${framework.toUpperCase()}

## Quick Start
`;

  if (framework === 'spin') {
    md += `1. Install Fermyon Spin CLI:
   \`\`\`bash
   curl -fsSL https://developer.fermyon.com/downloads/install.sh | bash
   \`\`\`
2. Build the WASM executable:
   \`\`\`bash
   spin build
   \`\`\`
3. Test locally:
   \`\`\`bash
   spin up
   \`\`\`
`;
  } else {
    md += `1. Install Wrangler CLI:
   \`\`\`bash
   npm install -g wrangler
   \`\`\`
2. Build the WASM module:
   \`\`\`bash
   cargo build --target wasm32-unknown-unknown --release
   \`\`\`
3. Publish to Cloudflare Workers:
   \`\`\`bash
   wrangler publish
   \`\`\`
`;
  }

  compiledCode.readme = md;
}

function compileRunbook() {
  const budget = parseInt($('latency_budget').value) || 50;

  let md = `# SRE Runbook: Edge WASM Execution Latency Spikes
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: WASM Edge request processing exceeds latency budget (> ${budget}ms)

When distributed edge gateways report high latency:

### Step 1: Differentiate between Cold Starts and Hot Paths
Analyze execution logs inside edge dashboards:
- Cold starts (module initialization) should remain < 2ms.
- If delay is on hot paths, review outbound HTTP socket calls:
  \`\`\`bash
  # Check connection counts to remote backends
  curl -I https://api.production-db.svc.cluster.local:8080/health
  \`\`\`

### Step 2: Validate Memory Allocations
If WASM modules panic due to memory shortages:
1. Verify if cargo dependencies are importing heavy libraries.
2. Recompile with compiler optimization flags (\`-O\` / \`-Oz\`).

### Step 3: Emergency Failover
If edge zones drop availability:
- Redirect traffic routes at DNS / CDN load balancer layer to fallback containerized API clusters.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Traffic[🚦 Client Traffic] -->|Route| Edge[🌐 Edge WebAssembly Sandbox]\n  Edge -->|Rust/Go handlers| Exec[⚙️ WASI Serverless Runtime]\n  Exec -->|Fast Query| Database[(🗄️ Edge KV Storage)]\n  Exec -->|SLA Latency check| Alert[🚨 SLA Outlier Alert]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const framework = $('wasm_framework').value;
  const lang = $('wasm_lang').value;

  if (tabId === 'config') {
    if (framework === 'spin') {
      nameBox.value = 'spin';
      extTag.textContent = '.toml';
    } else {
      nameBox.value = 'wrangler';
      extTag.textContent = '.toml';
    }
  } else if (tabId === 'instrument') {
    if (lang === 'rust') {
      nameBox.value = 'main';
      extTag.textContent = '.rs';
    } else {
      nameBox.value = 'main';
      extTag.textContent = '.go';
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
  const framework = $('wasm_framework').value;
  const lang = $('wasm_lang').value;
  const zip = new JSZip();

  const file1 = framework === 'spin' ? 'spin.toml' : 'wrangler.toml';
  const file2 = lang === 'rust' ? 'main.rs' : 'main.go';

  zip.file(file1, compiledCode.config);
  zip.file(file2, compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `edge-wasm-orchestration.zip`;
    a.click();
    showToast('⬇️ Edge WASM SRE package downloaded!');
  });
}

function clearAllFields() {
  $('wasm_framework').value = 'spin';
  $('wasm_lang').value = 'rust';
  $('edge_provider').value = 'kwasm';
  $('latency_budget').value = '50';

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
  const framework = $('wasm_framework').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'spin': [
      {
        title: 'Fermyon Spin WebAssembly Framework',
        why: 'Utilizes standardized WASI triggers to instantly run microservices upon HTTP request receipt, eliminating idle compute costs.',
        whyNot: 'Requires deploying additional runtime components, increasing overall ops maintenance loads.',
        runtime: 'Listens on TCP sockets and runs compiled WASM binaries JIT.'
      },
      {
        title: 'Allowed Outbound Hosts Policies',
        why: 'Locks down outbound networking requests inside the sandbox to prevent data exfiltration loops.',
        whyNot: 'Leaves WASM components free to execute traffic hijacking routines.',
        runtime: 'Enforces security sandbox boundaries inside the runtime engine.'
      }
    ],
    'cloudflare': [
      {
        title: 'Cloudflare Workers Edge WASM Runtimes',
        why: 'Deploys modules directly to V8 isolate nodes around the world, minimizing network routing latency.',
        whyNot: 'Ties your pipeline strictly to Cloudflare cloud infrastructures APIs and configurations.',
        runtime: 'Loads compiled WASM buffers into V8 isolate thread contexts.'
      }
    ]
  };

  const activeData = manualData[framework] || [];
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
  const framework = $('wasm_framework').value;
  const lang = $('wasm_lang').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'Serverless WASM Configuration',
      'filename': framework === 'spin' ? 'spin.toml' : 'wrangler.toml',
      'why': 'Declares component bindings, triggers HTTP routes, and secures outbound backend network routes.',
      'when': 'Audit gateway rules or register fresh route entry points.',
      'where': 'Save in repository project root directory.',
      'command': framework === 'spin' ? 'spin build' : 'wrangler publish',
      'practices': ['Pin allowed outbound hosts to target destination endpoints.', 'Keep compatibility dates synchronized.'],
      'ai_mlops': 'Used to orchestrate lightweight, distributed token filters and model router layers at the edge.',
      'flow': '[Read manifest settings] ➔ [Register routes] ➔ [Lock constraints]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'WebAssembly Source code',
      'filename': lang === 'rust' ? 'main.rs' : 'main.go',
      'why': 'Implements low-latency request handler logic and tracks compliance with SLA budgets.',
      'when': 'Modify when updating edge routing algorithms or request processing rules.',
      'where': 'Compiled to target wasm32 assembly.',
      'command': lang === 'rust' ? 'cargo build --target wasm32-wasi' : 'tinygo build -o handler.wasm -target=wasi',
      'practices': ['Avoid allocating heavy heap objects to ensure hot paths speed.', 'Keep logging minimal.'],
      'ai_mlops': 'Runs fast feature pre-processing and tokens auditing directly at client ingestion points.',
      'flow': '[Receive raw request] ➔ [Execute logic checks] ➔ [Return JSON header response]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Developer Onboarding Guide',
      'filename': 'README.md',
      'why': 'Outlines local installation steps and compile chains instructions.',
      'when': 'Review when bootstrapping developer work environments.',
      'where': 'Store in project repository root.',
      'command': '# View README.md',
      'practices': ['Explicitly version compile toolchains to ensure build reproducibility.'],
      'ai_mlops': 'Developer pipeline guide.',
      'flow': '[README.md]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Latency Outlier Mitigation Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Guides operators on triaging response latency breaches and hot path timeouts.',
      'when': 'Consult when edge metric alarms trigger SLA violations.',
      'where': 'Add to company runbooks portal.',
      'command': '# Access SRE portal',
      'practices': ['Leverage CDN DNS fallbacks to redirect around failing edge nodes.', 'Track cold starts counts.'],
      'ai_mlops': 'Remediates performance blocks in model inference pipeline layers.',
      'flow': '[Latency Breached Alert] ➔ [Isolate Cold Start vs Connection Timeout] ➔ [Divert Traffic]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Edge WASM Ingestion Loop',
      'filename': 'flow.mermaid',
      'why': 'Models request lifetimes from clients to backends.',
      'when': 'Review during network architecture planning.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Enforce that sandbox spin-up costs remain below 1ms.'],
      'ai_mlops': 'Visual representation of edge token routing setups.',
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
