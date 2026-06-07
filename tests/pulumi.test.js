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

  // Mock SreCore setupStudioTabs / window.SreCore
  window.SreCore = {
    setupStudioTabs: (tabs, defaultTab, elements, tabSwitchCallback) => {
      window.switchTab = (tabId) => {
        tabSwitchCallback(tabId);
      };
    }
  };

  // Mock window.setupCompilerTriggers
  window.setupCompilerTriggers = (compileCallback) => {
    // Immediate callback setup
  };

  // Load core-tool.js if exists, but we mock setupStudioTabs above
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

describe('Pulumi Infrastructure Studio', () => {
  it('should compile default Pulumi.yaml settings', () => {
    const window = loadToolDom('../tools/pulumi/index.html', '../src/js/generators/pulumi-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('name: sre-infrastructure');
    expect(outputBox.textContent).toContain('runtime: nodejs');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/pulumi/index.html', '../src/js/generators/pulumi-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');
    const extTag = window.document.getElementById('file-extension-tag');

    expect(filenameInput.value).toBe('Pulumi');
    expect(extTag.textContent).toBe('.yaml');

    window.switchTab('program_code');
    expect(filenameInput.value).toBe('index');
    expect(extTag.textContent).toBe('.ts');

    window.switchTab('stack_config');
    expect(filenameInput.value).toBe('Pulumi.dev');
    expect(extTag.textContent).toBe('.yaml');
  });

  it('should switch runtime language and update file extensions', () => {
    const window = loadToolDom('../tools/pulumi/index.html', '../src/js/generators/pulumi-gen.js');
    const languageSelect = window.document.getElementById('language');
    const filenameInput = window.document.getElementById('download-name-input');
    const extTag = window.document.getElementById('file-extension-tag');

    languageSelect.value = 'python';
    languageSelect.dispatchEvent(new window.Event('change'));
    window.triggerCompileAll();

    window.switchTab('program_code');
    expect(filenameInput.value).toBe('__main__');
    expect(extTag.textContent).toBe('.py');
  });
});
