import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Go SRE Utility Studio Compiler', () => {
  let dom;
  let window;

  beforeAll(() => {
    // Read the index.html file
    const filePath = path.resolve(__dirname, '../tools/go-utility/index.html');
    const htmlText = fs.readFileSync(filePath, 'utf8');

    // Create JSDOM instance with script execution enabled
    dom = new JSDOM(htmlText, {
      runScripts: "dangerously"
    });
    window = dom.window;

    // Mock window.mermaid to prevent errors during dynamic rendering
    window.mermaid = {
      run: () => {}
    };

    // Load and evaluate go-utility-gen.js manually in JSDOM context
    const jsPath = path.resolve(__dirname, '../src/js/generators/go-utility-gen.js');
    let jsCode = fs.readFileSync(jsPath, 'utf8');
    
    // Remove ES6 import statements so window.eval compiles it as a classic script
    jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
    
    window.eval(jsCode);

    // Ensure the compiler has finished initial compile
    if (typeof window.triggerCompileAll === 'function') {
      window.triggerCompileAll();
    }
  });

  it('should initialize and compile default Concurrent HTTP Pinger script', () => {
    expect(window.triggerCompileAll).toBeTypeOf('function');
    expect(window.switchTab).toBeTypeOf('function');

    // Ensure we are viewing the script tab
    window.switchTab('script');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox).not.toBeNull();
    
    const script = outputBox.textContent;
    expect(script).toContain('Initializing Go SRE Parallel Pinger daemon');
    expect(script).toContain('concurrencyLimit := 5');
    expect(script).toContain('requestTimeout := 5 * time.Second');
  });

  it('should update compilation when script purpose is changed to log parser', () => {
    const select = window.document.getElementById('script_purpose');
    expect(select).not.toBeNull();

    select.value = 'log_parser';
    select.dispatchEvent(new window.Event('change'));
    window.switchTab('script');

    const script = window.document.getElementById('output-box').textContent;
    expect(script).toContain('Starting SRE Log Parsing Engine daemon');
    expect(script).toContain('bufio.NewScanner(file)');
    expect(script).not.toContain('concurrencyLimit :=');
  });

  it('should update compilation when script purpose is changed to Kubernetes pod watcher', () => {
    const select = window.document.getElementById('script_purpose');
    expect(select).not.toBeNull();

    select.value = 'pod_watcher';
    select.dispatchEvent(new window.Event('change'));
    window.switchTab('script');

    const script = window.document.getElementById('output-box').textContent;
    expect(script).toContain('Initializing client-go SDK integration');
    expect(script).toContain('k8s.io/client-go/kubernetes');
  });

  it('should update compilation when script purpose is changed to metrics exporter', () => {
    const select = window.document.getElementById('script_purpose');
    expect(select).not.toBeNull();

    select.value = 'metrics_exporter';
    select.dispatchEvent(new window.Event('change'));
    window.switchTab('script');

    const script = window.document.getElementById('output-box').textContent;
    expect(script).toContain('Starting Prometheus Metrics Server');
    expect(script).toContain('http.HandleFunc("/metrics"');
  });

  it('should respect the structured logging toggle', () => {
    const select = window.document.getElementById('script_purpose');
    select.value = 'concurrent_pinger';
    select.dispatchEvent(new window.Event('change'));

    const checkbox = window.document.getElementById('go_structured_logging');
    expect(checkbox).not.toBeNull();

    // Disable structured logs
    checkbox.checked = false;
    checkbox.dispatchEvent(new window.Event('change'));
    window.switchTab('script');
    expect(window.document.getElementById('output-box').textContent).not.toContain('log/slog');
    expect(window.document.getElementById('output-box').textContent).toContain('"log"');

    // Enable structured logs
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change'));
    window.switchTab('script');
    expect(window.document.getElementById('output-box').textContent).toContain('log/slog');
  });

  it('should respect the panic recovery toggle', () => {
    const select = window.document.getElementById('script_purpose');
    select.value = 'concurrent_pinger';
    select.dispatchEvent(new window.Event('change'));

    const checkbox = window.document.getElementById('go_panic_recover');
    expect(checkbox).not.toBeNull();

    // Disable panic recovery
    checkbox.checked = false;
    checkbox.dispatchEvent(new window.Event('change'));
    window.switchTab('script');
    expect(window.document.getElementById('output-box').textContent).not.toContain('defer func()');

    // Enable panic recovery
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change'));
    window.switchTab('script');
    expect(window.document.getElementById('output-box').textContent).toContain('defer func()');
  });
});
