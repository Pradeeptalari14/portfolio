import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  window.mermaid = {
    init: () => {},
    run: () => {},
    render: () => {}
  };

  // Load core-tool.js
  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  // Load the generator JS code
  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('DeepSeek-R1 Speculative Decoding & Reasoning Studio', () => {
  it('should compile default speculative_engine.py with vLLM and parallel verification', () => {
    const window = loadToolDom('../tools/deepseek-speculative-decoding/index.html', '../src/js/generators/deepseek-speculative-decoding-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('DeepSeek-R1 Speculative Decoding Engine');
    expect(outputBox.textContent).toContain('from vllm import LLM, SamplingParams');
    expect(outputBox.textContent).toContain('model="deepseek-ai/DeepSeek-R1"');
    expect(outputBox.textContent).toContain('speculative_model="Qwen/Qwen2.5-Coder-1.5B-Instruct"');
    expect(outputBox.textContent).toContain('num_speculative_tokens=4');
  });

  it('should update configuration when form values change', () => {
    const window = loadToolDom('../tools/deepseek-speculative-decoding/index.html', '../src/js/generators/deepseek-speculative-decoding-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const draftSelect = window.document.getElementById('draft_model');
    const lookaheadInput = window.document.getElementById('lookahead_k');
    const thresholdInput = window.document.getElementById('acceptance_threshold');

    draftSelect.value = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B';
    lookaheadInput.value = '6';
    thresholdInput.value = '0.90';

    draftSelect.dispatchEvent(new window.Event('change'));
    lookaheadInput.dispatchEvent(new window.Event('input'));
    thresholdInput.dispatchEvent(new window.Event('input'));

    expect(outputBox.textContent).toContain('speculative_model="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"');
    expect(outputBox.textContent).toContain('num_speculative_tokens=6');
  });

  it('should switch tabs and compile speculative_client.ts and k8s-speculative-gpu.yaml', () => {
    const window = loadToolDom('../tools/deepseek-speculative-decoding/index.html', '../src/js/generators/deepseek-speculative-decoding-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // Switch to speculative_client.ts
    window.switchTab('speculative_client_ts');
    expect(outputBox.textContent).toContain('export class DeepSeekSpeculativeClient');
    expect(outputBox.textContent).toContain('streamReasoning(');
    expect(outputBox.textContent).toContain('totalTokens');

    // Switch to k8s_speculative_gpu
    window.switchTab('k8s_speculative_gpu');
    expect(outputBox.textContent).toContain('kind: Deployment');
    expect(outputBox.textContent).toContain('nvidia.com/gpu: "8"');
    expect(outputBox.textContent).toContain('/dev/shm');
  });

  it('should compile manim_flow.py with 3Blue1Brown animation scene', () => {
    const window = loadToolDom('../tools/deepseek-speculative-decoding/index.html', '../src/js/generators/deepseek-speculative-decoding-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('manim_flow');
    expect(outputBox.textContent).toContain('from manim import *');
    expect(outputBox.textContent).toContain('class DeepSeekSpeculativeDecodingScene(Scene):');
    expect(outputBox.textContent).toContain('manim -pqh manim_flow.py DeepSeekSpeculativeDecodingScene');
  });

  it('should trigger interactive simulation and update HUD metrics', () => {
    const window = loadToolDom('../tools/deepseek-speculative-decoding/index.html', '../src/js/generators/deepseek-speculative-decoding-gen.js');
    
    vi.useFakeTimers();
    const btnSim = window.document.getElementById('btn-run-simulation');
    const simStatus = window.document.getElementById('sim-status');
    
    btnSim.click();
    expect(simStatus.textContent).toContain('Drafting K=4 tokens');

    vi.advanceTimersByTime(500);
    expect(simStatus.textContent).toContain('Target parallel verification');

    vi.advanceTimersByTime(500);
    expect(simStatus.textContent).toContain('Verification complete');
    
    const hudSpeedup = window.document.getElementById('hud-speedup');
    expect(hudSpeedup.textContent).toContain('x');
    vi.useRealTimers();
  });

  it('should run interactive SRE terminal commands', () => {
    const window = loadToolDom('../tools/deepseek-speculative-decoding/index.html', '../src/js/generators/deepseek-speculative-decoding-gen.js');
    
    vi.useFakeTimers();
    window.switchTab('terminal');
    window.runTerminalCommand('docker compose up -d');
    vi.advanceTimersByTime(2000);
    
    const logs = window.document.getElementById('terminal-logs');
    expect(logs.textContent).toContain('Creating container tp-deepseek-speculative-decoding-db-1');

    window.runTerminalCommand('bash scripts/validate.sh');
    vi.advanceTimersByTime(1500);
    expect(logs.textContent).toContain('SRE compliance validation complete for deepseek-speculative-decoding.');
    vi.useRealTimers();
  });
});
