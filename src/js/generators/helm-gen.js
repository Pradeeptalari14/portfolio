import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'chart';

    let compiledCode = {
      chart: '',
      values: '',
      deployment: '',
      service: ''
    ,
  flow: ''
};

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      $('ingress_enable').addEventListener('change', function() {
        $('ingress-box').classList.toggle('hidden', !this.checked);
        triggerCompileAll();
      });

      $('storage_enable').addEventListener('change', function() {
        $('storage-box').classList.toggle('hidden', !this.checked);
        triggerCompileAll();
      });

      setupCompilerTriggers(triggerCompileAll);
    }

    function triggerCompileAll() {
      compileChart();
      compileValues();
      compileDeployment();
      compileService();
      compileMermaidFlow();
  updateViewportContent();
    }

    function compileChart() {
      const name = $('chart_name').value;
      const desc = $('chart_desc').value;
      const ver = $('chart_version').value;
      const appVer = $('app_version').value;

      let code = `apiVersion: v2\nname: ${name}\ndescription: ${desc}\ntype: application\nversion: ${ver}\nappVersion: "${appVer}"\n`;
      compiledCode.chart = code;
    }

    function compileValues() {
      const repo = $('image_repo').value;
      const policy = $('image_policy').value;
      const replicas = $('replicas').value;
      const serviceType = $('service_type').value;
      const port = $('service_port').value;
      const targetPort = $('container_port').value;

      const isIngress = $('ingress_enable').checked;
      const ingressHost = $('ingress_host').value;

      const isStorage = $('storage_enable').checked;
      const pvcSize = $('pvc_size').value;
      const mountPath = $('mount_path').value;

      let code = `# values.yaml v${SCRIPT_VERSION} - Configuration overrides compiled client-side\n\n`;
      code += `replicaCount: ${replicas}\n\n`;
      code += `image:\n  repository: ${repo}\n  pullPolicy: ${policy}\n  tag: "latest"\n\n`;
      code += `service:\n  type: ${serviceType}\n  port: ${port}\n  targetPort: ${targetPort}\n\n`;
      
      code += `ingress:\n  enabled: ${isIngress}\n`;
      if (isIngress) {
        code += `  host: "${ingressHost}"\n  path: /\n`;
      }

      code += `\nstorage:\n  enabled: ${isStorage}\n`;
      if (isStorage) {
        code += `  size: "${pvcSize}"\n  mountPath: "${mountPath}"\n`;
      }

      compiledCode.values = code;
    }

    function compileDeployment() {
      const name = $('chart_name').value;
      const isStorage = $('storage_enable').checked;

      let code = `# templates/deployment.yaml\n`;
      code += `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include "${name}.fullname" . }}\n  labels:\n    app.kubernetes.io/name: ${name}\nspec:\n  replicas: {{ .Values.replicaCount }}\n  selector:\n    matchLabels:\n      app.kubernetes.io/name: ${name}\n  template:\n    metadata:\n      labels:\n        app.kubernetes.io/name: ${name}\n    spec:\n      containers:\n        - name: ${name}\n          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"\n          imagePullPolicy: {{ .Values.image.pullPolicy }}\n          ports:\n            - name: http\n              containerPort: {{ .Values.service.targetPort }}\n              protocol: TCP\n`;

      if (isStorage) {
        code += `          volumeMounts:\n            - name: app-persistent-storage\n              mountPath: {{ .Values.storage.mountPath }}\n      volumes:\n        - name: app-persistent-storage\n          persistentVolumeClaim:\n            claimName: {{ include "${name}.fullname" . }}-pvc\n`;
      }

      compiledCode.deployment = code;
    }

    function compileService() {
      const name = $('chart_name').value;
      let code = `# templates/service.yaml\n`;
      code += `apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include "${name}.fullname" . }}\n  labels:\n    app.kubernetes.io/name: ${name}\nspec:\n  type: {{ .Values.service.type }}\n  ports:\n    - port: {{ .Values.service.port }}\n      targetPort: {{ .Values.service.targetPort }}\n      protocol: TCP\n      name: http\n  selector:\n    app.kubernetes.io/name: ${name}\n`;
      compiledCode.service = code;
    }

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Values[📄 values.yaml overrides] -->|helm install| Release[⛵ Helm Chart Release]\n  Release -->|Manifests| K8s[☸️ Kubernetes Resources]\n  K8s -->|Deploy| Pods[🚀 Managed Pods]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      if (tabId === 'flow') {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
  } else if (tabId === 'chart') {
        nameBox.value = 'Chart';
        extTag.textContent = '.yaml';
      } else if (tabId === 'values') {
        nameBox.value = 'values';
        extTag.textContent = '.yaml';
      } else if (tabId === 'deployment') {
        nameBox.value = 'deployment';
        extTag.textContent = '.yaml';
      } else if (tabId === 'service') {
        nameBox.value = 'service';
        extTag.textContent = '.yaml';
      }
      updateViewportContent();
    }

    function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    try {
      mermaid.run({
        nodes: [container.querySelector('.mermaid')]
      });
    } catch (e) {
      console.error("Mermaid render error:", e);
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        showToast('✅ Copied tab config to clipboard!');
      });
    }

    function downloadHelmZip() {
      const name = $('chart_name').value;
      const zip = new JSZip();

      // Create structure
      zip.file(`${name}/Chart.yaml`, compiledCode.chart);
      zip.file(`${name}/values.yaml`, compiledCode.values);
      zip.file(`${name}/templates/deployment.yaml`, compiledCode.deployment);
      zip.file(`${name}/templates/service.yaml`, compiledCode.service);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}-chart.zip`;
        a.click();
        showToast(`⬇️ ${name}-chart.zip downloaded successfully!`);
      });
    }

    function clearAllFields() {
      $('chart_name').value = 'my-app';
      $('chart_desc').value = 'A production-ready Helm chart compiled via Talari Pradeep\'s Studio';
      $('chart_version').value = '0.1.0';
      $('app_version').value = '1.0.0';
      $('replicas').value = '2';
      $('image_repo').value = 'nginx';
      $('image_policy').value = 'IfNotPresent';
      $('service_type').value = 'ClusterIP';
      $('service_port').value = '80';
      $('container_port').value = '80';
      $('ingress_enable').checked = true;
      $('ingress-box').classList.remove('hidden');
      $('ingress_host').value = 'my-app.local';
      $('storage_enable').checked = false;
      $('storage-box').classList.add('hidden');

      triggerCompileAll();
      showToast('🗑️ Defaults configurations successfully restored!');
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
  
    const tabExplanations = {'chart': {'title': 'Helm Chart Package Configuration', 'filename': 'Chart.yaml', 'why': 'Declares metadata for a Helm release package, setting the chart name, description, type, and semantic version stats.', 'when': 'Use to publish, share, and version-control Kubernetes application packages.', 'where': 'Place in the root of your helm chart directory.', 'command': 'helm lint ./charts/my-app', 'practices': ['Adhere to semantic versioning strictly for releases.', 'Document application version and chart version independently.', 'Maintain charts versions cleanly inside OCI registries.'], 'ai_mlops': 'Packages the **Kubernetes Troubleshooting Agent** helm release for cluster deployment.', 'flow': '[Chart.yaml Definition] ➔ [Helm Lint / Package] ➔ [Publish to Chart Museum]'}, 'values': {'title': 'Helm Parameter Values', 'filename': 'values.yaml', 'why': 'Serves as the central configuration config to parameterize Kubernetes templates (ports, replicas, image tags, environment keys).', 'when': 'Edit to customize deployments across environments (Dev, Staging, Production) without changing manifest code.', 'where': 'Place in the root of your helm chart folder.', 'command': 'helm install my-release ./charts/my-app -f values.yaml', 'practices': ['Provide safe default values for all parameters.', 'Structure configurations logically into sections (e.g. image, service, ingress).', 'Use strict schema definitions to validate types.'], 'ai_mlops': 'Provides resources limits values for scheduling MLOps agent pods.', 'flow': '[values.yaml overrides] ➔ [Helm Template Generator] ➔ [Renders custom K8s Manifests]'}, 'helpers': {'title': 'Helm Template Helpers', 'filename': '_helpers.tpl', 'why': 'Defines reusable named templates and labels to dynamically generate unified chart metadata (names, labels, release tags).', 'when': "Include in the templates/ folder to enforce DRY (Don't Repeat Yourself) templating blocks across manifest files.", 'where': 'Place inside the `templates/` folder of your helm chart.', 'command': 'helm template ./charts/my-app', 'practices': ['Enforce standard label structures to ease metrics analysis.', 'Wrap names cleanly to prevent K8s name length limit overflows (63 chars).', 'Use clean comment blocks to document custom helper functions.'], 'ai_mlops': 'Ensures uniform SRE tags are injected across running AI pods.', 'flow': '[_helpers.tpl Definitions] ➔ [Manifest Templates] ➔ [Compiles Unified Cluster Labels]'}, 'readme': {'title': 'Helm Chart Deployment Guide', 'filename': 'README.md', 'why': 'Instructs operators on how to deploy, upgrade, and configure the helm package parameters.', 'when': 'Include in the chart repository to document all configurable parameters in values.yaml.', 'where': 'Save in the root of the chart directory.', 'command': 'helm show readme ./charts/my-app', 'practices': ['List all values parameters in a neat markdown table.', 'Document step-by-step upgrade prerequisites.', 'Include typical deployment commands.'], 'ai_mlops': 'Guides helm packaging commands for deploying AI services.', 'flow': '[README.md Guide] ➔ [Enables operators to deploy helm releases]'}};

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
window.downloadHelmZip = downloadHelmZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
