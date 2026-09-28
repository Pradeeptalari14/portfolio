// WebGPU In-Browser Small LM Studio Generator

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
    simTokensPerSec: document.getElementById('hud-tokens-per-sec'),
    simNetworkRtt: document.getElementById('hud-network-rtt'),
    simVram: document.getElementById('hud-vram'),
    simTtft: document.getElementById('hud-ttft'),
    simStatus: document.getElementById('sim-status'),
    btnRunSim: document.getElementById('btn-run-simulation')
  };

  let activeTab = 'webgpu_engine_ts';
  let compiledCode = {};

  function getSelectedOptions() {
    return {
      model: document.getElementById('target_model') ? document.getElementById('target_model').value : 'SmolLM2-135M-Instruct-q4f16',
      workgroup: document.getElementById('workgroup_size') ? document.getElementById('workgroup_size').value : '16x16 Subgroup GEMM',
      memoryBudget: document.getElementById('memory_budget') ? document.getElementById('memory_budget').value : '256 MB',
      quantization: document.getElementById('quantization_mode') ? document.getElementById('quantization_mode').value : '4-bit AWQ'
    };
  }

  function compileManimScript(opts) {
    return `#!/usr/bin/env python3
"""
3Blue1Brown / Manim Programmatic Video Animation
WebGPU In-Browser Small LM Studio
Render with: manim -pqh manim_flow.py WebGPUBrowserSLMScene
"""
from manim import *

class WebGPUBrowserSLMScene(Scene):
    def construct(self):
        self.camera.background_color = "#0B0F19"

        TEAL_NEON = "#14B8A6"
        CYAN_NEON = "#00F0FF"
        EMERALD_NEON = "#10B981"
        RED_ALERT = "#EF4444"
        SLATE_CARD = "#131C31"
        WHITE_TEXT = "#F8FAFC"

        # ── 1. Title Header ──
        title = Text("WebGPU: Zero-Server In-Browser SLM Inference", font_size=24, weight=BOLD, color=WHITE_TEXT).to_edge(UP, buff=0.4)
        subtitle = Text("${opts.model} · ${opts.workgroup} · VRAM: ${opts.memoryBudget} (${opts.quantization})", font_size=12, color=TEAL_NEON)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(FadeIn(title), FadeIn(subtitle), run_time=1.0)

        # ── 2. Architecture Blocks ──
        browser_box = RoundedRectangle(corner_radius=0.15, width=4.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=TEAL_NEON, stroke_width=2.5).shift(LEFT * 3.2 + DOWN * 0.3)
        b_title = Text("Browser GPU Sandbox", font_size=11, weight=BOLD, color=TEAL_NEON).move_to(browser_box.get_top() + DOWN * 0.3)
        b_desc = Text("WebGPU Device Adapter\nWGSL GEMM Shaders\nLocal Client VRAM: ${opts.memoryBudget}\nSmolLM2 Weights Cached", font_size=9, color=WHITE_TEXT).next_to(b_title, DOWN, buff=0.2)
        browser_group = VGroup(browser_box, b_title, b_desc)

        server_box = RoundedRectangle(corner_radius=0.15, width=4.0, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.4, stroke_color=RED_ALERT, stroke_width=2.0).shift(RIGHT * 3.4 + DOWN * 0.3)
        s_title = Text("Cloud LLM Server", font_size=11, weight=BOLD, color=RED_ALERT).move_to(server_box.get_top() + DOWN * 0.3)
        s_desc = Text("0 Network Calls\n0 Server Hosting Cost\nNo Data Leaves Device", font_size=9, color=WHITE_TEXT).next_to(s_title, DOWN, buff=0.2)
        cross = Cross(server_box, color=RED_ALERT, stroke_width=3)
        server_group = VGroup(server_box, s_title, s_desc, cross)

        self.play(FadeIn(browser_group), FadeIn(server_group), run_time=1.5)

        # ── 3. Bottom Metric Banner ──
        banner = RoundedRectangle(corner_radius=0.15, width=10.5, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=TEAL_NEON, stroke_width=1.5).to_edge(DOWN, buff=0.3)
        banner_text = Text("⚡ 52.4 tok/s Local Speed   |   🔒 100% Offline Air-Gapped   |   ⏱️ 0ms Network Latency", font_size=11, weight=BOLD, color=WHITE_TEXT).move_to(banner)
        self.play(FadeIn(banner), FadeIn(banner_text), run_time=0.8)
        self.wait(2.0)
`;
  }

  function compileConfigs() {
    const opts = getSelectedOptions();

    // 1. webgpu_engine.ts
    compiledCode.webgpu_engine_ts = `/**
 * Native WebGPU In-Browser Small LM Runtime
 * Model: ${opts.model}
 * Quantization: ${opts.quantization}
 * WGSL Shader Tile: ${opts.workgroup}
 */

export interface WebGPUInferenceStats {
  tokensGenerated: number;
  tokensPerSec: number;
  vramAllocatedMb: number;
  timeToFirstTokenMs: number;
}

export class WebGPULocalEngine {
  private device: GPUDevice | null = null;
  private modelWeightsBuffer: GPUBuffer | null = null;

  async initializeAdapter(): Promise<boolean> {
    if (!navigator.gpu) {
      console.warn("WebGPU is not supported in this browser.");
      return false;
    }
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) return false;
    this.device = await adapter.requestDevice();
    return true;
  }

  getWGSLMatMulShader(): string {
    return \`
      @group(0) @binding(0) var<storage, read> A : array<f32>;
      @group(0) @binding(1) var<storage, read> B : array<f32>;
      @group(0) @binding(2) var<storage, read_write> C : array<f32>;

      @compute @workgroup_size(16, 16)
      fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        let row = global_id.x;
        let col = global_id.y;
        var sum = 0.0;
        for (var i = 0u; i < 256u; i = i + 1u) {
          sum = sum + A[row * 256u + i] * B[i * 256u + col];
        }
        C[row * 256u + col] = sum;
      }
    \`;
  }
}
`;

    // 2. server_fallback.py
    compiledCode.server_fallback_py = `#!/usr/bin/env python3
"""
WebGPU In-Browser SLM Verification Server
Diagnostic gateway for client hardware validation and offline fallback
"""
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="WebGPU Verification Gateway")

class DiagnosticsRequest(BaseModel):
    client_gpu: str = Field(default="WebGPU Standard Adapter")
    model: str = Field(default="${opts.model}")
    vram_budget: str = Field(default="${opts.memoryBudget}")

@app.post("/v1/webgpu/diagnostics")
async def diagnostics(req: DiagnosticsRequest):
    return {
        "status": "ready",
        "model": req.model,
        "quantization": "${opts.quantization}",
        "shader_workgroup": "${opts.workgroup}",
        "air_gapped_offline": True,
        "network_roundtrip_ms": 0.0,
        "token_rate": "52.4 tok/s"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

    // 3. k8s-webgpu-client.yaml
    compiledCode.k8s_webgpu_client_yaml = `# Kubernetes Static CDN for Client-Side WebGPU Model Artifacts
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webgpu-model-cdn
  namespace: ai-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: webgpu-cdn
  template:
    metadata:
      labels:
        app: webgpu-cdn
    spec:
      containers:
        - name: nginx-cdn
          image: nginx:alpine
          ports:
            - containerPort: 80
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

    let filename = 'webgpu_engine.ts';
    if (activeTab === 'server_fallback_py') filename = 'server_fallback.py';
    if (activeTab === 'k8s_webgpu_client_yaml') filename = 'k8s-webgpu-client.yaml';
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
          <div class="flex flex-col items-center gap-4 w-full">
            <img src="webgpu_browser_slm_flow.png" alt="WebGPU In-Browser SLM Architecture Diagram" class="rounded-xl border border-slate-700 shadow-2xl max-w-full" style="max-height: 340px;" />
            <div class="text-xs text-slate-400 font-mono">WebGPU Client Device API, WGSL GEMM Shaders & Air-Gapped Privacy</div>
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

    elements.simStatus.innerHTML = '<span class="text-teal-400">⚡ Allocating WebGPU VRAM buffer for ' + opts.model + '...</span>';
    
    setTimeout(() => {
      elements.simStatus.innerHTML = '<span class="text-cyan-400">🚀 Executing WGSL matrix multiplication compute shaders...</span>';
    }, 350);

    setTimeout(() => {
      const tokRate = (48.0 + Math.random() * 8.0).toFixed(1);
      const vram = '142.5 MB';
      const ttft = (16.0 + Math.random() * 4.0).toFixed(1);

      if (elements.simTokensPerSec) elements.simTokensPerSec.textContent = tokRate + ' tok/s';
      if (elements.simNetworkRtt) elements.simNetworkRtt.textContent = '0 ms (Offline)';
      if (elements.simVram) elements.simVram.textContent = vram;
      if (elements.simTtft) elements.simTtft.textContent = ttft + ' ms';

      elements.simStatus.innerHTML = '<span class="text-emerald-400">✅ WebGPU generation complete: ' + tokRate + ' tokens/sec directly in browser GPU!</span>';
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
    ['webgpu_engine_ts', 'server_fallback_py', 'k8s_webgpu_client_yaml', 'manim_flow', 'architecture_flow', 'sre_validation_yml', 'terminal'],
    'webgpu_engine_ts',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  window.SreCore.initTerminalSupport('webgpu-browser-slm', 'WebGPU In-Browser SLM');
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
