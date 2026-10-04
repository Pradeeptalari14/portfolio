import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/ebpf-tetragon-security/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/ebpf-tetragon-security-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Cilium Tetragon eBPF Security Studio', () => {
  it('should compile default TracingPolicy manifest and initialize HUD', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Tetragon');
    expect(code).toContain('TracingPolicy');
    expect(code).toContain('sys_execve');
    expect(code).toContain('Sigkill');
    expect(window.document.getElementById('metric-enforce').textContent).toContain('SIGKILL');
  });

  it('should switch tabs to Helm configuration', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="helm"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('tetragon:');
    expect(code).toContain('grpc:');
  });

  it('should update policy when action changed to audit_only', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('enforcementAction');
    select.value = 'audit_only';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-enforce').textContent).toContain('Audit Event');
  });
});
