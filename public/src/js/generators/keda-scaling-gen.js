// KEDA Scaling Generator logic

const SCRIPT_VERSION = "1.0.0";

function initKedaStudio() {
  const elements = {
    triggerType: document.getElementById('trigger_source'),
    minReplicas: document.getElementById('min_replicas'),
    maxReplicas: document.getElementById('max_replicas'),
    threshold: document.getElementById('scaling_threshold'),
    cooldown: document.getElementById('cooldown_period'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator inputs
    simBacklog: document.getElementById('sim_backlog_range'),
    simBacklogVal: document.getElementById('sim-backlog-val'),
    simPodsVal: document.getElementById('sim-pods-val'),
    simStatusVal: document.getElementById('sim-status-val'),
    podsGrid: document.getElementById('pods-render-grid'),
  };

  let activeTab = 'scaledobject';

  function generateScaledObject() {
    const trigger = elements.triggerType ? elements.triggerType.value : 'rabbitmq';
    const min = elements.minReplicas ? elements.minReplicas.value : '0';
    const max = elements.maxReplicas ? elements.maxReplicas.value : '20';
    const threshold = elements.threshold ? elements.threshold.value : '100';
    const cool = elements.cooldown ? elements.cooldown.value : '300';

    let yaml = `# KEDA ScaledObject manifest - Compiled v${SCRIPT_VERSION}
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-processor-scaler
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-processor
  minReplicaCount: ${min}
  maxReplicaCount: ${max}
  cooldownPeriod: ${cool}
  pollingInterval: 30
  advanced:
    restoreToOriginalReplicaCount: true
  triggers:
`;

    if (trigger === 'rabbitmq') {
      yaml += `    - type: rabbitmq
      metadata:
        queueName: orders-queue
        mode: QueueLength
        value: "${threshold}"
        hostFromEnv: RABBITMQ_HOST
`;
    } else if (trigger === 'kafka') {
      yaml += `    - type: kafka
      metadata:
        bootstrapServers: kafka.default.svc.cluster.local:9092
        consumerGroup: order-group
        topic: orders
        lagThreshold: "${threshold}"
`;
    } else if (trigger === 'aws-sqs') {
      yaml += `    - type: aws-sqs
      metadata:
        queueURL: https://sqs.us-east-1.amazonaws.com/123456789012/orders-queue
        queueLength: "${threshold}"
        awsRegion: us-east-1
`;
    } else if (trigger === 'prometheus') {
      yaml += `    - type: prometheus
      metadata:
        serverAddress: http://prometheus-k8s.monitoring.svc.cluster.local:9090
        metricName: http_requests_total
        query: sum(rate(http_requests_total[2m]))
        threshold: "${threshold}"
`;
    }

    return yaml;
  }

  function generateScaledJob() {
    const trigger = elements.triggerType ? elements.triggerType.value : 'rabbitmq';
    const max = elements.maxReplicas ? elements.maxReplicas.value : '20';
    const threshold = elements.threshold ? elements.threshold.value : '100';

    return `# KEDA ScaledJob manifest for queue batch jobs - Compiled v${SCRIPT_VERSION}
apiVersion: keda.sh/v1alpha1
kind: ScaledJob
metadata:
  name: order-processor-job-scaler
  namespace: default
spec:
  jobTargetRef:
    parallelism: 1
    completions: 1
    activeDeadlineSeconds: 600
    backoffLimit: 6
    template:
      spec:
        containers:
          - name: order-worker
            image: order-processor:latest
            env:
              - name: RABBITMQ_HOST
                value: "amqp://guest:guest@rabbitmq:5672"
        restartPolicy: OnFailure
  maxReplicaCount: ${max}
  scalingStrategy:
    strategy: "custom"
  triggers:
    - type: ${trigger === 'prometheus' ? 'prometheus' : (trigger === 'aws-sqs' ? 'aws-sqs' : (trigger === 'kafka' ? 'kafka' : 'rabbitmq'))}
      metadata:
        queueName: orders-queue
        value: "${threshold}"
`;
  }

  function generateCliCommands() {
    return `# KEDA Deployment and validation guide
# 1. Install KEDA in namespace keda
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm upgrade --install keda kedacore/keda --namespace keda --create-namespace

# 2. Deploy ScaledObject manifest
kubectl apply -f scaledobject.yaml

# 3. Verify HPA generated dynamically by KEDA
kubectl get hpa
kubectl get scaledobject order-processor-scaler

# 4. Stream KEDA operator logs to audit triggers
kubectl logs -n keda -l app.kubernetes.io/name=keda-operator
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'scaledobject') {
      elements.outputBox.textContent = generateScaledObject();
      if (elements.downloadInput) elements.downloadInput.value = 'scaledobject.yaml';
    } else if (activeTab === 'scaledjob') {
      elements.outputBox.textContent = generateScaledJob();
      if (elements.downloadInput) elements.downloadInput.value = 'scaledjob.yaml';
    } else if (activeTab === 'cli') {
      elements.outputBox.textContent = generateCliCommands();
      if (elements.downloadInput) elements.downloadInput.value = 'keda-deploy.sh';
    }
  }

  // Simulator scaling pods rendering
  function runAutoscaleSimulator() {
    if (!elements.podsGrid) return;

    const backlog = parseInt(elements.simBacklog ? elements.simBacklog.value : '0', 10);
    const min = parseInt(elements.minReplicas ? elements.minReplicas.value : '0', 10);
    const max = parseInt(elements.maxReplicas ? elements.maxReplicas.value : '20', 10);
    const thresh = parseInt(elements.threshold ? elements.threshold.value : '100', 10);

    if (elements.simBacklogVal) elements.simBacklogVal.textContent = backlog;

    let targetPods = min;
    if (backlog > 0) {
      targetPods = Math.min(max, Math.max(min, Math.ceil(backlog / thresh)));
    }

    if (elements.simPodsVal) elements.simPodsVal.textContent = targetPods;

    if (targetPods === 0) {
      elements.podsGrid.innerHTML = `<div class="text-slate-500 font-mono text-[10px] w-full text-center py-8">Scale-to-zero inactive state. Increase backlog queue depth.</div>`;
      if (elements.simStatusVal) {
        elements.simStatusVal.textContent = 'INACTIVE (SCALE-TO-ZERO)';
        elements.simStatusVal.className = 'text-sm font-bold text-slate-500';
      }
      return;
    }

    if (elements.simStatusVal) {
      if (backlog > 0 && targetPods > min) {
        elements.simStatusVal.textContent = `SCALING ACTIVE (Target Replicas: ${targetPods})`;
        elements.simStatusVal.className = 'text-sm font-bold text-cyan-500';
      } else {
        elements.simStatusVal.textContent = 'WARM STANDBY (Min Replicas)';
        elements.simStatusVal.className = 'text-sm font-bold text-slate-400';
      }
    }

    elements.podsGrid.innerHTML = '';
    for (let p = 1; p <= targetPods; p++) {
      const podDiv = document.createElement('div');
      podDiv.className = 'bg-slate-900 border border-cyan-500/30 p-2.5 rounded flex items-center justify-between gap-3 font-mono text-[10px] text-slate-300 w-[48%] sm:w-[31%]';
      podDiv.innerHTML = `
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm animate-ping"></span>
          <span>pod-${p}</span>
        </div>
        <span class="text-emerald-500 font-semibold uppercase text-[8px]">Running</span>
      `;
      elements.podsGrid.appendChild(podDiv);
    }
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    // Toggle active classes on tab buttons
    ['scaledobject', 'scaledjob', 'cli', 'simulator'].forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      if (btn) {
        if (tab === tabName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    const outputBox = elements.outputBox;
    const simViewport = document.getElementById('simulator-viewport');

    if (tabName === 'simulator') {
      if (outputBox) outputBox.classList.add('hidden');
      if (simViewport) simViewport.classList.remove('hidden');
      runAutoscaleSimulator();
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.triggerType, elements.minReplicas, elements.maxReplicas, elements.threshold, elements.cooldown].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.simBacklog) {
    elements.simBacklog.addEventListener('input', runAutoscaleSimulator);
  }

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('trigger_source')) {
    initKedaStudio();
  }
});
window.initKedaStudio = initKedaStudio;

