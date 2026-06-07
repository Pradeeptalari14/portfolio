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

describe('Hugging Face & GitLFS Sync Studio', () => {
  it('should compile default sync-model.sh configuration', () => {
    const window = loadToolDom('../tools/modelops-gitops/index.html', '../src/js/generators/modelops-gitops-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('MODEL_REPO="${MODEL_REPO:-microsoft/Phi-3-mini-4k-instruct}"');
    expect(outputBox.textContent).toContain('TARGET_DIR="${TARGET_DIR:-/models/phi3}"');
    expect(outputBox.textContent).toContain('export GIT_LFS_SKIP_SMUDGE=1');
  });

  it('should compile model-volume.yaml PVC manifests', () => {
    const window = loadToolDom('../tools/modelops-gitops/index.html', '../src/js/generators/modelops-gitops-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('modelops_yaml');
    expect(outputBox.textContent).toContain('kind: PersistentVolumeClaim');
    expect(outputBox.textContent).toContain('name: model-weights-pvc');
    expect(outputBox.textContent).toContain('image: vllm/vllm-openai:latest');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/modelops-gitops/index.html', '../src/js/generators/modelops-gitops-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('sync-model.sh');

    window.switchTab('modelops_yaml');
    expect(filenameInput.value).toBe('model-volume.yaml');
  });
});
