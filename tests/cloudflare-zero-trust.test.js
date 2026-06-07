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

describe('Cloudflare Zero Trust & Tunneling Studio', () => {
  it('should compile default tunnel configurations in config.yml', () => {
    const window = loadToolDom('../tools/cloudflare-zero-trust/index.html', '../src/js/generators/cloudflare-zero-trust-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('hostname: sre.talari.com');
    expect(outputBox.textContent).toContain('service: http://localhost:8080');
  });

  it('should compile access policies with domains and MFA conditions', () => {
    const window = loadToolDom('../tools/cloudflare-zero-trust/index.html', '../src/js/generators/cloudflare-zero-trust-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('cf_json');
    const policy = JSON.parse(outputBox.textContent);
    expect(policy.name).toBe('Access Rules for sre.talari.com');
    expect(policy.rules.include[0].email_domain.domain).toBe('talari.com');
  });

  it('should switch tabs and update output filename', () => {
    const window = loadToolDom('../tools/cloudflare-zero-trust/index.html', '../src/js/generators/cloudflare-zero-trust-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('config.yml');

    window.switchTab('cf_sh');
    expect(filenameInput.value).toBe('cloudflared-service.sh');

    window.switchTab('cf_json');
    expect(filenameInput.value).toBe('access-policy.json');
  });
});
