// Azure Cognitive Search AI Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'search_config_json';
  let compiledCode = {};

  function compileConfigs() {
    
    const serviceName = document.getElementById('search_service_name').value;
    const indexName = document.getElementById('index_name').value;
    const endpoint = document.getElementById('azure_openai_endpoint').value;
    const dims = document.getElementById('vector_dimensions').value;

    const config = {
      "name": indexName,
      "fields": [
        { "name": "id", "type": "Edm.String", "key": true, "searchable": false },
        { "name": "content", "type": "Edm.String", "searchable": true },
        { "name": "vector", "type": "Collection(Edm.Single)", "searchable": true, "retrievable": true, "dimensions": parseInt(dims), "vectorSearchProfile": "my-vector-profile" }
      ],
      "vectorSearch": {
        "profiles": [{ "name": "my-vector-profile", "algorithm": "my-hnsw-config" }],
        "algorithms": [{ "name": "my-hnsw-config", "kind": "hnsw" }]
      }
    };
    compiledCode.search_config_json = JSON.stringify(config, null, 2);

    compiledCode.deploy_sh = "#!/usr/bin/env bash\n# Azure Cognitive Search Deployment SRE utility\n" + 
      "az search service create --name \"" + serviceName + "\" --resource-group \"my-rg\" --sku Standard\n" + 
      "curl -X PUT \"https://" + serviceName + ".search.windows.net/indexes/" + indexName + "?api-version=2023-11-01\" -H \"Content-Type: application/json\" -d @search_config.json\n";

    compiledCode.search_flow = "graph TD\n  A[OpenAI Endpoint: " + endpoint + "] -->|Embeddings| B[Generate Vectors]\n  B --> C[Push to Azure Search Index: " + indexName + "]\n  C --> D[Run Semantic Queries]\n";
    
    let filename = 'search_config.json';
    if (activeTab === 'deploy_sh') filename = 'deploy.sh';
    if (document.getElementById('download-name-input')) document.getElementById('download-name-input').value = filename;
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab.includes('flow')) {
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
  const inputs = document.querySelectorAll('.form-input, .form-select, .custom-checkbox');
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
    ['search_config_json', 'deploy_sh', 'search_flow'],
    'search_config_json',
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
  initStudio();
});

window.initStudio = initStudio;
