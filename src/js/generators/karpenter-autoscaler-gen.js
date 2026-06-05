// Karpenter Autoscaler Generator logic

const SCRIPT_VERSION = "1.0.0";

function initKarpenterStudio() {
  const elements = {
    cpuLimit: document.getElementById('cpu_limit'),
    memoryLimit: document.getElementById('memory_limit'),
    consolidation: document.getElementById('consolidation_policy'),
    arch: document.getElementById('node_arch'),
    market: document.getElementById('node_market'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator inputs
    simPods: document.getElementById('sim_request_pods'),
    simGpu: document.getElementById('sim_require_gpu'),
    simMarket: document.getElementById('sim_market_type'),
    podsGrid: document.getElementById('pods-render-grid'),
    simPodsVal: document.getElementById('sim-pods-val'),
    simNodesVal: document.getElementById('sim-nodes-val'),
    simCostVal: document.getElementById('sim-cost-val'),
    simStatusVal: document.getElementById('sim-status-val'),
  };

  let activeTab = 'nodepool';

  function generateNodePoolYaml() {
    const cpu = elements.cpuLimit ? elements.cpuLimit.value : '1000';
    const mem = elements.memoryLimit ? elements.memoryLimit.value : '4000Gi';
    const cons = elements.consolidation ? elements.consolidation.value : 'WhenEmptyOrUnderutilized';
    const arch = elements.arch ? elements.arch.value : 'amd64';
    const market = elements.market ? elements.market.value : 'on-demand';

    return `# Karpenter NodePool CRD v1beta1 - Compiled v${SCRIPT_VERSION}
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default-pool
spec:
  template:
    spec:
      requirements:
        - key: kubernetes.io/arch
          operator: In
          values: ["${arch}"]
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["${market === 'spot' ? 'spot' : 'on-demand'}"]
        - key: karpenter.k8s.aws/instance-family
          operator: In
          values: ["c6g", "m6g", "r6g", "t4g"]
      nodeClassRef:
        name: default-nodeclass
      decisions:
        consolidationPolicy: ${cons}
        consolidateAfter: 30s
  limits:
    cpu: "${cpu}"
    memory: "${mem}"
`;
  }

  function generateEc2NodeClassYaml() {
    const arch = elements.arch ? elements.arch.value : 'amd64';
    return `# AWS EC2NodeClass configuration - Compiled v${SCRIPT_VERSION}
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: default-nodeclass
spec:
  amiFamily: ${arch === 'arm64' ? 'AL2_ARM_64' : 'AL2_x86_64'}
  role: KarpenterNodeRole-EKSCluster
  subnetSelectorTerms:
    - tags:
        karpenter.sh/discovery: my-eks-cluster
  securityGroupSelectorTerms:
    - tags:
        kubernetes.io/cluster/my-eks-cluster: owned
  tags:
    Name: karpenter-dynamic-node
    Project: DevOpsPortfolio
`;
  }

  function generateCliCommands() {
    return `# Karpenter Installation and verification commands
# 1. Install Karpenter via Helm
helm upgrade --install karpenter oci://public.ecr.aws/karpenter/karpenter \\
  --version 0.35.0 \\
  --namespace karpenter --create-namespace \\
  --set serviceAccount.create=true \\
  --set settings.aws.clusterName=my-eks-cluster \\
  --set settings.aws.defaultInstanceProfile=KarpenterNodeInstanceProfile

# 2. Apply Custom Resource configurations
kubectl apply -f nodepool.yaml
kubectl apply -f ec2nodeclass.yaml

# 3. Stream Karpenter controller scale logs
kubectl logs -f -n karpenter -l app.kubernetes.io/name=karpenter
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'nodepool') {
      elements.outputBox.textContent = generateNodePoolYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'nodepool.yaml';
    } else if (activeTab === 'ec2nodeclass') {
      elements.outputBox.textContent = generateEc2NodeClassYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'ec2nodeclass.yaml';
    } else if (activeTab === 'cli') {
      elements.outputBox.textContent = generateCliCommands();
      if (elements.downloadInput) elements.downloadInput.value = 'karpenter-deploy.sh';
    }
  }

  // Simulator calculation & pack render logic
  function runBinPackSimulator() {
    if (!elements.podsGrid) return;
    
    const podCount = parseInt(elements.simPods ? elements.simPods.value : '0', 10);
    const requireGpu = elements.simGpu ? elements.simGpu.checked : false;
    const marketType = elements.simMarket ? elements.simMarket.value : 'on-demand';

    if (elements.simPodsVal) elements.simPodsVal.textContent = podCount;

    if (podCount === 0) {
      elements.podsGrid.innerHTML = `<div class="text-slate-500 font-mono text-[10px] w-full text-center py-8">Scale to zero state. Move the slider to request pending pods workload.</div>`;
      if (elements.simNodesVal) elements.simNodesVal.textContent = '0';
      if (elements.simCostVal) elements.simCostVal.textContent = '$0.00 / hr';
      if (elements.simStatusVal) {
        elements.simStatusVal.textContent = 'SCALE-TO-ZERO';
        elements.simStatusVal.className = 'text-sm font-bold text-slate-500';
      }
      return;
    }

    if (elements.simStatusVal) {
      elements.simStatusVal.textContent = 'SCALING INFRA...';
      elements.simStatusVal.className = 'text-sm font-bold text-amber-500';
    }

    // Pack logic
    // AMD64 / GPU or standard instance capacities
    const podsPerNode = requireGpu ? 4 : 8;
    const nodeCount = Math.ceil(podCount / podsPerNode);
    const hourlyCost = nodeCount * (requireGpu ? 2.24 : (marketType === 'spot' ? 0.045 : 0.12));

    setTimeout(() => {
      elements.podsGrid.innerHTML = '';
      
      for (let n = 1; n <= nodeCount; n++) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'bg-slate-900 border border-indigo-500/30 rounded p-2 flex flex-col gap-2 w-full sm:w-[48%]';
        
        const nodeHeader = document.createElement('div');
        nodeHeader.className = 'flex justify-between text-[9px] font-bold text-slate-400 font-mono uppercase';
        const instanceName = requireGpu ? 'g5.xlarge' : (marketType === 'spot' ? 'c6g.large (spot)' : 'm6g.large');
        nodeHeader.innerHTML = `<span>Node #${n}: ${instanceName}</span> <span class="text-emerald-500">Active</span>`;
        nodeDiv.appendChild(nodeHeader);

        const podsFlex = document.createElement('div');
        podsFlex.className = 'flex flex-wrap gap-1';

        const podsOnThisNode = Math.min(podsPerNode, podCount - (n - 1) * podsPerNode);
        for (let p = 1; p <= podsOnThisNode; p++) {
          const podDiv = document.createElement('div');
          podDiv.className = `w-4 h-4 rounded-sm flex items-center justify-center text-[7px] font-mono font-bold ${requireGpu ? 'bg-fuchsia-600 text-white' : 'bg-indigo-600 text-white'}`;
          podDiv.title = `Pod ${p} running`;
          podDiv.textContent = `P`;
          podsFlex.appendChild(podDiv);
        }
        nodeDiv.appendChild(podsFlex);
        elements.podsGrid.appendChild(nodeDiv);
      }

      if (elements.simNodesVal) elements.simNodesVal.textContent = nodeCount;
      if (elements.simCostVal) elements.simCostVal.textContent = `$${hourlyCost.toFixed(3)} / hr`;
      if (elements.simStatusVal) {
        elements.simStatusVal.textContent = 'PROVISIONED';
        elements.simStatusVal.className = 'text-sm font-bold text-emerald-500';
      }
    }, 100);
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    // Toggle active classes on tab buttons
    ['nodepool', 'ec2nodeclass', 'cli', 'simulator'].forEach(tab => {
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
      runBinPackSimulator();
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.cpuLimit, elements.memoryLimit, elements.consolidation, elements.arch, elements.market].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.simPods) elements.simPods.addEventListener('input', runBinPackSimulator);
  if (elements.simGpu) elements.simGpu.addEventListener('change', runBinPackSimulator);
  if (elements.simMarket) elements.simMarket.addEventListener('change', runBinPackSimulator);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cpu_limit')) {
    initKarpenterStudio();
  }
});
window.initKarpenterStudio = initKarpenterStudio;

