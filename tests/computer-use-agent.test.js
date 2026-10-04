import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/computer-use-agent/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/computer-use-agent-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Autonomous Computer-Use & OS Operator Agent Studio', () => {
  it('should compile default agent Python code and initialize HUD', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Computer-Use');
    expect(code).toContain('computer_20241022');
    expect(code).toContain('display_width_px');
    expect(window.document.getElementById('metric-accuracy').textContent).toBe('99.2%');
  });

  it('should switch tabs to Dockerfile sandbox', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="dockerfile"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('Xvfb');
    expect(code).toContain('fluxbox');
  });

  it('should update HUD when resolution changed', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('displayResolution');
    select.value = '1024x768';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-accuracy').textContent).toBe('97.5%');
    expect(window.document.getElementById('metric-latency').textContent).toBe('0.8 s / step');
  });
});
