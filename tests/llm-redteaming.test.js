import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  // Mock Mermaid
  window.mermaid = {
    init: () => {},
    run: () => {},
    render: () => {}
  };

  // Load core-tool.js
  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  // Load the generator JS code
  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('LLM Red Teaming & Vulnerability Scanner Studio', () => {
  it('should compile default Garak settings', () => {
    const window = loadToolDom('../tools/llm-redteaming/index.html', '../src/js/generators/llm-redteaming-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('report_prefix: "redteam-audit-report"');
    expect(outputBox.textContent).toContain('- jailbreak.DAN');
    expect(outputBox.textContent).toContain('generations: 100');
    expect(outputBox.textContent).toContain('exit_on_failure: true');
  });

  it('should update output based on input parameters', () => {
    const window = loadToolDom('../tools/llm-redteaming/index.html', '../src/js/generators/llm-redteaming-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const probeSelect = window.document.getElementById('rt_probe_type');
    probeSelect.value = 'DataLeak';
    probeSelect.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('- leak.PII');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/llm-redteaming/index.html', '../src/js/generators/llm-redteaming-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('garak-config.yaml');

    window.switchTab('rt_sh');
    expect(filenameInput.value).toBe('run-audit.sh');
  });
});
