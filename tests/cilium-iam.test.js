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

describe('Cilium Network Policy & Hubble Visualizer Studio', () => {
  it('should compile default CiliumNetworkPolicy correctly', () => {
    const window = loadToolDom('../tools/cilium-policy/index.html', '../src/js/generators/cilium-policy-gen.js');

    const nsSelect = window.document.getElementById('policy_namespace');
    const trafficSelect = window.document.getElementById('policy_traffic_type');
    const portSelect = window.document.getElementById('policy_port');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: CiliumNetworkPolicy');
    expect(outputBox.textContent).toContain('namespace: production');
    expect(outputBox.textContent).toContain('app: frontend-pod');

    // Change settings
    nsSelect.value = 'staging';
    trafficSelect.value = 'egress-db';
    portSelect.value = '5432';
    [nsSelect, trafficSelect, portSelect].forEach(el => el.dispatchEvent(new window.Event('change')));

    expect(outputBox.textContent).toContain('namespace: staging');
    expect(outputBox.textContent).toContain('app: db-pod');
    expect(outputBox.textContent).toContain('port: "5432"');
  });

  it('should switch tabs and show status CLI commands', () => {
    const window = loadToolDom('../tools/cilium-policy/index.html', '../src/js/generators/cilium-policy-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('cli');
    expect(outputBox.textContent).toContain('cilium status');
    expect(outputBox.textContent).toContain('hubble observe');
  });

  it('should simulate traffic flows and evaluate packet drops/DNS blocks', async () => {
    const window = loadToolDom('../tools/cilium-policy/index.html', '../src/js/generators/cilium-policy-gen.js');

    window.switchTab('simulator');

    const btnTestTraffic = window.document.getElementById('btn_test_traffic');
    const btnDnsBlock = window.document.getElementById('btn_dns_block');
    const btnMaliciousQuery = window.document.getElementById('btn_malicious_query');
    const hubbleLogs = window.document.getElementById('hubble-logs-output');

    // Connection flow
    btnTestTraffic.dispatchEvent(new window.Event('click'));
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(hubbleLogs.textContent).toContain('Hubble Flow: frontend-pod');
    expect(hubbleLogs.textContent).toContain('ALLOWED');

    // DNS block
    btnDnsBlock.dispatchEvent(new window.Event('click'));
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(hubbleLogs.textContent).toContain('suspicious-c2-server.com');
    expect(hubbleLogs.textContent).toContain('DROPPED');

    // HTTP Payload Hack
    btnMaliciousQuery.dispatchEvent(new window.Event('click'));
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(hubbleLogs.textContent).toContain('HTTP/1.1 POST /api/v1/auth/admin');
    expect(hubbleLogs.textContent).toContain('ALLOWED'); // defaults to ALLOWED when L7 rules not active
  });
});

describe('AWS IAM Policy & Boundary Analyzer', () => {
  it('should compile correct IAM and Trust policies JSON documents', () => {
    const window = loadToolDom('../tools/aws-iam/index.html', '../src/js/generators/aws-iam-gen.js');

    const roleType = window.document.getElementById('aws_role_type');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('Sid": "S3ReadOnlyAccess');
    expect(outputBox.textContent).toContain('s3:GetObject');

    roleType.value = 'db-dev';
    roleType.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('Sid": "DynamoDBDeveloperAccess');
    expect(outputBox.textContent).toContain('dynamodb:PutItem');

    window.switchTab('trust');
    expect(outputBox.textContent).toContain('ec2.amazonaws.com');
  });

  it('should run IAM capability evaluator simulator tests', async () => {
    const window = loadToolDom('../tools/aws-iam/index.html', '../src/js/generators/aws-iam-gen.js');

    window.switchTab('simulator');

    const simAction = window.document.getElementById('sim_iam_action');
    const simResource = window.document.getElementById('sim_iam_resource');
    const btnEvaluate = window.document.getElementById('btn_evaluate_iam');
    const verdictStatus = window.document.getElementById('eval-verdict-status');
    const evalLogs = window.document.getElementById('eval-logs-output');

    // Check allow scenario (Default role s3-reader with s3:GetObject action)
    btnEvaluate.dispatchEvent(new window.Event('click'));
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(verdictStatus.textContent).toBe('ACCESS ALLOWED');
    expect(evalLogs.textContent).toContain('Step 1: Check Explicit Deny');

    // Check deny scenario (IAM user create action in s3-reader role)
    simAction.value = 'iam:CreateUser';
    simAction.dispatchEvent(new window.Event('change'));
    btnEvaluate.dispatchEvent(new window.Event('click'));
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(verdictStatus.textContent).toBe('ACCESS DENIED');
  });
});
