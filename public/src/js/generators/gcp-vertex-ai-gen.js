// GCP Vertex AI Model Registry Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'deploy_py';
  let compiledCode = {};

  function compileConfigs() {
    
    const project = document.getElementById('vertex_project_id').value;
    const modelName = document.getElementById('vertex_model_id').value;
    const region = document.getElementById('vertex_region').value;
    const endpoint = document.getElementById('vertex_endpoint').value;

    compiledCode.deploy_py = "import google.cloud.aiplatform as aiplatform\n\n" + 
      "aiplatform.init(project='" + project + "', location='" + region + "')\n" +
      "model = aiplatform.Model.upload(\n" + 
      "    display_name='" + modelName + "',\n" + 
      "    artifact_uri='gs://" + project + "-models/" + modelName + "/',\n" + 
      "    serving_container_image_uri='gcr.io/cloud-aiplatform/prediction/tf2-cpu.2-5:latest'\n" + 
      ")\n" + 
      "endpoint = model.deploy(endpoint_title='" + endpoint + "')\n" + 
      "print(f'Deployed model: {model.resource_name} to endpoint: {endpoint.resource_name}')\n";

    compiledCode.predict_curl = "#!/usr/bin/env bash\n" + 
      "curl -X POST -H \"Authorization: Bearer $(gcloud auth print-access-token)\" \"https://" + region + "-aiplatform.googleapis.com/v1/projects/" + project + "/locations/" + region + "/endpoints/" + endpoint + ":predict\" -H \"Content-Type: application/json\" -d @instances.json\n";

    compiledCode.vertex_flow = "graph TD\n  Storage[GCS gs://" + project + "-models] -->|Model Weights| Vertex[Vertex AI Model Registry]\n  Vertex -->|Deploy| EP[Endpoint: " + endpoint + "]\n  Client[Client request] -->|HTTPS POST| EP\n";
    
    let filename = 'vertex_deploy.py';
    if (activeTab === 'predict_curl') filename = 'predict.sh';
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
    ['deploy_py', 'predict_curl', 'vertex_flow'],
    'deploy_py',
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
