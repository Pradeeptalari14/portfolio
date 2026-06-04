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
  $('eval_framework').addEventListener('change', triggerCompileAll);
  $('target_metric').addEventListener('change', triggerCompileAll);
  $('log_destination').addEventListener('change', triggerCompileAll);
  $('min_score').addEventListener('input', triggerCompileAll);

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
  const framework = $('eval_framework').value;
  const metric = $('target_metric').value;
  const destination = $('log_destination').value;
  const score = parseFloat($('min_score').value) || 0.85;

  let code = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# eval_pipeline.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# AI Evaluation & Benchmarking Pipeline using ${framework.toUpperCase()}

import json
import os
import time

`;

  if (framework === 'ragas') {
    code += `from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevance, context_recall

# Define test dataset inputs
data_samples = {
    'question': [
        "How do I restart the payment-api container?",
        "What is the CPU threshold limits warning for db node?"
    ],
    'answer': [
        "You can restart it by running: kubectl rollout restart deployment/payment-api -n production.",
        "The CPU alarm warning limit threshold is set to 90% in Prometheus rules."
    ],
    'contexts': [
        ["Run the rollout restart command inside the production namespace to re-schedule payment pods."],
        ["Prometheus alert rules define high CPU warnings at 90% node capacity limits."]
    ],
    'ground_truth': [
        "Run: kubectl rollout restart deployment/payment-api -n production",
        "The warning limit is 90% utilization."
    ]
}

dataset = Dataset.from_dict(data_samples)

# Evaluate specific metric: ${metric.toUpperCase()}
print("Initiating evaluation benchmarks run...")
result = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevance, context_recall]
)

print("Ragas evaluation metrics results:")
print(result)

# Export results to ${destination.toUpperCase()}
score = result.get("${metric}", 0.0)
print(f"Target metric [${metric}] score: {score}")

if score < ${score}:
    print("🚨 Alert: Evaluation score is below the minimum quality threshold of ${score}!")
    exit(1)
else:
    print("✅ Quality check passed successfully.")
`;
  } else {
    code += `from trulens_eval import Feedback, Tru, TruLlama
from trulens_eval.feedback.provider.openai import OpenAI

tru = Tru()
openai_provider = OpenAI()

# Define feedbacks checks
# Target metric check: ${metric.toUpperCase()}
feedback_check = Feedback(openai_provider.relevance).on_input_output()

# Configure logging to local tracker or MLflow
print("Starting TruLens execution checks...")
# TruLens records inputs/outputs interaction chains in local databases
print("TruLens evaluations running...")
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const metric = $('target_metric').value;
  const score = parseFloat($('min_score').value) || 0.85;

  let code = `{
  "evaluation_schema_version": "v${SCRIPT_VERSION}",
  "copyright": "Copyright (c) 2026 Talari Pradeep. All Rights Reserved.",
  "target_metric": "${metric}",
  "minimum_acceptable_score": ${score},
  "metrics_weights": {
    "faithfulness": 0.40,
    "answer_relevance": 0.35,
    "context_recall": 0.25
  },
  "alerts": {
    "trigger_on_degradation": true,
    "slack_channel": "#sre-ai-telemetry"
  }
}`;

  compiledCode.instrument = code;
}

function compileReadme() {
  const framework = $('eval_framework').value;

  let md = `# AI Evaluation & Hallucination Benchmarks v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Automated testing framework to validate the quality of RAG prompt answers.

## Requirements
- **Framework**: ${framework.toUpperCase()}
- **Metrics**: Faithfulness, relevance, context recall checks.

## Quick Start
1. Install dependencies:
   \`\`\`bash
   pip install ragas trulens-eval datasets
   \`\`\`
2. Run evaluation execution test suite:
   \`\`\`bash
   python eval_pipeline.py
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const metric = $('target_metric').value;

  let md = `# SRE Runbook: AI Model Hallucination & Accuracy Degradation
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Evaluation Score falls below minimum quality threshold

If automated evaluation runs return scores below limits (e.g. ${metric} drop):

### Step 1: Locate Matched Outlier Samples
Extract evaluation error logs:
- View target outputs where score checks failed.
- Confirm if the drop is due to context retrieval failure (low context recall) or model logic drifts.

### Step 2: Validate Data Embeddings
If context recall is low:
1. Re-index vectors store schemas to sync missing manual documents.
2. Check vector database connections and chunk sizes.

### Step 3: Run pipeline verification runs
\`\`\`bash
python eval_pipeline.py
\`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const framework = $('eval_framework').value;
  let chart = 'graph TD\n';

  chart += `  Input[Adversarial Prompt Dataset] --> Generate[Execute RAG Pipeline]\n`;
  chart += `  Generate --> Output[Collect Contexts & Model responses]\n`;
  chart += `  Output --> Eval[Trigger ${framework.toUpperCase()} Evaluation]\n`;
  chart += `  Eval --> Metric1[Compute Faithfulness score]\n`;
  chart += `  Eval --> Metric2[Compute Answer Relevance]\n`;
  chart += `  Eval --> Metric3[Compute Context Recall]\n`;
  chart += `  Metric1 --> Validate{Scores > Threshold?}\n`;
  chart += `  Metric2 --> Validate\n`;
  chart += `  Metric3 --> Validate\n`;
  chart += `  Validate -->|Yes| Push[Push logs to tracker & Publish Release]\n`;
  chart += `  Validate -->|No| Alert[Trigger SRE Alert & Abort Release]\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'config') {
    nameBox.value = 'eval_pipeline';
    extTag.textContent = '.py';
  } else if (tabId === 'instrument') {
    nameBox.value = 'eval_config';
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
  const framework = $('eval_framework').value;
  const zip = new JSZip();

  zip.file('eval_pipeline.py', compiledCode.config);
  zip.file('eval_config.json', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ai-eval-${framework}.zip`;
    a.click();
    showToast('⬇️ AI Evaluation SRE package downloaded!');
  });
}

function clearAllFields() {
  $('eval_framework').value = 'ragas';
  $('target_metric').value = 'faithfulness';
  $('log_destination').value = 'mlflow';
  $('min_score').value = '0.85';

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
  const framework = $('eval_framework').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'ragas': [
      {
        title: 'Ragas evaluation datasets',
        why: 'Tests model responses using ground truth datasets to calculate hallucination rates.',
        whyNot: 'Untested models leak false operational instructions (hallucinations) to operators.',
        runtime: 'Performs token similarity checks against ground truth context.'
      },
      {
        title: 'Min quality thresholds',
        why: 'Enforces score safety gates inside release build pipelines.',
        whyNot: 'Degraded accuracy builds deploy automatically, corrupting chatbot responses.',
        runtime: 'Validates metric scores values on build.'
      }
    ],
    'trulens': [
      {
        title: 'TruLens relevance feedback',
        why: 'Leverages model feedback rules to grade target query output relevancies.',
        whyNot: 'Fails to capture drift shifts in prompt styles.',
        runtime: 'Audits transaction requests logs.'
      }
    ]
  };

  const activeData = manualData[framework] || [];
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
  const framework = $('eval_framework').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'AI Evaluation Pipeline Script',
      'filename': 'eval_pipeline.py',
      'why': 'Executes validation runs using test prompt datasets to evaluate accuracy and compute score metrics.',
      'when': 'Run inside CI build steps before committing LLM models updates.',
      'where': 'Deploy as a build worker execution job.',
      'command': 'python eval_pipeline.py',
      'practices': ['Test with diverse baseline prompts.', 'Log outlier queries to debugging dashboards.'],
      'ai_mlops': 'Mandatory quality validation step inside GenAI release chains.',
      'flow': '[Load Prompts] ➔ [Fetch Responses] ➔ [Grade Metrics] ➔ [Validate Gate]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'Evaluation Config Schema',
      'filename': 'eval_config.json',
      'why': 'Stores minimum acceptable score configurations and metrics weights.',
      'when': 'Modify when updating target accuracy standards.',
      'where': 'Save in repository pipelines folder.',
      'command': '# Load file configurations',
      'practices': ['Pin faithfulness targets high (>0.85).'],
      'ai_mlops': 'Platform metadata config for evaluation runners.',
      'flow': '[Read Config] ➔ [Set Constraints] ➔ [Evaluate]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Setup Instructions Guide',
      'filename': 'README.md',
      'why': 'Lists Python pip dependencies and quick start commands.',
      'when': 'Consult when setting up fresh testing environments.',
      'where': 'Save in pipeline root.',
      'command': '# Open in editor',
      'practices': ['Pin packages versions.'],
      'ai_mlops': 'Reference document for platform test builders.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Accuracy Degradation Triage Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Provides action directions for resolving accuracy drift and vector indexing bugs.',
      'when': 'Consult when evaluations return scores below quality limits.',
      'where': 'Publish in SRE manuals catalog.',
      'command': '# View in console',
      'practices': ['Isolate retriever vector indices errors before modifying LLM models.', 'Log failure samples.'],
      'ai_mlops': 'Assists SREs managing model quality regressions.',
      'flow': '[Quality Alert] ➔ [Check Context Recall] ➔ [Re-index Vector DB]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'AI Evaluation Flow Chart',
      'filename': 'flow.mermaid',
      'why': 'Visualizes the evaluation checks execution loop from input to release.',
      'when': 'Review during pipeline design planning.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Ensure failed validation runs abort deployments automatically.'],
      'ai_mlops': 'Continuous evaluation flow reference.',
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
