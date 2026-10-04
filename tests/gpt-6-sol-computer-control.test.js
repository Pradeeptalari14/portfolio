import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/gpt-6-sol-computer-control/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/gpt-6-sol-computer-control-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('GPT-6.1 Sol Computer Control & Software Engineering Studio', () => {
  it('should compile default GPT-6.1 Sol engineer and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('GPT-6.1 Sol Computer Control & Software Engineering');
    expect(code).toContain('class GPT6SolEngineer');
    expect(code).toContain('gpt-6.1-sol');
    expect(window.document.getElementById('metric-cost').textContent).toBe('-80.0%');
    expect(window.document.getElementById('metric-mode').textContent).toBe('OS Computer Control');
  });

  it('should switch tabs to Computer Control Loop', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="loop"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('class ComputerControlLoop');
    expect(code).toContain('capture_screen_state');
  });

  it('should update HUD and manifests when switching to Kubernetes Ephemeral Pod', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('sandboxEnv');
    select.value = 'kubernetes_ephemeral_pod';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-isolation').textContent).toBe('K8s Ephemeral');
  });
});
