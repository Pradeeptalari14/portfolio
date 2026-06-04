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
  $('guard_engine').addEventListener('change', triggerCompileAll);
  $('policy_action').addEventListener('change', triggerCompileAll);
  $('audit_mode').addEventListener('change', triggerCompileAll);
  $('scan_input').addEventListener('change', triggerCompileAll);

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
  const engine = $('guard_engine').value;
  const action = $('policy_action').value;
  const mode = $('audit_mode').value;

  let code = '';
  if (engine === 'nemo') {
    code = `# config.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# NeMo Guardrails configuration file

models:
  - type: main
    engine: openai
    model: gpt-4

instructions:
  - type: general
    content: |
      The following is a conversation with a DevOps AI assistant.
      The assistant is helpful, polite, and strictly focused on system operations.

rails:
  input:
    flows:
      - check jailbreak
      - check self harm
      - check offensive language
      
  output:
    flows:
      - check output factuality
      - filter pii data

actions:
  check_jailbreak:
    action_type: block_execution
    action_config:
      action: "${action}"
      audit_mode: "${mode}"
      redact_pattern: "(?i)(password|secret_key|api_key|token)"
`;
  } else if (engine === 'llama-guard') {
    code = `# config.yaml v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Llama Guard model classifier prompt rules

system_prompt: |
  Task: Check if there is unsafe content in the user message or agent response.
  Provide safety classification: "safe" or "unsafe" followed by category list.

  Unsafe Categories:
  O1: Violence and Incitement.
  O2: Sexual Content.
  O3: Cyberattacks or system security bypass attempts (jailbreaks, exploit generation).
  O4: PII and Secrets disclosure.

policy_settings:
  enforce_action: "${action}"
  monitoring_mode: "${mode}"
`;
  } else {
    code = `# policy.rego v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# OPA Rego Policy check for LLM requests

package llm.security

default allow = false

# Allow only if input does not contain dangerous DevOps keywords
allow {
    not input_contains_blacklist
    not input_violates_pii
}

input_contains_blacklist {
    blacklist := ["rm -rf /", "drop database", "shutdown now", "truncate table"]
    some i
    contains(lower(input.prompt), blacklist[i])
}

input_violates_pii {
    # Check for secret keys or token values
    re_match("(?i)(key-|pwd-|token-)", input.prompt)
}
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const engine = $('guard_engine').value;
  const action = $('policy_action').value;
  const isScan = $('scan_input').checked;

  let code = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# guard_decorator.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# FastAPI LLM Security Guardrail decorator

import functools
import re
from fastapi import HTTPException

# Compile basic PII check regex
SECRETS_REGEX = re.compile(r'(?i)(password|secret|api[-_]?key|token)[\\s]*[:=][\\s]*["\\']?([a-zA-Z0-9_\\-]{16,})["\\']?')

def llm_security_guard(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        # Extract prompt query input
        prompt = kwargs.get("prompt", "") or (args[0] if args else "")
        if not isinstance(prompt, str):
            prompt = str(prompt)
            
        print(f"[Guardrail Engine: ${engine.toUpperCase()}] Auditing input query...")

        # 1. Check for prompt injection keywords
        blacklist = ["ignore previous instructions", "system role:", "developer mode"]
        if any(term in prompt.lower() for term in blacklist):
            if "${action}" == "block":
                raise HTTPException(status_code=400, detail="LLM Input blocked: Prompt injection threat detected.")
            elif "${action}" == "sanitize":
                prompt = "[Sanitized Prompt Injection Attempt]"
                
        # 2. Check for PII & Secrets leaks
        if SECRETS_REGEX.search(prompt):
            if "${action}" == "block":
                raise HTTPException(status_code=400, detail="LLM Input blocked: Credentials or PII leak detected.")
            elif "${action}" == "sanitize":
                prompt = SECRETS_REGEX.sub(r'\\1: [REDACTED_SECRET]', prompt)

        # Update prompt argument back to target function
        if "prompt" in kwargs:
            kwargs["prompt"] = prompt
            
        return await func(*args, **kwargs)
    return wrapper
`;

  compiledCode.instrument = code;
}

function compileReadme() {
  const engine = $('guard_engine').value;

  let md = `# LLM Security Guardrails Suite v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Integrate safety guardrails into generative AI pipelines to filter prompt injection attempts and PII leaks.

## Tools
- **Guardrails Engine**: ${engine.toUpperCase()}
- **Features**: Input sanitization, output compliance validation.

## Deployment
1. Set up NeMo Guardrails dependencies:
   \`\`\`bash
   pip install nemoguardrails fastapi uvicorn
   \`\`\`
2. Deploy the FastAPI gateway wrapper:
   \`\`\`bash
   python guard_decorator.py
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const engine = $('guard_engine').value;

  let md = `# SRE Runbook: LLM Security Incident Response
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: High Rate of Guardrail Blocks

If user prompts or API endpoints throw prompt injection errors or latency spikes on the guardrail endpoint:

### Step 1: Check Guardrail Logs
Identify if the blocks are due to false positives or active adversarial attacks:
- Search logs for prefix \`[Guardrail Engine: ${engine.toUpperCase()}]\`
- Audit matched rule patterns and raw user query payload.

### Step 2: Emergency Policy Rotation
If a specific safety rule is causing high false positives (e.g. blocking standard terminal commands):
1. Locate the policy rule definition inside \`config.yaml\` or \`policy.rego\`.
2. Transition the audit mode to \`shadow\` (log-only validation) temporarily to restore system connectivity.
3. Commit and apply the updated configuration file.

### Step 3: Re-enable Active Blocking
Once the rule matching patterns are refined, switch the audit mode back to \`active\`.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Input[👤 User Prompt] -->|Validate| Shield[🛡️ Guardrails: NeMo/LlamaGuard]\n  Shield -->|Jailbreak/PII| Block[🚫 403 Blocked Prompt]\n  Shield -->|Valid| LLM[🧠 LLM Inference Engine]\n  LLM -->|Validate Output| ShieldOut[🛡️ Compliance Check]\n  ShieldOut -->|Pass| Response[💬 User Answer]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const engine = $('guard_engine').value;

  if (tabId === 'config') {
    nameBox.value = engine === 'opashield' ? 'policy' : 'config';
    extTag.textContent = engine === 'opashield' ? '.rego' : '.yaml';
  } else if (tabId === 'instrument') {
    nameBox.value = 'guard_decorator';
    extTag.textContent = '.py';
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
  const engine = $('guard_engine').value;
  const zip = new JSZip();

  if (engine === 'opashield') {
    zip.file('policy.rego', compiledCode.config);
  } else {
    zip.file('config.yaml', compiledCode.config);
  }
  zip.file('guard_decorator.py', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `llm-guardrails-${engine}.zip`;
    a.click();
    showToast('⬇️ LLM Guardrails SRE package downloaded!');
  });
}

function clearAllFields() {
  $('guard_engine').value = 'nemo';
  $('policy_action').value = 'block';
  $('audit_mode').value = 'active';
  $('scan_input').checked = true;

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
  const engine = $('guard_engine').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'nemo': [
      {
        title: 'Input/Output Guardrail Flows',
        why: 'Enforces conversation flows and checks input safety checks dynamically.',
        whyNot: 'Adversarial jailbreaks manipulate model outputs, leaking database records.',
        runtime: 'Checks prompts via sub-flow loops prior to LLM forward passes.'
      },
      {
        title: 'PII Redact Sweepers',
        why: 'Hides system api tokens, card credentials, and user data automatically.',
        whyNot: 'Plaintext credentials migrate into cloud provider model telemetry dashboards.',
        runtime: 'Applies regular expressions filters onto output payloads.'
      }
    ],
    'llama-guard': [
      {
        title: 'Content Category Classifications',
        why: 'Instructs llama classification models to audit prompts against standard CVE policies.',
        whyNot: 'Exploitation scripts could be generated by the model for malicious users.',
        runtime: 'Applies token checks prior to returning LLM responses.'
      }
    ],
    'opashield': [
      {
        title: 'OPA Policy Enforcement',
        why: 'Validates raw prompt structures at HTTP admission layers.',
        whyNot: 'Malicious scripts execute directly, bypassing code layer filters.',
        runtime: 'Compares prompt queries against policy criteria lists.'
      }
    ]
  };

  const activeData = manualData[engine] || [];
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
  const engine = $('guard_engine').value;

  if (activeTab === 'config') {
    explanation = {
      'title': engine === 'opashield' ? 'OPA Compliance Policy' : 'Guardrail Configuration Spec',
      'filename': engine === 'opashield' ? 'policy.rego' : 'config.yaml',
      'why': 'Declares the safety categories, policy definitions, and sanitization filters.',
      'when': 'Apply during application setup on production clusters.',
      'where': 'Deploy as server volume configurations or gateway sidecars.',
      'command': '# Load configuration on server bootstrap',
      'practices': ['Pin audit filters correctly.', 'Avoid over-filtering standard dictionary terms.'],
      'ai_mlops': 'Core component of LLM safety engineering and MLOps compliance layers.',
      'flow': '[Load Policy] ➔ [Register Rules] ➔ [Intercept Requests] ➔ [Sanitize/Block]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'API Interceptor Decorator',
      'filename': 'guard_decorator.py',
      'why': 'Validates incoming prompts against threat signatures prior to forwarding them to model endpoints.',
      'when': 'Wrap inside FastAPI controller paths.',
      'where': 'Store in application helper packages.',
      'command': 'python guard_decorator.py',
      'practices': ['Optimize regex execution speed.', 'Handle exception cases gracefully without failing requests.'],
      'ai_mlops': 'First-line defense layer for local edge models Serving.',
      'flow': '[Incoming HTTP Request] ➔ [Evaluate Regex] ➔ [Bypass or Return 400]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Documentation Manual',
      'filename': 'README.md',
      'why': 'Provides installation guides and pip dependency requirements.',
      'when': 'Consult prior to deployment.',
      'where': 'Save in repository folder.',
      'command': '# Open in editor',
      'practices': ['Include instructions for multi-node deployments.'],
      'ai_mlops': 'Standard documentation template for deployment teams.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Guardrail Outage Triage Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Guides operations staff to bypass false-positive blocks and adjust rules audit modes.',
      'when': 'Consult when user block alerts trigger system warnings.',
      'where': 'Store in SRE playbooks catalog.',
      'command': '# View in browser',
      'practices': ['Log threat triggers before overriding security limits.', 'Test policies in shadow mode first.'],
      'ai_mlops': 'Assists SREs during prompt injection incident management.',
      'flow': '[Alert High Blocks] ➔ [Inspect logs] ➔ [Transition to Shadow Mode]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Data Filtering Flow Chart',
      'filename': 'flow.mermaid',
      'why': 'Tracks execution checks from prompt query input to LLM response output.',
      'when': 'Review during security planning audits.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Validate both input audit path and output sanitization checks.'],
      'ai_mlops': 'Assurance checklist for compliance managers.',
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
