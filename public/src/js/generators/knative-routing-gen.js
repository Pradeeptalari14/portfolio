// Knative Serverless Studio Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initKnativeRouting() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const minScale = $('min_scale');
  const maxScale = $('max_scale');
  const targetConcurrency = $('target_concurrency');
  const cooldownPeriod = $('cooldown_period');
  const enableEventing = $('enable_eventing');
  const triggerType = $('trigger_type');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  const simulatorViewport = $('simulator-viewport');

  // Simulator Inputs & Outputs
  const simRequestRate = $('sim_request_rate');
  const simRateVal = $('sim-rate-val');
  const simPodsVal = $('sim-pods-val');
  const simStatusVal = $('sim-status-val');
  const podsRenderGrid = $('pods-render-grid');

  function compileKnative() {
    if (!minScale) return;
    const min = parseInt(minScale.value);
    const max = parseInt(maxScale.value) || 10;
    const target = parseInt(targetConcurrency.value) || 100;
    const cooldown = cooldownPeriod.value;

    let activeTabBtn = document.querySelector('.tab-btn.active');
    let activeTab = activeTabBtn ? activeTabBtn.id : 'tab-config';

    if (activeTab === 'tab-config') {
      downloadNameInput.value = 'service.yaml';
      outputBox.textContent = generateKnativeService(min, max, target, cooldown);
    } else if (activeTab === 'tab-system') {
      downloadNameInput.value = 'trigger.yaml';
      outputBox.textContent = generateKnativeTrigger();
    }

    renderSimulator();
  }

  function generateKnativeService(min, max, target, cooldown) {
    return `apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: serverless-app-profile
  namespace: default
spec:
  template:
    metadata:
      annotations:
        # Knative Pod Autoscaler annotations specs
        autoscaling.knative.dev/min-scale: "${min}"
        autoscaling.knative.dev/max-scale: "${max}"
        autoscaling.knative.dev/target: "${target}"
        autoscaling.knative.dev/scale-to-zero-pod-retention-period: "${cooldown}"
    spec:
      containers:
        - image: gcr.io/knative-samples/helloworld-go
          env:
            - name: TARGET
              value: "Go Serverless World"
          ports:
            - containerPort: 8080
`;
  }

  function generateKnativeTrigger() {
    if (!enableEventing.checked) {
      return `# Eventing trigger disabled.\n# Check "Bind broker event trigger" checkbox to compile event triggers.`;
    }

    const eventType = triggerType.value.trim() || 'dev.talari.orders';

    return `apiVersion: eventing.knative.dev/v1
kind: Trigger
metadata:
  name: serverless-trigger
  namespace: default
spec:
  broker: default
  filter:
    attributes:
      type: ${eventType}
  subscriber:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: serverless-app-profile
`;
  }

  function renderSimulator() {
    if (!simRequestRate || !podsRenderGrid) return;

    const min = parseInt(minScale.value);
    const max = parseInt(maxScale.value) || 10;
    const target = parseInt(targetConcurrency.value) || 100;
    const rate = parseInt(simRequestRate.value);

    simRateVal.textContent = rate;

    // Calculate pods
    let podsNeeded = min;
    if (rate > 0) {
      podsNeeded = Math.max(min, Math.ceil(rate / target));
    }
    if (podsNeeded > max) podsNeeded = max;

    simPodsVal.textContent = podsNeeded;

    // Update status labels
    if (podsNeeded === 0) {
      simStatusVal.textContent = 'INACTIVE (Scaled to Zero)';
      simStatusVal.className = 'text-sm font-bold text-slate-500';
    } else if (rate === 0 && min > 0) {
      simStatusVal.textContent = 'WARM (Idle)';
      simStatusVal.className = 'text-sm font-bold text-yellow-500';
    } else if (rate > 0 && podsNeeded === min && min > 0) {
      simStatusVal.textContent = 'RUNNING';
      simStatusVal.className = 'text-sm font-bold text-emerald-400';
    } else {
      simStatusVal.textContent = 'SCALING';
      simStatusVal.className = 'text-sm font-bold text-sky-400';
    }

    // Render pod boxes
    podsRenderGrid.innerHTML = '';
    if (podsNeeded === 0) {
      podsRenderGrid.innerHTML = '<div class="text-xs text-slate-500 w-full text-center py-6">All container pods scaled to zero. Cooldown state idle.</div>';
      return;
    }

    for (let i = 0; i < podsNeeded; i++) {
      const pod = document.createElement('div');
      pod.className = 'pod-box';
      pod.title = `Pod Instance #${i + 1}`;
      podsRenderGrid.appendChild(pod);
    }
  }

  // Event Listeners
  [minScale, maxScale, targetConcurrency, cooldownPeriod, enableEventing].forEach(el => {
    if (el) {
      el.addEventListener('change', compileKnative);
      el.addEventListener('input', compileKnative);
    }
  });

  if (triggerType) {
    triggerType.addEventListener('input', compileKnative);
  }

  if (simRequestRate) {
    simRequestRate.addEventListener('input', renderSimulator);
  }

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'config') {
      const tab = $('tab-config');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'system') {
      const tab = $('tab-system');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      if (simulatorViewport) simulatorViewport.classList.remove('hidden');
      if (outputBox) outputBox.classList.add('hidden');
    }

    compileKnative();
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Service copied to clipboard!');
    });
  };

  window.downloadActiveFile = () => {
    const text = outputBox.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  // Trigger initial compile
  compileKnative();
}

if (document.readyState !== 'loading') {
  initKnativeRouting();
} else {
  document.addEventListener('DOMContentLoaded', initKnativeRouting);
}
