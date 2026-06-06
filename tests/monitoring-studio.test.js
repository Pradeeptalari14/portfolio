import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  // Mock Mermaid and JSZip
  window.mermaid = {
    run: () => {}
  };
  window.JSZip = class {
    file() {}
    generateAsync() {
      return Promise.resolve(new Blob());
    }
  };

  window.setupCompilerTriggers = (compileCallback, excludeIds = ['download-name-input']) => {
    const inputs = window.document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!excludeIds.includes(input.id)) {
        input.addEventListener('input', compileCallback);
        input.addEventListener('change', compileCallback);
      }
    });
  };

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');

  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded to initialize scripts in JSDOM
  const event = new window.Event('DOMContentLoaded');
  window.dispatchEvent(event);

  return window;
}

describe('Advanced Monitoring Script Generator', () => {
  it('should initialize and compile default monitoring scripts', () => {
    const window = loadToolDom('../tools/monitoring/index.html', '../src/js/generators/monitoring-gen.js');
    expect(window.triggerCompileAll).toBeTypeOf('function');
    expect(window.switchTab).toBeTypeOf('function');

    window.switchTab('install');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('echo "⏱️ Starting SRE deployment of Prometheus Telemetry tools..."');

    window.switchTab('prometheus');
    expect(outputBox.textContent).toContain('job_name: "prometheus"');
  });

  it('should support switching to live dashboard and compiled dashboard json', () => {
    const window = loadToolDom('../tools/monitoring/index.html', '../src/js/generators/monitoring-gen.js');
    
    // Switch to dashboard tab
    window.switchTab('dashboard');
    
    const dashboardContainer = window.document.getElementById('dashboard-container');
    expect(dashboardContainer.classList.contains('hidden')).toBe(false);

    // Verify button structure
    const spikeCpuBtn = window.document.getElementById('btn-cpu-spike');
    expect(spikeCpuBtn).not.toBeNull();
  });
});
