import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'install';

    let compiledCode = {
      install: '',
      config: '',
      service: ''
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      $('log_stack').addEventListener('change', function() {
        const configBtn = $('tab-config');
        if (this.value === 'elk') {
          configBtn.textContent = 'logstash.conf';
          $('log_endpoint').value = 'http://localhost:9200';
          $('collector_port').value = '5044';
        } else {
          configBtn.textContent = 'promtail-config.yml';
          $('log_endpoint').value = 'http://localhost:3100/loki/api/v1/push';
          $('collector_port').value = '9080';
        }
        triggerCompileAll();
      });

      setupCompilerTriggers(triggerCompileAll);
    }

    function triggerCompileAll() {
      compileInstall();
      compileConfig();
      compileService();
      updateViewportContent();
    }

    function compileInstall() {
      const stack = $('log_stack').value;
      const port = $('collector_port').value;

      let code = `#!/bin/bash\n# install-logging.sh - Logging Telemetry pipeline provisioner compiled via Pradeep's Studio\nset -e\n\n`;
      code += `echo "⏱️ Initializing log parser telemetry setups..."\n`;
      code += `sudo apt-get update -y && sudo apt-get install -y curl unzip\n\n`;

      if (stack === 'elk') {
        code += `# ── LOGSTASH SYSTEM PIPELINE INSTALLATION ──\n`;
        code += `echo "Adding Elasticsearch GPG Key and Logstash Repository..."\n`;
        code += `wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic-keyring.gpg\n`;
        code += `echo "deb [signed-by=/usr/share/keyrings/elastic-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee -dev /etc/apt/sources.list.d/elastic-8.x.list\n`;
        code += `sudo apt-get update -y && sudo apt-get install -y logstash\n\n`;
        code += `echo "Copying local custom pipeline properties configurations..."\n`;
        code += `sudo cp logstash.conf /etc/logstash/conf.d/logstash.conf\n`;
        code += `sudo systemctl daemon-reload\n`;
        code += `sudo systemctl enable logstash\n`;
        code += `sudo systemctl start logstash\n`;
      } else {
        code += `# ── PROMTAIL LOKI CLIENT INSTALLATION ──\n`;
        code += `echo "Downloading Promtail binary from repository..."\n`;
        code += `curl -LO "https://github.com/grafana/loki/releases/download/v2.9.0/promtail-linux-amd64.zip"\n`;
        code += `unzip promtail-linux-amd64.zip\n`;
        code += `sudo mv promtail-linux-amd64 /usr/local/bin/promtail\n`;
        code += `sudo useradd --no-create-home --shell /bin/false promtail || true\n\n`;
        code += `echo "Configuring secure system configurations paths..."\n`;
        code += `sudo mkdir -p /etc/promtail\n`;
        code += `sudo cp promtail-config.yml /etc/promtail/promtail-config.yml\n`;
        code += `sudo cp logging-daemon.service /etc/systemd/system/promtail.service\n`;
        code += `sudo systemctl daemon-reload\n`;
        code += `sudo systemctl enable promtail\n`;
        code += `sudo systemctl start promtail\n`;
      }

      code += `\necho "✅ Telemetry log systems successfully registered! check status."\n`;
      compiledCode.install = code;
    }

    function compileConfig() {
      const stack = $('log_stack').value;
      const port = $('collector_port').value;
      const endpoint = $('log_endpoint').value;
      const scrapePath = $('scrape_dir').value;

      const isSys = $('collect_syslog').checked;
      const isNginx = $('collect_nginx').checked;
      const filterKeys = $('filter_regex').value.split(',').map(k => k.trim()).filter(Boolean);

      let code = '';

      if (stack === 'elk') {
        code += `# logstash.conf v${SCRIPT_VERSION} pipelines config overrides\n\n`;
        code += `input {\n  beats {\n    port => ${port}\n  }\n}\n\n`;
        code += `filter {\n`;
        if (filterKeys.length > 0) {
          code += `  # Purge sensitive API keys/passwords credentials to conform with SRE rules\n`;
          filterKeys.forEach(key => {
            code += `  mutate {\n    gsub => [ "message", "${key}=[^&\\s]+", "${key}=REDACTED" ]\n  }\n`;
          });
        }
        code += `}\n\n`;
        code += `output {\n  elasticsearch {\n    hosts => ["${endpoint}"]\n    index => "logstash-sre-metrics-%{+YYYY.MM.dd}"\n  }\n}\n`;
      } else {
        code += `# promtail-config.yml scrapers yaml configuration\n\n`;
        code += `server:\n  http_listen_port: ${port}\n  grpc_listen_port: 0\n\n`;
        code += `positions:\n  filename: /tmp/positions.yaml\n\n`;
        code += `clients:\n  - url: "${endpoint}"\n\n`;
        code += `scrape_configs:\n`;
        
        code += `  - job_name: system-logs\n    static_configs:\n      - targets: [localhost]\n        labels:\n          job: varlogs\n          host: localhost\n          __path__: ${scrapePath}\n`;

        if (isSys) {
          code += `\n  - job_name: syslogs\n    static_configs:\n      - targets: [localhost]\n        labels:\n          job: syslog\n          __path__: /var/log/syslog\n`;
        }
        if (isNginx) {
          code += `\n  - job_name: nginxlogs\n    static_configs:\n      - targets: [localhost]\n        labels:\n          job: nginx\n          __path__: /var/log/nginx/*.log\n`;
        }
      }

      compiledCode.config = code;
    }

    function compileService() {
      const stack = $('log_stack').value;
      let code = '';

      if (stack === 'elk') {
        code += `# Systemd service daemon template for Logstash (Elastic)\n`;
        code += `[Unit]\nDescription=Logstash System Log Parser daemon\nAfter=network.target\n\n[Service]\nUser=logstash\nGroup=logstash\nExecStart=/usr/share/logstash/bin/logstash --path.settings /etc/logstash\n\n[Install]\nWantedBy=multi-user.target\n`;
      } else {
        code += `# /etc/systemd/system/promtail.service\n`;
        code += `[Unit]\nDescription=Promtail Loki log agent scraper daemon\nAfter=network.target\n\n[Service]\nUser=promtail\nGroup=promtail\nType=simple\nExecStart=/usr/local/bin/promtail -config.file=/etc/promtail/promtail-config.yml\n\n[Install]\nWantedBy=multi-user.target\n`;
      }

      compiledCode.service = code;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');
      const stack = $('log_stack').value;

      if (tabId === 'install') {
        nameBox.value = 'install';
        extTag.textContent = '.sh';
      } else if (tabId === 'config') {
        if (stack === 'elk') {
          nameBox.value = 'logstash';
          extTag.textContent = '.conf';
        } else {
          nameBox.value = 'promtail-config';
          extTag.textContent = '.yml';
        }
      } else if (tabId === 'service') {
        if (stack === 'elk') {
          nameBox.value = 'logstash';
          extTag.textContent = '.service';
        } else {
          nameBox.value = 'promtail';
          extTag.textContent = '.service';
        }
      }
      updateViewportContent();
    }

    function updateViewportContent() {
      $('output-box').textContent = compiledCode[activeTab];
    }

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        showToast('✅ Copied tab config to clipboard!');
      });
    }

    function downloadLoggingZip() {
      const stack = $('log_stack').value;
      const zip = new JSZip();
      
      zip.file('install.sh', compiledCode.install);
      if (stack === 'elk') {
        zip.file('logstash.conf', compiledCode.config);
        zip.file('logstash.service', compiledCode.service);
      } else {
        zip.file('promtail-config.yml', compiledCode.config);
        zip.file('promtail.service', compiledCode.service);
      }

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${stack}-logging-resources.zip`;
        a.click();
        showToast('⬇️ logging resources downloaded successfully!');
      });
    }

    function clearAllFields() {
      $('log_stack').value = 'loki';
      $('collector_port').value = '9080';
      $('log_endpoint').value = 'http://localhost:3100/loki/api/v1/push';
      $('scrape_dir').value = '/var/log/**/*.log';
      $('collect_syslog').checked = true;
      $('collect_nginx').checked = true;
      $('filter_regex').value = 'password, TOKEN, api_key';

      // reset tab visual
      $('tab-config').textContent = 'promtail-config.yml';

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
  
    const tabExplanations = {'logging': {'title': 'Logstash Pipeline Configuration', 'filename': 'logstash.conf', 'why': 'Configures data intake pipelines (logstash or promtail), defining metrics filters, indices creations, and central elasticsearch/loki targets.', 'when': 'Use to forward, parse, and centralize logs across microservice environments.', 'where': 'Deploy within the logging coordinator node namespace.', 'command': 'logstash -f logstash.conf', 'practices': ['Enforce JSON format inside application logs.', 'Filter out secure PII data before indexing log blocks.', 'Utilize index life management rules to save storage space.'], 'ai_mlops': 'Scrapes system log lines parsed directly by the **AI-Powered Log Analyzer**.', 'flow': '[Logs source] ➔ [Shipper Pipeline] ➔ [Filters/Parses] ➔ [Indices in Elasticsearch]'}, 'readme': {'title': 'Logging Setup Guide', 'filename': 'README.md', 'why': 'Explains how to install log collectors, configure indexes, and query logs.', 'when': 'Include in your logging workspace folder.', 'where': 'Save in the root of the logging repository.', 'command': '# View on documentation wiki', 'practices': ['List Kibana/Grafana query patterns.', 'Document retention window parameters.', 'Outline shipper configurations.'], 'ai_mlops': 'Explains how to hook up collectors to forward log telemetry to the AI engine.', 'flow': '[README.md Guide] ➔ [Enables fast troubleshooting via logs]'}};

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
window.downloadLoggingZip = downloadLoggingZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
