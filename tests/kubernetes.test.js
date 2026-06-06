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

  // Mock setupCompilerTriggers for the JSDOM environment
  window.setupCompilerTriggers = (compileCallback, excludeIds = ['download-name-input']) => {
    const inputs = window.document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!excludeIds || !excludeIds.includes(input.id)) {
        input.addEventListener('input', compileCallback);
        input.addEventListener('change', compileCallback);
      }
    });
  };

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');

  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.dispatchEvent(event);
  window.document.dispatchEvent(event);

  if (typeof window.triggerCompileAll === 'function') {
    window.triggerCompileAll();
  }

  return window;
}

describe('Kubernetes Manifest & 3D Sandbox Studio', () => {
  it('should compile default manifest configs correctly', () => {
    const window = loadToolDom('../tools/kubernetes/index.html', '../src/js/generators/kubernetes-gen.js');

    const workloadName = window.document.getElementById('workload_name');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('name: my-app');
    expect(outputBox.textContent).toContain('image: nginx:latest');

    workloadName.value = 'my-custom-workload';
    workloadName.dispatchEvent(new window.Event('input'));

    expect(outputBox.textContent).toContain('name: my-custom-workload');
  });

  it('should switch tabs and update viewports', () => {
    const window = loadToolDom('../tools/kubernetes/index.html', '../src/js/generators/kubernetes-gen.js');
    const outputBox = window.document.getElementById('output-box');
    const mermaidContainer = window.document.getElementById('mermaid-container');
    const sandboxViewport = window.document.getElementById('sandbox-viewport');

    // Default deployment tab active
    expect(outputBox.classList.contains('hidden')).toBe(false);
    expect(mermaidContainer.classList.contains('hidden')).toBe(true);
    expect(sandboxViewport.classList.contains('hidden')).toBe(true);

    // Switch to Sandbox
    window.switchTab('sandbox');
    expect(outputBox.classList.contains('hidden')).toBe(true);
    expect(mermaidContainer.classList.contains('hidden')).toBe(true);
    expect(sandboxViewport.classList.contains('hidden')).toBe(false);

    // Switch to flow
    window.switchTab('flow');
    expect(outputBox.classList.contains('hidden')).toBe(true);
    expect(mermaidContainer.classList.contains('hidden')).toBe(false);
    expect(sandboxViewport.classList.contains('hidden')).toBe(true);
  });

  it('should deploy, inspect and clear 3D sandbox elements', () => {
    const window = loadToolDom('../tools/kubernetes/index.html', '../src/js/generators/kubernetes-gen.js');
    
    // Switch to sandbox tab
    window.switchTab('sandbox');
    const grid = window.document.getElementById('grid-3d');
    const inspector = window.document.getElementById('sandbox-inspector');

    // Add elements
    window.addSandboxElement('node');
    expect(grid.querySelectorAll('.cube-node').length).toBe(1);
    expect(inspector.textContent.toLowerCase()).toContain('node');

    window.addSandboxElement('pod');
    expect(grid.querySelectorAll('.cube-pod').length).toBe(1);
    expect(inspector.textContent.toLowerCase()).toContain('pod');

    // Clear sandbox
    window.clearSandbox();
    expect(grid.querySelectorAll('.cube-node').length).toBe(0);
    expect(grid.querySelectorAll('.cube-pod').length).toBe(0);
    expect(inspector.textContent.toLowerCase()).toContain('select an element');
  });
});
