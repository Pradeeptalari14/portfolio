// OpenTelemetry Configurator script

const SCRIPT_VERSION = "1.0.0";

function initOtelStudio() {
  const elements = {
    recOtlp: document.getElementById('rec_otlp'),
    recProm: document.getElementById('rec_prom'),
    recHost: document.getElementById('rec_host'),
    procBatch: document.getElementById('proc_batch'),
    procMem: document.getElementById('proc_mem'),
    procFilter: document.getElementById('proc_filter'),
    expOtlp: document.getElementById('exp_otlp'),
    expProm: document.getElementById('exp_prom'),
    expLog: document.getElementById('exp_log'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Debugger controls
    simTraceType: document.getElementById('sim_trace_type'),
    btnSendTrace: document.getElementById('btn_send_trace'),
    recNode: document.getElementById('rec-node'),
    procNode: document.getElementById('proc-node'),
    expNode: document.getElementById('exp-node'),
    debugLogs: document.getElementById('debug-logs-output'),
  };

  let activeTab = 'config';

  function generateCollectorConfig() {
    const o_otlp = elements.recOtlp ? elements.recOtlp.checked : true;
    const o_prom = elements.recProm ? elements.recProm.checked : false;
    const o_host = elements.recHost ? elements.recHost.checked : false;
    const p_batch = elements.procBatch ? elements.procBatch.checked : true;
    const p_mem = elements.procMem ? elements.procMem.checked : true;
    const p_filt = elements.procFilter ? elements.procFilter.checked : false;
    const e_otlp = elements.expOtlp ? elements.expOtlp.checked : true;
    const e_prom = elements.expProm ? elements.expProm.checked : false;
    const e_log = elements.expLog ? elements.expLog.checked : true;

    let yaml = `# OpenTelemetry Collector Pipeline Configuration v${SCRIPT_VERSION}
receivers:
`;
    if (o_otlp) {
      yaml += `  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
`;
    }
    if (o_prom) {
      yaml += `  prometheus:
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          scrape_interval: 15s
          static_configs:
            - targets: ['0.0.0.0:8888']
`;
    }
    if (o_host) {
      yaml += `  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
      memory:
      network:
`;
    }

    yaml += `\nprocessors:\n`;
    if (p_mem) {
      yaml += `  memory_limiter:
    check_interval: 1s
    limit_percentage: 75
    spike_limit_percentage: 15
`;
    }
    if (p_batch) {
      yaml += `  batch:
    send_batch_size: 8192
    timeout: 5s
`;
    }
    if (p_filt) {
      yaml += `  filter/auth:
    error_mode: ignore
    traces:
      span:
        - 'attributes["http.request.header.authorization"] != nil'
`;
    }

    yaml += `\nexporters:\n`;
    if (e_otlp) {
      yaml += `  otlp/jaeger:
    endpoint: jaeger-collector:4317
    tls:
      insecure: true
`;
    }
    if (e_prom) {
      yaml += `  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: otel
`;
    }
    if (e_log) {
      yaml += `  logging:
    verbosity: normal
`;
    }

    yaml += `\nservice:
  pipelines:
    traces:
      receivers: [${o_otlp ? 'otlp' : ''}]
      processors: [${p_mem ? 'memory_limiter' : ''}${p_mem && p_batch ? ', ' : ''}${p_batch ? 'batch' : ''}${p_filt ? ', filter/auth' : ''}]
      exporters: [${e_otlp ? 'otlp/jaeger' : ''}${e_otlp && e_log ? ', ' : ''}${e_log ? 'logging' : ''}]
    metrics:
      receivers: [${o_prom ? 'prometheus' : ''}${o_prom && o_host ? ', ' : ''}${o_host ? 'hostmetrics' : ''}]
      processors: [${p_mem ? 'memory_limiter' : ''}${p_mem && p_batch ? ', ' : ''}${p_batch ? 'batch' : ''}]
      exporters: [${e_prom ? 'prometheus' : ''}${e_prom && e_log ? ', ' : ''}${e_log ? 'logging' : ''}]
  telemetry:
    logs:
      level: "info"
`;

    // Clean brackets
    return yaml.replace(/\[\s*,/g, '[').replace(/,\s*\]/g, ']').replace(/\[\s*\]/g, '[]').replace(/\,\s*\,/g, ',');
  }

  function generateDeploymentYaml() {
    return `# Kubernetes deployment configuration for OTEL Collector
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-collector
  namespace: monitoring
spec:
  replicas: 2
  selector:
    matchLabels:
      app: otel-collector
  template:
    metadata:
      labels:
        app: otel-collector
    spec:
      containers:
        - name: otel-collector
          image: otel/opentelemetry-collector-contrib:0.90.0
          args: ["--config=/etc/otelcol/config.yaml"]
          volumeMounts:
            - name: config-volume
              mountPath: /etc/otelcol
          ports:
            - name: otlp-grpc
              containerPort: 4317
            - name: otlp-http
              containerPort: 4318
            - name: prom-exporter
              containerPort: 8889
      volumes:
        - name: config-volume
          configMap:
            name: otel-collector-config
`;
  }

  function generateCliCommands() {
    return `# OpenTelemetry collector diagnostic CLI commands
# 1. Apply configmap and deployment specs
kubectl create configmap otel-collector-config --from-file=config.yaml -n monitoring
kubectl apply -f deployment.yaml

# 2. Check deployment telemetry ports routing
kubectl get endpoints otel-collector -n monitoring

# 3. Inject trace segment using cURL via HTTP
curl -i -X POST http://localhost:4318/v1/traces \\
  -H "Content-Type: application/json" \\
  -d '{"resourceSpans": [{"resource": {"attributes": [{"key": "service.name", "value": {"stringValue": "DemoApp"}}]}, "scopeSpans": [{"spans": [{"traceId": "4bf92f3577b34da6a3ce929d0e0e4736", "spanId": "00f067aa0ba902b7", "name": "GET /api/users", "kind": 1, "startTimeUnixNano": 1600000000000000000, "endTimeUnixNano": 1600000005000000000}]}]}]}'
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'config') {
      elements.outputBox.textContent = generateCollectorConfig();
      if (elements.downloadInput) elements.downloadInput.value = 'otel-collector-config.yaml';
    } else if (activeTab === 'deployment') {
      elements.outputBox.textContent = generateDeploymentYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'otel-deployment.yaml';
    } else if (activeTab === 'cli') {
      elements.outputBox.textContent = generateCliCommands();
      if (elements.downloadInput) elements.downloadInput.value = 'otel-verify.sh';
    }
  }

  // Trigger telemetry debugger visual flow
  function sendTraceSample() {
    if (!elements.debugLogs) return;

    const traceType = elements.simTraceType ? elements.simTraceType.value : '200';
    elements.debugLogs.innerHTML = '';
    
    // Animate flow stages
    const highlightNode = (node, duration) => {
      return new Promise(resolve => {
        if (node) {
          node.classList.add('bg-orange-500/20', 'border-orange-500');
          node.classList.remove('bg-slate-900', 'border-slate-800');
        }
        setTimeout(() => {
          if (node) {
            node.classList.remove('bg-orange-500/20', 'border-orange-500');
            node.classList.add('bg-slate-900', 'border-slate-800');
          }
          resolve();
        }, duration);
      });
    };

    const addLog = (msg, type = 'info') => {
      const row = document.createElement('div');
      row.className = type === 'error' ? 'text-rose-500' : (type === 'warn' ? 'text-amber-500' : 'text-slate-300');
      row.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      elements.debugLogs.appendChild(row);
      elements.debugLogs.scrollTop = elements.debugLogs.scrollHeight;
    };

    addLog("Injecting request packet sample payload...");

    highlightNode(elements.recNode, 800)
      .then(() => {
        addLog("RECEIVER: Payload matched OTLP gRPC endpoint.");
        addLog("RECEIVER: Extracted trace headers (traceId=4bf92f3577b3...)");
        return highlightNode(elements.procNode, 1000);
      })
      .then(() => {
        addLog("PROCESSOR: Routing span payload to processing unit.");
        addLog("PROCESSOR: memory_limiter - validation completed.");
        if (traceType === '500') {
          addLog("PROCESSOR: batch - queued transaction batch sizing index.", "warn");
        } else if (traceType === 'slow') {
          addLog("PROCESSOR: filter - warning: authorization headers dropped securely.", "warn");
        }
        return highlightNode(elements.expNode, 800);
      })
      .then(() => {
        addLog("EXPORTER: Pushing payload stream metrics endpoint.");
        if (traceType === '500') {
          addLog("EXPORTER: Logged error status trace (http.status_code=500)", "error");
          addLog("EXPORTER: Jaeger pushing successful.", "info");
        } else if (traceType === 'slow') {
          addLog("EXPORTER: Trace pushed (latency=1250ms)", "warn");
        } else {
          addLog("EXPORTER: Pipeline transmission complete (result=HTTP 200 OK)", "info");
        }
      });
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    // Toggle active classes on tab buttons
    ['config', 'deployment', 'cli', 'simulator'].forEach(tab => {
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
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [
    elements.recOtlp, elements.recProm, elements.recHost,
    elements.procBatch, elements.procMem, elements.procFilter,
    elements.expOtlp, elements.expProm, elements.expLog
  ].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.btnSendTrace) elements.btnSendTrace.addEventListener('click', sendTraceSample);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('rec_otlp')) {
    initOtelStudio();
  }
});
window.initOtelStudio = initOtelStudio;

