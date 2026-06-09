import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Shared Tools Utility', () => {
  it('should inject SRE health badge, PagerDuty UI, and webhooks tab', async () => {
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

    // 5. Verify security.audit tab button is injected
    const linterTab = window.document.getElementById('tab-linter');
    expect(linterTab).not.toBeNull();

    // Mock window.switchTab to simulate caching lastCompiledCode
    if (typeof window.switchTab === 'function') {
      window.switchTab('script');
    }

    // 6. Test clicking security.audit tab button with clean output
    outputBox.textContent = 'resource "aws_security_group" "web" { ingress { cidr_blocks = ["10.0.0.0/16"] } }';
    if (typeof window.switchTab === 'function') {
      window.switchTab('script');
      // Wait for setTimeout to execute caching
      await new Promise(r => setTimeout(r, 100));
    }

    linterTab.dispatchEvent(new window.Event('click'));
    expect(linterTab.className).toContain('active');
    expect(outputBox.innerHTML).toContain('IaC Security Guardrail Report');
    expect(outputBox.innerHTML).toContain('Restrictive CIDR Blocks');
    expect(outputBox.innerHTML).toContain('PASSED');

    // 7. Test clicking linter with vulnerable configuration (Open CIDR 0.0.0.0/0)
    if (typeof window.switchTab === 'function') {
      window.switchTab('script');
    }
    outputBox.textContent = 'ingress { cidr_blocks = ["0.0.0.0/0"] }';
    if (typeof window.switchTab === 'function') {
      window.switchTab('script');
      await new Promise(r => setTimeout(r, 100));
    }

    linterTab.dispatchEvent(new window.Event('click'));
    expect(outputBox.innerHTML).toContain('Open CIDR Block (0.0.0.0/0)');
    expect(outputBox.innerHTML).toContain('CRITICAL');

    // 8. Verify Compliance Score Gauge
    const scoreVal = window.document.getElementById('compliance-score-val');
    expect(scoreVal).not.toBeNull();
    expect(scoreVal.textContent).toContain('70% (PARTIALLY COMPLIANT)');

    // 8.5 Test applying security patch auto-remediation
    const patchBtn = outputBox.querySelector('.btn-apply-remediation');
    expect(patchBtn).not.toBeNull();
    patchBtn.dispatchEvent(new window.Event('click'));
    await new Promise(r => setTimeout(r, 200));
    expect(window.document.getElementById('compliance-score-val').textContent).toContain('100%');

    // 9. Mock and Test JSZip Bundle Exporter
    let zipMockInstance = null;
    window.JSZip = class {
      constructor() {
        this.files = {};
        zipMockInstance = this;
      }
      file(name, content) {
        this.files[name] = content;
        return this;
      }
      folder(name) {
        return {
          file: (subName, content) => {
            this.files[`${name}/${subName}`] = content;
            return this;
          }
        };
      }
      generateAsync(opts) {
        return Promise.resolve({ type: 'blob' });
      }
    };
    if (!window.Blob) {
      window.Blob = class {
        constructor(parts, opts) {
          this.parts = parts;
          this.opts = opts;
        }
      };
    }

    const downloadBtn = window.document.getElementById('btn-download-sre-bundle-linter');
    expect(downloadBtn).not.toBeNull();

    // Trigger download
    downloadBtn.dispatchEvent(new window.Event('click'));
    
    // Allow promise resolution for JSZip generation
    await new Promise(r => setTimeout(r, 100));

    expect(zipMockInstance).not.toBeNull();
    expect(zipMockInstance.files['README.md']).toContain('SRE Onboarding & Deployment Guide');
    expect(zipMockInstance.files['scripts/validate.sh']).toContain('Running validation suite');
    expect(zipMockInstance.files['.gitignore']).toContain('SRE Bundle local cache');
  });
});
