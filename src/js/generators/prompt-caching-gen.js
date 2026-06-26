// Prompt Caching & Cost Optimization Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
    costWithout: document.getElementById('cost-without-caching'),
    costWith: document.getElementById('cost-with-caching'),
    savingsPercent: document.getElementById('cost-savings-percent'),
    savingsDollar: document.getElementById('cost-savings-dollar'),
    progressBar: document.getElementById('savings-progress-bar'),
  };

  let activeTab = 'prompt_caching_py';
  let compiledCode = {};

  // Cost calculation function
  function updateCostSavings() {
    const provider = document.getElementById('caching_provider').value;
    const staticSize = parseInt(document.getElementById('mock_prompt_size').value, 10);
    const dailyCalls = parseInt(document.getElementById('calc_daily_calls').value, 10) || 1000;
    const dynamicSize = parseInt(document.getElementById('calc_dynamic_size').value, 10) || 100;

    const monthlyCalls = dailyCalls * 30;
    
    // Rates per 1M tokens
    let standardInputRate = 2.50; // default OpenAI gpt-4o
    let cachedInputRate = 1.25;

    if (provider === 'anthropic') {
      standardInputRate = 3.00; // Claude 3.5 Sonnet
      cachedInputRate = 0.30;   // Cache read hit (90% off)
    } else if (provider === 'deepseek') {
      standardInputRate = 0.14; // DeepSeek V3
      cachedInputRate = 0.014;  // Cache read hit (90% off)
    }

    // Cost calculations
    const costWithoutVal = (monthlyCalls * (staticSize + dynamicSize) / 1000000) * standardInputRate;
    
    // Assuming 95% cache hits on the static prompt prefix in high-throughput production
    const cacheHitRate = 0.95;
    const costWithVal = (monthlyCalls * (
      (staticSize * cachedInputRate * cacheHitRate) + 
      (staticSize * standardInputRate * (1 - cacheHitRate)) + 
      (dynamicSize * standardInputRate)
    ) / 1000000);

    const savingsPercentVal = costWithoutVal > 0 ? ((costWithoutVal - costWithVal) / costWithoutVal) * 100 : 0;
    const savingsDollarVal = Math.max(0, costWithoutVal - costWithVal);

    if (elements.costWithout) elements.costWithout.textContent = `$${costWithoutVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elements.costWith) elements.costWith.textContent = `$${costWithVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elements.savingsPercent) elements.savingsPercent.textContent = `${Math.round(savingsPercentVal)}%`;
    if (elements.savingsDollar) elements.savingsDollar.textContent = `$${savingsDollarVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elements.progressBar) elements.progressBar.style.width = `${Math.min(100, Math.max(0, savingsPercentVal))}%`;
  }

  function compileConfigs() {
    const provider = document.getElementById('caching_provider').value;
    const scope = document.getElementById('cached_scope').value;
    const staticSize = document.getElementById('mock_prompt_size').value;
    const normalization = document.getElementById('token_normalization').value;

    updateCostSavings();

    // 1. prompt_caching.py
    compiledCode.prompt_caching_py = "#!/usr/bin/env python3\n" +
      "# Prompt Caching & Latency Optimization Layer\n" +
      "# LLM Provider: " + provider.toUpperCase() + "\n" +
      "# Cached Tokens: " + staticSize + "\n" +
      "# Normalization Filter: " + normalization.toUpperCase() + "\n\n";

    if (provider === 'anthropic') {
      compiledCode.prompt_caching_py += "import anthropic\n\n" +
        "def query_caching_copilot(user_query, context_docs=None):\n" +
        "    # Initialize Anthropic Claude Client with Ephemeral Caching\n" +
        "    client = anthropic.Anthropic()\n" +
        "    \n" +
        "    system_prompt = (\n" +
        "        \"You are an Enterprise SRE Platform Copilot. \"\n" +
        "        \"Use the provided runbooks and policies to audit incoming configurations.\"\n" +
        "    )\n" +
        "    \n" +
        "    # Define system blocks with explicit cache boundaries\n" +
        "    system_blocks = [\n" +
        "        {\n" +
        "            \"type\": \"text\",\n" +
        "            \"text\": system_prompt,\n" +
        "            \"cache_control\": {\"type\": \"ephemeral\"}  # Cached first prompt block\n" +
        "        }\n" +
        "    ]\n" +
        "    \n" +
        "    if context_docs:\n" +
        "        # Explicitly cache dynamic RAG context docs for 5-minute lease windows\n" +
        "        system_blocks.append({\n" +
        "            \"type\": \"text\",\n" +
        "            \"text\": f\"\\n[CONTEXT RUNBOOKS]\\n{context_docs}\",\n" +
        "            \"cache_control\": {\"type\": \"ephemeral\"}  # Cached second prompt block\n" +
        "        })\n" +
        "        \n" +
        "    response = client.beta.prompt_caching.messages.create(\n" +
        "        model=\"claude-3-5-sonnet-20241022\",\n" +
        "        max_tokens=1024,\n" +
        "        system=system_blocks,\n" +
        "        messages=[\n" +
        "            {\"role\": \"user\", \"content\": user_query}\n" +
        "        ]\n" +
        "    )\n" +
        "    \n" +
        "    # Log cache hit/miss statistics in metadata outputs\n" +
        "    input_tokens = response.usage.input_tokens\n" +
        "    cached_tokens = response.usage.cache_read_input_tokens\n" +
        "    print(f\"Usage: {input_tokens} tokens processed ({cached_tokens} retrieved from cache)\")\n" +
        "    \n" +
        "    return response.content[0].text\n";
    } else if (provider === 'openai') {
      compiledCode.prompt_caching_py += "from openai import OpenAI\n\n" +
        "def query_caching_copilot(user_query, context_docs=None):\n" +
        "    # OpenAI automatically caches prompt prefixes containing 1024+ tokens.\n" +
        "    # To trigger cache hits, static structures MUST be at the beginning.\n" +
        "    client = OpenAI()\n" +
        "    \n" +
        "    system_content = \"You are an SRE Platform Copilot. Review incoming query instructions.\"\n" +
        "    if context_docs:\n" +
        "        system_content += f\"\\nContext documents:\\n{context_docs}\"\n" +
        "        \n" +
        "    # Build stable messages list prefix\n" +
        "    messages = [\n" +
        "        {\"role\": \"system\", \"content\": system_content},\n" +
        "        {\"role\": \"user\", \"content\": user_query}\n" +
        "    ]\n" +
        "    \n" +
        "    response = client.chat.completions.create(\n" +
        "        model=\"gpt-4o\",\n" +
        "        messages=messages\n" +
        "    )\n" +
        "    return response.choices[0].message.content\n";
    } else {
      compiledCode.prompt_caching_py += "from openai import OpenAI\n\n" +
        "def query_caching_copilot(user_query, context_docs=None):\n" +
        "    # DeepSeek supports zero-cost prompt prefix caching automatically.\n" +
        "    client = OpenAI(\n" +
        "        base_url=\"https://api.deepseek.com\",\n" +
        "        api_key=\"YOUR_DEEPSEEK_API_KEY\"\n" +
        "    )\n" +
        "    \n" +
        "    system_content = \"You are an SRE Platform Copilot. Keep prompt prefix identical to reuse cache.\"\n" +
        "    if context_docs:\n" +
        "        system_content += f\"\\nContext:\\n{context_docs}\"\n" +
        "        \n" +
        "    messages = [\n" +
        "        {\"role\": \"system\", \"content\": system_content},\n" +
        "        {\"role\": \"user\", \"content\": user_query}\n" +
        "    ]\n" +
        "    \n" +
        "    response = client.chat.completions.create(\n" +
        "        model=\"deepseek-chat\",\n" +
        "        messages=messages\n" +
        "    )\n" +
        "    return response.choices[0].message.content\n";
    }

    // 2. payload.json
    const payload = {
      model: provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : (provider === 'openai' ? 'gpt-4o' : 'deepseek-chat'),
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: "Audit CPU throttling logs on deployment/web-server."
        }
      ]
    };

    if (provider === 'anthropic') {
      payload.system = [
        {
          type: "text",
          text: "System instructions and tools definitions block...",
          cache_control: { type: "ephemeral" }
        }
      ];
    } else {
      payload.messages.unshift({
        role: "system",
        content: "System instructions and tools definitions block..."
      });
    }

    compiledCode.payload_json = JSON.stringify(payload, null, 2);

    // 3. caching_rules.json
    compiledCode.caching_rules_json = JSON.stringify({
      provider: provider,
      rules: {
        min_prefix_tokens: provider === 'openai' ? 1024 : 0,
        cache_eviction_ttl_seconds: 300,
        budget_alerts: {
          monthly_cost_limit_usd: 500.00,
          warning_threshold: 0.80
        },
        optimization: {
          normalize_whitespace: normalization === 'enabled',
          strip_comments: true,
          force_lowercase_keys: true
        }
      }
    }, null, 2);

    // 4. github_actions_yml
    compiledCode.github_actions_yml = "name: Prompt Prefix Stability & Cache Verification\n\n" +
      "on:\n" +
      "  push:\n" +
      "    branches: [ main ]\n" +
      "  pull_request:\n" +
      "    branches: [ main ]\n\n" +
      "jobs:\n" +
      "  validate-prompts:\n" +
      "    runs-on: ubuntu-latest\n" +
      "    steps:\n" +
      "      - name: Checkout Code\n" +
      "        uses: actions/checkout@v4\n\n" +
      "      - name: Spin up prompt registry cache mock proxy\n" +
      "        run: |\n" +
      "          docker compose up -d\n" +
      "          sleep 5\n\n" +
      "      - name: Run prompt linting and prefix stability validation\n" +
      "        run: |\n" +
      "          bash scripts/validate.sh\n";

    let filename = 'prompt_caching.py';
    if (activeTab === 'payload_json') filename = 'payload.json';
    if (activeTab === 'caching_rules_json') filename = 'caching_rules.json';
    if (activeTab === 'github_actions_yml') filename = 'sre-validation.yml';
    
    if (document.getElementById('download-name-input')) {
      document.getElementById('download-name-input').value = filename;
    }
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    elements.outputBox.classList.remove('hidden');
    if (elements.mermaidContainer) elements.mermaidContainer.classList.add('hidden');
    elements.outputBox.textContent = compiledCode[activeTab] || '';
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select');
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
    ['prompt_caching_py', 'payload_json', 'caching_rules_json', 'github_actions_yml', 'terminal'],
    'prompt_caching_py',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initialize interactive SRE terminal console
  window.SreCore.initTerminalSupport('prompt-caching', 'Prompt Caching & Cost Optimization');

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
