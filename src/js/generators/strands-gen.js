import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'agent';
    let simulationRunning = false;

    // SRE Code Explanations Database
    const tabExplanations = {
      agent: {
        title: "Autonomous SRE Agent",
        filename: "agent.py",
        why: "Defines the core Strands agent containing custom-decorated python tool permissions (like kubectl and shell operations). It binds the target LLM and initiates the reasoning execution loops.",
        when: "Use to launch autonomous diagnostic scripts on local developer machines or private cluster namespaces.",
        where: "Deploy to your SRE server environment as a system application.",
        command: "python agent.py",
        practices: [
          "Wrap tool processes inside try-except blocks to return clear error outputs to the LLM.",
          "Restrict write permissions (remediation commands) unless active human approval is configured."
        ],
        ai_mlops: "Lays down the basic foundation for the **Kubernetes Troubleshooting Agent** using the Strands SDK.",
        flow: "[Agent loop] ➔ [Evaluates alarm input] ➔ [Invokes python tool] ➔ [Parses diagnostic output]"
      },
      swarm: {
        title: "Swarm Orchestrator",
        filename: "swarm_orchestrator.py",
        why: "Constructs a multi-agent network featuring a Triage Agent and a Resolver Agent. Triage reads anomaly inputs and passes structured incident alerts to the Resolver agent for cleanups.",
        when: "Deploy when incident logs require separation of concerns between diagnostic checks and action implementations.",
        where: "Deploy to SRE task executors running inside your private nodes.",
        command: "python swarm_orchestrator.py",
        practices: [
          "Establish peer communication schemas to log agent-to-agent delegation statements.",
          "Enforce timeout limits to avoid infinite looping queries in collaborative reasoning."
        ],
        ai_mlops: "Represents the implementation structure of the **Self-Healing Infrastructure Platform**.",
        flow: "[Triage Agent] ➔ [Locates Error Pattern] ➔ [Delegates Task] ➔ [Resolver Agent resolves]"
      },
      run: {
        title: "Bootstrap Execution Script",
        filename: "run.sh",
        why: "Automates SDK dependency installations, loads required API credentials, and launches the custom agent server or standalone CLI.",
        when: "Run during initially provisioning agent scripts on system clusters.",
        where: "Execute inside the agent workspace directory.",
        command: "bash run.sh",
        practices: [
          "Load API secrets strictly via environment configs rather than committing raw strings.",
          "Configure Python virtual environments (venv) to prevent system package collisions."
        ],
        ai_mlops: "Provisioning automation scripts for agent deployment.",
        flow: "[Execute run.sh] ➔ [Installs strands-agents] ➔ [Exports model secrets] ➔ [Launches agent]"
      },
      readme: {
        title: "Agent Setup & Runbook",
        filename: "README.md",
        why: "Documents library prerequisites, MCP server settings, OpenTelemetry configurations, and terminal execution commands.",
        when: "Include inside your developer repository to guide engineers on running SRE agents.",
        where: "Save in the root of the workspace directory.",
        command: "# View in markdown viewer",
        practices: [
          "Document mandatory environment variables (e.g. OPENAI_API_KEY, OLLAMA_HOST).",
          "Include step-by-step verification commands."
        ],
        ai_mlops: "Detailed operator walkthroughs for managing and tracing agent metrics.",
        flow: "[README.md Guide] ➔ [Provides setup instructions]"
      }
    };

    let compiledCode = {
      agent: '',
      swarm: '',
      run: '',
      readme: ''
    ,
  flow: ''
};

    const tabConfigs = {
      agent: { label: 'agent.py', filename: 'agent', ext: '.py' ,
  flow: { label: '📊 Visual Flowchart', filename: 'flow', ext: '.mermaid' }
},
      swarm: { label: 'swarm_orchestrator.py', filename: 'swarm_orchestrator', ext: '.py' },
      run: { label: 'run.sh', filename: 'run', ext: '.sh' },
      readme: { label: 'README.md', filename: 'README', ext: '.md' }
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      setupCompilerTriggers(triggerCompileAll);
      $('agent_arch').addEventListener('change', toggleSwarmUI);
    }

    function toggleSwarmUI() {
      const arch = $('agent_arch').value;
      const swarmTab = $('tab-swarm');
      const swarmRow = $('swarm-flow-row');

      if (arch === 'swarm') {
        swarmTab.style.display = 'inline-block';
        swarmRow.style.opacity = '1';
        swarmRow.style.pointerEvents = 'auto';
      } else {
        swarmTab.style.display = 'none';
        swarmRow.style.opacity = '0.15';
        swarmRow.style.pointerEvents = 'none';
        if (activeTab === 'swarm') {
          switchTab('agent');
        }
      }
      triggerCompileAll();
    }

    function triggerCompileAll() {
      compileAgent();
      compileSwarm();
      compileRun();
      compileReadme();
      compileMermaidFlow();
  updateViewportContent();
    }

    function compileAgent() {
      const task = $('agent_task').value;
      const model = $('agent_model').value;
      const mode = $('integration_mode').value;
      const tk8s = $('tool_k8s').checked;
      const tshell = $('tool_shell').checked;
      const theal = $('tool_heal').checked;

      let modelSetup = '';
      if (model === 'bedrock') {
        modelSetup = `agent = Agent(\n    model="us.amazon.nova-pro-v1:0",\n    provider="bedrock"\n)`;
      } else if (model === 'openai') {
        modelSetup = `agent = Agent(\n    model="gpt-4o",\n    provider="openai"\n)`;
      } else {
        modelSetup = `agent = Agent(\n    model="llama3:8b",\n    provider="ollama",\n    api_base="http://localhost:11434"\n)`;
      }

      let toolsCode = '';
      let toolsList = [];

      if (tk8s) {
        toolsCode += `@tool\ndef check_kubernetes_pod_logs(pod_name: str, namespace: str = "default") -> str:
    """Fetches diagnostic stderr/stdout logs for a specific pod inside a Kubernetes namespace."""
    cmd = f"kubectl logs {pod_name} -n {namespace} --tail=100"
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return res.stdout or res.stderr\n\n`;
        toolsList.push('check_kubernetes_pod_logs');
      }

      if (tshell) {
        toolsCode += `@tool\ndef execute_system_diagnostics(metric_type: str) -> str:
    """Runs local shell status checks (metric_type can be 'disk', 'memory', or 'cpu')."""
    cmd = "df -h /" if metric_type == "disk" else ("free -m" if metric_type == "memory" else "uptime")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return res.stdout or res.stderr\n\n`;
        toolsList.push('execute_system_diagnostics');
      }

      if (theal) {
        toolsCode += `@tool\ndef execute_remediation_action(action_name: str) -> str:
    """Executes a system recovery action (e.g. 'docker_prune', 'restart_service')."""
    cmd = "docker system prune -af" if action_name == "docker_prune" else "systemctl restart payment-app"
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return f"Remediation success: {res.stdout or res.stderr}"\n\n`;
        toolsList.push('execute_remediation_action');
      }

      let mcpWrapper = '';
      if (mode === 'mcp') {
        mcpWrapper = `\n# Exposing Agent as an MCP Server
from strands.mcp import MCPServer

mcp_server = MCPServer(agent, name="sre-agent-mcp")

if __name__ == "__main__":
    mcp_server.start()`
      } else if (mode === 'telemetry') {
        mcpWrapper = `\n# OpenTelemetry Tracing enabled
from strands.observability import trace_agent

trace_agent(agent, endpoint="http://localhost:4317")

if __name__ == "__main__":
    task_prompt = "Find why the payment-app is crashing and fix it."
    result = agent(task_prompt)
    print(f"Agent Output: {result}")`
      } else {
        mcpWrapper = `\nif __name__ == "__main__":
    task_prompt = "Find why the payment-app is crashing and fix it."
    result = agent(task_prompt)
    print(f"Agent Output: {result}")`
      }

      let code = `from strands import Agent, tool
import subprocess

# Define custom tools for the agentic loop
${toolsCode}
# Initialize the SRE agent
agent = Agent(
    tools=[${toolsList.join(', ')}],
    system_prompt="You are an autonomous SRE Troubleshooter. Actively invoke tools to diagnose errors."
)

${modelSetup}
${mcpWrapper}
`;
      compiledCode.agent = code;
    }

    function compileSwarm() {
      const model = $('agent_model').value;
      let modelArg = model === 'openai' ? 'model="gpt-4o"' : (model === 'bedrock' ? 'model="us.amazon.nova-pro-v1:0"' : 'model="llama3:8b"');

      let code = `from strands import Swarm, Agent, tool
import subprocess

@tool
def fetch_pod_logs(pod: str) -> str:
    """Gets logs for a target pod."""
    res = subprocess.run(f"kubectl logs {pod} --tail=50", shell=True, capture_output=True, text=True)
    return res.stdout or res.stderr

@tool
def restart_failing_service(pod: str) -> str:
    """Restarts target workload pod."""
    res = subprocess.run(f"kubectl delete pod {pod}", shell=True, capture_output=True, text=True)
    return "Service deletion triggered successfully."

# Define collaborative SRE swarm agents
triage_agent = Agent(
    name="TriageAgent",
    tools=[fetch_pod_logs],
    system_prompt="You examine cluster failures and diagnose the root error. Delegate fix actions.",
    ${modelArg}
)

resolver_agent = Agent(
    name="ResolverAgent",
    tools=[restart_failing_service],
    system_prompt="You execute healing actions (deletions, restarts) once an error is triaged.",
    ${modelArg}
)

# Connect agents into Swarm
swarm = Swarm(
    agents=[triage_agent, resolver_agent],
    entrypoint="TriageAgent"
)

if __name__ == "__main__":
    print("Launching Multi-Agent Swarm execution loop...")
    remediation_log = swarm.run("Identify and resolve pod anomalies in the cluster.")
    print(f"Swarm Output: {remediation_log}")
`;
      compiledCode.swarm = code;
    }

    function compileRun() {
      const mode = $('integration_mode').value;
      const model = $('agent_model').value;

      let keyExports = '';
      if (model === 'openai') {
        keyExports = 'export OPENAI_API_KEY="your-openai-api-key-here"';
      } else if (model === 'bedrock') {
        keyExports = 'export AWS_ACCESS_KEY_ID="your-aws-access-key-here"\nexport AWS_SECRET_ACCESS_KEY="your-aws-secret-here"';
      } else {
        keyExports = 'export OLLAMA_HOST="http://localhost:11434"';
      }

      let runCmd = 'python agent.py';
      if (mode === 'mcp') {
        runCmd = '# Run as stdin/stdout transport server\npython agent.py --mcp-transport=stdio';
      }

      let code = `#!/bin/bash
# Strands Agent Bootstrapper
set -e

echo "=== 🚀 Installing SRE Agent Dependencies ==="
pip install -r requirements.txt

echo "=== ⚙️ Injecting Model Engine Keys ==="
${keyExports}

echo "=== 🏃 Executing SRE Agent Workspace ==="
${runCmd}
`;
      compiledCode.run = code;
    }

    function compileReadme() {
      const task = $('agent_task').value;
      const arch = $('agent_arch').value;
      const mode = $('integration_mode').value;

      let code = `# Strands SRE Troubleshooting Agent

This workspace spins up an autonomous site reliability troubleshooting agent powered by the **Strands Agents SDK**.

## Setup instructions

1.  **Configure environment credentials**:
    Ensure your target model keys (OpenAI keys, AWS keys, or Ollama hosts) are set in your execution terminal.
2.  **Run bootstrap loader**:
    \`\`\`bash
    chmod +x run.sh
    ./run.sh
    \`\`\`

## Architecture & Workflow Details
- **Architecture**: \`${arch.toUpperCase()}\`
- **Target incident**: \`${task.toUpperCase()}\`
- **Integration**: \`${mode.toUpperCase()}\`

### Agentic Loop Cycle:
1.  **Read input alarm**: The agent parses the target logs or resource alarm.
2.  **Tool Reasoning**: Evaluates whether tool invocations (like \`check_kubernetes_pod_logs\`) are required to locate the error.
3.  **Command Execution**: Invokes custom system commands securely.
4.  **Triage / Delegation**: (Swarm mode) Triage agent communicates the error diagnostics to the Resolver agent.
5.  **Self-Healing Actions**: Executes remediations (e.g. restarting workloads, cleanups) to resolve the outage.
`;
      compiledCode.readme = code;
    }

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Outage[🚨 Production Outage] -->|Trigger| Swarm[🤖 Strands SRE Swarm]\n  Swarm -->|Analyze Logs| Triage[🔍 Triage Agent]\n  Triage -->|Command Execution| Solver[🛠️ Solver Agent]\n  Solver -->|kubectl fix| Cluster[☸️ Kubernetes Target]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const config = tabConfigs[tabId];
      $('download-name-input').value = config.filename;
      $('file-extension-tag').textContent = config.ext;

      updateViewportContent();
    }

    function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    try {
      mermaid.run({
        nodes: [container.querySelector('.mermaid')]
      });
    } catch (e) {
      console.error("Mermaid render error:", e);
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

    function copyActiveTabContent() {
      if (simulationRunning) return;
      const content = compiledCode[activeTab];
      if (!content) {
        showToast("⚠️ Active tab is empty!");
        return;
      }
      
      navigator.clipboard.writeText(content).then(() => {
        showToast("📋 Copied to clipboard!");
      }).catch(err => {
        showToast("❌ Failed to copy to clipboard.");
      });
    }

    function clearAllFields() {
      if (simulationRunning) return;
      compiledCode[activeTab] = '';
      updateViewportContent();
      showToast("🗑️ Viewport cleared.");
    }

    function downloadWorkspaceZip() {
      if (simulationRunning) return;
      const zip = new JSZip();
      zip.file("README.md", compiledCode.readme);
      zip.file("agent.py", compiledCode.agent);
      zip.file("run.sh", compiledCode.run);

      // requirements.txt
      let reqs = "strands-agents>=0.2.0\n";
      const model = $('agent_model').value;
      if (model === 'openai') reqs += "openai\n";
      if (model === 'bedrock') reqs += "boto3\n";
      const mode = $('integration_mode').value;
      if (mode === 'mcp') reqs += "fastapi\nuvicorn\nmcp\n";
      if (mode === 'telemetry') reqs += "opentelemetry-api\nopentelemetry-sdk\n";
      zip.file("requirements.txt", reqs);

      if ($('agent_arch').value === 'swarm') {
        zip.file("swarm_orchestrator.py", compiledCode.swarm);
      }

      zip.generateAsync({ type: "blob" }).then(function (content) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "strands-agent-project.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("⬇️ Strands Agent Workspace zip downloaded!");
      });
    }

    function explainActiveTabCode() {
      if (simulationRunning) return;
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      $('drawer-title').textContent = explanation.title;
      $('drawer-filename').textContent = explanation.filename;
      $('explain-why').innerHTML = explanation.why;
      $('explain-when').innerHTML = explanation.when;
      $('explain-where').innerHTML = explanation.where;
      $('explain-command').textContent = explanation.command;

      const practicesBox = $('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';
      $('explain-flow').textContent = explanation.flow;

      const drawer = $('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = $('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

    // Terminal Simulator Logic
    function simulateAgentRun() {
      if (simulationRunning) return;
      simulationRunning = true;

      const viewport = $('output-box');
      viewport.classList.add('terminal-mode');
      viewport.innerHTML = '';

      const task = $('agent_task').value;
      const arch = $('agent_arch').value;
      const mode = $('integration_mode').value;

      let logSteps = [];

      // Build simulated logs based on configs
      if (arch === 'swarm') {
        logSteps.push({ type: 'thought', text: "Swarm initialized with agents [TriageAgent, ResolverAgent]. Entrypoint: TriageAgent" });
      } else {
        logSteps.push({ type: 'thought', text: "Agent initialized with SRE tools list. Beginning diagnostics loop..." });
      }

      if (mode === 'telemetry') {
        logSteps.push({ type: 'stdout', text: "Exporter: Exposing OpenTelemetry metrics tracing endpoints on port 4317." });
      }
      if (mode === 'mcp') {
        logSteps.push({ type: 'stdout', text: "MCP Server: Initialized stdin/stdout communication transport channel." });
      }

      if (task === 'k8s') {
        logSteps.push({ type: 'cmd', text: "User Anomaly Answering Query: 'Check liveness and inspect payment-api crashes.'" });
        logSteps.push({ type: 'thought', text: "TriageAgent thinking: I need to check Kubernetes container logs. Invoking 'check_kubernetes_pod_logs'..." });
        logSteps.push({ type: 'stdout', text: "Executing: kubectl logs payment-api-8c74bd97-2n9lw -n default --tail=100" });
        logSteps.push({ type: 'error', text: "Container Log Output:\n  2026-06-04 10:42:01 ERROR: Database connection failed (timeout on postgres-db:5432)\n  2026-06-04 10:42:05 FATAL: payment-api terminated with code 1. Restarting..." });
        
        if (arch === 'swarm') {
          logSteps.push({ type: 'thought', text: "TriageAgent thinking: Diagnosed CrashLoopBackOff due to postgres-db timeout. Handing off to ResolverAgent for socket remediation..." });
          logSteps.push({ type: 'thought', text: "ResolverAgent thinking: Database port is unreachable. Checking networking rules and triggering service restarts..." });
        } else {
          logSteps.push({ type: 'thought', text: "Agent thinking: Diagnosed CrashLoopBackOff due to postgres-db timeout. Checking networking configurations..." });
        }
        
        logSteps.push({ type: 'stdout', text: "Executing: kubectl describe networkpolicy db-policy -n default" });
        logSteps.push({ type: 'error', text: "NetworkPolicy db-policy ingress: Deny-All (port 5432 is blocked)" });
        logSteps.push({ type: 'thought', text: "SRE thinking: Port 5432 is blocked by db-policy. Applying remediating manifests..." });
        logSteps.push({ type: 'stdout', text: "Executing: kubectl apply -f remediate_policy.yaml" });
        logSteps.push({ type: 'stdout', text: "Remediation applied success: networkpolicy.networking.k8s.io/db-policy configured." });
        logSteps.push({ type: 'thought', text: "SRE thinking: Network policies fixed. Verifying liveness health checks..." });
        logSteps.push({ type: 'stdout', text: "Executing: kubectl get pods payment-api-8c74bd97-2n9lw" });
        logSteps.push({ type: 'stdout', text: "payment-api-8c74bd97-2n9lw   1/1   Running   0   12s" });
        logSteps.push({ type: 'stdout', text: "Final SRE Resolution: Incident resolved successfully! Network policy ingress rules corrected, pod restarted, status is healthy (1/1 Running)." });
      } 
      else if (task === 'disk') {
        logSteps.push({ type: 'cmd', text: "User Anomaly Answering Query: 'Disk space warning on node worker-03.'" });
        logSteps.push({ type: 'thought', text: "TriageAgent thinking: I must inspect total disk metrics first. Invoking 'execute_system_diagnostics'..." });
        logSteps.push({ type: 'stdout', text: "Executing: df -h /" });
        logSteps.push({ type: 'error', text: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        100G   96G  4.0G  96% /" });
        logSteps.push({ type: 'thought', text: "TriageAgent thinking: Anomaly confirmed. Disk space is at critical 96%. Locating large log directories and cache spaces..." });
        
        if (arch === 'swarm') {
          logSteps.push({ type: 'thought', text: "TriageAgent thinking: Outage verified. delegating disk pruning cleanups to ResolverAgent..." });
          logSteps.push({ type: 'thought', text: "ResolverAgent thinking: Starting cleanups. Invoking 'execute_remediation_action' to prune docker cache objects..." });
        } else {
          logSteps.push({ type: 'thought', text: "Agent thinking: Outage verified. Running container system prune..." });
        }
        
        logSteps.push({ type: 'stdout', text: "Executing: docker system prune -af" });
        logSteps.push({ type: 'stdout', text: "Deleted Containers: 12\nDeleted Images: 45\nDeleted Caches: 24GB\nRemediation success: Total 28.5GB space reclaimed." });
        logSteps.push({ type: 'thought', text: "SRE thinking: Space cleaned. Verifying final disk boundaries..." });
        logSteps.push({ type: 'stdout', text: "Executing: df -h /" });
        logSteps.push({ type: 'stdout', text: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        100G   67.5G  32.5G  68% /" });
        logSteps.push({ type: 'stdout', text: "Final SRE Resolution: Incident resolved automatically! Pruned unused container resources and reclaimed 28.5GB. Usage is stable at 68%." });
      } 
      else {
        logSteps.push({ type: 'cmd', text: "User Anomaly Answering Query: 'Inspect CPU/Memory overload alert on host server.'" });
        logSteps.push({ type: 'thought', text: "TriageAgent thinking: I will fetch memory stats metrics first. Invoking 'execute_system_diagnostics'..." });
        logSteps.push({ type: 'stdout', text: "Executing: free -m" });
        logSteps.push({ type: 'error', text: "              total        used        free      shared  buff/cache   available\nMem:          16000       15320         210           4         470         320\nSwap:          4096        3800         296" });
        logSteps.push({ type: 'thought', text: "TriageAgent thinking: Memory capacity is critically low. Inspecting active process hierarchies to locate resource leaks..." });
        logSteps.push({ type: 'stdout', text: "Executing: ps aux --sort=-%mem | head -n 5" });
        logSteps.push({ type: 'error', text: "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot     24102 98.2 82.5 892012 1320480 ?      Sl   10:12   2:14 java -jar payment-app.jar\nroot     24211  0.2  1.1  45012  17600 ?        S    10:14   0:00 python3 daemon.py" });
        
        if (arch === 'swarm') {
          logSteps.push({ type: 'thought', text: "TriageAgent thinking: Java process (PID 24102) is consuming 82.5% of host memory. Delegating service restart to ResolverAgent..." });
          logSteps.push({ type: 'thought', text: "ResolverAgent thinking: Restarting the system service to recover host memory..." });
        } else {
          logSteps.push({ type: 'thought', text: "Agent thinking: Java process (PID 24102) is consuming 82.5% of memory. Restarting the system service..." });
        }
        
        logSteps.push({ type: 'stdout', text: "Executing: systemctl restart payment-app" });
        logSteps.push({ type: 'stdout', text: "Remediation success: payment-app service restarted successfully." });
        logSteps.push({ type: 'thought', text: "SRE thinking: Service restarted. Auditing memory margins..." });
        logSteps.push({ type: 'stdout', text: "Executing: free -m" });
        logSteps.push({ type: 'stdout', text: "              total        used        free      shared  buff/cache   available\nMem:          16000        3450       12080           4         470       12120" });
        logSteps.push({ type: 'stdout', text: "Final SRE Resolution: Incident resolved! Memory leak cleared. payment-app service restarted, reducing RAM usage back to 3.4GB (12GB available)." });
      }

      // Print step-by-step terminal simulator logs
      let stepIndex = 0;
      function printNextLog() {
        if (stepIndex >= logSteps.length) {
          simulationRunning = false;
          showToast("✅ Simulation execution complete!");
          // Add a reset button
          const btn = document.createElement('button');
          btn.className = "mt-4 px-3 py-1 bg-violet-600 hover:bg-violet-750 text-white font-mono text-[10px] rounded cursor-pointer";
          btn.textContent = "Exit Terminal Simulator";
          btn.onclick = () => {
            viewport.classList.remove('terminal-mode');
            simulationRunning = false;
            updateViewportContent();
          };
          viewport.appendChild(document.createElement('br'));
          viewport.appendChild(btn);
          return;
        }

        const step = logSteps[stepIndex];
        const span = document.createElement('span');
        
        if (step.type === 'thought') {
          span.className = 'term-thought';
          span.textContent = `[Thought] ${step.text}\n`;
        } else if (step.type === 'error') {
          span.className = 'term-error';
          span.textContent = `${step.text}\n`;
        } else if (step.type === 'cmd') {
          span.className = 'term-cmd';
          span.textContent = `$ ${step.text}\n`;
        } else {
          span.className = 'term-stdout';
          span.textContent = `${step.text}\n`;
        }

        viewport.appendChild(span);
        viewport.scrollTop = viewport.scrollHeight;
        stepIndex++;
        setTimeout(printNextLog, 1200 + Math.random() * 800);
      }

      printNextLog();
    }

    function showToast(message) {
      const wrapper = $('toast-wrapper');
      const content = $('toast-content');
      content.textContent = '';
      const icon = document.createElement('span');
      icon.textContent = '⚡ ';
      content.appendChild(icon);
      content.appendChild(document.createTextNode(message));
      
      wrapper.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
      wrapper.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        wrapper.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        wrapper.classList.remove('opacity-100', 'translate-y-0');
      }, 2500);
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadWorkspaceZip = downloadWorkspaceZip;
window.explainActiveTabCode = explainActiveTabCode;
window.simulateAgentRun = simulateAgentRun;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
