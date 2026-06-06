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

  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  if (fs.existsSync(corePath)) {
    const coreCode = fs.readFileSync(corePath, 'utf8');
    window.eval(coreCode);
  }

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');

  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);

  return window;
}

describe('Vault Dynamic Secrets & PKI Studio', () => {
  it('should compile correct HCL access policies', () => {
    const window = loadToolDom('../tools/vault-secrets/index.html', '../src/js/generators/vault-secrets-gen.js');

    const engineSelect = window.document.getElementById('secret_engine_type');
    const roleInput = window.document.getElementById('kubernetes_role');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('path "database/creds/app-db-role"');
    expect(outputBox.textContent).toContain('capabilities = ["read"]');

    // Change role and engine config
    roleInput.value = 'infra-sa-role';
    engineSelect.value = 'pki-ca';
    [roleInput, engineSelect].forEach(el => el.dispatchEvent(new window.Event('change')));

    expect(outputBox.textContent).toContain('Permissions for authentication role: infra-sa-role');
    expect(outputBox.textContent).toContain('path "pki/issue/app-cert-issuer"');
  });

  it('should switch tabs and output engine setup config JSON', () => {
    const window = loadToolDom('../tools/vault-secrets/index.html', '../src/js/generators/vault-secrets-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('config');
    expect(outputBox.textContent).toContain('postgresql-database-plugin');
  });

  it('should simulate dynamic lease creation and revocations', () => {
    const window = loadToolDom('../tools/vault-secrets/index.html', '../src/js/generators/vault-secrets-gen.js');

    window.switchTab('simulator');

    const btnIssue = window.document.getElementById('btn_issue_creds');
    const btnRevoke = window.document.getElementById('btn_revoke_creds');
    const leaseList = window.document.getElementById('lease-list-body');
    const simStatus = window.document.getElementById('sim-status-val');

    expect(leaseList.textContent).toContain('No active leases');

    // Issue dynamic database credential
    btnIssue.dispatchEvent(new window.Event('click'));
    expect(simStatus.textContent).toBe('1 LEASES ACTIVE');
    expect(leaseList.textContent).toContain('db-user-');
    expect(leaseList.textContent).toContain('left');

    // Revoke leases
    btnRevoke.dispatchEvent(new window.Event('click'));
    expect(simStatus.textContent).toBe('IDLE');
    expect(leaseList.textContent).toContain('No active leases');
  });
});

describe('Tekton CI/CD Pipeline DAG Studio', () => {
  it('should compile correct Pipeline and PipelineRun declarations', () => {
    const window = loadToolDom('../tools/tekton-pipeline/index.html', '../src/js/generators/tekton-pipeline-gen.js');

    const triggerSelect = window.document.getElementById('tekton_trigger');
    const taskSelect = window.document.getElementById('tekton_tasks');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: Pipeline');
    expect(outputBox.textContent).toContain('name: lint-code-step');

    taskSelect.value = 'test-build-deploy';
    taskSelect.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('name: run-tests-step');
    expect(outputBox.textContent).toContain('name: helm-deploy-step');

    window.switchTab('pipelinerun');
    expect(outputBox.textContent).toContain('kind: PipelineRun');
  });

  it('should run interactive Tekton DAG execution steps sequence', async () => {
    const window = loadToolDom('../tools/tekton-pipeline/index.html', '../src/js/generators/tekton-pipeline-gen.js');

    window.switchTab('simulator');

    const btnRun = window.document.getElementById('btn_run_tekton');
    const logs = window.document.getElementById('tekton-logs-output');
    const simStatus = window.document.getElementById('sim-status-val');

    btnRun.dispatchEvent(new window.Event('click'));
    expect(simStatus.textContent).toBe('RUNNING...');
    expect(logs.textContent).toContain('initializing workspace claim');

    // Wait for the simulator execution timeline sequence (approx 600ms * 3 steps = 1800ms)
    await new Promise(resolve => setTimeout(resolve, 2000));

    expect(logs.textContent).toContain('PipelineRun successfully executed');
    expect(simStatus.textContent).toBe('SUCCESS');
  });
});
