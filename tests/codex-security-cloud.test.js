import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/codex-security-cloud/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/codex-security-cloud-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('OpenAI Codex Security Cloud Studio', () => {
  it('should compile default security scanner and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Codex Security Cloud');
    expect(code).toContain('execute_security_scan');
    expect(code).toContain('SECRET_PATTERNS');
    expect(window.document.getElementById('metric-accuracy').textContent).toBe('99.1% High Precision');
    expect(window.document.getElementById('metric-compliance').textContent).toBe('SOC2 & ISO 27001');
  });

  it('should switch tabs to PR Patch Remediator', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="remediator"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('class SecurityRemediator');
    expect(code).toContain('generate_fix_pr');
  });

  it('should update HUD when changing remediation mode to auto-merge', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('remediationMode');
    select.value = 'auto_merge_semver_patch';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-resolution').textContent).toContain('Auto-Merge');
  });
});
