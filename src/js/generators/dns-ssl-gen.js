import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'script';

let compiledCode = {
  script: '',
  dns: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('dns_provider').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileScript();
  compileDns();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileScript() {
  const provider = $('dns_provider').value;
  const client = $('dns_client').value;
  const domain = $('dns_domain').value || 'example.com';

  let code = `#!/usr/bin/env bash
# renew_certs.sh v${SCRIPT_VERSION} - ACME Certificate Renewal Script
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

echo "🔒 Initiating ACME Let's Encrypt renewal for: ${domain}..."
`;

  if (client === 'certbot') {
    code += `
# 1. Install Certbot client if not available
if ! command -v certbot &> /dev/null; then
  echo "Installing certbot client..."
  sudo apt-get update && sudo apt-get install -y certbot
fi

# 2. Trigger cert renewal using DNS authentication
certbot certonly \\
  --manual \\
  --preferred-challenges=dns \\
  --email admin@${domain} \\
  --agree-tos \\
  -d ${domain} \\
  -d *.${domain}
`;
  } else {
    // Lego (Go ACME Client)
    code += `
# 1. Install Lego binary if not available
if ! command -v lego &> /dev/null; then
  echo "Downloading Lego client..."
  curl -sfL https://raw.githubusercontent.com/go-acme/lego/master/install.sh | sh
fi

# 2. Renew cert via Lego DNS challenge
lego --email="admin@${domain}" --dns="${provider}" --domains="${domain}" run
`;
  }

  compiledCode.script = code;
}

function compileDns() {
  const provider = $('dns_provider').value;
  const domain = $('dns_domain').value || 'example.com';

  let code = '';

  if (provider === 'route53') {
    code = `{
  "Comment": "dns_config.json v${SCRIPT_VERSION} - Route53 DNS validation TXT record",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "_acme-challenge.${domain}.",
        "Type": "TXT",
        "TTL": 60,
        "ResourceRecords": [
          {
            "Value": "\\"TXT_VERIFICATION_TOKEN_FROM_ACME\\""
          }
        ]
      }
    }
  ]
}
`;
  } else {
    // Cloudflare
    code = `# dns_config.json v${SCRIPT_VERSION} - Cloudflare DNS API request schema
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
{
  "type": "TXT",
  "name": "_acme-challenge.${domain}",
  "content": "TXT_VERIFICATION_TOKEN_FROM_ACME",
  "ttl": 120,
  "proxied": false
}
`;
  }

  compiledCode.dns = code;
}

function compileReadme() {
  const provider = $('dns_provider').value;
  const domain = $('dns_domain').value || 'example.com';

  let md = `# DNS & SSL PKI Automation Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides automated ACME challenges scripts and DNS verification schemas.

## Configuration Details

- **Target Domain**: \`${domain}\`
- **ACME Client**: ${$('dns_client').value.toUpperCase()}
- **DNS Provider**: ${provider.toUpperCase()}

## How to Apply

1. Configure DNS provider API secrets.
2. Execute the certificate renew runner:
   \`\`\`bash
   bash renew_certs.sh
   \`\`\`
3. Verify newly generated SSL files:
   - Certificate path: \`/etc/letsencrypt/live/${domain}/fullchain.pem\`
   - Private key path: \`/etc/letsencrypt/live/${domain}/privkey.pem\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const domain = $('dns_domain').value || 'example.com';

  let md = `# SRE Runbook: SSL Certificate Expiry Triage & Renewal Gaps
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: SSL Handshake Error (ERR_CERT_DATE_INVALID)

Follow these steps if certificate expires or fails to renew:

### Step 1: Check Domain Expiration Status
Inspect active domain certificate expiry dates:
\`\`\`bash
curl -Iv https://${domain} 2>&1 | grep -i 'expire date'
\`\`\`

### Step 2: Validate DNS ACME Records
Verify if the ACME verification TXT record is visible globally:
\`\`\`bash
dig txt _acme-challenge.${domain} +short
\`\`\`

### Step 3: Emergency Certificate Renewal
If automated certbot cron jobs failed due to lock issues:
1. Stop port-binding reverse proxy servers temporarily (e.g. Nginx/Apache):
   \`\`\`bash
   sudo systemctl stop nginx
   \`\`\`
2. Force renew standalone certificate:
   \`\`\`bash
   certbot renew --force-renewal
   \`\`\`
3. Restart proxy servers and audit website connectivity.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Cron[🕒 Certbot Cron Trigger] -->|DNS Challenge| DNS[🌐 Route53 / Cloudflare]\n  DNS -->|Verify Ownership| ACME[🛡️ Let\'s Encrypt ACME API]\n  ACME -->|Issue Cert| Keystore[🔑 Renewed SSL Certificate]\n  Keystore -->|Reload| Proxy[🚦 Nginx / Traefik Proxy]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'script') {
    nameBox.value = 'renew_certs';
    extTag.textContent = '.sh';
  } else if (tabId === 'dns') {
    nameBox.value = 'dns_config';
    extTag.textContent = '.json';
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
  const domain = $('dns_domain').value || 'example.com';
  const zip = new JSZip();
  
  zip.file('renew_certs.sh', compiledCode.script);
  zip.file('dns_config.json', compiledCode.dns);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dns-ssl-sre-${domain}.zip`;
    a.click();
    showToast('⬇️ DNS/SSL SRE package downloaded!');
  });
}

function clearAllFields() {
  $('dns_provider').value = 'route53';
  $('dns_client').value = 'certbot';
  $('dns_domain').value = 'example.com';

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
  const provider = $('dns_provider').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'route53': [
      {
        title: 'Route53 DNS API Authentication',
        why: 'Enables automatic insertion of verification TXT records inside AWS Route53 hosted zones.',
        whyNot: 'Requires manual setup of Route53 records every 90 days for SSL certificate renewals.',
        runtime: 'Uses AWS SDK to update DNS records set.'
      }
    ],
    'cloudflare': [
      {
        title: 'Cloudflare DNS API integration',
        why: 'Integrates with Cloudflare REST API to trigger ACME DNS challenge verifications automatically.',
        whyNot: 'Requires standard HTTP webroot challenges, which expose the target server ports.',
        runtime: 'Posts API tokens payloads.'
      }
    ]
  };

  const activeData = manualData[provider] || [];
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
      'title': 'ACME Renewal Script',
      'filename': 'renew_certs.sh',
      'why': 'Automates verification and triggers Let\'s Encrypt certificates download.',
      'when': 'Run as system cron task every 60 days.',
      'where': 'Deploy on server gateway or delivery node.',
      'command': 'bash renew_certs.sh',
      'practices': ['Validate certificate expiry alerts.', 'Use wildcards domains configurations.'],
      'ai_mlops': 'Used by SRE agents to manage web endpoints certificates.',
      'flow': '[Let\'s Encrypt Challenge Execution]'
    };
  } else if (activeTab === 'dns') {
    explanation = {
      'title': 'DNS Challenge Record Schema',
      'filename': 'dns_config.json',
      'why': 'Provides configuration JSON payload used by Route53/Cloudflare APIs to update TXT records.',
      'when': 'Executed by certbot/lego scripts during renewals.',
      'where': 'Exposed temporarily to complete DNS challenges.',
      'command': '# Posted via client HTTP request',
      'practices': ['Maintain minimum TTL settings to speed up validation loops.', 'Limit API token scopes.'],
      'ai_mlops': 'Used by DNS controllers to manage validation rules.',
      'flow': '[Load DNS challenge configuration]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Cert Setup Guide',
      'filename': 'README.md',
      'why': 'Details directories permissions and renewal automation setup.',
      'when': 'Consult when configuring certbot client settings.',
      'where': 'Save in certificates root folders.',
      'command': '# Open in viewer',
      'practices': ['Document target certificate paths.'],
      'ai_mlops': 'Setup context guides.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Expiry Triage Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Playbook to resolve renewal failures and ERR_CERT errors.',
      'when': 'Consult when domain certificates expire.',
      'where': 'Store in SRE Wiki.',
      'command': '# Open in viewer',
      'practices': ['Validate DNS lookup propagation before forcing renewals.'],
      'ai_mlops': 'Autonomously executed by self-healing agents.',
      'flow': '[TLS Error] ➔ [TXT check] ➔ [Force standalone certbot renew]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'ACME Verification Flow',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram details cert validation steps.',
      'when': 'During design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all components limits.'],
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
