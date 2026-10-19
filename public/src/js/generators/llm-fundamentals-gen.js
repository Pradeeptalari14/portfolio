// LLM Fundamentals & Runtime Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'runtime_conf';
  let compiledCode = {};

  function compileConfigs() {
    
    const model = document.getElementById('model_rep').value;
    const engine = document.getElementById('run_eng').value;
    const tp = document.getElementById('tp_size').value;
    if (engine === 'vllm') {
      compiledCode.runtime_conf = "python3 -m vllm.entrypoints.openai.api_server \
  --model " + model + " \
  --tensor-parallel-size " + tp + " \
  --gpu-memory-utilization 0.90 \
  --max-model-len 4096";
    } else if (engine === 'ollama') {
      compiledCode.runtime_conf = "FROM " + model + "\nPARAMETER temperature 0.7\nPARAMETER num_ctx 4096\nSYSTEM \"You are a helpful assistant.\"";
    } else {
      compiledCode.runtime_conf = "# HuggingFace TGI Config\nmodel-id: " + model + "\nnum-shard: " + tp;
    }
    compiledCode.run_sh = "#!/usr/bin/env bash\necho \"Starting LLM Runtime: " + engine + "...\"\n" + compiledCode.runtime_conf;
    compiledCode.runtime_flow = "graph TD\n  Model[Model: " + model + "] -->|Download| Engine[Engine: " + engine + "]\n  Engine -->|Serve API| Client[App Client: TP Size " + tp + "]";
    let filename = 'Modelfile';
    if (activeTab === 'run_sh') filename = 'run.sh';
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
    ['runtime_conf', 'run_sh', 'runtime_flow'],
    'runtime_conf',
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
