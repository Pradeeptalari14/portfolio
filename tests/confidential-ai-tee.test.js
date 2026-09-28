import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/confidential-ai-tee/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/confidential-ai-tee-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Confidential AI & NVIDIA H100 TEE Attestation Studio', () => {
  it('should compile default active code and initialize HUD', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput');
    expect(code.textContent.length).toBeGreaterThan(20);
    expect(window.document.title).toContain('Confidential AI & NVIDIA H100 TEE Attestation Studio');
  });

  it('should switch tabs smoothly and update code output', () => {
    const window = loadToolDom();
    const manifestBtn = window.document.querySelector('.tab-btn[data-tab="manifest"]');
    expect(manifestBtn).not.toBeNull();
    manifestBtn.click();
    const code = window.document.getElementById('codeOutput');
    expect(code.textContent).toContain('apiVersion:');
  });

  it('should update HUD when parameters change', () => {
    const window = loadToolDom();
    const inputEl = window.document.getElementById('teeHardware');
    if (inputEl) {
      inputEl.value = 'intel_tdx';
      inputEl.dispatchEvent(new window.Event('change'));
      const hudEl = window.document.getElementById('metric-overhead');
      expect(hudEl.textContent).toBe('<2.3%');
    }
  });
});
