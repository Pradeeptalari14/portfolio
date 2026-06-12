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

  // Mock Mermaid
  window.mermaid = {
    init: () => {},
    run: () => {},
    render: () => {}
  };

  // Load core-tool.js
  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  // Load the generator JS code
  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Docker Compose & Local Cloud Dev Studio', () => {
  it('should compile default docker-compose services with AWS emulator on custom 7-series port', () => {
    const window = loadToolDom('../tools/local-cloud-dev/index.html', '../src/js/generators/local-cloud-dev-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('container_name: local_aws_emulator');
    expect(outputBox.textContent).toContain('127.0.0.1:7090:4566');
    expect(outputBox.textContent).toContain('container_name: local_postgres_db');
    expect(outputBox.textContent).toContain('container_name: local_redis_cache');
  });

  it('should compile GCP and Azure emulators when checkboxes are enabled', () => {
    const window = loadToolDom('../tools/local-cloud-dev/index.html', '../src/js/generators/local-cloud-dev-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const gcpCheck = window.document.getElementById('cloud_gcp');
    const azureCheck = window.document.getElementById('cloud_azure');

    gcpCheck.checked = true;
    azureCheck.checked = true;

    gcpCheck.dispatchEvent(new window.Event('change'));
    azureCheck.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('container_name: local_gcp_emulator');
    expect(outputBox.textContent).toContain('127.0.0.1:7091:4588');
    expect(outputBox.textContent).toContain('container_name: local_azure_emulator');
    expect(outputBox.textContent).toContain('127.0.0.1:7092:4577');
  });

  it('should compile bootstrap scripts and set custom buckets and queues', () => {
    const window = loadToolDom('../tools/local-cloud-dev/index.html', '../src/js/generators/local-cloud-dev-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const bucketInput = window.document.getElementById('mock_bucket');
    const queueInput = window.document.getElementById('mock_queue');

    bucketInput.value = 'my-custom-test-bucket';
    queueInput.value = 'my-custom-test-queue';

    bucketInput.dispatchEvent(new window.Event('input'));
    queueInput.dispatchEvent(new window.Event('input'));

    window.switchTab('cloud_sh');
    expect(outputBox.textContent).toContain('aws --endpoint-url http://localhost:7090 s3 mb s3://my-custom-test-bucket');
    expect(outputBox.textContent).toContain('aws --endpoint-url http://localhost:7090 sqs create-queue --queue-name my-custom-test-queue');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/local-cloud-dev/index.html', '../src/js/generators/local-cloud-dev-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('docker-compose.yml');

    window.switchTab('cloud_sh');
    expect(filenameInput.value).toBe('bootstrap-local.sh');

    window.switchTab('cloud_env');
    expect(filenameInput.value).toBe('.env');

    window.switchTab('cloud_help');
    expect(filenameInput.value).toBe('compliance_guide.txt');
  });
});
