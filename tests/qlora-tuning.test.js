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

describe('SLM Fine-Tuning & Quantization Studio', () => {
  it('should compile default finetune.py configuration', () => {
    const window = loadToolDom('../tools/qlora-tuning/index.html', '../src/js/generators/qlora-tuning-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('Base Model: microsoft/Phi-3-mini-4k-instruct');
    expect(outputBox.textContent).toContain('lora_alpha=32');
    expect(outputBox.textContent).toContain('load_in_4bit=True');
  });

  it('should compile requirements.txt and list correct packages', () => {
    const window = loadToolDom('../tools/qlora-tuning/index.html', '../src/js/generators/qlora-tuning-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('qlora_req');
    expect(outputBox.textContent).toContain('torch>=2.2.0');
    expect(outputBox.textContent).toContain('peft>=0.10.0');
    expect(outputBox.textContent).toContain('bitsandbytes>=0.43.0');
  });

  it('should compile adapter_config.json', () => {
    const window = loadToolDom('../tools/qlora-tuning/index.html', '../src/js/generators/qlora-tuning-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('qlora_config');
    const json = JSON.parse(outputBox.textContent);
    expect(json.peft_type).toBe('LORA');
    expect(json.r).toBe(16);
    expect(json.lora_alpha).toBe(32);
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/qlora-tuning/index.html', '../src/js/generators/qlora-tuning-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('finetune.py');

    window.switchTab('qlora_req');
    expect(filenameInput.value).toBe('requirements.txt');

    window.switchTab('qlora_config');
    expect(filenameInput.value).toBe('adapter_config.json');
  });
});
