import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/kuberay/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/kuberay-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

function setSelect(window, id, value) {
  const el = window.document.getElementById(id);
  el.value = value;
  el.dispatchEvent(new window.Event('change'));
}

describe('KubeRay Operator Studio', () => {
  it('should compile a default RayCluster manifest and initialize HUD', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('KubeRay Operator Studio');
    expect(code).toContain('apiVersion: ray.io/v1');
    expect(code).toContain('kind: RayCluster');
    expect(code).toContain('enableInTreeAutoscaling: true');
    expect(code).toContain('maxReplicas: 8');
    expect(code).toContain('nvidia.com/gpu: 1');
    expect(window.document.getElementById('metric-workers').textContent).toBe('1 → 8');
  });

  it('should never emit floating :latest image tags', () => {
    const window = loadToolDom();
    ['RayCluster', 'RayJob', 'RayService'].forEach(kind => {
      setSelect(window, 'crdKind', kind);
      const code = window.document.getElementById('codeOutput').textContent;
      expect(code).not.toMatch(/image: \S+:latest/);
    });
  });

  it('should generate a RayJob with automatic teardown', () => {
    const window = loadToolDom();
    setSelect(window, 'crdKind', 'RayJob');
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('kind: RayJob');
    expect(code).toContain('shutdownAfterJobFinishes: true');
    expect(code).toContain('rayClusterSpec:');
  });

  it('should generate a RayService with blue/green upgrade strategy', () => {
    const window = loadToolDom();
    setSelect(window, 'crdKind', 'RayService');
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('kind: RayService');
    expect(code).toContain('type: NewCluster');
    expect(code).toContain('serveConfigV2:');
    expect(code).toContain('containerPort: 8000');
  });

  it('should toggle GCS fault tolerance and CPU profile', () => {
    const window = loadToolDom();
    setSelect(window, 'gcsFaultTolerance', 'none');
    setSelect(window, 'workerProfile', 'cpu');
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).not.toContain('gcsFaultToleranceOptions');
    expect(code).not.toContain('nvidia.com/gpu');
    expect(window.document.getElementById('metric-recovery').textContent).toBe('State lost');
    expect(window.document.getElementById('metric-gpus').textContent).toBe('0 (CPU only)');
  });

  it('should update HUD when max replicas change', () => {
    const window = loadToolDom();
    setSelect(window, 'maxReplicas', '16');
    expect(window.document.getElementById('metric-workers').textContent).toBe('1 → 16');
    expect(window.document.getElementById('metric-gpus').textContent).toBe('16 × A100');
    expect(window.document.getElementById('metric-savings').textContent).toBe('-94%');
  });

  it('should switch tabs and render the Helm install script', () => {
    const window = loadToolDom();
    window.document.querySelector('.tab-btn[data-tab="helm"]').click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('helm upgrade --install kuberay-operator kuberay/kuberay-operator');
  });
});
