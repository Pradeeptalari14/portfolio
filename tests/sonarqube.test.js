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

describe('SonarQube Quality Gate Studio', () => {
  it('should compile default Sonar project properties', () => {
    const window = loadToolDom('../tools/sonarqube/index.html', '../src/js/generators/sonarqube-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('sonar.projectKey=payment-api');
    expect(outputBox.textContent).toContain('sonar.projectName=Payment API');
    expect(outputBox.textContent).toContain('sonar.sources=src');
  });

  it('should propagate gate limits to sonar-rules.json', () => {
    const window = loadToolDom('../tools/sonarqube/index.html', '../src/js/generators/sonarqube-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const covGate = window.document.getElementById('sq_coverage_gate');
    covGate.value = '90';
    covGate.dispatchEvent(new window.Event('input'));

    window.switchTab('sq_rules');
    expect(outputBox.textContent).toContain('"metric": "new_coverage"');
    expect(outputBox.textContent).toContain('"error": "90"');
  });

  it('should switch tabs and update scanner runtime commands', () => {
    const window = loadToolDom('../tools/sonarqube/index.html', '../src/js/generators/sonarqube-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');
    const outputBox = window.document.getElementById('output-box');

    expect(filenameInput.value).toBe('sonar-project.properties');

    window.switchTab('sq_scan');
    expect(filenameInput.value).toBe('scan.sh');
    expect(outputBox.textContent).toContain('sonar-scanner');
    expect(outputBox.textContent).toContain('-Dsonar.projectKey=payment-api');
  });
});
