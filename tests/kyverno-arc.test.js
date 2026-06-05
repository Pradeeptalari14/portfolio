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

describe('Kyverno Kubernetes Policy Studio', () => {
  it('should compile default Kyverno ClusterPolicy', () => {
    const window = loadToolDom('../tools/kyverno-policy/index.html', '../src/js/generators/kyverno-policy-gen.js');

    const rulesSelect = window.document.getElementById('policy_rules');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: ClusterPolicy');
    expect(outputBox.textContent).toContain('name: block-privileged-containers');
    expect(outputBox.textContent).toContain('validationFailureAction: enforce');

    // Change rules
    rulesSelect.value = 'require-label';
    rulesSelect.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('name: require-app-label');
    expect(outputBox.textContent).toContain('app: "?*"');

    // Change failure action
    const actionSelect = window.document.getElementById('policy_action');
    actionSelect.value = 'audit';
    actionSelect.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('validationFailureAction: audit');
  });

  it('should switch tabs and output pod yaml or deploy scripts', () => {
    const window = loadToolDom('../tools/kyverno-policy/index.html', '../src/js/generators/kyverno-policy-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('pod');
    expect(outputBox.textContent).toContain('kind: Pod');
    expect(outputBox.textContent).toContain('privileged: true');

    window.switchTab('cli');
    expect(outputBox.textContent).toContain('helm upgrade --install kyverno');
  });

  it('should run admission webhook sandbox check', async () => {
    const window = loadToolDom('../tools/kyverno-policy/index.html', '../src/js/generators/kyverno-policy-gen.js');

    window.switchTab('simulator');

    const simPod = window.document.getElementById('sim-pod-manifest-input');
    const webhookStatus = window.document.getElementById('webhook-verdict-status');
    const webhookLogs = window.document.getElementById('webhook-logs-output');
    const btnSubmit = window.document.getElementById('btn_submit_pod');

    // Initial run inside switchTab executes simulator automatically
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(webhookStatus.textContent).toContain('BLOCKED BY COMPLIANCE ENGINE');
    expect(webhookLogs.textContent).toContain('Privileged container execution is disallowed in this cluster');

    // Change pod contents to bypass
    simPod.value = `
apiVersion: v1
kind: Pod
metadata:
  name: safe-nginx
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.25.1
      securityContext:
        privileged: false
    `;
    btnSubmit.dispatchEvent(new window.Event('click'));

    await new Promise(resolve => setTimeout(resolve, 200));
    expect(webhookStatus.textContent).toContain('ALLOWED (POD SCHEDULED)');
  });
});

describe('GitHub Actions ARC Studio', () => {
  it('should compile AutoscalingRunnerSet manifest correctly', () => {
    const window = loadToolDom('../tools/github-arc/index.html', '../src/js/generators/github-arc-gen.js');

    const targetUrl = window.document.getElementById('github_target');
    const minRunners = window.document.getElementById('min_runners');
    const maxRunners = window.document.getElementById('max_runners');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: AutoscalingRunnerSet');
    expect(outputBox.textContent).toContain('githubConfigUrl: "https://github.com/Pradeeptalari14/portfolio"');

    // Change inputs
    targetUrl.value = 'org/repo';
    minRunners.value = '1';
    maxRunners.value = '15';
    [targetUrl, minRunners, maxRunners].forEach(el => el.dispatchEvent(new window.Event('change')));

    expect(outputBox.textContent).toContain('githubConfigUrl: "https://github.com/org/repo"');
    expect(outputBox.textContent).toContain('minRunners: 1');
    expect(outputBox.textContent).toContain('maxRunners: 15');
  });

  it('should switch tabs to helm guide', () => {
    const window = loadToolDom('../tools/github-arc/index.html', '../src/js/generators/github-arc-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('cli');
    expect(outputBox.textContent).toContain('helm repo add actions-runner-controller');
    expect(outputBox.textContent).toContain('gha-runner-scale-operator');
  });

  it('should run autoscale simulator', () => {
    const window = loadToolDom('../tools/github-arc/index.html', '../src/js/generators/github-arc-gen.js');

    window.switchTab('simulator');

    const simJobs = window.document.getElementById('sim_jobs_range');
    const simRunners = window.document.getElementById('sim-runners-val');
    const simStatus = window.document.getElementById('sim-status-val');

    simJobs.value = '5';
    simJobs.dispatchEvent(new window.Event('input'));

    expect(simRunners.textContent).toBe('5');
    expect(simStatus.textContent).toContain('RECONCILING');
  });
});
