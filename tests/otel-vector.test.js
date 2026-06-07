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
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');

  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);

  return window;
}

describe('OpenTelemetry Collector Configurator Studio', () => {
  it('should compile default configuration parameters and handle additions', () => {
    const window = loadToolDom('../tools/otel-configurator/index.html', '../src/js/generators/otel-configurator-gen.js');

    const recHost = window.document.getElementById('rec_host');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('receivers:');
    expect(outputBox.textContent).toContain('otlp:');
    expect(outputBox.textContent).not.toContain('hostmetrics:');

    recHost.checked = true;
    recHost.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('hostmetrics:');
    expect(outputBox.textContent).toContain('collection_interval: 30s');
  });

  it('should switch tabs and verify deployment yaml and verification commands', () => {
    const window = loadToolDom('../tools/otel-configurator/index.html', '../src/js/generators/otel-configurator-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('deployment');
    expect(outputBox.textContent).toContain('kind: Deployment');
    expect(outputBox.textContent).toContain('image: otel/opentelemetry-collector-contrib');

    window.switchTab('cli');
    expect(outputBox.textContent).toContain('kubectl create configmap otel-collector-config');
  });

  it('should simulate telemetry trace packet flow debugging logs', async () => {
    const window = loadToolDom('../tools/otel-configurator/index.html', '../src/js/generators/otel-configurator-gen.js');

    window.switchTab('simulator');

    const simTraceType = window.document.getElementById('sim_trace_type');
    const btnSendTrace = window.document.getElementById('btn_send_trace');
    const debugLogs = window.document.getElementById('debug-logs-output');

    simTraceType.value = '500';
    simTraceType.dispatchEvent(new window.Event('change'));
    btnSendTrace.dispatchEvent(new window.Event('click'));

    // Wait a brief tick for the recursive promise timeline callbacks to run
    await new Promise(resolve => setTimeout(resolve, 4000));

    expect(debugLogs.textContent).toContain('RECEIVER: Payload matched OTLP gRPC endpoint.');
    expect(debugLogs.textContent).toContain('EXPORTER: Logged error status trace');
  });
});

describe('Vector Log Pipeline Studio', () => {
  it('should compile default TOML configurations and remapping filters', () => {
    const window = loadToolDom('../tools/vector-pipeline/index.html', '../src/js/generators/vector-pipeline-gen.js');

    const transformRegex = window.document.getElementById('trans_regex');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('[api]');
    expect(outputBox.textContent).toContain('[sources.syslog_in]');
    expect(outputBox.textContent).not.toContain('[transforms.regex_extract]');

    transformRegex.checked = true;
    transformRegex.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('[transforms.regex_extract]');
    expect(outputBox.textContent).toContain('parse_regex(.message');
  });

  it('should switch tabs and verify kubernetes agent daemonset spec', () => {
    const window = loadToolDom('../tools/vector-pipeline/index.html', '../src/js/generators/vector-pipeline-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('daemonset');
    expect(outputBox.textContent).toContain('kind: DaemonSet');
    expect(outputBox.textContent).toContain('image: timberio/vector');
  });

  it('should simulate log remap parsing and anonymize raw IPs', async () => {
    const window = loadToolDom('../tools/vector-pipeline/index.html', '../src/js/generators/vector-pipeline-gen.js');

    window.switchTab('simulator');

    const rawLogInput = window.document.getElementById('raw-log-input');
    const btnRemap = window.document.getElementById('btn_run_remap');
    const parsedOutput = window.document.getElementById('parsed-json-output');

    rawLogInput.value = `{"client_ip": "10.0.0.1", "message": "hello"}`;
    rawLogInput.dispatchEvent(new window.Event('input'));
    btnRemap.dispatchEvent(new window.Event('click'));

    // Wait a brief tick for the simulator timer callback
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(parsedOutput.textContent).toContain('"client_ip": "10.0.0.xxx"');
  });
});
