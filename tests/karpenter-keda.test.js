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

describe('Karpenter Node Autoscaler Studio', () => {
  it('should compile default configuration limits and node selectors', () => {
    const window = loadToolDom('../tools/karpenter-autoscaler/index.html', '../src/js/generators/karpenter-autoscaler-gen.js');

    const cpuLimit = window.document.getElementById('cpu_limit');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('default-pool');
    expect(outputBox.textContent).toContain('cpu: "1000"');

    cpuLimit.value = '500';
    cpuLimit.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('cpu: "500"');
  });

  it('should switch tabs to ec2nodeclass and deploy', () => {
    const window = loadToolDom('../tools/karpenter-autoscaler/index.html', '../src/js/generators/karpenter-autoscaler-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('ec2nodeclass');
    expect(outputBox.textContent).toContain('kind: EC2NodeClass');
    expect(outputBox.textContent).toContain('role: KarpenterNodeRole-EKSCluster');

    window.switchTab('cli');
    expect(outputBox.textContent).toContain('helm upgrade --install karpenter');
  });

  it('should simulate workload pod bin-packing onto nodes', async () => {
    const window = loadToolDom('../tools/karpenter-autoscaler/index.html', '../src/js/generators/karpenter-autoscaler-gen.js');

    window.switchTab('simulator');

    const simPods = window.document.getElementById('sim_request_pods');
    const simNodesVal = window.document.getElementById('sim-nodes-val');
    const simCostVal = window.document.getElementById('sim-cost-val');

    simPods.value = '15';
    simPods.dispatchEvent(new window.Event('input'));

    // Wait a brief tick for the simulator timer callback
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(simNodesVal.textContent).toBe('2');
    expect(simCostVal.textContent).not.toBe('$0.00 / hr');
  });
});

describe('KEDA Event-Driven Autoscaling Studio', () => {
  it('should compile default trigger types and thresholds', () => {
    const window = loadToolDom('../tools/keda-scaling/index.html', '../src/js/generators/keda-scaling-gen.js');

    const triggerSource = window.document.getElementById('trigger_source');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: ScaledObject');
    expect(outputBox.textContent).toContain('type: rabbitmq');

    triggerSource.value = 'kafka';
    triggerSource.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('type: kafka');
    expect(outputBox.textContent).toContain('bootstrapServers: kafka');
  });

  it('should switch tabs and verify scaled job manifest output', () => {
    const window = loadToolDom('../tools/keda-scaling/index.html', '../src/js/generators/keda-scaling-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('scaledjob');
    expect(outputBox.textContent).toContain('kind: ScaledJob');
  });

  it('should simulate active pod autoscaling under queue backlog pressure', () => {
    const window = loadToolDom('../tools/keda-scaling/index.html', '../src/js/generators/keda-scaling-gen.js');

    window.switchTab('simulator');

    const simBacklog = window.document.getElementById('sim_backlog_range');
    const simPodsVal = window.document.getElementById('sim-pods-val');
    const simStatusVal = window.document.getElementById('sim-status-val');

    simBacklog.value = '500';
    simBacklog.dispatchEvent(new window.Event('input'));

    expect(simPodsVal.textContent).toBe('5'); // ceil(500/100) = 5 pods
    expect(simStatusVal.textContent).toContain('SCALING ACTIVE');
  });
});
