/**
 * TalariPradeep Technical Academy & Interactive Engineering Lab
 * Comprehensive Runtime Engine & Interactive Learning Controller
 */

(function () {
  'use strict';

  // State
  const state = {
    viewMode: 'quad', // 'quad' | 'dash' | 'lesson' | 'flow' | 'lab'
    activeTopicId: 'intro-k8s',
    lesson: {
      activeTab: 'overview',
      completed: false,
      quizPassed: false
    },
    flow: {
      provider: 'github-actions',
      mode: 'live',
      activeNode: 'test',
      activeDetailTab: 'overview',
      simulating: false,
      failureInjected: false
    },
    lab: {
      currentProject: 'k8s-web',
      currentStep: 2, // 1 to 5
      activeTab: 'instructions',
      timeLeftSeconds: 29 * 60 + 15,
      timerRunning: true,
      hintVisible: false,
      solutionVisible: false,
      testsPassed: false
    },
    terminal: {
      history: [],
      historyIndex: -1
    }
  };

  // Syllabus Topic Database (All 10 Reference Track Topics)
  const topicDb = {
    'intro-k8s': {
      title: 'What is Kubernetes?',
      module: '1. Introduction',
      duration: '12 min',
      lead: 'Kubernetes is an open-source container orchestration engine designed to automate deployment, scaling, and operational management of containerized workloads across cloud clusters.',
      objectives: [
        'Understand Kubernetes control plane and worker node responsibilities.',
        'Learn how Deployments maintain desired state through declarative manifests.',
        'Know when to use ClusterIP, NodePort, and LoadBalancer Services.'
      ],
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payments-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payments-api
  template:
    metadata:
      labels:
        app: payments-api
    spec:
      containers:
      - name: api
        image: ghcr.io/pradeep/payments-api:v1.28.0
        resources:
          limits: { cpu: "500m", memory: "512Mi" }
          requests: { cpu: "100m", memory: "128Mi" }`,
      quizQ1: {
        text: 'What is the smallest deployable computing unit in Kubernetes?',
        options: ['A Pod (one or more containers sharing network/storage)', 'A Docker image file', 'An etcd key-value entry'],
        correct: 0
      },
      quizQ2: {
        text: 'Which resource provides a stable virtual IP to load-balance traffic across dynamic Pods?',
        options: ['Service (ClusterIP / LoadBalancer)', 'ConfigMap', 'PersistentVolumeClaim'],
        correct: 0
      },
      studio: {
        name: 'Advanced k8s Script Generator',
        url: '/tools/kubernetes/',
        desc: 'Generate production manifests & script utilities'
      },
      flow: {
        name: 'Cluster Topology & Workflow',
        url: '/studios/flow/?studio=kubernetes',
        desc: 'Interactive node graph & control plane topology'
      },
      lab: {
        name: 'Kubernetes Hands-on Lab Guide',
        url: '/tools/kubernetes/learn.html',
        desc: 'Step-by-step production runbooks and debugging drills'
      },
      project: {
        name: 'tp-kubernetes Repository',
        url: 'https://github.com/Pradeeptalari14/tp-kubernetes',
        desc: 'Production manifests, automation scripts, and CI/CD'
      }
    },
    'arch-overview': {
      title: 'Cluster Architecture Overview',
      module: '1. Introduction',
      duration: '15 min',
      lead: 'A Kubernetes cluster comprises two distinct planes: the Control Plane (which makes global decisions such as scheduling and detecting node failures) and Worker Nodes (which run the application container workloads).',
      objectives: [
        'Identify the 4 control plane daemons: kube-apiserver, etcd, kube-scheduler, and kube-controller-manager.',
        'Understand how kubelet enforces container lifecycle via the Container Runtime Interface (CRI).',
        'Analyze how kube-proxy routes packet traffic using iptables, IPVS, or eBPF.'
      ],
      code: `# Verify control-plane component health status
kubectl get componentstatuses
kubectl get nodes -o wide
kubectl get pods -n kube-system`,
      quizQ1: {
        text: 'Where does Kubernetes persist cluster state and configuration data with strong consistency?',
        options: ['etcd (distributed RAFT key-value store)', 'Redis cache', 'PostgreSQL database'],
        correct: 0
      },
      quizQ2: {
        text: 'Which node agent communicates directly with the control-plane API server to ensure containers are running?',
        options: ['kubelet', 'docker daemon', 'kube-dns'],
        correct: 0
      },
      studio: {
        name: 'Kubernetes CRD Studio',
        url: '/tools/k8s-crd/',
        desc: 'Design custom controllers & API schemas'
      },
      flow: {
        name: 'Control Plane Architecture Flow',
        url: '/studios/flow/?studio=k8s-crd',
        desc: 'kube-apiserver ↔ etcd ↔ kubelet reconciler trace'
      },
      lab: {
        name: 'K8s CRD & Controller Lab Guide',
        url: '/tools/k8s-crd/learn.html',
        desc: 'Hands-on Operator pattern & reconciliation loops'
      },
      project: {
        name: 'tp-k8s-crd Repository',
        url: 'https://github.com/Pradeeptalari14/tp-k8s-crd',
        desc: 'Controller runtime & Go reconciler codebase'
      }
    },
    'usecases-k8s': {
      title: 'Production Use Cases & AI Platforms',
      module: '1. Introduction',
      duration: '16 min',
      lead: 'Modern Kubernetes powers mission-critical enterprise platforms ranging from microservices and distributed databases to multi-tenant GPU clusters running large-scale LLM training and vLLM inference workloads.',
      objectives: [
        'Architect multi-tenant clusters with ResourceQuotas, LimitRanges, and NetworkPolicies.',
        'Deploy GPU-accelerated workloads using the NVIDIA GPU Operator and MIG slicing.',
        'Implement zero-trust security guardrails with Kyverno admission controllers.'
      ],
      code: `apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: ml-platform
spec:
  hard:
    requests.cpu: "64"
    requests.memory: 256Gi
    requests.nvidia.com/gpu: "8"
    limits.cpu: "128"
    limits.memory: 512Gi
    limits.nvidia.com/gpu: "8"`,
      quizQ1: {
        text: 'What Kubernetes resource prevents a single tenant from starving cluster CPU/RAM resources?',
        options: ['ResourceQuota & LimitRange', 'ConfigMap', 'IngressClass'],
        correct: 0
      },
      quizQ2: {
        text: 'Which operator enables GPU discovery and time-slicing on Kubernetes nodes?',
        options: ['NVIDIA GPU Operator', 'CoreDNS', 'Kube-proxy'],
        correct: 0
      },
      studio: {
        name: 'Enterprise K8s AI Platform Studio',
        url: '/tools/enterprise-ai-k8s/',
        desc: 'GPU scheduling & vLLM distributed inferencing'
      },
      flow: {
        name: 'Distributed AI Inference Flow',
        url: '/studios/flow/?studio=enterprise-ai-k8s',
        desc: 'Model weights ↔ KV Cache ↔ Pods execution trace'
      },
      lab: {
        name: 'AI Platform Lab Guide',
        url: '/tools/enterprise-ai-k8s/learn.html',
        desc: 'Large-scale distributed model deployment guide'
      },
      project: {
        name: 'tp-enterprise-ai-k8s Repository',
        url: 'https://github.com/Pradeeptalari14/tp-enterprise-ai-k8s',
        desc: 'H100/A100 GPU cluster topologies and configs'
      }
    },
    'pods-containers': {
      title: 'Pods & Containers Lifecycle',
      module: '2. Core Concepts',
      duration: '18 min',
      lead: 'A Pod represents a single instance of a running process in your cluster. Containers within the same Pod share an IP address, localhost loopback network, and volume mounts.',
      objectives: [
        'Understand Pod lifecycle phases: Pending, Running, Succeeded, Failed, and CrashLoopBackOff.',
        'Implement initContainers for database migration sequencing prior to main application start.',
        'Configure sidecar logging and telemetry containers alongside your web service.'
      ],
      code: `apiVersion: v1
kind: Pod
metadata:
  name: secured-web-pod
spec:
  initContainers:
  - name: wait-for-db
    image: busybox:1.36
    command: ['sh', '-c', 'until nc -z postgres-svc 5432; do sleep 2; done;']
  containers:
  - name: web
    image: nginx:1.25-alpine
    ports:
    - containerPort: 80`,
      quizQ1: {
        text: 'What occurs when an initContainer fails and restartPolicy is Always?',
        options: ['The Pod restarts the initContainer until it succeeds, blocking the app container.', 'The Pod skips directly to the main container.', 'The Pod deletes the node.'],
        correct: 0
      },
      quizQ2: {
        text: 'Do containers inside the same Pod communicate with each other over localhost?',
        options: ['Yes, they share the same network namespace and localhost.', 'No, they must make external HTTPS calls.', 'Only if they share the same Docker image.'],
        correct: 0
      },
      studio: {
        name: 'Docker Manager Studio',
        url: '/tools/docker/',
        desc: 'Build, optimize & isolate OCI container images'
      },
      flow: {
        name: 'OCI Container Lifecycle Flow',
        url: '/studios/flow/?studio=docker',
        desc: 'cgroups, namespaces & veth interface routing'
      },
      lab: {
        name: 'Docker & Pod Hands-on Lab Guide',
        url: '/tools/docker/learn.html',
        desc: 'Container security, multi-stage builds, and sidecars'
      },
      project: {
        name: 'tp-docker Repository',
        url: 'https://github.com/Pradeeptalari14/tp-docker',
        desc: 'Production Dockerfiles, benchmarks, and runtimes'
      }
    },
    'deployments-replicas': {
      title: 'Deployments & ReplicaSets',
      module: '2. Core Concepts',
      duration: '20 min',
      lead: 'Deployments provide declarative updates for Pods and ReplicaSets. You describe a desired state, and the Deployment Controller changes the actual state to the desired state at a controlled rate.',
      objectives: [
        'Master RollingUpdate parameters: maxSurge and maxUnavailable for zero downtime.',
        'Execute rollbacks with kubectl rollout undo and inspect rollout revision history.',
        'Understand how ReplicaSets guarantee the configured replica count is always maintained.'
      ],
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-processor
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: order-processor
  template:
    metadata:
      labels:
        app: order-processor
    spec:
      containers:
      - name: processor
        image: ghcr.io/pradeep/order-engine:v2.1.0`,
      quizQ1: {
        text: 'What configuration guarantees zero downtime during a rolling update?',
        options: ['maxUnavailable: 0 with maxSurge: 1 or more', 'maxSurge: 0 with maxUnavailable: 5', 'Deleting all old pods first'],
        correct: 0
      },
      quizQ2: {
        text: 'How do you roll back a deployment to the previous working revision?',
        options: ['kubectl rollout undo deployment/<name>', 'kubectl delete pod --all', 'kubectl restart cluster'],
        correct: 0
      },
      studio: {
        name: 'Kustomize Declarative Overlays Studio',
        url: '/tools/kustomize/',
        desc: 'Multi-environment declarative overlays & patches'
      },
      flow: {
        name: 'Rolling Update & Canary Flow',
        url: '/studios/flow/?studio=kustomize',
        desc: 'MaxSurge / MaxUnavailable canary transitions'
      },
      lab: {
        name: 'Kustomize & Rollout Lab Guide',
        url: '/tools/kustomize/learn.html',
        desc: 'Staging to prod canary promotions & blue-green swaps'
      },
      project: {
        name: 'tp-kustomize Repository',
        url: 'https://github.com/Pradeeptalari14/tp-kustomize',
        desc: 'Declarative base and environment overlay manifests'
      }
    },
    'services-endpoints': {
      title: 'Services, Endpoints & Load Balancing',
      module: '2. Core Concepts',
      duration: '18 min',
      lead: 'A Kubernetes Service is an abstraction that defines a logical set of Pods and a policy to access them. Because Pods are ephemeral, Services provide stable virtual IPs and DNS names for seamless east-west routing.',
      objectives: [
        'Compare Service types: ClusterIP (internal), NodePort (static node port), and LoadBalancer (cloud external IP).',
        'Inspect dynamic EndpointSlices updated in real-time as pods scale or terminate.',
        'Configure session affinity and container port mapping.'
      ],
      code: `apiVersion: v1
kind: Service
metadata:
  name: customer-service
spec:
  type: ClusterIP
  selector:
    app: customer-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080`,
      quizQ1: {
        text: 'Which Service type is default and only accessible from within the cluster?',
        options: ['ClusterIP', 'NodePort', 'LoadBalancer'],
        correct: 0
      },
      quizQ2: {
        text: 'What sub-resource tracks the actual IP addresses of the ready pods backing a Service?',
        options: ['EndpointSlice / Endpoints', 'ConfigMap', 'DaemonSet'],
        correct: 0
      },
      studio: {
        name: 'API Gateway Studio',
        url: '/tools/api-gateway/',
        desc: 'Configure Layer 4/7 reverse proxies & routing'
      },
      flow: {
        name: 'Service IPVS & kube-proxy Flow',
        url: '/studios/flow/?studio=api-gateway',
        desc: 'Packet translation & round-robin load distribution'
      },
      lab: {
        name: 'API Gateway & Services Lab Guide',
        url: '/tools/api-gateway/learn.html',
        desc: 'ClusterIP, NodePort, and LoadBalancer configurations'
      },
      project: {
        name: 'tp-api-gateway Repository',
        url: 'https://github.com/Pradeeptalari14/tp-api-gateway',
        desc: 'Rate limiting, mTLS & edge routing architecture'
      }
    },
    'config-secrets': {
      title: 'ConfigMaps & Production Secrets',
      module: '2. Core Concepts',
      duration: '17 min',
      lead: 'Decouple environment-specific configuration and sensitive credentials from container image binaries. ConfigMaps store non-confidential key-value pairs while Secrets handle encrypted tokens, keys, and certificates.',
      objectives: [
        'Mount ConfigMaps and Secrets as environment variables or volume files inside pods.',
        'Enforce encryption at rest for etcd using AWS KMS, Azure Key Vault, or GCP Cloud KMS.',
        'Automate secret rotation using HashiCorp Vault CSI provider without restarting pods.'
      ],
      code: `apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: production
type: Opaque
stringData:
  DB_USER: "postgres_admin"
  DB_PASSWORD: "SuperSecureProductionPassword123!"`,
      quizQ1: {
        text: 'How are Secrets stored in etcd by default if encryption-at-rest is not configured?',
        options: ['Base64 encoded plaintext (not encrypted)', 'AES-256 encrypted', 'SHA-256 hashed one-way'],
        correct: 0
      },
      quizQ2: {
        text: 'What happens to a mounted ConfigMap file inside a container when the ConfigMap is updated?',
        options: ['Kubernetes automatically updates the file volume eventually via kubelet.', 'The Pod immediately crashes.', 'Nothing ever changes until node reboot.'],
        correct: 0
      },
      studio: {
        name: 'Vault Secrets Studio',
        url: '/tools/vault-secrets/',
        desc: 'Dynamic credential leasing & encryption at rest'
      },
      flow: {
        name: 'Secret Injection & CSI Driver Flow',
        url: '/studios/flow/?studio=vault-secrets',
        desc: 'In-memory volume mounting & dynamic lease rotation'
      },
      lab: {
        name: 'HashiCorp Vault Secrets Lab Guide',
        url: '/tools/vault-secrets/learn.html',
        desc: 'Zero-trust secret injection & Kubernetes auth methods'
      },
      project: {
        name: 'tp-vault-secrets Repository',
        url: 'https://github.com/Pradeeptalari14/tp-vault-secrets',
        desc: 'Vault operator manifests & Terraform provisioners'
      }
    },
    'ingress-controllers': {
      title: 'Ingress Controllers & Gateway API',
      module: '3. Networking',
      duration: '22 min',
      lead: 'Ingress manages external HTTP and HTTPS access to cluster services, providing URL-based routing, TLS termination, and reverse proxying. Gateway API represents the modern, extensible successor for multi-tenant traffic routing.',
      objectives: [
        'Understand the distinction between Ingress resources and Ingress Controller implementations (Nginx, Traefik, Envoy).',
        'Configure TLS termination using cert-manager automated Let\'s Encrypt certificate issuance.',
        'Implement Gateway API HTTPRoute objects with path prefix matching and weighted canary routing.'
      ],
      code: `apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: payments-route
spec:
  parentRefs:
  - name: external-gateway
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /v2/checkout
    backendRefs:
    - name: checkout-v2-svc
      port: 8080`,
      quizQ1: {
        text: 'What component actually executes the traffic routing rules defined in an Ingress manifest?',
        options: ['The Ingress Controller daemon (e.g. Envoy, Nginx)', 'The Linux kernel clock', 'The etcd cluster'],
        correct: 0
      },
      quizQ2: {
        text: 'What Kubernetes controller automatically issues and renews TLS certificates for Ingress hosts?',
        options: ['cert-manager', 'kube-scheduler', 'Flannel CNI'],
        correct: 0
      },
      studio: {
        name: 'Envoy Gateway & Gateway API Studio',
        url: '/tools/envoy-gateway/',
        desc: 'Next-gen GatewayClass & HTTPRoute specifications'
      },
      flow: {
        name: 'TLS Termination & Traffic Splitting',
        url: '/studios/flow/?studio=envoy-gateway',
        desc: 'SNI routing, cert-manager & weighted canary splits'
      },
      lab: {
        name: 'Envoy Gateway Lab Guide',
        url: '/tools/envoy-gateway/learn.html',
        desc: 'HTTPRoute path matching & TLS automated lifecycle'
      },
      project: {
        name: 'tp-envoy-gateway Repository',
        url: 'https://github.com/Pradeeptalari14/tp-envoy-gateway',
        desc: 'Envoy Gateway CRD manifests, filters, and policies'
      }
    },
    'network-policies': {
      title: 'Zero-Trust Network Policies & eBPF',
      module: '3. Networking',
      duration: '20 min',
      lead: 'By default, Kubernetes network traffic is completely open: any Pod can communicate with any other Pod. NetworkPolicies enforce zero-trust segmentation using packet filtering at Layer 3, Layer 4, and Layer 7 via eBPF or CNI plugins.',
      objectives: [
        'Enforce default-deny ingress and egress rules to isolate compromised microservices.',
        'Allow specific pod-to-pod ingress communication using podSelector and namespaceSelector.',
        'Leverage Cilium eBPF for DNS-aware security policies and kernel-level packet inspection without iptables overhead.'
      ],
      code: `apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: secure-backend
  namespace: production
spec:
  endpointSelector:
    matchLabels:
      app: backend-api
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend-proxy
    toPorts:
    - ports:
      - port: "8080"
        protocol: TCP`,
      quizQ1: {
        text: 'What is the default network communication model between Pods in an unconfigured Kubernetes cluster?',
        options: ['Non-isolated (all pods can talk to all other pods across all namespaces)', 'Fully blocked (no pod can communicate)', 'Encrypted with mutual TLS automatically'],
        correct: 0
      },
      quizQ2: {
        text: 'What modern Linux kernel technology enables Cilium to enforce network policies without iptables table traversals?',
        options: ['eBPF (Extended Berkeley Packet Filter)', 'Docker Swarm', 'iptables raw sockets'],
        correct: 0
      },
      studio: {
        name: 'Cilium Policy Studio',
        url: '/tools/cilium-policy/',
        desc: 'eBPF L3/L4/L7 security policy enforcement'
      },
      flow: {
        name: 'eBPF Socket-Level Filter Flow',
        url: '/studios/flow/?studio=cilium-policy',
        desc: 'Bypass iptables with high-speed kernel eBPF bytecode'
      },
      lab: {
        name: 'Cilium Network Security Lab Guide',
        url: '/tools/cilium-policy/learn.html',
        desc: 'Default-deny egress/ingress policies and DNS filtering'
      },
      project: {
        name: 'tp-cilium-policy Repository',
        url: 'https://github.com/Pradeeptalari14/tp-cilium-policy',
        desc: 'CiliumNetworkPolicy YAML templates & audit suites'
      }
    },
    'persistent-volumes': {
      title: 'Persistent Volumes & CSI Storage',
      module: '4. Storage',
      duration: '19 min',
      lead: 'Managing stateful applications requires persistent storage that outlives ephemeral pod lifecycles. The Container Storage Interface (CSI) provides standardized dynamic block and file storage provisioning across cloud providers and SAN/NAS arrays.',
      objectives: [
        'Understand the relationship between PersistentVolumes (PV), PersistentVolumeClaims (PVC), and StorageClasses.',
        'Configure access modes: ReadWriteOnce (RWO), ReadOnlyMany (ROX), and ReadWriteMany (RWX).',
        'Deploy Longhorn or Ceph Rook for distributed, replicated, snapshot-capable cloud-native storage.'
      ],
      code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: database
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: longhorn-fast-ssd
  resources:
    requests:
      storage: 100Gi`,
      quizQ1: {
        text: 'Which Kubernetes object is created by an engineer to request a specific volume size and access mode?',
        options: ['PersistentVolumeClaim (PVC)', 'PersistentVolume (PV)', 'StorageNode'],
        correct: 0
      },
      quizQ2: {
        text: 'Which access mode allows multiple nodes to simultaneously read and write to the same volume (e.g. NFS / CephFS)?',
        options: ['ReadWriteMany (RWX)', 'ReadWriteOnce (RWO)', 'ReadOnlyMany (ROX)'],
        correct: 0
      },
      studio: {
        name: 'Longhorn Block Storage Studio',
        url: '/tools/longhorn/',
        desc: 'Distributed block storage & synchronous replicas'
      },
      flow: {
        name: 'CSI Provisioner & StorageClass Flow',
        url: '/studios/flow/?studio=longhorn',
        desc: 'Dynamic CSI volume provisioner ↔ iSCSI block mount'
      },
      lab: {
        name: 'Longhorn & CSI Storage Lab Guide',
        url: '/tools/longhorn/learn.html',
        desc: 'StatefulSet persistent volume snapshots and restores'
      },
      project: {
        name: 'tp-longhorn Repository',
        url: 'https://github.com/Pradeeptalari14/tp-longhorn',
        desc: 'StorageClass & VolumeSnapshot manifests'
      }
    }
  };

  // Node details content database
  const nodeDb = {
    dev: {
      title: 'Developer Workstation',
      duration: '45s',
      status: 'Success',
      overview: 'Local commit signed with GPG key, verified against pre-commit lint and security hooks.',
      inputs: 'Branch feature/k8s-rollout, git author Talari Pradeep, commit hash 3812578.',
      outputs: 'Signed git patch pushed to origin/main over TLS 1.3.',
      logs: '[git] Hook pre-commit: PASS (eslint, prettier, secret-scan)\n[git] Branch verification: clean\n[git] Push: 3812578 -> refs/heads/main (HTTP 200)',
      troubleshooting: 'If push rejected, check branch protection rules and rebase onto origin/main.',
      hints: 'Always enable git commit signing (git config commit.gpgsign true) to satisfy SLSA Level 3 supply-chain requirements.'
    },
    git: {
      title: 'Git Repository (GitHub)',
      duration: '12s',
      status: 'Success',
      overview: 'Webhook event dispatched to CI orchestrator. PR checks and branch protection evaluated.',
      inputs: 'Webhook push payload (JSON), commit SHA 3812578, actor @Pradeeptalari14.',
      outputs: 'Triggered workflow: CI/CD Pipeline Flow (run_id #4912).',
      logs: '[github] Webhook received: push event\n[github] Branch protection: checked (enforce_admins=true)\n[github] Dispatching workflow runner...',
      troubleshooting: 'Verify GitHub Webhook delivery logs under Settings -> Webhooks for 200 OK responses.',
      hints: 'Use GitHub Actions concurrency groups (concurrency: group: ${{ github.ref }}, cancel-in-progress: true) to avoid runner resource starvation on rapid commits.'
    },
    build: {
      title: 'Build Stage (Docker/Kaniko)',
      duration: '1m 14s',
      status: 'Success',
      overview: 'Multi-stage Docker build utilizing BuildKit caching, compiling production Go binary and stripping symbols.',
      inputs: 'Dockerfile, app source, Docker build layer cache.',
      outputs: 'OCI Container Image: ghcr.io/pradeep/web-app:v1.28.0 (sha256:d894b1...).',
      logs: '[build] Step 1/6: FROM golang:1.22-alpine AS builder -> CACHED\n[build] Step 2/6: COPY . . -> 0.4s\n[build] Step 3/6: RUN go build -ldflags="-s -w" -> 32.1s\n[build] Step 4/6: FROM gcr.io/distroless/static:nonroot\n[build] Image digest: sha256:d894b1ef49...',
      troubleshooting: 'Ensure BuildKit cache mount is configured in actions/cache to avoid cold compile penalties.',
      hints: 'Adopt distroless or minimal Alpine base images to eliminate shell utilities from the runtime image and reduce attack surface.'
    },
    test: {
      title: 'Test Stage (Unit & Integration)',
      duration: '2m 34s',
      status: 'Running',
      overview: 'Runs parallel unit tests, integration test suite, and generates JUnit XML coverage reports.',
      inputs: 'Compiled test binaries, postgres-test ephemeral service container.',
      outputs: 'Test coverage: 94.8%, Junit report: 564 passed (0 failed).',
      logs: '[test] Running unit tests...\n[test] ✓ tests/auth.test.go (42ms)\n[test] ✓ tests/routing.test.go (88ms)\n[test] ✓ tests/k8s_controller.test.go (310ms)\n[test] Coverage report generated: 94.8% statements',
      troubleshooting: 'Check database container port collision and ephemeral volume mount permissions.',
      hints: 'Run flaky-test retries only in isolation and log intermittent timing variances into your CI observability dashboard.'
    },
    security: {
      title: 'Security Scan (Trivy & SAST)',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Vulnerability assessment scanning container image for CVEs, license compliance, and Semgrep AST rules.',
      inputs: 'OCI Image tarball, Semgrep ruleset .semgrep.yml.',
      outputs: 'SARIF report uploaded to GitHub Security Advisory tab.',
      logs: '[security] Queueing Trivy engine...\n[security] Awaiting Test stage completion signal.',
      troubleshooting: 'Review .trivyignore for approved false-positive exemptions with documented CVE expiration dates.',
      hints: 'Set severity thresholds (--severity HIGH,CRITICAL) and generate an SBOM with CycloneDX for audit compliance.'
    },
    deploy: {
      title: 'Deploy Stage (ArgoCD / K8s)',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Progressive canary rollout onto Kubernetes staging and production clusters with automated rollback gates.',
      inputs: 'Kustomize overlay manifests, target namespace: production.',
      outputs: 'Kubernetes Deployment status: ReadyReplicas=3/3.',
      logs: '[deploy] Standby for security gate approval.',
      troubleshooting: 'Inspect kubectl rollout status deployment/web-app for CrashLoopBackOff or ImagePullBackOff.',
      hints: 'Never deploy raw manifests without automated health checks (readiness and liveness probes configured).'
    },
    monitor: {
      title: 'Monitor & SRE SLO Telemetry',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Prometheus metrics and OpenTelemetry trace verification checking P99 latency < 50ms and error budget burn.',
      inputs: 'Prometheus metrics scraping endpoint /metrics, Datadog SLO monitors.',
      outputs: 'SLO Compliance: 99.98%, Error Budget Burn: 0.002%.',
      logs: '[monitor] Awaiting deployment health check probe responses.',
      troubleshooting: 'Verify Prometheus ServiceMonitor labels match Kubernetes Service metadata.',
      hints: 'Configure automated alert routing to PagerDuty or Slack based on multi-window multi-burn-rate alerts (Google SRE Handbook).'
    }
  };

  // Multi-Scenario Enterprise Lab Projects Database
  const labProjects = {
    'k8s-web': {
      title: 'Lab: Deploy a Web Application on Kubernetes',
      desc: 'Deploy a containerized web application using Kubernetes Deployments and Services',
      cluster: 'kind-k8s',
      nodes: '2 nodes (v1.28)',
      context: 'kind-kind',
      hits: [
        { label: 'kubectl get pods -w ⏱️', cmd: 'kubectl get pods -w' },
        { label: 'kubectl logs -f 📜', cmd: 'kubectl logs -f deployment/web-app' },
        { label: 'kubectl top pods 📊', cmd: 'kubectl top pods' },
        { label: 'curl endpoint 🌐', cmd: 'curl -I http://web-service' }
      ],
      steps: [
        {
          num: 1,
          title: 'Environment Setup',
          desc: 'Verify that your local kind Kubernetes cluster is healthy and kubectl context is set correctly.',
          expected: '$ kubectl get nodes\nNAME                  STATUS   ROLES           AGE   VERSION\nkind-control-plane    Ready    control-plane   5d    v1.28.0\nkind-worker           Ready    <none>          5d    v1.28.0',
          code: '# Check cluster connectivity\nkubectl cluster-info\nkubectl get nodes -o wide',
          hint: 'Run `kubectl cluster-info` to ensure the API server on port 6443 is accepting requests.',
          solution: 'Execute `kubectl get nodes` to inspect all nodes in the Ready state.',
          matchKeywords: ['get nodes', 'cluster-info']
        },
        {
          num: 2,
          title: 'Deploy Application',
          desc: 'Deploy the containerized web application using a Kubernetes Deployment manifest with 3 replicas and rolling update strategy.',
          expected: '$ kubectl get deployments\nNAME      READY   UP-TO-DATE   AVAILABLE   AGE\nweb-app   3/3     3            3           18s\n\n$ kubectl get pods -l app=web-app\nNAME                       READY   STATUS    RESTARTS   AGE\nweb-app-5d8f6c7b9-8xk2p    1/1     Running   0          18s\nweb-app-5d8f6c7b9-m4q9v    1/1     Running   0          18s\nweb-app-5d8f6c7b9-z7n1a    1/1     Running   0          18s',
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"`,
          hint: 'Make sure your matchLabels match the template labels exactly (app: web-app).',
          solution: 'Click the Quick Command `kubectl get pods` or type `kubectl apply -f deployment.yaml`.',
          matchKeywords: ['apply', 'deployment', 'get deployments', 'get pods']
        },
        {
          num: 3,
          title: 'Expose with Service',
          desc: 'Expose the web application pods using a ClusterIP Service to enable reliable internal load-balanced traffic.',
          expected: '$ kubectl get svc web-service\nNAME          TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)   AGE\nweb-service   ClusterIP   10.96.142.88     <none>        80/TCP    24s',
          code: `apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: ClusterIP
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 80`,
          hint: 'The Service selector `app: web-app` directs traffic to all Pods carrying that label.',
          solution: 'Run `kubectl get svc web-service` to observe the allocated internal ClusterIP.',
          matchKeywords: ['get svc', 'get service', 'service']
        },
        {
          num: 4,
          title: 'Verify & Test',
          desc: 'Execute port-forwarding or curl the service endpoint to verify 200 OK HTTP responses from all three backend pods.',
          expected: '$ kubectl run curl-test --image=radial/busyboxplus:curl -i --tty --rm -- curl -s http://web-service:80\nHTTP/1.1 200 OK\nServer: nginx/1.25.4\nContent-Type: text/html',
          code: '# Test internal service endpoint\nkubectl run curl-test --image=curlimages/curl --rm -i --restart=Never -- curl -I http://web-service',
          hint: 'Use ephemeral pods with curl or port-forwarding (`kubectl port-forward svc/web-service 8080:80`).',
          solution: 'Run `curl -I http://web-service` to verify that HTTP 200 OK is returned.',
          matchKeywords: ['curl', 'port-forward', 'test']
        },
        {
          num: 5,
          title: 'Cleanup',
          desc: 'Gracefully tear down deployed resources and verify zero lingering pods or orphaned services.',
          expected: '$ kubectl delete deployment web-app && kubectl delete svc web-service\ndeployment.apps "web-app" deleted\nservice "web-service" deleted',
          code: 'kubectl delete -f deployment.yaml\nkubectl delete -f service.yaml',
          hint: 'Delete the deployment first so ReplicaSets terminate gracefully.',
          solution: 'Execute `kubectl delete deployment web-app` followed by `kubectl delete svc web-service`.',
          matchKeywords: ['delete', 'cleanup', 'destroy']
        }
      ]
    },
    'vllm-ai': {
      title: 'Lab: LLM Inference Gateway with PagedAttention (vLLM)',
      desc: 'Deploy vLLM, configure chunked prefill, optimize GPU KV-cache memory, and benchmark streaming tokens',
      cluster: 'dgx-cluster-01',
      nodes: '8x NVIDIA H100 (SXM5)',
      context: 'prod-vllm-engine',
      hits: [
        { label: 'nvidia-smi -w ⏱️', cmd: 'nvidia-smi' },
        { label: 'vllm logs -f 📜', cmd: 'kubectl logs -f pod/vllm-engine' },
        { label: 'curl stream ⚡', cmd: 'curl http://vllm:8000/v1/chat/completions' },
        { label: 'gpu metrics 📊', cmd: 'curl -s http://vllm:8000/metrics' }
      ],
      steps: [
        {
          num: 1,
          title: 'GPU Health & CUDA Setup',
          desc: 'Inspect NVIDIA H100 GPU topology, CUDA driver version 12.4, and verify NVIDIA Container Toolkit readiness.',
          expected: '$ nvidia-smi\nGPU 0: NVIDIA H100 80GB HBM3 (UUID: GPU-4a8b...)\nMemory-Usage: 1240MiB / 81920MiB | Persistence-M: On\nCUDA Version: 12.4 | Driver: 550.54.14',
          code: 'nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv\nkubectl get nodes -l nvidia.com/gpu.present=true',
          hint: 'Verify all 8 GPU devices report Persistence-M: On with zero XID ECC errors.',
          solution: 'Execute `nvidia-smi` to inspect GPU memory allocation.',
          matchKeywords: ['nvidia-smi', 'gpu', 'cuda']
        },
        {
          num: 2,
          title: 'Deploy vLLM Engine Pod',
          desc: 'Deploy the vLLM container with PagedAttention memory manager, tensor parallelism=2, and FP8 quantization.',
          expected: '$ kubectl get pods -l app=vllm-engine\nNAME                          READY   STATUS    RESTARTS   AGE\nvllm-engine-7db84-x92zk       1/1     Running   0          35s\n\n[vLLM] Initializing KV cache: 58,400 blocks (93.4% GPU memory allocated)',
          code: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: vllm-engine\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: vllm\n        image: vllm/vllm-openai:latest\n        args: ["--model", "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B", "--tensor-parallel-size", "2", "--gpu-memory-utilization", "0.90"]\n        resources:\n          limits:\n            nvidia.com/gpu: 2`,
          hint: 'Ensure tensor parallelism matches the number of GPUs requested in resources.limits.',
          solution: 'Execute `kubectl apply -f vllm-engine.yaml` or run `kubectl get pods`.',
          matchKeywords: ['apply', 'vllm', 'get pods']
        },
        {
          num: 3,
          title: 'Tune PagedAttention & KV Cache',
          desc: 'Configure chunked prefill (--max-num-batched-tokens 2048) to eliminate head-of-line blocking on mixed prompt lengths.',
          expected: '$ vllm-tune --gpu-memory-utilization 0.92 --chunked-prefill\n[Tuning] Chunked Prefill Enabled: 2048 batched tokens\n[Tuning] KV-Cache Fragmentation Reduced: 4.2% -> 0.4%\n[Tuning] Effective Concurrency: 128 parallel streams',
          code: '# Runtime parameter validation\npython3 -m vllm.entrypoints.openai.api_server \\\n  --model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B \\\n  --enable-chunked-prefill \\\n  --max-num-seqs 256',
          hint: 'Chunked prefill prevents large prompt prefill phases from stalling ongoing decoding tokens.',
          solution: 'Execute `vllm-tune --gpu-memory-utilization 0.90` or review memory metrics.',
          matchKeywords: ['vllm-tune', 'chunked-prefill', 'pagedattention', 'tune']
        },
        {
          num: 4,
          title: 'Benchmark Stream TTFT & Latency',
          desc: 'Trigger a streaming OpenAI-compatible completion request and measure Time To First Token (TTFT) and token generation speed.',
          expected: '$ curl -N http://vllm:8000/v1/chat/completions -d \'{"model":"deepseek","stream":true}\'\ndata: {"choices":[{"delta":{"content":"Thinking"}}]}\ndata: {"choices":[{"delta":{"content":" through"}}]}\n[Benchmark] TTFT: 14.8ms | Generation Speed: 112.4 tokens/sec',
          code: `curl -X POST http://vllm-engine:8000/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",\n    "messages": [{"role": "user", "content": "Explain PagedAttention in 2 sentences."}],\n    "stream": true\n  }'`,
          hint: 'Pass `"stream": true` to receive Server-Sent Events (SSE) token by token.',
          solution: 'Run `curl http://vllm:8000/v1/chat/completions` to observe streaming generation.',
          matchKeywords: ['curl', 'chat/completions', 'stream']
        },
        {
          num: 5,
          title: 'SRE Throughput & GPU Telemetry',
          desc: 'Inspect Prometheus /metrics endpoint for GPU cache hit rates, P99 queue delay, and generation throughput.',
          expected: '$ curl -s http://vllm:8000/metrics | grep vllm:\nvllm:avg_generation_throughput_tok_per_s 114.8\nvllm:gpu_cache_usage_factor 0.88\nvllm:time_to_first_token_seconds_bucket{le="0.02"} 4120',
          code: 'curl -s http://vllm-engine:8000/metrics | grep -E "vllm:avg_generation_throughput|gpu_cache"',
          hint: 'Monitor `vllm:gpu_cache_usage_factor` to ensure it stays below 0.95 to prevent KV-cache eviction thrashing.',
          solution: 'Run `curl -s http://vllm:8000/metrics` to inspect telemetry.',
          matchKeywords: ['metrics', 'prometheus', 'throughput']
        }
      ]
    },
    'devsec-policy': {
      title: 'Lab: Zero-Trust DevSecOps & Kyverno Policy Enforcement',
      desc: 'Scan container images with Trivy, block root execution with Kyverno, and verify SLSA provenance',
      cluster: 'hardened-pci-cluster',
      nodes: '3 nodes (SELinux Enforcing)',
      context: 'security-gateways',
      hits: [
        { label: 'trivy scan 🛡️', cmd: 'trivy image web-app:v1' },
        { label: 'kyverno policies 📜', cmd: 'kubectl get cpol' },
        { label: 'test reject drill ⚠️', cmd: 'kubectl run rogue-pod --privileged' },
        { label: 'cosign verify 🔏', cmd: 'cosign verify-attestation --type slsaprovenance' }
      ],
      steps: [
        {
          num: 1,
          title: 'Image Vulnerability Triage',
          desc: 'Execute automated container scanning with Trivy to identify CVE vulnerabilities and insecure package versions.',
          expected: '$ trivy image --severity HIGH,CRITICAL web-app:v1\nTarget: ghcr.io/pradeep/web-app:v1 (debian 12.2)\nTotal: 0 HIGH, 0 CRITICAL (Passed SLSA Gate)',
          code: 'trivy image --severity HIGH,CRITICAL --exit-code 1 ghcr.io/pradeep/web-app:v1',
          hint: 'Use `--exit-code 1` in CI/CD pipelines to fail the pipeline immediately if Critical CVEs exist.',
          solution: 'Execute `trivy image web-app:v1` to verify image baseline.',
          matchKeywords: ['trivy', 'scan', 'cve']
        },
        {
          num: 2,
          title: 'Enforce Disallow-Root Policy',
          desc: 'Deploy a Kyverno ClusterPolicy that intercepts pod admission requests and rejects any container running as UID 0 (root).',
          expected: '$ kubectl apply -f kyverno-disallow-root.yaml\nclusterpolicy.kyverno.io/disallow-root-user created\nStatus: Ready (Enforce mode)',
          code: `apiVersion: kyverno.io/v1\nkind: ClusterPolicy\nmetadata:\n  name: disallow-root-user\nspec:\n  validationFailureAction: Enforce\n  background: true\n  rules:\n  - name: check-run-as-non-root\n    match:\n      any:\n      - resources:\n          kinds:\n          - Pod\n    validate:\n      message: "Running as root is forbidden under PCI-DSS."\n      pattern:\n        spec:\n          securityContext:\n            runAsNonRoot: true`,
          hint: 'Set `validationFailureAction: Enforce` to block creation rather than just logging an Audit violation.',
          solution: 'Execute `kubectl apply -f kyverno-disallow-root.yaml` to activate the webhook.',
          matchKeywords: ['apply', 'kyverno', 'cpol', 'clusterpolicy']
        },
        {
          num: 3,
          title: 'Test Policy Rejection Drill',
          desc: 'Attempt to run an unprivileged root container to verify the Kyverno admission webhook halts the deployment.',
          expected: '$ kubectl run rogue-pod --image=alpine --privileged\nError from server: admission webhook "validate.kyverno.svc" denied the request:\n[disallow-root-user] Running as root is forbidden under PCI-DSS.',
          code: 'kubectl run rogue-pod --image=alpine --privileged --restart=Never',
          hint: 'The admission webhook intercepts the API request before any container runtime starts.',
          solution: 'Execute `kubectl run rogue-pod --privileged` to confirm denial.',
          matchKeywords: ['rogue', 'privileged', 'run']
        },
        {
          num: 4,
          title: 'SLSA Provenance Verification',
          desc: 'Verify cryptographic container signature and SLSA Level 3 build provenance using Sigstore Cosign.',
          expected: '$ cosign verify-attestation --key cosign.pub ghcr.io/pradeep/web-app:v1\nVerification for ghcr.io/pradeep/web-app:v1 --\nThe following checks were performed:\n  - The cosign claims were validated\n  - SLSA Level 3 Predicate verified (Builder: GitHub Actions OIDC)',
          code: 'cosign verify-attestation \\\n  --type slsaprovenance \\\n  --certificate-identity "https://github.com/Pradeeptalari14/portfolio/.github/workflows/ci.yml@refs/heads/main" \\\n  ghcr.io/pradeep/web-app:v1',
          hint: 'Cosign verifies that the container image binary was produced by your official CI workflow without tampering.',
          solution: 'Run `cosign verify-attestation --type slsaprovenance` to inspect provenance.',
          matchKeywords: ['cosign', 'slsa', 'verify']
        },
        {
          num: 5,
          title: 'SRE Audit & Policy Compliance',
          desc: 'Inspect PolicyReports across all namespaces to generate an automated executive security audit summary.',
          expected: '$ kubectl get polr -A\nNAMESPACE   NAME             PASS   FAIL   WARN   ERROR   SKIP   AGE\ndefault     polr-web-app     14     0      0      0       2      2m\nproduction  polr-payments    28     0      0      0       0      5m',
          code: 'kubectl get policyreport -A -o wide',
          hint: 'PolicyReport CRDs provide persistent historical records of compliance checks across all cluster workloads.',
          solution: 'Execute `kubectl get polr -A` to view the compliance scorecard.',
          matchKeywords: ['polr', 'policyreport', 'compliance']
        }
      ]
    }
  };

  let labSteps = labProjects['k8s-web'].steps;

  function init() {
    setupViewModeTabs();
    setupThemeToggle();
    setupGlobalSearch();
    setupTrackSelection();
    setupSyllabusNavigation();
    setupLessonTabs();
    setupLessonQuiz();
    setupLessonComplete();
    setupNotesEditor();
    setupFlowEngine();
    setupLabEngine();
    setupLabTimer();
    restoreSavedProgress();
    initEdgeTelemetryProbe();
    loadTopic('intro-k8s');
  }

  // Toast Notification System
  function showToast(message) {
    let toast = document.getElementById('academyToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'academyToast';
      toast.className = 'academy-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  // Theme Toggle (Dark / Light)
  function setupThemeToggle() {
    const btn = document.getElementById('btnThemeToggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      btn.innerHTML = isLight ? '☀️' : '🌙';
      btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
      try {
        localStorage.setItem('academy_theme', isLight ? 'light' : 'dark');
      } catch (e) {}
    });

    try {
      const saved = localStorage.getItem('academy_theme');
      if (saved === 'light') {
        document.body.classList.add('light-theme');
        btn.innerHTML = '☀️';
      }
    } catch (e) {}
  }

  // Global Search
  function setupGlobalSearch() {
    const input = document.getElementById('academyGlobalSearch');
    if (!input) return;

    input.addEventListener('input', e => {
      const query = e.target.value.toLowerCase().trim();
      const trackBoxes = document.querySelectorAll('.track-box');
      const treeBtns = document.querySelectorAll('.tree-item-btn');

      trackBoxes.forEach(box => {
        const text = box.textContent.toLowerCase();
        box.style.display = text.includes(query) ? 'flex' : 'none';
      });

      treeBtns.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        btn.style.display = text.includes(query) ? 'block' : 'none';
      });
    });

    // Keyboard shortcut Ctrl+K / Cmd+K
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        input.focus();
      }
    });
  }

  // Track selection in Dashboard
  function setupTrackSelection() {
    const trackBoxes = document.querySelectorAll('.track-box');
    trackBoxes.forEach(box => {
      box.addEventListener('click', e => {
        e.preventDefault();
        trackBoxes.forEach(b => b.classList.remove('active-track'));
        box.classList.add('active-track');

        const trackName = box.querySelector('.track-name').textContent.trim();
        showToast(`⚡ Switched track: <strong>${trackName}</strong>`);
      });
    });
  }

  // Dynamic Syllabus Navigation
  function setupSyllabusNavigation() {
    const treeBtns = document.querySelectorAll('.tree-item-btn');

    treeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        treeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const topicKey = btn.dataset.topic || 'intro-k8s';
        loadTopic(topicKey);
      });
    });
  }

  function loadTopic(topicKey) {
    const data = topicDb[topicKey] || topicDb['intro-k8s'];
    state.activeTopicId = topicKey;

    const bcrumb = document.getElementById('lessonBreadcrumbCurrent');
    const heading = document.getElementById('lessonTitleHeading');
    const lead = document.getElementById('lessonLeadText');
    const durPill = document.getElementById('lessonDurationPill');
    const objList = document.getElementById('lessonObjectivesList');
    const exCode = document.getElementById('lessonExampleCode');

    if (bcrumb) bcrumb.innerText = data.title;
    if (heading) heading.innerText = data.title;
    if (lead) lead.innerText = data.lead;
    if (durPill && data.duration) durPill.innerText = `⏱️ ${data.duration}`;

    if (objList) {
      objList.innerHTML = data.objectives.map(o => `<li><span class="obj-check">✓</span> ${o}</li>`).join('');
    }

    if (exCode) {
      exCode.innerText = data.code;
    }

    // Dynamic Next-Step Journey Card Update
    if (data.studio) {
      const sLink = document.getElementById('journeyStudioLink');
      const sName = document.getElementById('journeyStudioName');
      const sDesc = document.getElementById('journeyStudioDesc');
      if (sLink) sLink.href = data.studio.url;
      if (sName) sName.innerText = data.studio.name;
      if (sDesc) sDesc.innerText = data.studio.desc;
    }

    if (data.flow) {
      const fLink = document.getElementById('journeyFlowLink');
      const fName = document.getElementById('journeyFlowName');
      const fDesc = document.getElementById('journeyFlowDesc');
      if (fLink) fLink.href = data.flow.url;
      if (fName) fName.innerText = data.flow.name;
      if (fDesc) fDesc.innerText = data.flow.desc;
    }

    if (data.lab) {
      const lLink = document.getElementById('journeyLabLink');
      const lName = document.getElementById('journeyLabName');
      const lDesc = document.getElementById('journeyLabDesc');
      if (lLink) lLink.href = data.lab.url;
      if (lName) lName.innerText = data.lab.name;
      if (lDesc) lDesc.innerText = data.lab.desc;
    }

    if (data.project) {
      const pLink = document.getElementById('journeyProjectLink');
      const pName = document.getElementById('journeyProjectName');
      const pDesc = document.getElementById('journeyProjectDesc');
      if (pLink) pLink.href = data.project.url;
      if (pName) pName.innerText = data.project.name;
      if (pDesc) pDesc.innerText = data.project.desc;
    }

    // Dynamic Resources Tab Update
    const resContainer = document.getElementById('topicResourcesList');
    if (resContainer && data.studio) {
      resContainer.innerHTML = `
        <div class="resource-item-row">
          <div>
            <div class="resource-link-title"><a href="${data.studio.url}">☸️ ${data.studio.name}</a></div>
            <div class="resource-link-meta">Interactive Studio &bull; ${data.studio.desc}</div>
          </div>
          <a href="${data.studio.url}" class="btn-flow-run" style="font-size:0.65rem; padding:4px 8px;">Launch Studio ↗</a>
        </div>
        <div class="resource-item-row">
          <div>
            <div class="resource-link-title"><a href="${data.flow.url}">🔀 ${data.flow.name}</a></div>
            <div class="resource-link-meta">Interactive DAG Flow &bull; ${data.flow.desc}</div>
          </div>
          <a href="${data.flow.url}" class="btn-flow-toggle" style="font-size:0.65rem; padding:4px 8px;">Open Flow ↗</a>
        </div>
        <div class="resource-item-row">
          <div>
            <div class="resource-link-title"><a href="${data.lab.url}">🧪 ${data.lab.name}</a></div>
            <div class="resource-link-meta">Production Engineering Lab Guide &bull; ${data.lab.desc}</div>
          </div>
          <a href="${data.lab.url}" class="btn-hint-toggle" style="font-size:0.65rem; padding:4px 8px;">Start Lab ↗</a>
        </div>
        <div class="resource-item-row">
          <div>
            <div class="resource-link-title"><a href="${data.project.url}" target="_blank" rel="noopener">🐙 ${data.project.name}</a></div>
            <div class="resource-link-meta">Source Code &bull; ${data.project.desc}</div>
          </div>
          <a href="${data.project.url}" target="_blank" rel="noopener" class="btn-flow-toggle" style="font-size:0.65rem; padding:4px 8px;">View Repo ↗</a>
        </div>
      `;
    }

    // Reset quiz
    const quizResult = document.getElementById('quizResultMsg');
    if (quizResult) quizResult.innerHTML = '';
    const btnSubmit = document.getElementById('btnSubmitQuiz');
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = 'Submit Answers';
      btnSubmit.style.background = 'var(--accent-indigo)';
    }

    const q1Title = document.getElementById('quizQ1Text');
    if (q1Title) q1Title.innerText = `Q1: ${data.quizQ1.text}`;
    const q2Title = document.getElementById('quizQ2Text');
    if (q2Title) q2Title.innerText = `Q2: ${data.quizQ2.text}`;
  }

  // Real Edge Network Telemetry Probe
  function initEdgeTelemetryProbe() {
    const rttEl = document.getElementById('edgeProbeRtt');
    if (!rttEl) return;
    const start = performance.now();
    fetch('/tools/tools.json', { method: 'HEAD', cache: 'no-store' })
      .then(() => {
        const duration = Math.max(4, Math.round(performance.now() - start));
        rttEl.innerText = `${duration}ms (Live Edge Probe)`;
        rttEl.style.color = duration < 80 ? 'var(--accent-emerald)' : 'var(--accent-cyan)';
      })
      .catch(() => {
        rttEl.innerText = 'Connected (HTTP/2 Edge)';
        rttEl.style.color = 'var(--accent-emerald)';
      });
  }

  // 1. View Mode Switching (Quad Grid vs Single Focus)
  function setupViewModeTabs() {
    const buttons = document.querySelectorAll('.view-mode-btn');
    const grid = document.getElementById('quadrantGrid');
    const cards = document.querySelectorAll('.quadrant-card');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        state.viewMode = mode;

        if (mode === 'quad') {
          grid.style.display = 'grid';
          grid.style.gridTemplateColumns = window.innerWidth > 1200 ? 'repeat(2, 1fr)' : '1fr';
          cards.forEach(c => (c.style.display = 'flex'));
        } else {
          grid.style.display = 'block';
          cards.forEach(c => {
            if (c.id === `quad-${mode}`) {
              c.style.display = 'flex';
              c.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              c.style.display = 'none';
            }
          });
        }
      });
    });

    const btnContinue = document.getElementById('btnContinueLessonAction');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        const lessonBtn = document.querySelector('.view-mode-btn[data-mode="lesson"]');
        if (lessonBtn) lessonBtn.click();
      });
    }

    const stepCards = document.querySelectorAll('.path-step-card');
    stepCards.forEach(card => {
      card.addEventListener('click', () => {
        const target = card.dataset.target;
        const targetBtn = document.querySelector(`.view-mode-btn[data-mode="${target}"]`);
        if (targetBtn) targetBtn.click();
      });
    });
  }

  // 2. Lesson Tabs & Quiz
  function setupLessonTabs() {
    const tabs = document.querySelectorAll('#lessonTabs .tab-btn');
    const panels = document.querySelectorAll('.lesson-tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        state.lesson.activeTab = target;

        panels.forEach(p => {
          p.style.display = p.id === `panel-${target}` ? 'block' : 'none';
        });
      });
    });
  }

  function setupLessonQuiz() {
    const btnSubmit = document.getElementById('btnSubmitQuiz');
    const msg = document.getElementById('quizResultMsg');

    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        const q1 = document.querySelector('input[name="academy_q1"]:checked');
        const q2 = document.querySelector('input[name="academy_q2"]:checked');

        if (!q1 || !q2) {
          msg.innerHTML = '<span style="color: #f87171;">⚠️ Please answer both questions before submitting.</span>';
          return;
        }

        const data = topicDb[state.activeTopicId] || topicDb['intro-k8s'];
        const q1Correct = parseInt(q1.value, 10) === data.quizQ1.correct;
        const q2Correct = parseInt(q2.value, 10) === data.quizQ2.correct;

        if (q1Correct && q2Correct) {
          msg.innerHTML = '<span style="color: #34d399; font-weight: 700;">🎉 100% Correct! Competency verified (+25 XP).</span>';
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '✓ Quiz Passed';
          btnSubmit.style.background = '#059669';
          updateUserProgress(true);
          showToast('🎉 Quiz passed with 100% score! (+25 XP)');
        } else {
          msg.innerHTML = '<span style="color: #fca5a5;">Review your answers: Pods are the smallest deployable units, and Services provide stable network identities.</span>';
        }
      });
    }
  }

  function setupLessonComplete() {
    const btn = document.getElementById('btnMarkComplete');
    if (btn) {
      btn.addEventListener('click', () => {
        state.lesson.completed = true;
        btn.innerHTML = '✓ Completed';
        btn.style.background = '#059669';
        btn.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.4)';
        updateUserProgress(false);
        showToast('✅ Lesson marked complete! Progress saved.');
      });
    }
  }

  function setupNotesEditor() {
    const textarea = document.getElementById('userLessonNotes');
    const saveBtn = document.getElementById('btnSaveNotes');
    if (!textarea || !saveBtn) return;

    try {
      const saved = localStorage.getItem('academy_user_notes');
      if (saved) textarea.value = saved;
    } catch (e) {}

    saveBtn.addEventListener('click', () => {
      try {
        localStorage.setItem('academy_user_notes', textarea.value);
        showToast('📝 Engineering notes saved locally!');
      } catch (e) {}
    });
  }

  function updateUserProgress(quizBonus) {
    try {
      const stored = localStorage.getItem('academy_user_progress') || '{}';
      const p = JSON.parse(stored);
      p.completedLessons = (p.completedLessons || 12) + 1;
      p.streak = p.streak || 42;
      p.overallPct = Math.min((p.overallPct || 78) + 2, 100);
      localStorage.setItem('academy_user_progress', JSON.stringify(p));

      const pctEl = document.getElementById('userOverallPct');
      if (pctEl) pctEl.innerText = `${p.overallPct}%`;
      const certEl = document.getElementById('userCertCount');
      if (certEl && quizBonus) certEl.innerText = `${p.completedLessons} Completed`;
    } catch (e) {}
  }

  function restoreSavedProgress() {
    try {
      const stored = localStorage.getItem('academy_user_progress');
      if (stored) {
        const p = JSON.parse(stored);
        if (p.overallPct) {
          const pctEl = document.getElementById('userOverallPct');
          if (pctEl) pctEl.innerText = `${p.overallPct}%`;
        }
      }
    } catch (e) {}
  }

  // 3. Flow Engine
  function setupFlowEngine() {
    const nodes = document.querySelectorAll('.pipeline-node');
    const drawerTitle = document.getElementById('nodeDrawerTitle');
    const drawerDuration = document.getElementById('nodeDrawerDuration');
    const drawerOverview = document.getElementById('nodeDrawerOverview');
    const drawerInputs = document.getElementById('nodeDrawerInputs');
    const drawerOutputs = document.getElementById('nodeDrawerOutputs');
    const drawerLogs = document.getElementById('nodeDrawerLogs');
    const drawerTroubleshooting = document.getElementById('nodeDrawerTroubleshooting');
    const drawerHints = document.getElementById('nodeDrawerHints');

    function selectNode(nodeKey) {
      nodes.forEach(n => n.classList.remove('active-selected'));
      const activeEl = document.querySelector(`.pipeline-node[data-node="${nodeKey}"]`);
      if (activeEl) activeEl.classList.add('active-selected');

      const data = nodeDb[nodeKey] || nodeDb.test;
      state.flow.activeNode = nodeKey;

      if (drawerTitle) drawerTitle.innerText = `Node Details: ${data.title}`;
      if (drawerDuration) drawerDuration.innerText = `Duration: ${data.duration}`;
      if (drawerOverview) drawerOverview.innerText = data.overview;
      if (drawerInputs) drawerInputs.innerText = data.inputs;
      if (drawerOutputs) drawerOutputs.innerText = data.outputs;
      if (drawerLogs) drawerLogs.innerText = data.logs;
      if (drawerTroubleshooting) drawerTroubleshooting.innerText = data.troubleshooting;
      if (drawerHints) drawerHints.innerText = data.hints;
    }

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        selectNode(node.dataset.node);
      });
    });

    const dtabs = document.querySelectorAll('.dtab-btn');
    const dpanels = document.querySelectorAll('.dtab-panel');
    dtabs.forEach(tab => {
      tab.addEventListener('click', () => {
        dtabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.dtab;
        dpanels.forEach(p => {
          p.style.display = p.id === `dpanel-${target}` ? 'block' : 'none';
        });
      });
    });

    // Run Flow Drill
    const btnRun = document.getElementById('btnRunFlowDrill');
    if (btnRun) {
      btnRun.addEventListener('click', () => {
        if (state.flow.simulating) return;
        state.flow.simulating = true;
        btnRun.innerText = 'Running Pipeline...';
        btnRun.disabled = true;

        const sequence = ['dev', 'git', 'build', 'test', 'security', 'deploy', 'monitor'];
        let idx = 0;

        function runStep() {
          if (idx >= sequence.length) {
            btnRun.innerText = '✓ Drill Completed';
            showToast('🚀 Full CI/CD Pipeline Drill completed successfully!');
            setTimeout(() => {
              btnRun.innerText = '▶ Run Pipeline Drill';
              btnRun.disabled = false;
              state.flow.simulating = false;
            }, 3000);
            return;
          }

          const curr = sequence[idx];
          selectNode(curr);

          const statusVal = document.getElementById('hudStatusVal');
          if (statusVal) statusVal.innerText = `Executing: ${nodeDb[curr].title}`;

          idx++;
          setTimeout(runStep, 1000);
        }

        runStep();
      });
    }

    // Reset Flow
    const btnReset = document.getElementById('btnFlowReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.flow.failureInjected = false;
        nodes.forEach(n => {
          n.classList.remove('node-failed');
          const badge = n.querySelector('.node-status-badge');
          if (badge) {
            const key = n.dataset.node;
            if (['dev', 'git', 'build'].includes(key)) {
              badge.className = 'node-status-badge badge-success';
              badge.innerText = 'Committed';
            } else if (key === 'test') {
              badge.className = 'node-status-badge badge-running';
              badge.innerText = 'Running';
            } else {
              badge.className = 'node-status-badge badge-pending';
              badge.innerText = 'Pending';
            }
          }
        });
        selectNode('test');
        showToast('↺ Pipeline Flow reset to initial state.');
      });
    }

    // Inject Failure Drill (SRE simulation)
    const btnFail = document.getElementById('btnInjectFailureDrill');
    if (btnFail) {
      btnFail.addEventListener('click', () => {
        state.flow.failureInjected = true;
        selectNode('security');
        const secNode = document.querySelector('.pipeline-node[data-node="security"]');
        if (secNode) {
          secNode.classList.remove('node-pending', 'node-running');
          secNode.classList.add('node-failed');
          const badge = secNode.querySelector('.node-status-badge');
          if (badge) {
            badge.className = 'node-status-badge badge-failed';
            badge.innerText = 'FAILED (CVE)';
          }
        }

        const statusVal = document.getElementById('hudStatusVal');
        if (statusVal) {
          statusVal.innerText = 'BLOCKED: High CVE detected';
          statusVal.style.color = 'var(--accent-red)';
        }

        const logsEl = document.getElementById('nodeDrawerLogs');
        if (logsEl) {
          logsEl.innerText = `[security] CRITICAL ALERT: CVE-2024-3094 detected in upstream liblzma.\n[security] Pipeline halted by policy gate.\n[security] Remediation required: Pin liblzma to >= 5.6.1-patch1.`;
        }

        // Switch to troubleshooting tab
        const troubleTab = document.querySelector('.dtab-btn[data-dtab="trouble"]');
        if (troubleTab) troubleTab.click();

        showToast('⚠️ Simulated SRE Failure injected into Security Stage!');
      });
    }

    // Toggle Live vs Simulate
    const btnToggle = document.getElementById('btnFlowModeToggle');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        if (state.flow.mode === 'live') {
          state.flow.mode = 'simulate';
          btnToggle.innerHTML = '<span>⚡</span> Mode: Simulate';
          btnToggle.style.color = '#fbbf24';
          btnToggle.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        } else {
          state.flow.mode = 'live';
          btnToggle.innerHTML = '<span>●</span> Live Telemetry';
          btnToggle.style.color = '#34d399';
          btnToggle.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        }
      });
    }
  }

  // 4. Lab Engine
  function setupLabEngine() {
    const stepBtns = document.querySelectorAll('.lab-step-btn');
    const prevBtn = document.getElementById('btnLabPrev');
    const nextBtn = document.getElementById('btnLabNext');

    function renderStep(stepIndex) {
      state.lab.currentStep = stepIndex;
      const data = labSteps[stepIndex - 1];

      stepBtns.forEach((b, i) => {
        b.classList.remove('active');
        if (i + 1 < stepIndex) b.classList.add('completed');
        if (i + 1 === stepIndex) b.classList.add('active');
      });

      const titleEl = document.getElementById('labStepTitle');
      const descEl = document.getElementById('labStepDesc');
      const expectEl = document.getElementById('labStepExpected');
      const codeEl = document.getElementById('labStepCode');
      const hintText = document.getElementById('labHintContentText');
      const solutionText = document.getElementById('labSolutionContentText');

      if (titleEl) titleEl.innerText = `${data.num}. ${data.title}`;
      if (descEl) descEl.innerText = data.desc;
      if (expectEl) expectEl.innerText = data.expected;
      if (codeEl) codeEl.innerText = data.code;
      if (hintText) hintText.innerText = data.hint;
      if (solutionText) solutionText.innerText = data.solution;

      // Close hint drawers on step change
      const hintBox = document.getElementById('labHintDrawer');
      if (hintBox) hintBox.style.display = 'none';

      if (prevBtn) prevBtn.disabled = stepIndex === 1;
      if (nextBtn) {
        if (stepIndex === labSteps.length) {
          nextBtn.innerText = 'Finish Lab ✓';
        } else {
          const nextData = labSteps[stepIndex];
          nextBtn.innerText = `Next: ${nextData.title} →`;
        }
      }
    }

    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        renderStep(parseInt(btn.dataset.step, 10));
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.lab.currentStep > 1) {
          renderStep(state.lab.currentStep - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.lab.currentStep < labSteps.length) {
          renderStep(state.lab.currentStep + 1);
          showToast(`Step ${state.lab.currentStep} loaded.`);
        } else {
          openEndLabModal();
        }
      });
    }

    // Project Scenario Picker
    const projSelect = document.getElementById('labProjectSelect');
    if (projSelect) {
      projSelect.addEventListener('change', () => {
        const selectedProj = projSelect.value;
        if (!labProjects[selectedProj]) return;
        state.lab.currentProject = selectedProj;
        labSteps = labProjects[selectedProj].steps;

        const proj = labProjects[selectedProj];
        const titleEl = document.getElementById('labTitleHeading');
        const descEl = document.getElementById('labSubtitleDesc');
        if (titleEl) titleEl.innerText = proj.title;
        if (descEl) descEl.innerText = proj.desc;

        // Update environment inspector right HUD
        const specsList = document.querySelector('.env-specs-list');
        if (specsList) {
          specsList.innerHTML = `
            <div><strong>Cluster:</strong> ${proj.cluster}</div>
            <div><strong>Nodes:</strong> ${proj.nodes}</div>
            <div><strong>Context:</strong> ${proj.context}</div>
          `;
        }

        // Update recommended hits chips
        const chipsWrap = document.getElementById('hitsChipsWrap');
        if (chipsWrap && proj.hits) {
          chipsWrap.innerHTML = proj.hits.map(h => `<button class="btn-terminal-hit" data-cmd="${h.cmd}">${h.label}</button>`).join('');
          wireHitsChips();
        }

        renderStep(1);
        showToast(`⚡ Project Scenario Loaded: <strong>${proj.title}</strong>`);
      });
    }

    // Recommended Hits Chips Click Handler
    function wireHitsChips() {
      const hitBtns = document.querySelectorAll('.btn-terminal-hit');
      hitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const cmd = btn.dataset.cmd;
          const termTab = document.querySelector('.ltab-btn[data-ltab="terminal"]');
          if (termTab) termTab.click();
          if (termInput) termInput.value = cmd;
          executeCommand(cmd);
        });
      });
    }
    wireHitsChips();

    // Hints and Solution Toggles
    const btnToggleHint = document.getElementById('btnToggleHint');
    const btnToggleSolution = document.getElementById('btnToggleSolution');
    const hintDrawer = document.getElementById('labHintDrawer');

    if (btnToggleHint && hintDrawer) {
      btnToggleHint.addEventListener('click', () => {
        const isHidden = hintDrawer.style.display === 'none' || !hintDrawer.style.display;
        hintDrawer.style.display = isHidden ? 'block' : 'none';
        document.getElementById('labHintContentText').style.display = 'block';
        document.getElementById('labSolutionContentText').style.display = 'none';
      });
    }

    if (btnToggleSolution && hintDrawer) {
      btnToggleSolution.addEventListener('click', () => {
        hintDrawer.style.display = 'block';
        document.getElementById('labHintContentText').style.display = 'none';
        document.getElementById('labSolutionContentText').style.display = 'block';
      });
    }

    // Copy YAML Code Button
    const btnCopyCode = document.getElementById('btnCopyLabCode');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        const code = document.getElementById('labStepCode').innerText;
        navigator.clipboard.writeText(code).then(() => {
          showToast('📋 Manifest copied to clipboard!');
        });
      });
    }

    // Run Automated Verification Checks
    const btnRunTests = document.getElementById('btnRunLabValidation');
    const testList = document.getElementById('labTestResultsList');
    if (btnRunTests && testList) {
      btnRunTests.addEventListener('click', () => {
        btnRunTests.disabled = true;
        btnRunTests.innerText = 'Validating cluster state...';

        setTimeout(() => {
          const proj = labProjects[state.lab.currentProject] || labProjects['k8s-web'];
          testList.innerHTML = `
            <div style="color: var(--accent-emerald);">✓ Cluster Connectivity: PASS (${proj.cluster} responding)</div>
            <div style="color: var(--accent-emerald);">✓ Manifest Schema Validation: PASS (${proj.steps[1].title} verified)</div>
            <div style="color: var(--accent-emerald);">✓ Pod Health Probes: PASS (All container endpoints responding HTTP 200 OK)</div>
            <div style="color: var(--accent-emerald);">✓ Service Routing &amp; SLSA Gate: PASS (SLO compliance 99.9%)</div>
          `;
          btnRunTests.disabled = false;
          btnRunTests.innerText = '✓ All Checks Passed (100%)';
          btnRunTests.style.background = '#059669';
          showToast('🎉 All lab verification checks passed!');
        }, 1200);
      });
    }

    // Center Workspace Tabs
    const ltabs = document.querySelectorAll('.ltab-btn');
    const lpanels = document.querySelectorAll('.ltab-panel');
    ltabs.forEach(tab => {
      tab.addEventListener('click', () => {
        ltabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.ltab;
        state.lab.activeTab = target;
        lpanels.forEach(p => {
          p.style.display = p.id === `lpanel-${target}` ? 'block' : 'none';
        });
      });
    });

    // Terminal runner
    const termInput = document.getElementById('termInputField');
    const termLogs = document.getElementById('termLogContainer');

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function appendTermLog(cmd, res) {
      if (!termLogs) return;
      const line = document.createElement('div');
      line.className = 'terminal-line';
      const promptName = state.lab.currentProject === 'vllm-ai' ? 'sre@dgx-h100:~$' : state.lab.currentProject === 'devsec-policy' ? 'secops@pci-cluster:~$' : 'user@kind-k8s:~$';
      const safeCmd = escapeHtml(cmd);
      const safeRes = escapeHtml(res);
      line.innerHTML = `<span class="term-prompt">${promptName}</span> ${safeCmd}<br><span style="color: #94a3b8; white-space: pre-wrap;">${safeRes}</span>`;
      termLogs.appendChild(line);
      termLogs.scrollTop = termLogs.scrollHeight;
    }

    if (termInput) {
      termInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const cmd = termInput.value.trim();
          if (!cmd) return;
          state.terminal.history.push(cmd);
          state.terminal.historyIndex = state.terminal.history.length;
          termInput.value = '';
          executeCommand(cmd);
        } else if (e.key === 'ArrowUp') {
          if (state.terminal.historyIndex > 0) {
            state.terminal.historyIndex--;
            termInput.value = state.terminal.history[state.terminal.historyIndex];
          }
        } else if (e.key === 'ArrowDown') {
          if (state.terminal.historyIndex < state.terminal.history.length - 1) {
            state.terminal.historyIndex++;
            termInput.value = state.terminal.history[state.terminal.historyIndex];
          } else {
            state.terminal.historyIndex = state.terminal.history.length;
            termInput.value = '';
          }
        }
      });
    }

    // Quick Command Buttons
    const quickCmds = document.querySelectorAll('.btn-quick-cmd');
    quickCmds.forEach(b => {
      b.addEventListener('click', () => {
        const cmd = b.dataset.cmd;
        const termTab = document.querySelector('.ltab-btn[data-ltab="terminal"]');
        if (termTab) termTab.click();
        executeCommand(cmd);
      });
    });

    function executeCommand(cmd) {
      let res = '';
      const c = cmd.toLowerCase().trim();
      const nowIso = new Date().toISOString();

      if (c === 'clear') {
        if (termLogs) termLogs.innerHTML = '';
        return;
      }
      if (c === 'help') {
        res = 'Available commands: kubectl get nodes, kubectl get pods [-w], kubectl logs -f, kubectl top pods, nvidia-smi, trivy image, kubectl get cpol, curl -I http://web-service, clear';
      } else if (c.includes('-w') || c.includes('watch')) {
        // Real-time streaming watch simulation
        res = `[STREAM CONNECTED: Watching resource transitions (Interval: 1s)]\nNAME                       READY   STATUS              RESTARTS   AGE\nweb-app-5d8f6c7b9-8xk2p    0/1     ContainerCreating   0          0s\nweb-app-5d8f6c7b9-m4q9v    0/1     ContainerCreating   0          0s\nweb-app-5d8f6c7b9-z7n1a    0/1     ContainerCreating   0          0s`;
        setTimeout(() => {
          if (termLogs) {
            const streamLine = document.createElement('div');
            streamLine.className = 'terminal-line';
            streamLine.style.color = '#34d399';
            streamLine.innerHTML = `web-app-5d8f6c7b9-8xk2p    1/1     Running             0          2s\nweb-app-5d8f6c7b9-m4q9v    1/1     Running             0          2s\nweb-app-5d8f6c7b9-z7n1a    1/1     Running             0          2s\n<span style="color: #38bdf8;">^C [Stream terminated: 3/3 pods transitioned to Running successfully]</span>`;
            termLogs.appendChild(streamLine);
            termLogs.scrollTop = termLogs.scrollHeight;
          }
        }, 700);
      } else if (c.includes('logs -f') || (c.includes('logs') && c.includes('pod'))) {
        // Real-time access logs streaming simulation
        res = `[STREAM ATTACHED: pod/web-app stdout (tail=-1)]\n[${nowIso}] "GET /healthz HTTP/1.1" 200 OK 1.4ms (ingress-nginx)\n[${nowIso}] "GET /api/v1/catalog HTTP/1.1" 200 OK 14.8ms (cache-hit)\n[${nowIso}] "POST /v1/chat/completions HTTP/1.1" 200 OK 28.1ms (tokens: 42)`;
      } else if (c.includes('top pods') || c.includes('top nodes')) {
        res = `NAME                       CPU(cores)   MEMORY(bytes)\nweb-app-5d8f6c7b9-8xk2p    14m          68Mi\nweb-app-5d8f6c7b9-m4q9v    18m          72Mi\nweb-app-5d8f6c7b9-z7n1a    12m          64Mi`;
      } else if (c.includes('nvidia-smi')) {
        res = `NVIDIA-SMI 550.54.14     Driver Version: 550.54.14     CUDA Version: 12.4\nGPU 0: NVIDIA H100 80GB HBM3 | Temp: 42C | Perf: P0 | 45W / 700W\nMemory-Usage: 14,240MiB / 81,920MiB (KV Cache: 90.0% allocated)\nProcesses: PID 4120 (python3 -m vllm.entrypoints) 14,112MiB`;
      } else if (c.includes('trivy')) {
        res = `2026-10-18T20:45:00Z INFO Need to update DB\n2026-10-18T20:45:01Z INFO Vulnerability database updated\nghcr.io/pradeep/web-app:v1 (debian 12.2)\n=========================================\nTotal: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)\n[Security Gate] PASS: 0 CVEs detected satisfying SLSA Level 3 gate.`;
      } else if (c.includes('cpol') || c.includes('kyverno')) {
        res = `NAME                 BACKGROUND   VALIDATEACTION   READY   AGE   MESSAGE\ndisallow-root-user   true         Enforce          True    5d    Root containers forbidden under PCI-DSS\nrequire-ro-rootfs    true         Enforce          True    5d    Root filesystem must be read-only`;
      } else if (c.includes('cosign')) {
        res = `Verification for ghcr.io/pradeep/web-app:v1 --\nThe following checks were performed each with positive cryptographic assertion:\n  - The cosign claims were validated\n  - Certificate chain verified: GitHub Actions OIDC Issuer\n  - SLSA Level 3 Provenance predicate: verified build identity and commit SHA.`;
      } else if (c.includes('polr') || c.includes('policyreport')) {
        res = `NAMESPACE   NAME            PASS   FAIL   WARN   ERROR   SKIP   AGE\ndefault     polr-web-app    14     0      0      0       2      2m\nproduction  polr-payments   28     0      0      0       0      5m`;
      } else if (c.includes('get nodes')) {
        res = 'NAME                 STATUS   ROLES           AGE   VERSION\nkind-control-plane   Ready    control-plane   5d    v1.28.0\nkind-worker          Ready    <none>          5d    v1.28.0';
      } else if (c.includes('get pods')) {
        res = 'NAME                       READY   STATUS    RESTARTS   AGE\nweb-app-5d8f6c7b9-8xk2p    1/1     Running   0          42s\nweb-app-5d8f6c7b9-m4q9v    1/1     Running   0          42s\nweb-app-5d8f6c7b9-z7n1a    1/1     Running   0          42s';
      } else if (c.includes('get svc') || c.includes('get service')) {
        res = 'NAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE\nkubernetes    ClusterIP   10.96.0.1      <none>        443/TCP   5d\nweb-service   ClusterIP   10.96.142.88   <none>        80/TCP    1m';
      } else if (c.includes('describe pod')) {
        res = 'Name:         web-app-5d8f6c7b9-8xk2p\nNamespace:    default\nStatus:       Running\nIP:           10.244.1.4\nContainers:\n  web:\n    Image:          nginx:1.25-alpine\n    State:          Running\n    Ready:          True';
      } else if (c.includes('apply')) {
        res = 'deployment.apps/web-app created\nservice/web-service created';
      } else if (c.includes('curl')) {
        res = 'HTTP/1.1 200 OK\nServer: nginx/1.25.4\nDate: Mon, 19 Oct 2026 12:00:00 GMT\nContent-Type: text/html\nContent-Length: 615\nConnection: keep-alive';
      } else {
        res = `[kubectl simulation] Command '${cmd}' executed successfully (exit code 0).`;
      }

      // Step Auto-Validator: check if command matches active step keywords
      const currStepData = labSteps[state.lab.currentStep - 1];
      if (currStepData && currStepData.matchKeywords) {
        const isMatch = currStepData.matchKeywords.some(k => c.includes(k.toLowerCase()));
        if (isMatch) {
          const currentBtn = document.querySelector(`.lab-step-btn[data-step="${state.lab.currentStep}"]`);
          if (currentBtn) {
            currentBtn.classList.add('completed');
            const bubble = currentBtn.querySelector('.step-num-bubble');
            if (bubble) bubble.innerText = '✓';
          }
          res += `\n\n🟢 [Real-Time Validator] Step ${state.lab.currentStep} requirement satisfied! Marked Step as complete (+10 XP).`;
          showToast(`🎯 Step ${state.lab.currentStep} Verified! Real-time check passed.`);
        }
      }

      appendTermLog(cmd, res);
    }

    // Reset Lab
    const btnResetLab = document.getElementById('btnResetLab');
    if (btnResetLab) {
      btnResetLab.addEventListener('click', () => {
        renderStep(1);
        if (termLogs) {
          termLogs.innerHTML = '<div class="terminal-line"><span class="term-prompt">user@kind-k8s:~$</span> kubectl cluster-info<br><span style="color: #94a3b8;">Kubernetes control plane is running at https://127.0.0.1:6443\nCoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy</span></div>';
        }
        showToast('↺ Sandbox reset to initial Step 1.');
      });
    }

    // End Lab button & modal
    const btnEndLab = document.getElementById('btnEndLab');
    if (btnEndLab) {
      btnEndLab.addEventListener('click', openEndLabModal);
    }

    const modalClose = document.getElementById('btnCloseLabModal');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        const modal = document.getElementById('academyModal');
        if (modal) modal.style.display = 'none';
      });
    }
  }

  function openEndLabModal() {
    const modal = document.getElementById('academyModal');
    if (modal) modal.style.display = 'flex';
  }

  // Timer countdown
  function setupLabTimer() {
    const timerEl = document.getElementById('labCountdownTimer');
    setInterval(() => {
      if (state.lab.timeLeftSeconds > 0 && state.lab.timerRunning) {
        state.lab.timeLeftSeconds--;
        const m = Math.floor(state.lab.timeLeftSeconds / 60);
        const s = state.lab.timeLeftSeconds % 60;
        if (timerEl) {
          timerEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
      }
    }, 1000);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
