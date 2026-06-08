import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  // Mock clipboard and navigation helper functions if they are called
  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  // Mock intervals to run asynchronously (solving temporal dead zone ReferenceError on `interval` variable)
  window.setInterval = (callback) => {
    setTimeout(() => {
      callback();
      callback();
      callback();
      callback();
    }, 0);
    return 1;
  };
  // Mock timeout to run synchronously once the interval runs
  window.setTimeout = (callback) => {
    callback();
    return 1;
  };
  window.clearInterval = () => {};

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
  // Inject stub for stripped ESM imports to prevent ReferenceError in JSDOM
  jsCode = 'const setupCompilerTriggers = () => {};\n' + jsCode;

  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded to initialize scripts in JSDOM
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);

  return window;
}

describe('Secret Management Studio & Scanner', () => {
  it('should switch tabs to the Secret Scanner viewport', () => {
    const window = loadToolDom('../tools/secrets/index.html', '../src/js/generators/secrets-gen.js');

    const scannerTab = window.document.getElementById('tab-scanner');
    const scannerViewport = window.document.getElementById('scanner-viewport');
    const outputBox = window.document.getElementById('output-box');

    expect(scannerViewport.classList.contains('hidden')).toBe(true);

    // Switch to scanner
    window.switchTab('scanner');
    expect(scannerTab.classList.contains('active')).toBe(true);
    expect(scannerViewport.classList.contains('hidden')).toBe(false);
    expect(outputBox.classList.contains('hidden')).toBe(true);
  });

  it('should load config template payload when selecting sample buttons', () => {
    const window = loadToolDom('../tools/secrets/index.html', '../src/js/generators/secrets-gen.js');
    window.switchTab('scanner');

    const scannerInput = window.document.getElementById('scanner-input');
    expect(scannerInput.value).toBe('');

    window.loadScannerSample('aws');
    expect(scannerInput.value).toContain('AWS_ACCESS_KEY_ID');

    window.loadScannerSample('clear');
    expect(scannerInput.value).toBe('');
  });

  it('should run scan and identify database connections and Slack webhooks', async () => {
    const window = loadToolDom('../tools/secrets/index.html', '../src/js/generators/secrets-gen.js');
    window.switchTab('scanner');

    window.loadScannerSample('slack');
    window.runSecretScan();

    // Wait for the async callbacks to finish executing
    await new Promise(resolve => setTimeout(resolve, 50));

    const totalFound = window.document.getElementById('scanner-stat-total');
    const statusBadge = window.document.getElementById('scanner-status-badge');
    const findingsList = window.document.getElementById('scan-findings-list');

    // slack template has slack webhook, postgres connection string, and private RSA key
    expect(totalFound.textContent).toBe('3');
    expect(statusBadge.textContent).toBe('FAIL - DANGER DETECTED');
    expect(findingsList.innerHTML).toContain('Database Connection String');
    expect(findingsList.innerHTML).toContain('Slack Incoming Webhook');
    expect(findingsList.innerHTML).toContain('Private Encryption Key');
  });

  it('should show PASS when scanning a clean code payload without credentials', async () => {
    const window = loadToolDom('../tools/secrets/index.html', '../src/js/generators/secrets-gen.js');
    window.switchTab('scanner');

    const scannerInput = window.document.getElementById('scanner-input');
    scannerInput.value = 'def my_clean_function(x):\n    return x + 42\n';
    
    window.runSecretScan();

    // Wait for the async callbacks to finish executing
    await new Promise(resolve => setTimeout(resolve, 50));

    const totalFound = window.document.getElementById('scanner-stat-total');
    const statusBadge = window.document.getElementById('scanner-status-badge');

    expect(totalFound.textContent).toBe('0');
    expect(statusBadge.textContent).toBe('PASS - SECURE SECRETS');
  });
});
