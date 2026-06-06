import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'script';

let compiledCode = {
  script: '',
  routing: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('gateway_type').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileScript();
  compileRouting();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileScript() {
  const type = $('gateway_type').value;
  const path = $('gateway_path').value || '/api/v1';
  const port = $('gateway_port').value || '8080';
  const rateLimit = $('gateway_rate').value;
  const auth = $('gateway_auth').value;

  let code = '';

  if (type === 'nginx') {
    code = `# nginx.conf v${SCRIPT_VERSION} - Reverse Proxy Server Block
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

limit_req_zone $binary_remote_addr zone=api_limit:10m rate=${rateLimit}r/s;

server {
    listen 80;
    server_name api.company.com;

    location ${path} {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api_backend:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SRE Custom Headers
        add_header X-Request-Time $request_time;
        add_header X-Correlation-ID $request_id;
        ${auth === 'yes' ? '\n        # Auth Verification\n        auth_request /auth-verify;' : ''}
    }
    
    ${auth === 'yes' ? 'location = /auth-verify {\n        internal;\n        proxy_pass http://auth_service:9000;\n        proxy_pass_request_body off;\n        proxy_set_header Content-Length "";\n    }' : ''}
}
`;
  } else if (type === 'traefik') {
    code = `# traefik_config.yaml v${SCRIPT_VERSION} - Traefik Dynamic Configuration
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

http:
  routers:
    api-router:
      rule: "Host(\`api.company.com\`) && PathPrefix(\`${path}\`)"
      service: api-service
      entryPoints:
        - websecure
      middlewares:
        - api-ratelimit
        ${auth === 'yes' ? '- api-auth' : ''}
      tls:
        certResolver: default

  services:
    api-service:
      loadBalancer:
        servers:
          - url: "http://api-backend-srv:${port}"

  middlewares:
    api-ratelimit:
      rateLimit:
        average: ${rateLimit}
        burst: 20
        
    ${auth === 'yes' ? 'api-auth:\n      forwardAuth:\n        address: "http://auth-service:9000/verify"\n        trustForwardHeader: true' : ''}
`;
  } else {
    // Kong API Gateway Declarative Configuration
    code = `# kong.yml v${SCRIPT_VERSION} - Kong Gateway Configuration
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

_format_version: "3.0"
services:
  - name: api-service
    url: http://api-backend-srv:${port}
    routes:
      - name: api-route
        paths:
          - ${path}
    plugins:
      - name: rate-limiting
        config:
          second: ${rateLimit}
          policy: local
      ${auth === 'yes' ? '- name: key-auth\n        config:\n          key_names: [apikey]' : ''}
`;
  }

  compiledCode.script = code;
}

function compileRouting() {
  const type = $('gateway_type').value;
  const path = $('gateway_path').value || '/api/v1';

  let code = '';

  if (type === 'nginx') {
    code = `# security_headers.conf v${SCRIPT_VERSION} - Nginx Security Headers
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self';" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
`;
  } else if (type === 'traefik') {
    code = `# ingress_route.yaml v${SCRIPT_VERSION} - Kubernetes IngressRoute CRD
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: api-ingress-route
  namespace: production
spec:
  entryPoints:
    - web
  routes:
    - match: Host(\`api.company.com\`) && PathPrefix(\`${path}\`)
      kind: Rule
      services:
        - name: api-backend-service
          port: 80
`;
  } else {
    code = `# kong_headers.json v${SCRIPT_VERSION} - Kong Request Transformer plugin settings
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
{
  "name": "request-transformer",
  "config": {
    "add": {
      "headers": ["X-SRE-Telemetry: active"]
    }
  }
}
`;
  }

  compiledCode.routing = code;
}

function compileReadme() {
  const type = $('gateway_type').value;
  const path = $('gateway_path').value || '/api/v1';

  let md = `# API Gateway & Reverse Proxy Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides optimized configuration setups, security headers configurations, and routing policies for reverse proxies.

## Configuration Details

- **Gateway Platform**: ${type.toUpperCase()}
- **Base Routing Path**: \`${path}\`
- **Target Backend Port**: ${$('gateway_port').value || '8080'}

## Setup Operations

1. Deploy target configurations inside server config files directory.
2. Reload proxy engine gracefully to compile rules:
   - For Nginx: \`nginx -s reload\`
   - For Traefik/Kong: Apply configurations declaratively or trigger hot-reload admin APIs.
3. Validate connection routes and rate-limiting behaviors.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const type = $('gateway_type').value;

  let md = `# SRE Runbook: API Gateway Failure Triage (ERR_502_BAD_GATEWAY / ERR_504_TIMEOUT)
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: HTTP 502/504 errors on routing endpoints

Follow this failover checklist if proxy endpoints drop:

### Step 1: Inspect Server Status
Confirm gateway engine processes are operational:
- For Nginx:
  \`\`\`bash
  sudo systemctl status nginx
  \`\`\`
- For Traefik / Kong inside Kubernetes:
  \`\`\`bash
  kubectl get pods -n ingress-controllers
  \`\`\`

### Step 2: Validate Target Backends connectivity
Check if gateway proxy can reach the internal backend port:
\`\`\`bash
nc -zv backend-service-name ${$('gateway_port').value || '8080'}
\`\`\`
If socket connection times out, locate failures in target microservices.

### Step 3: Audit Routing logs
Inspect log files for trace exceptions:
- Nginx: \`/var/log/nginx/error.log\`
- Traefik/Kong stdout logs:
  \`\`\`bash
  kubectl logs -f deployment/gateway-controller -n ingress-controllers
  \`\`\`

### Step 4: Mitigate Rate Limit breaches
If 429 Too Many Requests spike:
1. Verify IP ranges causing traffic congestion.
2. Temporarily adjust limit thresholds configuration.
3. Reload proxy instances.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Traffic[🚦 Client Traffic] -->|Route| Nginx[🚦 Nginx Ingress / Traefik]\n  Nginx -->|Rate Limiter| Limit{{Rate Limit Exceeded?}}\n  Limit -->|Yes| Block[🚫 429 Too Many Requests]\n  Limit -->|No| Service[🚀 Backend Microservices]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  const type = $('gateway_type').value;

  if (tabId === 'script') {
    if (type === 'nginx') {
      nameBox.value = 'nginx';
      extTag.textContent = '.conf';
    } else if (type === 'traefik') {
      nameBox.value = 'traefik_config';
      extTag.textContent = '.yaml';
    } else {
      nameBox.value = 'kong';
      extTag.textContent = '.yml';
    }
  } else if (tabId === 'routing') {
    if (type === 'nginx') {
      nameBox.value = 'security_headers';
      extTag.textContent = '.conf';
    } else if (type === 'traefik') {
      nameBox.value = 'ingress_route';
      extTag.textContent = '.yaml';
    } else {
      nameBox.value = 'kong_headers';
      extTag.textContent = '.json';
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
  const type = $('gateway_type').value;
  const zip = new JSZip();

  const scriptName = type === 'nginx' ? 'nginx.conf' : (type === 'traefik' ? 'traefik_config.yaml' : 'kong.yml');
  const routingName = type === 'nginx' ? 'security_headers.conf' : (type === 'traefik' ? 'ingress_route.yaml' : 'kong_headers.json');
  
  zip.file(scriptName, compiledCode.script);
  zip.file(routingName, compiledCode.routing);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `api-gateway-sre-${type}.zip`;
    a.click();
    showToast('⬇️ API Gateway SRE package downloaded!');
  });
}

function clearAllFields() {
  $('gateway_type').value = 'nginx';
  $('gateway_path').value = '/api/v1';
  $('gateway_port').value = '8080';
  $('gateway_rate').value = '10';
  $('gateway_auth').value = 'no';

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
  const type = $('gateway_type').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'nginx': [
      {
        title: 'Nginx Rate Limiting and Proxies',
        why: 'Protects backend clusters from request flood congestion and mitigates Denial of Service (DoS) risks.',
        whyNot: 'Direct connection exposures can saturate server processes and take down target databases.',
        runtime: 'Injects limit request configurations in server contexts.'
      }
    ],
    'traefik': [
      {
        title: 'Traefik Dynamic Routing Middlewares',
        why: 'Allows cloud-native automated route detection and dynamic header manipulation.',
        whyNot: 'Requires static configurations restarts which drop active sessions.',
        runtime: 'Evaluates dynamic rule matches.'
      }
    ],
    'kong': [
      {
        title: 'Kong Declarative Gateway Plugins',
        why: 'Centralizes OAuth verification and plugin-based rate-limits management in docker/k8s nodes.',
        whyNot: 'Requires developers to implement auth/rate limits checks locally inside every code repository.',
        runtime: 'Kong API gateway routes validation.'
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
  const type = $('gateway_type').value;

  if (activeTab === 'script') {
    explanation = {
      'title': 'Gateway Routing Config',
      'filename': type === 'nginx' ? 'nginx.conf' : (type === 'traefik' ? 'traefik_config.yaml' : 'kong.yml'),
      'why': 'Configures primary gateway reverse proxy targets and rate limiting constraints.',
      'when': 'Deploying new microservices or setting traffic boundaries.',
      'where': 'Deploy as gateway settings or dynamic route files.',
      'command': type === 'nginx' ? 'nginx -t && nginx -s reload' : '# Dynamic hot-reload',
      'practices': ['Validate configurations syntax before reloading.', 'Always check backend port listener bindings.'],
      'ai_mlops': 'Exposes local LLM/RAG backend servers to client requests safely.',
      'flow': '[Forward proxy sequence]'
    };
  } else if (activeTab === 'routing') {
    explanation = {
      'title': 'Security Headers config',
      'filename': type === 'nginx' ? 'security_headers.conf' : (type === 'traefik' ? 'ingress_route.yaml' : 'kong_headers.json'),
      'why': 'Applies security restrictions to HTTP response headers to block cross-site scripting (XSS) and frames hijack.',
      'when': 'On setup of production routing paths.',
      'where': 'Apply inside HTTP responses or gateway middleware parameters.',
      'command': '# Configured inside routing engines',
      'practices': ['Use strict Content-Security-Policy limits.', 'Validate headers using curl -I.'],
      'ai_mlops': 'Ensures frontend clients communicate securely with model APIs.',
      'flow': '[Verify secure headers]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Setup Instructions Manual',
      'filename': 'README.md',
      'why': 'Provides installation dependencies and deployment verification instructions.',
      'when': 'Prior to setting up proxy configurations.',
      'where': 'Save in config root folder.',
      'command': '# Open in viewer',
      'practices': ['Pin proxy versions.'],
      'ai_mlops': 'Context manuals.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Timeout Triage Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Playbook to resolve HTTP 502 Bad Gateway and 504 Gateway Timeout errors.',
      'when': 'Triggered on gateway connection alarm triggers.',
      'where': 'Store in SRE operations repository.',
      'command': '# Review troubleshooting commands within document',
      'practices': ['Inspect target socket connectivity first.', 'Monitor rate limit violation counts.'],
      'ai_mlops': 'Used by self-healing monitors to restore connection channels.',
      'flow': '[Route failure] ➔ [Test backend socket] ➔ [Mitigate / Adjust limits]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Request Propagation Flow',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram details path routing and rate checks.',
      'when': 'During design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all fallback/timeout behaviors.'],
      'ai_mlops': 'Validation blueprint.',
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

window.closeExplanationDrawer = closeExplanationDrawer;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
