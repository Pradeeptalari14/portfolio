import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'routing';

let compiledCode = {
  routing: '',
  gateway: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('mesh_platform').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileRouting();
  compileGateway();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileRouting() {
  const platform = $('mesh_platform').value;
  const strategy = $('mesh_strategy').value;
  const retries = $('mesh_retries').value;
  const timeout = $('mesh_timeout').value;

  let code = '';

  if (platform === 'istio') {
    if (strategy === 'canary') {
      code = `# canary_routing.yaml v${SCRIPT_VERSION}
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: payment-api-routes
  namespace: production
spec:
  hosts:
    - payment-api
  http:
    - route:
        - destination:
            host: payment-api
            subset: v1
          weight: 90
        - destination:
            host: payment-api
            subset: v2
          weight: 10
      retries:
        attempts: ${retries}
        perTryTimeout: '${timeout}s'
`;
    } else if (strategy === 'breaker') {
      code = `# circuit_breaker.yaml v${SCRIPT_VERSION}
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: payment-api-circuit-breaker
  namespace: production
spec:
  host: payment-api
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
        maxRequestsPerConnection: 10
    outlierDetection:
      consecutive5xxErrors: 3
      interval: 10s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
`;
    } else {
      // mTLS Egress Lockdown
      code = `# mtls_lockdown.yaml v${SCRIPT_VERSION}
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default-mtls-lockdown
  namespace: production
spec:
  mtls:
    mode: STRICT
`;
    }
  } else {
    // Linkerd
    if (strategy === 'canary') {
      code = `# linkerd_traffic_split.yaml v${SCRIPT_VERSION}
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
metadata:
  name: payment-api-split
  namespace: production
spec:
  service: payment-api
  backends:
    - service: payment-api-v1
      weight: 90
    - service: payment-api-v2
      weight: 10
`;
    } else if (strategy === 'breaker') {
      code = `# linkerd_service_profile.yaml v${SCRIPT_VERSION}
apiVersion: linkerd.io/v1alpha2
kind: ServiceProfile
metadata:
  name: payment-api.production.svc.cluster.local
  namespace: production
spec:
  routes:
    - name: GET /payments
      condition:
        method: GET
        pathRegex: /payments
      responseClasses:
        - condition:
            status:
              min: 500
              max: 599
          isFailure: true
`;
    } else {
      code = `# linkerd_mtls.yaml v${SCRIPT_VERSION}
# Linkerd enables mTLS automatically out-of-the-box
# for all meshed pod-to-pod communications.
apiVersion: policy.linkerd.io/v1beta1
kind: Server
metadata:
  name: payment-api-server
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: payment-api
  port: 8080
  proxyProtocol: HTTP/1
`;
    }
  }

  compiledCode.routing = code;
}

function compileGateway() {
  const platform = $('mesh_platform').value;
  let code = '';

  if (platform === 'istio') {
    code = `# ingress_gateway.yaml v${SCRIPT_VERSION}
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: production-gateway
  namespace: production
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 80
        name: http
        protocol: HTTP
      hosts:
        - "api.sre-operations.internal"
`;
  } else {
    code = `# linkerd_ingress.yaml v${SCRIPT_VERSION}
# Linkerd leverages standard ingress controllers (like NGINX/Emissary)
# injected with the linkerd-proxy sidecar.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-ingress-controller
  namespace: kube-system
spec:
  template:
    metadata:
      annotations:
        linkerd.io/inject: enabled
`;
  }

  compiledCode.gateway = code;
}

function compileReadme() {
  const platform = $('mesh_platform').value;
  let md = `# SRE Service Mesh Traffic Controller v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This package provides service mesh configurations to manage microservice routing, resilience, and security.

## Setup Instructions

### Platform: ${platform.toUpperCase()}
1. Verify the service mesh operator is active in the cluster.
2. Deploy the traffic routing rule manifests:
   \`\`\`bash
   kubectl apply -f traffic_routing.yaml
   \`\`\`
3. If using gateways, deploy the ingress rule:
   \`\`\`bash
   kubectl apply -f gateway.yaml
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const strategy = $('mesh_strategy').value;

  let md = `# SRE Runbook: Service Mesh Incident Triage
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Service Mesh Anomalies

### Scenario: Circuit Breaker Trips (HTTP 503)
If services return \`503 Service Unavailable\` due to circuit breaker trip:
1. **Audit Outlier metrics**: Identify which replica instances are being ejected.
   \`\`\`bash
   kubectl get pods -l app=payment-api -o wide
   \`\`\`
2. **Review Connection Pools**: If the pool limits are exceeded, adjust limits temporarily:
   - Increase \`maxConnections\` or \`http1MaxPendingRequests\`.
3. **Verify Downstream services**: Ensure downstream database or API dependencies are not experiencing latency.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Traffic[🚦 External Request] -->|Gateway| Ingress[🕸️ Istio Ingress Gateway]\n  Ingress -->|Sidecar Proxy| Envoy[🕸️ Envoy Proxy Sidecar]\n  Envoy -->|mTLS Handshake| Target[🚀 Target Microservices]\n  Envoy -->|SLA Telemetry| Prom[📈 Prometheus Metrics]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'routing') {
    nameBox.value = 'traffic_routing';
    extTag.textContent = '.yaml';
  } else if (tabId === 'gateway') {
    nameBox.value = 'gateway';
    extTag.textContent = '.yaml';
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
  const platform = $('mesh_platform').value;
  const zip = new JSZip();
  
  zip.file('traffic_routing.yaml', compiledCode.routing);
  zip.file('gateway.yaml', compiledCode.gateway);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mesh-sre-${platform}.zip`;
    a.click();
    showToast('⬇️ Service Mesh package downloaded!');
  });
}

function clearAllFields() {
  $('mesh_platform').value = 'istio';
  $('mesh_strategy').value = 'canary';
  $('mesh_retries').value = '3';
  $('mesh_timeout').value = '2';

  switchTab('routing');
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
  const platform = $('mesh_platform').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'istio': [
      {
        title: 'VirtualService Canary routing rules',
        why: 'Splits requests across versions cleanly for safe validation sweeps.',
        whyNot: 'Requires binary blue-green switchovers, heightening outage risk.',
        runtime: 'Managed by Envoy sidecars intercepting K8s services endpoints.'
      }
    ],
    'linkerd': [
      {
        title: 'Linkerd TrafficSplit specifications',
        why: 'Implements service-to-service routing weight maps.',
        whyNot: 'Makes rolling traffic upgrades hard to automate.',
        runtime: 'Managed by Linkerd-proxy endpoints resolution.'
      }
    ]
  };

  const activeData = manualData[platform] || [];
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

  if (activeTab === 'routing') {
    explanation = {
      'title': 'Service Mesh Traffic Routing Rules',
      'filename': 'traffic_routing.yaml',
      'why': 'Defines Canary traffic splits or circuit breaker thresholds.',
      'when': 'Apply when publishing microservice updates.',
      'where': 'Deploy in clusters where mesh sidecars are active.',
      'command': 'kubectl apply -f traffic_routing.yaml',
      'practices': ['Pin down subset labels.', 'Audit connection parameters.'],
      'ai_mlops': 'Used by canary agents to verify rollout steps.',
      'flow': '[Traffic Routing Manifest]'
    };
  } else if (activeTab === 'gateway') {
    explanation = {
      'title': 'Ingress / Egress Gateway Config',
      'filename': 'gateway.yaml',
      'why': 'Configures edge host ports and protocols allowed in mesh topologies.',
      'when': 'Deploy during environment onboarding phases.',
      'where': 'Deploy in system namespace.',
      'command': 'kubectl apply -f gateway.yaml',
      'practices': ['Enforce HTTP/2 or HTTPS.', 'Restrict ingress targets.'],
      'ai_mlops': 'Defines external entry interfaces for telemetry check bots.',
      'flow': '[Gateway Configuration]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Mesh Setup Checklist',
      'filename': 'README.md',
      'why': 'Prerequisites and setup workflow details.',
      'when': 'Review prior to configuration rollout.',
      'where': 'Save in repository.',
      'command': '# Open in viewer',
      'practices': ['Confirm mesh sidecar injection is active.'],
      'ai_mlops': 'Instructions for setup verification.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Mesh Anomalies Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Triage guide for circuit breaker ejections and gateway timeouts.',
      'when': 'Review when 503 Service Unavailable rates spike.',
      'where': 'Save in wiki.',
      'command': '# Open in viewer',
      'practices': ['Document error limits clearly.'],
      'ai_mlops': 'Provides automation agents context on circuit metrics.',
      'flow': '[503 spike] ➔ [Identify ejected pods] ➔ [Scale connection pool] ➔ [Verify downstream]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Envoy Routing Flows',
      'filename': 'flow.mermaid',
      'why': 'Maps proxy path handshakes.',
      'when': 'Consult during architecture design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map egress security boundaries.'],
      'ai_mlops': 'Validation blueprint for mesh telemetry scrapers.',
      'flow': '[Mermaid Canvas Routing Topologies]'
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
