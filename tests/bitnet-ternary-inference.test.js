import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/bitnet-ternary-inference/index.html');
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  const jsPath = path.resolve(__dirname, '../src/js/generators/bitnet-ternary-inference-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('BitNet 1.58-bit Ternary LLM Inference Studio', () => {
  it('should compile default active code and initialize HUD', () => {
    const window = loadToolDom();
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent.length).toBeGreaterThan(20);
    expect(window.document.title).toContain('BitNet 1.58-bit Ternary LLM Inference Studio');
  });

  it('should switch tabs smoothly without throwing', () => {
    const window = loadToolDom();
    expect(typeof window.switchTab).toBe('function');
    
    window.switchTab('architecture_flow');
    const mermaid = window.document.getElementById('mermaid-container');
    expect(mermaid.classList.contains('hidden')).toBe(false);

    window.switchTab('terminal');
    const term = window.document.getElementById('terminal-viewport');
    expect(term.classList.contains('hidden')).toBe(false);
  });

  it('should handle terminal commands interactively', () => {
    const window = loadToolDom();
    window.switchTab('terminal');
    expect(typeof window.runTerminalCommand).toBe('function');
    
    window.runTerminalCommand('help');
    const logs = window.document.getElementById('terminal-logs');
    expect(logs.textContent).toContain('docker compose up');
    
    window.runTerminalCommand('clear');
    expect(logs.children.length).toBe(0);
  });
});
