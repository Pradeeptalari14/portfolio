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

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  // Remove ESM imports from JS code safely (only matches at the start of lines to avoid template literals)
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');

  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);

  return window;
}

describe('Falco Security Auditor', () => {
  it('should compile Falco rules and support terminal event logs injection', () => {
    const window = loadToolDom('../tools/falco-auditor/index.html', '../src/js/generators/falco-auditor-gen.js');

    const template = window.document.getElementById('rule_template');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('Terminal Shell Spawned in Container');

    template.value = 'bin_dir_write';
    template.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('Write Below Bin Directory');

    // Test simulator logs injection
    window.switchTab('simulator');
    const triggerBtn = window.document.getElementById('trigger_sim_btn');
    const terminalLogs = window.document.getElementById('terminal-logs');

    triggerBtn.dispatchEvent(new window.Event('click'));
    expect(terminalLogs.innerHTML).toContain('Terminal Shell Spawned in Container');
  });
});

describe('Alertmanager Routing Visualizer', () => {
  it('should compile Alertmanager routing lists and render routing graphs', () => {
    const window = loadToolDom('../tools/alertmanager-visualizer/index.html', '../src/js/generators/alertmanager-visualizer-gen.js');

    const defaultReceiver = window.document.getElementById('default_receiver');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('receiver: slack-all');

    defaultReceiver.value = 'email-team';
    defaultReceiver.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('receiver: email-team');

    // Verify SVG routing tree mapping is rendered
    window.switchTab('simulator');
    const svgContainer = window.document.getElementById('visualizer-svg-container');
    expect(svgContainer.innerHTML).toContain('<svg');
    expect(svgContainer.innerHTML).toContain('Alert Ingress');
  });
});

describe('eBPF Tracing Generator', () => {
  it('should compile eBPF filters and simulate tracing kprobes events', () => {
    const window = loadToolDom('../tools/ebpf-generator/index.html', '../src/js/generators/ebpf-generator-gen.js');

    const target = window.document.getElementById('trace_target');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kprobe__sys_enter_openat');

    target.value = 'sys_enter_execve';
    target.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('kprobe__sys_enter_execve');

    // Test trace events injection
    window.switchTab('simulator');
    const injectBtn = window.document.getElementById('inject_event_btn');
    const traceLogs = window.document.getElementById('trace-logs');

    injectBtn.dispatchEvent(new window.Event('click'));
    expect(traceLogs.innerHTML).toContain('sys_enter_execve');
  });
});
