import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  // Mock clipboard API
  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  // Evaluate core-tool.js first
  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  // Evaluate generator script
  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  // Trigger DOMContentLoaded manually
  const event = new window.Event('DOMContentLoaded');
  window.dispatchEvent(event);
  window.document.dispatchEvent(event);

  return window;
}

describe('Bitbucket Pipelines Studio', () => {
  it('should compile default Java Maven pipeline configuration', () => {
    const window = loadToolDom('../tools/bitbucket/index.html', '../src/js/generators/bitbucket-gen.js');

    const stack = window.document.getElementById('bb_stack');
    const outputBox = window.document.getElementById('output-box');

    // Default configuration checking
    expect(stack.value).toBe('java-maven');
    expect(outputBox.textContent).toContain('image: maven:3.8-openjdk-17-slim');
    expect(outputBox.textContent).toContain('mvn clean test');
    expect(outputBox.textContent).toContain('caches:');
    expect(outputBox.textContent).toContain('- maven');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/bitbucket/index.html', '../src/js/generators/bitbucket-gen.js');
    const downloadInput = window.document.getElementById('download-name-input');
    const outputBox = window.document.getElementById('output-box');

    expect(downloadInput.value).toBe('bitbucket-pipelines.yml');

    // Switch to step script
    window.switchTab('bb_steps');
    expect(downloadInput.value).toBe('pipeline-steps.sh');
    expect(outputBox.textContent).toContain('mvn clean compile');
  });

  it('should toggle options and change pipeline outputs', () => {
    const window = loadToolDom('../tools/bitbucket/index.html', '../src/js/generators/bitbucket-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // Default should contain SonarQube scan and Trivy scan and deploy
    expect(outputBox.textContent).toContain('aquasecurity/trivy-pipe');
    expect(outputBox.textContent).toContain('sonarsource/sonarcloud-scan');
    expect(outputBox.textContent).toContain('atlassian/aws-ecs-deploy');

    // Disable Trivy scan
    const trivyToggle = window.document.getElementById('bb_trivy');
    trivyToggle.checked = false;
    trivyToggle.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).not.toContain('aquasecurity/trivy-pipe');
    expect(outputBox.textContent).toContain('sonarsource/sonarcloud-scan');

    // Disable SonarQube analysis
    const sonarToggle = window.document.getElementById('bb_sonar');
    sonarToggle.checked = false;
    sonarToggle.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).not.toContain('sonarsource/sonarcloud-scan');
  });
});
