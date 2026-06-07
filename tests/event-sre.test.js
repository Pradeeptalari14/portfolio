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

describe('AWS Event-Driven & Messaging SRE Studio', () => {
  it('should compile default EventBridge rules', () => {
    const window = loadToolDom('../tools/event-sre/index.html', '../src/js/generators/event-sre-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('AllowEventBridgeToQueue');
    expect(outputBox.textContent).toContain('arn:aws:sqs:us-east-1:123456789012:payment-processing-queue');
  });

  it('should adapt configurations for SQS broker client', () => {
    const window = loadToolDom('../tools/event-sre/index.html', '../src/js/generators/event-sre-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const brokerSelect = window.document.getElementById('ev_broker');
    brokerSelect.value = 'sqs';
    brokerSelect.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('AllowOwnerAccessOnly');

    window.switchTab('ev_eb');
    expect(outputBox.textContent).toContain('"QueueName": "payment-processing-queue"');
  });

  it('should update simulation commands depending on targets', () => {
    const window = loadToolDom('../tools/event-sre/index.html', '../src/js/generators/event-sre-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('ev_simulate');
    expect(outputBox.textContent).toContain('aws events put-events');

    const brokerSelect = window.document.getElementById('ev_broker');
    brokerSelect.value = 'sns';
    brokerSelect.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('aws sns publish');
  });

  it('should switch tabs and update output filename', () => {
    const window = loadToolDom('../tools/event-sre/index.html', '../src/js/generators/event-sre-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('sqs-policy.json');

    window.switchTab('ev_simulate');
    expect(filenameInput.value).toBe('simulate-payload.sh');
  });
});
