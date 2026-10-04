import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/deepseek-mla-dualpipe/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/deepseek-mla-dualpipe-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('DeepSeek-R1 Multi-Head Latent Attention (MLA) Studio', () => {
  it('should compile default DeepSeek MLA code and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('DeepSeek-R1 Multi-Head Latent Attention');
    expect(code).toContain('MultiHeadLatentAttention');
    expect(code).toContain('d_latent_kv: int = 512');
    expect(window.document.getElementById('metric-kv').textContent).toContain('93.3%');
    expect(window.document.getElementById('metric-throughput').textContent).toBe('3.8x Speedup');
  });

  it('should switch tabs to DualPipe Scheduler', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="dualpipe"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('DualPipeScheduler');
    expect(code).toContain('forward_pipeline');
  });

  it('should update HUD and code when changing attention to uncompressed MHA', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('attentionMechanism');
    select.value = 'mha_standard';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-kv').textContent).toContain('0%');
    expect(window.document.getElementById('metric-throughput').textContent).toBe('1.0x Baseline');
  });
});
