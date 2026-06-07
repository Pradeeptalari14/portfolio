// LLM Gateway & API Router Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initLlmGatewayStudio() {
  const elements = {
    primaryModel: document.getElementById('gw_primary_model'),
    fallbackModel: document.getElementById('gw_fallback_model'),
    cacheTime: document.getElementById('gw_cache_time'),
    rateLimit: document.getElementById('gw_rate_limit'),
    promptCache: document.getElementById('gw_prompt_cache'),
    budgetEnforcement: document.getElementById('gw_budget_enforcement'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-gw'),
    btnDownload: document.getElementById('btn-download-gw'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'gw_config';
  let compiledCode = {
    gw_config: '',
    gw_cache: '',
    gw_sh: '',
    gw_flow: ''
  };

  function getModelDetails(modelValue) {
    switch (modelValue) {
      case 'gpt-4o':
        return { provider: 'openai', modelPath: 'openai/gpt-4o', envKey: 'OPENAI_API_KEY', displayName: 'OpenAI GPT-4o' };
      case 'claude-3-5-sonnet':
        return { provider: 'anthropic', modelPath: 'anthropic/claude-3-5-sonnet', envKey: 'ANTHROPIC_API_KEY', displayName: 'Anthropic Claude 3.5 Sonnet' };
      case 'local-llama':
        return { provider: 'openai', modelPath: 'openai/meta-llama/Llama-3-70b-Instruct', envKey: 'VLLM_API_KEY', apiBase: 'http://localhost:8000/v1', displayName: 'Local Llama-3-70b' };
      case 'gpt-4o-mini':
        return { provider: 'openai', modelPath: 'openai/gpt-4o-mini', envKey: 'OPENAI_API_KEY', displayName: 'OpenAI GPT-4o Mini' };
      case 'local-mistral':
        return { provider: 'openai', modelPath: 'openai/mistralai/Mistral-7B-Instruct-v0.2', envKey: 'VLLM_API_KEY', apiBase: 'http://localhost:8000/v1', displayName: 'Local Mistral-7B' };
      default:
        return { provider: 'openai', modelPath: 'openai/gpt-4o', envKey: 'OPENAI_API_KEY', displayName: 'OpenAI GPT-4o' };
    }
  }

  function compileConfigs() {
    const primaryVal = elements.primaryModel ? elements.primaryModel.value : 'gpt-4o';
    const fallbackVal = elements.fallbackModel ? elements.fallbackModel.value : 'claude-3-5-sonnet';
    const cacheTtl = elements.cacheTime ? elements.cacheTime.value : '3600';
    const limitRpm = elements.rateLimit ? elements.rateLimit.value : '60';
    const isCacheEnabled = elements.promptCache ? elements.promptCache.checked : true;
    const isBudgetEnabled = elements.budgetEnforcement ? elements.budgetEnforcement.checked : true;

    const primary = getModelDetails(primaryVal);
    const fallback = getModelDetails(fallbackVal);

    // 1. Compile litellm-config.yaml
    let yaml = `model_list:\n`;
    yaml += `  - model_name: primary-router-model\n`;
    yaml += `    litellm_params:\n`;
    yaml += `      model: ${primary.modelPath}\n`;
    yaml += `      api_key: os.environ/${primary.envKey}\n`;
    if (primary.apiBase) {
      yaml += `      api_base: ${primary.apiBase}\n`;
    }
    yaml += `      rpm: ${limitRpm}\n`;
    
    yaml += `  - model_name: fallback-router-model\n`;
    yaml += `    litellm_params:\n`;
    yaml += `      model: ${fallback.modelPath}\n`;
    yaml += `      api_key: os.environ/${fallback.envKey}\n`;
    if (fallback.apiBase) {
      yaml += `      api_base: ${fallback.apiBase}\n`;
    }

    yaml += `\nrouter_settings:\n`;
    yaml += `  routing_strategy: usage-based-routing-v2\n`;
    yaml += `  enable_fallbacks: true\n`;
    yaml += `  fallbacks: [{"primary-router-model": ["fallback-router-model"]}]\n`;

    yaml += `\ngeneral_settings:\n`;
    yaml += `  master_key: sk_live_gateway_sre_key\n`;
    if (isCacheEnabled) {
      yaml += `  cache: true\n`;
      yaml += `  cache_type: redis\n`;
      yaml += `  cache_ttl: ${cacheTtl}\n`;
    }
    if (isBudgetEnabled) {
      yaml += `  budget_enforcement: true\n`;
      yaml += `  max_budget: 100.0\n`;
      yaml += `  budget_duration: 30d\n`;
    }

    compiledCode.gw_config = yaml;

    // 2. Compile semantic-cache.py
    let py = `import os\n`;
    py += `import redis\n`;
    py += `from sentence_transformers import SentenceTransformer\n`;
    py += `import numpy as np\n\n`;
    py += `# Semantic Caching Service using Vector Similary in Redis\n`;
    py += `REDIS_HOST = os.getenv("REDIS_HOST", "localhost")\n`;
    py += `REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))\n`;
    py += `CACHE_TTL = ${cacheTtl}\n`;
    py += `SIMILARITY_THRESHOLD = 0.85\n\n`;
    py += `class SemanticCache:\n`;
    py += `    def __init__(self):\n`;
    py += `        self.redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)\n`;
    py += `        # Load embedding model\n`;
    py += `        self.encoder = SentenceTransformer("all-MiniLM-L6-v2")\n\n`;
    py += `    def _get_embedding(self, text):\n`;
    py += `        return self.encoder.encode(text).tolist()\n\n`;
    py += `    def check_cache(self, prompt):\n`;
    py += `        if not ${isCacheEnabled ? 'True' : 'False'}:\n`;
    py += `            return None\n`;
    py += `        prompt_vector = self._get_embedding(prompt)\n`;
    py += `        # Perform Redis vector similarity search\n`;
    py += `        # Mock schema retrieval match\n`;
    py += `        results = self.redis_client.ft("prompt_idx").search(\n`;
    py += `            f"*=>[KNN 1 @prompt_vector $vec AS score]"\n`;
    py += `        )\n`;
    py += `        for doc in results.docs:\n`;
    py += `            score = float(doc.score)\n`;
    py += `            if score >= SIMILARITY_THRESHOLD:\n`;
    py += `                return doc.response\n`;
    py += `        return None\n\n`;
    py += `    def set_cache(self, prompt, response):\n`;
    py += `        if not ${isCacheEnabled ? 'True' : 'False'}:\n`;
    py += `            return\n`;
    py += `        prompt_vector = np.array(self._get_embedding(prompt), dtype=np.float32).tobytes()\n`;
    py += `        pipe = self.redis_client.pipeline()\n`;
    py += `        # Store cache record\n`;
    py += `        pipe.hset(f"cache:{prompt}", mapping={"prompt": prompt, "response": response, "embedding": prompt_vector})\n`;
    py += `        pipe.expire(f"cache:{prompt}", CACHE_TTL)\n`;
    py += `        pipe.execute()\n`;

    compiledCode.gw_cache = py;

    // 3. Compile query-gateway.sh
    let sh = `#!/usr/bin/env bash\n`;
    sh += `# Script to query local LiteLLM gateway with load balancing & routing\n`;
    sh += `set -eo pipefail\n\n`;
    sh += `GATEWAY_URL="http://localhost:4000/v1/chat/completions"\n`;
    sh += `API_KEY="sk_live_gateway_sre_key"\n\n`;
    sh += `echo "Sending inference query to LLM Gateway Router..."\n`;
    sh += `curl -X POST "$GATEWAY_URL" \\\n`;
    sh += `  -H "Authorization: Bearer $API_KEY" \\\n`;
    sh += `  -H "Content-Type: application/json" \\\n`;
    sh += `  -d '{\n`;
    sh += `    "model": "primary-router-model",\n`;
    sh += `    "messages": [\n`;
    sh += `      {"role": "user", "content": "Explain Kubernetes container restart loops."}\n`;
    sh += `    ],\n`;
    sh += `    "temperature": 0.2,\n`;
    sh += `    "max_tokens": 512\n`;
    sh += `  }'\n`;

    compiledCode.gw_sh = sh;

    // 4. Compile Routing Flow (Mermaid)
    let flow = 'graph TD\n';
    flow += '  App[👨‍💻 Client Application] -->|Inference Call| Gateway[🛡️ LiteLLM Gateway Proxy]\n';
    if (isCacheEnabled) {
      flow += `  Gateway -->|Check prompt similarity| Cache{⚡ Redis Semantic Cache: TTL ${cacheTtl}s}\n`;
      flow += '  Cache -->|Hit >= 0.85| App\n';
      flow += '  Cache -->|Miss| Router[🤖 Router Engine]\n';
    } else {
      flow += '  Gateway -->|Forward directly| Router[🤖 Router Engine]\n';
    }
    
    flow += `  Router -->|Try Primary| Primary[🟢 ${primary.displayName}]\n`;
    flow += '  Primary -->|Success| App\n';
    flow += `  Primary -->|Fallback on Failure/Rate Limit| Fallback[🟡 ${fallback.displayName}]\n`;
    flow += '  Fallback -->|Return Response| App\n';

    compiledCode.gw_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'gw_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.gw_flow + '</div>';
      
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
      let filename = 'litellm-config.yaml';
      if (activeTab === 'gw_cache') filename = 'semantic-cache.py';
      if (activeTab === 'gw_sh') filename = 'query-gateway.sh';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.primaryModel, elements.fallbackModel, elements.cacheTime, elements.rateLimit,
    elements.promptCache, elements.budgetEnforcement
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
    ['gw_config', 'gw_cache', 'gw_sh', 'gw_flow'],
    'gw_config',
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
  if (document.getElementById('gw_primary_model')) {
    initLlmGatewayStudio();
  }
});

window.initLlmGatewayStudio = initLlmGatewayStudio;
