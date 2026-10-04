import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/colpali-vlm-rag/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/colpali-vlm-rag-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('ColPali Vision-Language Multi-Vector RAG Studio', () => {
  it('should compile default ColPali Python code and initialize HUD', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('ColPali Vision-Language');
    expect(code).toContain('ColPaliRetriever');
    expect(code).toContain('score_maxsim');
    expect(window.document.getElementById('metric-recall').textContent).toBe('94.8%');
  });

  it('should switch tabs smoothly to Qdrant Multi-Vector schema', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="qdrant"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('multivector_config');
    expect(code).toContain('max_sim');
  });

  it('should update HUD and code when changing quantization strategy', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('quantization');
    select.value = 'float32';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('metric-recall').textContent).toBe('96.2%');
    expect(window.document.getElementById('metric-latency').textContent).toBe('<45 ms');
  });
});
