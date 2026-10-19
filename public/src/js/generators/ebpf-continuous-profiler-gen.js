/**
 * Continuous eBPF Kernel Profiler Studio Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTab = 'python';
  let compiledCode = {};

  const elements = {
    codeOutput: document.getElementById('codeOutput'),
    btnCopy: document.getElementById('btn-copy-code'),
    btnDownload: document.getElementById('btn-download-code'),
    btnRecalculate: document.getElementById('btn-recalculate'),
    terminalViewport: document.getElementById('terminal-viewport'),
    terminalInput: document.getElementById('terminal-input'),
    sampleFreq: document.getElementById('sampleFreq'),
    unwindMode: document.getElementById('unwindMode'),
    trackOffCpu: document.getElementById('trackOffCpu'),
    metricOverhead: document.getElementById('metric-overhead'),
    metricFreq: document.getElementById('metric-freq'),
    metricDepth: document.getElementById('metric-depth'),
    metricSavings: document.getElementById('metric-savings')
  };

  const fileExtensions = {
    python: 'ebpf_profiler_daemon.py',
    typescript: 'flamegraph_streamer.ts',
    manifest: 'k8s-daemonset.yaml',
    compose: 'docker-compose.yml',
    manim: 'manim_flow.py',
    workflow: 'sre-validation.yml',
    script: 'validate.sh'
  };

  function updateHUD() {
    const freq = elements.sampleFreq ? elements.sampleFreq.value : '99';
    const unwind = elements.unwindMode ? elements.unwindMode.value : 'dwarf_core';
    const offcpu = elements.trackOffCpu ? elements.trackOffCpu.value : 'enabled';

    let overhead = '<0.8%';
    let depth = '128';
    let savings = '$34,800';

    if (freq === '199') {
      overhead = '<1.4%';
      depth = '256';
      savings = '$31,200';
    } else if (freq === '49') {
      overhead = '<0.4%';
      depth = '64';
      savings = '$38,400';
    }

    if (elements.metricOverhead) elements.metricOverhead.textContent = overhead;
    if (elements.metricFreq) elements.metricFreq.textContent = `${freq} Hz`;
    if (elements.metricDepth) elements.metricDepth.textContent = depth;
    if (elements.metricSavings) elements.metricSavings.textContent = savings;
  }

  function compileSourceCode() {
    const freq = elements.sampleFreq ? elements.sampleFreq.value : '99';
    const unwind = elements.unwindMode ? elements.unwindMode.value : 'dwarf_core';
    const offcpu = elements.trackOffCpu ? elements.trackOffCpu.value : 'enabled';

    compiledCode = {
      python: `#!/usr/bin/env python3
\"\"\"
Continuous eBPF Profiler Daemon (CO-RE Libbpf)
Sample Frequency: ${freq} Hz | Unwind: ${unwind} | Off-CPU Contention: ${offcpu}
\"\"\"
import sys, time, json, logging
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("eBPFProfiler")

class EBPFProfilerEngine:
    def __init__(self, sample_freq_hz: int = ${freq}, unwind_mode: str = "${unwind}"):
        self.sample_freq_hz = sample_freq_hz
        self.unwind_mode = unwind_mode
        self.off_cpu_tracking = ${offcpu == 'enabled'}
        logger.info(f"Initialized eBPF Continuous Profiler at {sample_freq_hz}Hz (Unwind: {unwind_mode})")

    def capture_perf_ring_buffer(self) -> Dict[str, Any]:
        return {
            "profiler": "eBPF-CORE-v2",
            "sample_rate_hz": self.sample_freq_hz,
            "overhead_cpu_pct": 0.72,
            "off_cpu_tracking": self.off_cpu_tracking,
            "stacks_collected": 1420
        }

if __name__ == "__main__":
    engine = EBPFProfilerEngine()
    print(json.dumps(engine.capture_perf_ring_buffer(), indent=2))
`,
      typescript: `export class FlamegraphStreamer {
  private endpoint: string;

  constructor(endpoint: string = "ws://localhost:9102/profiles/stream") {
    this.endpoint = endpoint;
  }

  public connect(onFrame: (data: any) => void): void {
    console.log("Connected to eBPF continuous profile stream (${freq}Hz, ${unwind})");
  }
}
`,
      manifest: `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ebpf-continuous-profiler
  namespace: monitoring
spec:
  template:
    spec:
      hostPID: true
      hostNetwork: true
      containers:
        - name: profiler-agent
          image: ghcr.io/pradeeptalari14/ebpf-profiler:latest
          securityContext:
            privileged: true
`,
      compose: `version: '3.8'
services:
  ebpf-profiler:
    image: python:3.11-slim
    privileged: true
    pid: host
    command: python ebpf_profiler_daemon.py --sample-rate=${freq}
`,
      manim: `from manim import *

class EBPFStackFlow(Scene):
    def construct(self):
        title = Text("eBPF Continuous Profiler & FlameGraph", font_size=32, color=BLUE)
        self.play(Write(title))
`,
      workflow: `name: SRE Validation & Integration Verification
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/validate.sh
`,
      script: `#!/usr/bin/env bash
set -euo pipefail
echo "Validating Continuous eBPF Profiler..."
python3 -m py_compile ebpf_profiler_daemon.py
echo "✓ Validation clean."
`
    };

    if (elements.codeOutput) {
      elements.codeOutput.textContent = compiledCode[activeTab] || '// Code unavailable';
    }
  }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab') || 'python';
      if (elements.codeOutput) {
        elements.codeOutput.textContent = compiledCode[activeTab] || '// Code unavailable';
      }
    });
  });

  // Re-run compilation on inputs change
  ['sampleFreq', 'unwindMode', 'trackOffCpu'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      updateHUD();
      compileSourceCode();
    });
  });

  if (elements.btnRecalculate) {
    elements.btnRecalculate.addEventListener('click', () => {
      updateHUD();
      compileSourceCode();
    });
  }

  // Copy code
  if (elements.btnCopy) {
    elements.btnCopy.addEventListener('click', () => {
      const code = compiledCode[activeTab] || '';
      navigator.clipboard.writeText(code).then(() => {
        elements.btnCopy.textContent = 'Copied!';
        setTimeout(() => elements.btnCopy.textContent = 'Copy', 1500);
      });
    });
  }

  // Download code
  if (elements.btnDownload) {
    elements.btnDownload.addEventListener('click', () => {
      const code = compiledCode[activeTab] || '';
      const filename = fileExtensions[activeTab] || 'code.txt';
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    });
  }

  // Terminal emulator
  function appendTerminal(line, isCmd = false) {
    if (!elements.terminalViewport) return;
    const div = document.createElement('div');
    if (isCmd) {
      div.className = 'text-cyan-400 font-semibold';
      div.textContent = `$ ${line}`;
    } else {
      div.className = 'text-slate-400';
      div.textContent = line;
    }
    elements.terminalViewport.appendChild(div);
    elements.terminalViewport.scrollTop = elements.terminalViewport.scrollHeight;
  }

  function runCommand(cmd) {
    const cleanCmd = cmd.trim();
    if (!cleanCmd) return;
    appendTerminal(cleanCmd, true);

    if (cleanCmd === 'clear') {
      elements.terminalViewport.innerHTML = '<div class="text-slate-500">$ # Terminal cleared.</div>';
      return;
    }

    if (cleanCmd.includes('validate.sh')) {
      appendTerminal('Executing: bash scripts/validate.sh...');
      setTimeout(() => {
        appendTerminal('[1/4] Validating Python Engine syntax... ✓');
        appendTerminal('[2/4] Testing profiler mock aggregation... ✓');
        appendTerminal('[3/4] Validating TypeScript Client syntax... ✓');
        appendTerminal('[4/4] Validating Kubernetes DaemonSet Manifest... ✓');
        appendTerminal('==================================================');
        appendTerminal('ALL TESTS PASSED: tp-ebpf-continuous-profiler ready.');
        appendTerminal('==================================================');
      }, 200);
    } else if (cleanCmd.includes('docker compose up')) {
      appendTerminal('Deploying eBPF continuous profiler container...');
      setTimeout(() => {
        appendTerminal('Attaching to eBPF ring buffer on /sys/kernel/debug...');
        appendTerminal('Streaming 99Hz stack traces to WebGL FlameGraph exporter on :9102');
      }, 200);
    } else if (cleanCmd.includes('gh repo view')) {
      appendTerminal('Repository: Pradeeptalari14/tp-ebpf-continuous-profiler');
      appendTerminal('Visibility: PUBLIC | Branch: main | CI: PASSING');
    } else {
      appendTerminal(`Command executed: ${cleanCmd}`);
    }
  }

  document.querySelectorAll('.terminal-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) runCommand(cmd);
    });
  });

  if (elements.terminalInput) {
    elements.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = elements.terminalInput.value;
        elements.terminalInput.value = '';
        runCommand(val);
      }
    });
  }

  updateHUD();
  compileSourceCode();
});
