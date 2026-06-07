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

describe('GitHub Org Governance & CodeOwners Studio', () => {
  it('should compile default CODEOWNERS with correct teams', () => {
    const window = loadToolDom('../tools/github-gov/index.html', '../src/js/generators/github-gov-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('*       @talari-enterprise/sre-core');
    expect(outputBox.textContent).toContain('/infra/  @talari-enterprise/infra-admins');
  });

  it('should reflect input changes dynamically in CODEOWNERS', () => {
    const window = loadToolDom('../tools/github-gov/index.html', '../src/js/generators/github-gov-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const srcReviewersInput = window.document.getElementById('gov_codeowners_src');
    srcReviewersInput.value = '@my-org/core-devs';
    srcReviewersInput.dispatchEvent(new window.Event('input'));

    expect(outputBox.textContent).toContain('*       @my-org/core-devs');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/github-gov/index.html', '../src/js/generators/github-gov-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('CODEOWNERS');

    window.switchTab('gov_yaml');
    expect(filenameInput.value).toBe('compliance-gates.yml');

    window.switchTab('gov_json');
    expect(filenameInput.value).toBe('branch-rules.json');
  });
});
