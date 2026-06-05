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

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  // Remove ESM imports from JS code safely (only matches at the start of lines to avoid template literals)
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');

  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);

  return window;
}

describe('Dagger Pipelines Studio', () => {
  it('should compile pipeline files in Go and support visual DAG running', async () => {
    const window = loadToolDom('../tools/dagger-pipelines/index.html', '../src/js/generators/dagger-pipelines-gen.js');

    const sdk = window.document.getElementById('pipeline_sdk');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('package main');
    expect(outputBox.textContent).toContain('dagger.Connect');

    sdk.value = 'python';
    sdk.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('import dagger');

    // Run DAG and check node status class updates
    window.switchTab('simulator');
    const runBtn = window.document.getElementById('run_pipeline_btn');
    const nodeLint = window.document.getElementById('node-lint');

    runBtn.dispatchEvent(new window.Event('click'));
    expect(nodeLint.className).toContain('active');
  });
});

describe('Crossplane Cloud Studio', () => {
  it('should compile XRD definitions and render composition mappings', () => {
    const window = loadToolDom('../tools/crossplane-studio/index.html', '../src/js/generators/crossplane-studio-gen.js');

    const resource = window.document.getElementById('composite_resource');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('CompositePostgreSQL');

    resource.value = 's3_bucket';
    resource.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('CompositeBucket');

    // Check canvas visualizer map
    window.switchTab('simulator');
    const canvas = window.document.getElementById('visualizer-canvas-container');
    expect(canvas.innerHTML).toContain('<svg');
    expect(canvas.innerHTML).toContain('Bucket Claim');
  });
});

describe('Knative Serverless Studio', () => {
  it('should compile serverless specs and dynamically calculate scaling metric values', () => {
    const window = loadToolDom('../tools/knative-routing/index.html', '../src/js/generators/knative-routing-gen.js');

    const minScale = window.document.getElementById('min_scale');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('autoscaling.knative.dev/min-scale: "0"');

    minScale.value = '1';
    minScale.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('autoscaling.knative.dev/min-scale: "1"');

    // Test simulator scaling calculations
    window.switchTab('simulator');
    const rateSlider = window.document.getElementById('sim_request_rate');
    const podsVal = window.document.getElementById('sim-pods-val');

    rateSlider.value = '80'; // 80 requests/sec, with target concurrency of 10 requests/pod, should scale to 8 pods
    rateSlider.dispatchEvent(new window.Event('input'));

    expect(podsVal.textContent).toBe('8');
  });
});
