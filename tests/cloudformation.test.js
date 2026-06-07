import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  // Mock clipboard API
  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  // Evaluate core-tool.js first
  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  // Evaluate generator script
  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  // Trigger DOMContentLoaded manually
  const event = new window.Event('DOMContentLoaded');
  window.dispatchEvent(event);
  window.document.dispatchEvent(event);

  return window;
}

describe('AWS CloudFormation Studio', () => {
  it('should compile default VPC stack templates successfully', () => {
    const window = loadToolDom('../tools/cloudformation/index.html', '../src/js/generators/cloudformation-gen.js');

    const stackType = window.document.getElementById('cf_stack_type');
    const outputBox = window.document.getElementById('output-box');

    // Default stack should be vpc-base
    expect(stackType.value).toBe('vpc-base');
    expect(outputBox.textContent).toContain('AWS::EC2::VPC');
    expect(outputBox.textContent).toContain('VPCGatewayAttachment');

    // Change environment
    const env = window.document.getElementById('cf_env');
    env.value = 'development';
    env.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('Default: development');
  });

  it('should switch tabs and update output content', () => {
    const window = loadToolDom('../tools/cloudformation/index.html', '../src/js/generators/cloudformation-gen.js');
    const outputBox = window.document.getElementById('output-box');
    const downloadInput = window.document.getElementById('download-name-input');

    // Default tab should be YAML template
    expect(downloadInput.value).toBe('template.yaml');

    // Switch to JSON template
    window.switchTab('cf_json');
    expect(downloadInput.value).toBe('template.json');
    expect(outputBox.textContent).toContain('"Type": "AWS::EC2::VPC"');

    // Switch to deploy script
    window.switchTab('cf_deploy');
    expect(downloadInput.value).toBe('deploy.sh');
    expect(outputBox.textContent).toContain('aws cloudformation deploy');
  });

  it('should toggle security settings and update template outputs', () => {
    const window = loadToolDom('../tools/cloudformation/index.html', '../src/js/generators/cloudformation-gen.js');
    const stackType = window.document.getElementById('cf_stack_type');
    const outputBox = window.document.getElementById('output-box');

    // Switch to S3 bucket stack
    stackType.value = 's3-bucket';
    stackType.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('AWS::S3::Bucket');
    expect(outputBox.textContent).toContain('BucketEncryption');

    // Disable KMS Key toggle
    const kmsToggle = window.document.getElementById('cf_sec_kms');
    kmsToggle.checked = false;
    kmsToggle.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).not.toContain('BucketEncryption');
    expect(outputBox.textContent).not.toContain('KMSKey');
  });
});
