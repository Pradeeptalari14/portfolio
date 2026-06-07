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

describe('Docker Compose & LocalStack Dev Studio', () => {
  it('should compile default docker-compose services', () => {
    const window = loadToolDom('../tools/localstack-dev/index.html', '../src/js/generators/localstack-dev-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('container_name: localstack_sre');
    expect(outputBox.textContent).toContain('container_name: postgres_sre');
    expect(outputBox.textContent).toContain('container_name: redis_sre');
  });

  it('should compile bootstrap scripts with s3 buckets and DynamoDB tables', () => {
    const window = loadToolDom('../tools/localstack-dev/index.html', '../src/js/generators/localstack-dev-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const servicesSelect = window.document.getElementById('ls_services');
    servicesSelect.value = 's3_sqs_dynamo';
    servicesSelect.dispatchEvent(new window.Event('change'));

    window.switchTab('ls_sh');
    expect(outputBox.textContent).toContain('awslocal s3 mb s3://emulated-assets');
    expect(outputBox.textContent).toContain('awslocal dynamodb create-table');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/localstack-dev/index.html', '../src/js/generators/localstack-dev-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('docker-compose.yml');

    window.switchTab('ls_sh');
    expect(filenameInput.value).toBe('bootstrap-aws.sh');

    window.switchTab('ls_env');
    expect(filenameInput.value).toBe('.env');
  });
});
