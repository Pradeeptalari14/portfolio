import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/chatgpt-space-collaboration/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/chatgpt-space-collaboration-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('OpenAI ChatGPT Space & Multi-Agent Coworking Rooms Studio', () => {
  it('should compile default Space broker and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('ChatGPT Space');
    expect(code).toContain('space_websocket_endpoint');
    expect(code).toContain('CONNECTED_PEERS');
    expect(window.document.getElementById('metric-latency').textContent).toBe('< 15ms Yjs CRDT');
    expect(window.document.getElementById('metric-consensus').textContent).toBe('Human Signoff Gate');
  });

  it('should switch tabs to Yjs CRDT Sync Worker', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="crdt"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('class YjsCRDTSyncWorker');
    expect(code).toContain('apply_delta');
  });

  it('should update HUD when changing room archetype to pair coding', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('roomType');
    select.value = 'architecture_pair_coding';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('finops-text').textContent).toContain('Pair Coding Space');
  });
});
