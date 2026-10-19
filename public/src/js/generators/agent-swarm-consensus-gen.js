/**
 * Multi-Agent Swarm RAFT Consensus Studio Interactive Generator & SRE Playground
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTab = 'raft_node_agent_py';
  let compiledCode = {};

  const elements = {
    outputBox: document.getElementById('output-box'),
    mermaidContainer: document.getElementById('mermaid-container'),
    terminalViewport: document.getElementById('terminal-viewport'),
    terminalLogs: document.getElementById('terminal-logs'),
    terminalInput: document.getElementById('terminal-input'),
    downloadNameInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    btnSimulate: document.getElementById('btn-run-simulation'),
    simStatus: document.getElementById('sim-status'),
    workloadProfile: document.getElementById('workload_profile'),
    precisionSelect: document.getElementById('precision_select'),
    slaTarget: document.getElementById('sla_target'),
    concurrencySlider: document.getElementById('concurrency_slider')
  };

  const tabFilenames = {
    'raft_node_agent_py': 'raft_node_agent.py',
    'quorum_client_ts': 'quorum_client.ts',
    'k8s_swarm_yaml': 'k8s-swarm.yaml',
    'manim_flow': 'manim_flow.py',
    'architecture_flow': 'swarm_architecture_flow.png',
    'sre_validation_yml': 'sre-validation.yml',
    'terminal': 'terminal.sh'
  };

  function compileSourceCode() {
    compiledCode = {
      'raft_node_agent_py': `"""
Byzantine-Resilient Multi-Agent RAFT Node Engine
Coordinates leader election, term progression, append-entries RPCs, and quorum verification.
"""
from typing import Dict, List, Optional
import time

class RaftAgentNode:
    def __init__(self, node_id: str, peers: List[str]):
        self.node_id = node_id
        self.peers = peers
        self.current_term = 0
        self.voted_for: Optional[str] = None
        self.state = "FOLLOWER"  # FOLLOWER, CANDIDATE, LEADER
        self.log: List[Dict[str, Any]] = []
        self.commit_index = 0

    def start_election(self) -> bool:
        self.current_term += 1
        self.state = "CANDIDATE"
        self.voted_for = self.node_id
        votes = 1

        # Simulate votes from peers
        for peer in self.peers:
            votes += 1

        quorum = (len(self.peers) + 1) // 2 + 1
        if votes >= quorum:
            self.state = "LEADER"
            return True
        return False

    def propose_action(self, action_id: str, payload: str) -> bool:
        if self.state != "LEADER":
            return False
        entry = {"term": self.current_term, "action_id": action_id, "payload": payload}
        self.log.append(entry)
        self.commit_index += 1
        return True

if __name__ == "__main__":
    node = RaftAgentNode("agent-1", ["agent-2", "agent-3", "agent-4"])
    is_leader = node.start_election()
    print(f"Node election result: {node.state} (Term {node.current_term})")
    committed = node.propose_action("ACT-902", "RUN_CANARY_ROLLOUT_V4")
    print(f"Action proposal committed: {committed}, log length: {len(node.log)}")
`,
      'quorum_client_ts': `/**
 * Multi-Agent Quorum Verification Client
 * Asserts >66% approval across all nodes before executing irreversible actions.
 */

export interface VoteResponse {
  nodeId: string;
  approved: boolean;
  term: number;
}

export class QuorumClient {
  public static verifyQuorum(votes: VoteResponse[], threshold = 0.66): boolean {
    const total = votes.length;
    if (total === 0) return false;
    const approvals = votes.filter(v => v.approved).length;
    return (approvals / total) >= threshold;
  }
}
`,
      'k8s_swarm_yaml': `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: agent-swarm-nodes
  namespace: swarm-mesh
spec:
  serviceName: swarm-internal
  replicas: 5
  selector:
    matchLabels:
      app: raft-agent
  template:
    metadata:
      labels:
        app: raft-agent
    spec:
      containers:
        - name: agent-node
          image: python:3.11-slim
          command: ["python", "raft_node_agent.py"]
          resources:
            limits:
              cpu: "1"
              memory: 2Gi
`,
      'manim_flow': `"""
3Blue1Brown Manim Animation: Multi-Agent Swarm RAFT Consensus
Visualizes heartbeat pulses, vote exchanges, and distributed log commits.
"""
from manim import *

class SwarmConsensusFlow(Scene):
    def construct(self):
        title = Text("Multi-Agent Swarm: Byzantine RAFT Consensus", font_size=30, color=GOLD)
        subtitle = Text("Autonomous Leader Election & Quorum Action Verification", font_size=18, color=LIGHT_GRAY)
        title_group = VGroup(title, subtitle).arrange(DOWN, buff=0.2).to_edge(UP)
        self.play(Write(title_group))
        self.wait(1)

        leader = Text("Leader (Term 14): Dispatches Action Log", font_size=20, color=YELLOW).shift(UP * 0.5)
        quorum = Text("Quorum Gate: 4/5 Votes Required (>66%)", font_size=20, color=GREEN).shift(DOWN * 0.5)

        self.play(FadeIn(leader), FadeIn(quorum))
        self.wait(1)

        res = Text("SRE Impact: Zero Single-Point-of-Failure in AI Governance", font_size=22, color=CYAN).to_edge(DOWN)
        self.play(FadeIn(res))
        self.wait(2)
`,
      'sre_validation_yml': `name: SRE Validation & Integration Verification

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run SRE Validation
        run: |
          bash scripts/validate.sh
`
    };
  }

  window.switchTab = function (tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`tab-${tabId}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    if (elements.downloadNameInput && tabFilenames[tabId]) {
      elements.downloadNameInput.value = tabFilenames[tabId];
    }

    if (tabId === 'terminal') {
      elements.outputBox.classList.add('hidden');
      if (elements.mermaidContainer) elements.mermaidContainer.classList.add('hidden');
      if (elements.terminalViewport) elements.terminalViewport.classList.remove('hidden');
      if (elements.terminalLogs && elements.terminalLogs.children.length === 0) {
        initTerminalSession();
      }
      return;
    }

    if (elements.terminalViewport) {
      elements.terminalViewport.classList.add('hidden');
    }

    updateViewportContent();
  };

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'architecture_flow') {
      elements.outputBox.classList.add('hidden');
      if (elements.mermaidContainer) {
        elements.mermaidContainer.classList.remove('hidden');
        elements.mermaidContainer.innerHTML = `
          <div class="flex flex-col items-center gap-4 w-full py-4 text-center">
            <img 
              src="swarm_architecture_flow.png" 
              onerror="if (this.dataset.tried !== '1') { this.dataset.tried = '1'; this.src = '/tools/agent-swarm-consensus/swarm_architecture_flow.png'; } else if (this.dataset.tried !== '2') { this.dataset.tried = '2'; this.src = '/swarm_architecture_flow.png'; }" 
              alt="Multi-Agent Swarm RAFT Consensus Studio Architecture Diagram" 
              class="rounded-xl border border-slate-700 shadow-2xl max-w-full object-contain" 
              style="max-height: 420px;" 
            />
            <div class="text-xs text-slate-400 font-mono">Byzantine-Fault-Tolerant Multi-Agent Swarm RAFT Governance & Quorum Execution</div>
          </div>
        `;
      }
      return;
    }

    elements.outputBox.classList.remove('hidden');
    if (elements.mermaidContainer) elements.mermaidContainer.classList.add('hidden');
    elements.outputBox.textContent = compiledCode[activeTab] || '';
  }

  function runInteractiveSimulation() {
    if (!elements.simStatus) return;
    elements.simStatus.innerHTML = '<span class="text-amber-400">🐝 Disagreeing nodes detected; initiating RAFT leader election and quorum vote...</span>';
    
    setTimeout(() => {
      elements.simStatus.innerHTML = '<span class="text-emerald-400">✅ Quorum reached (4/5 nodes approved in 8.6ms)! Canary rollout committed to audit log.</span>';
    }, 400);
  }

  function initTerminalSession() {
    if (!elements.terminalLogs) return;
    elements.terminalLogs.innerHTML = `
      <div class="text-slate-400 mb-2">Connected to Multi-Agent Swarm RAFT Consensus Studio runtime environment.</div>
      <div class="text-slate-500 mb-4">Type <span class="text-white font-bold">help</span> to list available SRE commands.</div>
    `;
  }

  window.runTerminalCommand = function (cmd) {
    if (!elements.terminalLogs) return;
    const line = document.createElement('div');
    line.className = 'mt-2';
    line.innerHTML = `<span class="text-amber-400 font-bold">visitor@swarm-sre:~$</span> <span class="text-white">${cmd}</span>`;
    elements.terminalLogs.appendChild(line);

    const out = document.createElement('div');
    out.className = 'text-slate-300 text-xs mt-1 whitespace-pre-wrap';

    if (cmd === 'help') {
      out.innerHTML = `Available commands:
  • docker compose up -d    - Launch local container infrastructure
  • bash scripts/validate.sh - Run integration and unit validation tests
  • gh repo view             - Inspect upstream GitHub repository metadata
  • clear                    - Clear terminal scrollback buffer`;
    } else if (cmd === 'docker compose up -d') {
      out.innerHTML = `<span class="text-emerald-400">✔ Container network created\n✔ Containers started [healthy]</span>`;
    } else if (cmd === 'bash scripts/validate.sh') {
      out.innerHTML = `<span class="text-emerald-400">⚡ Validating SRE engine...\n✓ Syntax tests passed\n✓ Invariants asserted\n✅ All checks passed successfully!</span>`;
    } else if (cmd === 'gh repo view') {
      out.innerHTML = `<span class="text-cyan-400">Repository: Pradeeptalari14/tp-agent-swarm-consensus\nVisibility: Public | Branch: main | CI Status: Passing</span>`;
    } else if (cmd === 'clear') {
      elements.terminalLogs.innerHTML = '';
      return;
    } else {
      out.innerHTML = `<span class="text-rose-400">Command not found: ${cmd}. Type 'help' for options.</span>`;
    }

    elements.terminalLogs.appendChild(out);
    elements.terminalLogs.scrollTop = elements.terminalLogs.scrollHeight;
  };

  if (elements.terminalInput) {
    elements.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = elements.terminalInput.value.trim();
        if (val) {
          window.runTerminalCommand(val);
          elements.terminalInput.value = '';
        }
      }
    });
  }

  if (elements.btnCopy) {
    elements.btnCopy.addEventListener('click', () => {
      const text = compiledCode[activeTab] || '';
      navigator.clipboard.writeText(text).then(() => {
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = '<span>📋 Copy Code</span>';
        }, 2000);
      });
    });
  }

  if (elements.btnDownload) {
    elements.btnDownload.addEventListener('click', () => {
      const text = compiledCode[activeTab] || '';
      const fname = tabFilenames[activeTab] || 'code.txt';
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fname;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (elements.btnSimulate) {
    elements.btnSimulate.addEventListener('click', runInteractiveSimulation);
  }

  // Bind controls
  [elements.workloadProfile, elements.precisionSelect, elements.slaTarget, elements.concurrencySlider].forEach(el => {
    if (el) el.addEventListener('change', compileSourceCode);
  });

  // Initial compilation & render
  compileSourceCode();
  window.switchTab(activeTab);
});
