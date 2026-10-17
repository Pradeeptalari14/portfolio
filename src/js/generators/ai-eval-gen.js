import { setupCompilerTriggers } from '../utils/events.js';
import StudioSDK from '../studio-sdk.js';

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
  let chart = 'graph TD\n  Dataset[📄 Evaluation Dataset] -->|Run Pipelines| Ragas[🧪 Ragas/TruLens Evaluator]\n  Ragas -->|Validate Accuracy| Check{{Accuracy Threshold?}}\n  Check -->|Pass| Deploy[🚀 Deploy Model to Prod]\n  Check -->|Fail| Rollback[🚨 Starve GPU / Trigger SRE Alert]\n  Deploy --> Registry[(🗄️ Model Registry)]';
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
  } else if (tabId === 'workbench') {
    nameBox.value = 'agent_eval_report';
    extTag.textContent = '.json';
  }
  updateViewportContent();
}

const EVAL_PRESETS = {
  k8s: {
    label: '🎯 Pod Restart (High Faithfulness & High Relevance)',
    question: 'How do I perform a rolling restart of the payment-api container in production?',
    answer: 'You can restart it by running: kubectl rollout restart deployment/payment-api -n production. This will gracefully rotate pods with zero downtime.',
    contexts: 'To restart pods without downtime in Kubernetes, use kubectl rollout restart deployment/<name> -n <namespace>. It gracefully terminates and recreates pods according to rolling update maxSurge/maxUnavailable settings.',
    groundTruth: 'Run: kubectl rollout restart deployment/payment-api -n production'
  },
  hallucinated: {
    label: '⚠️ AWS Subnet Route (Hallucination Detected)',
    question: 'How do I enable outbound IPv6 internet traffic from a private database subnet?',
    answer: 'Simply attach an Internet Gateway directly to the private subnet route table with 0.0.0.0/0 pointing to igw-xxxx and assign public elastic IPs to the database nodes.',
    contexts: 'Isolated private subnets must never route directly to an Internet Gateway. In AWS VPCs, use an Egress-Only Internet Gateway (eigw) to allow outbound IPv6 traffic while preventing inbound connections from the internet.',
    groundTruth: 'Deploy an Egress-Only Internet Gateway (eigw) and add route ::/0 targeting the eigw.'
  },
  irrelevant: {
    label: '❓ Query Drift (Low Answer Relevance)',
    question: 'What is the CPU threshold limit before SRE high-priority pager alerts trigger?',
    answer: 'Prometheus was originally developed at SoundCloud in 2012 and graduated from CNCF in 2018 with multi-dimensional data model support.',
    contexts: 'Prometheus alerting rules define high CPU usage alerts at 90% node capacity over a 5m duration, triggering P1 PagerDuty incidents.',
    groundTruth: 'The threshold is 90% node CPU capacity utilization.'
  }
};

let workbenchInitialized = false;

function initWorkbenchView() {
  const container = $('workbench-container');
  if (!container) return;

  if (!workbenchInitialized) {
    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🧪</span> Real-Time Ragas Agent Evaluation Bench
            </h4>
            <p class="text-[11px] text-slate-400">Score factual faithfulness, query relevance, context recall, and hallucination index.</p>
          </div>
          <span id="eval-gate-badge" class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            AWAITING RUN
          </span>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Evaluation Presets:</label>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick="loadEvalPreset('k8s')" class="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition">
              🎯 Accurate Pod Restart
            </button>
            <button type="button" onclick="loadEvalPreset('hallucinated')" class="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-rose-900/50 text-[11px] text-rose-300 transition">
              ⚠️ Hallucinated Subnet
            </button>
            <button type="button" onclick="loadEvalPreset('irrelevant')" class="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-amber-900/50 text-[11px] text-amber-300 transition">
              ❓ Irrelevant Response
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label for="eval-q-input" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">User Query / Question:</label>
            <textarea id="eval-q-input" rows="2" class="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-indigo-500"></textarea>
          </div>
          <div>
            <label for="eval-ans-input" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Generated Agent Answer:</label>
            <textarea id="eval-ans-input" rows="2" class="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-indigo-500"></textarea>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label for="eval-ctx-input" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Retrieved RAG Context Chunk:</label>
            <textarea id="eval-ctx-input" rows="3" class="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-indigo-500"></textarea>
          </div>
          <div>
            <label for="eval-gt-input" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ground Truth Reference:</label>
            <textarea id="eval-gt-input" rows="3" class="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-indigo-500"></textarea>
          </div>
        </div>

        <button type="button" onclick="executeLiveAgentEvaluation()" class="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-lg transition shadow-lg shadow-indigo-950 flex items-center justify-center gap-1.5">
          <span>⚡ Execute Ragas Live Benchmark Evaluation</span>
        </button>

        <!-- Metric Scorecards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div class="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Faithfulness</span>
            <span id="score-faithfulness" class="text-base font-black font-mono text-emerald-400 mt-0.5 block">0.00</span>
            <div class="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
              <div id="bar-faithfulness" class="bg-emerald-400 h-full w-0 transition-all duration-300"></div>
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Relevance</span>
            <span id="score-relevance" class="text-base font-black font-mono text-cyan-400 mt-0.5 block">0.00</span>
            <div class="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
              <div id="bar-relevance" class="bg-cyan-400 h-full w-0 transition-all duration-300"></div>
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Context Recall</span>
            <span id="score-recall" class="text-base font-black font-mono text-indigo-400 mt-0.5 block">0.00</span>
            <div class="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
              <div id="bar-recall" class="bg-indigo-400 h-full w-0 transition-all duration-300"></div>
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Hallucination Index</span>
            <span id="score-hallucination" class="text-base font-black font-mono text-rose-400 mt-0.5 block">0.00</span>
            <div class="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
              <div id="bar-hallucination" class="bg-rose-400 h-full w-0 transition-all duration-300"></div>
            </div>
          </div>
        </div>

        <div id="eval-verdict-summary" class="bg-slate-900/60 border border-slate-800/80 rounded p-2.5 text-[11px] text-slate-400 font-mono">
          Ready for benchmarking. Select a preset or customize parameters and execute.
        </div>
      </div>
    `;

    workbenchInitialized = true;
    loadEvalPreset('k8s');
  }
}

window.loadEvalPreset = function(key) {
  const p = EVAL_PRESETS[key];
  if (!p) return;
  const qIn = $('eval-q-input');
  const aIn = $('eval-ans-input');
  const cIn = $('eval-ctx-input');
  const gIn = $('eval-gt-input');

  if (qIn) qIn.value = p.question;
  if (aIn) aIn.value = p.answer;
  if (cIn) cIn.value = p.contexts;
  if (gIn) gIn.value = p.groundTruth;

  executeLiveAgentEvaluation();
};

window.executeLiveAgentEvaluation = async function() {
  const q = $('eval-q-input') ? $('eval-q-input').value.trim() : '';
  const a = $('eval-ans-input') ? $('eval-ans-input').value.trim() : '';
  const c = $('eval-ctx-input') ? $('eval-ctx-input').value.trim() : '';
  const gt = $('eval-gt-input') ? $('eval-gt-input').value.trim() : '';
  const minScore = parseFloat($('min_score') ? $('min_score').value : '0.85') || 0.85;

  const badge = $('eval-gate-badge');
  if (badge) {
    badge.textContent = 'EVALUATING...';
    badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-900/50 text-amber-300 border border-amber-800';
  }

  try {
    const res = await StudioSDK.evaluateAgentRun({
      question: q,
      answer: a,
      contexts: [c],
      groundTruth: gt
    });

    const faith = res.faithfulness || 0.0;
    const rel = res.answer_relevance || 0.0;
    const recall = res.context_recall || 0.0;
    const hallu = res.hallucination_index || 0.0;
    const passed = (faith >= minScore && rel >= minScore);

    // Update Scores
    if ($('score-faithfulness')) $('score-faithfulness').textContent = faith.toFixed(2);
    if ($('bar-faithfulness')) $('bar-faithfulness').style.width = `${Math.round(faith * 100)}%`;

    if ($('score-relevance')) $('score-relevance').textContent = rel.toFixed(2);
    if ($('bar-relevance')) $('bar-relevance').style.width = `${Math.round(rel * 100)}%`;

    if ($('score-recall')) $('score-recall').textContent = recall.toFixed(2);
    if ($('bar-recall')) $('bar-recall').style.width = `${Math.round(recall * 100)}%`;

    if ($('score-hallucination')) $('score-hallucination').textContent = hallu.toFixed(2);
    if ($('bar-hallucination')) $('bar-hallucination').style.width = `${Math.round(hallu * 100)}%`;

    // Update Gate Badge
    if (badge) {
      if (passed) {
        badge.textContent = `✔ SRE GATE PASSED (>${minScore})`;
        badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-900/50 text-emerald-300 border border-emerald-800';
      } else {
        badge.textContent = `✖ GATE FAILED (Below ${minScore})`;
        badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-900/50 text-rose-300 border border-rose-800';
      }
    }

    const summary = $('eval-verdict-summary');
    if (summary) {
      summary.innerHTML = `
        <span class="${passed ? 'text-emerald-400' : 'text-rose-400'} font-bold">Status: ${passed ? 'QUALITY APPROVED' : 'SCORE DEGRADATION DETECTED'}</span>
        <div class="mt-1">Faithfulness: ${(faith*100).toFixed(1)}% | Relevance: ${(rel*100).toFixed(1)}% | Recall: ${(recall*100).toFixed(1)}% | Latency: ${res.latency_ms || 18}ms</div>
        <div class="text-[10px] text-slate-500 mt-0.5">Dual-Engine: ${StudioSDK.isConnectedBackend ? 'FastAPI Companion Live API' : 'StudioSDK Browser Heuristics'}</div>
      `;
    }
  } catch (err) {
    console.error('Evaluation error:', err);
  }
};

function updateViewportContent() {
  const outBox = $('output-box');
  const mContainer = $('mermaid-container');
  const wbContainer = $('workbench-container');

  if (activeTab === 'flow') {
    if (outBox) outBox.classList.add('hidden');
    if (wbContainer) wbContainer.classList.add('hidden');
    if (mContainer) mContainer.classList.remove('hidden');

    mContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    if (typeof mermaid === 'undefined') {
      mContainer.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Please check your internet connection or reload the page.\n\nCode:\n${compiledCode.flow}</pre>`;
    } else {
      try {
        mermaid.run({
          nodes: [mContainer.querySelector('.mermaid')]
        });
      } catch (e) {
        console.error("Mermaid Render Error:", e);
        mContainer.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
      }
    }
  } else if (activeTab === 'workbench') {
    if (outBox) outBox.classList.add('hidden');
    if (mContainer) mContainer.classList.add('hidden');
    if (wbContainer) {
      wbContainer.classList.remove('hidden');
      initWorkbenchView();
    }
  } else {
    if (mContainer) mContainer.classList.add('hidden');
    if (wbContainer) wbContainer.classList.add('hidden');
    if (outBox) {
      outBox.classList.remove('hidden');
      outBox.textContent = compiledCode[activeTab];
    }
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
  } else if (activeTab === 'workbench') {
    explanation = {
      'title': 'Live Agent Evaluation Workbench',
      'filename': 'agent_eval_report.json',
      'why': 'Interactive evaluation bench to test prompts, answers, and context against Ragas metrics in real-time.',
      'when': 'Use during interactive development, prompt tuning, and regression testing.',
      'where': 'Directly inside the Studios Hub UI.',
      'command': 'StudioSDK.evaluateAgentRun()',
      'practices': ['Test both positive and adversarial cases.', 'Check hallucination index closely.'],
      'ai_mlops': 'Interactive developer sandbox for live Ragas metric testing.',
      'flow': '[Input Query & Context] ➔ [StudioSDK / FastAPI] ➔ [Compute Ragas Metrics] ➔ [SRE Gate]'
    };
  }

  if (!explanation) {
    if (typeof window !== 'undefined' && typeof window.universalExplainActiveTab === 'function') {
        window.universalExplainActiveTab(activeTab);
        return;
      }
      return;
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
