import { describe, it, expect, beforeAll, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Global Directory Index Pages (tools/index.html)', () => {
  let dom;
  let window;
  let document;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../tools/index.html');
    let htmlText = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(htmlText, {
      url: 'http://localhost/tools/',
      runScripts: 'outside-only'
    });
    window = dom.window;
    document = window.document;

    window.print = vi.fn();
    window.alert = vi.fn();

    // Mock fetch for JSON templates
    const toolsJsonPath = path.resolve(__dirname, '../tools/tools.json');
    const toolsData = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));

    window.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('tools.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(toolsData)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });

    // Load tools/index.html script manually with injected toolsData
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (!script.src && script.textContent) {
        let executableCode = script.textContent.replace(
          /import\s+toolsData\s+from\s+['"]\.\/tools\.json['"];?/,
          `const toolsData = ${JSON.stringify(toolsData)};`
        );
        // Expose to window to allow manual execution
        executableCode = executableCode.replace('function initTopologyMap()', 'window.initTopologyMap = initTopologyMap; function initTopologyMap()');
        executableCode = executableCode.replace('function initSearchAutocomplete()', 'window.initSearchAutocomplete = initSearchAutocomplete; function initSearchAutocomplete()');
        try {
          window.eval(executableCode);
        } catch (err) {
          console.error('Failed executing index.html script in test:', err);
        }
      }
    });

    // Dispatch DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    window.dispatchEvent(event);
    window.document.dispatchEvent(event);

    // Call them explicitly to ensure listeners are bound
    if (typeof window.initTopologyMap === 'function') {
      window.initTopologyMap();
    }
    if (typeof window.initSearchAutocomplete === 'function') {
      window.initSearchAutocomplete();
    }
  });

  describe('1. Autocomplete Search Dropdown UI & Keys Navigation', () => {
    it('should show dropdown and highlight matches on search input', () => {
      const searchInput = document.getElementById('tools-search');
      const dropdown = document.getElementById('search-autocomplete-list');

      expect(searchInput).not.toBeNull();
      expect(dropdown).not.toBeNull();

      // Trigger input event
      searchInput.value = 'docker';
      searchInput.dispatchEvent(new window.Event('input'));

      // Dropdown should be visible
      expect(dropdown.classList.contains('active')).toBe(true);

      const items = dropdown.querySelectorAll('.autocomplete-item');
      expect(items.length).toBeGreaterThan(0);

      // Verify highlighting (either title or description has <mark>)
      const firstItemTitle = items[0].querySelector('.autocomplete-item-title').innerHTML;
      const firstItemDesc = items[0].querySelector('.autocomplete-item-desc').innerHTML;
      expect(firstItemTitle.includes('<mark>') || firstItemDesc.includes('<mark>')).toBe(true);
    });

    it('should support Arrow keys navigation and Enter selection', () => {
      const searchInput = document.getElementById('tools-search');
      const dropdown = document.getElementById('search-autocomplete-list');

      searchInput.value = 'docker';
      searchInput.dispatchEvent(new window.Event('input'));

      const items = dropdown.querySelectorAll('.autocomplete-item:not([style*="pointer-events: none"])');
      expect(items.length).toBeGreaterThan(0);

      // Arrow down keypress selects first item
      searchInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(items[0].classList.contains('selected')).toBe(true);

      // Arrow down keypress selects second item
      searchInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(items[1].classList.contains('selected')).toBe(true);
      expect(items[0].classList.contains('selected')).toBe(false);

      // Enter keypress on second item selects it
      searchInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));

      expect(searchInput.value).toBe(items[1].querySelector('.autocomplete-item-title').textContent.trim());
      expect(dropdown.classList.contains('active')).toBe(false);
    });

    it('should hide dropdown on Escape key', () => {
      const searchInput = document.getElementById('tools-search');
      const dropdown = document.getElementById('search-autocomplete-list');

      searchInput.value = 'docker';
      searchInput.dispatchEvent(new window.Event('input'));
      expect(dropdown.classList.contains('active')).toBe(true);

      searchInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
      expect(dropdown.classList.contains('active')).toBe(false);
    });
  });

  describe('2. Interactive Topology Map filtering', () => {
    it('should toggle topology stages and filter cards grid', () => {
      const nodes = document.querySelectorAll('.topology-node');
      expect(nodes.length).toBe(6);

      const codeNode = nodes[0];
      expect(codeNode.getAttribute('data-stage')).toBe('code');

      // Click to activate stage
      codeNode.click();
      expect(codeNode.classList.contains('active')).toBe(true);
      expect(window.activeTopologyStage).toBe('code');

      // Click again to deactivate stage
      codeNode.click();
      expect(codeNode.classList.contains('active')).toBe(false);
      expect(window.activeTopologyStage).toBe('all');
    });
  });
});

describe('Individual SRE Studio Pages (tools/kubernetes/index.html)', () => {
  let dom;
  let window;
  let document;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../tools/kubernetes/index.html');
    let htmlText = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(htmlText, {
      url: 'http://localhost/tools/kubernetes/',
      runScripts: 'outside-only'
    });
    window = dom.window;
    document = window.document;

    // Clear native localStorage
    window.localStorage.clear();

    window.print = vi.fn();
    window.alert = vi.fn();

    // Mock canvas context
    window.HTMLCanvasElement.prototype.getContext = () => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      fillRect: vi.fn(),
      createLinearGradient: () => ({
        addColorStop: vi.fn()
      })
    });

    // Mock clipboard API
    window.navigator.clipboard = {
      writeText: vi.fn().mockImplementation(() => Promise.resolve())
    };

    // Load shared-tools.js
    const jsPath = path.resolve(__dirname, '../tools/shared-tools.js');
    const jsCode = fs.readFileSync(jsPath, 'utf8');
    window.eval(jsCode);

    // Dispatch DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    window.dispatchEvent(event);
    window.document.dispatchEvent(event);
  });

  describe('3. Category-Specific "System Flow" Tab & Telemetry Simulation', () => {
    it('should inject tab, render flowchart SVG, and support cheatsheet print', () => {
      const flowTab = document.getElementById('tab-system-flow');
      expect(flowTab).not.toBeNull();

      // Click to open tab
      flowTab.click();
      expect(flowTab.className).toContain('active');

      const viewport = document.getElementById('system-flow-viewport');
      expect(viewport).not.toBeNull();
      expect(viewport.classList.contains('hidden')).toBe(false);

      // SVG structure should be present
      const svg = viewport.querySelector('svg');
      expect(svg).not.toBeNull();

      // Lifecycle instructions should be present
      expect(viewport.textContent).toContain('WHEN to Use');
      expect(viewport.textContent).toContain('WHERE to Deploy');

      // Print cheatsheet button
      const printBtn = document.getElementById('btn-print-cheatsheet');
      expect(printBtn).not.toBeNull();
      printBtn.click();
      expect(window.print).toHaveBeenCalled();
    });
  });

  describe('4. REST API Sandbox & Configuration Auditor Validation', () => {
    it('should validate JSON payload syntax correctly', () => {
      const sandboxTab = document.getElementById('tab-rest-sandbox');
      expect(sandboxTab).not.toBeNull();

      // Click REST Sandbox tab
      sandboxTab.click();

      const payloadTextarea = document.getElementById('sandbox-payload');
      const validateBtn = document.getElementById('btn-sandbox-validate');
      const statusSpan = document.getElementById('sandbox-json-status');

      expect(payloadTextarea).not.toBeNull();
      expect(validateBtn).not.toBeNull();

      // Set valid JSON payload
      payloadTextarea.value = '{"replicas": 3, "enable_tls": true}';
      validateBtn.click();
      expect(statusSpan.textContent).toContain('Valid JSON');

      // Set invalid JSON payload
      payloadTextarea.value = '{"replicas": 3, "enable_tls": ';
      validateBtn.click();
      expect(statusSpan.textContent).toContain('Invalid JSON');
    });

    it('should compare sandbox variables and report validation key differences', () => {
      const compareBtn = document.getElementById('btn-sandbox-compare');
      const payloadTextarea = document.getElementById('sandbox-payload');
      const auditResults = document.getElementById('sandbox-audit-results');
      const auditList = document.getElementById('sandbox-audit-list');

      // Setup compile environment variables in #output-box
      const outputBox = document.getElementById('output-box');
      expect(outputBox).not.toBeNull();
      outputBox.textContent = `
        replicas = 3
        port = 8080
        enable_tls = true
      `;

      // Payload mismatch (port different, missing enable_tls, extra db_host)
      payloadTextarea.value = JSON.stringify({
        "replicas": 3,
        "port": 9000,
        "db_host": "local"
      });

      compareBtn.click();

      expect(auditResults.classList.contains('hidden')).toBe(false);
      const auditText = auditList.innerHTML;

      expect(auditText).toContain('Matched: replicas');
      expect(auditText).toContain('Mismatch: port');
      expect(auditText).toContain('Missing key: enable_tls');
      expect(auditText).toContain('Extra sandbox key: db_host');
    });
  });

  describe('5. PagerDuty Outage Fire-Drills & GitOps Handshake Simulator', () => {
    it('should trigger GitOps push status progress timeline popup', () => {
      const pushBtn = document.getElementById('btn-gitops-push');
      expect(pushBtn).not.toBeNull();

      pushBtn.click();
      const syncPanel = document.getElementById('gitops-sync-panel');
      expect(syncPanel).not.toBeNull();

      // Check for progress steps
      expect(syncPanel.textContent).toContain('GitOps Pipeline Sync');
      expect(syncPanel.textContent).toContain('Initiating Git Push');
    });
  });
});
