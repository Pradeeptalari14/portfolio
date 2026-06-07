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

describe('Maven Build Studio', () => {
  it('should compile default Maven pom.xml parameters', () => {
    const window = loadToolDom('../tools/maven/index.html', '../src/js/generators/maven-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('<groupId>com.talari.sre</groupId>');
    expect(outputBox.textContent).toContain('<artifactId>payment-api</artifactId>');
    expect(outputBox.textContent).toContain('<version>1.0.0-SNAPSHOT</version>');
  });

  it('should reflect coordinate updates dynamically in XML outputs', () => {
    const window = loadToolDom('../tools/maven/index.html', '../src/js/generators/maven-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const groupInput = window.document.getElementById('mv_group');
    groupInput.value = 'org.custom.devops';
    groupInput.dispatchEvent(new window.Event('input'));

    expect(outputBox.textContent).toContain('<groupId>org.custom.devops</groupId>');
  });

  it('should toggle plugins (JaCoCo, SpotBugs, OWASP) depending on selections', () => {
    const window = loadToolDom('../tools/maven/index.html', '../src/js/generators/maven-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('jacoco-maven-plugin');
    expect(outputBox.textContent).toContain('spotbugs-maven-plugin');
    expect(outputBox.textContent).toContain('dependency-check-maven');

    const jacocoCheckbox = window.document.getElementById('mv_jacoco');
    jacocoCheckbox.checked = false;
    jacocoCheckbox.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).not.toContain('jacoco-maven-plugin');
  });

  it('should switch tabs and update filename and active states', () => {
    const window = loadToolDom('../tools/maven/index.html', '../src/js/generators/maven-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('pom.xml');

    window.switchTab('mv_settings');
    expect(filenameInput.value).toBe('settings.xml');

    window.switchTab('mv_build');
    expect(filenameInput.value).toBe('build.sh');
  });
});
