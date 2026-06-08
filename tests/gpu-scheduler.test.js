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

describe('GPU Scheduler & K8s Allocator Studio', () => {
  it('should compile default GPU sharing policy yaml configs', () => {
    const window = loadToolDom('../tools/gpu-scheduler/index.html', '../src/js/generators/gpu-scheduler-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: ClusterPolicy');
    expect(outputBox.textContent).toContain('mode: "MIG"');
    expect(outputBox.textContent).toContain('strategy: "mixed"');
    expect(outputBox.textContent).toContain('gpu_weight: 4');
  });

  it('should compile Kueue ClusterQueue config when tab changes', () => {
    const window = loadToolDom('../tools/gpu-scheduler/index.html', '../src/js/generators/gpu-scheduler-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('gpu_k8s');
    expect(outputBox.textContent).toContain('kind: ClusterQueue');
    expect(outputBox.textContent).toContain('queueingStrategy: "Weighted"');
    expect(outputBox.textContent).toContain('nominalQuota: 4');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/gpu-scheduler/index.html', '../src/js/generators/gpu-scheduler-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('gpu-policy.yaml');

    window.switchTab('gpu_k8s');
    expect(filenameInput.value).toBe('kueue-config.yaml');
  });
});
