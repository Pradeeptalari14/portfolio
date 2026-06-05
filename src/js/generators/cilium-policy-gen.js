// Cilium Network Policy & Hubble flow logic

const SCRIPT_VERSION = "1.0.0";

function initCiliumStudio() {
  const elements = {
    namespace: document.getElementById('policy_namespace'),
    trafficType: document.getElementById('policy_traffic_type'),
    port: document.getElementById('policy_port'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator elements
    btnTestTraffic: document.getElementById('btn_test_traffic'),
    btnDnsBlock: document.getElementById('btn_dns_block'),
    btnMaliciousQuery: document.getElementById('btn_malicious_query'),
    hubbleLogs: document.getElementById('hubble-logs-output'),
    simStatusVal: document.getElementById('sim-status-val'),
  };

  let activeTab = 'policy';

  function generateCiliumPolicyYaml() {
    const ns = elements.namespace ? elements.namespace.value : 'production';
    const traffic = elements.trafficType ? elements.trafficType.value : 'ingress-frontend';
    const portVal = elements.port ? elements.port.value : '80';

    let yaml = `# CiliumNetworkPolicy - Compiled v${SCRIPT_VERSION}
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: secure-microservices-policy
  namespace: ${ns}
spec:
  endpointSelector:
    matchLabels:
      app: backend-pod
`;

    if (traffic === 'ingress-frontend') {
      yaml += `  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend-pod
    toPorts:
    - ports:
      - port: "${portVal}"
        protocol: TCP
`;
    } else if (traffic === 'egress-db') {
      yaml += `  egress:
  - toEndpoints:
    - matchLabels:
        app: db-pod
    toPorts:
    - ports:
      - port: "5432"
        protocol: TCP
`;
    } else if (traffic === 'egress-dns') {
      yaml += `  egress:
  - toEndpoints:
    - matchLabels:
        "k8s:io.kubernetes.pod.namespace": kube-system
        k8s-app: kube-dns
    toPorts:
    - ports:
      - port: "53"
        protocol: UDP
      rules:
        dns:
        - matchPattern: "*.*"
`;
    } else if (traffic === 'l7-http') {
      yaml += `  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend-pod
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
      rules:
        http:
        - method: "GET"
          path: "/api/v1/health"
`;
    }

    return yaml;
  }

  function generateCiliumCliCommands() {
    const ns = elements.namespace ? elements.namespace.value : 'production';
    return `# Cilium & Hubble Management CLI Guide
# 1. Install Cilium CLI tool on your local environment
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/latest/download/cilium-linux-amd64.tar.gz

# 2. Check eBPF status and Agent health in the cluster
cilium status --wait

# 3. Apply the compiled network policy manifest
kubectl apply -f cilium-policy.yaml

# 4. Enable Hubble telemetry port forwarding
cilium hubble enable
cilium hubble port-forward &

# 5. Inspect live endpoint flows in namespace '${ns}'
hubble observe --namespace ${ns} --follow
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'policy') {
      elements.outputBox.textContent = generateCiliumPolicyYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'cilium-policy.yaml';
    } else if (activeTab === 'cli') {
      elements.outputBox.textContent = generateCiliumCliCommands();
      if (elements.downloadInput) elements.downloadInput.value = 'status.sh';
    }
  }

  function addLog(msg, type = 'info') {
    if (!elements.hubbleLogs) return;
    const el = document.createElement('div');
    el.className = type === 'error' ? 'text-rose-500' : (type === 'warn' ? 'text-amber-500' : 'text-slate-300');
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    elements.hubbleLogs.appendChild(el);
    elements.hubbleLogs.scrollTop = elements.hubbleLogs.scrollHeight;
  }

  function testNormalConnection() {
    if (!elements.hubbleLogs) return;
    elements.hubbleLogs.innerHTML = '';
    const traffic = elements.trafficType ? elements.trafficType.value : 'ingress-frontend';
    const portVal = elements.port ? elements.port.value : '80';

    addLog("Hubble: eBPF probe mapping initialized.");
    addLog(`observing namespace: ${elements.namespace ? elements.namespace.value : 'production'}`);

    setTimeout(() => {
      addLog("Hubble Flow: frontend-pod (10.244.1.5) ➡️ backend-pod (10.244.1.12) SYN");

      if (traffic === 'ingress-frontend') {
        addLog(`Hubble Verdict: ALLOWED (L4 Connection matched ingress filter on port ${portVal})`, "info");
        addLog("Hubble Flow: backend-pod (10.244.1.12) ➡️ db-pod (10.244.2.33) SYN");
        addLog("Hubble Verdict: ALLOWED (L3 default forwarding approved)", "info");
      } else {
        addLog("Hubble Verdict: DROPPED (No matching ingress rule from frontend-pod. Packet dropped by kernel eBPF probe)", "error");
      }
    }, 150);
  }

  function simulateDnsBlock() {
    if (!elements.hubbleLogs) return;
    elements.hubbleLogs.innerHTML = '';
    
    addLog("Hubble: eBPF monitoring active for external domain resolving queries.");

    setTimeout(() => {
      addLog("Hubble Flow: backend-pod (10.244.1.12) ➡️ kube-dns.kube-system.svc UDP/53 (query: suspicious-c2-server.com)");
      
      const traffic = elements.trafficType ? elements.trafficType.value : 'ingress-frontend';
      if (traffic === 'egress-dns') {
        addLog("Hubble Verdict: ALLOWED (DNS traffic permitted, mapping DNS pattern matches...)", "warn");
        addLog("Suspicious DNS match failed: raw packet dropped by eBPF egress domain filter.", "error");
      } else {
        addLog("Hubble Verdict: DROPPED (No egress DNS mapping rule configured)", "error");
      }
    }, 150);
  }

  function injectHttpHack() {
    if (!elements.hubbleLogs) return;
    elements.hubbleLogs.innerHTML = '';

    addLog("Hubble L7 Parser: starting proxy listener for HTTP payload tracing.");

    setTimeout(() => {
      addLog("Hubble Flow: frontend-pod (10.244.1.5) ➡️ backend-pod (10.244.1.12) HTTP/1.1 POST /api/v1/auth/admin");
      
      const traffic = elements.trafficType ? elements.trafficType.value : 'ingress-frontend';
      if (traffic === 'l7-http') {
        addLog("Hubble L7 Parser: payload security check failed. Path /api/v1/auth/admin forbidden.", "error");
        addLog("Hubble Verdict: DENIED (L7 HTTP Rule mismatch: expected GET /api/v1/health)", "error");
      } else {
        addLog("Hubble Verdict: ALLOWED (Port level only enabled, raw payload passed without L7 filtering inspection)", "warn");
      }
    }, 150);
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    ['policy', 'cli', 'simulator'].forEach(tab => {
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
      testNormalConnection();
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.namespace, elements.trafficType, elements.port].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.btnTestTraffic) elements.btnTestTraffic.addEventListener('click', testNormalConnection);
  if (elements.btnDnsBlock) elements.btnDnsBlock.addEventListener('click', simulateDnsBlock);
  if (elements.btnMaliciousQuery) elements.btnMaliciousQuery.addEventListener('click', injectHttpHack);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('policy_namespace')) {
    initCiliumStudio();
  }
});
window.initCiliumStudio = initCiliumStudio;
