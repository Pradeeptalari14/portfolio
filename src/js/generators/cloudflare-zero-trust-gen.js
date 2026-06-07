// Cloudflare Zero Trust & Tunneling Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initCloudflareZeroTrustStudio() {
  const elements = {
    tunnelName: document.getElementById('cf_tunnel_name'),
    domain: document.getElementById('cf_domain'),
    localService: document.getElementById('cf_local_service'),
    emailDomains: document.getElementById('cf_email_domains'),
    mfa: document.getElementById('cf_mfa'),
    deviceChecks: document.getElementById('cf_device_checks'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-cf'),
    btnDownload: document.getElementById('btn-download-cf'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'cf_config';
  let compiledCode = {
    cf_config: '',
    cf_sh: '',
    cf_json: '',
    cf_flow: ''
  };

  function compileConfigs() {
    const tunnel = elements.tunnelName ? elements.tunnelName.value : 'prod-k8s-tunnel';
    const dom = elements.domain ? elements.domain.value : 'sre.talari.com';
    const local = elements.localService ? elements.localService.value : 'http://localhost:8080';
    const emailCsv = elements.emailDomains ? elements.emailDomains.value : 'talari.com';
    const runMfa = elements.mfa ? elements.mfa.checked : true;
    const runPosture = elements.deviceChecks ? elements.deviceChecks.checked : true;

    // 1. Compile config.yml
    let config = `tunnel: 4e9f73a4-84bf-4f24-9b24-9b24bcf392b4\n`;
    config += `credentials-file: /root/.cloudflared/4e9f73a4-84bf-4f24-9b24-9b24bcf392b4.json\n\n`;
    config += `ingress:\n`;
    config += `  - hostname: ${dom}\n`;
    config += `    service: ${local}\n`;
    config += `  - service: http_status:404\n`;
    compiledCode.cf_config = config;

    // 2. Compile cloudflared-service.sh
    let sh = `#!/usr/bin/env bash\n`;
    sh += `# Automated cloudflared service installation script\n`;
    sh += `set -euo pipefail\n\n`;
    sh += `echo "========================================="\n`;
    sh += `echo "Installing Cloudflare Tunnel Daemon..."\n`;
    sh += `echo "========================================="\n\n`;
    sh += `curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb\n`;
    sh += `dpkg -i cloudflared.deb\n\n`;
    sh += `cloudflared service install --tunnel-name ${tunnel}\n\n`;
    sh += `systemctl enable cloudflared\n`;
    sh += `systemctl start cloudflared\n`;
    sh += `echo "✅ Tunnel Service Started Successfully!"\n`;
    compiledCode.cf_sh = sh;

    // 3. Compile access-policy.json
    const domains = emailCsv.split(',').map(d => d.trim()).filter(Boolean);
    const jsonPolicy = {
      name: `Access Rules for ${dom}`,
      decision: "allow",
      rules: {
        include: domains.map(d => ({
          email_domain: {
            domain: d
          }
        })),
        require: runMfa ? [
          {
            login_method: {
              mfa: true
            }
          }
        ] : []
      },
      device_posture: runPosture ? [
        {
          type: "serial_number",
          enabled: true
        }
      ] : []
    };
    compiledCode.cf_json = JSON.stringify(jsonPolicy, null, 2);

    // 4. Compile Flow
    let flow = 'graph TD\n';
    flow += '  Client[👤 Remote Developer] --> Edge[☁️ Cloudflare Edge Gate]\n';
    
    let emailStr = domains.join(' / ');
    flow += `  Edge -->|Evaluate Email: ${emailStr}| Auth{🛡️ Access Policy Check}\n`;
    
    let checks = [];
    if (runMfa) checks.push('MFA');
    if (runPosture) checks.push('Posture Checks');
    let checksStr = checks.length > 0 ? checks.join(' + ') : 'Credentials';
    
    flow += `  Auth -- ${checksStr} OK --> Tunnel[⚡ Secure Tunnel: ${tunnel}]\n`;
    flow += '  Auth -- Verification Fails --> Block[🚫 Deny Access]\n';
    flow += `  Tunnel --> Service[🗄️ Local Target: ${local}]\n`;
    compiledCode.cf_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'cf_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.cf_flow + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
      
      // Update filename box
      let filename = 'config.yml';
      if (activeTab === 'cf_sh') filename = 'cloudflared-service.sh';
      if (activeTab === 'cf_json') filename = 'access-policy.json';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.tunnelName, elements.domain, elements.localService, elements.emailDomains,
    elements.mfa, elements.deviceChecks
  ];
  controls.forEach(ctrl => {
    if (ctrl) {
      ctrl.addEventListener('change', compileConfigs);
      ctrl.addEventListener('input', compileConfigs);
    }
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        alert("✅ Copied to clipboard!");
      });
    };
  }

  if (elements.btnDownload) {
    elements.btnDownload.onclick = () => {
      const content = elements.outputBox.textContent;
      const filename = elements.downloadInput.value;
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = filename;
      a.click();
    };
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['cf_config', 'cf_sh', 'cf_json', 'cf_flow'],
    'cf_config',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cf_tunnel_name')) {
    initCloudflareZeroTrustStudio();
  }
});

window.initCloudflareZeroTrustStudio = initCloudflareZeroTrustStudio;
