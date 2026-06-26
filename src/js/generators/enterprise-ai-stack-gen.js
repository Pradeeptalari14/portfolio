// Enterprise AI Technology Stack SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'stack_blueprint_yaml';
  let compiledCode = {};

  function compileConfigs() {
    const ui = document.getElementById('stack_ui').value;
    const api = document.getElementById('stack_api').value;
    const gateway = document.getElementById('stack_gateway').value;
    const identity = document.getElementById('stack_identity').value;
    const router = document.getElementById('stack_router').value;
    const llm = document.getElementById('stack_llm').value;
    const agent = document.getElementById('stack_agent').value;
    const rag = document.getElementById('stack_rag').value;
    const vectordb = document.getElementById('stack_vectordb').value;
    const storage = document.getElementById('stack_storage').value;
    const database = document.getElementById('stack_database').value;
    const cache = 'Redis'; // Fixed value in the schema
    const messaging = document.getElementById('stack_messaging').value;
    const workflow = document.getElementById('stack_workflow').value;
    const security = document.getElementById('stack_security').value;
    const obs = document.getElementById('stack_obs').value;

    // 1. Generate YAML Blueprint
    compiledCode.stack_blueprint_yaml = `apiVersion: enterprise.ai/v1alpha1
kind: AIStackBlueprint
metadata:
  name: corporate-ai-platform
  namespace: enterprise-ai
spec:
  topology:
    frontend:
      ui:
        name: "${ui}"
        purpose: "Chat interface & client presentation layer"
      api:
        name: "${api}"
        purpose: "REST / WebSockets backend endpoints"
      gateway:
        name: "${gateway}"
        purpose: "Routing, SSL/TLS termination, rate limiting"
    governance:
      identity:
        name: "${identity}"
        purpose: "Authentication & OAuth2/OIDC provider integrations"
      security:
        name: "${security}"
        purpose: "Credentials management, secrets rotating"
    intelligence:
      router:
        name: "${router}"
        purpose: "Model routing, token tracking & load-balancing"
      orchestrator:
        name: "${agent}"
        purpose: "Multi-agent swarm coordination"
      rag:
        name: "${rag}"
        purpose: "Document ingestion, parsing, semantic matching"
      models:
        - name: "${llm}"
          purpose: "Inference compute engine"
    storageState:
      vectorDb:
        name: "${vectordb}"
        purpose: "Semantic embeddings indexing & vector queries"
      objectStorage:
        name: "${storage}"
        purpose: "Unstructured files and document landing zones"
      database:
        name: "${database}"
        purpose: "Structured application state"
      cache:
        name: "${cache}"
        purpose: "Fast memory & semantic cache backend"
    pipelines:
      messaging:
        name: "${messaging}"
        purpose: "Asynchronous pipeline broker"
      workflow:
        name: "${workflow}"
        purpose: "Long-running backend tasks & orchestration"
    observability:
      monitoring:
        name: "${obs}"
        purpose: "Tracing collector, performance metrics, and logs"
`;

    // 2. Generate Markdown Deployment Plan
    compiledCode.deployment_plan_md = `# Enterprise AI Platform Integration Runbook

This document details the deployment, integration, and communication plan for the corporate AI platform.

## 📡 Operational Traffic Flow
1. **User Client** accesses the frontend **${ui}** interface.
2. Requests are routed through the **${gateway}** gateway.
3. The gateway authorizes users against **${identity}** using OIDC bearer tokens.
4. Authorized requests trigger the **${api}** backend.
5. The backend launches agent workflows managed via **${agent}** combined with **${rag}** data fetching.
6. Vector searches target **${vectordb}**; binary assets are retrieved from **${storage}**.
7. Inference commands route through the **${router}** proxy targeting the **${llm}** model pool.
8. Telemetry metrics are emitted directly to **${obs}**.

## 🛡️ Security & Secrets Integration
* Credentials and API keys (e.g. model endpoints keys, database secrets) are stored in **${security}**.
* Shared configurations and database passwords are dynamically injected into containers at runtime as environment variables.

## 📈 Scalability Strategies
* **State & Memory**: **${cache}** serves as the semantic caching layer on port 6379 to bypass redundant LLM inference calls and lower costs.
* **Queues**: Heavy ingestion workloads publish events to **${messaging}**, and workers coordinate structured data sync tasks using **${workflow}**.
`;

    // 3. Generate Mermaid Architecture Map
    compiledCode.architecture_map = `graph TD
  User([User Client]) -->|HTTPS| GW[Gateway: ${gateway}]
  GW -->|Auth| IAM[Identity: ${identity}]
  GW -->|Route| UI[UI: ${ui}]
  UI -->|APIs| API[Backend API: ${api}]
  API -->|Fetch Secrets| Sec[Security: ${security}]
  API -->|Cache Check| Cache[Cache: ${cache}]
  API -->|Spawn Worker| Workflow[Workflow: ${workflow}]
  API -->|Trigger Agent| Agent[Agent: ${agent}]
  
  Agent -->|RAG Query| RAG[RAG: ${rag}]
  RAG -->|Vector Search| VDB[Vector DB: ${vectordb}]
  RAG -->|Fetch Documents| Storage[Storage: ${storage}]
  
  Agent -->|Inference Call| Router[AI Router: ${router}]
  Router -->|Execute Prompt| LLM[LLM: ${llm}]
  
  Workflow -->|Publish Sync Event| Bus[Messaging: ${messaging}]
  
  API -.->|Metrics/Traces| Obs[Observability: ${obs}]
  Agent -.->|LLM Tracing| Obs
  
  style GW fill:#f9f,stroke:#333,stroke-width:2px
  style IAM fill:#bbf,stroke:#333,stroke-width:2px
  style LLM fill:#ffb,stroke:#333,stroke-width:2px
  style Agent fill:#bfb,stroke:#333,stroke-width:2px
  style VDB fill:#fbb,stroke:#333,stroke-width:2px
  style Sec fill:#fdf,stroke:#333,stroke-width:2px
`;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'architecture_map') {
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
    ['stack_blueprint_yaml', 'deployment_plan_md', 'architecture_map'],
    'stack_blueprint_yaml',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      elements.downloadInput.value = tabName === 'stack_blueprint_yaml' ? 'stack_blueprint.yaml' : (tabName === 'deployment_plan_md' ? 'deployment_plan.md' : 'architecture_map.txt');
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
