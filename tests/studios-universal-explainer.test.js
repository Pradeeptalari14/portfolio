import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Universal Studio Explainer Engine (tools/shared-tools.js)', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Setup a clean studio DOM matching tools/docker/index.html or tools/local-cloud-dev/index.html
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><title>Test Studio</title></head>
      <body>
        <div class="tabs">
          <button id="tab-dockerfile" class="tab-btn active">Dockerfile</button>
          <button id="tab-flow" class="tab-btn">📊 Visual Flowchart</button>
          <button id="tab-cloud_sh" class="tab-btn">bootstrap-local.sh</button>
          <button id="tab-unknown" class="tab-btn">custom-spec.yaml</button>
        </div>
        <div class="actions">
          <button id="btn-explain" onclick="explainActiveTabCode()">🧠 Explain</button>
        </div>
        <pre id="output-box">version: '3.8'</pre>
        <div id="mermaid-container" class="hidden"></div>
      </body>
      </html>
    `;

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/tools/docker/index.html'
    });
    window = dom.window;
    document = window.document;

    // Load shared-tools.js into the DOM
    const sharedToolsPath = path.resolve(__dirname, '../tools/shared-tools.js');
    const sharedToolsCode = fs.readFileSync(sharedToolsPath, 'utf8');

    // Execute in window context
    const scriptEl = document.createElement('script');
    scriptEl.textContent = sharedToolsCode;
    document.body.appendChild(scriptEl);
  });

  it('should expose universalExplainActiveTab and closeExplanationDrawer on window', () => {
    expect(typeof window.universalExplainActiveTab).toBe('function');
    expect(typeof window.closeExplanationDrawer).toBe('function');
    expect(typeof window.explainActiveTabCode).toBe('function');
  });

  it('should dynamically inject #explanation-drawer if absent from page', () => {
    // Trigger explain
    window.universalExplainActiveTab('flow');

    const drawer = document.getElementById('explanation-drawer');
    expect(drawer).toBeTruthy();
    expect(drawer.classList.contains('translate-x-0')).toBe(true);
    expect(drawer.classList.contains('translate-x-full')).toBe(false);

    // Verify all content sections are present and populated
    expect(document.getElementById('drawer-title')?.textContent).toContain('Architecture Flowchart');
    expect(document.getElementById('drawer-filename')?.textContent).toContain('flow.mmd');
    expect(document.getElementById('explain-why')?.textContent).toBeTruthy();
    expect(document.getElementById('explain-when')?.textContent).toBeTruthy();
    expect(document.getElementById('explain-where')?.textContent).toBeTruthy();
    expect(document.getElementById('explain-command')?.textContent).toContain('mermaid');
    expect(document.getElementById('explain-practices')?.children.length).toBeGreaterThanOrEqual(1);
    expect(document.getElementById('explain-ai-mlops')?.textContent).toBeTruthy();
    expect(document.getElementById('explain-flow')?.textContent).toBeTruthy();
  });

  it('should generate accurate SRE explanations for visual flow, webhooks, linters, and bootstrap scripts', () => {
    // 1. Webhook
    window.universalExplainActiveTab('webhook');
    expect(document.getElementById('drawer-title')?.textContent).toContain('Webhook');
    expect(document.getElementById('drawer-filename')?.textContent).toBe('webhook-event.json');

    // 2. Linter
    window.universalExplainActiveTab('linter');
    expect(document.getElementById('drawer-title')?.textContent).toContain('Linter Guardrails');
    expect(document.getElementById('drawer-filename')?.textContent).toBe('.linter-rules.yaml');

    // 3. Bootstrap script
    window.universalExplainActiveTab('cloud_sh');
    expect(document.getElementById('drawer-title')?.textContent).toContain('Bootstrap');
    expect(document.getElementById('drawer-filename')?.textContent).toBe('bootstrap-local.sh');

    // 4. Unknown custom tab
    window.universalExplainActiveTab('unknown');
    expect(document.getElementById('drawer-title')?.textContent).toContain('UNKNOWN Specification');
    expect(document.getElementById('drawer-filename')?.textContent).toBe('unknown.yaml');
  });

  it('should close the drawer when closeExplanationDrawer() is called', () => {
    window.universalExplainActiveTab('flow');
    const drawer = document.getElementById('explanation-drawer');
    expect(drawer.classList.contains('translate-x-0')).toBe(true);

    window.closeExplanationDrawer();
    expect(drawer.classList.contains('translate-x-full')).toBe(true);
  });

  it('should intercept any toast mentioning "No explanation available" and display the rich drawer instead', async () => {
    // Simulate an element added by any legacy generator code
    const toast = document.createElement('div');
    toast.textContent = '⚠️ No explanation available for this tab.';
    document.body.appendChild(toast);

    // Wait for MutationObserver microtask to flush
    await new Promise(r => setTimeout(r, 20));

    // MutationObserver should remove the toast and open drawer
    expect(toast.parentNode).toBeNull();
    const drawer = document.getElementById('explanation-drawer');
    expect(drawer).toBeTruthy();
    expect(drawer.classList.contains('translate-x-0')).toBe(true);
  });
});
