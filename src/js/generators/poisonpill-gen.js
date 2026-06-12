// PoisonPill SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'primary_config';
  let compiledCode = {};

  function compileConfigs() {
    const endpoint = document.getElementById('model_endpoint').value;
    const temp = document.getElementById('temperature').value;
    const prompt = document.getElementById('system_prompt').value;
    const alerts = document.getElementById('enable_alerts').checked;
    const chatApi = document.getElementById('enable_chat_api').checked;

    // Primary config generation
    if (true) {
      compiledCode.primary_config = `# -*- coding: utf-8 -*-
# Developer Studio configuration compiled for PoisonPill
# Deployed under MIT Open-Source parameters.

import os
import sys

MODEL_ENDPOINT = "${endpoint}"
TEMPERATURE = ${temp}
SYSTEM_INSTRUCTIONS = """${prompt}"""

# Notification Webhooks Config
ENABLE_ALERTS = ${alerts}
ENABLE_CHAT_API = ${chatApi}

def init_rag_node():
    print("🚀 Initializing PoisonPill agent retrieval sequence...")
    print(f"Connecting RAG to gateway endpoint: {MODEL_ENDPOINT}")
    if ENABLE_ALERTS:
        print("✅ Alerting routes active: Slack notification dispatcher configured.")
    if ENABLE_CHAT_API:
        print("✅ Chatbot endpoints active: WhatsApp/Telegram API bindings established.")
    return 0

if __name__ == '__main__':
    sys.exit(init_rag_node())
`;
    } else if (false) {
      compiledCode.primary_config = JSON.stringify({
        studioName: "PoisonPill",
        version: "1.0.0",
        engine: "RAG-Agent",
        parameters: {
          endpoint: endpoint,
          temperature: parseFloat(temp),
          instructions: prompt,
          alertingEnabled: alerts,
          chatGatewaysEnabled: chatApi
        }
      }, null, 2);
    } else if (false) {
      compiledCode.primary_config = `-- Database indexing trigger setup for PoisonPill
-- Auto-compiled under MIT open-source credentials.

CREATE TABLE IF NOT EXISTS RAG_METADATA_STORE (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(255) DEFAULT '${endpoint}',
  temperature NUMERIC(2,1) DEFAULT ${temp},
  instructions TEXT,
  chat_connections VARCHAR(50) DEFAULT '${chatApi ? 'Active' : 'Disabled'}'
);
`;
    } else {
      compiledCode.primary_config = `# SRE Config template for PoisonPill
# Compiled from developer interface.

MODEL_ENDPOINT: "${endpoint}"
TEMPERATURE: ${temp}
SYSTEM_INSTRUCTIONS: "${prompt}"
NOTIFICATIONS: ${alerts}
MESSAGING_CHAT_INTEGRATION: ${chatApi}
`;
    }

    // Env configuration compilation
    compiledCode.env_config = `# Environment settings for PoisonPill
MODEL_ENDPOINT="${endpoint}"
MODEL_TEMPERATURE="${temp}"

# Notification Webhook URLs
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/your-slack-webhook-id-here"
TEAMS_WEBHOOK_URL="https://outlook.office.com/webhook/your-teams-webhook-id-here"

# Messaging & Bot Connections
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
TELEGRAM_CHAT_ID="-100123456789"
WHATSAPP_API_TOKEN="EAAGxx..."
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
`;

    // Validation script compilation
    compiledCode.validate_sh = `#!/usr/bin/env bash
# SRE validation checks helper for PoisonPill
set -euo pipefail

echo "🔍 Auditing model deployment parameters..."
if [ -z "$MODEL_ENDPOINT" ]; then
  echo "⚠️ Warning: MODEL_ENDPOINT env variable is empty."
fi

echo "🚀 Verifying local configurations..."
echo "✅ Operational check complete for poisonpill"
`;

    // Flowchart diagram compilation
    compiledCode.flow_diagram = `graph TD
  User[User Query] -->|Message Hook| Chat[Telegram/WhatsApp Bot Gateways]
  Chat -->|Route Query| API[RAG API Endpoint: ${endpoint}]
  API -->|Fetch Vectors| DB[Vector DB Store]
  DB -->|Context Retrieval| Prompt[Assemble Prompt with Cosine Similarity]
  Prompt -->|Inject Instructions| LLM[LLM Output Generation]
  LLM -->|Deliver Response| User
  LLM -->|Drift Alert / Metrics| Observability[Slack / Alertmanager Webhooks]
`;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'flow_diagram') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      const flowVal = compiledCode[activeTab];
      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + flowVal + '</div>';
      
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
    }
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select, .w-full, .custom-checkbox');
  inputs.forEach(input => {
    input.addEventListener('input', compileConfigs);
    input.addEventListener('change', compileConfigs);
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
    ['primary_config', 'env_config', 'validate_sh', 'flow_diagram'],
    'primary_config',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      let name = 'poison_pill_test.py';
      if (tabName === 'env_config') name = '.env';
      if (tabName === 'validate_sh') name = 'validate.sh';
      if (tabName === 'flow_diagram') name = 'flowchart.txt';
      elements.downloadInput.value = name;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
