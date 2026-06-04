import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'config';

let compiledCode = {
  config: '',
  instrument: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('tracing_standard').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileConfig();
  compileInstrument();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileConfig() {
  const standard = $('tracing_standard').value;
  const endpoint = $('tracing_endpoint').value;

  let code = '';

  if (standard === 'otel') {
    code = `# otel_config.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# OpenTelemetry Collector configuration blueprint

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 256

exporters:
  otlp/jaeger:
    endpoint: "${endpoint}"
    tls:
      insecure: true
  logging:
    verbosity: normal

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger, logging]
`;
  } else {
    code = `# jaeger_agent.yaml v${SCRIPT_VERSION}
# Jaeger Agent collector configurations
reporter:
  grpc:
    host-port: "${endpoint}"
  local-agent:
    host-port: 127.0.0.1:6831
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const lang = $('tracing_lang').value;
  const rate = $('tracing_rate').value;
  const metrics = $('tracing_metrics').checked;

  let code = '';

  if (lang === 'python') {
    code = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# instrument.py v${SCRIPT_VERSION} - OpenTelemetry Auto-Instrumentation
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.sampling import ParentBasedTraceIdRatio

# Configure trace sampler (Rate: ${rate}%)
sampler = ParentBasedTraceIdRatio(${rate / 100})

provider = TracerProvider(sampler=sampler)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://localhost:4317", insecure=True))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("payment-api-tracer")

def process_payment(payment_id: str):
    with tracer.start_as_current_span("process_payment_request") as span:
        span.set_attribute("payment.id", payment_id)
        span.set_attribute("service.name", "payment-api")
        print(f"Processing payment: {payment_id}")
`;
  } else if (lang === 'nodejs') {
    code = `// instrument.js v${SCRIPT_VERSION} - Node.js Express OpenTelemetry config
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4317',
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation()
  ]
});

sdk.start();
console.log('OpenTelemetry NodeSDK Initialized');
`;
  } else {
    code = `package main
// instrument.go v${SCRIPT_VERSION} - Go OpenTelemetry Trace provider config
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

import (
	"context"
	"log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/trace"
)

func initTracer() *trace.TracerProvider {
	ctx := context.Background()
	exporter, err := otlptracegrpc.New(ctx, otlptracegrpc.WithInsecure())
	if err != nil {
		log.Fatalf("failed to create trace exporter: %v", err)
	}

	tp := trace.NewTracerProvider(
		trace.WithBatcher(exporter),
	)
	otel.SetTracerProvider(tp)
	return tp
}
`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const standard = $('tracing_standard').value;
  let md = `# APM & Distributed Tracing Integration v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides OpenTelemetry collector specifications and code SDK decorators to instrument distributed microservices.

## Setup Instructions

1. Install dependencies:
   \`\`\`bash
   pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-grpc
   \`\`\`
2. Start the OpenTelemetry Collector:
   \`\`\`bash
   docker run -d -p 4317:4317 -p 4318:4318 -v $(pwd)/otel_config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector:latest
   \`\`\`
3. Run target application:
   \`\`\`bash
   python instrument.py
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  let md = `# SRE Runbook: Distributed Tracing Latency & Buffer Triage
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Tracing Data Drop or Metric Spikes

Follow these steps if tracer logs signal dropping spans:

### Step 1: Check Collector Socket Port
Verify connection to target collector address:
\`\`\`bash
nc -zv localhost 4317
\`\`\`

### Step 2: Collector Buffer Exhaustion
If the collector buffer fills up under traffic bursts:
1. Open \`otel_config.yaml\` and increase OTel batch processor parameters:
   - Increase \`send_batch_size\` from 256 to 1024.
   - Adjust \`timeout\` from 1s to 5s.
2. Restart OTel collector pods.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const lang = $('tracing_lang').value;
  let chart = 'graph TD\n';

  chart += `  Client[User Client] -->|1. HTTP Request with Traceparent Header| Gateway[API Ingress Gateway]\n`;
  chart += `  Gateway -->|2. Propagate Context| ServiceA[Service A (SDK Instrument)]\n`;
  chart += `  ServiceA -->|3. Create Span| ServiceB[Service B (SDK Instrument)]\n`;
  chart += `  ServiceA -->|4. Push OTLP Spans| Collector[OTel Collector daemon]\n`;
  chart += `  ServiceB -->|4. Push OTLP Spans| Collector\n`;
  chart += `  Collector -->|5. Export metrics| APM[Jaeger / Prometheus Visualization]\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'config') {
    nameBox.value = 'otel_config';
    extTag.textContent = '.yaml';
  } else if (tabId === 'instrument') {
    nameBox.value = 'instrument';
    const lang = $('tracing_lang').value;
    extTag.textContent = lang === 'python' ? '.py' : (lang === 'nodejs' ? '.js' : '.go');
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
  const standard = $('tracing_standard').value;
  const lang = $('tracing_lang').value;
  const zip = new JSZip();
  
  zip.file('otel_config.yaml', compiledCode.config);
  zip.file('instrument' + (lang === 'python' ? '.py' : (lang === 'nodejs' ? '.js' : '.go')), compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tracing-sre-${standard}.zip`;
    a.click();
    showToast('⬇️ Tracing SRE package downloaded!');
  });
}

function clearAllFields() {
  $('tracing_standard').value = 'otel';
  $('tracing_lang').value = 'python';
  $('tracing_endpoint').value = 'http://localhost:4317';
  $('tracing_rate').value = '100';
  $('tracing_metrics').checked = true;

  switchTab('config');
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
  const standard = $('tracing_standard').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'otel': [
      {
        title: 'OpenTelemetry collector routing',
        why: 'Exposes local ports (4317/4318) to accept system span inputs.',
        whyNot: 'Workloads fail to push logs and metrics, rendering traces blind.',
        runtime: 'Listens for incoming gRPC OTLP streams.'
      }
    ],
    'jaeger': [
      {
        title: 'Jaeger Agent connection targets',
        why: 'Directs trace events directly to local reporter pools.',
        whyNot: 'High latency checks might fail due to queue blocks.',
        runtime: 'Reports trace payloads via gRPC channels.'
      }
    ]
  };

  const activeData = manualData[standard] || [];
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

  if (activeTab === 'config') {
    explanation = {
      'title': 'OTel Collector YAML Spec',
      'filename': 'otel_config.yaml',
      'why': 'Configures input ports, processing batches, and exporting destinations.',
      'when': 'Deploy alongside standard containerized backend nodes.',
      'where': 'Deploy as DaemonSet or centralized service.',
      'command': 'docker run -v $(pwd)/otel_config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector',
      'practices': ['Enforce batch timeouts to buffer memory.', 'Limit logging trace dumps.'],
      'ai_mlops': 'Aggregates latency datasets used by AI auto-remediator systems.',
      'flow': '[OTel Collector Configuration]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'SDK Tracing Decorator',
      'filename': 'instrument.py',
      'why': 'Hooks into application request execution paths, measuring span delays.',
      'when': 'Implement within core microservice endpoint files.',
      'where': 'Save in app package scope.',
      'command': 'python instrument.py',
      'practices': ['Do not sample 100% in high-traffic pools.', 'Use batch exporters.'],
      'ai_mlops': 'Tracks microservice workflow dependencies during AI evaluations.',
      'flow': '[Start Span] ➔ [Register Attributes] ➔ [End Span]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Usage & Documentation Guide',
      'filename': 'README.md',
      'why': 'Installation checklists and dependency settings details.',
      'when': 'Consult prior to launching tracing scripts.',
      'where': 'Save in root directory.',
      'command': '# Open in viewer',
      'practices': ['Pin dependencies versions.'],
      'ai_mlops': 'Context guidelines for autonomous builders.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'APM Spans Recovery Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Triage manuals to clear collector queues and network limits.',
      'when': 'Consult when trace data loss alerts trigger warnings.',
      'where': 'Store in wiki.',
      'command': '# Open in viewer',
      'practices': ['Establish clear debugging milestones.'],
      'ai_mlops': 'Guides SRE agents resolving tracing gaps.',
      'flow': '[Latency warnings] ➔ [Increase batches size] ➔ [Restart OTel]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Request Tracing Propagation',
      'filename': 'flow.mermaid',
      'why': 'Maps propagation across distributed nodes.',
      'when': 'Consult during design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Verify traceparent header formats.'],
      'ai_mlops': 'Validation checklist for tracing architecture.',
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
