import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/kimi-long-context/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/kimi-long-context-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Moonshot Kimi K1.5 2M Ultra-Long Context Studio', () => {
  it('should compile default Kimi KV cache engine and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('Moonshot Kimi K1.5 2M Ultra-Long Context');
    expect(code).toContain('class HierarchicalKVCache');
    expect(code).toContain('max_context_tokens: int = 2000000');
    expect(window.document.getElementById('metric-context').textContent).toBe('2,000,000 Tokens');
    expect(window.document.getElementById('metric-accuracy').textContent).toBe('100.0% NIAH');
  });

  it('should switch tabs to Serving Gateway', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="server"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('Moonshot Kimi K1.5 Long-Context Gateway');
    expect(code).toContain('query_long_context');
  });

  it('should update HUD and manifests when switching cache strategy to radix prefix tree', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('cacheStrategy');
    select.value = 'radix_prefix_tree';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-hitrate').textContent).toContain('96.5%');
    expect(window.document.getElementById('metric-latency').textContent).toContain('-92%');
  });
});
