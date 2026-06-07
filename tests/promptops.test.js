import { describe, it, expect } from 'vitest';
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

describe('Prompt Registry & Versioning Studio', () => {
  it('should compile default prompts.yaml configuration', () => {
    const window = loadToolDom('../tools/promptops/index.html', '../src/js/generators/promptops-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('prompts:');
    expect(outputBox.textContent).toContain('id: "sre-remediation-task"');
    expect(outputBox.textContent).toContain('version: "1.2.0"');
    expect(outputBox.textContent).toContain('primary: "microsoft/Phi-3-mini-4k-instruct"');
  });

  it('should compile validate_prompts.py', () => {
    const window = loadToolDom('../tools/promptops/index.html', '../src/js/generators/promptops-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('prompt_py');
    expect(outputBox.textContent).toContain('def validate_registry_file');
    expect(outputBox.textContent).toContain('yaml.safe_load');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/promptops/index.html', '../src/js/generators/promptops-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('prompts.yaml');

    window.switchTab('prompt_py');
    expect(filenameInput.value).toBe('validate_prompts.py');
  });
});
