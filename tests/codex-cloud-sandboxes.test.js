import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/codex-cloud-sandboxes/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/codex-cloud-sandboxes-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('OpenAI Codex in the Cloud & Ultrafast Sandboxes Studio', () => {
  it('should compile default Codex cloud runner and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Codex in the Cloud');
    expect(code).toContain('execute_codex_cloud_task');
    expect(code).toContain('CodeTaskRequest');
    expect(window.document.getElementById('metric-velocity').textContent).toContain('8x Ultrafast');
    expect(window.document.getElementById('metric-isolation').textContent).toBe('MicroVM Firecracker');
  });

  it('should switch tabs to MicroVM Sandbox Pool', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="pool"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('class MicroVMSandboxPool');
    expect(code).toContain('acquire_sandbox');
  });

  it('should update HUD when changing virtualization engine to gVisor', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('vmEngine');
    select.value = 'gvisor_runsc';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-isolation').textContent).toBe('gVisor runsc');
    expect(window.document.getElementById('finops-text').textContent).toContain('gVisor runsc');
  });
});
