import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/qwen-agentic-coder/index.html');
  const htmlText = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  if (fs.existsSync(corePath)) {
    const coreCode = fs.readFileSync(corePath, 'utf8');
    window.eval(coreCode);
  }

  const jsPath = path.resolve(__dirname, '../src/js/generators/qwen-agentic-coder-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Qwen2.5-Coder-32B Enterprise Agentic Coding Studio', () => {
  it('should compile default Qwen Coder Agent and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Qwen2.5-Coder-32B Enterprise Agentic Coding');
    expect(code).toContain('class QwenCoderAgent');
    expect(code).toContain('Qwen/Qwen2.5-Coder-32B-Instruct-AWQ');
    expect(window.document.getElementById('metric-context').textContent).toBe('128k Tokens');
    expect(window.document.getElementById('metric-precision').textContent).toContain('AWQ 4-Bit');
  });

  it('should switch tabs to vLLM Serving script', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="serving"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('python3 -m vllm.entrypoints.openai.api_server');
    expect(code).toContain('--tool-call-parser qwen');
  });

  it('should update HUD and manifests when switching to BF16 multi-GPU', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('quantizationMode');
    select.value = 'bf16_full';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-precision').textContent).toContain('BF16 (68 GB)');
    
    // Switch to manifest tab
    const manifestTab = window.document.querySelector('.tab-btn[data-tab="manifest"]');
    manifestTab.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('nvidia.com/gpu: "2"');
  });
});
