// LangChain & LlamaIndex Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'pipeline_py';
  let compiledCode = {};

  function compileConfigs() {
    
    const frame = document.getElementById('orch_frame').value;
    const temp = document.getElementById('model_temp').value;
    const parser = document.getElementById('ingest_parser').value;
    if (frame === 'langchain') {
      compiledCode.pipeline_py = "from langchain_openai import ChatOpenAI\nfrom langchain_community.document_loaders import " + parser + "\n\nloader = " + parser + "(\"manual.pdf\")\ndocs = loader.load()\nllm = ChatOpenAI(temperature=" + temp + ", model=\"gpt-4o\")\nprint(\"LangChain pipeline ready.\")\n";
    } else {
      compiledCode.pipeline_py = "from llama_index.core import SimpleDirectoryReader, VectorStoreIndex\n\ndocuments = SimpleDirectoryReader(\"data\").load_data()\nindex = VectorStoreIndex.from_documents(documents)\nquery_engine = index.as_query_engine(temperature=" + temp + ")\nprint(\"LlamaIndex pipeline ready.\")\n";
    }
    compiledCode.requirements_txt = "langchain\nlangchain-openai\nllama-index\npydantic\n";
    compiledCode.orch_flow = "graph TD\n  Docs[Data Files] -->|Parser: " + parser + "| Index[Index System]\n  Index -->|Query Engine| LLM[LLM Temp: " + temp + "]";
    let filename = 'pipeline.py';
    if (activeTab === 'requirements_txt') filename = 'requirements.txt';
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
    ['pipeline_py', 'requirements_txt', 'orch_flow'],
    'pipeline_py',
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
