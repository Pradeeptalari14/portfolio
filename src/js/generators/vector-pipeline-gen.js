// Vector Observability Pipeline script

const SCRIPT_VERSION = "1.0.0";

function initVectorStudio() {
  const elements = {
    sourceType: document.getElementById('log_sources'),
    transformIp: document.getElementById('trans_ip_anon'),
    transformRegex: document.getElementById('trans_regex'),
    transformJson: document.getElementById('trans_json'),
    sinkType: document.getElementById('log_sinks'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Sandbox controls
    simLogType: document.getElementById('sim_log_type'),
    btnRemap: document.getElementById('btn_run_remap'),
    rawInputBox: document.getElementById('raw-log-input'),
    parsedOutputBox: document.getElementById('parsed-json-output'),
  };

  let activeTab = 'vector';

  function generateVectorToml() {
    const src = elements.sourceType ? elements.sourceType.value : 'syslog';
    const anon = elements.transformIp ? elements.transformIp.checked : true;
    const regex = elements.transformRegex ? elements.transformRegex.checked : false;
    const json = elements.transformJson ? elements.transformJson.checked : true;
    const sink = elements.sinkType ? elements.sinkType.value : 'elasticsearch';

    let toml = `# Vector Configuration (TOML) - Compiled v${SCRIPT_VERSION}
# Global telemetry configuration
[api]
  enabled = true
  address = "0.0.0.0:8686"

# ── LOG SOURCES ──
`;

    if (src === 'syslog') {
      toml += `[sources.syslog_in]
  type = "syslog"
  address = "0.0.0.0:514"
  mode = "tcp"
`;
    } else if (src === 'docker_logs') {
      toml += `[sources.docker_in]
  type = "docker_logs"
  exclude_containers = ["vector"]
`;
    } else if (src === 'kubernetes_logs') {
      toml += `[sources.k8s_in]
  type = "kubernetes_logs"
  auto_partial_merge = true
`;
    }

    toml += `\n# ── LOG TRANSFORMS ──\n`;
    
    let activeSource = src === 'syslog' ? 'syslog_in' : (src === 'docker_logs' ? 'docker_in' : 'k8s_in');
    let lastTransform = activeSource;

    if (json) {
      toml += `[transforms.parse_json]
  type = "remap"
  inputs = ["${lastTransform}"]
  source = '''
  # Parse message field as JSON schema
  parsed, err = parse_json(.message)
  if err != null {
    .err = err
  } else {
    del(.message)
    . = merge(., parsed)
  }
  '''
`;
      lastTransform = 'parse_json';
    }

    if (regex) {
      toml += `[transforms.regex_extract]
  type = "remap"
  inputs = ["${lastTransform}"]
  source = '''
  # Extract patterns from unstructured content
  matched, err = parse_regex(.message, r'^(?P<host>\\S+) (?P<user>\\S+) (?P<bytes>\\d+)$')
  if err == null {
    . = merge(., matched)
  }
  '''
`;
      lastTransform = 'regex_extract';
    }

    if (anon) {
      toml += `[transforms.anonymize_ip]
  type = "remap"
  inputs = ["${lastTransform}"]
  source = '''
  # Anonymize IP address values to comply with PII policies
  if exists(.client_ip) {
    .client_ip = replace(.client_ip, r'\\d+$', "xxx")
  }
  if exists(.ip) {
    .ip = replace(.ip, r'\\d+$', "xxx")
  }
  '''
`;
      lastTransform = 'anonymize_ip';
    }

    toml += `\n# ── LOG EXPORTERS (SINKS) ──\n`;
    if (sink === 'elasticsearch') {
      toml += `[sinks.elasticsearch_out]
  type = "elasticsearch"
  inputs = ["${lastTransform}"]
  endpoints = ["http://elasticsearch.monitoring.svc.cluster.local:9200"]
  mode = "bulk"
  compression = "gzip"
`;
    } else if (sink === 'aws_s3') {
      toml += `[sinks.s3_out]
  type = "aws_s3"
  inputs = ["${lastTransform}"]
  bucket = "company-audit-logs"
  region = "us-east-1"
  compression = "gzip"
  key_prefix = "vector/year=%Y/month=%m/day=%d/"
`;
    } else if (sink === 'datadog') {
      toml += `[sinks.datadog_out]
  type = "datadog_logs"
  inputs = ["${lastTransform}"]
  default_api_key = "\${DATADOG_API_KEY}"
  site = "datadoghq.com"
`;
    }

    return toml;
  }

  function generateDaemonsetYaml() {
    return `# Kubernetes Vector Daemonset configuration
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: vector-agent
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: vector-agent
  template:
    metadata:
      labels:
        app: vector-agent
    spec:
      containers:
        - name: vector
          image: timberio/vector:0.35.0-distroless-libc
          args: ["--config", "/etc/vector/vector.toml"]
          volumeMounts:
            - name: config
              mountPath: /etc/vector
            - name: varlog
              mountPath: /var/log
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: vector-config
        - name: varlog
          hostPath:
            path: /var/log
`;
  }

  function generateCliCommands() {
    return `# Vector Agent Management CLI Guide
# 1. Start Vector locally using binary package
vector --config vector.toml

# 2. Validate Vector TOML syntax structure
vector validate --config vector.toml

# 3. Apply Kubernetes components
kubectl create configmap vector-config --from-file=vector.toml -n monitoring
kubectl apply -f vector-daemonset.yaml

# 4. Stream and verify log forwarding in real-time
kubectl logs -f daemonset/vector-agent -n monitoring
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'vector') {
      elements.outputBox.textContent = generateVectorToml();
      if (elements.downloadInput) elements.downloadInput.value = 'vector.toml';
    } else if (activeTab === 'daemonset') {
      elements.outputBox.textContent = generateDaemonsetYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'vector-agent.yaml';
    } else if (activeTab === 'cli') {
      elements.outputBox.textContent = generateCliCommands();
      if (elements.downloadInput) elements.downloadInput.value = 'vector-deploy.sh';
    }
  }

  // VRL Sandbox simulator log templates
  const logTemplates = {
    nginx: `{"client_ip": "172.56.29.14", "request": "GET /api/v1/checkout HTTP/1.1", "status": 200, "bytes_sent": 4821, "userAgent": "Mozilla/5.0"}`,
    syslog: `<30>Oct 11 22:14:15 host-app-2.local security: [auth] Failed login attempt for user admin from 192.168.1.105`,
    audit: `{"ip": "10.0.4.92", "user_id": "usr-94812", "action": "DELETE_USER", "auth_token": "bearer-secret-token-key-abc"}`,
  };

  function updateRawLogInput() {
    if (!elements.rawInputBox) return;
    const type = elements.simLogType ? elements.simLogType.value : 'nginx';
    elements.rawInputBox.value = logTemplates[type] || '';
  }

  function runRemapLogs() {
    if (!elements.parsedOutputBox || !elements.rawInputBox) return;

    const type = elements.simLogType ? elements.simLogType.value : 'nginx';
    const rawVal = elements.rawInputBox.value;
    const anon = elements.transformIp ? elements.transformIp.checked : true;

    elements.parsedOutputBox.textContent = "Remapping logs in sandbox engine...";

    setTimeout(() => {
      let parsed = {};
      try {
        if (type === 'nginx' || type === 'audit') {
          parsed = JSON.parse(rawVal);
        } else {
          parsed = {
            raw: rawVal,
            facility: 3,
            severity: 6,
            timestamp: new Date().toISOString(),
            hostname: "host-app-2.local",
            message: "Failed login attempt for user admin from 192.168.1.105",
            client_ip: "192.168.1.105"
          };
        }

        // Anonymization simulation
        if (anon) {
          if (parsed.client_ip) {
            parsed.client_ip = parsed.client_ip.replace(/\.\d+$/, ".xxx").replace(/:\d+$/, ":xxx");
          }
          if (parsed.ip) {
            parsed.ip = parsed.ip.replace(/\.\d+$/, ".xxx");
          }
        }

        // Mask token fields if audit
        if (type === 'audit' && parsed.auth_token) {
          parsed.auth_token = "******** (masked)";
        }

        elements.parsedOutputBox.textContent = JSON.stringify(parsed, null, 2);
      } catch (err) {
        elements.parsedOutputBox.textContent = `VRL Error: JSON compilation mismatch.\nDetail: ${err.message}`;
      }
    }, 150);
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    // Toggle active classes on tab buttons
    ['vector', 'daemonset', 'cli', 'simulator'].forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      if (btn) {
        if (tab === tabName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    const outputBox = elements.outputBox;
    const simViewport = document.getElementById('simulator-viewport');

    if (tabName === 'simulator') {
      if (outputBox) outputBox.classList.add('hidden');
      if (simViewport) simViewport.classList.remove('hidden');
      updateRawLogInput();
      runRemapLogs();
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.sourceType, elements.transformIp, elements.transformRegex, elements.transformJson, elements.sinkType].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.simLogType) {
    elements.simLogType.addEventListener('change', () => {
      updateRawLogInput();
      runRemapLogs();
    });
  }

  if (elements.btnRemap) elements.btnRemap.addEventListener('click', runRemapLogs);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('log_sources')) {
    initVectorStudio();
  }
});
window.initVectorStudio = initVectorStudio;

