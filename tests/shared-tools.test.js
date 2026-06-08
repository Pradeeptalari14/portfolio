import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Shared Tools Utility', () => {
  it('should inject SRE health badge, PagerDuty UI, and webhooks tab', () => {
    const htmlPath = path.resolve(__dirname, '../tools/kubernetes/index.html');
    const htmlText = fs.readFileSync(htmlPath, 'utf8');
    
    // We construct JSDOM with a mocked localStorage and url context
    const dom = new JSDOM(htmlText, {
      runScripts: "dangerously",
      url: "http://localhost/tools/kubernetes/"
    });
    const window = dom.window;

    // Clear native localStorage
    window.localStorage.clear();

    // Load shared-tools.js
    const jsPath = path.resolve(__dirname, '../tools/shared-tools.js');
    const jsCode = fs.readFileSync(jsPath, 'utf8');
    window.eval(jsCode);

    // Manually dispatch DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(event);

    // 1. Verify SRE Health Badge is injected
    const badge = window.document.getElementById('sre-network-badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toContain('SRE: Online');

    // 2. Verify PagerDuty settings block is injected
    const pdBlock = window.document.getElementById('pagerduty-config-block');
    expect(pdBlock).not.toBeNull();
    const pdKey = window.document.getElementById('pd_integration_key');
    expect(pdKey).not.toBeNull();
    expect(pdKey.value).toBe('pd-service-key-prod-0129');

    // 3. Verify webhook tab button is injected
    const pdTab = window.document.getElementById('tab-webhooks');
    expect(pdTab).not.toBeNull();

    // 4. Test clicking the webhooks tab button
    pdTab.dispatchEvent(new window.Event('click'));
    expect(pdTab.className).toContain('active');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('"service": "kubernetes"');
    expect(outputBox.textContent).toContain('"integration_key": "pd-service-key-prod-0129"');
  });
});
