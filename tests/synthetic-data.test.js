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

describe('AI Synthetic Data Generator Studio', () => {
  it('should compile default Python script settings', () => {
    const window = loadToolDom('../tools/synthetic-data/index.html', '../src/js/generators/synthetic-data-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('gpt-4o-mini');
    expect(outputBox.textContent).toContain('500');
    expect(outputBox.textContent).toContain('LLM-as-a-judge');
    expect(outputBox.textContent).toContain('Running semantic cosine deduplication');
  });

  it('should update output based on input parameters', () => {
    const window = loadToolDom('../tools/synthetic-data/index.html', '../src/js/generators/synthetic-data-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const modelSelect = window.document.getElementById('sd_generator_model');
    modelSelect.value = 'microsoft/Phi-3-mini-4k-instruct';
    modelSelect.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('microsoft/Phi-3-mini-4k-instruct');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/synthetic-data/index.html', '../src/js/generators/synthetic-data-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('generate-dataset.py');

    window.switchTab('sd_req');
    expect(filenameInput.value).toBe('requirements.txt');
  });
});
