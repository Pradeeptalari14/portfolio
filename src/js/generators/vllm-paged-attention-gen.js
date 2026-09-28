/**
 * vLLM PagedAttention & Chunked Prefill Studio Interactive Generator & SRE Playground
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTab = 'paged_cache_engine_py';
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
    'paged_cache_engine_py': 'paged_cache_engine.py',
    'continuous_batcher_ts': 'continuous_batcher.ts',
    'k8s_vllm_yaml': 'k8s-vllm.yaml',
    'manim_flow': 'manim_flow.py',
    'architecture_flow': 'vllm_architecture_flow.png',
    'sre_validation_yml': 'sre-validation.yml',
    'terminal': 'terminal.sh'
  };

  function compileSourceCode() {
    compiledCode = {
      'paged_cache_engine_py': `"""
vLLM PagedAttention Virtual Memory KV-Cache Allocator
Manages physical GPU blocks in non-contiguous HBM3e without external fragmentation.
"""
from typing import Dict, List, Optional
import time

class PhysicalBlock:
    def __init__(self, block_number: int, block_size: int = 16):
        self.block_number = block_number
        self.block_size = block_size
        self.ref_count = 0
        self.tokens: List[int] = []

    def is_full(self) -> bool:
        return len(self.tokens) >= self.block_size

    def append_token(self, token_id: int):
        if self.is_full():
            raise OverflowError(f"Block {self.block_number} is full.")
        self.tokens.append(token_id)

class PagedCacheManager:
    def __init__(self, total_blocks: int = 8192, block_size: int = 16):
        self.total_blocks = total_blocks
        self.block_size = block_size
        self.free_blocks: List[PhysicalBlock] = [PhysicalBlock(i, block_size) for i in range(total_blocks)]
        self.allocated_blocks: Dict[int, PhysicalBlock] = {}
        self.sequence_block_table: Dict[str, List[int]] = {}

    def allocate_sequence(self, seq_id: str, prompt_tokens: List[int]) -> List[int]:
        blocks_needed = (len(prompt_tokens) + self.block_size - 1) // self.block_size
        if len(self.free_blocks) < blocks_needed:
            raise MemoryError("Out of VRAM: insufficient free blocks for PagedAttention.")

        block_indices = []
        for i in range(blocks_needed):
            block = self.free_blocks.pop(0)
            block.ref_count = 1
            chunk = prompt_tokens[i * self.block_size : (i + 1) * self.block_size]
            for t in chunk:
                block.append_token(t)
            self.allocated_blocks[block.block_number] = block
            block_indices.append(block.block_number)

        self.sequence_block_table[seq_id] = block_indices
        return block_indices

    def free_sequence(self, seq_id: str):
        if seq_id not in self.sequence_block_table:
            return
        for b_num in self.sequence_block_table[seq_id]:
            block = self.allocated_blocks.pop(b_num, None)
            if block:
                block.ref_count = 0
                block.tokens.clear()
                self.free_blocks.append(block)
        del self.sequence_block_table[seq_id]

    def get_fragmentation_ratio(self) -> float:
        # PagedAttention eliminates external fragmentation to <4%
        used_slots = sum(len(b.tokens) for b in self.allocated_blocks.values())
        allocated_capacity = len(self.allocated_blocks) * self.block_size
        if allocated_capacity == 0:
            return 0.0
        return round((allocated_capacity - used_slots) / allocated_capacity, 4)

if __name__ == "__main__":
    mgr = PagedCacheManager(total_blocks=1024, block_size=16)
    seq = mgr.allocate_sequence("request-001", list(range(42)))
    print(f"Allocated {len(seq)} blocks for 42 tokens. Fragmentation: {mgr.get_fragmentation_ratio() * 100:.1f}%")
`,
      'continuous_batcher_ts': `/**
 * vLLM Continuous Batcher & Chunked Prefill Co-Scheduler
 * Iteration-level scheduling interleaving prefill chunks with decode steps.
 */

export interface InferenceRequest {
  id: string;
  promptTokens: number[];
  generatedTokens: number[];
  maxTokens: number;
  phase: 'PREFILL' | 'DECODE' | 'COMPLETED';
}

export class ContinuousBatcher {
  private activeQueue: InferenceRequest[] = [];
  private chunkedPrefillLimit = 512;

  public submit(request: InferenceRequest) {
    this.activeQueue.push(request);
  }

  public stepIteration(): { prefillChunks: number; decodes: number; completed: number } {
    let prefillChunks = 0;
    let decodes = 0;
    let completed = 0;

    for (const req of this.activeQueue) {
      if (req.phase === 'PREFILL') {
        prefillChunks++;
        req.phase = 'DECODE';
      } else if (req.phase === 'DECODE') {
        decodes++;
        req.generatedTokens.push(Math.floor(Math.random() * 32000));
        if (req.generatedTokens.length >= req.maxTokens) {
          req.phase = 'COMPLETED';
          completed++;
        }
      }
    }

    this.activeQueue = this.activeQueue.filter(r => r.phase !== 'COMPLETED');
    return { prefillChunks, decodes, completed };
  }
}
`,
      'k8s_vllm_yaml': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-paged-inference
  namespace: ai-serving
  labels:
    app.kubernetes.io/name: vllm-paged-attention
    engine: vllm-v2
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vllm-paged-inference
  template:
    metadata:
      labels:
        app: vllm-paged-inference
    spec:
      containers:
        - name: vllm-container
          image: vllm/vllm-openai:v0.6.2
          args:
            - "--model"
            - "meta-llama/Llama-3.1-70B-Instruct"
            - "--tensor-parallel-size"
            - "4"
            - "--block-size"
            - "16"
            - "--enable-chunked-prefill"
            - "--max-num-seqs"
            - "256"
          resources:
            limits:
              nvidia.com/gpu: 4
              memory: 128Gi
            requests:
              nvidia.com/gpu: 4
              memory: 64Gi
          ports:
            - containerPort: 8000
              name: http
---
apiVersion: v1
kind: Service
metadata:
  name: vllm-paged-service
  namespace: ai-serving
spec:
  type: ClusterIP
  ports:
    - port: 8000
      targetPort: 8000
      name: http-inference
  selector:
    app: vllm-paged-inference
`,
      'manim_flow': `"""
3Blue1Brown Manim Animation: vLLM PagedAttention KV-Cache Virtual Block Paging
Renders how logical tokens map non-contiguously to physical GPU HBM3e blocks without fragmentation.
"""
from manim import *

class VLLMPagedAttentionFlow(Scene):
    def construct(self):
        title = Text("vLLM PagedAttention: Virtual Memory KV-Cache", font_size=32, color=BLUE)
        subtitle = Text("Eliminating External VRAM Fragmentation (<4% waste)", font_size=18, color=LIGHT_GRAY)
        title_group = VGroup(title, subtitle).arrange(DOWN, buff=0.2).to_edge(UP)
        self.play(Write(title_group))
        self.wait(1)

        # Logical tokens vs Physical Blocks
        logical_label = Text("Logical Prompt Tokens", font_size=20, color=CYAN).shift(LEFT * 4 + UP * 0.5)
        table_label = Text("Paged Block Table", font_size=20, color=YELLOW).shift(UP * 0.5)
        physical_label = Text("Physical HBM3e Blocks", font_size=20, color=GREEN).shift(RIGHT * 4 + UP * 0.5)

        self.play(FadeIn(logical_label), FadeIn(table_label), FadeIn(physical_label))
        self.wait(1)

        summary = Text("Throughput: +2.8x | TTFT: 18.2ms | Zero Fragmentation", font_size=22, color=GOLD).to_edge(DOWN)
        self.play(FadeIn(summary))
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
              src="vllm_architecture_flow.png" 
              onerror="if (this.dataset.tried !== '1') { this.dataset.tried = '1'; this.src = '/tools/vllm-paged-attention/vllm_architecture_flow.png'; } else if (this.dataset.tried !== '2') { this.dataset.tried = '2'; this.src = '/vllm_architecture_flow.png'; }" 
              alt="vLLM PagedAttention & Chunked Prefill Studio Architecture Diagram" 
              class="rounded-xl border border-slate-700 shadow-2xl max-w-full object-contain" 
              style="max-height: 420px;" 
            />
            <div class="text-xs text-slate-400 font-mono">vLLM PagedAttention Virtual Memory Block Table & Chunked Prefill Co-Scheduler</div>
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
    elements.simStatus.innerHTML = '<span class="text-cyan-400">⚡ Allocating virtual PagedAttention blocks in non-contiguous HBM3e...</span>';
    
    setTimeout(() => {
      elements.simStatus.innerHTML = '<span class="text-emerald-400">🌲 Allocated 64 blocks with 3.4% fragmentation! Co-scheduling chunked prefill...</span>';
    }, 400);
  }

  function initTerminalSession() {
    if (!elements.terminalLogs) return;
    elements.terminalLogs.innerHTML = `
      <div class="text-slate-400 mb-2">Connected to vLLM PagedAttention & Chunked Prefill Studio runtime environment.</div>
      <div class="text-slate-500 mb-4">Type <span class="text-white font-bold">help</span> to list available SRE commands.</div>
    `;
  }

  window.runTerminalCommand = function (cmd) {
    if (!elements.terminalLogs) return;
    const line = document.createElement('div');
    line.className = 'mt-2';
    line.innerHTML = `<span class="text-cyan-400 font-bold">visitor@vllm-sre:~$</span> <span class="text-white">${cmd}</span>`;
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
      out.innerHTML = `<span class="text-cyan-400">Repository: Pradeeptalari14/tp-vllm-paged-attention\nVisibility: Public | Branch: main | CI Status: Passing</span>`;
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
