import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'install';

    let compiledCode = {
      install: '',
      prometheus: '',
      service: ''
    };

    const installTypesConfig = {
      system: {
        tab1: { label: 'install.sh', filename: 'install', ext: '.sh' },
        tab2: { label: 'prometheus.yml', filename: 'prometheus', ext: '.yml' },
        tab3: { label: 'node-exporter.service', filename: 'node-exporter', ext: '.service' }
      },
      docker: {
        tab1: { label: 'docker-compose.yml', filename: 'docker-compose', ext: '.yml' },
        tab2: { label: 'prometheus.yml', filename: 'prometheus', ext: '.yml' },
        tab3: { label: 'readme.txt', filename: 'readme', ext: '.txt' }
      },
      k8s: {
        tab1: { label: 'prometheus-k8s.yaml', filename: 'prometheus-k8s', ext: '.yaml' },
        tab2: { label: 'grafana-k8s.yaml', filename: 'grafana-k8s', ext: '.yaml' },
        tab3: { label: 'node-exporter-k8s.yaml', filename: 'node-exporter-k8s', ext: '.yaml' }
      }
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      onInstallTypeChange();
    });

    function setupInteractiveListeners() {
      // Toggle custom settings display depending on checkboxes
      $('install_prom').addEventListener('change', function() {
        $('prom-settings-box').classList.toggle('hidden', !this.checked);
        triggerCompileAll();
      });

      $('add_hosts').addEventListener('change', function() {
        $('hosts-settings-box').classList.toggle('hidden', !this.checked);
        triggerCompileAll();
      });

      $('install_exporter').addEventListener('change', function() {
        $('exporter-settings-box').classList.toggle('hidden', !this.checked);
        triggerCompileAll();
      });

      $('install_grafana').addEventListener('change', function() {
        $('grafana-settings-box').classList.toggle('hidden', !this.checked);
        triggerCompileAll();
      });

      $('install_type').addEventListener('change', onInstallTypeChange);

      setupCompilerTriggers(triggerCompileAll);
    }

    function onInstallTypeChange() {
      const type = $('install_type').value;
      const isSystem = (type === 'system');

      // Toggle display of System-specific blocks
      const systemdBox = $('systemd_enable').closest('.p-3');
      if (systemdBox) systemdBox.style.display = isSystem ? 'block' : 'none';

      const distBox = $('linux_dist').closest('div');
      if (distBox) distBox.style.display = isSystem ? 'block' : 'none';

      const urlInputBox = $('prom_url').closest('div');
      if (urlInputBox) urlInputBox.style.display = isSystem ? 'block' : 'none';

      const expUrlInputBox = $('exporter_url').closest('div');
      if (expUrlInputBox) expUrlInputBox.style.display = isSystem ? 'block' : 'none';

      updateTabsUI();
      triggerCompileAll();
    }

    function updateTabsUI() {
      const type = $('install_type').value;
      const cfg = installTypesConfig[type];

      $('tab-install').textContent = cfg.tab1.label;
      $('tab-prometheus').textContent = cfg.tab2.label;
      $('tab-service').textContent = cfg.tab3.label;

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      let currentActiveCfg = cfg.tab1;
      if (activeTab === 'prometheus') currentActiveCfg = cfg.tab2;
      if (activeTab === 'service') currentActiveCfg = cfg.tab3;

      nameBox.value = currentActiveCfg.filename;
      extTag.textContent = currentActiveCfg.ext;
    }

    // Dynamic compilation master
    function triggerCompileAll() {
      compileInstallScript();
      compilePromConfig();
      compileServiceConfig();
      updateViewportContent();
    }

    // Compile install.sh (tab1)
    function compileInstallScript() {
      const type = $('install_type').value;
      const isProm = $('install_prom').checked;
      const promUrl = $('prom_url').value;
      const promPort = $('prom_port').value;

      const isExp = $('install_exporter').checked;
      const expUrl = $('exporter_url').value;
      const expPort = $('exporter_port').value;

      const isGrafana = $('install_grafana').checked;
      const grPort = $('grafana_port').value;

      const systemd = $('systemd_enable').checked;

      if (type === 'system') {
        let code = `#!/bin/bash\n# install.sh - Telemetry Provisioner compiled via Talari Pradeep's Studio\nset -e\n\n`;
        code += `echo "⏱️ Starting SRE deployment of Prometheus Telemetry tools..."\n`;
        code += `sudo apt-get update -y && sudo apt-get install -y curl tar\n\n`;

        if (isProm) {
          code += `# ── PROMETHEUS CORE ──\n`;
          code += `echo "Downloading Prometheus from archive..."\n`;
          code += `curl -LO "${promUrl}"\n`;
          code += `tar -xzf prometheus-*.tar.gz\n`;
          code += `cd prometheus-*\n\n`;
          code += `echo "Configuring unprivileged system user for Prometheus..."\n`;
          code += `sudo useradd --no-create-home --shell /bin/false prometheus || true\n`;
          code += `sudo mkdir -p /etc/prometheus /var/lib/prometheus\n`;
          code += `sudo cp prometheus promtool /usr/local/bin/\n`;
          code += `sudo cp -r consoles console_libraries /etc/prometheus/\n`;
          code += `sudo cp ../prometheus.yml /etc/prometheus/\n`;
          code += `sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus\n`;
          code += `sudo chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool\n\n`;
          code += `cd ..\n\n`;
        }

        if (isExp) {
          code += `# ── NODE EXPORTER CORE ──\n`;
          code += `echo "Downloading Node Exporter archive..."\n`;
          code += `curl -LO "${expUrl}"\n`;
          code += `tar -xzf node_exporter-*.tar.gz\n`;
          code += `sudo cp node_exporter-*/node_exporter /usr/local/bin/\n`;
          code += `sudo useradd --no-create-home --shell /bin/false node_exporter || true\n`;
          code += `sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter\n\n`;
        }

        if (isGrafana) {
          code += `# ── GRAFANA CORE ──\n`;
          code += `echo "Adding Grafana GPG keys and packages repositories..."\n`;
          code += `sudo mkdir -p /etc/apt/keyrings/\n`;
          code += `wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null\n`;
          code += `echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list\n`;
          code += `sudo apt-get update -y && sudo apt-get install -y grafana\n\n`;
        }

        if (systemd) {
          code += `# ── DAEMON SERVICES LIFECYCLES ──\n`;
          if (isProm) {
            code += `echo "Setting up systemd service unit: prometheus"\n`;
            code += `sudo systemctl daemon-reload\n`;
            code += `sudo systemctl enable prometheus\n`;
            code += `sudo systemctl start prometheus\n`;
          }
          if (isExp) {
            code += `echo "Setting up systemd service unit: node_exporter"\n`;
            code += `sudo cp node-exporter.service /etc/systemd/system/\n`;
            code += `sudo systemctl daemon-reload\n`;
            code += `sudo systemctl enable node-exporter\n`;
            code += `sudo systemctl start node-exporter\n`;
          }
          if (isGrafana) {
            code += `echo "Setting up systemd service unit: grafana-server"\n`;
            code += `sudo systemctl enable grafana-server\n`;
            code += `sudo systemctl start grafana-server\n`;
          }
        }

        code += `\necho "✅ Telemetry configurations successfully provisioned!"\n`;
        compiledCode.install = code;

      } else if (type === 'docker') {
        let code = `version: '3.8'\n\nservices:\n`;
        if (isProm) {
          code += `  prometheus:\n`;
          code += `    image: prom/prometheus:latest\n`;
          code += `    container_name: prometheus\n`;
          code += `    volumes:\n`;
          code += `      - ./prometheus.yml:/etc/prometheus/prometheus.yml\n`;
          code += `      - prometheus_data:/prometheus\n`;
          code += `    command:\n`;
          code += `      - '--config.file=/etc/prometheus/prometheus.yml'\n`;
          code += `      - '--storage.tsdb.path=/prometheus'\n`;
          code += `    ports:\n`;
          code += `      - "${promPort}:${promPort}"\n`;
          code += `    restart: unless-stopped\n`;
          code += `    deploy:\n`;
          code += `      resources:\n`;
          code += `        limits:\n`;
          code += `          cpus: '0.50'\n`;
          code += `          memory: 512M\n\n`;
        }

        if (isExp) {
          code += `  node-exporter:\n`;
          code += `    image: prom/node-exporter:latest\n`;
          code += `    container_name: node-exporter\n`;
          code += `    volumes:\n`;
          code += `      - /proc:/host/proc:ro\n`;
          code += `      - /sys:/host/sys:ro\n`;
          code += `      - /:/rootfs:ro\n`;
          code += `    command:\n`;
          code += `      - '--path.procfs=/host/proc'\n`;
          code += `      - '--path.sysfs=/host/sys'\n`;
          code += `    ports:\n`;
          code += `      - "${expPort}:${expPort}"\n`;
          code += `    restart: unless-stopped\n\n`;
        }

        if (isGrafana) {
          code += `  grafana:\n`;
          code += `    image: grafana/grafana:latest\n`;
          code += `    container_name: grafana\n`;
          code += `    ports:\n`;
          code += `      - "${grPort}:${grPort}"\n`;
          code += `    volumes:\n`;
          code += `      - grafana_data:/var/lib/grafana\n`;
          code += `    restart: unless-stopped\n\n`;
        }

        code += `volumes:\n`;
        if (isProm) code += `  prometheus_data:\n`;
        if (isGrafana) code += `  grafana_data:\n`;

        compiledCode.install = code;

      } else if (type === 'k8s') {
        let code = `apiVersion: v1\nkind: Namespace\nmetadata:\n  name: monitoring\n---\n`;
        if (isProm) {
          code += `apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: prometheus-config\n  namespace: monitoring\ndata:\n  prometheus.yml: |\n`;
          code += `    global:\n      scrape_interval: 15s\n    scrape_configs:\n      - job_name: 'prometheus'\n        static_configs:\n          - targets: ['localhost:${promPort}']\n`;
          if (isExp) {
            code += `      - job_name: 'node-exporter'\n        static_configs:\n          - targets: ['node-exporter:${expPort}']\n`;
          }
          code += `---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: prometheus\n  namespace: monitoring\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: prometheus\n  template:\n    metadata:\n      labels:\n        app: prometheus\n    spec:\n      containers:\n      - name: prometheus\n        image: prom/prometheus:latest\n        ports:\n        - containerPort: ${promPort}\n        volumeMounts:\n        - name: config-volume\n          mountPath: /etc/prometheus\n        - name: storage-volume\n          mountPath: /prometheus\n        resources:\n          limits:\n            cpu: 500m\n            memory: 512Mi\n          requests:\n            cpu: 200m\n            memory: 256Mi\n      volumes:\n      - name: config-volume\n        configMap:\n          name: prometheus-config\n      - name: storage-volume\n        emptyDir: {}\n---\n`;
          code += `apiVersion: v1\nkind: Service\nmetadata:\n  name: prometheus-service\n  namespace: monitoring\nspec:\n  type: NodePort\n  ports:\n  - port: ${promPort}\n    targetPort: ${promPort}\n    nodePort: 30090\n  selector:\n    app: prometheus\n`;
        } else {
          code += `# Prometheus Setup is disabled\n`;
        }
        compiledCode.install = code;
      }
    }

    // Compile prometheus.yml (tab2)
    function compilePromConfig() {
      const type = $('install_type').value;
      const isProm = $('install_prom').checked;
      const promPort = $('prom_port').value;
      const isExp = $('install_exporter').checked;
      const expPort = $('exporter_port').value;
      const isGrafana = $('install_grafana').checked;
      const grPort = $('grafana_port').value;
      const addHosts = $('add_hosts').checked;
      const scrapeTargets = $('scrape_targets').value.split(',');

      if (type === 'system') {
        let code = `# prometheus.yml v${SCRIPT_VERSION} config compiled client-side\n`;
        code += `global:\n`;
        code += `  scrape_interval: 15s\n`;
        code += `  evaluation_interval: 15s\n\n`;
        code += `scrape_configs:\n`;
        code += `  - job_name: "prometheus"\n`;
        code += `    static_configs:\n`;
        code += `      - targets: ["localhost:${promPort}"]\n`;

        if (addHosts && scrapeTargets.length > 0) {
          code += `\n  - job_name: "node-exporters-cluster"\n`;
          code += `    static_configs:\n`;
          code += `      - targets:\n`;
          scrapeTargets.forEach(tgt => {
            if (tgt.trim()) {
              code += `          - "${tgt.trim()}"\n`;
            }
          });
        }
        compiledCode.prometheus = code;

      } else if (type === 'docker') {
        let code = `# prometheus.yml v${SCRIPT_VERSION} for Docker Compose\n`;
        code += `global:\n`;
        code += `  scrape_interval: 15s\n\n`;
        code += `scrape_configs:\n`;
        code += `  - job_name: "prometheus"\n`;
        code += `    static_configs:\n`;
        code += `      - targets: ["localhost:9090"]\n`;

        if (isExp) {
          code += `\n  - job_name: "node-exporter"\n`;
          code += `    static_configs:\n`;
          code += `      - targets: ["node-exporter:${expPort}"]\n`;
        }

        if (addHosts && scrapeTargets.length > 0) {
          code += `\n  - job_name: "external-nodes"\n`;
          code += `    static_configs:\n`;
          code += `      - targets:\n`;
          scrapeTargets.forEach(tgt => {
            if (tgt.trim()) {
              code += `          - "${tgt.trim()}"\n`;
            }
          });
        }
        compiledCode.prometheus = code;

      } else if (type === 'k8s') {
        if (isGrafana) {
          let code = `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: grafana\n  namespace: monitoring\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: grafana\n  template:\n    metadata:\n      labels:\n        app: grafana\n    spec:\n      containers:\n      - name: grafana\n        image: grafana/grafana:latest\n        ports:\n        - containerPort: ${grPort}\n        resources:\n          limits:\n            cpu: 500m\n            memory: 512Mi\n          requests:\n            cpu: 200m\n            memory: 256Mi\n---\n`;
          code += `apiVersion: v1\nkind: Service\nmetadata:\n  name: grafana-service\n  namespace: monitoring\nspec:\n  type: NodePort\n  ports:\n  - port: ${grPort}\n    targetPort: ${grPort}\n    nodePort: 30300\n  selector:\n    app: grafana\n`;
          compiledCode.prometheus = code;
        } else {
          compiledCode.prometheus = `# Grafana installation is disabled`;
        }
      }
    }

    // Compile node-exporter.service (tab3)
    function compileServiceConfig() {
      const type = $('install_type').value;
      const isProm = $('install_prom').checked;
      const promPort = $('prom_port').value;
      const isExp = $('install_exporter').checked;
      const expPort = $('exporter_port').value;
      const isGrafana = $('install_grafana').checked;
      const grPort = $('grafana_port').value;

      if (type === 'system') {
        let code = `[Unit]\n`;
        code += `Description=Node Exporter Metric Scraper daemon\n`;
        code += `Wants=network-online.target\n`;
        code += `After=network-online.target\n\n`;
        code += `[Service]\n`;
        code += `User=node_exporter\n`;
        code += `Group=node_exporter\n`;
        code += `Type=simple\n`;
        code += `ExecStart=/usr/local/bin/node_exporter --web.listen-address=:${expPort}\n\n`;
        code += `[Install]\n`;
        code += `WantedBy=multi-user.target\n`;
        compiledCode.service = code;

      } else if (type === 'docker') {
        let code = `SRE OBSERVABILITY DEPLOYMENT INSTRUCTIONS (DOCKER COMPOSE)\n`;
        code += `==========================================================\n\n`;
        code += `1. Ensure Docker and Docker Compose are installed on your host system.\n`;
        code += `2. Save 'docker-compose.yml' and 'prometheus.yml' in the same folder.\n`;
        code += `3. Start the SRE telemetry stack:\n`;
        code += `   $ docker compose up -d\n\n`;
        code += `4. Verify operational health:\n`;
        code += `   $ docker compose ps\n\n`;
        code += `5. Service Endpoints:\n`;
        if (isProm) code += `   - Prometheus Server:  http://localhost:${promPort}\n`;
        if (isExp)  code += `   - Node Exporter Core: http://localhost:${expPort}\n`;
        if (isGrafana) code += `   - Grafana Dashboards: http://localhost:${grPort} (Default credentials: admin / admin)\n`;
        compiledCode.service = code;

      } else if (type === 'k8s') {
        if (isExp) {
          let code = `apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: node-exporter\n  namespace: monitoring\nspec:\n  selector:\n    matchLabels:\n      app: node-exporter\n  template:\n    metadata:\n      labels:\n        app: node-exporter\n    spec:\n      hostNetwork: true\n      hostPID: true\n      containers:\n      - name: node-exporter\n        image: prom/node-exporter:latest\n        securityContext:\n          privileged: true\n        ports:\n        - containerPort: ${expPort}\n          hostPort: ${expPort}\n          name: scrape\n        volumeMounts:\n        - name: proc\n          mountPath: /host/proc\n          readOnly: true\n        - name: sys\n          mountPath: /host/sys\n          readOnly: true\n        - name: root\n          mountPath: /rootfs\n          readOnly: true\n      volumes:\n      - name: proc\n        hostPath:\n          path: /proc\n      - name: sys\n        hostPath:\n          path: /sys\n      - name: root\n        hostPath:\n          path: /\n---\n`;
          code += `apiVersion: v1\nkind: Service\nmetadata:\n  name: node-exporter\n  namespace: monitoring\nspec:\n  ports:\n  - port: ${expPort}\n    targetPort: ${expPort}\n    name: scrape\n  selector:\n    app: node-exporter\n`;
          compiledCode.service = code;
        } else {
          compiledCode.service = `# Node Exporter DaemonSet setup is disabled`;
        }
      }
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const type = $('install_type').value;
      const cfg = installTypesConfig[type];
      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      let currentActiveCfg = cfg.tab1;
      if (tabId === 'prometheus') currentActiveCfg = cfg.tab2;
      if (tabId === 'service') currentActiveCfg = cfg.tab3;

      nameBox.value = currentActiveCfg.filename;
      extTag.textContent = currentActiveCfg.ext;

      updateViewportContent();
    }

    function updateViewportContent() {
      $('output-box').textContent = compiledCode[activeTab === 'install' ? 'install' : (activeTab === 'prometheus' ? 'prometheus' : 'service')];
    }

    function copyActiveTabContent() {
      const type = $('install_type').value;
      const cfg = installTypesConfig[type];
      const activeText = compiledCode[activeTab === 'install' ? 'install' : (activeTab === 'prometheus' ? 'prometheus' : 'service')];
      
      navigator.clipboard.writeText(activeText).then(() => {
        let label = cfg.tab1.label;
        if (activeTab === 'prometheus') label = cfg.tab2.label;
        if (activeTab === 'service') label = cfg.tab3.label;
        showToast(`✅ Copied ${label} to clipboard!`);
      });
    }

    function downloadMonitoringZip() {
      const type = $('install_type').value;
      const cfg = installTypesConfig[type];

      const zip = new JSZip();
      zip.file(cfg.tab1.label, compiledCode.install);
      zip.file(cfg.tab2.label, compiledCode.prometheus);
      zip.file(cfg.tab3.label, compiledCode.service);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `monitoring-${type}-resources.zip`;
        a.click();
        showToast(`⬇️ monitoring-${type}-resources.zip downloaded successfully!`);
      });
    }

    function clearAllFields() {
      $('install_type').value = 'system';
      $('install_prom').checked = true;
      $('prom-settings-box').classList.remove('hidden');
      $('prom_port').value = '9090';

      $('add_hosts').checked = false;
      $('hosts-settings-box').classList.add('hidden');
      $('scrape_targets').value = '10.0.1.10:9100, 10.0.1.11:9100';

      $('install_exporter').checked = false;
      $('exporter-settings-box').classList.add('hidden');
      $('exporter_port').value = '9100';

      $('install_grafana').checked = false;
      $('grafana-settings-box').classList.add('hidden');
      $('grafana_port').value = '3000';

      $('systemd_enable').checked = true;
      $('linux_dist').value = 'ubuntu';

      onInstallTypeChange();
      showToast('🗑️ Output configuration cleared and reset to defaults');
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

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
    }
  
    const tabExplanations = {'prometheus': {'title': 'Prometheus Scraping configuration', 'filename': 'prometheus.yml', 'why': 'Declares targets, scraping intervals, and metrics endpoint locations for Prometheus.', 'when': 'Use to configure Prometheus scraper daemons to monitor host systems and applications.', 'where': 'Mount into your Prometheus configuration directory.', 'command': 'prometheus --config.file=prometheus.yml', 'practices': ['Set appropriate scrape_interval values (15s to 30s) to balance load.', 'Configure target endpoint DNS names statically or dynamically.', 'Decouple rules file configurations.'], 'ai_mlops': 'Audits GPU compute utilization and latency properties of the **SRE GenAI Copilot**.', 'flow': '[Prometheus Engine] ➔ Scrapes ➔ [App Metrics Endpoint] ➔ [Saves to TSDB]'}, 'alertmanager': {'title': 'Alertmanager Configuration', 'filename': 'alertmanager.yml', 'why': 'Configures alerting routing trees, grouping alarms, and pushing incidents to Slack/PagerDuty channels.', 'when': 'Use to route alert incidents to SRE response teams dynamically.', 'where': 'Deploy inside the Alertmanager configuration namespace.', 'command': '# Automatically read by Alertmanager system daemon', 'practices': ['Group identical alert alerts to prevent spamming notifications.', 'Set up fallback pager alerts for critical failures.', 'Maintain quiet windows configurations.'], 'ai_mlops': 'Sends event alerts to webhooks integrated with the **Self-Healing Infrastructure Platform**.', 'flow': '[Prometheus Alert] ➔ [Alertmanager] ➔ [Group & Route] ➔ [Slack / PagerDuty Alert]'}, 'grafana': {'title': 'Grafana Dashboard Model', 'filename': 'grafana-dashboard.json', 'why': 'Defines the JSON layout of your Grafana dashboard panels, visualizing CPU, Memory, network traffic, and error rates.', 'when': 'Import into Grafana to instantly monitor the health of your services visually.', 'where': 'Import via the Grafana web dashboard portal.', 'command': '# Upload JSON file via Grafana Web import UI', 'practices': ['Group dashboard panels into collapsible rows.', 'Set up clear threshold colors (Green/Yellow/Red) for status panels.', 'Keep variables dynamically configurable (e.g. env or namespace).'], 'ai_mlops': 'Visualizes token throughput and inference efficiency of the **RAG Knowledge Chatbot**.', 'flow': '[Prometheus TSDB] ➔ [Grafana Panel Query] ➔ [Visual Charts Render]'}, 'readme': {'title': 'Observability Guide', 'filename': 'README.md', 'why': 'Explains how to access monitoring endpoints, import dashboards, and setup alerts.', 'when': 'Include in the telemetry repository to guide SREs on setting up Grafana and Alertmanager.', 'where': 'Save in the root of the monitoring folder.', 'command': '# View in markdown viewer', 'practices': ['Provide Grafana portal login links.', 'List active Slack alert channel names.', 'Document alert threshold formulas.'], 'ai_mlops': 'Guides telemetry configurations for monitoring running LLM models.', 'flow': '[README.md Guide] ➔ [Guides SRE telemetry configurations]'}};

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      // Populate drawer content
      document.getElementById('drawer-title').textContent = explanation.title;
      document.getElementById('drawer-filename').textContent = explanation.filename;
      document.getElementById('explain-why').innerHTML = explanation.why;
      document.getElementById('explain-when').innerHTML = explanation.when;
      
      document.getElementById('explain-where').innerHTML = explanation.where;
      document.getElementById('explain-command').textContent = explanation.command;

      const practicesBox = document.getElementById('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      // Populate AI/MLOps Integration
      document.getElementById('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';

      document.getElementById('explain-flow').textContent = explanation.flow;

      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadMonitoringZip = downloadMonitoringZip;
window.escapeHtml = escapeHtml;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
