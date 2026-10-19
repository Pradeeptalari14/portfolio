/**
 * KubeRay Operator Studio Generator
 * Emits ray.io/v1 RayCluster / RayJob / RayService manifests for the KubeRay operator (v1.3.x).
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTab = 'manifest';
  let compiledCode = {};

  const RAY_VERSION = '2.41.0';
  const OPERATOR_VERSION = '1.3.0';

  const elements = {
    codeOutput: document.getElementById('codeOutput'),
    btnCopy: document.getElementById('btn-copy-code'),
    btnDownload: document.getElementById('btn-download-code'),
    btnRecalculate: document.getElementById('btn-recalculate'),
    terminalViewport: document.getElementById('terminal-viewport'),
    terminalInput: document.getElementById('terminal-input'),
    crdKind: document.getElementById('crdKind'),
    workerProfile: document.getElementById('workerProfile'),
    maxReplicas: document.getElementById('maxReplicas'),
    gcsFaultTolerance: document.getElementById('gcsFaultTolerance'),
    metricWorkers: document.getElementById('metric-workers'),
    metricGpus: document.getElementById('metric-gpus'),
    metricRecovery: document.getElementById('metric-recovery'),
    metricSavings: document.getElementById('metric-savings'),
    finopsText: document.getElementById('finops-text')
  };

  const PROFILES = {
    'gpu-a100': { label: 'A100', gpu: 1, cpu: '8', memory: '64Gi', image: `rayproject/ray:${RAY_VERSION}-py311-gpu`, accelerator: 'nvidia-tesla-a100' },
    'gpu-l4': { label: 'L4', gpu: 1, cpu: '4', memory: '24Gi', image: `rayproject/ray:${RAY_VERSION}-py311-gpu`, accelerator: 'nvidia-l4' },
    'cpu': { label: 'CPU', gpu: 0, cpu: '4', memory: '16Gi', image: `rayproject/ray:${RAY_VERSION}-py311`, accelerator: null }
  };

  const fileExtensions = {
    manifest: 'kuberay.yaml',
    helm: 'install-operator.sh',
    python: 'workload.py',
    monitoring: 'podmonitor.yaml',
    compose: 'kind-cluster.yaml',
    workflow: 'kuberay-validate.yml',
    script: 'validate.sh'
  };

  function readConfig() {
    const kind = elements.crdKind ? elements.crdKind.value : 'RayCluster';
    const profileKey = elements.workerProfile ? elements.workerProfile.value : 'gpu-a100';
    const max = parseInt(elements.maxReplicas ? elements.maxReplicas.value : '8', 10) || 8;
    const ft = elements.gcsFaultTolerance ? elements.gcsFaultTolerance.value === 'redis' : true;
    return { kind, profileKey, profile: PROFILES[profileKey] || PROFILES['gpu-a100'], max, min: 1, ft };
  }

  function updateHUD() {
    const c = readConfig();
    const savings = Math.round((1 - c.min / c.max) * 100);
    if (elements.metricWorkers) elements.metricWorkers.textContent = `${c.min} → ${c.max}`;
    if (elements.metricGpus) elements.metricGpus.textContent = c.profile.gpu ? `${c.max * c.profile.gpu} × ${c.profile.label}` : '0 (CPU only)';
    if (elements.metricRecovery) elements.metricRecovery.textContent = c.ft ? '~30 s' : 'State lost';
    if (elements.metricSavings) elements.metricSavings.textContent = `-${savings}%`;
    if (elements.finopsText) {
      const teardown = c.kind === 'RayJob' ? ' The RayJob cluster is deleted once the job finishes, so nothing stays running afterwards.' : '';
      elements.finopsText.textContent = `Scaling ${c.profile.label} workers between ${c.min} and ${c.max} on demand means you pay for the ${c.max}-worker peak only while work is queued, roughly ${savings}% less idle capacity than a static ${c.max}-worker cluster.${teardown}`;
    }
  }

  // ---------- Manifest builders ----------

  function workerContainer(c, indent) {
    const p = c.profile;
    const gpuLimit = p.gpu ? `\n${indent}      nvidia.com/gpu: ${p.gpu}` : '';
    return `${indent}- name: ray-worker
${indent}  image: ${p.image}
${indent}  resources:
${indent}    requests:
${indent}      cpu: "${p.cpu}"
${indent}      memory: ${p.memory}${gpuLimit}
${indent}    limits:
${indent}      cpu: "${p.cpu}"
${indent}      memory: ${p.memory}${gpuLimit}`;
  }

  function gpuScheduling(c, indent) {
    if (!c.profile.gpu) return '';
    return `
${indent}nodeSelector:
${indent}  cloud.google.com/gke-accelerator: ${c.profile.accelerator}
${indent}tolerations:
${indent}  - key: nvidia.com/gpu
${indent}    operator: Exists
${indent}    effect: NoSchedule`;
  }

  // Returns a RayCluster spec body, indented by `pad` spaces.
  function rayClusterSpec(c, pad) {
    const i = ' '.repeat(pad);
    const ft = c.ft ? `${i}gcsFaultToleranceOptions:
${i}  redisAddress: "redis.ray-system.svc.cluster.local:6379"
${i}  redisPassword:
${i}    valueFrom:
${i}      secretKeyRef:
${i}        name: ray-redis-auth
${i}        key: password
` : '';
    return `${i}rayVersion: "${RAY_VERSION}"
${i}enableInTreeAutoscaling: true
${i}autoscalerOptions:
${i}  upscalingMode: Default
${i}  idleTimeoutSeconds: 120
${i}  resources:
${i}    requests: { cpu: "500m", memory: 512Mi }
${i}    limits: { cpu: "500m", memory: 512Mi }
${ft}${i}headGroupSpec:
${i}  rayStartParams:
${i}    dashboard-host: "0.0.0.0"
${i}    num-cpus: "0"          # keep workloads off the head pod
${i}  template:
${i}    spec:
${i}      containers:
${i}        - name: ray-head
${i}          image: rayproject/ray:${RAY_VERSION}-py311
${i}          env:
${i}            - name: RAY_enable_autoscaler_v2
${i}              value: "1"
${i}          ports:
${i}            - { containerPort: 6379, name: gcs-server }
${i}            - { containerPort: 8265, name: dashboard }
${i}            - { containerPort: 10001, name: client }
${i}            - { containerPort: 8080, name: metrics }${c.kind === 'RayService' ? `\n${i}            - { containerPort: 8000, name: serve }` : ''}
${i}          resources:
${i}            requests: { cpu: "2", memory: 8Gi }
${i}            limits: { cpu: "2", memory: 8Gi }
${i}workerGroupSpecs:
${i}  - groupName: ${c.profile.gpu ? 'gpu-' + c.profile.label.toLowerCase() : 'cpu'}-workers
${i}    replicas: ${c.min}
${i}    minReplicas: ${c.min}
${i}    maxReplicas: ${c.max}
${i}    rayStartParams: {}
${i}    template:
${i}      spec:
${i}        restartPolicy: Never   # required by autoscaler v2${gpuScheduling(c, i + '        ')}
${i}        containers:
${workerContainer(c, i + '          ')}`;
  }

  function buildManifest(c) {
    const name = `ray-${c.kind.toLowerCase().replace('ray', '')}-${c.profile.label.toLowerCase()}`;
    const header = `# Generated by KubeRay Operator Studio - https://talaripradeep.info/tools/kuberay/
# Requires KubeRay operator >= ${OPERATOR_VERSION} (ray.io/v1 CRDs)
`;
    const redisSecret = c.ft ? `---
# Redis credentials used for GCS fault tolerance (replace with External Secrets / Vault in prod)
apiVersion: v1
kind: Secret
metadata:
  name: ray-redis-auth
  namespace: ray-system
type: Opaque
stringData:
  password: change-me
` : '';

    if (c.kind === 'RayJob') {
      return `${header}${redisSecret}---
apiVersion: ray.io/v1
kind: RayJob
metadata:
  name: ${name}
  namespace: ray-system
spec:
  entrypoint: python /home/ray/workload.py
  submissionMode: K8sJobMode
  shutdownAfterJobFinishes: true   # tear the cluster down when the job ends
  ttlSecondsAfterFinished: 300
  activeDeadlineSeconds: 14400
  backoffLimit: 2
  runtimeEnvYAML: |
    pip:
      - torch==2.5.1
    env_vars:
      NUM_WORKERS: "${c.max}"
  rayClusterSpec:
${rayClusterSpec(c, 4)}
`;
    }

    if (c.kind === 'RayService') {
      return `${header}${redisSecret}---
apiVersion: ray.io/v1
kind: RayService
metadata:
  name: ${name}
  namespace: ray-system
spec:
  upgradeStrategy:
    type: NewCluster   # blue/green: new cluster is warmed up before traffic switches
  serviceUnhealthySecondThreshold: 900
  deploymentUnhealthySecondThreshold: 300
  serveConfigV2: |
    applications:
      - name: llm
        import_path: workload:app
        route_prefix: /
        deployments:
          - name: Predictor
            autoscaling_config:
              min_replicas: ${c.min}
              max_replicas: ${c.max}
              target_ongoing_requests: 8
            ray_actor_options:
              num_gpus: ${c.profile.gpu}
  rayClusterConfig:
${rayClusterSpec(c, 4)}
`;
    }

    return `${header}${redisSecret}---
apiVersion: ray.io/v1
kind: RayCluster
metadata:
  name: ${name}
  namespace: ray-system
spec:
${rayClusterSpec(c, 2)}
`;
  }

  function buildPython(c) {
    if (c.kind === 'RayService') {
      return `"""Ray Serve application deployed by the RayService CR (import_path: workload:app)."""
from ray import serve
from starlette.requests import Request


@serve.deployment(ray_actor_options={"num_gpus": ${c.profile.gpu}})
class Predictor:
    def __init__(self) -> None:
        # Load your model once per replica here (e.g. vLLM / transformers pipeline).
        self.model_name = "demo-model"

    async def __call__(self, request: Request) -> dict:
        payload = await request.json()
        return {"model": self.model_name, "echo": payload.get("prompt", "")}


app = Predictor.bind()
`;
    }
    if (c.kind === 'RayJob') {
      return `"""Distributed training job submitted by the RayJob CR."""
import os

import ray.train.torch
from ray.train import ScalingConfig
from ray.train.torch import TorchTrainer


def train_loop_per_worker(config: dict) -> None:
    import torch

    model = ray.train.torch.prepare_model(torch.nn.Linear(16, 1))
    optim = torch.optim.SGD(model.parameters(), lr=config["lr"])
    for epoch in range(config["epochs"]):
        x, y = torch.randn(64, 16), torch.randn(64, 1)
        loss = torch.nn.functional.mse_loss(model(x), y)
        optim.zero_grad()
        loss.backward()
        optim.step()
        ray.train.report({"epoch": epoch, "loss": loss.item()})


if __name__ == "__main__":
    trainer = TorchTrainer(
        train_loop_per_worker,
        train_loop_config={"lr": 1e-3, "epochs": 5},
        scaling_config=ScalingConfig(
            num_workers=int(os.environ.get("NUM_WORKERS", "${c.max}")),
            use_gpu=${c.profile.gpu ? 'True' : 'False'},
        ),
    )
    print(trainer.fit().metrics)
`;
    }
    return `"""Connect to the RayCluster and fan out tasks across the worker group."""
import ray

# Via the head service created by KubeRay: <cluster>-head-svc:10001
ray.init(address="ray://ray-cluster-${c.profile.label.toLowerCase()}-head-svc.ray-system.svc:10001")


@ray.remote(num_gpus=${c.profile.gpu})
def score(shard: int) -> dict:
    import socket
    return {"shard": shard, "node": socket.gethostname()}


if __name__ == "__main__":
    # More pending tasks than workers triggers the autoscaler (up to ${c.max} workers).
    results = ray.get([score.remote(i) for i in range(${c.max * 4})])
    print(f"{len(results)} shards on {len({r['node'] for r in results})} nodes")
`;
  }

  function compileSourceCode() {
    const c = readConfig();

    compiledCode = {
      manifest: buildManifest(c),
      helm: `#!/usr/bin/env bash
# Install the KubeRay operator (CRDs + controller) with Helm
set -euo pipefail

helm repo add kuberay https://ray-project.github.io/kuberay-helm/
helm repo update

helm upgrade --install kuberay-operator kuberay/kuberay-operator \\
  --version ${OPERATOR_VERSION} \\
  --namespace kuberay-system --create-namespace \\
  --set resources.requests.cpu=100m \\
  --set resources.requests.memory=512Mi \\
  --set resources.limits.memory=512Mi \\
  --wait

kubectl create namespace ray-system --dry-run=client -o yaml | kubectl apply -f -
kubectl get crd rayclusters.ray.io rayjobs.ray.io rayservices.ray.io
`,
      python: buildPython(c),
      monitoring: `# Scrape Ray head + worker metrics (port 8080) with Prometheus Operator
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: ray-workers-monitor
  namespace: ray-system
  labels:
    release: prometheus
spec:
  jobLabel: ray-workers
  namespaceSelector:
    matchNames: [ray-system]
  selector:
    matchLabels:
      ray.io/is-ray-node: "yes"
  podMetricsEndpoints:
    - port: metrics
      interval: 15s
---
# Alert when the autoscaler is pinned at maxReplicas (${c.max})
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: kuberay-alerts
  namespace: ray-system
  labels:
    release: prometheus
spec:
  groups:
    - name: kuberay
      rules:
        - alert: RayClusterAtMaxScale
          expr: count(ray_node_cpu_count{ray_io_node_type="worker"}) >= ${c.max}
          for: 15m
          labels: { severity: warning }
          annotations:
            summary: "Ray worker group has been at maxReplicas for 15m - raise the limit or add capacity"
`,
      compose: `# Local test cluster: kind create cluster --config kind-cluster.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: kuberay-dev
nodes:
  - role: control-plane
  - role: worker
  - role: worker
# Then:
#   bash install-operator.sh
#   kubectl apply -f kuberay.yaml
#   kubectl port-forward -n ray-system svc/<cluster>-head-svc 8265:8265   # Ray dashboard
`,
      workflow: `name: KubeRay Manifest Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: helm/kind-action@v1
        with:
          cluster_name: kuberay-ci
      - name: Install KubeRay operator
        run: bash scripts/install-operator.sh
      - name: Server-side dry-run against real CRD schemas
        run: kubectl apply --dry-run=server -f manifests/
      - name: Validate Python workloads
        run: python -m py_compile workloads/*.py
`,
      script: `#!/usr/bin/env bash
# Validate generated KubeRay manifests against the live CRD schemas
set -euo pipefail

echo "[1/4] Checking KubeRay CRDs are installed..."
kubectl get crd rayclusters.ray.io rayjobs.ray.io rayservices.ray.io >/dev/null

echo "[2/4] Server-side dry-run of ${c.kind} manifest..."
kubectl apply --dry-run=server -f kuberay.yaml

echo "[3/4] Guardrail: no floating image tags..."
if grep -E 'image: .*:latest' kuberay.yaml; then echo "Pinned Ray image required"; exit 1; fi

echo "[4/4] Compiling Python workload..."
python3 -m py_compile workload.py

echo "All checks passed."
`
    };

    if (elements.codeOutput) {
      elements.codeOutput.textContent = compiledCode[activeTab] || '// Code unavailable';
    }
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab') || 'manifest';
      if (elements.codeOutput) {
        elements.codeOutput.textContent = compiledCode[activeTab] || '// Code unavailable';
      }
    });
  });

  ['crdKind', 'workerProfile', 'maxReplicas', 'gcsFaultTolerance'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      updateHUD();
      compileSourceCode();
    });
  });

  if (elements.btnRecalculate) {
    elements.btnRecalculate.addEventListener('click', () => {
      updateHUD();
      compileSourceCode();
    });
  }

  if (elements.btnCopy) {
    elements.btnCopy.addEventListener('click', () => {
      const code = compiledCode[activeTab] || '';
      navigator.clipboard.writeText(code).then(() => {
        elements.btnCopy.textContent = 'Copied!';
        setTimeout(() => elements.btnCopy.textContent = 'Copy', 1500);
      });
    });
  }

  if (elements.btnDownload) {
    elements.btnDownload.addEventListener('click', () => {
      const code = compiledCode[activeTab] || '';
      const filename = fileExtensions[activeTab] || 'code.txt';
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  function appendTerminal(line, isCmd = false) {
    if (!elements.terminalViewport) return;
    const div = document.createElement('div');
    if (isCmd) {
      div.className = 'text-cyan-400 font-semibold';
      div.textContent = `$ ${line}`;
    } else {
      div.className = 'text-slate-400 whitespace-pre';
      div.textContent = line;
    }
    elements.terminalViewport.appendChild(div);
    elements.terminalViewport.scrollTop = elements.terminalViewport.scrollHeight;
  }

  function runCommand(cmd) {
    const cleanCmd = cmd.trim();
    if (!cleanCmd) return;
    appendTerminal(cleanCmd, true);
    const c = readConfig();
    const name = `ray-${c.kind.toLowerCase().replace('ray', '')}-${c.profile.label.toLowerCase()}`;

    if (cleanCmd === 'clear') {
      elements.terminalViewport.innerHTML = '<div class="text-slate-500">$ # Terminal cleared.</div>';
      return;
    }

    if (cleanCmd.startsWith('kubectl apply')) {
      if (c.ft) appendTerminal('secret/ray-redis-auth created');
      appendTerminal(`${c.kind.toLowerCase()}.ray.io/${name} created`);
    } else if (cleanCmd.startsWith('kubectl get ray')) {
      appendTerminal('NAME                 DESIRED WORKERS   AVAILABLE WORKERS   STATUS   AGE');
      appendTerminal(`${name.padEnd(20)} ${String(c.min).padEnd(17)} ${String(c.min).padEnd(19)} ready    42s`);
    } else if (cleanCmd.includes('validate.sh')) {
      appendTerminal('Executing: bash scripts/validate.sh...');
      setTimeout(() => {
        appendTerminal('[1/4] Checking KubeRay CRDs are installed... ✓');
        appendTerminal(`[2/4] Server-side dry-run of ${c.kind} manifest... ✓`);
        appendTerminal('[3/4] Guardrail: no floating image tags... ✓');
        appendTerminal('[4/4] Compiling Python workload... ✓');
        appendTerminal('All checks passed.');
      }, 200);
    } else if (cleanCmd.includes('gh repo view')) {
      appendTerminal('Repository: Pradeeptalari14/tp-kuberay');
      appendTerminal('Visibility: PUBLIC | Branch: main');
    } else {
      appendTerminal(`Simulated: ${cleanCmd}`);
      appendTerminal('Try: kubectl apply -f kuberay.yaml | kubectl get rayclusters | bash scripts/validate.sh | gh repo view');
    }
  }

  document.querySelectorAll('.terminal-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) runCommand(cmd);
    });
  });

  if (elements.terminalInput) {
    elements.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = elements.terminalInput.value;
        elements.terminalInput.value = '';
        runCommand(val);
      }
    });
  }

  updateHUD();
  compileSourceCode();
});
