// LangGraph & Multi-Agent Swarm Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'graph_py';
  let compiledCode = {};

  function compileConfigs() {
    
    const superv = document.getElementById('supervisor_name').value;
    const workers = parseInt(document.getElementById('workers_count').value);
    const stateKey = document.getElementById('state_key').value;
    compiledCode.graph_py = "from langgraph.graph import StateGraph, END\nfrom typing import TypedDict, List\n\nclass AgentState(TypedDict):\n    " + stateKey + ": str\n    messages: List[str]\n\nworkflow = StateGraph(AgentState)\nworkflow.add_node(\"" + superv + "\", supervisor_node)\n# Added " + workers + " worker nodes\nworkflow.set_entry_point(\"" + superv + "\")\n";
    compiledCode.nodes_py = "def supervisor_node(state):\n    print(\"Routing state: \" + state[\"" + stateKey + "\"])\n    return {\"messages\": [\"Routing...\"]}\n";
    compiledCode.langgraph_flow = "graph TD\n  Start([Entry Point]) --> Super[Supervisor: " + superv + "]\n  Super --> Worker1[Worker Node 1]\n  Super --> Worker2[Worker Node 2]";
    let filename = 'swarm_graph.py';
    if (activeTab === 'nodes_py') filename = 'nodes.py';
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
    ['graph_py', 'nodes_py', 'langgraph_flow'],
    'graph_py',
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
