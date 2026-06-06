import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'application';

    let compiledCode = {
      application: '',
      appproject: '',
      commands: ''
    ,
  flow: ''
};

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      setupCompilerTriggers(triggerCompileAll);
    }

    function triggerCompileAll() {
      compileApplication();
      compileProject();
      compileCommands();
      compileMermaidFlow();
  updateViewportContent();
    }

    function compileApplication() {
      const name = $('app_name').value;
      const project = $('argo_project').value;
      const repo = $('repo_url').value;
      const branch = $('target_branch').value;
      const path = $('target_path').value;
      const server = $('dest_server').value;
      const ns = $('dest_ns').value;

      const isAuto = $('sync_auto').checked;
      const isPrune = $('sync_prune').checked;
      const isSelfHeal = $('sync_selfheal').checked;

      let code = `apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: ${name}\n  namespace: argocd\n  finalizers:\n    - resources-finalizer.argocd.argoproj.io\nspec:\n  project: ${project}\n  source:\n    repoURL: "${repo}"\n    targetRevision: ${branch}\n    path: ${path}\n  destination:\n    server: "${server}"\n    namespace: ${ns}\n`;

      if (isAuto || isPrune || isSelfHeal) {
        code += `  syncPolicy:\n`;
        if (isAuto) {
          code += `    automated:\n`;
          code += `      prune: ${isPrune}\n`;
          code += `      selfHeal: ${isSelfHeal}\n`;
        }
        code += `    syncOptions:\n      - CreateNamespace=true\n      - ApplyOutOfSyncOnly=true\n`;
      }

      compiledCode.application = code;
    }

    function compileProject() {
      const project = $('argo_project').value;
      const repoLimit = $('project_repo_limit').value;
      const server = $('dest_server').value;
      const nsLimit = $('project_ns_limit').value.split(',').map(n => n.trim()).filter(Boolean);

      let code = `apiVersion: argoproj.io/v1alpha1\nkind: AppProject\nmetadata:\n  name: ${project}\n  namespace: argocd\nspec:\n  description: Multi-tenant tenancy bounds mapped by Talari Pradeep's Studio\n  sourceRepos:\n    - "${repoLimit}"\n  destinations:\n`;
      
      if (nsLimit.length > 0) {
        nsLimit.forEach(ns => {
          code += `    - server: "${server}"\n      namespace: ${ns}\n`;
        });
      } else {
        code += `    - server: "${server}"\n      namespace: "*"\n`;
      }

      code += `  # Restrict cluster-wide actions to enhance multi-tenant security\n  clusterResourceWhitelist:\n    - group: '*'\n      kind: '*'\n`;
      compiledCode.appproject = code;
    }

    function compileCommands() {
      const name = $('app_name').value;
      const server = $('dest_server').value;
      const ns = $('dest_ns').value;
      const repo = $('repo_url').value;
      const path = $('target_path').value;
      const branch = $('target_branch').value;

      let code = `#!/bin/bash\n# commands.sh - ArgoCD CLI synchronization operations scripts\n\n`;
      code += `echo "⚓ Logging into ArgoCD controller server via terminal..."\n`;
      code += `argocd login localhost:8080 --username admin --password changeme || true\n\n`;
      code += `echo "🚀 Provisioning dynamic GitOps App manifest via CLI..."\n`;
      code += `argocd app create ${name} \\\n`;
      code += `  --repo ${repo} \\\n`;
      code += `  --path ${path} \\\n`;
      code += `  --dest-server ${server} \\\n`;
      code += `  --dest-namespace ${ns} \\\n`;
      code += `  --revision ${branch} \\\n`;
      code += `  --sync-policy automated \\\n`;
      code += `  --sync-option CreateNamespace=true\n\n`;
      code += `echo "⏱️ Triggering manual synch check checks..."\n`;
      code += `argocd app sync ${name}\n`;

      compiledCode.commands = code;
    }

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Git[🐱 Git Repository] -->|Detect Drift| Argo[🐙 ArgoCD App]\n  Argo -->|Synchronize| K8s[☸️ Target Cluster]\n  K8s -->|Verify Status| SLA[📈 Healthy Uptime]';
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
  } else if (tabId === 'application') {
        nameBox.value = 'application';
        extTag.textContent = '.yaml';
      } else if (tabId === 'appproject') {
        nameBox.value = 'appproject';
        extTag.textContent = '.yaml';
      } else if (tabId === 'commands') {
        nameBox.value = 'argo-setup';
        extTag.textContent = '.sh';
      }
      updateViewportContent();
    }

    function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    if (typeof mermaid === 'undefined') {
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Please check your internet connection or reload the page.\n\nCode:\n${compiledCode.flow}</pre>`;
    } else {
      try {
        mermaid.run({
          nodes: [container.querySelector('.mermaid')]
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
      }
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

    function downloadArgoZip() {
      const zip = new JSZip();
      zip.file('application.yaml', compiledCode.application);
      zip.file('appproject.yaml', compiledCode.appproject);
      zip.file('argo-setup.sh', compiledCode.commands);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'argocd-gitops-manifests.zip';
        a.click();
        showToast('⬇️ argocd-gitops-manifests.zip downloaded successfully!');
      });
    }

    function clearAllFields() {
      $('app_name').value = 'frontend-app';
      $('argo_project').value = 'default';
      $('repo_url').value = 'https://github.com/my-org/gitops-infra.git';
      $('target_branch').value = 'main';
      $('target_path').value = 'charts/frontend-app';
      $('dest_server').value = 'https://kubernetes.default.svc';
      $('dest_ns').value = 'production';
      $('sync_auto').checked = true;
      $('sync_prune').checked = true;
      $('sync_selfheal').checked = true;
      $('project_repo_limit').value = 'https://github.com/my-org/*.git';
      $('project_ns_limit').value = 'production, staging';

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
  
    const tabExplanations = {'application': {'title': 'ArgoCD GitOps Configuration', 'filename': 'application.yaml', 'why': 'Defines a declarative GitOps application mapping a target git source repository to K8s target cluster namespaces, enforcing self-healing synchronization.', 'when': 'Use for continuous deployment (CD) in Kubernetes to ensure cluster states automatically match Git source states.', 'where': 'Apply directly in the ArgoCD namespace inside the control cluster.', 'command': 'kubectl apply -f application.yaml -n argocd', 'practices': ['Enable Auto-Sync with Prune and Self-Heal to automate drift corrections.', 'Use App-of-Apps pattern to organize complex multi-service setups.', 'Verify target namespace exists before applying application definitions.'], 'ai_mlops': 'Enforces continuous GitOps delivery of the **Kubernetes Troubleshooting Agent** microservice.', 'flow': '[Git Repository Commit] ➔ [ArgoCD Controller (Polling)] ── sync ──► [K8s Namespace State]'}, 'readme': {'title': 'GitOps Deployment Instructions', 'filename': 'README.md', 'why': 'Provides developer instructions on how to install ArgoCD and configure target cluster credentials.', 'when': 'Include in the GitOps deployment repository to guide SREs on setting up sync cycles.', 'where': 'Save in the root of your GitOps workspace.', 'command': '# View on your repository manager UI', 'practices': ['Document the auto-sync configuration options.', 'State credentials requirements and key rotations.', 'Provide clean rollback command checklists.'], 'ai_mlops': 'Guides GitOps pipeline synchronizations for MLOps services.', 'flow': '[README.md Guide] ➔ [Instructs Operator on Sync Commands]'}};

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
window.downloadArgoZip = downloadArgoZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
