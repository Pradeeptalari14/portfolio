import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/disaggregated-prefill-decode/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/disaggregated-prefill-decode-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Disaggregated Prefill & Decode Serving Studio', () => {
  it('should compile default Kubernetes manifest and initialize HUD', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Disaggregated Prefill & Decode');
    expect(code).toContain('enable-disaggregated-prefill');
    expect(code).toContain('enable-disaggregated-decode');
    expect(window.document.getElementById('metric-ttft').textContent).toBe('-64.2%');
  });

  it('should switch tabs to Mooncake configuration', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="config"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('chunk_size_bytes');
    expect(code).toContain('ROCEV2');
  });

  it('should adapt transport parameters when switched to InfiniBand', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('rdmaTransport');
    select.value = 'infiniband';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-speed').textContent).toContain('400 Gbps');
    expect(window.document.getElementById('metric-itl').textContent).toBe('9.2 ms');
  });
});
