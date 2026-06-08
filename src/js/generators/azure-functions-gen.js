// Azure Functions Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'func_json';
  let compiledCode = {};

  function compileConfigs() {
    
    const name = document.getElementById('func_name').value;
    const trigger = document.getElementById('func_trigger').value;
    const queue = document.getElementById('func_queue').value;
    const auth = document.getElementById('func_auth').value;

    const funcObj = {
      "bindings": [
        {
          "type": trigger,
          "direction": "in",
          "name": "myQueueItem",
          "queueName": queue,
          "connection": "AzureWebJobsStorage"
        }
      ]
    };
    if (trigger === 'httpTrigger') {
      funcObj.bindings[0].name = "req";
      funcObj.bindings[0].authLevel = auth;
      delete funcObj.bindings[0].queueName;
    }
    compiledCode.func_json = JSON.stringify(funcObj, null, 2);

    compiledCode.run_sh = "#!/usr/bin/env bash\n" + 
      "func start --verbose\n";

    compiledCode.func_flow = "graph TD\n  Event[Event Trigger: " + trigger + "] -->|Dispatches message| Func[Function: " + name + "]\n  Func -->|Log Trace| Console[App Console logs]\n";
    
    let filename = 'function.json';
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
    ['func_json', 'run_sh', 'func_flow'],
    'func_json',
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
