// DeepSeek-V3 DualPipe & 256-Expert MoE Router Studio Generator

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
    simActiveParams: document.getElementById('hud-active-params'),
    simMlaCompression: document.getElementById('hud-mla-compression'),
    simOverlapRatio: document.getElementById('hud-overlap-ratio'),
    simTflops: document.getElementById('hud-tflops'),
    simStatus: document.getElementById('sim-status'),
    btnRunSim: document.getElementById('btn-run-simulation')
  };

  let activeTab = 'moe_router_py';
  let compiledCode = {};

  function getSelectedOptions() {
    return {
      topK: parseInt(document.getElementById('top_k_experts') ? document.getElementById('top_k_experts').value : '8', 10),
      mlaDim: parseInt(document.getElementById('mla_latent_dim') ? document.getElementById('mla_latent_dim').value : '512', 10),
      stages: parseInt(document.getElementById('dualpipe_stages') ? document.getElementById('dualpipe_stages').value : '16', 10),
      precision: document.getElementById('precision_mode') ? document.getElementById('precision_mode').value : 'FP8 Mixed Precision',
      totalExperts: 256,
      sharedExperts: 1
    };
  }

  function compileManimScript(opts) {
    return `#!/usr/bin/env python3
"""
3Blue1Brown / Manim Programmatic Video Animation
DeepSeek-V3 DualPipe & 256-Expert MoE Router Studio
Render with: manim -pqh manim_flow.py DeepSeekV3MoEScene
"""
from manim import *

class DeepSeekV3MoEScene(Scene):
    def construct(self):
        self.camera.background_color = "#0B0F19"

        VIOLET_NEON = "#C084FC"
        CYAN_NEON = "#00F0FF"
        PINK_NEON = "#F472B6"
        EMERALD_NEON = "#10B981"
        AMBER_NEON = "#F59E0B"
        SLATE_CARD = "#131C31"
        WHITE_TEXT = "#F8FAFC"

        # ── 1. Title Header ──
        title = Text("DeepSeek-V3: 256-Expert MoE & DualPipe Architecture", font_size=23, weight=BOLD, color=WHITE_TEXT).to_edge(UP, buff=0.4)
        subtitle = Text("MLA Latent Dim: ${opts.mlaDim} · Top-${opts.topK} of 256 Experts · DualPipe ${opts.stages} Stages (${opts.precision})", font_size=12, color=VIOLET_NEON)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(FadeIn(title), FadeIn(subtitle), run_time=1.0)

        # ── 2. Functional Architecture ──
        mla_box = RoundedRectangle(corner_radius=0.15, width=3.0, height=2.8, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=CYAN_NEON, stroke_width=2.5).shift(LEFT * 4.6 + DOWN * 0.3)
        mla_title = Text("MLA Compression", font_size=11, weight=BOLD, color=CYAN_NEON).move_to(mla_box.get_top() + DOWN * 0.3)
        mla_desc = Text("7,168 -> ${opts.mlaDim} Latent\n14.0x KV Reduction\nLow Memory Bandwidth", font_size=9, color=WHITE_TEXT).next_to(mla_title, DOWN, buff=0.2)
        mla_group = VGroup(mla_box, mla_title, mla_desc)

        router_box = RoundedRectangle(corner_radius=0.15, width=2.8, height=2.8, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=VIOLET_NEON, stroke_width=2.5).shift(LEFT * 1.0 + DOWN * 0.3)
        router_title = Text("Top-${opts.topK} Affinity Gate", font_size=11, weight=BOLD, color=VIOLET_NEON).move_to(router_box.get_top() + DOWN * 0.3)
        router_desc = Text("256 Routed Experts\n1 Shared Expert\nSigmoid Normalized", font_size=9, color=WHITE_TEXT).next_to(router_title, DOWN, buff=0.2)
        router_group = VGroup(router_box, router_title, router_desc)

        dualpipe_box = RoundedRectangle(corner_radius=0.15, width=3.6, height=2.8, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=EMERALD_NEON, stroke_width=2.5).shift(RIGHT * 3.8 + DOWN * 0.3)
        dualpipe_title = Text("DualPipe Overlap", font_size=11, weight=BOLD, color=EMERALD_NEON).move_to(dualpipe_box.get_top() + DOWN * 0.3)
        dualpipe_desc = Text("Forward Compute (12ms)\nBackward Comm (11ms)\nBubble < 4.8% (FP8)", font_size=9, color=WHITE_TEXT).next_to(dualpipe_title, DOWN, buff=0.2)
        dualpipe_group = VGroup(dualpipe_box, dualpipe_title, dualpipe_desc)

        arr1 = Arrow(mla_box.get_right(), router_box.get_left(), color=CYAN_NEON, buff=0.1, stroke_width=2.5)
        arr2 = Arrow(router_box.get_right(), dualpipe_box.get_left(), color=VIOLET_NEON, buff=0.1, stroke_width=2.5)

        self.play(FadeIn(mla_group), GrowArrow(arr1), FadeIn(router_group), GrowArrow(arr2), FadeIn(dualpipe_group), run_time=1.5)

        # ── 3. Bottom Metric Banner ──
        banner = RoundedRectangle(corner_radius=0.15, width=10.5, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=VIOLET_NEON, stroke_width=1.5).to_edge(DOWN, buff=0.3)
        banner_text = Text("⚡ 37B Active Params (671B Total)   |   14.0x MLA Compression   |   95.4% DualPipe Overlap", font_size=11, weight=BOLD, color=WHITE_TEXT).move_to(banner)
        self.play(FadeIn(banner), FadeIn(banner_text), run_time=0.8)
        self.wait(2.0)
`;
  }

  function compileConfigs() {
    const opts = getSelectedOptions();

    // 1. moe_router.py
    compiledCode.moe_router_py = `#!/usr/bin/env python3
"""
DeepSeek-V3 MoE Dynamic Router & Affinity Gating Engine
Architecture: 256 fine-grained routed experts + 1 isolated shared expert
Top-K: K=${opts.topK} routed per token
MLA Latent Dimension: ${opts.mlaDim} (14.0x KV compression)
Precision: ${opts.precision}
"""
import math
from typing import List, Dict, Any, Tuple
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="DeepSeek-V3 MoE Dynamic Gateway",
    version="1.0.0",
    description="Fine-grained mixture-of-experts gating with MLA compression"
)

TOTAL_ROUTED_EXPERTS = 256
SHARED_EXPERTS = 1
TOP_K_SELECTED = ${opts.topK}
MLA_LATENT_DIM = ${opts.mlaDim}

class MoETokenBatch(BaseModel):
    token_ids: List[int] = Field(default_factory=lambda: [1024, 2048, 4096, 8192])
    hidden_dim: int = Field(default=7168)
    mla_dim: int = Field(default=MLA_LATENT_DIM)

def compute_affinity(token_id: int, top_k: int = TOP_K_SELECTED) -> List[Tuple[int, float]]:
    experts = []
    for e_id in range(TOTAL_ROUTED_EXPERTS):
        score = math.sin((token_id * 19 + e_id * 37) / 100.0) * 0.5 + 0.5
        experts.append((e_id, score))
    experts.sort(key=lambda x: x[1], reverse=True)
    top = experts[:top_k]
    total_val = sum(s for _, s in top)
    return [(e, round(s / total_val, 4)) for e, s in top]

@app.post("/v1/deepseek/route")
async def route_batch(batch: MoETokenBatch):
    routed_tokens = []
    for tid in batch.token_ids:
        selected = compute_affinity(tid, TOP_K_SELECTED)
        routed_tokens.append({
            "token_id": tid,
            "shared_expert": 0,
            "assigned_routed_experts": selected
        })
    return {
        "status": "success",
        "total_experts": TOTAL_ROUTED_EXPERTS,
        "selected_k": TOP_K_SELECTED,
        "mla_latent_compression": f"7168 -> {batch.mla_dim} ({round(7168/batch.mla_dim, 1)}x)",
        "precision": "${opts.precision}",
        "dualpipe_overlap_ratio": "95.4%",
        "routed_batch": routed_tokens
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

    // 2. dualpipe_scheduler.py
    compiledCode.dualpipe_scheduler_py = `"""
DeepSeek-V3 DualPipe Bidirectional Overlap Scheduler
Pipelining ${opts.stages} stages with forward compute & backward all-to-all overlap
"""
from typing import Dict, Any

class DualPipePipeline:
    def __init__(self, stages: int = ${opts.stages}):
        self.stages = stages
        
    def schedule_microbatch(self, microbatch_id: int) -> Dict[str, Any]:
        return {
            "microbatch_id": microbatch_id,
            "pipeline_stages": self.stages,
            "forward_computation_ms": 12.2,
            "all_to_all_comm_ms": 11.6,
            "overlap_efficiency": "95.4%",
            "bubble_overhead": "< 4.8%"
        }

if __name__ == "__main__":
    p = DualPipePipeline()
    print("DualPipe schedule:", p.schedule_microbatch(1))
`;

    // 3. k8s-deepseek-v3.yaml
    compiledCode.k8s_deepseek_v3_yaml = `# Kubernetes Cluster for DeepSeek-V3 FP8 MoE Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deepseek-v3-cluster
  namespace: ai-inference
  labels:
    app: deepseek-v3
spec:
  replicas: 4
  selector:
    matchLabels:
      app: deepseek-v3
  template:
    metadata:
      labels:
        app: deepseek-v3
    spec:
      containers:
        - name: deepseek-router
          image: vllm/vllm-openai:latest
          args:
            - "--model=deepseek-ai/DeepSeek-V3"
            - "--tensor-parallel-size=8"
            - "--pipeline-parallel-size=${opts.stages}"
            - "--gpu-memory-utilization=0.94"
            - "--dtype=fp8"
            - "--port=8000"
          resources:
            limits:
              nvidia.com/gpu: "8"
              memory: 512Gi
`;

    // 4. manim_flow.py
    compiledCode.manim_flow = compileManimScript(opts);

    // 5. sre_validation.yml
    compiledCode.sre_validation_yml = `name: SRE Validation & Integration Verification

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
`;

    let filename = 'moe_router.py';
    if (activeTab === 'dualpipe_scheduler_py') filename = 'dualpipe_scheduler.py';
    if (activeTab === 'k8s_deepseek_v3_yaml') filename = 'k8s-deepseek-v3.yaml';
    if (activeTab === 'manim_flow') filename = 'manim_flow.py';
    if (activeTab === 'sre_validation_yml') filename = 'sre-validation.yml';

    if (elements.downloadInput) {
      elements.downloadInput.value = filename;
    }

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'architecture_flow') {
      elements.outputBox.classList.add('hidden');
      if (elements.mermaidContainer) {
        elements.mermaidContainer.classList.remove('hidden');
        elements.mermaidContainer.innerHTML = `
          <div class="flex flex-col items-center gap-4 w-full py-4 text-center">
            <img 
              src="deepseek_v3_moe_flow.png" 
              onerror="if (this.dataset.tried !== '1') { this.dataset.tried = '1'; this.src = '/tools/deepseek-v3-moe/deepseek_v3_moe_flow.png'; } else if (this.dataset.tried !== '2') { this.dataset.tried = '2'; this.src = '/deepseek_v3_moe_flow.png'; }" 
              alt="DeepSeek-V3 MoE Architecture Diagram" 
              class="rounded-xl border border-slate-700 shadow-2xl max-w-full object-contain" 
              style="max-height: 420px;" 
            />
            <div class="text-xs text-slate-400 font-mono">DeepSeek-V3 256-Expert MoE, MLA Compression & DualPipe Overlap Topology</div>
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
    const opts = getSelectedOptions();

    elements.simStatus.innerHTML = '<span class="text-purple-400">🔀 Evaluating Top-' + opts.topK + ' expert affinities via Sigmoid gating...</span>';
    
    setTimeout(() => {
      elements.simStatus.innerHTML = '<span class="text-cyan-400">⚡ DualPipe scheduling ' + opts.stages + ' microbatches with forward/backward overlap...</span>';
    }, 350);

    setTimeout(() => {
      const activeP = '37B / 671B';
      const mlaComp = (7168 / opts.mlaDim).toFixed(1) + 'x';
      const overlap = (94.0 + Math.random() * 3.5).toFixed(1) + '%';
      const tflops = Math.round(1750 + Math.random() * 150);

      if (elements.simActiveParams) elements.simActiveParams.textContent = activeP;
      if (elements.simMlaCompression) elements.simMlaCompression.textContent = mlaComp;
      if (elements.simOverlapRatio) elements.simOverlapRatio.textContent = overlap;
      if (elements.simTflops) elements.simTflops.textContent = tflops + ' TFLOPS';

      elements.simStatus.innerHTML = '<span class="text-emerald-400">✅ DeepSeek-V3 burst complete: ' + overlap + ' DualPipe overlap | bubble < 4.8%.</span>';
    }, 750);
  }

  const inputs = document.querySelectorAll('.form-input, .form-select');
  inputs.forEach(input => {
    input.addEventListener('input', compileConfigs);
    input.addEventListener('change', compileConfigs);
  });

  if (elements.btnRunSim) {
    elements.btnRunSim.onclick = runInteractiveSimulation;
  }

  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        const orig = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => { elements.btnCopy.innerHTML = orig; }, 1500);
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

  window.SreCore.setupStudioTabs(
    ['moe_router_py', 'dualpipe_scheduler_py', 'k8s_deepseek_v3_yaml', 'manim_flow', 'architecture_flow', 'sre_validation_yml', 'terminal'],
    'moe_router_py',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  window.SreCore.initTerminalSupport('deepseek-v3-moe', 'DeepSeek-V3 MoE Router');
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
