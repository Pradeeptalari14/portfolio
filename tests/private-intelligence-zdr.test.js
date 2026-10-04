import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/private-intelligence-zdr/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/private-intelligence-zdr-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('OpenAI Private Intelligence & Zero Data Retention (ZDR) Studio', () => {
  it('should compile default ZDR Enclave gateway and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Private Intelligence');
    expect(code).toContain('execute_private_inference');
    expect(code).toContain('zero_data_retention');
    expect(window.document.getElementById('metric-retention').textContent).toBe('0 Bytes (ZDR)');
    expect(window.document.getElementById('metric-enclave').textContent).toBe('AMD SEV-SNP Enclave');
  });

  it('should switch tabs to Ephemeral Key Shredder', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="shredder"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('class EphemeralKeyShredder');
    expect(code).toContain('shred_buffer');
  });

  it('should update HUD when changing enclave hardware to Intel TDX', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('enclaveType');
    select.value = 'intel_tdx';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-enclave').textContent).toBe('Intel TDX Enclave');
    expect(window.document.getElementById('finops-text').textContent).toContain('Intel TDX Enclave');
  });
});
