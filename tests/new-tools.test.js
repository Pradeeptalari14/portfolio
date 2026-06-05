import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  // Mock Mermaid
  window.mermaid = {
    init: () => {},
    render: () => {}
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

describe('Systemd Service Builder', () => {
  it('should compile systemd units and simulate commands', () => {
    const window = loadToolDom('../tools/systemd-builder/index.html', '../src/js/generators/systemd-builder-gen.js');

    const descInput = window.document.getElementById('unit_desc');
    const outputBox = window.document.getElementById('output-box');

    // Change description and verify output
    descInput.value = 'Production worker pool';
    descInput.dispatchEvent(new window.Event('input'));

    expect(outputBox.textContent).toContain('Description=Production worker pool');
    expect(outputBox.textContent).toContain('[Service]');

    // Run status command in simulator
    window.runSimCommand('status');
    const terminalBody = window.document.getElementById('terminal-body');
    expect(terminalBody.textContent).toContain('Loaded: loaded');
    expect(terminalBody.textContent).toContain('inactive (dead)');
  });
});

describe('VPC Subnetting Calculator', () => {
  it('should slice VPC blocks and compile Terraform configs', () => {
    const window = loadToolDom('../tools/vpc-subnetter/index.html', '../src/js/generators/vpc-subnetter-gen.js');

    const vpcCidrInput = window.document.getElementById('vpc_cidr');
    const outputBox = window.document.getElementById('output-box');

    vpcCidrInput.value = '172.16.0.0/16';
    vpcCidrInput.dispatchEvent(new window.Event('change'));

    // Switch to Terraform tab to compile code
    window.switchTab('terraform');
    expect(outputBox.textContent).toContain('provider "aws"');
    expect(outputBox.textContent).toContain('cidr_block           = "172.16.0.0/16"');
    
    // Check that we render the SVG properly
    const svgContainer = window.document.getElementById('svg-container');
    expect(svgContainer.innerHTML).toContain('<svg');
    expect(svgContainer.innerHTML).toContain('172.16.0.0/16');
  });
});

describe('Nginx Configurator', () => {
  it('should compile nginx configurations and proxy pools', () => {
    const window = loadToolDom('../tools/nginx-config/index.html', '../src/js/generators/nginx-config-gen.js');

    const domainInput = window.document.getElementById('proxy_domain');
    const outputBox = window.document.getElementById('output-box');

    domainInput.value = 'sre.talari.com';
    domainInput.dispatchEvent(new window.Event('input'));

    expect(outputBox.textContent).toContain('server_name sre.talari.com;');
    expect(outputBox.textContent).toContain('proxy_pass http://backend_servers;');
  });
});

describe('Kubernetes CRD Studio', () => {
  it('should design CRD schemas and Go structs', () => {
    const window = loadToolDom('../tools/k8s-crd/index.html', '../src/js/generators/k8s-crd-gen.js');

    const kindInput = window.document.getElementById('crd_kind');
    const outputBox = window.document.getElementById('output-box');

    kindInput.value = 'DatabaseCluster';
    kindInput.dispatchEvent(new window.Event('input'));

    // Verify CRD YAML spec
    window.switchTab('crd-yaml');
    expect(outputBox.textContent).toContain('kind: CustomResourceDefinition');
    expect(outputBox.textContent).toContain('kind: DatabaseCluster');

    // Verify sample CR spec
    window.switchTab('sample-cr');
    expect(outputBox.textContent).toContain('kind: DatabaseCluster');
    expect(outputBox.textContent).toContain('replicaCount:');

    // Verify Go controller code spec
    window.switchTab('go-struct');
    expect(outputBox.textContent).toContain('type DatabaseClusterSpec struct');
    expect(outputBox.textContent).toContain('type DatabaseCluster struct');
  });
});
