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

describe('LLM Gateway & API Router Studio', () => {
  it('should compile default LiteLLM router settings', () => {
    const window = loadToolDom('../tools/llm-gateway/index.html', '../src/js/generators/llm-gateway-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('model_name: primary-router-model');
    expect(outputBox.textContent).toContain('model: openai/gpt-4o');
    expect(outputBox.textContent).toContain('enable_fallbacks: true');
    expect(outputBox.textContent).toContain('cache: true');
  });

  it('should compile cache script code', () => {
    const window = loadToolDom('../tools/llm-gateway/index.html', '../src/js/generators/llm-gateway-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('gw_cache');
    expect(outputBox.textContent).toContain('class SemanticCache:');
    expect(outputBox.textContent).toContain('SIMILARITY_THRESHOLD = 0.85');
    expect(outputBox.textContent).toContain('all-MiniLM-L6-v2');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/llm-gateway/index.html', '../src/js/generators/llm-gateway-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('litellm-config.yaml');

    window.switchTab('gw_cache');
    expect(filenameInput.value).toBe('semantic-cache.py');

    window.switchTab('gw_sh');
    expect(filenameInput.value).toBe('query-gateway.sh');
  });
});
