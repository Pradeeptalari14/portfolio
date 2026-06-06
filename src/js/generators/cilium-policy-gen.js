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

  const logger = window.SreCore.createLogger(elements.hubbleLogs);

  function testNormalConnection() {
    if (!elements.hubbleLogs) return;
    logger.clear();
    const traffic = elements.trafficType ? elements.trafficType.value : 'ingress-frontend';
    const portVal = elements.port ? elements.port.value : '80';

    logger.info("Hubble: eBPF probe mapping initialized.");
    logger.info(`observing namespace: ${elements.namespace ? elements.namespace.value : 'production'}`);

    setTimeout(() => {
      logger.info("Hubble Flow: frontend-pod (10.244.1.5) ➡️ backend-pod (10.244.1.12) SYN");

      if (traffic === 'ingress-frontend') {
        logger.info(`Hubble Verdict: ALLOWED (L4 Connection matched ingress filter on port ${portVal})`);
        logger.info("Hubble Flow: backend-pod (10.244.1.12) ➡️ db-pod (10.244.2.33) SYN");
        logger.info("Hubble Verdict: ALLOWED (L3 default forwarding approved)");
      } else {
        logger.error("Hubble Verdict: DROPPED (No matching ingress rule from frontend-pod. Packet dropped by kernel eBPF probe)");
      }
    }, 150);
  }

  function simulateDnsBlock() {
    if (!elements.hubbleLogs) return;
    logger.clear();
    
    logger.info("Hubble: eBPF monitoring active for external domain resolving queries.");

    setTimeout(() => {
      logger.info("Hubble Flow: backend-pod (10.244.1.12) ➡️ kube-dns.kube-system.svc UDP/53 (query: suspicious-c2-server.com)");
      
      const traffic = elements.trafficType ? elements.trafficType.value : 'ingress-frontend';
      if (traffic === 'egress-dns') {
        logger.warn("Hubble Verdict: ALLOWED (DNS traffic permitted, mapping DNS pattern matches...)");
        logger.error("Suspicious DNS match failed: raw packet dropped by eBPF egress domain filter.");
      } else {
        logger.error("Hubble Verdict: DROPPED (No egress DNS mapping rule configured)");
      }
    }, 150);
  }

  function injectHttpHack() {
    if (!elements.hubbleLogs) return;
    logger.clear();

    logger.info("Hubble L7 Parser: starting proxy listener for HTTP payload tracing.");

    setTimeout(() => {
      logger.info("Hubble Flow: frontend-pod (10.244.1.5) ➡️ backend-pod (10.244.1.12) HTTP/1.1 POST /api/v1/auth/admin");
      
      const traffic = elements.trafficType ? elements.trafficType.value : 'ingress-frontend';
      if (traffic === 'l7-http') {
        logger.error("Hubble L7 Parser: payload security check failed. Path /api/v1/auth/admin forbidden.");
        logger.error("Hubble Verdict: DENIED (L7 HTTP Rule mismatch: expected GET /api/v1/health)");
      } else {
        logger.warn("Hubble Verdict: ALLOWED (Port level only enabled, raw payload passed without L7 filtering inspection)");
      }
    }, 150);
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['policy', 'cli', 'simulator'],
    'policy',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      if (tabName === 'simulator') {
        testNormalConnection();
      } else {
        updateOutput();
      }
    }
  );

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
