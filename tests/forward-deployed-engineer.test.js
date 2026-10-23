import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadFDEToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/forward-deployed-engineer/index.html');
  const htmlText = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  // Mock clipboard and Blob/URL APIs
  window.navigator.clipboard = {
    writeText: vi.fn().mockResolvedValue(undefined)
  };
  window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
  window.URL.revokeObjectURL = vi.fn();
  window.HTMLAnchorElement.prototype.click = vi.fn();

  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  if (fs.existsSync(corePath)) {
    const coreCode = fs.readFileSync(corePath, 'utf8');
    window.eval(coreCode);
  }

  const jsPath = path.resolve(__dirname, '../src/js/generators/forward-deployed-engineer-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Forward Deployed Engineer (FDE) AI Systems Studio', () => {
  it('should compile default active Python code and initialize telemetry HUD', () => {
    const window = loadFDEToolDom();
    const doc = window.document;

    expect(doc.title).toContain('Forward Deployed Engineer');
    const codeOutput = doc.getElementById('codeOutput');
    expect(codeOutput).not.toBeNull();
    expect(codeOutput.textContent).toContain('FDEEnterpriseAgent');
    expect(codeOutput.textContent).toContain('ClientTaskRequest');

    const metricCycle = doc.getElementById('metric-cycle');
    const metricSecurity = doc.getElementById('metric-security');
    const metricSuccess = doc.getElementById('metric-success');
    const metricRoi = doc.getElementById('metric-roi');

    expect(metricCycle.textContent).toBe('18 Days');
    expect(metricSecurity.textContent).toBe('100% Attested');
    expect(metricSuccess.textContent).toBe('94.8%');
    expect(metricRoi.textContent).toBe('$420,000');
  });

  it('should reactively recalculate HUD telemetry and code when parameters change', () => {
    const window = loadFDEToolDom();
    const doc = window.document;

    const industrySelect = doc.getElementById('industryType');
    const envSelect = doc.getElementById('deploymentEnv');
    const metricSuccess = doc.getElementById('metric-success');
    const metricRoi = doc.getElementById('metric-roi');
    const metricCycle = doc.getElementById('metric-cycle');
    const codeOutput = doc.getElementById('codeOutput');

    // Change to fintech
    industrySelect.value = 'fintech';
    industrySelect.dispatchEvent(new window.Event('change'));

    expect(metricSuccess.textContent).toBe('96.4%');
    expect(metricRoi.textContent).toBe('$540,000');
    expect(codeOutput.textContent).toContain('FINTECH');

    // Change to EKS-VPC
    envSelect.value = 'eks-vpc';
    envSelect.dispatchEvent(new window.Event('change'));
    expect(metricCycle.textContent).toBe('12 Days');
    expect(codeOutput.textContent).toContain('EKS-VPC');
  });

  it('should switch artifact tabs to TypeScript, Helm, Docker, Guardrails, Evals, and SOW', () => {
    const window = loadFDEToolDom();
    const doc = window.document;
    const codeOutput = doc.getElementById('codeOutput');

    const tabs = [
      { id: 'typescript', expected: 'FDEEnterpriseClient' },
      { id: 'manifest', expected: 'kind: Deployment' },
      { id: 'compose', expected: 'services:' },
      { id: 'guardrails', expected: 'OWASP' },
      { id: 'evals', expected: 'FDEAcceptanceBenchmark' },
      { id: 'sow', expected: 'Statement of Work' }
    ];

    for (const tab of tabs) {
      const tabBtn = doc.querySelector(`.tab-btn[data-tab="${tab.id}"]`);
      expect(tabBtn).not.toBeNull();
      tabBtn.click();
      expect(codeOutput.textContent).toContain(tab.expected);
      expect(tabBtn.classList.contains('active')).toBe(true);
    }
  });

  it('should handle terminal emulator interactions and commands', () => {
    const window = loadFDEToolDom();
    const doc = window.document;
    const terminalInput = doc.getElementById('terminal-input');
    const terminalViewport = doc.getElementById('terminal-viewport');

    // Run client discovery command via input keydown
    terminalInput.value = 'fde client-discover';
    terminalInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));

    expect(terminalViewport.textContent).toContain('FDE Client Discovery');
    expect(terminalViewport.textContent).toContain('bottleneck');

    // Run design architecture quick button
    const designBtn = doc.querySelector('.terminal-quick-btn[data-cmd="fde design-architecture"]');
    if (designBtn) {
      designBtn.click();
      expect(terminalViewport.textContent).toContain('ADR-042');
    }

    // Run airgap deploy quick button
    const deployBtn = doc.querySelector('.terminal-quick-btn[data-cmd="fde deploy-airgap"]');
    if (deployBtn) {
      deployBtn.click();
      expect(terminalViewport.textContent).toContain('Air-Gapped Private VPC');
    }

    // Run clear
    terminalInput.value = 'clear';
    terminalInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));
    expect(terminalViewport.textContent).toContain('Terminal cleared');
  });

  it('should trigger copy and download actions safely', () => {
    const window = loadFDEToolDom();
    const doc = window.document;

    const copyBtn = doc.getElementById('btn-copy-code');
    copyBtn.click();
    expect(window.navigator.clipboard.writeText).toHaveBeenCalled();

    const downloadBtn = doc.getElementById('btn-download-code');
    expect(() => downloadBtn.click()).not.toThrow();
  });
});
