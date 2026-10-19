// Kyverno Policy Generator logic

const SCRIPT_VERSION = "1.0.0";

function initKyvernoStudio() {
  const elements = {
    rules: document.getElementById('policy_rules'),
    action: document.getElementById('policy_action'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator elements
    rawPod: document.getElementById('sim-pod-manifest-input'),
    btnSubmit: document.getElementById('btn_submit_pod'),
    webhookStatus: document.getElementById('webhook-verdict-status'),
    webhookLogs: document.getElementById('webhook-logs-output'),
  };

  let activeTab = 'policy';

  function generatePolicyYaml() {
    const selectedRule = elements.rules ? elements.rules.value : 'no-priv';
    const action = elements.action ? elements.action.value : 'enforce';

    let yaml = `# Kyverno ClusterPolicy - Compiled v${SCRIPT_VERSION}
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: dynamic-compliance-policy
spec:
  validationFailureAction: ${action}
  background: true
  rules:
`;

    if (selectedRule === 'no-priv') {
      yaml += `    - name: block-privileged-containers
      match:
        any:
        - resources:
            kinds:
            - Pod
      validate:
        message: "Privileged container execution is disallowed in this cluster."
        pattern:
          spec:
            containers:
            - securityContext:
                privileged: false
`;
    } else if (selectedRule === 'require-label') {
      yaml += `    - name: require-app-label
      match:
        any:
        - resources:
            kinds:
            - Pod
      validate:
        message: "The label 'app' is mandatory for all workload pods."
        pattern:
          metadata:
            labels:
              app: "?*"
`;
    } else if (selectedRule === 'no-latest') {
      yaml += `    - name: block-latest-tag
      match:
        any:
        - resources:
            kinds:
            - Pod
      validate:
        message: "Using image tag 'latest' is forbidden. Enforce semantic versions."
        pattern:
          spec:
            containers:
            - image: "!*:latest"
`;
    }

    return yaml;
  }

  function generateSamplePodYaml() {
    const selectedRule = elements.rules ? elements.rules.value : 'no-priv';

    if (selectedRule === 'no-priv') {
      return `# Mismatched Pod Manifest (Triggers Kyverno Block)
apiVersion: v1
kind: Pod
metadata:
  name: unsafe-nginx-pod
  labels:
    app: webserver
spec:
  containers:
    - name: nginx
      image: nginx:1.25.1
      securityContext:
        privileged: true
`;
    } else if (selectedRule === 'require-label') {
      return `# Mismatched Pod Manifest (Triggers Kyverno Block)
apiVersion: v1
kind: Pod
metadata:
  name: unlabeled-nginx-pod
spec:
  containers:
    - name: nginx
      image: nginx:1.25.1
`;
    } else {
      return `# Mismatched Pod Manifest (Triggers Kyverno Block)
apiVersion: v1
kind: Pod
metadata:
  name: latest-nginx-pod
  labels:
    app: webserver
spec:
  containers:
    - name: nginx
      image: nginx:latest
`;
    }
  }

  function generateCliCommands() {
    return `# Kyverno Policy Management CLI Guide
# 1. Install Kyverno in the cluster
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update
helm upgrade --install kyverno kyverno/kyverno --namespace kyverno --create-namespace

# 2. Apply the compiled policy
kubectl apply -f policy.yaml

# 3. Audit existing pods compliance status
kubectl get clusterpolicyreport

# 4. Check policy controller webhook logs
kubectl logs -n kyverno -l app.kubernetes.io/name=kyverno -f
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'policy') {
      elements.outputBox.textContent = generatePolicyYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'policy.yaml';
    } else if (activeTab === 'pod') {
      elements.outputBox.textContent = generateSamplePodYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'pod-manifest.yaml';
    } else if (activeTab === 'cli') {
      elements.outputBox.textContent = generateCliCommands();
      if (elements.downloadInput) elements.downloadInput.value = 'kyverno-commands.sh';
    }
  }

  function runAdmissionSandbox() {
    if (!elements.webhookLogs || !elements.rawPod) return;

    const rawVal = elements.rawPod.value;
    const ruleType = elements.rules ? elements.rules.value : 'no-priv';
    const action = elements.action ? elements.action.value : 'enforce';

    elements.webhookLogs.innerHTML = '';
    
    const addLog = (msg, type = 'info') => {
      const el = document.createElement('div');
      el.className = type === 'error' ? 'text-rose-500' : (type === 'warn' ? 'text-amber-500' : 'text-slate-300');
      el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      elements.webhookLogs.appendChild(el);
      elements.webhookLogs.scrollTop = elements.webhookLogs.scrollHeight;
    };

    addLog("Kubernetes API Server: received pod creation request.");
    addLog("API Server: routing resource definition to Mutating & Validating webhooks.");
    addLog("Kyverno Webhook: evaluating admission policies...");

    setTimeout(() => {
      let isBlocked = false;
      let reason = "";

      if (ruleType === 'no-priv') {
        if (rawVal.includes('privileged: true')) {
          isBlocked = true;
          reason = "Privileged container execution is disallowed in this cluster.";
        }
      } else if (ruleType === 'require-label') {
        // Simple label check
        if (!rawVal.includes('app:')) {
          isBlocked = true;
          reason = "The label 'app' is mandatory for all workload pods.";
        }
      } else if (ruleType === 'no-latest') {
        if (rawVal.includes(':latest')) {
          isBlocked = true;
          reason = "Using image tag 'latest' is forbidden. Enforce semantic versions.";
        }
      }

      if (isBlocked) {
        addLog(`Admission Webhook: validation rule failed.`, "warn");
        addLog(`Reason: ${reason}`, "error");

        if (action === 'enforce') {
          addLog("API Server: Request BLOCKED by Admission Controller.", "error");
          if (elements.webhookStatus) {
            elements.webhookStatus.textContent = 'BLOCKED BY COMPLIANCE ENGINE';
            elements.webhookStatus.className = 'text-xs font-bold text-rose-500';
          }
        } else {
          addLog("API Server: Request ALLOWED (Audit Only Mode). Resource logged to PolicyReport.", "warn");
          if (elements.webhookStatus) {
            elements.webhookStatus.textContent = 'ALLOWED (AUDIT REPORT FILED)';
            elements.webhookStatus.className = 'text-xs font-bold text-amber-500';
          }
        }
      } else {
        addLog("Admission Webhook: all policies validate cleanly.");
        addLog("API Server: Pod resource scheduled successfully.", "info");
        if (elements.webhookStatus) {
          elements.webhookStatus.textContent = 'ALLOWED (POD SCHEDULED)';
          elements.webhookStatus.className = 'text-xs font-bold text-emerald-500';
        }
      }
    }, 150);
  }

  function fillSampleInSandbox() {
    if (elements.rawPod) {
      elements.rawPod.value = generateSamplePodYaml();
    }
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    // Toggle active classes on tab buttons
    ['policy', 'pod', 'cli', 'simulator'].forEach(tab => {
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
      fillSampleInSandbox();
      runAdmissionSandbox();
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.rules, elements.action].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.btnSubmit) elements.btnSubmit.addEventListener('click', runAdmissionSandbox);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('policy_rules')) {
    initKyvernoStudio();
  }
});
window.initKyvernoStudio = initKyvernoStudio;
