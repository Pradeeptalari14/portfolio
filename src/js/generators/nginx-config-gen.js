// Nginx Configurator & Flowchart Router
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initNginxConfig() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const proxyDomainInput = $('proxy_domain');
  const enableSslCheckbox = $('enable_ssl');
  const lbAlgoSelect = $('lb_algo');
  const backendServersInput = $('backend_servers');
  const routePathInput = $('route_path');
  const clientMaxBodyInput = $('client_max_body');
  const enableGzipCheckbox = $('enable_gzip');
  const rateLimitInput = $('rate_limit');

  // Outputs
  const outputBox = $('output-box');
  const mermaidContainer = $('mermaid-container');
  const downloadNameInput = $('download-name-input');

  function compileNginx() {
    if (!proxyDomainInput) return;
    const domain = proxyDomainInput.value.trim() || 'example.com';
    const ssl = enableSslCheckbox.checked;
    const algo = lbAlgoSelect.value; // round_robin, least_conn, ip_hash
    const backends = backendServersInput.value.split(',').map(s => s.trim()).filter(Boolean);
    const path = routePathInput.value.trim() || '/api';
    const maxBody = clientMaxBodyInput.value.trim() || '10M';
    const gzip = enableGzipCheckbox.checked;
    const limit = parseInt(rateLimitInput.value) || 10;

    let conf = `# Nginx Configuration File (nginx.conf)
# Generated dynamically for production SRE deployment proxy setups

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Rate limiting zone mapping
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=${limit}r/s;

    # Upstream pool load balancing definition
    upstream backend_servers {
        ${algo !== 'round_robin' ? algo + ';' : ''}
        ${backends.map(srv => `server ${srv};`).join('\n        ')}
    }

    server {
        listen 80;
        server_name ${domain};
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
        
        # Max client upload size limit
        client_max_body_size ${maxBody};

        ${gzip ? `# Gzip Compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript;` : ''}

        # Reverse proxy path binding
        location ${path} {
            limit_req zone=api_limit burst=5 nodelay;
            proxy_pass http://backend_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # SRE Buffering timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Root static files location
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
    }
}
`;

    if (outputBox) outputBox.textContent = conf;
    renderMermaidChart(domain, ssl, path, backends);
    updateExplanation(domain);
  }

  function renderMermaidChart(domain, ssl, path, backends) {
    let diagram = `graph TD
  Client[Client Web Request] --> Nginx[Nginx Proxy: ${domain}]
  Nginx --> SSL{SSL Required?}
  ${ssl ? `SSL -- Yes --> SSL_Term[Decrypt SSL Client Certificate]
  SSL_Term --> PathMatch{Match Location Path?}` : `SSL -- No --> PathMatch{Match Location Path?}`}
  
  PathMatch -- "${path}" --> Limiter{Rate Limit Trigger?}
  Limiter -- OK --> Pool[Upstream Backend Pool]
  Limiter -- Over Rate --> Err[HTTP 429 Too Many Requests]
  
  PathMatch -- "/" --> Static[Local static assets / SPA router]
  
  ${backends.map((srv, idx) => `Pool --> Server_${idx}[${srv}]`).join('\n  ')}
  
  style Client fill:#1e293b,stroke:#475569,stroke-width:2px,color:#fff
  style Nginx fill:#4f46e5,stroke:#818cf8,stroke-width:2px,color:#fff
  style Pool fill:#0ea5e9,stroke:#38bdf8,stroke-width:2px,color:#fff
  style Err fill:#ef4444,stroke:#f87171,stroke-width:2px,color:#fff
`;

    if (mermaidContainer) {
      mermaidContainer.innerHTML = `<pre class="mermaid" id="nginx-flow">${diagram}</pre>`;
    }
    
    if (window.mermaid) {
      setTimeout(() => {
        try {
          window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        } catch (e) {
          console.error('Mermaid render issue:', e);
        }
      }, 50);
    }
  }

  function updateExplanation(domain) {
    const explainWhy = $('explain-why');
    if (explainWhy) {
      explainWhy.innerHTML = `Compiles secure, robust reverse proxy config blocks. Configures rate limiting zones and active headers to block clickjacking and MIME-type sniffing.`;
    }
    const explainWhere = $('explain-where');
    if (explainWhere) {
      explainWhere.innerHTML = `Upload configuration file to <code>/etc/nginx/nginx.conf</code> on virtual servers or mount it dynamically into Nginx container paths.`;
    }
    const explainCmd = $('explain-command');
    if (explainCmd) {
      explainCmd.textContent = `sudo nginx -t\nsudo systemctl reload nginx`;
    }
    
    const practices = $('explain-practices');
    if (practices) {
      practices.innerHTML = `
        <li>Limit client payload limits using <code>client_max_body_size</code> to buffer uploads.</li>
        <li>Always test syntax correctness with <code>nginx -t</code> before applying hot reloads.</li>
        <li>Set proxy read and connect timeouts to protect resource pools.</li>
      `;
    }
    
    const explainAi = $('explain-ai-mlops');
    if (explainAi) {
      explainAi.innerHTML = `Configure larger client body limits (e.g. 100M) when proxying files or metadata into AI training endpoints.`;
    }
    const explainFlow = $('explain-flow');
    if (explainFlow) {
      explainFlow.textContent = `Client ---> [SSL Handshake] ---> [Nginx Router] ---> [Proxy Headers] ---> Upstream IP Pool`;
    }
  }

  // Event Listeners
  [proxyDomainInput, enableSslCheckbox, lbAlgoSelect, backendServersInput, routePathInput, clientMaxBodyInput, enableGzipCheckbox, rateLimitInput].forEach(el => {
    if (el) el.addEventListener('input', compileNginx);
    if (el) el.addEventListener('change', compileNginx);
  });

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'nginx-conf') {
      const tab = $('tab-nginx-conf');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'routing') {
      const tab = $('tab-routing');
      if (tab) tab.classList.add('active');
      if (mermaidContainer) mermaidContainer.classList.remove('hidden');
    }
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Nginx configuration copied to clipboard!');
    });
  };

  window.downloadNginxFile = () => {
    const blob = new Blob([outputBox.textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  window.explainActiveTabCode = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.remove('translate-x-full');
  };

  window.closeExplanationDrawer = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.add('translate-x-full');
  };

  // Run initial compile
  compileNginx();
}

if (document.readyState !== 'loading') {
  initNginxConfig();
} else {
  document.addEventListener('DOMContentLoaded', initNginxConfig);
}
