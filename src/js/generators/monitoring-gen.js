import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'install';

  let compiledCode = {
    install: '',
    prometheus: '',
    service: '',
    flow: '',
    dashboard: ''
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
      compileMermaidFlow();
      compileDashboardConfig();
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

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Exporter[📦 Node Exporter] -->|Scrapes Metrics| Prom[📈 Prometheus Server]\n  Prom -->|Visualize| Grafana[📊 Grafana Dashboards]\n  Prom -->|Alert rules| Alertmanager[🚨 Alert Dispatcher]';
  compiledCode.flow = chart;
}

function compileDashboardConfig() {
  const dashboardJson = {
    "annotations": {
      "list": []
    },
    "editable": true,
    "fiscalYearStartMonth": 0,
    "graphTooltip": 0,
    "id": 1,
    "links": [],
    "liveNow": false,
    "panels": [
      {
        "collapsed": false,
        "gridPos": {
          "h": 4,
          "w": 24,
          "x": 0,
          "y": 0
        },
        "id": 1,
        "title": "SRE SLA Observability Dashboard",
        "type": "row"
      },
      {
        "datasource": {
          "type": "prometheus",
          "uid": "prometheus-default"
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "red",
                  "value": null
                },
                {
                  "color": "green",
                  "value": 99.99
                }
              ]
            },
            "unit": "percent"
          }
        },
        "gridPos": {
          "h": 6,
          "w": 8,
          "x": 0,
          "y": 4
        },
        "id": 2,
        "options": {
          "reduceOptions": {
            "calcs": ["lastNotNull"],
            "fields": "",
            "values": false
          },
          "showThresholdLabels": false,
          "showThresholdMarkers": true
        },
        "targets": [
          {
            "datasource": {
              "type": "prometheus",
              "uid": "prometheus-default"
            },
            "editorMode": "code",
            "expr": "100 - ((sum(rate(nginx_http_requests_total{status=~\"5..\"}[5m])) / sum(rate(nginx_http_requests_total[5m]))) * 100)",
            "legendFormat": "SLA Availability",
            "range": true,
            "refId": "A"
          }
        ],
        "title": "Real-time SLA Target Availability",
        "type": "gauge"
      },
      {
        "datasource": {
          "type": "prometheus",
          "uid": "prometheus-default"
        },
        "gridPos": {
          "h": 6,
          "w": 8,
          "x": 8,
          "y": 4
        },
        "id": 3,
        "options": {
          "legend": {
            "calcs": [],
            "displayMode": "list",
            "placement": "bottom"
          },
          "tooltip": {
            "mode": "single",
            "sort": "none"
          }
        },
        "targets": [
          {
            "datasource": {
              "type": "prometheus",
              "uid": "prometheus-default"
            },
            "editorMode": "code",
            "expr": "sum(rate(nginx_http_requests_total[5m])) by (status)",
            "legendFormat": "{{status}} rate",
            "range": true,
            "refId": "A"
          }
        ],
        "title": "HTTP Request Volume Rate (5m)",
        "type": "timeseries"
      },
      {
        "datasource": {
          "type": "prometheus",
          "uid": "prometheus-default"
        },
        "gridPos": {
          "h": 6,
          "w": 8,
          "x": 16,
          "y": 4
        },
        "id": 4,
        "title": "p99 Response Latency (seconds)",
        "type": "timeseries",
        "targets": [
          {
            "datasource": {
              "type": "prometheus",
              "uid": "prometheus-default"
            },
            "editorMode": "code",
            "expr": "histogram_quantile(0.99, sum(rate(nginx_http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "p99 Latency",
            "range": true,
            "refId": "A"
          }
        ]
      }
    ],
    "schemaVersion": 36,
    "style": "dark",
    "tags": ["sre", "portfolio", "observability"],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "title": "SRE Script Tools Observability Dashboard",
    "uid": "sre-tools-dashboard"
  };
  compiledCode.dashboard = JSON.stringify(dashboardJson, null, 2);
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  updateTabsUI();
  updateViewportContent();
}

function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');
    $('dashboard-container').classList.add('hidden');

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
  } else if (activeTab === 'dashboard') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.add('hidden');
    $('dashboard-container').classList.remove('hidden');
    renderLiveDashboard();
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('dashboard-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

function copyActiveTabContent() {
  const type = $('install_type').value;
  const cfg = installTypesConfig[type];
  let activeText = '';
  let label = '';
  
  if (activeTab === 'install') {
    activeText = compiledCode.install;
    label = cfg.tab1.label;
  } else if (activeTab === 'prometheus') {
    activeText = compiledCode.prometheus;
    label = cfg.tab2.label;
  } else if (activeTab === 'service') {
    activeText = compiledCode.service;
    label = cfg.tab3.label;
  } else if (activeTab === 'flow') {
    activeText = compiledCode.flow;
    label = 'architecture-flow.mermaid';
  } else if (activeTab === 'dashboard') {
    activeText = compiledCode.dashboard;
    label = 'grafana-dashboard.json';
  }
  
  navigator.clipboard.writeText(activeText).then(() => {
    showToast(`✅ Copied ${label} to clipboard!`);
  });
}

// ── LIVE SRE TELEMETRY SIMULATOR STATE & LOGIC ──
let dashboardIntervalId = null;

let dashboardState = {
  cpu: 18,
  memory: 154,
  reqRate: 52,
  latency: 82,
  sla: 99.99,
  anomaly: null,
  history: {
    cpu: Array(20).fill(18),
    memory: Array(20).fill(154),
    reqRate: Array(20).fill(52),
    latency: Array(20).fill(82)
  },
  alerts: [],
  logs: [
    { time: '17:20:00', level: 'INFO', msg: 'Prometheus scraper engine initialized' },
    { time: '17:20:15', level: 'INFO', msg: 'Discovered target 10.0.1.10:9100' },
    { time: '17:20:15', level: 'INFO', msg: 'Discovered target 10.0.1.11:9100' }
  ]
};

function drawSvgPath(values, maxScale) {
  const width = 280;
  const height = 70;
  const padding = 5;
  const length = values.length;
  
  if (length === 0) return { line: 'M 0 70 Z', area: 'M 0 70 Z' };
  
  const points = values.map((val, idx) => {
    const x = idx * (width / (length - 1));
    const clampedVal = Math.min(Math.max(val, 0), maxScale);
    const y = height - padding - (clampedVal / maxScale) * (height - 2 * padding);
    return { x, y };
  });
  
  const lineD = 'M ' + points.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ');
  const areaD = lineD + ` L ${width} ${height} L 0 ${height} Z`;
  
  return { line: lineD, area: areaD };
}

function updateDashboardState() {
  const rand = (min, max) => Math.random() * (max - min) + min;
  
  let targetCpu = rand(12, 22);
  let targetMemory = rand(150, 160);
  let targetReqRate = rand(45, 55);
  let targetLatency = rand(70, 90);
  
  if (dashboardState.anomaly === 'cpu_spike') {
    targetCpu = rand(88, 97);
    targetLatency = rand(650, 890);
    targetReqRate = rand(50, 60);
    targetMemory = rand(170, 195);
  } else if (dashboardState.anomaly === 'mem_leak') {
    dashboardState.memory += Math.round(rand(120, 180));
    targetMemory = dashboardState.memory;
    targetCpu = rand(15, 25);
  } else if (dashboardState.anomaly === 'api_outage') {
    targetReqRate = rand(0, 3);
    targetLatency = rand(1800, 2200);
    targetCpu = rand(5, 12);
    targetMemory = rand(130, 145);
  } else {
    if (dashboardState.memory > 180) {
      dashboardState.memory = Math.max(154, dashboardState.memory - 200);
    }
    targetMemory = dashboardState.memory;
  }
  
  dashboardState.cpu = Math.round(dashboardState.cpu * 0.4 + targetCpu * 0.6);
  dashboardState.memory = Math.round(dashboardState.memory * 0.4 + targetMemory * 0.6);
  dashboardState.reqRate = Math.round(dashboardState.reqRate * 0.4 + targetReqRate * 0.6);
  dashboardState.latency = Math.round(dashboardState.latency * 0.4 + targetLatency * 0.6);
  
  if (dashboardState.anomaly === 'api_outage') {
    const drop = rand(0.05, 0.15);
    dashboardState.sla = Math.max(92.4, dashboardState.sla - drop);
  } else {
    if (dashboardState.sla < 99.99) {
      dashboardState.sla = Math.min(99.99, dashboardState.sla + rand(0.01, 0.03));
    }
  }
  
  dashboardState.history.cpu.push(dashboardState.cpu);
  dashboardState.history.cpu.shift();
  
  dashboardState.history.memory.push(dashboardState.memory);
  dashboardState.history.memory.shift();
  
  dashboardState.history.reqRate.push(dashboardState.reqRate);
  dashboardState.history.reqRate.shift();
  
  dashboardState.history.latency.push(dashboardState.latency);
  dashboardState.history.latency.shift();
  
  checkAlertRules();
  
  if (dashboardState.anomaly === 'mem_leak' && dashboardState.memory > 1850) {
    oomKillEvent();
  }
}

function checkAlertRules() {
  const timestamp = new Date().toLocaleTimeString();
  const newAlerts = [];
  
  if (dashboardState.cpu > 85) {
    newAlerts.push({
      name: 'CPUThreateningSpike',
      severity: 'critical',
      msg: `Instance 10.0.1.10:9100 has CPU load > 85% (${dashboardState.cpu}%)`
    });
    if (!hasAlert('CPUThreateningSpike')) {
      addLog(timestamp, 'WARNING', 'CPU utilization exceeded 85% warning threshold');
      addLog(timestamp, 'ALERT', 'Firing alert: CPUThreateningSpike (critical)');
    }
  } else {
    if (hasAlert('CPUThreateningSpike')) {
      addLog(timestamp, 'INFO', 'Resolved alert: CPUThreateningSpike - CPU utilization recovered');
    }
  }
  
  if (dashboardState.memory > 1400) {
    newAlerts.push({
      name: 'OOMRiskMemoryLeak',
      severity: 'warning',
      msg: `Container node-exporter memory footprint climbing rapidly (${dashboardState.memory}MB)`
    });
    if (!hasAlert('OOMRiskMemoryLeak')) {
      addLog(timestamp, 'WARNING', 'System memory footprint > 1.4GB threshold');
      addLog(timestamp, 'ALERT', 'Firing alert: OOMRiskMemoryLeak (warning)');
    }
  } else {
    if (hasAlert('OOMRiskMemoryLeak')) {
      addLog(timestamp, 'INFO', 'Resolved alert: OOMRiskMemoryLeak - Memory footprint recovered');
    }
  }
  
  if (dashboardState.anomaly === 'api_outage' && dashboardState.reqRate < 10) {
    newAlerts.push({
      name: 'Http5xxRateElevated',
      severity: 'critical',
      msg: `High error rate detected. Request volume dropped to ${dashboardState.reqRate} req/s, Latency: ${dashboardState.latency}ms`
    });
    if (!hasAlert('Http5xxRateElevated')) {
      addLog(timestamp, 'ERROR', 'HTTP 5xx rate exceeded 10% on nginx-ingress-controller');
      addLog(timestamp, 'ALERT', 'Firing alert: Http5xxRateElevated (critical)');
    }
  } else {
    if (hasAlert('Http5xxRateElevated')) {
      addLog(timestamp, 'INFO', 'Resolved alert: Http5xxRateElevated - API response rates normalized');
    }
  }
  
  if (Math.random() < 0.25 && dashboardState.anomaly === null) {
    const port = $('exporter_port') ? $('exporter_port').value : '9100';
    addLog(timestamp, 'INFO', `Prometheus successfully scraped node-exporter target at 10.0.1.10:${port}`);
  }
  
  dashboardState.alerts = newAlerts;
}

function hasAlert(name) {
  return dashboardState.alerts.some(a => a.name === name);
}

function addLog(time, level, msg) {
  dashboardState.logs.push({ time, level, msg });
  if (dashboardState.logs.length > 25) {
    dashboardState.logs.shift();
  }
}

function oomKillEvent() {
  const timestamp = new Date().toLocaleTimeString();
  addLog(timestamp, 'CRITICAL', 'cgroups-v2: memory limit (2048MB) exceeded inside node-exporter container!');
  addLog(timestamp, 'CRITICAL', 'kernel: Out of memory: Killed process "node_exporter"');
  addLog(timestamp, 'INFO', 'systemd: node-exporter.service failed with exit code 137 (OOMKilled)');
  addLog(timestamp, 'INFO', 'systemd: node-exporter.service: Scheduled restart in 2s');
  
  dashboardState.memory = 150;
  dashboardState.anomaly = null;
  
  updateActiveAnomalyButtons();
  renderLiveMetrics();
  
  setTimeout(() => {
    const restartTime = new Date().toLocaleTimeString();
    addLog(restartTime, 'INFO', 'systemd: node-exporter.service: Service restarted successfully');
    renderLiveMetrics();
  }, 2000);
}

function renderLiveDashboard() {
  const container = $('dashboard-container');
  if (!container) return;
  
  if (!document.getElementById('btn-cpu-spike')) {
    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div class="flex items-center gap-2.5">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <h2 class="text-sm font-bold text-white tracking-wide">SRE SLA Observability Dashboard</h2>
            <p class="text-[10px] text-slate-400 font-mono">Mode: Mock Live Telemetry (100% Free Client-Side)</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button id="btn-cpu-spike" class="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-600/40 text-[9px] font-bold rounded-lg transition">Spike CPU</button>
          <button id="btn-mem-leak" class="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-600/40 text-[9px] font-bold rounded-lg transition">Memory Leak</button>
          <button id="btn-api-outage" class="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/40 text-[9px] font-bold rounded-lg transition">API Outage</button>
          <button id="btn-resolve" class="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-600/40 text-[9px] font-bold rounded-lg transition">Resolve All</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-[#111625] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px]">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">SLA Availability</span>
          <div class="relative w-24 h-24 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="38" stroke="#1e293b" stroke-width="6" fill="transparent" />
              <circle id="gauge-sla-bar" cx="48" cy="48" r="38" stroke="#10b981" stroke-width="6" fill="transparent" stroke-dasharray="238.7" stroke-dashoffset="0" stroke-linecap="round" class="transition-all duration-500" />
            </svg>
            <div class="absolute text-center">
              <span id="stat-sla" class="text-sm font-bold text-white">99.99%</span>
            </div>
          </div>
        </div>

        <div class="bg-[#111625] border border-slate-800 rounded-xl p-4 flex flex-col justify-between min-h-[140px]">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPU Util</span>
            <span id="stat-cpu" class="text-base font-bold text-white">18%</span>
          </div>
          <div class="h-16 w-full mt-2" id="chart-cpu-container">
            <svg id="chart-cpu" class="w-full h-full" viewBox="0 0 280 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-cpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path id="path-cpu-area" fill="url(#grad-cpu)" d="M 0 70 Z" />
              <path id="path-cpu" stroke="#f43f5e" stroke-width="2" fill="none" d="M 0 70 Z" />
            </svg>
          </div>
        </div>

        <div class="bg-[#111625] border border-slate-800 rounded-xl p-4 flex flex-col justify-between min-h-[140px]">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Memory RSS</span>
            <span id="stat-mem" class="text-base font-bold text-white">154 MB</span>
          </div>
          <div class="h-16 w-full mt-2" id="chart-mem-container">
            <svg id="chart-mem" class="w-full h-full" viewBox="0 0 280 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-mem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path id="path-mem-area" fill="url(#grad-mem)" d="M 0 70 Z" />
              <path id="path-mem" stroke="#10b981" stroke-width="2" fill="none" d="M 0 70 Z" />
            </svg>
          </div>
        </div>

        <div class="bg-[#111625] border border-slate-800 rounded-xl p-4 flex flex-col justify-between min-h-[140px]">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">p99 Latency / Rate</span>
            <div class="text-right">
              <span id="stat-latency" class="text-sm font-bold text-white block">82 ms</span>
              <span id="stat-rate" class="text-[10px] text-slate-400 block">52 req/s</span>
            </div>
          </div>
          <div class="h-16 w-full mt-2" id="chart-latency-container">
            <svg id="chart-latency" class="w-full h-full" viewBox="0 0 280 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-latency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path id="path-latency-area" fill="url(#grad-latency)" d="M 0 70 Z" />
              <path id="path-latency" stroke="#6366f1" stroke-width="2" fill="none" d="M 0 70 Z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-[#111625] border border-slate-800 rounded-xl p-4 flex flex-col min-h-[160px] md:col-span-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>🚨 Firing Alerts</span>
            <span id="alert-badge-count" class="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono">0 ACTIVE</span>
          </span>
          <div id="alerts-list" class="space-y-2 flex-1 overflow-y-auto max-h-[120px] text-xs scrollbar-thin"></div>
        </div>

        <div class="bg-[#0e1220] border border-slate-800 rounded-xl p-4 flex flex-col min-h-[160px] md:col-span-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">⚡ Alertmanager & Exporter Daemon Logs</span>
          <div id="logs-terminal" class="bg-slate-950/80 border border-slate-900 rounded-lg p-3 font-mono text-[10px] text-slate-300 flex-1 overflow-y-auto max-h-[120px] space-y-1.5 scrollbar-thin"></div>
        </div>
      </div>
    `;

    document.getElementById('btn-cpu-spike').addEventListener('click', () => {
      dashboardState.anomaly = 'cpu_spike';
      addLog(new Date().toLocaleTimeString(), 'INFO', 'Manual action: Injected CPU spike anomaly');
      updateActiveAnomalyButtons();
      updateDashboardState();
      renderLiveMetrics();
    });

    document.getElementById('btn-mem-leak').addEventListener('click', () => {
      dashboardState.anomaly = 'mem_leak';
      addLog(new Date().toLocaleTimeString(), 'INFO', 'Manual action: Injected Memory leak anomaly');
      updateActiveAnomalyButtons();
      updateDashboardState();
      renderLiveMetrics();
    });

    document.getElementById('btn-api-outage').addEventListener('click', () => {
      dashboardState.anomaly = 'api_outage';
      addLog(new Date().toLocaleTimeString(), 'INFO', 'Manual action: Injected API outage anomaly');
      updateActiveAnomalyButtons();
      updateDashboardState();
      renderLiveMetrics();
    });

    document.getElementById('btn-resolve').addEventListener('click', () => {
      dashboardState.anomaly = null;
      addLog(new Date().toLocaleTimeString(), 'INFO', 'Manual action: Triggered anomaly recovery resolution');
      updateActiveAnomalyButtons();
      updateDashboardState();
      renderLiveMetrics();
    });
  }

  updateActiveAnomalyButtons();

  if (!dashboardIntervalId) {
    dashboardIntervalId = setInterval(() => {
      if (activeTab !== 'dashboard') {
        clearInterval(dashboardIntervalId);
        dashboardIntervalId = null;
        return;
      }
      updateDashboardState();
      renderLiveMetrics();
    }, 1500);
  }

  renderLiveMetrics();
}

function updateActiveAnomalyButtons() {
  const anomalies = ['cpu_spike', 'mem_leak', 'api_outage'];
  anomalies.forEach(anom => {
    const btnId = `btn-${anom.replace('_', '-')}`;
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (dashboardState.anomaly === anom) {
      btn.className = 'px-2.5 py-1 bg-indigo-600 text-white border border-indigo-500 text-[9px] font-bold rounded-lg transition';
    } else {
      if (anom === 'cpu_spike') {
        btn.className = 'px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-600/40 text-[9px] font-bold rounded-lg transition';
      } else if (anom === 'mem_leak') {
        btn.className = 'px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-600/40 text-[9px] font-bold rounded-lg transition';
      } else if (anom === 'api_outage') {
        btn.className = 'px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/40 text-[9px] font-bold rounded-lg transition';
      }
    }
  });
}

function renderLiveMetrics() {
  const statSla = document.getElementById('stat-sla');
  const gaugeSlaBar = document.getElementById('gauge-sla-bar');
  const statCpu = document.getElementById('stat-cpu');
  const statMem = document.getElementById('stat-mem');
  const statLatency = document.getElementById('stat-latency');
  const statRate = document.getElementById('stat-rate');
  const alertsList = document.getElementById('alerts-list');
  const logsTerminal = document.getElementById('logs-terminal');
  const alertBadge = document.getElementById('alert-badge-count');

  if (statSla) statSla.textContent = dashboardState.sla.toFixed(2) + '%';
  if (gaugeSlaBar) {
    const C = 238.76;
    const offset = C * (1 - dashboardState.sla / 100);
    gaugeSlaBar.setAttribute('stroke-dashoffset', offset.toFixed(2));
    if (dashboardState.sla >= 99.9) {
      gaugeSlaBar.setAttribute('stroke', '#10b981');
    } else if (dashboardState.sla >= 98) {
      gaugeSlaBar.setAttribute('stroke', '#f59e0b');
    } else {
      gaugeSlaBar.setAttribute('stroke', '#ef4444');
    }
  }

  if (statCpu) statCpu.textContent = dashboardState.cpu + '%';
  if (statMem) statMem.textContent = dashboardState.memory + ' MB';
  if (statLatency) statLatency.textContent = dashboardState.latency + ' ms';
  if (statRate) statRate.textContent = dashboardState.reqRate + ' req/s';

  const cpuPaths = drawSvgPath(dashboardState.history.cpu, 100);
  const pathCpu = document.getElementById('path-cpu');
  const pathCpuArea = document.getElementById('path-cpu-area');
  if (pathCpu) pathCpu.setAttribute('d', cpuPaths.line);
  if (pathCpuArea) pathCpuArea.setAttribute('d', cpuPaths.area);

  const memPaths = drawSvgPath(dashboardState.history.memory, 2000);
  const pathMem = document.getElementById('path-mem');
  const pathMemArea = document.getElementById('path-mem-area');
  if (pathMem) pathMem.setAttribute('d', memPaths.line);
  if (pathMemArea) pathMemArea.setAttribute('d', memPaths.area);

  const latencyPaths = drawSvgPath(dashboardState.history.latency, 2000);
  const pathLatency = document.getElementById('path-latency');
  const pathLatencyArea = document.getElementById('path-latency-area');
  if (pathLatency) pathLatency.setAttribute('d', latencyPaths.line);
  if (pathLatencyArea) pathLatencyArea.setAttribute('d', latencyPaths.area);

  if (alertsList) {
    if (dashboardState.alerts.length === 0) {
      alertsList.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-slate-500 text-center py-6">
          <span class="text-xl mb-1">🛡️</span>
          <span class="font-medium text-[10px]">All systems operational</span>
          <span class="text-[8px] text-slate-600 font-mono mt-0.5">Alertmanager quiet</span>
        </div>
      `;
    } else {
      alertsList.innerHTML = dashboardState.alerts.map(a => {
        const severityBg = a.severity === 'critical' ? 'bg-rose-500 text-slate-950' : 'bg-amber-500 text-slate-950';
        const cardBg = a.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400';
        return `
          <div class="p-2 rounded border ${cardBg} transition duration-200">
            <div class="flex justify-between items-center mb-0.5">
              <span class="font-bold uppercase tracking-wider text-[8px]">${a.name}</span>
              <span class="${severityBg} text-[8px] font-bold px-1 rounded-sm">${a.severity.toUpperCase()}</span>
            </div>
            <p class="text-[9px] leading-tight">${a.msg}</p>
          </div>
        `;
      }).join('');
    }
  }

  if (alertBadge) {
    alertBadge.textContent = `${dashboardState.alerts.length} ACTIVE`;
    if (dashboardState.alerts.length > 0) {
      alertBadge.className = 'bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold animate-pulse';
    } else {
      alertBadge.className = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono';
    }
  }

  if (logsTerminal) {
    logsTerminal.innerHTML = dashboardState.logs.map(l => {
      let levelColor = 'text-emerald-400';
      if (l.level === 'WARNING') levelColor = 'text-amber-400';
      if (l.level === 'ERROR' || l.level === 'CRITICAL') levelColor = 'text-rose-400 font-semibold';
      if (l.level === 'ALERT') levelColor = 'text-indigo-400 font-semibold';
      return `
        <div>
          <span class="text-slate-500">[${l.time}]</span>
          <span class="${levelColor}">[${l.level}]</span>
          <span class="text-slate-300">${escapeHtml(l.msg)}</span>
        </div>
      `;
    }).join('');
    logsTerminal.scrollTop = logsTerminal.scrollHeight;
  }
}

function downloadMonitoringZip() {
      const type = $('install_type').value;
      const cfg = installTypesConfig[type];

      const zip = new JSZip();
      zip.file(cfg.tab1.label, compiledCode.install);
      zip.file(cfg.tab2.label, compiledCode.prometheus);
      zip.file(cfg.tab3.label, compiledCode.service);
      zip.file('grafana-dashboard.json', compiledCode.dashboard);

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
  
    const tabExplanations = {
      'prometheus': {
        'title': 'Prometheus Scraping configuration',
        'filename': 'prometheus.yml',
        'why': 'Declares targets, scraping intervals, and metrics endpoint locations for Prometheus.',
        'when': 'Use to configure Prometheus scraper daemons to monitor host systems and applications.',
        'where': 'Mount into your Prometheus configuration directory.',
        'command': 'prometheus --config.file=prometheus.yml',
        'practices': [
          'Set appropriate scrape_interval values (15s to 30s) to balance load.',
          'Configure target endpoint DNS names statically or dynamically.',
          'Decouple rules file configurations.'
        ],
        'ai_mlops': 'Audits GPU compute utilization and latency properties of the **SRE GenAI Copilot**.',
        'flow': '[Prometheus Engine] ➔ Scrapes ➔ [App Metrics Endpoint] ➔ [Saves to TSDB]'
      },
      'alertmanager': {
        'title': 'Alertmanager Configuration',
        'filename': 'alertmanager.yml',
        'why': 'Configures alerting routing trees, grouping alarms, and pushing incidents to Slack/PagerDuty channels.',
        'when': 'Use to route alert incidents to SRE response teams dynamically.',
        'where': 'Deploy inside the Alertmanager configuration namespace.',
        'command': '# Automatically read by Alertmanager system daemon',
        'practices': [
          'Group identical alert alerts to prevent spamming notifications.',
          'Set up fallback pager alerts for critical failures.',
          'Maintain quiet windows configurations.'
        ],
        'ai_mlops': 'Sends event alerts to webhooks integrated with the **Self-Healing Infrastructure Platform**.',
        'flow': '[Prometheus Alert] ➔ [Alertmanager] ➔ [Group & Route] ➔ [Slack / PagerDuty Alert]'
      },
      'grafana': {
        'title': 'Grafana Dashboard Model',
        'filename': 'grafana-dashboard.json',
        'why': 'Defines the JSON layout of your Grafana dashboard panels, visualizing CPU, Memory, network traffic, and error rates.',
        'when': 'Import into Grafana to instantly monitor the health of your services visually.',
        'where': 'Import via the Grafana web dashboard portal.',
        'command': '# Upload JSON file via Grafana Web import UI',
        'practices': [
          'Group dashboard panels into collapsible rows.',
          'Set up clear threshold colors (Green/Yellow/Red) for status panels.',
          'Keep variables dynamically configurable (e.g. env or namespace).'
        ],
        'ai_mlops': 'Visualizes token throughput and inference efficiency of the **RAG Knowledge Chatbot**.',
        'flow': '[Prometheus TSDB] ➔ [Grafana Panel Query] ➔ [Visual Charts Render]'
      },
      'readme': {
        'title': 'Observability Guide',
        'filename': 'README.md',
        'why': 'Explains how to access monitoring endpoints, import dashboards, and setup alerts.',
        'when': 'Include in the telemetry repository to guide SREs on setting up Grafana and Alertmanager.',
        'where': 'Save in the root of the monitoring folder.',
        'command': '# View in markdown viewer',
        'practices': [
          'Provide Grafana portal login links.',
          'List active Slack alert channel names.',
          'Document alert threshold formulas.'
        ],
        'ai_mlops': 'Guides telemetry configurations for monitoring running LLM models.',
        'flow': '[README.md Guide] ➔ [Guides SRE telemetry configurations]'
      },
      'service': {
        'title': 'Systemd Service Unit / Daemon Daemon Config',
        'filename': 'node-exporter.service',
        'why': 'Declares the service lifecycle policies and user privileges for the Node Exporter daemon.',
        'when': 'Use to configure systemd on VMs or DaemonSets on Kubernetes to ensure persistent execution of metrics exporter processes.',
        'where': 'Deploy as /etc/systemd/system/node-exporter.service or as a DaemonSet manifest in your cluster.',
        'command': 'systemctl enable --now node-exporter',
        'practices': [
          'Run daemon processes under dedicated, unprivileged system users (e.g. node_exporter).',
          'Configure automated restart on failure after short delay limits.',
          'Use hostNetwork mapping when launching exporter containers in Kubernetes.'
        ],
        'ai_mlops': 'Collects host telemetry specs for checking LLM node scaling operations.',
        'flow': '[System Daemon] ➔ Spawns ➔ [Node Exporter Process] ➔ Exposes ➔ [Metrics Port 9100]'
      }
    };

    function explainActiveTabCode() {
      let key = activeTab;
      if (activeTab === 'install') key = 'readme';
      if (activeTab === 'service') key = 'service';
      if (activeTab === 'dashboard') key = 'grafana';

      const explanation = tabExplanations[key];
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
