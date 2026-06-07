// LLM Observability & Tracing Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initLlmTracingStudio() {
  const elements = {
    provider: document.getElementById('tr_provider'),
    otelEndpoint: document.getElementById('tr_otel_endpoint'),
    postgresDb: document.getElementById('tr_postgres_db'),
    postgresUser: document.getElementById('tr_postgres_user'),
    enableMetrics: document.getElementById('tr_enable_metrics'),
    enableTracing: document.getElementById('tr_enable_tracing'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-tr'),
    btnDownload: document.getElementById('btn-download-tr'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'tr_compose';
  let compiledCode = {
    tr_compose: '',
    tr_instrument: '',
    tr_otel: '',
    tr_flow: ''
  };

  function compileConfigs() {
    const prov = elements.provider ? elements.provider.value : 'langfuse';
    const endpoint = elements.otelEndpoint ? elements.otelEndpoint.value : 'http://localhost:4317';
    const dbName = elements.postgresDb ? elements.postgresDb.value : 'langfuse_db';
    const dbUser = elements.postgresUser ? elements.postgresUser.value : 'langfuse_user';
    const collectMetrics = elements.enableMetrics ? elements.enableMetrics.checked : true;
    const autoTracing = elements.enableTracing ? elements.enableTracing.checked : true;

    // 1. Compile Docker Compose (tr_compose)
    let compose = `version: '3.8'\n\nservices:\n`;
    if (prov === 'langfuse') {
      compose += `  postgres:\n`;
      compose += `    image: postgres:15-alpine\n`;
      compose += `    container_name: langfuse_postgres\n`;
      compose += `    environment:\n`;
      compose += `      POSTGRES_DB: ${dbName}\n`;
      compose += `      POSTGRES_USER: ${dbUser}\n`;
      compose += `      POSTGRES_PASSWORD: strong_tracing_password_99\n`;
      compose += `    ports:\n`;
      compose += `      - "5432:5432"\n`;
      compose += `    volumes:\n`;
      compose += `      - pgdata:/var/lib/postgresql/data\n\n`;

      compose += `  langfuse:\n`;
      compose += `    image: langfuse/langfuse:latest\n`;
      compose += `    container_name: langfuse_server\n`;
      compose += `    depends_on:\n`;
      compose += `      - postgres\n`;
      compose += `    ports:\n`;
      compose += `      - "3000:3000"\n`;
      compose += `    environment:\n`;
      compose += `      - DATABASE_URL=postgresql://${dbUser}:strong_tracing_password_99@postgres:5432/${dbName}\n`;
      compose += `      - NEXTAUTH_SECRET=my_super_secret_auth_key_123\n`;
      compose += `      - NEXTAUTH_URL=http://localhost:3000\n`;
      compose += `      - SALT=custom_salt_for_encryption\n`;
      if (collectMetrics) {
        compose += `      - TELEMETRY_ENABLED=true\n`;
      }
    } else {
      // Arize Phoenix
      compose += `  phoenix:\n`;
      compose += `    image: arize-phoenix:latest\n`;
      compose += `    container_name: arize_phoenix\n`;
      compose += `    ports:\n`;
      compose += `      - "6006:6006" # Web UI\n`;
      compose += `      - "4317:4317" # OTel gRPC\n`;
      compose += `      - "4318:4318" # OTel HTTP\n`;
      compose += `    environment:\n`;
      compose += `      - PHOENIX_PORT=6006\n`;
      compose += `      - PHOENIX_GRPC_PORT=4317\n`;
    }

    if (collectMetrics) {
      compose += `\n  otel-collector:\n`;
      compose += `    image: otel/opentelemetry-collector-contrib:latest\n`;
      compose += `    container_name: otel_collector\n`;
      compose += `    volumes:\n`;
      compose += `      - ./otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml\n`;
      compose += `    ports:\n`;
      compose += `      - "8889:8889" # Prometheus exporter metrics\n`;
      if (prov === 'langfuse') {
        compose += `      - "4317:4317" # OTel receiver port\n`;
      }
    }

    if (prov === 'langfuse') {
      compose += `\nvolumes:\n  pgdata:\n`;
    }
    compiledCode.tr_compose = compose;

    // 2. Compile python instrumentation (tr_instrument)
    let inst = `import os\n`;
    if (prov === 'langfuse') {
      inst += `from langfuse import Langfuse\n`;
      inst += `from langfuse.openai import openai # Wraps OpenAI SDK automatically\n\n`;
      inst += `# Initialize Langfuse Client\n`;
      inst += `langfuse = Langfuse(\n`;
      inst += `    public_key="pk-lf-...",\n`;
      inst += `    secret_key="sk-lf-...",\n`;
      inst += `    host="http://localhost:3000"\n`;
      inst += `)\n\n`;
      inst += `# Auto-instrumented completion call\n`;
      inst += `response = openai.chat.completions.create(\n`;
      inst += `    name="sre-production-alert-analyzer",\n`;
      inst += `    model="gpt-4o",\n`;
      inst += `    messages=[{"role": "user", "content": "Analyze container memory usage anomalies."}],\n`;
      inst += `    metadata={"environment": "production", "version": "v1.1.0"}\n`;
      inst += `)\n`;
      inst += `print("Trace ID:", response.langfuse_trace_id)\n`;
    } else {
      // OpenLLMetry
      inst += `from opentelemetry import trace\n`;
      inst += `from opentelemetry.sdk.trace import TracerProvider\n`;
      inst += `from opentelemetry.sdk.trace.export import BatchSpanProcessor\n`;
      inst += `from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter\n`;
      inst += `from openinference.instrumentation.openai import OpenAIInstrumentor\n\n`;
      inst += `# Setup Tracer Provider\n`;
      inst += `provider = TracerProvider()\n`;
      inst += `processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="${endpoint}"))\n`;
      inst += `provider.add_span_processor(processor)\n`;
      inst += `trace.set_tracer_provider(provider)\n\n`;
      if (autoTracing) {
        inst += `# Auto-instrument OpenAI Calls\n`;
        inst += `OpenAIInstrumentor().instrument()\n\n`;
      }
      inst += `print("OpenTelemetry tracing initiated successfully targeting ${endpoint}...")\n`;
    }
    compiledCode.tr_instrument = inst;

    // 3. Compile otel-collector-config.yaml (tr_otel)
    let otel = `receivers:\n`;
    otel += `  otlp:\n`;
    otel += `    protocols:\n`;
    otel += `      grpc:\n`;
      otel += `        endpoint: 0.0.0.0:4317\n`;
    otel += `      http:\n`;
    otel += `        endpoint: 0.0.0.0:4318\n\n`;

    otel += `exporters:\n`;
    if (prov === 'langfuse') {
      otel += `  # Langfuse uses direct SDK ingestion; we export general spans to debug console\n`;
      otel += `  logging:\n`;
      otel += `    verbosity: detailed\n`;
    } else {
      otel += `  otlp/phoenix:\n`;
      otel += `    endpoint: phoenix:4317\n`;
      otel += `    tls:\n`;
      otel += `      insecure: true\n`;
    }
    if (collectMetrics) {
      otel += `  prometheus:\n`;
      otel += `    endpoint: 0.0.0.0:8889\n`;
      otel += `    namespace: llm_ops\n`;
    }

    otel += `\nprocessors:\n`;
    otel += `  batch:\n\n`;

    otel += `service:\n`;
    otel += `  pipelines:\n`;
    otel += `    traces:\n`;
    otel += `      receivers: [otlp]\n`;
    otel += `      processors: [batch]\n`;
    if (prov === 'langfuse') {
      otel += `      exporters: [logging]\n`;
    } else {
      otel += `      exporters: [otlp/phoenix]\n`;
    }
    if (collectMetrics) {
      otel += `    metrics:\n`;
      otel += `      receivers: [otlp]\n`;
      otel += `      processors: [batch]\n`;
      otel += `      exporters: [prometheus]\n`;
    }
    compiledCode.tr_otel = otel;

    // 4. Compile Flow
    let flow = 'graph TD\n';
    flow += '  App[🐍 Python Service] -->|Auto-spans & Inputs| OTel[🛡️ OTel Collector Agent]\n';
    if (prov === 'langfuse') {
      flow += '  App -->|Langfuse SDK: Port 3000| Server[📊 Langfuse Server]\n';
      flow += `  Server -->|Metadata Storage| DB[(🐘 Postgres DB: ${dbName})]\n`;
    } else {
      flow += `  OTel -->|gRPC Export: ${endpoint}| Phoenix[📈 Arize Phoenix Engine]\n`;
    }
    if (collectMetrics) {
      flow += '  OTel -->|Prometheus Scrape: 8889| Grafana[⚡ Grafana Dashboard]\n';
    }
    compiledCode.tr_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'tr_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.tr_flow + '</div>';
      
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
      let filename = 'langfuse-compose.yml';
      if (activeTab === 'tr_instrument') filename = 'instrumentation.py';
      if (activeTab === 'tr_otel') filename = 'otel-collector-config.yaml';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.provider, elements.otelEndpoint, elements.postgresDb, elements.postgresUser,
    elements.enableMetrics, elements.enableTracing
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
        const originalText = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = originalText;
        }, 1500);
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
    ['tr_compose', 'tr_instrument', 'tr_otel', 'tr_flow'],
    'tr_compose',
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
  if (document.getElementById('tr_provider')) {
    initLlmTracingStudio();
  }
});

window.initLlmTracingStudio = initLlmTracingStudio;
