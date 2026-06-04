import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'deployment';
    let currentStep = 1;

    let compiledCode = {
      deployment: '',
      service: '',
      ingress: '',
      hpa: ''
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      setupCompilerTriggers(triggerCompileAll);
    }

    // Wizard navigation controls
    function setWizardStep(stepNum) {
      currentStep = stepNum;
      
      // Update nav styles
      $$('.wizard-step').forEach(step => step.classList.remove('active'));
      $('step-nav-' + stepNum).classList.add('active');

      // Update panels visibility
      $$('.wizard-panel').forEach(panel => panel.classList.add('hidden'));
      $('step-panel-' + stepNum).classList.remove('hidden');

      if (stepNum === 5) {
        populateReviewSummary();
      }
    }

    // Populate the step 5 review parameters dynamically
    function populateReviewSummary() {
      const box = $('review-summary-box');
      box.innerHTML = `
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p class="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1">Cluster Settings</p>
          <p>Environment: <strong>${$('env_type').value}</strong></p>
          <p>Cloud Provider: <strong>${$('cloud_prov').value}</strong></p>
          <p>K8s Version: <strong>${$('k8s_version').value}</strong></p>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p class="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1">Workload Settings</p>
          <p>Namespace: <strong>${$('namespace').value}</strong></p>
          <p>Workload: <strong>${$('workload_type').value}</strong></p>
          <p>Name: <strong>${$('workload_name').value || '<span class="text-rose-500 font-bold">Required</span>'}</strong></p>
          <p>Image: <strong>${$('image').value || '<span class="text-rose-500 font-bold">Required</span>'}</strong></p>
          <p>Replicas: <strong>${$('replicas').value}</strong></p>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p class="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1">Networking Settings</p>
          <p>Service Type: <strong>${$('service_type').value}</strong></p>
          <p>Service Name: <strong>${$('service_name').value}</strong></p>
          <p>Ingress Enabled: <strong>${$('ingress_enable').checked ? 'Yes' : 'No'}</strong></p>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p class="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1">Advanced Settings</p>
          <p>CPU Req / Limit: <strong>${$('cpu_req').value} / ${$('cpu_lim').value}</strong></p>
          <p>Mem Req / Limit: <strong>${$('mem_req').value} / ${$('mem_lim').value}</strong></p>
          <p>HPA / VPA: <strong>${$('hpa_enable').checked ? 'Yes' : 'No'} / ${$('vpa_enable').checked ? 'Yes' : 'No'}</strong></p>
          <p>RBAC / NetPol / Secure: <strong>${$('rbac_enable').checked ? 'Yes' : 'No'} / ${$('netpol_enable').checked ? 'Yes' : 'No'} / ${$('k8s_sec_harden').checked ? 'Yes' : 'No'}</strong></p>
        </div>
      `;
    }

    // Trigger manifest compilation
    function triggerCompileAll() {
      compileDeployment();
      compileService();
      compileIngress();
      compileHpa();
      updateViewportContent();
    }

    // Compile deployment.yaml
    function compileDeployment() {
      const type = $('workload_type').value;
      const name = $('workload_name').value.trim() || 'my-app';
      const ns = $('namespace').value.trim() || 'default';
      const image = $('image').value.trim() || 'nginx:latest';
      const port = $('container_port').value || '80';
      const replicas = $('replicas').value || '2';
      const labelsRaw = $('labels').value.split(',');

      const cpuReq = $('cpu_req').value;
      const cpuLim = $('cpu_lim').value;
      const memReq = $('mem_req').value;
      const memLim = $('mem_lim').value;

      const rbac = $('rbac_enable').checked;
      const saName = $('sa_name').value.trim() || 'default';
      const secCtxRaw = $('sec_ctx').value.split('\n');

      let labelsYaml = '';
      labelsRaw.forEach(lbl => {
        const split = lbl.split('=');
        if (split.length === 2) {
          labelsYaml += `    ${split[0].trim()}: "${split[1].trim()}"\n`;
        }
      });
      if (!labelsYaml) {
        labelsYaml = `    app: "${name}"\n    env: "prod"\n`;
      }

      let code = `# apiVersion defines the schema version of the workload resource manifest\napiVersion: apps/v1\n`;
      code += `# kind dictates the API controller resource type to be created in the cluster\nkind: ${type}\n`;
      code += `metadata:\n`;
      code += `  name: ${name}\n`;
      code += `  namespace: ${ns}\n`;
      code += `  labels:\n${labelsYaml}`;
      code += `spec:\n`;
      if (type !== 'DaemonSet') {
        code += `  # replicas determines how many active pod nodes should execute concurrently\n  replicas: ${replicas}\n`;
      }
      code += `  # selector instructs the deployment manager controller how to match target pod labels\n  selector:\n    matchLabels:\n      app: "${name}"\n`;
      code += `  # template describes the configuration blueprint for spawning new pod instances\n  template:\n    metadata:\n      labels:\n        app: "${name}"\n`;
      code += `    spec:\n`;
      if (rbac) {
        code += `      # serviceAccountName binds cluster RBAC permissions down to the executing pod workload\n      serviceAccountName: ${saName}\n`;
      }

      // Security Context
      if ($('sec_ctx').value.trim()) {
        code += `      securityContext:\n`;
        secCtxRaw.forEach(line => {
          if (line.trim()) {
            code += `        ${line.trim()}\n`;
          }
        });
      }

      code += `      containers:\n`;
      code += `      - name: container-app\n`;
      code += `        image: ${image}\n`;
      code += `        imagePullPolicy: IfNotPresent\n`;
      code += `        ports:\n`;
      code += `        - containerPort: ${port}\n`;

      // Container Security Context
      const secHarden = $('k8s_sec_harden').checked;
      if (secHarden) {
        code += `        # SRE: Enforce strict container security boundaries\n`;
        code += `        securityContext:\n`;
        code += `          runAsNonRoot: true\n`;
        code += `          readOnlyRootFilesystem: true\n`;
        code += `          allowPrivilegeEscalation: false\n`;
        code += `          capabilities:\n`;
        code += `            drop:\n`;
        code += `            - ALL\n`;
      }

      // Resources Limits & Requests
      if (cpuReq || cpuLim || memReq || memLim) {
        code += `        # SRE: Enforces CPU and Memory resources limits (Requests for scheduling, Limits for throttling)\n`;
        code += `        resources:\n`;
        if (cpuReq || memReq) {
          code += `          requests:\n`;
          if (cpuReq) code += `            cpu: "${cpuReq}"\n`;
          if (memReq) code += `            memory: "${memReq}"\n`;
        }
        if (cpuLim || memLim) {
          code += `          limits:\n`;
          if (cpuLim) code += `            cpu: "${cpuLim}"\n`;
          if (memLim) code += `            memory: "${memLim}"\n`;
        }
      }

      compiledCode.deployment = code;
    }

    // Compile service.yaml
    function compileService() {
      const type = $('service_type').value;
      const srvName = $('service_name').value.trim() || 'app-service';
      const appName = $('workload_name').value.trim() || 'my-app';
      const ns = $('namespace').value.trim() || 'default';
      const port = $('service_port').value || '80';
      const targetPort = $('target_port').value || '80';

      if (type === 'none') {
        compiledCode.service = `# Service Discovery disabled by choice`;
        return;
      }

      let code = `apiVersion: v1\n`;
      code += `kind: Service\n`;
      code += `metadata:\n`;
      code += `  name: ${srvName}\n`;
      code += `  namespace: ${ns}\n`;
      code += `spec:\n`;
      code += `  type: ${type}\n`;
      code += `  selector:\n`;
      code += `    app: "${appName}"\n`;
      code += `  ports:\n`;
      code += `  - protocol: TCP\n`;
      code += `    port: ${port}\n`;
      code += `    targetPort: ${targetPort}\n`;

      compiledCode.service = code;
    }

    // Compile ingress.yaml
    function compileIngress() {
      const enable = $('ingress_enable').checked;
      const ns = $('namespace').value.trim() || 'default';
      const appName = $('workload_name').value.trim() || 'my-app';
      const srvName = $('service_name').value.trim() || 'app-service';
      const port = $('service_port').value || '80';

      if (!enable) {
        compiledCode.ingress = `# Ingress Routing disabled by choice`;
        return;
      }

      let code = `apiVersion: networking.k8s.io/v1\n`;
      code += `kind: Ingress\n`;
      code += `metadata:\n`;
      code += `  name: ${appName}-ingress\n`;
      code += `  namespace: ${ns}\n`;
      code += `  annotations:\n`;
      code += `    nginx.ingress.kubernetes.io/ssl-redirect: "true"\n`;
      code += `    nginx.ingress.kubernetes.io/rewrite-target: /\n`;
      code += `spec:\n`;
      code += `  ingressClassName: nginx\n`;
      code += `  rules:\n`;
      code += `  - host: my-app.talaripradeep.info\n`;
      code += `    http:\n`;
      code += `      paths:\n`;
      code += `      - path: /\n`;
      code += `        pathType: Prefix\n`;
      code += `        backend:\n`;
      code += `          service:\n`;
      code += `            name: ${srvName}\n`;
      code += `            port:\n`;
      code += `              number: ${port}\n`;

      compiledCode.ingress = code;
    }

    // Compile hpa.yaml
    function compileHpa() {
      const enable = $('hpa_enable').checked;
      const ns = $('namespace').value.trim() || 'default';
      const appName = $('workload_name').value.trim() || 'my-app';
      const type = $('workload_type').value;

      if (!enable) {
        compiledCode.hpa = `# HorizontalPodAutoscaler disabled by choice`;
        return;
      }

      let code = `apiVersion: autoscaling/v2\n`;
      code += `kind: HorizontalPodAutoscaler\n`;
      code += `metadata:\n`;
      code += `  name: ${appName}-hpa\n`;
      code += `  namespace: ${ns}\n`;
      code += `spec:\n`;
      code += `  scaleTargetRef:\n`;
      code += `    apiVersion: apps/v1\n`;
      code += `    kind: ${type}\n`;
      code += `    name: ${appName}\n`;
      code += `  minReplicas: 2\n`;
      code += `  maxReplicas: 10\n`;
      code += `  metrics:\n`;
      code += `  - type: Resource\n`;
      code += `    resource:\n`;
      code += `      name: cpu\n`;
      code += `      target:\n`;
      code += `        type: Utilization\n`;
      code += `        averageUtilization: 75\n`;

      compiledCode.hpa = code;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      nameBox.value = tabId;

      updateViewportContent();
    }

    function updateViewportContent() {
      $('output-box').textContent = compiledCode[activeTab];
    }

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        showToast(`✅ Copied ${activeTab}.yaml to clipboard!`);
      });
    }

    function downloadK8sZip() {
      const zip = new JSZip();
      zip.file('deployment.yaml', compiledCode.deployment);
      zip.file('service.yaml', compiledCode.service);
      zip.file('ingress.yaml', compiledCode.ingress);
      zip.file('hpa.yaml', compiledCode.hpa);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'kubernetes-resources.zip';
        a.click();
        showToast('⬇️ kubernetes-resources.zip downloaded successfully!');
      });
    }

    function clearAllFields() {
      $('env_type').value = 'cloud';
      $('cloud_prov').value = 'aws';
      $('k8s_version').value = '1.28';
      $('namespace').value = 'default';
      $('workload_type').value = 'Deployment';
      $('workload_name').value = 'my-app';
      $('labels').value = 'app=my-app,env=prod';
      $('image').value = 'nginx:latest';
      $('container_port').value = '80';
      $('replicas').value = '2';
      $('service_type').value = 'ClusterIP';
      $('service_name').value = 'app-service';
      $('service_port').value = '80';
      $('target_port').value = '80';
      $('ingress_enable').checked = false;

      $('cpu_req').value = '100m';
      $('cpu_lim').value = '500m';
      $('mem_req').value = '128Mi';
      $('mem_lim').value = '512Mi';
      $('hpa_enable').checked = false;
      $('vpa_enable').checked = false;
      $('rbac_enable').checked = true;
      $('netpol_enable').checked = false;
      $('sa_name').value = 'default';
      $('sec_ctx').value = 'runAsUser: 1000\nfsGroup: 2000';

      setWizardStep(1);
      triggerCompileAll();
      showToast('🗑️ Output configuration cleared and reset to defaults');
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
    }
  
    const tabExplanations = {'deployment': {'title': 'Kubernetes Deployment configuration', 'filename': 'deployment.yaml', 'why': 'Defines the target pod state, setting replica scaling counts, base image tags, ports, probes, and resource constraints.', 'when': 'Use to run scalable, stateless microservices inside Kubernetes clusters.', 'where': 'Apply to target cluster namespace.', 'command': 'kubectl apply -f deployment.yaml', 'practices': ['Define strict CPU/Memory requests and limits.', 'Integrate Readiness/Liveness probes for automatic container recovery.', 'Annotate pods to enable Prometheus metric scraping.'], 'ai_mlops': 'Deploys instances of the **Kubernetes Troubleshooting Agent** with active readiness probes.', 'flow': '[kubectl apply] ➔ [K8s Deployment controller] ➔ [Spins ReplicaSets] ➔ [Launches Pods]'}, 'service': {'title': 'Kubernetes Service configuration', 'filename': 'service.yaml', 'why': 'Establishes a stable networking endpoint (ClusterIP, NodePort, LoadBalancer) to route traffic to active target Pod replicas.', 'when': 'Use to enable internal or external network access to your deployed Pod microservices.', 'where': 'Apply to target cluster namespace.', 'command': 'kubectl apply -f service.yaml', 'practices': ['Use headless services for stateful databases.', 'Set targetPort matching containerPort definitions exactly.', 'Verify selector labels match Pod template labels.'], 'ai_mlops': 'Provides internal cluster routing for requests sent to the **RAG Knowledge Chatbot**.', 'flow': '[Client Traffic] ➔ [Service Endpoint IP] ➔ [Routes traffic to Pod replicas]'}, 'ingress': {'title': 'Kubernetes Ingress Controller Routing', 'filename': 'ingress.yaml', 'why': 'Manages external HTTP/HTTPS routing, mapping target request hosts and paths to target services inside clusters.', 'when': 'Use to expose multiple services to the internet under a single load balancer and domain.', 'where': 'Apply to your cluster ingress namespace.', 'command': 'kubectl apply -f ingress.yaml', 'practices': ["Annotate to automatically provision SSL certs (Cert-Manager/Let's Encrypt).", 'Use secure path matching to prevent unauthorized resource accesses.', 'Monitor ingress controller capacity logs.'], 'ai_mlops': 'Exposes the user dashboard of the **SRE GenAI Copilot** to external endpoints.', 'flow': '[User Browser Request] ➔ [Ingress Controller] ➔ [Routes to Service] ➔ [Routes to Pod]'}, 'configmap': {'title': 'Kubernetes ConfigMap Variables', 'filename': 'configmap.yaml', 'why': 'Stores non-confidential configuration parameters as key-value pairs, decoupling application configs from code packages.', 'when': 'Use to load configurations, ports, and environment flags into your running pods.', 'where': 'Apply to your target cluster namespace.', 'command': 'kubectl apply -f configmap.yaml', 'practices': ['Decrypt sensitive configurations into Secrets instead of ConfigMaps.', 'Decouple configurations to allow easy environment changes.', 'Use ConfigMap volumes to update parameters on the fly.'], 'ai_mlops': 'Feeds system properties and local LLM endpoints into running container pods.', 'flow': '[ConfigMap data] ➔ [Injected as Environment variables / Mounted files] ➔ [Pod reads configs]'}, 'pvc': {'title': 'Kubernetes Persistent Volume Claim', 'filename': 'pvc.yaml', 'why': 'Requests specific storage capacity (e.g. 10Gi) and access modes (ReadWriteOnce) from the cluster persistent storage provider.', 'when': 'Use when deploying stateful applications (like databases or logs) that require data persistence across Pod crashes.', 'where': 'Apply to target cluster namespace.', 'command': 'kubectl apply -f pvc.yaml', 'practices': ['Select the correct storageClass matching execution IOPS requirements.', 'Set accessMode to ReadWriteOnce for typical single-node databases.', 'Monitor volume space usage using Prometheus alerts.'], 'ai_mlops': 'Requests persistent volume slots to store local RAG ChromaDB indices.', 'flow': '[PVC Request] ➔ [PV Provisioner] ➔ [Binds Storage Volume] ➔ [Mounts to Pod Directory]'}, 'hpa': {'title': 'Horizontal Pod Auto-scaler', 'filename': 'hpa.yaml', 'why': 'Configures automatic Pod replication scaling thresholds based on real-time metrics (CPU / Memory utilization).', 'when': 'Use to automatically scale replicas during traffic spikes and scale down during low-load windows.', 'where': 'Apply to target namespace.', 'command': 'kubectl apply -f hpa.yaml', 'practices': ['Define realistic min/max replica boundaries.', 'Set scaling thresholds below peak capacities (e.g. CPU at 75%).', 'Ensure metric-server is active inside the cluster to scrap metrics.'], 'ai_mlops': 'Scales RAG backend pod replicas depending on traffic loads.', 'flow': '[CPU Spike (>75%)] ➔ [HPA Controller detects] ➔ [Increases replicas count]'}, 'readme': {'title': 'Kubernetes Deployment Guide', 'filename': 'README.md', 'why': 'Provides installation steps, namespace configurations, and troubleshooting kubectl checklists.', 'when': 'Always include in your Kubernetes code repositories to guide operators on cluster deployments.', 'where': 'Save in the root of the Kubernetes manifests folder.', 'command': '# View in markdown reader', 'practices': ['Provide clear namespace initialization commands.', 'Document required PV/PVC dependencies.', 'List standard rollout verify commands.'], 'ai_mlops': 'Details cluster configuration steps for deployment of MLOps resources.', 'flow': '[README.md Guide] ➔ [Guides Cluster Deployment Checklists]'}};

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      // Populate drawer content
      document.getElementById('drawer-title').textContent = explanation.title;
      document.getElementById('drawer-filename').textContent = explanation.filename;
      document.getElementById('explain-why').innerHTML = explanation.why;
      document.getElementById('explain-when').innerHTML = explanation.when;
      
      document.getElementById('explain-where').innerHTML = explanation.where;
      document.getElementById('explain-command').textContent = explanation.command;

      const practicesBox = document.getElementById('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      // Populate AI/MLOps Integration
      document.getElementById('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';

      document.getElementById('explain-flow').textContent = explanation.flow;

      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadK8sZip = downloadK8sZip;
window.escapeHtml = escapeHtml;
window.explainActiveTabCode = explainActiveTabCode;
window.setWizardStep = setWizardStep;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
