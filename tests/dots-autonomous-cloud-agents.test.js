import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/dots-autonomous-cloud-agents/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/dots-autonomous-cloud-agents-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('OpenAI Dots: 24/7 Autonomous Cloud Agents Studio', () => {
  it('should compile default Dots runtime and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('OpenAI Dots: 24/7 Autonomous Cloud Agents');
    expect(code).toContain('class DotsAgentRuntime');
    expect(window.document.getElementById('metric-uptime').textContent).toBe('24/7 Always-On');
    expect(window.document.getElementById('metric-ecosystem').textContent).toBe('4,000+ SaaS Apps');
  });

  it('should switch tabs to App Mesh Router', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="mesh"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('class AppMeshRouter');
    expect(code).toContain('dispatch_tool_call');
  });

  it('should update HUD and code when changing state persistence backend', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('stateStore');
    select.value = 'postgres_pgvector';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-checkpoint').textContent).toBe('PGVector Ledger');
  });
});
