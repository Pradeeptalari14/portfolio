import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Universal Engineering Toolbox - 10 Cloud, SRE & AI Utilities', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../toolbox/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/toolbox/'
    });
    window = dom.window;
    document = window.document;
  });

  it('should render the toolbox with 10 functional utility tabs and matching panels', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    expect(tabs.length).toBe(10);

    const panels = document.querySelectorAll('.tool-panel');
    expect(panels.length).toBe(10);

    const tabTargets = Array.from(tabs).map(t => t.getAttribute('data-target'));
    expect(tabTargets).toContain('panelCidr');
    expect(tabTargets).toContain('panelAiTokens');
    expect(tabTargets).toContain('panelSlo');
    expect(tabTargets).toContain('panelPromql');
    expect(tabTargets).toContain('panelK8s');
    expect(tabTargets).toContain('panelBase64');
    expect(tabTargets).toContain('panelWebCrypto');
    expect(tabTargets).toContain('panelCron');
    expect(tabTargets).toContain('panelEpoch');
    expect(tabTargets).toContain('panelJsonYaml');
  });

  it('should calculate accurate IPv4 CIDR subnet parameters', () => {
    const cidrInput = document.getElementById('cidrInput');
    const cidrResults = document.getElementById('cidrResults');

    expect(cidrInput).toBeTruthy();
    expect(cidrResults).toBeTruthy();

    cidrInput.value = '192.168.1.0/24';
    cidrInput.dispatchEvent(new window.Event('input'));

    const text = cidrResults.textContent;
    expect(text).toContain('192.168.1.0');
    expect(text).toContain('192.168.1.255');
    expect(text).toContain('255.255.255.0');
    expect(text).toContain('254');
  });

  it('should estimate AI token counts and compare model inference costs', () => {
    const aiPromptInput = document.getElementById('aiPromptInput');
    const aiCostResults = document.getElementById('aiCostResults');
    const tokenCharCounter = document.getElementById('tokenCharCounter');

    expect(aiPromptInput).toBeTruthy();
    expect(aiCostResults).toBeTruthy();

    aiPromptInput.value = 'Explain Kubernetes Karpenter GPU autoscaling and how it cuts spot costs.';
    aiPromptInput.dispatchEvent(new window.Event('input'));

    expect(tokenCharCounter.textContent).toContain('chars');
    expect(tokenCharCounter.textContent).toContain('tokens');

    const costText = aiCostResults.textContent;
    expect(costText).toContain('DeepSeek V3 / V2.5');
    expect(costText).toContain('GPT-4o');
    expect(costText).toContain('Claude 3.7 Sonnet');
    expect(costText).toContain('KV Cache VRAM');
  });

  it('should compute Google SRE SLO error budgets and multi-burn rate thresholds', () => {
    const sloTarget = document.getElementById('sloTarget');
    const sloResults = document.getElementById('sloResults');
    const burnRateResults = document.getElementById('burnRateResults');

    expect(sloTarget).toBeTruthy();
    expect(sloResults).toBeTruthy();

    sloTarget.value = '99.9';
    sloTarget.dispatchEvent(new window.Event('change'));

    expect(sloResults.textContent).toContain('Allowed Downtime');
    expect(sloResults.textContent).toContain('43m 12s');

    expect(burnRateResults.textContent).toContain('14.4× Fast Burn Alert');
    expect(burnRateResults.textContent).toContain('6.0× Medium Burn Alert');
  });

  it('should generate PromQL query expressions and PrometheusRule YAML', () => {
    const promMetricTemplate = document.getElementById('promMetricTemplate');
    const promqlOutput = document.getElementById('promqlOutput');
    const alertRuleYaml = document.getElementById('alertRuleYaml');

    expect(promMetricTemplate).toBeTruthy();
    expect(promqlOutput).toBeTruthy();

    promMetricTemplate.value = 'http_5xx_rate';
    promMetricTemplate.dispatchEvent(new window.Event('change'));

    expect(promqlOutput.value).toContain('http_requests_total');
    expect(promqlOutput.value).toContain('status=~"5.."');

    expect(alertRuleYaml.value).toContain('kind: PrometheusRule');
    expect(alertRuleYaml.value).toContain('severity: critical');
  });

  it('should calculate Kubernetes HPA desired replicas from utilization metrics', () => {
    const currentReplicas = document.getElementById('currentReplicas');
    const currentMetricVal = document.getElementById('currentMetricVal');
    const targetMetricVal = document.getElementById('targetMetricVal');
    const hpaResults = document.getElementById('hpaResults');

    currentReplicas.value = '5';
    currentMetricVal.value = '85';
    targetMetricVal.value = '50';

    currentReplicas.dispatchEvent(new window.Event('input'));

    // ceil(5 * (85 / 50)) = ceil(5 * 1.7) = ceil(8.5) = 9 Pods
    expect(hpaResults.textContent).toContain('9 Pods');
    expect(hpaResults.textContent).toContain('scaling up');
  });

  it('should decode Base64 strings and parse JWT claims', () => {
    const b64Raw = document.getElementById('b64Raw');
    const b64Out = document.getElementById('b64Output');
    const btnB64Encode = document.getElementById('btnB64Encode');
    const btnB64Decode = document.getElementById('btnB64Decode');

    b64Raw.value = 'DevSecOps SRE 2026';
    btnB64Encode.click();

    expect(b64Out.value).toBe('RGV2U2VjT3BzIFNSRSAyMDI2');

    b64Raw.value = 'RGV2U2VjT3BzIFNSRSAyMDI2';
    btnB64Decode.click();

    expect(b64Out.value).toBe('DevSecOps SRE 2026');
  });

  it('should parse Cron expressions into human readable explanations', () => {
    const cronInput = document.getElementById('cronInput');
    const cronMeaning = document.getElementById('cronMeaning');

    cronInput.value = '*/15 * * * *';
    cronInput.dispatchEvent(new window.Event('input'));
    expect(cronMeaning.textContent).toBe('Every 15 minutes');

    cronInput.value = '0 0 * * *';
    cronInput.dispatchEvent(new window.Event('input'));
    expect(cronMeaning.textContent).toBe('Every day at midnight (00:00 UTC)');
  });
});
