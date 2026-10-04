import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/claude-hybrid-reasoning/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/claude-hybrid-reasoning-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Claude 3.7 Sonnet Hybrid Reasoning Studio', () => {
  it('should compile default Claude 3.7 Python code and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Claude 3.7 Sonnet Hybrid Reasoning');
    expect(code).toContain('claude-3-7-sonnet-20250219');
    expect(code).toContain('"budget_tokens": 16384');
    expect(window.document.getElementById('metric-budget').textContent).toBe('16,384 tokens');
  });

  it('should switch tabs to TypeScript SSE streaming', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="typescript"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('@anthropic-ai/sdk');
    expect(code).toContain('chunk.delta.thinking');
  });

  it('should update HUD and code when switching to fast instant mode', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('reasoningMode');
    select.value = 'fast_instant';
    select.dispatchEvent(new window.Event('change'));

    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('0 thinking tokens');
    expect(window.document.getElementById('metric-budget').textContent).toBe('0 tokens (Instant)');
  });
});
