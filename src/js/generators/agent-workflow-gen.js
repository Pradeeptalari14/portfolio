// AI Agentic Workflow Compiler Studio compiler logic

function initAgentWorkflowStudio() {
  const elements = {
    sdkType: document.getElementById('wf_sdk_type'),
    pattern: document.getElementById('wf_pattern'),
    loopLimit: document.getElementById('wf_loop_limit'),
    humanLoop: document.getElementById('wf_human_loop'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-wf'),
    btnDownload: document.getElementById('btn-download-wf'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'wf_code';
  let compiledCode = {
    wf_code: '',
    wf_config: '',
    wf_flow: ''
  };

  function compileConfigs() {
    const sdk = elements.sdkType ? elements.sdkType.value : 'LangGraph';
    const patternVal = elements.pattern ? elements.pattern.value : 'Sequential';
    const loops = elements.loopLimit ? elements.loopLimit.value : '5';
    const isHuman = elements.humanLoop ? elements.humanLoop.checked : true;

    // 1. Compile agent-workflow.py
    let code = '';
    if (sdk === 'LangGraph') {
        code += `#!/usr/bin/env python3\n`;
        code += `# Compiled with LangGraph multi-agent execution framework\n`;
        code += `import os\n`;
        code += `import sys\n`;
        code += `from typing import TypedDict, Annotated, Sequence, List\n`;
        code += `from langgraph.graph import StateGraph, END\n\n`;
        
        code += `class AgentState(TypedDict):\n`;
        code += `    messages: List[str]\n`;
        code += `    current_node: str\n`;
        code += `    loop_count: int\n\n`;
        
        code += `# ── Node Definitions ──\n`;
        code += `def orchestrator_node(state: AgentState):\n`;
        code += `    print("🤖 [Orchestrator] Planning SRE task execution...")\n`;
        code += `    return {"messages": ["orchestrator has planned the task"], "current_node": "orchestrator", "loop_count": state["loop_count"] + 1}\n\n`;
        
        code += `def specialist_node(state: AgentState):\n`;
        code += `    print("🔍 [Specialist] Analyzing cluster logs and events...")\n`;
        if (isHuman) {
            code += `    # Human-in-the-loop manual confirmation before log retrieval\n`;
            code += `    confirm = input("⚠️ [HITL] Allow Specialist to fetch credentials? (y/n): ") or "y"\n`;
            code += `    if confirm.lower() != 'y':\n`;
            code += `        return {"messages": ["Specialist action denied by operator"], "current_node": "specialist", "loop_count": state["loop_count"] + 1}\n`;
        }
        code += `    return {"messages": ["specialist processed log dump successfully"], "current_node": "specialist", "loop_count": state["loop_count"] + 1}\n\n`;
        
        code += `# ── Graph Setup ──\n`;
        code += `builder = StateGraph(AgentState)\n`;
        code += `builder.add_node("orchestrator", orchestrator_node)\n`;
        code += `builder.add_node("specialist", specialist_node)\n\n`;
        
        code += `builder.set_entry_point("orchestrator")\n`;
        
        if (patternVal === 'Sequential') {
            code += `builder.add_edge("orchestrator", "specialist")\n`;
            code += `builder.add_conditional_edges(\n`;
            code += `    "specialist",\n`;
            code += `    lambda state: "end" if state["loop_count"] >= ${loops} else "orchestrator",\n`;
            code += `    {"end": END, "orchestrator": "orchestrator"}\n`;
            code += `)\n`;
        } else if (patternVal === 'Hierarchical') {
            code += `builder.add_conditional_edges(\n`;
            code += `    "orchestrator",\n`;
            code += `    lambda state: "specialist" if state["loop_count"] < 2 else "end",\n`;
            code += `    {"specialist": "specialist", "end": END}\n`;
            code += `)\n`;
            code += `builder.add_edge("specialist", "orchestrator")\n`;
        } else {
            code += `builder.add_edge("orchestrator", "specialist")\n`;
            code += `builder.add_edge("specialist", "orchestrator")\n`;
        }
        
        code += `\ngraph = builder.compile()\n\n`;
        code += `if __name__ == '__main__':\n`;
        code += `    if len(sys.argv) > 1 and sys.argv[1] == '--check':\n`;
        code += `        print("✅ LangGraph multi-agent compilation validated successfully.")\n`;
        code += `    else:\n`;
        code += `        print("🚀 Launching AI Agentic Workflow graph execution loop...")\n`;
        code += `        initial_state = {"messages": ["Bootstrap SRE audit"], "current_node": "", "loop_count": 0}\n`;
        code += `        result = graph.invoke(initial_state)\n`;
        code += `        print("🏁 Workflow execution finished. State:", result)\n`;
    } else if (sdk === 'CrewAI') {
        code += `#!/usr/bin/env python3\n`;
        code += `# CrewAI Agentic Workflow script definition\n`;
        code += `from crewai import Agent, Task, Crew, Process\n\n`;
        
        code += `orchestrator = Agent(\n`;
        code += `    role='SRE Workflow Coordinator',\n`;
        code += `    goal='Orchestrate incident triage tasks and compile incident root cause summaries',\n`;
        code += `    backstory='Senior Platform Engineer with expertise in K8s clusters and service meshes.',\n`;
        code += `    verbose=True\n`;
        code += `)\n\n`;
        
        code += `specialist = Agent(\n`;
        code += `    role='Log Analysis Specialist',\n`;
        code += `    goal='Analyze target logs, extract traces, and verify error indicators',\n`;
        code += `    backstory='AI analyst trained in structural log trace classification.',\n`;
        code += `    verbose=True\n`;
        code += `)\n\n`;
        
        code += `task1 = Task(description='Coordinate team log analysis workflow', agent=orchestrator, expected_output='Triage plan')\n`;
        code += `task2 = Task(description='Analyze log trace files', agent=specialist, expected_output='Anomalies details')\n\n`;
        
        code += `crew = Crew(\n`;
        code += `    agents=[orchestrator, specialist],\n`;
        code += `    tasks=[task1, task2],\n`;
        code += `    process=Process.sequential,\n`;
        code += `    max_rpm=${loops}\n`;
        code += `)\n\n`;
        code += `if __name__ == '__main__':\n`;
        code += `    print("🚀 Running CrewAI process...")\n`;
        code += `    crew.kickoff()\n`;
    } else {
        code += `// AutoGen agentic script mapping\n`;
        code += `// Currently unsupported locally, please use Python/LangGraph SDK option.\n`;
    }
    compiledCode.wf_code = code;

    // 2. Compile agents-config.json
    let configObj = {
        framework: sdk,
        pattern: patternVal,
        max_loops: parseInt(loops, 10),
        human_in_the_loop: isHuman,
        agents: [
            {
                name: "orchestrator",
                role: "SRE Workflow Coordinator",
                backstory: "Directs the execution flow, delegates tasks to specialist SRE agents, and compiles final triage reports.",
                tools: ["list_pods", "check_status"]
            },
            {
                name: "analyst",
                role: "Log Analysis Specialist",
                backstory: "Examines error logs, traces stack traces, identifies structural patterns, and checks anomalies.",
                tools: ["read_logs", "run_diagnostics"]
            }
        ]
    };
    compiledCode.wf_config = JSON.stringify(configObj, null, 2);

    // 3. Compile Flow Graph
    let flow = 'graph TD\n';
    flow += `  User[🧑‍💻 Platform Engineer] -->|Task Request| Node1[🤖 SRE Orchestrator]\n`;
    if (patternVal === 'Sequential') {
        flow += `  Node1 -->|Delegate step| Node2[🔍 Log Analyst Agent]\n`;
        if (isHuman) {
            flow += `  Node2 -->|Require approval| HITL[⚠️ Human-in-the-Loop Verification]\n`;
            flow += `  HITL -->|Granted| Exec[🔧 Execute Target Tools]\n`;
            flow += `  Exec -->|Check Loop limit: ${loops}| Loop{Loop count < Max}\n`;
        } else {
            flow += `  Node2 -->|Run directly| Exec[🔧 Execute Target Tools]\n`;
            flow += `  Exec -->|Check Loop limit: ${loops}| Loop{Loop count < Max}\n`;
        }
        flow += `  Loop -->|Yes| Node1\n`;
        flow += `  Loop -->|No| Halt[❌ Terminate Execution]\n`;
    } else if (patternVal === 'Hierarchical') {
        flow += `  Node1 -->|Supervisor evaluation| Router{Next Agent}\n`;
        flow += `  Router -->|Log checks| Node2[🔍 Log Analyst Agent]\n`;
        flow += `  Node2 -->|Report analysis| Node1\n`;
        flow += `  Router -->|Completed| End[🏁 Generate SRE Report]\n`;
    } else {
        flow += `  Node1 -->|Direct handoff| Node2[🔍 Log Analyst Agent]\n`;
        flow += `  Node2 -->|Report and query| Node1\n`;
    }
    compiledCode.wf_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'wf_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.wf_flow + '</div>';
      
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
      let filename = sdkTypeSelected() === 'LangGraph' || sdkTypeSelected() === 'CrewAI' ? 'agent-workflow.py' : 'agent-workflow.js';
      if (activeTab === 'wf_config') filename = 'agents-config.json';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  function sdkTypeSelected() {
    return elements.sdkType ? elements.sdkType.value : 'LangGraph';
  }

  // Bind controls listeners
  if (elements.sdkType) elements.sdkType.addEventListener('change', compileConfigs);
  if (elements.pattern) elements.pattern.addEventListener('change', compileConfigs);
  if (elements.loopLimit) elements.loopLimit.addEventListener('change', compileConfigs);
  if (elements.humanLoop) elements.humanLoop.addEventListener('change', compileConfigs);

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
    ['wf_code', 'wf_config', 'wf_flow'],
    'wf_code',
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
  if (document.getElementById('wf_sdk_type')) {
    initAgentWorkflowStudio();
  }
});

window.initAgentWorkflowStudio = initAgentWorkflowStudio;
