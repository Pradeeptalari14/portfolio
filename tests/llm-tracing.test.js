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

describe('LLM Observability & Tracing Studio', () => {
  it('should compile default Langfuse Docker compose files', () => {
    const window = loadToolDom('../tools/llm-tracing/index.html', '../src/js/generators/llm-tracing-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('image: langfuse/langfuse:latest');
    expect(outputBox.textContent).toContain('DATABASE_URL=postgresql://langfuse_user:strong_tracing_password_99@postgres:5432/langfuse_db');
  });

  it('should compile instrumented python files', () => {
    const window = loadToolDom('../tools/llm-tracing/index.html', '../src/js/generators/llm-tracing-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('tr_instrument');
    expect(outputBox.textContent).toContain('from langfuse import Langfuse');
    expect(outputBox.textContent).toContain('name="sre-production-alert-analyzer"');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/llm-tracing/index.html', '../src/js/generators/llm-tracing-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('langfuse-compose.yml');

    window.switchTab('tr_instrument');
    expect(filenameInput.value).toBe('instrumentation.py');

    window.switchTab('tr_otel');
    expect(filenameInput.value).toBe('otel-collector-config.yaml');
  });
});
