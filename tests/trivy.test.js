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

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');

  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded to initialize scripts in JSDOM
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);

  return window;
}

describe('Trivy Security Studio', () => {
  it('should compile default CLI commands and change outputs on target change', () => {
    const window = loadToolDom('../tools/trivy/index.html', '../src/js/generators/trivy-gen.js');

    const targetType = window.document.getElementById('target_type');
    const targetPath = window.document.getElementById('target_path');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('trivy image');
    expect(outputBox.textContent).toContain('alpine:3.19');
    expect(outputBox.textContent).toContain('--ignore-unfixed');

    targetType.value = 'repo';
    targetPath.value = 'https://github.com/my/project';
    targetType.dispatchEvent(new window.Event('change'));
    targetPath.dispatchEvent(new window.Event('input'));

    expect(outputBox.textContent).toContain('trivy repo');
    expect(outputBox.textContent).toContain('https://github.com/my/project');
  });

  it('should switch tabs and update output content', () => {
    const window = loadToolDom('../tools/trivy/index.html', '../src/js/generators/trivy-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // config tab
    window.switchTab('config');
    expect(outputBox.textContent).toContain('scan:');
    expect(outputBox.textContent).toContain('scanners:');
    
    // Actions tab
    window.switchTab('actions');
    expect(outputBox.textContent).toContain('aquasecurity/trivy-action@master');

    // Ignore tab
    window.switchTab('ignore');
    expect(outputBox.textContent).toContain('CVE-2023-4911');
  });

  it('should simulate vulnerability scanning and filters findings based on severity', () => {
    const window = loadToolDom('../tools/trivy/index.html', '../src/js/generators/trivy-gen.js');

    const critCheckbox = window.document.getElementById('sev_critical');
    const highCheckbox = window.document.getElementById('sev_high');
    const medCheckbox = window.document.getElementById('sev_medium');
    const lowCheckbox = window.document.getElementById('sev_low');

    // Switch to simulator tab
    window.switchTab('simulator');

    const totalCount = window.document.getElementById('stat-total');

    // Default: crit = checked, high = checked, med = checked, low = unchecked, ignore-unfixed = checked
    // Findings under default options:
    // mockFindings = [
    //   { id: 'CVE-2023-4911', pkg: 'glibc', severity: 'CRITICAL', installed: '2.35-0ubuntu3.1', fixed: '2.35-0ubuntu3.4', title: 'Looney Tunables: Glibc dynamic loader buffer overflow.' },
    //   { id: 'CVE-2023-38545', pkg: 'curl', severity: 'HIGH', installed: '8.2.1', fixed: '8.4.0', title: 'SOCKS5 proxy connection heap buffer overflow.' },
    //   { id: 'CVE-2024-22195', pkg: 'jinja2', severity: 'MEDIUM', installed: '3.1.2', fixed: '3.1.3', title: 'HTML attribute injection leading to cross-site scripting.' },
    //   { id: 'CVE-2022-40897', pkg: 'setuptools', severity: 'LOW', installed: '65.5.0', fixed: '65.5.1', title: 'Regular expression denial of service via HTML parser.' },
    //   { id: 'CVE-2024-99999', pkg: 'libssl', severity: 'HIGH', installed: '1.1.1t', fixed: '', title: 'Unfixed buffer boundary vulnerability in memory allocations.' }
    // ]
    // Since ignoreUnfixed = checked (default), and low = unchecked (default):
    // CVE-2023-4911 (CRITICAL, fixed) -> match
    // CVE-2023-38545 (HIGH, fixed) -> match
    // CVE-2024-22195 (MEDIUM, fixed) -> match
    // CVE-2022-40897 (LOW, fixed) -> fail match (LOW unchecked)
    // CVE-2024-99999 (HIGH, fixed='') -> fail match (fixed is empty and ignoreUnfixed = checked)
    // So totalCount should be 3.
    expect(totalCount.textContent).toBe('3');

    // Turn off medium severity
    medCheckbox.checked = false;
    medCheckbox.dispatchEvent(new window.Event('change'));
    expect(totalCount.textContent).toBe('2'); // only CRITICAL & HIGH

    // Turn on low severity
    lowCheckbox.checked = true;
    lowCheckbox.dispatchEvent(new window.Event('change'));
    expect(totalCount.textContent).toBe('3'); // CRITICAL, HIGH, LOW

    // Uncheck ignore-unfixed
    const ignoreUnfixedCheckbox = window.document.getElementById('ignore_unfixed');
    ignoreUnfixedCheckbox.checked = false;
    ignoreUnfixedCheckbox.dispatchEvent(new window.Event('change'));
    // Now CVE-2024-99999 (HIGH, unfixed) should also show up.
    // Total should be: CRITICAL (CVE-2023-4911), HIGH (CVE-2023-38545), LOW (CVE-2022-40897), HIGH (CVE-2024-99999). Total = 4.
    expect(totalCount.textContent).toBe('4');
  });
});
