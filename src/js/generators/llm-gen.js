import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'deployment';

    // SRE Code Explanations Database
    const tabExplanations = {
      deployment: {
        title: "Kubernetes LLM Deployment",
        filename: "deployment.yaml",
        why: "Defines the Kubernetes workload specs for hosting large models using vLLM/Triton. It configures target GPU limit keys (`nvidia.com/gpu`), resource requests, model parameters, and volume mounts for weight storage.",
        when: "Use this to launch massive GPU-backed language models inside private Kubernetes namespaces.",
        where: "Deploy directly on a GPU node group inside your Kubernetes cluster.",
        command: "kubectl apply -f deployment.yaml",
        practices: [
          "Set GPU resources limit keys strictly to match your execution parallel count.",
          "Use quantization (AWQ) to significantly reduce GPU RAM footprint.",
          "Enable readiness/liveness probes pointing to the vLLM health API endpoint."
        ],
        ai_mlops: "Lays down the core model orchestration foundation for the **Kubernetes Troubleshooting Agent** and **vLLM-backed LLM Hosting** workspaces.",
        flow: "[Kubernetes API] ➔ [Schedules GPU Node] ➔ [Mounts Cache Volume] ➔ [Launches vLLM Container]"
      },
      service: {
        title: "K8s LLM API Service Discovery",
        filename: "service.yaml",
        why: "Creates a stable cluster networking interface to route API request queries to active LLM engine pods on port 8000.",
        when: "Use to expose the model completions endpoints to local client apps or API gateways inside the cluster.",
        where: "Apply within your target namespace in the Kubernetes control cluster.",
        command: "kubectl apply -f service.yaml",
        practices: [
          "Verify targetPort matches the container API port.",
          "Use ClusterIP for secure, internal-only backend discovery."
        ],
        ai_mlops: "Provides the endpoint routing abstraction for the **RAG Knowledge Chatbot** and **DevOps Copilot** backend clients.",
        flow: "[Client App] ➔ [llm-service:8000] ➔ [Routes to vLLM Pod Replicas]"
      },
      ingress: {
        title: "LLM Ingress Routing & SSL",
        filename: "ingress.yaml",
        why: "Manages external HTTP traffic routing, mapping public hosts queries to internal LLM service ports with SSL certificate provisions.",
        when: "Use to expose the private API completions server securely to the external developers and applications.",
        where: "Apply inside the cluster ingress namespace.",
        command: "kubectl apply -f ingress.yaml",
        practices: [
          "Annotate to integrate Cert-Manager for automatic certificate creations.",
          "Restrict ingress paths to authorized domains only."
        ],
        ai_mlops: "Provides secure TLS endpoint interfaces for the **SRE GenAI Copilot** analytics clients.",
        flow: "[External Dev Client] ➔ [Ingress Controller (SSL)] ➔ [Routes to llm-service]"
      },
      prometheus: {
        title: "Prometheus Telemetry Scraper",
        filename: "prometheus.yml",
        why: "Tells Prometheus scraper daemons to scrap GPU memory usage, token throughput, and cache metrics from the engine.",
        when: "Include when monitoring LLM performance and request queuing times inside telemetry dashboards.",
        where: "Mount into your Prometheus configuration workspace directory.",
        command: "prometheus --config.file=prometheus.yml",
        practices: [
          "Track KV Cache utilization closely to optimize request concurrent queue limits.",
          "Alert SREs if GPU temperatures or limits exceed warning thresholds."
        ],
        ai_mlops: "Feeds active model efficiency statistics directly into the **SRE GenAI Copilot** dashboard.",
        flow: "[Prometheus Daemon] ── Scrapes (15s) ──► [vLLM /metrics] ➔ [Saves to TSDB]"
      },
      readme: {
        title: "Deployment & Verification Guide",
        filename: "README.md",
        why: "Provides step-by-step commands to configure token tokens, mount cache volumes, and verify GPU execution.",
        when: "Include in the GitOps deployment repository to guide SREs on setting up LLM pods.",
        where: "Save in the root of the manifests directory.",
        command: "# View in terminal or markdown reader",
        practices: [
          "Document mandatory environment variables (e.g. HUGGING_FACE_HUB_TOKEN).",
          "Include API verification curl templates."
        ],
        ai_mlops: "Provides documentation on hosting and verifying large language model pipelines in production.",
        flow: "[README.md Guide] ➔ [Directs Operator deployment checklists]"
      }
    };

    let compiledCode = {
      deployment: '',
      service: '',
      ingress: '',
      prometheus: '',
      readme: ''
    };

    const tabConfigs = {
      deployment: { label: 'deployment.yaml', filename: 'deployment', ext: '.yaml' },
      service: { label: 'service.yaml', filename: 'service', ext: '.yaml' },
      ingress: { label: 'ingress.yaml', filename: 'ingress', ext: '.yaml' },
      prometheus: { label: 'prometheus.yml', filename: 'prometheus', ext: '.yml' },
      readme: { label: 'README.md', filename: 'README', ext: '.md' }
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      setupCompilerTriggers(triggerCompileAll);
      $('gpu_util').addEventListener('input', (e) => {
        $('gpu_util_val').textContent = e.target.value;
      });
    }

    function triggerCompileAll() {
      compileDeployment();
      compileService();
      compileIngress();
      compilePrometheus();
      compileReadme();
      updateViewportContent();
    }

    function compileDeployment() {
      const model = $('llm_model').value;
      const engine = $('llm_engine').value;
      const gpu = $('llm_gpu').value;
      const quant = $('llm_quant').value;
      const tp = $('tensor_parallel').value;
      const gpuUtil = $('gpu_util').value;
      const ns = $('k8s_namespace').value.trim() || 'llm-hosting';

      let containerArgs = '';
      if (engine === 'vllm') {
        containerArgs = `        args:
        - "--model"
        - "${model}"
        - "--tensor-parallel-size"
        - "${tp}"
        - "--gpu-memory-utilization"
        - "${gpuUtil}"`;
        if (quant !== 'none') {
          containerArgs += `\n        - "--quantization"\n        - "${quant}"`;
        }
      } else if (engine === 'triton') {
        containerArgs = `        args:
        - "tritonserver"
        - "--model-repository=/models"
        - "--allow-gpu-metrics=true"`;
      } else {
        containerArgs = `        args:
        - "--model-id"
        - "${model}"
        - "--num-shard"
        - "${tp}"`;
      }

      let gpuLimit = '1';
      if (gpu === 'a100' || gpu === 'h100') {
        gpuLimit = tp;
      }

      let code = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-engine
  namespace: ${ns}
  labels:
    app: llm-engine
    role: inference
spec:
  replicas: 1
  selector:
    matchLabels:
      app: llm-engine
  template:
    metadata:
      labels:
        app: llm-engine
    spec:
      containers:
      - name: llm-container
        image: ${engine === 'vllm' ? 'vllm/vllm-openai:latest' : (engine === 'triton' ? 'nvcr.io/nvidia/tritonserver:latest' : 'ghcr.io/huggingface/text-generation-inference:latest')}
        imagePullPolicy: IfNotPresent
${containerArgs}
        ports:
        - containerPort: 8000
          name: http-api
        resources:
          limits:
            cpu: "8"
            memory: "32Gi"
            nvidia.com/gpu: "${gpuLimit}"
          requests:
            cpu: "4"
            memory: "16Gi"
            nvidia.com/gpu: "${gpuLimit}"
        env:
        - name: HUGGING_FACE_HUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: hf-secret
              key: token
        volumeMounts:
        - name: model-cache
          mountPath: /root/.cache/huggingface
      volumes:
      - name: model-cache
        persistentVolumeClaim:
          claimName: llm-model-pvc
`;
      compiledCode.deployment = code;
    }

    function compileService() {
      const ns = $('k8s_namespace').value.trim() || 'llm-hosting';
      let code = `apiVersion: v1
kind: Service
metadata:
  name: llm-service
  namespace: ${ns}
  labels:
    app: llm-engine
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: http-api
    name: http
    protocol: TCP
  selector:
    app: llm-engine
`;
      compiledCode.service = code;
    }

    function compileIngress() {
      const ns = $('k8s_namespace').value.trim() || 'llm-hosting';
      const host = $('ingress_host').value.trim() || 'llm.production.sre';
      const enable = $('enable_ingress').checked;

      if (!enable) {
        compiledCode.ingress = "# Ingress is disabled by choice.";
        return;
      }

      let code = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: llm-ingress
  namespace: ${ns}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-body-size: "128m"
spec:
  tls:
  - hosts:
    - ${host}
    secretName: llm-tls-secret
  rules:
  - host: ${host}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: llm-service
            port:
              number: 8000
`;
      compiledCode.ingress = code;
    }

    function compilePrometheus() {
      const enable = $('enable_telemetry').checked;
      const ns = $('k8s_namespace').value.trim() || 'llm-hosting';

      if (!enable) {
        compiledCode.prometheus = "# Telemetry metrics scraping is disabled.";
        return;
      }

      let code = `global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'llm-vllm-metrics'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      action: keep
      regex: llm-engine
    - source_labels: [__meta_kubernetes_namespace]
      action: keep
      regex: ${ns}
    - source_labels: [__address__]
      action: replace
      target_label: __address__
      regex: ([^:]+)(?::\\d+)?
      replacement: $1:8000
`;
      compiledCode.prometheus = code;
    }

    function compileReadme() {
      const model = $('llm_model').value;
      const engine = $('llm_engine').value;
      const tp = $('tensor_parallel').value;
      const ns = $('k8s_namespace').value.trim() || 'llm-hosting';

      let code = `# Production LLM Orchestration Deployment Guide

This workspace deploys the large language model \`${model}\` inside Kubernetes namespace \`${ns}\` using the \`${engine}\` inference engine.

## Prerequisites

1.  **NVIDIA GPU operator** active in your Kubernetes cluster.
2.  **HuggingFace token secret** configured in namespace \`${ns}\`:
    \`kubectl create secret generic hf-secret --from-literal=token=YOUR_HF_TOKEN -n ${ns}\`
3.  **PV Storage Provisioner** active to mount the \`llm-model-pvc\`.

## Deploy Commands

\`\`\`bash
# 1. Create target namespace
kubectl create namespace ${ns}

# 2. Deploy secret and resources
kubectl apply -f deployment.yaml -n ${ns}
kubectl apply -f service.yaml -n ${ns}
kubectl apply -f ingress.yaml -n ${ns}
\`\`\`

## Verify Setup

Stream the container logs to track model weights downloading:
\`\`\`bash
kubectl logs -f deployment/llm-engine -n ${ns}
\`\`\`

Once running, send a completions request:
\`\`\`bash
curl http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model}",
    "messages": [{"role": "user", "content": "Explain what PagedAttention is in SRE terms."}]
  }'
\`\`\`
`;
      compiledCode.readme = code;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const config = tabConfigs[tabId];
      $('download-name-input').value = config.filename;
      $('file-extension-tag').textContent = config.ext;

      updateViewportContent();
    }

    function updateViewportContent() {
      const content = compiledCode[activeTab];
      $('output-box').textContent = content || '';
    }

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      if (!content) {
        showToast("⚠️ Active tab is empty!");
        return;
      }
      
      navigator.clipboard.writeText(content).then(() => {
        showToast("📋 Copied to clipboard!");
      }).catch(err => {
        showToast("❌ Failed to copy to clipboard.");
      });
    }

    function clearAllFields() {
      compiledCode[activeTab] = '';
      updateViewportContent();
      showToast("🗑️ Viewport cleared.");
    }

    function downloadWorkspaceZip() {
      const zip = new JSZip();
      zip.file("README.md", compiledCode.readme);
      zip.file("deployment.yaml", compiledCode.deployment);
      zip.file("service.yaml", compiledCode.service);
      if ($('enable_ingress').checked) {
        zip.file("ingress.yaml", compiledCode.ingress);
      }
      if ($('enable_telemetry').checked) {
        zip.file("prometheus.yml", compiledCode.prometheus);
      }

      zip.generateAsync({ type: "blob" }).then(function (content) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "llm-deployment-project.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("⬇️ LLM Workspace zip downloaded!");
      });
    }

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      $('drawer-title').textContent = explanation.title;
      $('drawer-filename').textContent = explanation.filename;
      $('explain-why').innerHTML = explanation.why;
      $('explain-when').innerHTML = explanation.when;
      $('explain-where').innerHTML = explanation.where;
      $('explain-command').textContent = explanation.command;

      const practicesBox = $('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';
      $('explain-flow').textContent = explanation.flow;

      const drawer = $('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = $('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

    function showToast(message) {
      const wrapper = $('toast-wrapper');
      const content = $('toast-content');
      content.innerHTML = `<span>⚡</span> ${message}`;
      
      wrapper.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
      wrapper.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        wrapper.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        wrapper.classList.remove('opacity-100', 'translate-y-0');
      }, 2500);
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadWorkspaceZip = downloadWorkspaceZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
