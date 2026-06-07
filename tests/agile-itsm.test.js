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

describe('Agile & ITSM Studio', () => {
  it('should compile default Jira payload', () => {
    const window = loadToolDom('../tools/agile-itsm/index.html', '../src/js/generators/agile-itsm-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const payload = JSON.parse(outputBox.textContent);
    expect(payload.fields.project.key).toBe('SRE-OPS');
    expect(payload.fields.summary).toBe('Deployment Ticket: payment-gateway-service (P3)');
  });

  it('should compile ServiceNow request and respect CAB review requirements', () => {
    const window = loadToolDom('../tools/agile-itsm/index.html', '../src/js/generators/agile-itsm-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // Switch CAB off
    const cabCheckbox = window.document.getElementById('itsm_cab_review');
    cabCheckbox.checked = false;
    cabCheckbox.dispatchEvent(new window.Event('change'));

    window.switchTab('itsm_snow');
    const payload = JSON.parse(outputBox.textContent);
    expect(payload.change_request.u_cab_approval).toBe('not_required');
  });

  it('should generate PagerDuty python incident triggers', () => {
    const window = loadToolDom('../tools/agile-itsm/index.html', '../src/js/generators/agile-itsm-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('itsm_python');
    expect(outputBox.textContent).toContain('routing_key = "pd-service-payment-gate"');
    expect(outputBox.textContent).toContain('urllib.request.urlopen');
  });

  it('should switch tabs and update output filename', () => {
    const window = loadToolDom('../tools/agile-itsm/index.html', '../src/js/generators/agile-itsm-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('jira-payload.json');

    window.switchTab('itsm_snow');
    expect(filenameInput.value).toBe('servicenow-change.json');

    window.switchTab('itsm_python');
    expect(filenameInput.value).toBe('trigger-incident.py');
  });
});
