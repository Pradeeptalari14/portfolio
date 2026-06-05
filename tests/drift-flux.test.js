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

describe('Terraform Drift Auditor Studio', () => {
  it('should compile CronJob and runbook outputs correctly', () => {
    const window = loadToolDom('../tools/terraform-drift/index.html', '../src/js/generators/terraform-drift-gen.js');

    const targetSelect = window.document.getElementById('drift_target');
    const scheduleInput = window.document.getElementById('drift_schedule');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: CronJob');
    expect(outputBox.textContent).toContain('tf-drift-auditor-aws-sg');

    targetSelect.value = 'aws_s3';
    scheduleInput.value = '*/15 * * * *';
    [targetSelect, scheduleInput].forEach(el => el.dispatchEvent(new window.Event('change')));

    expect(outputBox.textContent).toContain('tf-drift-auditor-aws-s3');
    expect(outputBox.textContent).toContain('schedule: "*/15 * * * *"');
  });

  it('should switch tabs to remediate runbook', () => {
    const window = loadToolDom('../tools/terraform-drift/index.html', '../src/js/generators/terraform-drift-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('runbook');
    expect(outputBox.textContent).toContain('Auto-reconciliation drift remediation runbook');
  });

  it('should simulate out-of-band drift detection and manual remediation checks', async () => {
    const window = loadToolDom('../tools/terraform-drift/index.html', '../src/js/generators/terraform-drift-gen.js');

    window.switchTab('simulator');

    const btnTriggerDrift = window.document.getElementById('btn_trigger_drift');
    const btnRunAudit = window.document.getElementById('btn_run_audit');
    const simStatusVal = window.document.getElementById('sim-status-val');
    const auditLogs = window.document.getElementById('audit-logs-output');

    // Trigger drift
    btnTriggerDrift.dispatchEvent(new window.Event('click'));
    expect(simStatusVal.textContent).toBe('DRIFT DETECTED');
    expect(auditLogs.textContent).toContain('Manual change introduced');

    // Run audit in dry run (reconcile mode unchecked)
    const reconcileCheckbox = window.document.getElementById('drift_reconcile');
    reconcileCheckbox.checked = false;
    reconcileCheckbox.dispatchEvent(new window.Event('change'));

    btnRunAudit.dispatchEvent(new window.Event('click'));
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(auditLogs.textContent).toContain('Out-of-band diff detected');
    expect(auditLogs.textContent).toContain('Auto-remediation is DISABLED');

    // Enable reconcile and run audit again
    reconcileCheckbox.checked = true;
    reconcileCheckbox.dispatchEvent(new window.Event('change'));

    btnRunAudit.dispatchEvent(new window.Event('click'));
    await new Promise(resolve => setTimeout(resolve, 1000)); // wait for both settimeouts (150ms + 800ms)

    expect(auditLogs.textContent).toContain('Auto-remediation is ACTIVE');
    expect(auditLogs.textContent).toContain('Remediation: manual edits overwritten successfully');
    expect(simStatusVal.textContent).toBe('IN SYNC');
  });
});

describe('FluxCD GitOps Sync Studio', () => {
  it('should compile GitRepository and Kustomization manifests', () => {
    const window = loadToolDom('../tools/fluxcd-gitops/index.html', '../src/js/generators/fluxcd-gitops-gen.js');

    const repoUrl = window.document.getElementById('flux_repo');
    const interval = window.document.getElementById('flux_interval');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: GitRepository');
    expect(outputBox.textContent).toContain('url: "https://github.com/Pradeeptalari14/portfolio"');

    repoUrl.value = 'https://github.com/org/k8s-infra';
    interval.value = '5m';
    [repoUrl, interval].forEach(el => el.dispatchEvent(new window.Event('change')));

    expect(outputBox.textContent).toContain('url: "https://github.com/org/k8s-infra"');
    expect(outputBox.textContent).toContain('interval: 5m');
  });

  it('should switch tabs to kustomization yaml', () => {
    const window = loadToolDom('../tools/fluxcd-gitops/index.html', '../src/js/generators/fluxcd-gitops-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('kustomization');
    expect(outputBox.textContent).toContain('kind: Kustomization');
    expect(outputBox.textContent).toContain('path: "./deploy/production"');
  });

  it('should simulate GitOps push and reconciliation sync loop', async () => {
    const window = loadToolDom('../tools/fluxcd-gitops/index.html', '../src/js/generators/fluxcd-gitops-gen.js');

    window.switchTab('simulator');

    const btnCommit = window.document.getElementById('btn_commit_push');
    const syncLogs = window.document.getElementById('sync-logs-output');
    const simStatusVal = window.document.getElementById('sim-status-val');

    btnCommit.dispatchEvent(new window.Event('click'));
    expect(simStatusVal.textContent).toBe('RECONCILING...');
    expect(syncLogs.textContent).toContain('Git CLI: push triggered');

    await new Promise(resolve => setTimeout(resolve, 1100)); // wait for 150ms + 800ms timeouts

    expect(syncLogs.textContent).toContain('drift detected. Applying namespace overrides');
    expect(syncLogs.textContent).toContain('reconciliation completed');
    expect(simStatusVal.textContent).toBe('SYNCHRONIZED');
  });
});
