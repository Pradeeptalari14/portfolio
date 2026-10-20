/**
 * VisualFlowCanvas.js
 * Universal, zero-dependency visual flow workspace engine.
 * Inspired by Langflow, Dify, and modern topology DAG builders.
 * (c) 2026 Talari Pradeep. All rights reserved.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VisualFlowCanvas = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Default Flagship Starter Templates
  const STARTER_TEMPLATES = {
    rag: {
      name: 'AI & Enterprise RAG Pipeline',
      category: 'ai',
      nodes: [
        { id: 'n1', type: 'input', title: 'Document Ingestion', icon: '📄', x: 60, y: 140, params: { source: 'S3 / PDF Bucket', format: 'PDF/Markdown' }, desc: 'Ingests unstructured production documents and validates schemas.' },
        { id: 'n2', type: 'transform', title: 'Text Splitter', icon: '✂️', x: 380, y: 140, params: { chunkSize: '1000', overlap: '200' }, desc: 'Recursive character chunker ensuring zero token boundary truncation.' },
        { id: 'n3', type: 'model', title: 'Embedding Model', icon: '🧠', x: 700, y: 140, params: { model: 'text-embedding-3-small', dims: '1536' }, desc: 'Computes normalized high-dimensional semantic vector embeddings.' },
        { id: 'n4', type: 'storage', title: 'pgvector HNSW Store', icon: '🗄️', x: 1020, y: 140, params: { m: '16', efSearch: '64', distance: 'Cosine' }, desc: 'PostgreSQL vector store with HNSW index for sub-10ms similarity lookup.' },
        { id: 'n5', type: 'model', title: 'vLLM PagedAttention', icon: '⚡', x: 1340, y: 140, params: { model: 'Llama-3.3-70B', maxTokens: '2048' }, desc: 'High-throughput inference engine with continuous batching and KV caching.' },
        { id: 'n6', type: 'output', title: 'Answer & Citations', icon: '🎯', x: 1660, y: 140, params: { guardrails: 'Hallucination Shield', citations: 'Enforced' }, desc: 'Synthesizes grounded output with auditable source paragraph citations.' }
      ],
      connections: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5' },
        { from: 'n5', to: 'n6' }
      ]
    },

    pipeline: {
      name: 'DevOps & GitOps Pipeline Builder',
      category: 'cicd',
      nodes: [
        { id: 'p1', type: 'input', title: 'GitHub Webhook', icon: '🐙', x: 60, y: 140, params: { branch: 'main', event: 'push / PR' }, desc: 'Triggers automated build workflow upon signed commit push.' },
        { id: 'p2', type: 'transform', title: 'Maven / Go Build', icon: '⚙️', x: 380, y: 140, params: { jdk: 'OpenJDK 21', cache: 'enabled' }, desc: 'Compiles source code with dependency hash verification.' },
        { id: 'p3', type: 'security', title: 'Trivy & SAST Scan', icon: '🛡️', x: 700, y: 140, params: { severity: 'CRITICAL,HIGH', exitCode: '1' }, desc: 'Static security scanner enforcing zero high-severity CVE tolerance.' },
        { id: 'p4', type: 'transform', title: 'Docker Buildx', icon: '🐳', x: 1020, y: 140, params: { multiArch: 'linux/amd64,arm64', tag: 'sha-latest' }, desc: 'Hardened non-root microVM container image packaging.' },
        { id: 'p5', type: 'storage', title: 'GHCR Registry', icon: '📦', x: 1340, y: 140, params: { cosign: 'enabled', provenance: 'SLSA Level 3' }, desc: 'Signed container registry storage with immutable digest pinning.' },
        { id: 'p6', type: 'deploy', title: 'ArgoCD EKS Deploy', icon: '☸️', x: 1660, y: 140, params: { strategy: 'Canary (10% -> 100%)', sync: 'Automated' }, desc: 'Declarative GitOps sync applying manifests to production clusters.' }
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'p6' }
      ]
    },

    k8sEcosystem: {
      name: 'Kubernetes CNCF Ecosystem & Fleet Topology',
      category: 'cloud',
      nodes: [
        { id: 'kcncf_1', type: 'input', title: 'Envoy Gateway & cert-manager', icon: '🌐', x: 60, y: 140, params: { gatewayClass: 'eg', tls: 'Let\'s Encrypt ACME' }, desc: 'Cloud-native L7 ingress gateway terminating TLS with automated cert-manager rotation.' },
        { id: 'kcncf_2', type: 'security', title: 'Kyverno & Trivy Admission Gate', icon: '🛡️', x: 380, y: 140, params: { policy: 'Enforce Cosign Verify', cveBlock: 'CRITICAL = 0' }, desc: 'Admission controller validating cryptographic signatures and rejecting vulnerable images.' },
        { id: 'kcncf_3', type: 'transform', title: 'KEDA Event Scaler', icon: '⚡', x: 700, y: 140, params: { triggers: 'Kafka lag, SQS, Prometheus', minReplicas: '0' }, desc: 'Event-driven horizontal pod autoscaling scaling workloads dynamically from zero.' },
        { id: 'kcncf_4', type: 'compute', title: 'Karpenter NodePool Consolidator', icon: '🧭', x: 1020, y: 140, params: { strategy: 'Price-Capacity-Optimized', spotRatio: '80%' }, desc: 'Just-in-time node provisioner spinning EC2/GCP compute instances in under 40s.' },
        { id: 'kcncf_5', type: 'compute', title: 'containerd & gVisor Runtime', icon: '⚙️', x: 1340, y: 60, params: { snapshotter: 'eStargz', isolation: 'runsc MicroVM' }, desc: 'High-performance CRI execution engine running isolated container pods.' },
        { id: 'kcncf_6', type: 'network', title: 'Cilium eBPF CNI & CoreDNS Mesh', icon: '🔌', x: 1340, y: 240, params: { networkPolicy: 'L3-L7 eBPF', dns: 'CoreDNS AutoPath' }, desc: 'Kernel-level high-throughput container networking and in-cluster service discovery.' },
        { id: 'kcncf_7', type: 'storage', title: 'Longhorn CSI Storage & Velero DR', icon: '💾', x: 1660, y: 60, params: { replicas: '3x Sync Block Storage', backup: 'S3 Velero Daily' }, desc: 'Distributed persistent volume replication with automated disaster recovery snapshots.' },
        { id: 'kcncf_8', type: 'output', title: 'OTel, Fluent Bit & Prometheus MELT', icon: '📊', x: 1660, y: 240, params: { traces: 'OTel OTLP', logs: 'Fluent Bit -> Loki', metrics: 'Prometheus' }, desc: 'Full-stack observability mesh streaming traces, logs, and golden signal metrics.' }
      ],
      connections: [
        { from: 'kcncf_1', to: 'kcncf_2' },
        { from: 'kcncf_2', to: 'kcncf_3' },
        { from: 'kcncf_3', to: 'kcncf_4' },
        { from: 'kcncf_4', to: 'kcncf_5' },
        { from: 'kcncf_4', to: 'kcncf_6' },
        { from: 'kcncf_5', to: 'kcncf_7' },
        { from: 'kcncf_5', to: 'kcncf_8' },
        { from: 'kcncf_6', to: 'kcncf_8' }
      ]
    },

    infra: {
      name: 'Cloud & Network Topology Canvas',
      category: 'cloud',
      nodes: [
        { id: 'i1', type: 'input', title: 'Internet Gateway', icon: '🌐', x: 60, y: 140, params: { cidr: '0.0.0.0/0', ddos: 'Shield Advanced' }, desc: 'VPC perimeter entrance routing external HTTP/HTTPS traffic.' },
        { id: 'i2', type: 'network', title: 'Application LB', icon: '🔀', x: 380, y: 140, params: { protocol: 'HTTPS/443', mTLS: 'Enforced' }, desc: 'Multi-AZ load balancer performing health checks and path routing.' },
        { id: 'i3', type: 'compute', title: 'EKS Worker Nodes', icon: '☸️', x: 700, y: 140, params: { instanceType: 'c6i.2xlarge', karpenter: 'Active' }, desc: 'Autoscaling Kubernetes compute pool running isolated pods.' },
        { id: 'i4', type: 'storage', title: 'Valkey Distributed Cache', icon: '⚡', x: 1020, y: 60, params: { clusterMode: 'enabled', tls: '1.3' }, desc: 'In-memory Redis-compatible cache for sub-millisecond query offload.' },
        { id: 'i5', type: 'storage', title: 'Aurora PostgreSQL', icon: '🐘', x: 1020, y: 240, params: { multiAz: 'Active-Active', storage: 'Encrypted' }, desc: 'Fault-tolerant primary transactional database with read replicas.' }
      ],
      connections: [
        { from: 'i1', to: 'i2' },
        { from: 'i2', to: 'i3' },
        { from: 'i3', to: 'i4' },
        { from: 'i3', to: 'i5' }
      ]
    },

    database: {
      name: 'Database & Schema Visual Builder',
      category: 'database',
      nodes: [
        { id: 'd1', type: 'storage', title: 'Users Table', icon: '👤', x: 80, y: 140, params: { pk: 'id UUID', cols: 'name, email, role' }, desc: 'Primary identity entity with Row-Level Security (RLS) policies.' },
        { id: 'd2', type: 'storage', title: 'Knowledge Docs', icon: '📑', x: 420, y: 140, params: { fk: 'user_id -> Users.id', cols: 'title, content' }, desc: 'Core documentation table containing revision histories.' },
        { id: 'd3', type: 'storage', title: 'Embeddings Index', icon: '📐', x: 760, y: 140, params: { vectorCol: 'embedding vector(1536)', index: 'HNSW' }, desc: 'pgvector column indexed with HNSW for sub-linear similarity search.' },
        { id: 'd4', type: 'transform', title: 'EXPLAIN Query Plan', icon: '🔍', x: 1100, y: 140, params: { planType: 'Index Scan', cost: '< 12.50' }, desc: 'Visual query plan inspector highlighting index utilization vs seq-scans.' }
      ],
      connections: [
        { from: 'd1', to: 'd2' },
        { from: 'd2', to: 'd3' },
        { from: 'd3', to: 'd4' }
      ]
    },

    agent: {
      name: 'Agentic AI Swarm Workflow',
      category: 'ai',
      nodes: [
        { id: 'a1', type: 'input', title: 'User Request', icon: '💬', x: 60, y: 140, params: { intent: 'Incident Triage', auth: 'Bearer Verified' }, desc: 'Entry query parsed for sentiment, intent, and schema validation.' },
        { id: 'a2', type: 'model', title: 'Planner Agent', icon: '🧭', x: 380, y: 140, params: { framework: 'LangGraph DAG', reasoning: 'DeepSeek-R1' }, desc: 'Decomposes complex requests into directed acyclic task graphs.' },
        { id: 'a3', type: 'transform', title: 'Jev Decision Router', icon: '⚡', x: 700, y: 140, params: { latency: '<25ms reflex', fallback: 'System 2' }, desc: 'Non-autoregressive calibrated reflex router for immediate branching.' },
        { id: 'a4', type: 'tool', title: 'Kubernetes Tool Worker', icon: '🛠️', x: 1040, y: 60, params: { tool: 'kubectl get pods', sandbox: 'gVisor' }, desc: 'Sandboxed non-root subprocess runner gathering live cluster telemetry.' },
        { id: 'a5', type: 'tool', title: 'Database Tool Worker', icon: '🗄️', x: 1040, y: 240, params: { tool: 'SQL Read-Only', timeout: '3s' }, desc: 'Executes parameterized queries against persistent audit stores.' },
        { id: 'a6', type: 'security', title: 'Human Approval Gate', icon: '🛡️', x: 1380, y: 140, params: { requiredSignOff: 'SRE Lead', autoApproveIf: 'Read-Only' }, desc: 'Intervention checkpoint before mutation or remediation deployment.' },
        { id: 'a7', type: 'output', title: 'CRDT Memory Sync', icon: '💾', x: 1720, y: 140, params: { syncState: 'Valkey / Redis', crdt: 'LWW-Register' }, desc: 'Distributes consensus state across the multi-agent cluster.' }
      ],
      connections: [
        { from: 'a1', to: 'a2' },
        { from: 'a2', to: 'a3' },
        { from: 'a3', to: 'a4' },
        { from: 'a3', to: 'a5' },
        { from: 'a4', to: 'a6' },
        { from: 'a5', to: 'a6' },
        { from: 'a6', to: 'a7' }
      ]
    },

    devsecops: {
      name: 'DevSecOps & Supply Chain Security Pipeline',
      category: 'security',
      nodes: [
        { id: 'sec1', type: 'input', title: 'Git Signed Commit & Attestation', icon: '🔑', x: 60, y: 140, params: { gpgKey: 'ED25519 Verified', branch: 'protected-main' }, desc: 'Enforces cryptographically signed Git commits and commit identity verification.' },
        { id: 'sec2', type: 'security', title: 'Semgrep SAST & Secret Audit', icon: '🔍', x: 380, y: 140, params: { rules: 'OWASP Top 10 + CWE Top 25', leakGate: 'Zero Secret Leaks' }, desc: 'Performs semantic AST static analysis blocking hardcoded secrets and injections.' },
        { id: 'sec3', type: 'transform', title: 'Syft SBOM & Grype Scanner', icon: '📋', x: 700, y: 140, params: { format: 'CycloneDX 1.5 JSON', epssCutoff: '< 0.05' }, desc: 'Generates software bill of materials and scores transitive dependency vulnerabilities.' },
        { id: 'sec4', type: 'transform', title: 'Trivy Container & Chainguard Base', icon: '🛡️', x: 1020, y: 140, params: { baseImage: 'Distroless Non-Root', cveSeverity: 'CRITICAL = 0' }, desc: 'Scans compiled image layers and verifies minimal distroless attack surface.' },
        { id: 'sec5', type: 'security', title: 'Sigstore Cosign Keyless Signer', icon: '✍️', x: 1340, y: 140, params: { oidcProvider: 'GitHub Actions OIDC', rekorTransparency: 'Logged' }, desc: 'Signs container image digests keylessly into Fulcio CA with Rekor transparency.' },
        { id: 'sec6', type: 'deploy', title: 'Kyverno & Tetragon Admission Gate', icon: '☸️', x: 1660, y: 140, params: { admissionPolicy: 'Enforce Cosign Verify', eBPFMonitor: 'Active' }, desc: 'Blocks unsigned images at Kubernetes admission and monitors runtime kernel syscalls.' }
      ],
      connections: [
        { from: 'sec1', to: 'sec2' },
        { from: 'sec2', to: 'sec3' },
        { from: 'sec3', to: 'sec4' },
        { from: 'sec4', to: 'sec5' },
        { from: 'sec5', to: 'sec6' }
      ]
    },

    backend: {
      name: 'Distributed Backend Ecosystem & Lifecycle',
      category: 'backend',
      nodes: [
        { id: 'b1', type: 'input', title: 'Client Ingress', icon: '📱', x: 60, y: 140, params: { protocol: 'HTTP/2 TLS 1.3', idempotencyKey: 'Enforced' }, desc: 'Browser or mobile frontend emitting requests with JWT Bearer and idempotency tokens.' },
        { id: 'b2', type: 'network', title: 'NGINX Reverse Proxy', icon: '🛡️', x: 380, y: 140, params: { rateLimit: '1000 rps / IP', sslTerm: 'TLS 1.3' }, desc: 'Edge reverse proxy terminating TLS and enforcing token-bucket rate limits.' },
        { id: 'b3', type: 'security', title: 'JWT Auth Gate', icon: '🔑', x: 700, y: 140, params: { algorithm: 'RS256 Public Key', claims: 'user_id, roles' }, desc: 'Cryptographically verifies token signatures without querying database.' },
        { id: 'b4', type: 'storage', title: 'Redis Cache Layer', icon: '⚡', x: 1020, y: 60, params: { maxmemory: '512mb LRU', stampedeGuard: 'XFetch' }, desc: 'Sub-2ms inventory validation and distributed idempotency locking.' },
        { id: 'b5', type: 'storage', title: 'PostgreSQL DB & PgBouncer', icon: '🐘', x: 1020, y: 240, params: { poolMode: 'Transaction', statementTimeout: '2500ms' }, desc: 'ACID transaction execution with row-level locks and ledger updates.' },
        { id: 'b6', type: 'transform', title: 'RabbitMQ / Kafka Broker', icon: '📬', x: 1340, y: 140, params: { durableExchange: 'orders.topic', dlq: 'Enabled' }, desc: 'Decoupled event broker publishing persistent fulfillment tasks.' },
        { id: 'b7', type: 'compute', title: 'Celery / Asynq Workers', icon: '⚙️', x: 1660, y: 60, params: { prefetch: '4', backoff: 'Exponential + Jitter' }, desc: 'Asynchronous workers processing payments and sending email receipts.' },
        { id: 'b8', type: 'output', title: 'OpenTelemetry & Prometheus', icon: '📊', x: 1660, y: 240, params: { tracing: 'W3C traceparent', export: 'Prometheus 9090' }, desc: 'Distributed trace spans and RED metrics collection across microservices.' }
      ],
      connections: [
        { from: 'b1', to: 'b2' },
        { from: 'b2', to: 'b3' },
        { from: 'b3', to: 'b4' },
        { from: 'b3', to: 'b5' },
        { from: 'b5', to: 'b6' },
        { from: 'b6', to: 'b7' },
        { from: 'b3', to: 'b8' }
      ]
    },

    repolearn: {
      name: 'Unified Repository Learning & Codebase DAG',
      category: 'automation',
      nodes: [
        { id: 'r1', type: 'input', title: 'Git Repository Source', icon: '📦', x: 60, y: 140, params: { branch: 'main', commit: '42be0e3' }, desc: 'Cloned or imported repository source files with AST language parser.' },
        { id: 'r2', type: 'network', title: 'Ingress & Gateway', icon: '🌐', x: 380, y: 140, params: { proxy: 'NGINX 1.25', rateLimit: 'Token Bucket' }, desc: 'Edge routing layer proxying incoming requests to microservice containers.' },
        { id: 'r3', type: 'transform', title: 'API Service Layer', icon: '⚡', x: 700, y: 140, params: { framework: 'FastAPI / Go Gin', auth: 'JWT RS256' }, desc: 'Business logic coordinator validating schemas and transaction boundaries.' },
        { id: 'r4', type: 'storage', title: 'State & Caching DB', icon: '🗄️', x: 1020, y: 60, params: { cache: 'Redis 7', db: 'PostgreSQL 16' }, desc: 'Sub-2ms caching and durable ACID transactional persistence.' },
        { id: 'r5', type: 'transform', title: 'Message Broker', icon: '📬', x: 1020, y: 240, params: { broker: 'RabbitMQ 3.13', exchange: 'orders.topic' }, desc: 'Decoupled event broker dispatching async background fulfillment tasks.' },
        { id: 'r6', type: 'compute', title: 'Worker Fleet & CI', icon: '⚙️', x: 1340, y: 140, params: { worker: 'Celery / Asynq', ci: 'GitHub Actions' }, desc: 'Asynchronous consumer workers executing payments, notifications, and CI tests.' }
      ],
      connections: [
        { from: 'r1', to: 'r2' },
        { from: 'r2', to: 'r3' },
        { from: 'r3', to: 'r4' },
        { from: 'r3', to: 'r5' },
        { from: 'r5', to: 'r6' }
      ]
    }
  };

  // 12 Flow Directions Metadata Specification
  const FLOW_DIRECTIONS_METADATA = {
    happy: {
      id: 'happy',
      name: '1. Happy Path (Normal)',
      icon: '✅',
      summary: 'Normal execution from trigger to production completion with zero errors.',
      description: 'Validates sequential transit across all stages. Each component ingests upstream artifacts, applies validation, and emits verified outputs to the next stage.',
      badge: 'NORMAL EXECUTION',
      accentColor: '#10b981'
    },
    reverse: {
      id: 'reverse',
      name: '2. Reverse Trace (Outputs ➔ Origin)',
      icon: '🔍',
      summary: 'Trace an output artifact or production incident backwards to its exact origin.',
      description: 'Navigates upstream dependencies from the terminal node back to input sources, identifying which commit, data chunk, or config change generated the result.',
      badge: 'REVERSE DEPENDENCY TRACE',
      accentColor: '#38bdf8'
    },
    failure: {
      id: 'failure',
      name: '3. Failure Path (Error Propagation)',
      icon: '❌',
      summary: 'Demonstrates error propagation and blocked downstream dependencies.',
      description: 'Simulates a critical schema validation or assertion failure at a mid-pipeline stage, stopping execution and marking all dependent downstream stages as BLOCKED.',
      badge: 'FAULT PROPAGATION',
      accentColor: '#ef4444'
    },
    retry: {
      id: 'retry',
      name: '4. Retry Path (Backoff & Limits)',
      icon: '🔁',
      summary: 'Transient failure recovery with exponential backoff and retry limits.',
      description: 'Simulates an upstream API rate limit (HTTP 429) or transient network hiccup. Applies exponential backoff (1s, 2s) and succeeds on attempt 2 without breaking the pipeline.',
      badge: 'EXPONENTIAL BACKOFF',
      accentColor: '#f59e0b'
    },
    rollback: {
      id: 'rollback',
      name: '5. Rollback Path (Safe Recovery)',
      icon: '⏪',
      summary: 'Automated rollback to a known-good state upon error budget breach.',
      description: 'Deploys a canary release. Upon detecting anomalous p99 latency or 5xx error spikes exceeding SLO thresholds, automated rollback immediately restores the immutable previous release revision.',
      badge: 'CANARY ROLLBACK',
      accentColor: '#ec4899'
    },
    dependency: {
      id: 'dependency',
      name: '6. Dependency Path (Prerequisites)',
      icon: '🔗',
      summary: 'Trace upstream prerequisites and downstream consumers for any node.',
      description: 'Inspects strict topological execution orders. Upstream producers must satisfy contracts before consumers can begin.',
      badge: 'TOPOLOGICAL PREREQUISITES',
      accentColor: '#8b5cf6'
    },
    data: {
      id: 'data',
      name: '7. Data Flow (Payload Inspection)',
      icon: '📦',
      summary: 'Inspect payloads, schemas, chunks, vectors, and output artifacts.',
      description: 'Visualizes exact data payloads moving across wires: raw documents, chunk tokens, 1536-dim vector embeddings, and citation references.',
      badge: 'PAYLOAD INSPECTION',
      accentColor: '#00f0ff'
    },
    security: {
      id: 'security',
      name: '8. Security Flow (Zero-Trust Gates)',
      icon: '🛡️',
      summary: 'Identity verification, secret boundaries, guardrails, and compliance gates.',
      description: 'Applies Zero-Trust least-privilege checks: authenticates tokens, redacts secrets from logs, scans with Semgrep/Trivy, and verifies cryptographic signatures (SLSA / Cosign).',
      badge: 'ZERO-TRUST GATES',
      accentColor: '#f97316'
    },
    observability: {
      id: 'observability',
      name: '9. Observability Flow (MELT Signals)',
      icon: '📊',
      summary: 'Structured telemetry: Metrics, Events, Logs, and OpenTelemetry Traces.',
      description: 'Attaches OpenTelemetry trace contexts (traceparent) across all nodes. Displays Prometheus golden signals (latency, traffic, errors, saturation) and structured JSON logs.',
      badge: 'MELT TELEMETRY',
      accentColor: '#06b6d4'
    },
    recovery: {
      id: 'recovery',
      name: '10. Recovery Flow (Auto-Remediation)',
      icon: '🩺',
      summary: 'Incident detection, automated triage, self-healing, and verification.',
      description: 'Detects unhealthy container probes, isolates failing pods, triggers automated healing via Kubernetes control plane or backup failover, and verifies recovery.',
      badge: 'INCIDENT AUTO-HEALING',
      accentColor: '#14b8a6'
    },
    performance: {
      id: 'performance',
      name: '11. Performance Flow (Bottlenecks)',
      icon: '⚡',
      summary: 'Queue times, memory constraints, and concurrency optimization.',
      description: 'Profiles latency bottlenecks: detects high queuing delays, applies PagedAttention KV-cache sharing and thread-pool optimization to maximize throughput.',
      badge: 'LATENCY & THROUGHPUT',
      accentColor: '#eab308'
    },
    learning: {
      id: 'learning',
      name: '12. Learning Flow (Learn ➔ Lab ➔ Project)',
      icon: '🎓',
      summary: 'Prerequisites ➔ Concept Lesson ➔ Guided Lab ➔ Challenge ➔ Portfolio Project.',
      description: 'Walks through the complete engineering curriculum: validates prerequisites, reviews plain-English architectural concepts, executes the hands-on lab, solves a challenge, and links to real portfolio repositories.',
      badge: 'COMPLETE LEARNING LOOP',
      accentColor: '#6366f1'
    }
  };

  class VisualFlowCanvas {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) throw new Error('VisualFlowCanvas: container element not found.');

      this.options = Object.assign({
        mode: 'simulate', // 'simulate' | 'real'
        readOnly: false,
        activeTemplate: 'rag',
        studioId: null,
        studiosList: [],
        flowDirection: 'happy'
      }, options);

      this.nodes = new Map();
      this.connections = [];
      this.selectedNodeId = null;
      this.activeConnectingFrom = null;

      this.studiosList = this.options.studiosList || [];
      this.currentStudioId = this.options.studioId || null;

      // Viewport Pan/Zoom state
      this.scale = 1.0;
      this.panOffset = { x: 40, y: 40 };
      this.isPanning = false;
      this.panStart = { x: 0, y: 0 };

      // Node Drag state
      this.isDraggingNode = false;
      this.draggedNodeId = null;
      this.dragOffset = { x: 0, y: 0 };

      // Execution & Simulation state
      this.isRunning = false;
      this.isPaused = false;
      this.executionStep = 0;
      this.activeFlowDirection = this.options.flowDirection || 'happy'; // 12 flow directions

      this._buildDOM();
      this._bindEvents();
      this._initStudiosCatalog();

      if (this.currentStudioId) {
        this.loadStudio(this.currentStudioId);
      } else if (this.options.activeTemplate) {
        this.loadTemplate(this.options.activeTemplate);
      }

      this.setFlowDirection(this.activeFlowDirection);
    }

    _buildDOM() {
      this.container.innerHTML = `
        <div class="vf-workspace">
          <!-- Topbar -->
          <header class="vf-topbar">
            <div class="vf-topbar-left">
              <div class="vf-brand">
                <span>⚡ TALARI PRADEEP</span>
                <span class="vf-badge" id="vfActiveStudioBadge">VISUAL FLOW STUDIO</span>
              </div>
              
              <!-- 3-Mode Switcher -->
              <nav class="vf-mode-switcher">
                <a href="/studios/" class="vf-mode-btn">🔍 Explore</a>
                <a href="/studios/learn/" class="vf-mode-btn">📚 Learn</a>
                <button class="vf-mode-btn active" id="vfModeBtn">⚡ Visual Flow</button>
              </nav>

              <!-- Studio Selector Dropdown (347 Studios) -->
              <div class="vf-studio-selector-wrapper">
                <label for="vfStudioSelect" class="vf-studio-label">Studio:</label>
                <select id="vfStudioSelect" class="vf-studio-select">
                  <option value="">Select Studio (347 available)...</option>
                </select>
              </div>

              <!-- 12 Flow Direction Selector -->
              <div class="vf-direction-wrapper">
                <label for="vfFlowDirectionSelect" class="vf-direction-label">Direction:</label>
                <select id="vfFlowDirectionSelect" class="vf-direction-select">
                  <option value="happy">1. Happy Path (Normal)</option>
                  <option value="reverse">2. Reverse Trace (Outputs ➔ Origin)</option>
                  <option value="failure">3. Failure Path (Error Propagation)</option>
                  <option value="retry">4. Retry Path (Backoff & Limits)</option>
                  <option value="rollback">5. Rollback Path (Safe Recovery)</option>
                  <option value="dependency">6. Dependency Path (Prerequisites)</option>
                  <option value="data">7. Data Flow (Payload Inspection)</option>
                  <option value="security">8. Security Flow (Zero-Trust Gates)</option>
                  <option value="observability">9. Observability Flow (MELT Signals)</option>
                  <option value="recovery">10. Recovery Flow (Auto-Remediation)</option>
                  <option value="performance">11. Performance Flow (Bottlenecks)</option>
                  <option value="learning">12. Learning Flow (Learn ➔ Lab ➔ Project)</option>
                </select>
              </div>
            </div>

            <div class="vf-topbar-actions">
              <!-- Engine indicator -->
              <div class="vf-engine-pill" id="vfEnginePill" title="Execution Engine Mode">
                <span class="vf-engine-dot"></span>
                <span id="vfEngineLabel">Engine: WASM Simulation</span>
              </div>

              <button class="vf-btn vf-btn-ghost" id="vfZenBtn" title="Toggle Fullscreen Zen Canvas Mode (Hide sidebars)">⛶ Zen Canvas</button>
              <button class="vf-btn" id="vfAutoLayoutBtn" title="Automatic Hierarchical Layout">📐 Auto Layout</button>
              <button class="vf-btn" id="vfManimMcpBtn" title="Render 3Blue1Brown Mathematical/System Animation">🎬 Manim MCP</button>
              <button class="vf-btn" id="vfSaveBtn" title="Save Project to Local Storage">💾 Save</button>
              <button class="vf-btn" id="vfRestoreBtn" title="Restore Saved Project">📂 Restore</button>
              <input type="file" id="vfImportFileInput" accept=".json" style="display:none;" />
              <button class="vf-btn" id="vfImportBtn" title="Import Flow Specification JSON">📥 Import</button>
              <button class="vf-btn" id="vfExportCodeBtn" title="Export Executable Code">📤 Export</button>
              <button class="vf-btn vf-btn-primary" id="vfRunFlowBtn">▶ Run the Flow</button>
            </div>
          </header>

          <!-- Main Layout -->
          <div class="vf-main">
            <!-- Left Panel: Palette & Templates -->
            <aside class="vf-sidebar-left" id="vfSidebarLeft">
              <div class="vf-panel-header">
                <div>
                  <span class="vf-panel-title">Component Palette</span>
                  <span style="font-size: 0.72rem; color: var(--vf-text-muted); display: block;">Drag to Canvas</span>
                </div>
                <button class="vf-panel-collapse-btn" id="vfCollapseLeftBtn" title="Collapse Component Palette (◀)">◀</button>
              </div>

              <input type="text" class="vf-search-input" id="vfPaletteSearch" placeholder="Search components (LLM, RAG, K8s)..." />

              <div class="vf-palette-content" id="vfPaletteContent">
                <!-- Starter Templates -->
                <div class="vf-cat-title">Starter Flow Experiences</div>
                <button class="vf-template-btn" data-template="rag"><span>🤖 AI & RAG Pipeline</span><span>→</span></button>
                <button class="vf-template-btn" data-template="agent"><span>⚡ Agentic AI Swarm</span><span>→</span></button>
                <button class="vf-template-btn" data-template="devsecops"><span>🛡️ DevSecOps Supply Chain</span><span>→</span></button>
                <button class="vf-template-btn" data-template="pipeline"><span>🐙 DevOps CI/CD Pipeline</span><span>→</span></button>
                <button class="vf-template-btn" data-template="infra"><span>☁️ Cloud & Network Topology</span><span>→</span></button>
                <button class="vf-template-btn" data-template="database"><span>🗄️ Database & pgvector Schema</span><span>→</span></button>

                <!-- Core Palette Items -->
                <div class="vf-cat-title">Data & Input</div>
                <div class="vf-palette-item" draggable="true" data-type="input" data-title="File Ingestion" data-icon="📄">
                  <span class="vf-item-icon">📄</span>
                  <div class="vf-item-text"><div class="vf-item-title">File Ingestion</div><div class="vf-item-sub">PDF, CSV, JSON source</div></div>
                </div>
                <div class="vf-palette-item" draggable="true" data-type="input" data-title="API Webhook" data-icon="🌐">
                  <span class="vf-item-icon">🌐</span>
                  <div class="vf-item-text"><div class="vf-item-title">API Webhook</div><div class="vf-item-sub">HTTP triggers & GitHub</div></div>
                </div>

                <div class="vf-cat-title">Processing & Chunker</div>
                <div class="vf-palette-item" draggable="true" data-type="transform" data-title="Text Splitter" data-icon="✂️">
                  <span class="vf-item-icon">✂️</span>
                  <div class="vf-item-text"><div class="vf-item-title">Text Splitter</div><div class="vf-item-sub">Chunk & overlap tokens</div></div>
                </div>
                <div class="vf-palette-item" draggable="true" data-type="transform" data-title="Jev Reflex Gate" data-icon="⚡">
                  <span class="vf-item-icon">⚡</span>
                  <div class="vf-item-text"><div class="vf-item-title">Jev Reflex Gate</div><div class="vf-item-sub">&lt;25ms condition router</div></div>
                </div>

                <div class="vf-cat-title">Models & Vector DB</div>
                <div class="vf-palette-item" draggable="true" data-type="model" data-title="Embedding Generator" data-icon="🧠">
                  <span class="vf-item-icon">🧠</span>
                  <div class="vf-item-text"><div class="vf-item-title">Embedding Model</div><div class="vf-item-sub">text-embedding-3, BGE</div></div>
                </div>
                <div class="vf-palette-item" draggable="true" data-type="storage" data-title="pgvector Store" data-icon="🗄️">
                  <span class="vf-item-icon">🗄️</span>
                  <div class="vf-item-text"><div class="vf-item-title">pgvector HNSW</div><div class="vf-item-sub">PostgreSQL cosine search</div></div>
                </div>
                <div class="vf-palette-item" draggable="true" data-type="model" data-title="vLLM Inference" data-icon="⚡">
                  <span class="vf-item-icon">⚡</span>
                  <div class="vf-item-text"><div class="vf-item-title">vLLM Engine</div><div class="vf-item-sub">PagedAttention generation</div></div>
                </div>

                <div class="vf-cat-title">Security & Deployment</div>
                <div class="vf-palette-item" draggable="true" data-type="security" data-title="Security Shield" data-icon="🛡️">
                  <span class="vf-item-icon">🛡️</span>
                  <div class="vf-item-text"><div class="vf-item-title">Security Shield</div><div class="vf-item-sub">Guardrails & CVE gate</div></div>
                </div>
                <div class="vf-palette-item" draggable="true" data-type="deploy" data-title="Kubernetes Deploy" data-icon="☸️">
                  <span class="vf-item-icon">☸️</span>
                  <div class="vf-item-text"><div class="vf-item-title">K8s Deployment</div><div class="vf-item-sub">Production pod rollouts</div></div>
                </div>
              </div>
            </aside>

            <!-- Center: Interactive Canvas -->
            <div class="vf-canvas-container" id="vfCanvasContainer">
              <!-- Floating expand buttons when sidebars are collapsed -->
              <button class="vf-floating-tab left" id="vfExpandLeftBtn" title="Expand Component Palette">▶ Palette</button>
              <button class="vf-floating-tab right" id="vfExpandRightBtn" title="Expand Inspector">◀ Inspector</button>

              <!-- Dynamic Flow Direction HUD Banner -->
              <div class="vf-direction-banner" id="vfDirectionBanner" style="display:none;"></div>

              <div class="vf-canvas-viewport" id="vfCanvasViewport">
                <!-- SVG Wire Layer -->
                <svg class="vf-svg-layer" id="vfSvgLayer"></svg>
                <!-- Rendered Nodes Container -->
                <div id="vfNodesLayer"></div>
              </div>

              <!-- Floating Canvas Controls & Step-by-Step Playback -->
              <div class="vf-floating-toolbar">
                <button class="vf-tool-btn" id="vfZoomInBtn" title="Zoom In">➕</button>
                <button class="vf-tool-btn" id="vfZoomResetBtn" title="Reset Zoom">100%</button>
                <button class="vf-tool-btn" id="vfZoomOutBtn" title="Zoom Out">➖</button>
                <button class="vf-tool-btn" id="vfFitViewBtn" title="Fit Entire Graph in View">🎯 Fit View</button>
                <span style="color:var(--vf-border);">|</span>
                <div class="vf-playback-bar">
                  <button class="vf-playback-btn" id="vfPlayPauseBtn" title="Play / Pause Simulation">▶ Play</button>
                  <button class="vf-playback-btn" id="vfStepBackBtn" title="Step Backward">⏮ Step Back</button>
                  <button class="vf-playback-btn" id="vfStepForwardBtn" title="Step Forward">⏭ Step Next</button>
                  <button class="vf-playback-btn" id="vfResetFlowBtn" title="Reset Simulation State">🔄 Reset</button>
                  <button class="vf-playback-btn danger" id="vfInjectFailureBtn" title="Inject Safe Failure Scenario">⚠️ Inject Failure</button>
                </div>
                <span style="color:var(--vf-border);">|</span>
                <button class="vf-tool-btn" id="vfClearBtn" title="Clear Canvas">🗑️</button>
              </div>
            </div>

            <!-- Right Panel: Node Inspector & AI Guide -->
            <aside class="vf-sidebar-right" id="vfSidebarRight">
              <div class="vf-inspector-pane">
                <div class="vf-panel-header">
                  <span class="vf-panel-title">Component Inspector</span>
                  <button class="vf-panel-collapse-btn" id="vfCollapseRightBtn" title="Collapse Inspector (▶)">▶</button>
                </div>
                <div class="vf-inspector-content" id="vfInspectorContent">
                  <div class="vf-empty-inspector">
                    <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">⚙️</div>
                    <div>Select any node on the canvas to configure parameters, inspect latency, and view SRE runbooks.</div>
                  </div>
                </div>
              </div>

              <!-- Contextual Lab Guide & AI Runbook -->
              <div class="vf-guide-pane">
                <div class="vf-panel-header">
                  <span class="vf-panel-title">🤖 Studio Lab & SRE Guidance</span>
                </div>
                <div class="vf-copilot-guide" id="vfCopilotGuide">
                  <div style="color: var(--vf-text-muted);">Select a studio to view guided exercises and architecture runbooks.</div>
                </div>
              </div>
            </aside>
          </div>

          <!-- Bottom Drawer: Execution Telemetry & Logs -->
          <div class="vf-drawer" id="vfDrawer">
            <div class="vf-drawer-header" id="vfDrawerHeader">
              <div class="vf-drawer-tabs">
                <button class="vf-drawer-tab active" data-tab="logs">Execution Logs</button>
                <button class="vf-drawer-tab" data-tab="metrics">Golden Signals & SLOs</button>
                <button class="vf-drawer-tab" data-tab="code">Generated Manifest</button>
              </div>
              <div style="font-size: 0.72rem; font-family: var(--vf-font-mono); color: var(--vf-text-muted);" id="vfDrawerToggleLabel">
                <span id="vfDrawerChevron">▼</span> <span id="vfDrawerText">Toggle Drawer</span>
              </div>
            </div>
            <div class="vf-drawer-panels">
              <div class="vf-terminal-body vf-drawer-panel active" id="vfTerminalBody" data-panel="logs">
                <div class="vf-log-entry">
                  <span class="vf-log-time">[${new Date().toISOString().substring(11, 19)}]</span>
                  <span class="vf-log-engine">[WASM RUNTIME]</span>
                  <span class="vf-log-msg">Visual Flow Studio initialized. Zero external dependencies required. Ready to run flow.</span>
                </div>
              </div>
              <div class="vf-drawer-panel" id="vfMetricsPanel" data-panel="metrics" style="display:none;"></div>
              <div class="vf-drawer-panel" id="vfManifestPanel" data-panel="code" style="display:none;"></div>
            </div>
          </div>
        </div>
      `;

      this.canvasContainer = this.container.querySelector('#vfCanvasContainer');
      this.canvasViewport = this.container.querySelector('#vfCanvasViewport');
      this.svgLayer = this.container.querySelector('#vfSvgLayer');
      this.nodesLayer = this.container.querySelector('#vfNodesLayer');
      this.inspectorContent = this.container.querySelector('#vfInspectorContent');
      this.copilotGuide = this.container.querySelector('#vfCopilotGuide');
      this.studioSelect = this.container.querySelector('#vfStudioSelect');
      this.brandBadge = this.container.querySelector('#vfActiveStudioBadge') || this.container.querySelector('.vf-badge');
      this.terminalBody = this.container.querySelector('#vfTerminalBody');
      this.metricsPanel = this.container.querySelector('#vfMetricsPanel');
      this.manifestPanel = this.container.querySelector('#vfManifestPanel');
      this.drawer = this.container.querySelector('#vfDrawer');
      this.drawerHeader = this.container.querySelector('#vfDrawerHeader');
      this.drawerChevron = this.container.querySelector('#vfDrawerChevron');
      this.drawerText = this.container.querySelector('#vfDrawerText');
      this.sidebarLeft = this.container.querySelector('#vfSidebarLeft');
      this.sidebarRight = this.container.querySelector('#vfSidebarRight');
      this.collapseLeftBtn = this.container.querySelector('#vfCollapseLeftBtn');
      this.collapseRightBtn = this.container.querySelector('#vfCollapseRightBtn');
      this.expandLeftBtn = this.container.querySelector('#vfExpandLeftBtn');
      this.expandRightBtn = this.container.querySelector('#vfExpandRightBtn');
      this.zenBtn = this.container.querySelector('#vfZenBtn');
      this.runFlowBtn = this.container.querySelector('#vfRunFlowBtn');
      this.autoLayoutBtn = this.container.querySelector('#vfAutoLayoutBtn');
      this.saveBtn = this.container.querySelector('#vfSaveBtn');
      this.restoreBtn = this.container.querySelector('#vfRestoreBtn');
      this.importBtn = this.container.querySelector('#vfImportBtn');
      this.importFileInput = this.container.querySelector('#vfImportFileInput');
      this.exportCodeBtn = this.container.querySelector('#vfExportCodeBtn');

      // Master Extensions Elements
      this.flowDirectionSelect = this.container.querySelector('#vfFlowDirectionSelect');
      this.directionBanner = this.container.querySelector('#vfDirectionBanner');
      this.manimMcpBtn = this.container.querySelector('#vfManimMcpBtn');
      this.playPauseBtn = this.container.querySelector('#vfPlayPauseBtn');
      this.stepBackBtn = this.container.querySelector('#vfStepBackBtn');
      this.stepForwardBtn = this.container.querySelector('#vfStepForwardBtn');
      this.resetFlowBtn = this.container.querySelector('#vfResetFlowBtn');
      this.injectFailureBtn = this.container.querySelector('#vfInjectFailureBtn');
    }

    _bindEvents() {
      // 1. Canvas Pan with Drag
      this.canvasContainer.addEventListener('mousedown', (e) => {
        if (e.target.closest('.vf-node') || e.target.closest('.vf-port') || e.target.closest('.vf-floating-toolbar')) return;
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
        this.canvasContainer.style.cursor = 'grabbing';
      });

      let rafPending = false;
      let lastClientX = 0;
      let lastClientY = 0;

      const requestFrame = (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
        ? window.requestAnimationFrame.bind(window)
        : (cb) => { cb(); };

      window.addEventListener('mousemove', (e) => {
        lastClientX = e.clientX;
        lastClientY = e.clientY;

        if (this.isPanning || (this.isDraggingNode && this.draggedNodeId)) {
          if (!rafPending) {
            rafPending = true;
            requestFrame(() => {
              rafPending = false;
              if (this.isPanning) {
                this.panOffset = { x: lastClientX - this.panStart.x, y: lastClientY - this.panStart.y };
                this._applyTransform();
              } else if (this.isDraggingNode && this.draggedNodeId) {
                const node = this.nodes.get(this.draggedNodeId);
                if (node) {
                  node.x = Math.round((lastClientX - this.panOffset.x - this.dragOffset.x) / this.scale);
                  node.y = Math.round((lastClientY - this.panOffset.y - this.dragOffset.y) / this.scale);
                  this._updateNodePosition(node);
                  this._updateWiresForNode(this.draggedNodeId);
                }
              }
            });
          }
        }
      });

      window.addEventListener('mouseup', () => {
        if (this.isPanning) {
          this.isPanning = false;
          this.canvasContainer.style.cursor = 'default';
        }
        if (this.isDraggingNode) {
          this.isDraggingNode = false;
          this.draggedNodeId = null;
          this._renderConnections();
        }
      });

      // 2. Zoom with Wheel
      this.canvasContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
        this.setZoom(this.scale + zoomDelta);
      }, { passive: false });

      // 3. Zoom Toolbar Buttons
      this.container.querySelector('#vfZoomInBtn').addEventListener('click', () => this.setZoom(this.scale + 0.15));
      this.container.querySelector('#vfZoomOutBtn').addEventListener('click', () => this.setZoom(this.scale - 0.15));
      this.container.querySelector('#vfZoomResetBtn').addEventListener('click', () => {
        this.scale = 1.0;
        this.panOffset = { x: 40, y: 40 };
        this._applyTransform();
      });
      const fitBtn = this.container.querySelector('#vfFitViewBtn');
      if (fitBtn) fitBtn.addEventListener('click', () => this.fitView());

      this.container.querySelector('#vfClearBtn').addEventListener('click', () => {
        if (confirm('Clear all nodes and wires from canvas?')) {
          this.nodes.clear();
          this.connections = [];
          this.selectedNodeId = null;
          this.render();
          this._renderInspector(null);
        }
      });

      // 4. Auto Layout
      this.autoLayoutBtn.addEventListener('click', () => this.autoLayout());

      // 5. Run Flow Execution & Playback Controls
      this.runFlowBtn.addEventListener('click', () => this.runFlow());

      if (this.flowDirectionSelect) {
        this.flowDirectionSelect.addEventListener('change', (e) => {
          this.setFlowDirection(e.target.value);
        });
      }

      if (this.manimMcpBtn) {
        this.manimMcpBtn.addEventListener('click', () => this.openManimModal());
      }

      if (this.playPauseBtn) {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
      }

      if (this.stepBackBtn) {
        this.stepBackBtn.addEventListener('click', () => this.stepBackward());
      }

      if (this.stepForwardBtn) {
        this.stepForwardBtn.addEventListener('click', () => this.stepForward());
      }

      if (this.resetFlowBtn) {
        this.resetFlowBtn.addEventListener('click', () => this.resetSimulation());
      }

      if (this.injectFailureBtn) {
        this.injectFailureBtn.addEventListener('click', () => this.injectFailure());
      }

      // 6. Export Code
      this.exportCodeBtn.addEventListener('click', () => this.exportCode());

      // 6b. Save Project to Persistence
      if (this.saveBtn) {
        this.saveBtn.addEventListener('click', () => this.saveProject());
      }

      // 6c. Restore Project from Persistence
      if (this.restoreBtn) {
        this.restoreBtn.addEventListener('click', () => this.restoreProject());
      }

      // 6d. Import Flow Specification JSON
      if (this.importBtn && this.importFileInput) {
        this.importBtn.addEventListener('click', () => this.importFileInput.click());
        this.importFileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.importProject(evt.target.result);
            this.importFileInput.value = '';
          };
          reader.readAsText(file);
        });
      }

      // 7. Starter Templates Listener
      this.container.querySelectorAll('.vf-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-template');
          this.loadTemplate(key);
        });
      });

      // 8. Studio Selector Listener
      if (this.studioSelect) {
        this.studioSelect.addEventListener('change', (e) => {
          if (e.target.value) {
            this.loadStudio(e.target.value);
          }
        });
      }

      // 9. Palette Search
      const searchInput = this.container.querySelector('#vfPaletteSearch');
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        this.container.querySelectorAll('.vf-palette-item').forEach(item => {
          const text = (item.getAttribute('data-title') || '').toLowerCase();
          item.style.display = text.includes(q) ? 'flex' : 'none';
        });
      });

      // 10. Drag & Drop from Palette onto Canvas
      this.container.querySelectorAll('.vf-palette-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({
            type: item.getAttribute('data-type'),
            title: item.getAttribute('data-title'),
            icon: item.getAttribute('data-icon')
          }));
        });
      });

      this.canvasContainer.addEventListener('dragover', (e) => e.preventDefault());
      this.canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        try {
          const raw = e.dataTransfer.getData('text/plain');
          if (!raw) return;
          const data = JSON.parse(raw);
          const rect = this.canvasContainer.getBoundingClientRect();
          const dropX = Math.round((e.clientX - rect.left - this.panOffset.x) / this.scale);
          const dropY = Math.round((e.clientY - rect.top - this.panOffset.y) / this.scale);

          const newId = 'n_' + Math.random().toString(36).substring(2, 7);
          this.addNode({
            id: newId,
            type: data.type || 'generic',
            title: data.title || 'Component',
            icon: data.icon || '📦',
            x: dropX,
            y: dropY,
            params: { status: 'configured' },
            desc: `User configured ${data.title} node.`
          });
        } catch (err) {
          console.warn('Drop error:', err);
        }
      });

      // 11. Toggle Bottom Drawer
      this.drawerHeader.addEventListener('click', (e) => {
        if (e.target.closest('.vf-drawer-tab')) return;
        this.drawer.classList.toggle('collapsed');
        const isCollapsed = this.drawer.classList.contains('collapsed');
        if (this.drawerChevron) this.drawerChevron.textContent = isCollapsed ? '▲' : '▼';
        if (this.drawerText) this.drawerText.textContent = isCollapsed ? 'Expand Drawer' : 'Collapse Drawer';
        setTimeout(() => this.fitView(), 220);
      });

      // 11b. Left Sidebar (Palette) Collapsing & Expanding
      if (this.collapseLeftBtn) {
        this.collapseLeftBtn.addEventListener('click', () => this.toggleLeftSidebar(false));
      }
      if (this.expandLeftBtn) {
        this.expandLeftBtn.addEventListener('click', () => this.toggleLeftSidebar(true));
      }

      // 11c. Right Sidebar (Inspector) Collapsing & Expanding
      if (this.collapseRightBtn) {
        this.collapseRightBtn.addEventListener('click', () => this.toggleRightSidebar(false));
      }
      if (this.expandRightBtn) {
        this.expandRightBtn.addEventListener('click', () => this.toggleRightSidebar(true));
      }

      // 11d. Zen Canvas Mode (Collapses both left and right sidebars for full canvas immersion)
      if (this.zenBtn) {
        this.zenBtn.addEventListener('click', () => this.toggleZenMode());
      }

      // 12. Bottom Drawer Tab Switcher
      this.drawer.querySelectorAll('.vf-drawer-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.stopPropagation();
          const tabKey = tab.getAttribute('data-tab');
          this.switchDrawerTab(tabKey);
        });
      });

      // 13. Auto re-fit on window resize
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => {
          if (this.nodes.size > 0 && !this.isPanning && !this.isDraggingNode) {
            this.fitView();
          }
        });
      }
    }

    toggleLeftSidebar(expand) {
      if (!this.sidebarLeft) return;
      if (typeof expand === 'boolean') {
        if (expand) this.sidebarLeft.classList.remove('collapsed');
        else this.sidebarLeft.classList.add('collapsed');
      } else {
        this.sidebarLeft.classList.toggle('collapsed');
      }
      const isCollapsed = this.sidebarLeft.classList.contains('collapsed');
      if (this.expandLeftBtn) {
        if (isCollapsed) this.expandLeftBtn.classList.add('visible');
        else this.expandLeftBtn.classList.remove('visible');
      }
      setTimeout(() => this.fitView(), 240);
    }

    toggleRightSidebar(expand) {
      if (!this.sidebarRight) return;
      if (typeof expand === 'boolean') {
        if (expand) this.sidebarRight.classList.remove('collapsed');
        else this.sidebarRight.classList.add('collapsed');
      } else {
        this.sidebarRight.classList.toggle('collapsed');
      }
      const isCollapsed = this.sidebarRight.classList.contains('collapsed');
      if (this.expandRightBtn) {
        if (isCollapsed) this.expandRightBtn.classList.add('visible');
        else this.expandRightBtn.classList.remove('visible');
      }
      setTimeout(() => this.fitView(), 240);
    }

    toggleZenMode() {
      const leftCol = this.sidebarLeft && this.sidebarLeft.classList.contains('collapsed');
      const rightCol = this.sidebarRight && this.sidebarRight.classList.contains('collapsed');
      const shouldRestore = leftCol && rightCol;

      if (shouldRestore) {
        if (this.sidebarLeft) this.sidebarLeft.classList.remove('collapsed');
        if (this.sidebarRight) this.sidebarRight.classList.remove('collapsed');
        if (this.expandLeftBtn) this.expandLeftBtn.classList.remove('visible');
        if (this.expandRightBtn) this.expandRightBtn.classList.remove('visible');
        if (this.zenBtn) this.zenBtn.textContent = '⛶ Zen Canvas';
      } else {
        if (this.sidebarLeft) this.sidebarLeft.classList.add('collapsed');
        if (this.sidebarRight) this.sidebarRight.classList.add('collapsed');
        if (this.expandLeftBtn) this.expandLeftBtn.classList.add('visible');
        if (this.expandRightBtn) this.expandRightBtn.classList.add('visible');
        if (this.zenBtn) this.zenBtn.textContent = '◱ Exit Zen';
      }
      setTimeout(() => this.fitView(), 240);
    }

    _applyTransform() {
      this.canvasViewport.style.transform = `translate(${this.panOffset.x}px, ${this.panOffset.y}px) scale(${this.scale})`;
    }

    setZoom(newScale) {
      this.scale = Math.max(0.4, Math.min(2.0, newScale));
      const zoomBtn = this.container.querySelector('#vfZoomResetBtn');
      if (zoomBtn) zoomBtn.textContent = `${Math.round(this.scale * 100)}%`;
      this._applyTransform();
    }

    fitView(padding = 50) {
      if (!this.canvasContainer || this.nodes.size === 0) return;
      const rect = this.canvasContainer.getBoundingClientRect ? this.canvasContainer.getBoundingClientRect() : { width: 0, height: 0 };
      const width = rect.width || this.canvasContainer.clientWidth || 800;
      const height = rect.height || this.canvasContainer.clientHeight || 600;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const nodeWidth = 280;
      const nodeHeight = 160;

      this.nodes.forEach(n => {
        if (n.x < minX) minX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.x + nodeWidth > maxX) maxX = n.x + nodeWidth;
        if (n.y + nodeHeight > maxY) maxY = n.y + nodeHeight;
      });

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      if (graphWidth <= 0 || graphHeight <= 0) return;

      const availW = Math.max(200, width - padding * 2);
      const availH = Math.max(200, height - padding * 2);

      const scaleX = availW / graphWidth;
      const scaleY = availH / graphHeight;
      let targetScale = Math.min(1.0, Math.min(scaleX, scaleY));
      // Keep comfortable readable zoom level (never shrink to microscopic 40%)
      targetScale = Math.max(0.72, Math.min(1.05, targetScale));

      this.scale = targetScale;

      const scaledGraphWidth = graphWidth * targetScale;
      if (width >= scaledGraphWidth + padding * 2) {
        // Fits entirely: center it
        this.panOffset = {
          x: Math.round((width - scaledGraphWidth) / 2 - minX * targetScale),
          y: Math.round((height - graphHeight * targetScale) / 2 - minY * targetScale)
        };
      } else {
        // Wider than viewport: start cleanly with comfortable left padding
        this.panOffset = {
          x: Math.round(padding - minX * targetScale),
          y: Math.round((height - graphHeight * targetScale) / 2 - minY * targetScale)
        };
      }

      const zoomBtn = this.container.querySelector('#vfZoomResetBtn');
      if (zoomBtn) {
        zoomBtn.textContent = `${Math.round(this.scale * 100)}%`;
      }
      this._applyTransform();
    }

    async _initStudiosCatalog() {
      if (!this.studioSelect) return;
      if (this.studiosList && this.studiosList.length > 0) {
        this._populateStudioSelect(this.studiosList);
        return;
      }

      if (typeof fetch !== 'function') return;

      try {
        let res = await fetch('../tools/tools.json');
        if (!res || !res.ok) {
          res = await fetch('/tools/tools.json');
        }
        if (!res || !res.ok) {
          res = await fetch('../../tools/tools.json');
        }
        if (res && res.ok) {
          this.studiosList = await res.json();
          this._populateStudioSelect(this.studiosList);
          if (this.currentStudioId && this.studioSelect) {
            const rawSlug = this.currentStudioId.replace(/^\/?tools\//, '').replace(/\/$/, '');
            this.studioSelect.value = rawSlug;
          }
        }
      } catch (e) {
        // Tolerated in offline / test environments
      }
    }

    _populateStudioSelect(list) {
      if (!this.studioSelect) return;
      const cats = {
        'ai': 'AI & LLMOps Studios',
        'cloud': 'Cloud & Infrastructure Studios',
        'observability': 'Observability & SRE Studios',
        'cicd': 'DevOps & CI/CD Studios',
        'automation': 'Automation & Systems Studios'
      };

      const groups = {};
      Object.keys(cats).forEach(k => { groups[k] = []; });
      groups['other'] = [];

      list.forEach(item => {
        const c = (item.category || '').toLowerCase();
        const matchedCat = Object.keys(cats).find(k => c.includes(k)) || 'other';
        const rawSlug = (item.link || '').replace(/^\/?tools\//, '').replace(/\/$/, '');
        groups[matchedCat].push({
          id: rawSlug,
          title: item.title,
          icon: item.icon || '🛠️'
        });
      });

      let html = `<option value="">Select Studio (347 available)...</option>`;
      Object.entries(groups).forEach(([catKey, items]) => {
        if (items.length === 0) return;
        const label = cats[catKey] || 'Other Engineering Studios';
        html += `<optgroup label="${label} (${items.length})">`;
        items.forEach(it => {
          const escId = VisualFlowCanvas.escapeHtml(it.id);
          const escIcon = VisualFlowCanvas.escapeHtml(it.icon);
          const escTitle = VisualFlowCanvas.escapeHtml(it.title);
          html += `<option value="${escId}">${escIcon} ${escTitle}</option>`;
        });
        html += `</optgroup>`;
      });

      this.studioSelect.innerHTML = html;
      if (this.currentStudioId) {
        const rawSlug = this.currentStudioId.replace(/^\/?tools\//, '').replace(/\/$/, '');
        this.studioSelect.value = rawSlug;
      }
    }

    escapeHtml(str) {
      return VisualFlowCanvas.escapeHtml(str);
    }

    static escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    static generateStudioTopology(studioId, toolData = {}) {
      const sanitizedStudioId = VisualFlowCanvas.escapeHtml(studioId || '');
      const slug = (studioId || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const title = (toolData.title || studioId || '').toLowerCase();
      const cat = (toolData.category || '').toLowerCase();
      const desc = (toolData.desc || '').toLowerCase();
      const tag = (toolData.tag || '').toLowerCase();

      if (!VisualFlowCanvas._topoCache) {
        VisualFlowCanvas._topoCache = new Map();
      }
      const cacheKey = `${slug}::${tag}::${title}`;
      if (VisualFlowCanvas._topoCache.has(cacheKey)) {
        return JSON.parse(JSON.stringify(VisualFlowCanvas._topoCache.get(cacheKey)));
      }

      // 1. Multimodal & Vision VLM
      if (slug.includes('pixtral') || slug.includes('vlm') || slug.includes('vision') || slug.includes('multimodal') || slug.includes('whisper') || slug.includes('audio') || slug.includes('speech') || title.includes('pixtral') || title.includes('vision') || title.includes('multimodal')) {
        return {
          id: slug || 'vlm',
          name: toolData.title || 'Vision & Multimodal VLM Pipeline',
          category: 'ai',
          nodes: [
            { id: 'vlm_1', type: 'input', title: 'Multimodal Frame Ingestion', icon: '🖼️', x: 60, y: 140, params: { resolution: '1024x1024 Native', fps: '30fps WebP', audioCodec: 'Opus 48kHz' }, desc: 'Decodes and normalizes high-resolution images, streaming audio, and video frames.' },
            { id: 'vlm_2', type: 'transform', title: 'Vision Transformer (ViT) 2D Patches', icon: '👁️', x: 380, y: 140, params: { patchGrid: '14x14', patchTokens: '1024', precision: 'BF16' }, desc: 'Extracts dense spatial 2D patch features without aspect-ratio distortion.' },
            { id: 'vlm_3', type: 'transform', title: 'Multimodal Cross-Projector', icon: '🔄', x: 700, y: 140, params: { projectorType: 'Two-Layer GeLU MLP', embedDim: '4096' }, desc: 'Projects visual latent vectors directly into autoregressive LLM token space.' },
            { id: 'vlm_4', type: 'model', title: 'Pixtral Autoregressive Core', icon: '🧠', x: 1020, y: 140, params: { contextWindow: '128k Interleaved', temperature: '0.15', topP: '0.9' }, desc: 'Jointly reasons across interleaved text tokens, spatial coordinates, and audio tokens.' },
            { id: 'vlm_5', type: 'output', title: 'Spatial Grounding & Structured JSON', icon: '🎯', x: 1340, y: 140, params: { schema: 'Strict Pydantic BoundingBox', ocrPrecision: '99.4%' }, desc: 'Emits validated spatial coordinates, bounding polygons, and grounded OCR answers.' }
          ],
          connections: [
            { from: 'vlm_1', to: 'vlm_2' },
            { from: 'vlm_2', to: 'vlm_3' },
            { from: 'vlm_3', to: 'vlm_4' },
            { from: 'vlm_4', to: 'vlm_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#38bdf8; margin-bottom:0.4rem;">🔬 Guided Multimodal Lab</div>
            <p>1. Ingest interleaved images and text prompts.</p>
            <p>2. Verify ViT token alignment in the cross-projector layer.</p>
            <p>3. Extract strictly validated spatial bounding boxes without hallucinations.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              vllm serve mistralai/Pixtral-12B-2409 --limit-mm-per-prompt image=4
            </div>
          `
        };
      }

      // 2. Linux Kernel & eBPF Continuous Profiler
      if (slug.includes('ebpf') || slug.includes('profiler') || slug.includes('kernel') || slug.includes('bcc') || slug.includes('bpftrace') || slug.includes('xdp') || title.includes('ebpf') || title.includes('profiler') || title.includes('kernel')) {
        return {
          id: slug || 'ebpf',
          name: toolData.title || 'eBPF In-Kernel Continuous Profiler',
          category: 'observability',
          nodes: [
            { id: 'bpf_1', type: 'input', title: 'Kernel Tracepoint Hook', icon: '🪝', x: 60, y: 140, params: { hook: 'kprobe:sys_enter / sched_switch', sampleFreq: '99Hz' }, desc: 'Attaches zero-overhead in-kernel probe at syscall and scheduling boundaries.' },
            { id: 'bpf_2', type: 'security', title: 'Kernel BPF Verifier', icon: '🛡️', x: 380, y: 140, params: { instructionLimit: '1,000,000', memorySafety: 'Bounded Pointer' }, desc: 'Proves memory safety and termination guarantees before JIT bytecode execution.' },
            { id: 'bpf_3', type: 'storage', title: 'Lockless RingBuffer', icon: '⚡', x: 700, y: 140, params: { ringSize: '16MB', dropPolicy: 'Watermark Wakeup' }, desc: 'High-throughput lockless per-CPU ring buffer streaming traces to userspace.' },
            { id: 'bpf_4', type: 'transform', title: 'DWARF Stack Unwinder', icon: '🔥', x: 1020, y: 140, params: { unwinder: 'FramePointer + DWARF', symbols: 'vmlinux / libc' }, desc: 'Resolves inlined kernel symbols and folded user-space call stacks into flamegraphs.' },
            { id: 'bpf_5', type: 'output', title: 'Parca / Pyroscope Telemetry', icon: '📊', x: 1340, y: 140, params: { storage: 'Continuous Parquet', p99OffCpu: 'Tracked' }, desc: 'Streams aggregated flamegraphs into continuous profiling database.' }
          ],
          connections: [
            { from: 'bpf_1', to: 'bpf_2' },
            { from: 'bpf_2', to: 'bpf_3' },
            { from: 'bpf_3', to: 'bpf_4' },
            { from: 'bpf_4', to: 'bpf_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#34d399; margin-bottom:0.4rem;">🔬 Kernel eBPF Diagnostics</div>
            <p>1. Attach zero-overhead kprobes to target kernel entry points.</p>
            <p>2. Verify BPF verifier passes instructions without unbounded pointer dereferences.</p>
            <p>3. Inspect continuous off-CPU and on-CPU latency flamegraphs.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              bpftrace -e 'profile:hz:99 /pid == 1234/ { @[kstack] = count(); }'
            </div>
          `
        };
      }

      // 3. High-Performance LLM Serving & Speculative Inference
      if (slug.includes('vllm') || slug.includes('tgi') || slug.includes('sglang') || slug.includes('speculative') || slug.includes('pagedattention') || slug.includes('tensorrt') || slug.includes('quantization') || title.includes('vllm') || title.includes('speculative')) {
        return {
          id: slug || 'vllm',
          name: toolData.title || 'High-Throughput vLLM & Speculative Serving',
          category: 'ai',
          nodes: [
            { id: 'inf_1', type: 'input', title: 'Continuous Batch Request Stream', icon: '💬', x: 60, y: 140, params: { protocol: 'HTTP/2 Streaming SSE', maxConcurrent: '256' }, desc: 'Ingests continuous token requests with prompt caching headers.' },
            { id: 'inf_2', type: 'transform', title: 'PagedAttention Virtual Memory', icon: '🧩', x: 380, y: 140, params: { blockTokens: '16', vramUtilization: '0.90' }, desc: 'Eliminates internal & external memory fragmentation by paging KV-cache.' },
            { id: 'inf_3', type: 'model', title: 'Speculative Draft Proposer', icon: '⚡', x: 700, y: 140, params: { draftModel: 'Llama-3.2-1B', draftK: '4 tokens' }, desc: 'Rapidly produces candidate token sequences ahead of primary verification.' },
            { id: 'inf_4', type: 'compute', title: 'Target GPU Tensor Parallelism', icon: '🧠', x: 1020, y: 140, params: { targetModel: 'Llama-3.3-70B', tpSize: '4x H100 GPU' }, desc: 'Executes parallel forward verification and accepts verified speculative tokens.' },
            { id: 'inf_5', type: 'output', title: 'Chunked Prefill & Stream Scheduler', icon: '🎯', x: 1340, y: 140, params: { tpotLatency: '< 12ms', chunkTokens: '512' }, desc: 'Maintains low time-per-output-token while interleaving long prompt prefills.' }
          ],
          connections: [
            { from: 'inf_1', to: 'inf_2' },
            { from: 'inf_2', to: 'inf_3' },
            { from: 'inf_3', to: 'inf_4' },
            { from: 'inf_4', to: 'inf_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#a855f7; margin-bottom:0.4rem;">🔬 Serving Optimization Lab</div>
            <p>1. Tune PagedAttention block size to eliminate KV fragmentation.</p>
            <p>2. Enable speculative draft model to achieve 2.4x speedup.</p>
            <p>3. Monitor p99 Time-to-First-Token (TTFT) and Time-Per-Output-Token (TPOT).</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              vllm serve meta-llama/Llama-3.3-70B-Instruct --speculative-model meta-llama/Llama-3.2-1B --tensor-parallel-size 4
            </div>
          `
        };
      }

      // 4a. CNCF Kubernetes Complete Ecosystem (Envoy Gateway, cert-manager, KEDA, Longhorn, Fluent Bit, containerd)
      if (slug.includes('envoy-gateway') || slug.includes('cert-manager') || slug.includes('longhorn') || slug.includes('fluent-bit') || slug.includes('containerd') || slug.includes('k8s-ecosystem') || title.includes('envoy gateway') || title.includes('cert-manager') || title.includes('longhorn') || title.includes('fluent bit') || title.includes('containerd')) {
        return {
          id: slug || 'k8s-ecosystem',
          name: toolData.title || STARTER_TEMPLATES.k8sEcosystem.name,
          category: 'cloud',
          nodes: STARTER_TEMPLATES.k8sEcosystem.nodes.map(n => Object.assign({}, n)),
          connections: STARTER_TEMPLATES.k8sEcosystem.connections.map(c => Object.assign({}, c)),
          copilotHtml: `
            <div style="font-weight:600; color:#38bdf8; margin-bottom:0.4rem;">🔬 CNCF Kubernetes Ecosystem Lab</div>
            <p>1. Ingress traffic routes through Envoy Gateway with automated cert-manager TLS.</p>
            <p>2. KEDA scales pod replicas on queue lag; Karpenter consolidates node fleet.</p>
            <p>3. Longhorn replicates persistent block storage while Fluent Bit streams logs to Loki.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              kubectl get gateway,scaledobject,nodepool,pvc,daemonset -A
            </div>
          `
        };
      }

      // 4b. Kubernetes, Karpenter & Cloud-Native Scaling
      if (slug.includes('karpenter') || slug.includes('k8s') || slug.includes('kubernetes') || slug.includes('helm') || slug.includes('argo') || slug.includes('istio') || slug.includes('cilium') || title.includes('karpenter') || title.includes('kubernetes')) {
        return {
          id: slug || 'k8s',
          name: toolData.title || 'Kubernetes Karpenter & Fleet Scaler',
          category: 'cloud',
          nodes: [
            { id: 'k8s_1', type: 'input', title: 'Pending Pod SQS Metric Queue', icon: '☸️', x: 60, y: 140, params: { unschedulablePods: '> 0', queueDepth: 'Real-time SQS' }, desc: 'Watches cluster scheduler for pending workloads requiring new node compute.' },
            { id: 'k8s_2', type: 'transform', title: 'Karpenter NodePool Consolidator', icon: '🧭', x: 380, y: 140, params: { consolidation: 'WhenUnderutilized', arch: 'arm64,amd64' }, desc: 'Evaluates bin-packing constraints and provisions precise node instances.' },
            { id: 'k8s_3', type: 'compute', title: 'EC2 / GCP Spot & On-Demand Fleet', icon: '☁️', x: 700, y: 140, params: { strategy: 'Price-Capacity-Optimized', launchTime: '< 40s' }, desc: 'Launches dynamic compute instances with zero managed node group overhead.' },
            { id: 'k8s_4', type: 'network', title: 'Cilium eBPF CNI Network Mesh', icon: '🔌', x: 1020, y: 140, params: { ipam: 'Multi-ENI Prefix Delegation', encryption: 'WireGuard' }, desc: 'Configures high-throughput host networking and container network interfaces.' },
            { id: 'k8s_5', type: 'output', title: 'Ready Pods Production Binding', icon: '🚀', x: 1340, y: 140, params: { podReadiness: '100%', disruptionBudget: 'Strict PDB' }, desc: 'Schedules workloads directly onto initialized node without downtime.' }
          ],
          connections: [
            { from: 'k8s_1', to: 'k8s_2' },
            { from: 'k8s_2', to: 'k8s_3' },
            { from: 'k8s_3', to: 'k8s_4' },
            { from: 'k8s_4', to: 'k8s_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#38bdf8; margin-bottom:0.4rem;">🔬 Karpenter Scaler Lab</div>
            <p>1. Inject sudden pending pod spike with custom resource requests.</p>
            <p>2. Verify Karpenter chooses lowest-cost spot instance type in under 45s.</p>
            <p>3. Confirm PodDisruptionBudget (PDB) is honored during consolidation.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              kubectl get nodepool default -o yaml
            </div>
          `
        };
      }

      // 5. Agentic AI, Reasoning & Multi-Agent Swarms
      if (slug.includes('agent') || slug.includes('langchain') || slug.includes('crewai') || slug.includes('autogen') || slug.includes('zep') || slug.includes('swarm') || slug.includes('mcp') || slug.includes('deepseek') || slug.includes('jev') || title.includes('agent') || title.includes('reasoning') || title.includes('jev')) {
        return {
          id: slug || 'agent',
          name: toolData.title || 'Agentic AI Swarm & Sandboxed Tool DAG',
          category: 'ai',
          nodes: [
            { id: 'ag_1', type: 'input', title: 'Goal & Intent Prompt Ingestion', icon: '💬', x: 60, y: 140, params: { userGoal: 'Incident Root Cause Analysis', auth: 'Role-Based' }, desc: 'Sanitizes prompt against indirect injection and resolves user intention.' },
            { id: 'ag_2', type: 'model', title: 'Planner / ReAct Loop Engine', icon: '🧭', x: 380, y: 140, params: { model: 'Claude 3.5 Sonnet / DeepSeek-R1', strategy: 'Tree of Thoughts' }, desc: 'Decomposes high-level intent into directed acyclic dependency subtasks.' },
            { id: 'ag_3', type: 'transform', title: 'Jev Sub-100ms Reflex Router', icon: '⚡', x: 700, y: 140, params: { routingLatency: '< 25ms', fallbackToLlm: 'True' }, desc: 'Non-autoregressive calibrated router for immediate deterministic tool calls.' },
            { id: 'ag_4', type: 'tool', title: 'gVisor Sandboxed Tool Worker', icon: '🛠️', x: 1020, y: 140, params: { isolation: 'gVisor MicroVM', tools: 'kubectl, curl, psql' }, desc: 'Executes operational bash and API commands within strict kernel isolation.' },
            { id: 'ag_5', type: 'storage', title: 'Zep Temporal Memory Store', icon: '🧠', x: 1340, y: 140, params: { memoryEngine: 'Zep Cloud / Neo4j', recall: 'Hybrid Cosine + BM25' }, desc: 'Maintains episodic memory and entity relationships across agent sessions.' },
            { id: 'ag_6', type: 'output', title: 'Human Signoff & Production Action', icon: '🛡️', x: 1660, y: 140, params: { signoffLead: 'SRE On-Call', auditLog: 'Signed HMAC' }, desc: 'Gates mutating writes behind approval and records auditable incident resolutions.' }
          ],
          connections: [
            { from: 'ag_1', to: 'ag_2' },
            { from: 'ag_2', to: 'ag_3' },
            { from: 'ag_3', to: 'ag_4' },
            { from: 'ag_4', to: 'ag_5' },
            { from: 'ag_5', to: 'ag_6' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#f59e0b; margin-bottom:0.4rem;">🔬 Agentic Swarm Lab</div>
            <p>1. Dispatch multi-step goal requiring both read-only and mutate tools.</p>
            <p>2. Observe Jev reflex router bypassing LLM for sub-25ms fast routing.</p>
            <p>3. Confirm Human Approval Gate blocks production writes without signoff.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              python -m agents.orchestrator --goal "Triage P0 Latency Spike"
            </div>
          `
        };
      }

      // 6. RAG & Vector DB
      if (slug.includes('rag') || slug.includes('pgvector') || slug.includes('milvus') || slug.includes('qdrant') || slug.includes('pinecone') || slug.includes('embeddings') || slug.includes('chroma') || title.includes('rag') || title.includes('pgvector') || title.includes('vector')) {
        return {
          id: slug || 'rag',
          name: toolData.title || STARTER_TEMPLATES.rag.name,
          category: 'ai',
          nodes: STARTER_TEMPLATES.rag.nodes.map(n => Object.assign({}, n)),
          connections: STARTER_TEMPLATES.rag.connections.map(c => Object.assign({}, c)),
          copilotHtml: `
            <div style="font-weight:600; color:#6366f1; margin-bottom:0.4rem;">🔬 Enterprise RAG Lab</div>
            <p>1. Ingest markdown and PDF technical documentation.</p>
            <p>2. Verify HNSW index search latency stays under 10ms with cosine distance.</p>
            <p>3. Enforce hallucination guardrail to guarantee 100% cited answers.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              SELECT id, content FROM docs ORDER BY embedding <=> '[...]' LIMIT 5;
            </div>
          `
        };
      }

      // 7. DevOps & CI/CD Pipelines
      if (slug.includes('cicd') || slug.includes('pipeline') || slug.includes('github') || slug.includes('gitlab') || slug.includes('jenkins') || slug.includes('tekton') || slug.includes('docker') || cat.includes('cicd') || title.includes('pipeline') || title.includes('action')) {
        return {
          id: slug || 'pipeline',
          name: toolData.title || STARTER_TEMPLATES.pipeline.name,
          category: 'cicd',
          nodes: STARTER_TEMPLATES.pipeline.nodes.map(n => Object.assign({}, n)),
          connections: STARTER_TEMPLATES.pipeline.connections.map(c => Object.assign({}, c)),
          copilotHtml: `
            <div style="font-weight:600; color:#38bdf8; margin-bottom:0.4rem;">🔬 GitOps CI/CD Lab</div>
            <p>1. Trigger pipeline with signed Git commit webhook.</p>
            <p>2. Enforce Trivy SAST gate blocking CRITICAL severity CVEs.</p>
            <p>3. Verify container image signature with Cosign SLSA Level 3.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              cosign verify --key cosign.pub ghcr.io/pradeep/service:sha-latest
            </div>
          `
        };
      }

      // 8. Infrastructure as Code & Cloud
      if (slug.includes('terraform') || slug.includes('opentofu') || slug.includes('ansible') || slug.includes('pulumi') || slug.includes('aws') || slug.includes('azure') || slug.includes('gcp') || cat.includes('cloud') || title.includes('terraform') || title.includes('cloud')) {
        return {
          id: slug || 'infra',
          name: toolData.title || STARTER_TEMPLATES.infra.name,
          category: 'cloud',
          nodes: STARTER_TEMPLATES.infra.nodes.map(n => Object.assign({}, n)),
          connections: STARTER_TEMPLATES.infra.connections.map(c => Object.assign({}, c)),
          copilotHtml: `
            <div style="font-weight:600; color:#38bdf8; margin-bottom:0.4rem;">🔬 Cloud Topology Lab</div>
            <p>1. Review ingress routing through Application Load Balancer.</p>
            <p>2. Verify multi-AZ EKS worker node deployment with private subnets.</p>
            <p>3. Validate state locking in S3 + DynamoDB backend.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              tofu plan -out=tfplan && checkov -f tfplan
            </div>
          `
        };
      }

      // 9. Observability, SRE & Incident Triage
      if (slug.includes('observability') || slug.includes('prometheus') || slug.includes('grafana') || slug.includes('otel') || slug.includes('opentelemetry') || slug.includes('tempo') || slug.includes('loki') || slug.includes('sre') || slug.includes('alert') || cat.includes('observability') || title.includes('prometheus') || title.includes('monitor')) {
        return {
          id: slug || 'observability',
          name: toolData.title || 'Observability & SRE Incident Triage',
          category: 'observability',
          nodes: [
            { id: 'obs_1', type: 'input', title: 'OTel OpenTelemetry Collector', icon: '📡', x: 60, y: 140, params: { protocol: 'OTLP/gRPC 4317', batchTimeout: '200ms' }, desc: 'Unified telemetry gateway receiving metrics, distributed traces, and log streams.' },
            { id: 'obs_2', type: 'transform', title: 'Tail-Based Sampling Filter', icon: '⚡', x: 380, y: 140, params: { errorSampleRate: '100%', normalSampleRate: '1%' }, desc: 'Intelligently retains 100% of anomalous and error spans while sampling normal traces.' },
            { id: 'obs_3', type: 'storage', title: 'Mimir / Tempo Storage Hot Tier', icon: '🗄️', x: 700, y: 140, params: { s3Bucket: 'telemetry-hot-tier', compaction: '2h' }, desc: 'Petabyte-scale distributed object storage for metrics, logs, and distributed traces.' },
            { id: 'obs_4', type: 'security', title: 'Prometheus Alertmanager Evaluator', icon: '🔔', x: 1020, y: 140, params: { expr: 'rate(http_requests_5xx[5m]) > 0.01', for: '2m' }, desc: 'Evaluates SLO burning rate and triggers automated incident response webhooks.' },
            { id: 'obs_5', type: 'output', title: 'Automated Incident Runbook Recovery', icon: '🎯', x: 1340, y: 140, params: { runbook: 'Pod Auto-Heal & Route Divert', p99Target: '< 200ms' }, desc: 'Correlates trace root causes and executes verified automated recovery procedures.' }
          ],
          connections: [
            { from: 'obs_1', to: 'obs_2' },
            { from: 'obs_2', to: 'obs_3' },
            { from: 'obs_3', to: 'obs_4' },
            { from: 'obs_4', to: 'obs_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#ef4444; margin-bottom:0.4rem;">🔬 SRE Incident Triage Lab</div>
            <p>1. Ingest distributed traces across microservices via OpenTelemetry.</p>
            <p>2. Pinpoint p99 latency regressions using flamegraph traces.</p>
            <p>3. Execute automated remediation runbook to restore SLO compliance.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              curl -s http://localhost:9090/api/v1/query?query=up
            </div>
          `
        };
      }

      // 10. DevSecOps & Software Supply Chain Security (SLSA, Cosign, SBOM, Semgrep, Trivy, SAST)
      if (slug.includes('devsecops') || slug.includes('slsa') || slug.includes('cosign') || slug.includes('sigstore') || slug.includes('sbom') || slug.includes('cyclonedx') || slug.includes('semgrep') || slug.includes('trivy') || slug.includes('sast') || slug.includes('tetragon') || slug.includes('grype') || slug.includes('syft') || title.includes('supply chain') || title.includes('devsecops') || title.includes('trivy') || title.includes('sast')) {
        return {
          id: slug || 'devsecops',
          name: toolData.title || STARTER_TEMPLATES.devsecops.name,
          category: 'security',
          nodes: STARTER_TEMPLATES.devsecops.nodes.map(n => Object.assign({}, n)),
          connections: STARTER_TEMPLATES.devsecops.connections.map(c => Object.assign({}, c)),
          copilotHtml: `
            <div style="font-weight:600; color:#f43f5e; margin-bottom:0.4rem;">🔬 DevSecOps Supply Chain Lab</div>
            <p>1. Enforce GPG / Sigstore keyless commit attestation.</p>
            <p>2. Block PR merges on Semgrep SAST / secret leak detection.</p>
            <p>3. Generate CycloneDX SBOM and verify container image signature via Cosign.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              cosign verify --certificate-identity-regexp '.*@github\.com' ghcr.io/pradeep/app:sha-latest
            </div>
          `
        };
      }

      // 11. Distributed Backend Ecosystem & Request Lifecycle
      if (slug.includes('backend') || slug.includes('lifecycle') || title.includes('backend ecosystem') || title.includes('request lifecycle')) {
        return {
          id: slug || 'backend-ecosystem',
          name: toolData.title || STARTER_TEMPLATES.backend.name,
          category: 'backend',
          nodes: STARTER_TEMPLATES.backend.nodes.map(n => Object.assign({}, n)),
          connections: STARTER_TEMPLATES.backend.connections.map(c => Object.assign({}, c)),
          copilotHtml: `
            <div style="font-weight:600; color:#818cf8; margin-bottom:0.4rem;">🏛️ Backend Ecosystem Lifecycle Tracer</div>
            <p>1. Trace requests from HTTP/2 ingress through JWT auth to PostgreSQL & Redis.</p>
            <p>2. Offload heavy payments and email dispatching to Celery / Asynq queue workers.</p>
            <p>3. Enforce PgBouncer transaction pooling and XFetch cache stampede prevention.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              docker-compose up -d && python main.py
            </div>
          `
        };
      }

      // 12. Unified Repository Learning & Codebase Workspace
      if (slug.includes('repo') || slug.includes('repository') || title.includes('repository learning') || title.includes('codebase')) {
        return {
          id: slug || 'repo-learning',
          name: toolData.title || STARTER_TEMPLATES.repolearn.name,
          category: 'automation',
          nodes: STARTER_TEMPLATES.repolearn.nodes.map(n => Object.assign({}, n)),
          connections: STARTER_TEMPLATES.repolearn.connections.map(c => Object.assign({}, c)),
          copilotHtml: `
            <div style="font-weight:600; color:#06b6d4; margin-bottom:0.4rem;">📂 Repository Learning Workspace</div>
            <p>1. Parse actual project files into an interactive architecture DAG.</p>
            <p>2. Follow 10-point repository courses and test in-browser code diffs.</p>
            <p>3. Diagnose runtime stack traces against codebase source files.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              bash scripts/validate.sh && python main.py
            </div>
          `
        };
      }

      // 10b. Cybersecurity & Zero-Trust
      if (slug.includes('security') || slug.includes('falco') || slug.includes('vault') || slug.includes('zerotrust') || slug.includes('waf') || title.includes('security') || cat.includes('security')) {
        return {
          id: slug || 'security',
          name: toolData.title || 'Zero-Trust Architecture & Threat Shield',
          category: 'security',
          nodes: [
            { id: 'sec_1', type: 'input', title: 'Zero-Trust Ingress Gateway', icon: '🛡️', x: 60, y: 140, params: { idp: 'OIDC / SAML 2.0', devicePosture: 'CrowdStrike Verified' }, desc: 'Enforces ephemeral mTLS authentication and hardware-backed device trust.' },
            { id: 'sec_2', type: 'transform', title: 'WAF & Bot Protection Engine', icon: '🚧', x: 380, y: 140, params: { rules: 'OWASP Top 10 + DDoS Shield', rateLimit: '100 req/s' }, desc: 'Inspects HTTP payload headers and blocks SQLi, XSS, and credential stuffing attacks.' },
            { id: 'sec_3', type: 'storage', title: 'Vault Dynamic STS Broker', icon: '🔐', x: 700, y: 140, params: { engine: 'Dynamic AWS/DB STS Tokens', ttl: '15m' }, desc: 'Issues just-in-time leased credentials expiring automatically after execution.' },
            { id: 'sec_4', type: 'model', title: 'Falco Runtime Kernel Monitor', icon: '👁️', x: 1020, y: 140, params: { syscalls: 'execve, openat, ptrace', engine: 'eBPF Probe' }, desc: 'Real-time container anomaly detection alerting on unexpected shell spawns.' },
            { id: 'sec_5', type: 'output', title: 'SIEM Audit & Automated Quarantine', icon: '🚨', x: 1340, y: 140, params: { siem: 'Splunk / OpenSearch', action: 'Pod Network Isolation' }, desc: 'Publishes immutable audit trails and isolates compromised pod network interfaces.' }
          ],
          connections: [
            { from: 'sec_1', to: 'sec_2' },
            { from: 'sec_2', to: 'sec_3' },
            { from: 'sec_3', to: 'sec_4' },
            { from: 'sec_4', to: 'sec_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#f43f5e; margin-bottom:0.4rem;">🔬 Zero-Trust Security Lab</div>
            <p>1. Enforce strict ephemeral mTLS certificates for all API clients.</p>
            <p>2. Verify dynamic Vault database leases expire within 15 minutes.</p>
            <p>3. Trigger runtime Falco eBPF alert upon abnormal shell execution.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              falco -r /etc/falco/falco_rules.yaml
            </div>
          `
        };
      }

      // 11. Cloud Data Warehouses & Analytics
      if (slug.includes('warehouse') || slug.includes('snowflake') || slug.includes('bigquery') || slug.includes('clickhouse') || slug.includes('duckdb') || title.includes('warehouse') || title.includes('snowflake') || title.includes('bigquery')) {
        return {
          id: slug || 'warehouse',
          name: toolData.title || 'Cloud Data Warehouse & Analytical Lakehouse',
          category: 'database',
          nodes: [
            { id: 'dw_1', type: 'input', title: 'Streaming CDC & Ingestion Bus', icon: '⚡', x: 60, y: 140, params: { ingestion: 'Kafka / Debezium CDC', latency: '< 50ms' }, desc: 'Captures transactional mutation logs and streams high-throughput event payloads.' },
            { id: 'dw_2', type: 'transform', title: 'Schema Contracts & Data Gate', icon: '🛡️', x: 380, y: 140, params: { validator: 'Great Expectations', nullChecks: 'Enforced' }, desc: 'Enforces data quality contracts and quarantines malformed or drifting schemas.' },
            { id: 'dw_3', type: 'storage', title: 'Columnar Warehouse Storage', icon: '❄️', x: 700, y: 140, params: { engine: 'Snowflake / ClickHouse', format: 'Parquet / Vectorized SIMD' }, desc: 'High-speed columnar storage partitioning data across micro-partitions with pruning.' },
            { id: 'dw_4', type: 'compute', title: 'dbt Semantic Transformation', icon: '🔄', x: 1020, y: 140, params: { tool: 'dbt-core / DuckDB', materialization: 'Incremental DAG' }, desc: 'Builds modular dimensional marts and updates lineage graphs with zero duplication.' },
            { id: 'dw_5', type: 'output', title: 'Real-Time Analytics & BI Delivery', icon: '📊', x: 1340, y: 140, params: { queryCache: 'Redis / Superset', p95Query: '< 250ms' }, desc: 'Serves low-latency executive dashboards, semantic metric queries, and ad-hoc SQL.' }
          ],
          connections: [
            { from: 'dw_1', to: 'dw_2' },
            { from: 'dw_2', to: 'dw_3' },
            { from: 'dw_3', to: 'dw_4' },
            { from: 'dw_4', to: 'dw_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#38bdf8; margin-bottom:0.4rem;">🔬 Cloud Data Warehouse & Analytics Lab</div>
            <p>1. Ingest streaming change-data-capture records with Kafka.</p>
            <p>2. Enforce schema contracts and verify partition pruning in query execution plan.</p>
            <p>3. Run incremental dbt models and observe sub-second analytical query performance.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              dbt run --select marts.finance+ && clickhouse-client --query "SELECT count(*) FROM telemetry"
            </div>
          `
        };
      }

      // 12. Realtime Voice AI & Audio Reasoning
      if (slug.includes('voice') || slug.includes('realtime') || slug.includes('audio-stream') || title.includes('voice api') || title.includes('realtime voice')) {
        return {
          id: slug || 'voice',
          name: toolData.title || 'Ultra-Low Latency Realtime Voice AI Pipeline',
          category: 'ai',
          nodes: [
            { id: 'voc_1', type: 'input', title: 'WebRTC Audio Stream Ingestion', icon: '🎙️', x: 60, y: 140, params: { transport: 'WebRTC / WebSocket', codec: 'Opus 48kHz, 20ms chunk' }, desc: 'Bi-directional full-duplex audio transport receiving live microphone streams.' },
            { id: 'voc_2', type: 'transform', title: 'Silero Voice Activity Detection (VAD)', icon: '⚡', x: 380, y: 140, params: { interruptionLatency: '< 40ms', threshold: '0.65' }, desc: 'Low-latency neural audio gating detecting speech starts, pauses, and barge-in interruptions.' },
            { id: 'voc_3', type: 'model', title: 'Streaming Speech-to-Text (STT)', icon: '📝', x: 700, y: 140, params: { model: 'Whisper-Streaming / Nova-2', wordErrorRate: '< 2.4%' }, desc: 'Converts raw audio wave chunks into speculative streaming transcript tokens.' },
            { id: 'voc_4', type: 'model', title: 'Realtime Autoregressive Reasoner', icon: '🧠', x: 1020, y: 140, params: { model: 'GPT-4o Realtime / Gemini Live', ttft: '< 180ms' }, desc: 'Generates streaming conversational responses with function-calling capabilities.' },
            { id: 'voc_5', type: 'output', title: 'Neural Text-to-Speech (TTS) Synthesizer', icon: '🔊', x: 1340, y: 140, params: { glassToGlass: '< 320ms', prosody: 'Adaptive Natural' }, desc: 'Synthesizes streaming PCM audio chunks back over the WebRTC peer connection.' }
          ],
          connections: [
            { from: 'voc_1', to: 'voc_2' },
            { from: 'voc_2', to: 'voc_3' },
            { from: 'voc_3', to: 'voc_4' },
            { from: 'voc_4', to: 'voc_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#38bdf8; margin-bottom:0.4rem;">🔬 Realtime Voice & Audio Lab</div>
            <p>1. Connect WebRTC media stream with Opus 48kHz encoding.</p>
            <p>2. Verify Silero VAD detects user speech interruptions within 40ms.</p>
            <p>3. Monitor glass-to-glass latency maintaining total response under 350ms.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              python -m voice_agent.webrtc_runner --model openai-realtime --latency-budget 300ms
            </div>
          `
        };
      }

      // 13. Frontier Reasoning & Autonomous Thinking
      if (slug.includes('reasoning') || slug.includes('luna') || slug.includes('sol') || slug.includes('thinking') || title.includes('reasoning') || title.includes('decisions')) {
        return {
          id: slug || 'reasoning',
          name: toolData.title || 'Frontier Reasoning & Decision Router Studio',
          category: 'ai',
          nodes: [
            { id: 'rsn_1', type: 'input', title: 'Complex Goal Specification', icon: '🎯', x: 60, y: 140, params: { schema: 'Multi-Constraint Goal', context: '128k Tokens' }, desc: 'Ingests complex engineering objectives with explicit safety boundaries.' },
            { id: 'rsn_2', type: 'model', title: 'Thinking & Chain-of-Thought Core', icon: '🧠', x: 380, y: 140, params: { reasoningBudget: '8192 tokens', strategy: 'MCTS / Reflection' }, desc: 'Explores multiple hypothesis branches with step-by-step mathematical reasoning.' },
            { id: 'rsn_3', type: 'security', title: 'Self-Correction & Invariant Verifier', icon: '🛡️', x: 700, y: 140, params: { formalChecks: 'SMT Solver / Proof Validator', passRate: '99.8%' }, desc: 'Verifies logical consistency, code correctness, and invariants before execution.' },
            { id: 'rsn_4', type: 'tool', title: 'Sandboxed Execution Harness', icon: '⚡', x: 1020, y: 140, params: { sandbox: 'Isolated MicroVM', timeout: '15s' }, desc: 'Runs unit tests, lint checks, and simulation trials in an isolated container.' },
            { id: 'rsn_5', type: 'output', title: 'Verifiable Decision Trace & Plan', icon: '🚀', x: 1340, y: 140, params: { format: 'Auditable DAG + Telemetry', signoff: 'Verified' }, desc: 'Emits cryptographically auditable execution plan with reasoning rationales.' }
          ],
          connections: [
            { from: 'rsn_1', to: 'rsn_2' },
            { from: 'rsn_2', to: 'rsn_3' },
            { from: 'rsn_3', to: 'rsn_4' },
            { from: 'rsn_4', to: 'rsn_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#a855f7; margin-bottom:0.4rem;">🔬 Frontier Reasoning & Thinking Lab</div>
            <p>1. Deconstruct multi-constraint problem into hypothesis tree.</p>
            <p>2. Budget reasoning tokens to verify invariant proofs.</p>
            <p>3. Execute candidate code in sandboxed microVM before emitting decision trace.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              python -m reasoning.evaluator --budget-tokens 4096 --verify-smt
            </div>
          `
        };
      }

      // 14. Sovereign & Localized Vernacular AI
      if (slug.includes('swasthya') || slug.includes('farming') || slug.includes('tamil') || slug.includes('vakil') || slug.includes('whatsapp') || slug.includes('aadhaar') || slug.includes('vernacular') || title.includes('vernacular') || title.includes('aadhaar') || title.includes('whatsapp') || title.includes('health') || title.includes('law')) {
        return {
          id: slug || 'vernacular',
          name: toolData.title || 'Sovereign & Localized AI Application Engine',
          category: 'ai',
          nodes: [
            { id: 'ind_1', type: 'input', title: 'Citizen & Mobile Request Gateway', icon: '📱', x: 60, y: 140, params: { channel: 'WhatsApp / Web / IVR Voice', audioInput: 'Opus / WAV' }, desc: 'Ingests voice notes, vernacular text, and photos from citizen end-users.' },
            { id: 'ind_2', type: 'transform', title: 'Indic Multilingual Engine (Bhashini)', icon: '🗣️', x: 380, y: 140, params: { languages: '22 Official Indic Languages', asrAccuracy: '94.2%' }, desc: 'Translates and normalizes regional dialects into canonical domain queries.' },
            { id: 'ind_3', type: 'storage', title: 'Statutory & Domain Knowledge Store', icon: '📚', x: 700, y: 140, params: { corpus: 'IPC / Agronomy / Ayushman Bharat', search: 'Hybrid BM25 + Vector' }, desc: 'Verified statutory knowledge base ensuring grounded, legally compliant answers.' },
            { id: 'ind_4', type: 'security', title: 'Aadhaar & Consent Verification Gate', icon: '🛡️', x: 1020, y: 140, params: { privacy: 'Digital Personal Data Protection Act', uidaiSandbox: 'OTP/eKYC' }, desc: 'Validates citizen consent, redacts PII, and asserts cryptographic identity proofs.' },
            { id: 'ind_5', type: 'output', title: 'Actionable Grievance & Citizen Ticket', icon: '🎯', x: 1340, y: 140, params: { outputType: 'Synthesized Voice + SMS + Webhook', auditId: 'SHA-256' }, desc: 'Emits localized voice guidance and automatically files authenticated civic tickets.' }
          ],
          connections: [
            { from: 'ind_1', to: 'ind_2' },
            { from: 'ind_2', to: 'ind_3' },
            { from: 'ind_3', to: 'ind_4' },
            { from: 'ind_4', to: 'ind_5' }
          ],
          copilotHtml: `
            <div style="font-weight:600; color:#10b981; margin-bottom:0.4rem;">🔬 Sovereign Vernacular AI Lab</div>
            <p>1. Ingest citizen voice note via WhatsApp Webhook.</p>
            <p>2. Translate regional dialect with Bhashini Indic model.</p>
            <p>3. Verify DPDP Act privacy compliance and generate signed civic resolution ticket.</p>
            <div style="margin-top:0.6rem; padding:0.4rem; background:rgba(0,0,0,0.3); border-radius:4px; font-family:monospace; font-size:0.75rem;">
              python main.py --channel whatsapp --language ta --dpdp-compliant
            </div>
          `
        };
      }

      // 15. Technology-Specific Synthesis (Dynamic Fallback for Any Studio)
      const rawTitle = toolData.title || (slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')) || 'Engineering Studio';
      const studioName = VisualFlowCanvas.escapeHtml(rawTitle);
      const rawDesc = toolData.desc ? toolData.desc.substring(0, 140) + '...' : `Technology workspace for ${rawTitle}.`;
      const cleanDesc = VisualFlowCanvas.escapeHtml(rawDesc);
      const safeCategory = VisualFlowCanvas.escapeHtml(toolData.category || 'engineering');
      const safeTag = VisualFlowCanvas.escapeHtml(toolData.tag || 'Runtime');
      const repoName = VisualFlowCanvas.escapeHtml(toolData.repository || `Pradeeptalari14/tp-${slug}`);

      return {
        id: slug || 'custom',
        name: studioName,
        category: safeCategory,
        nodes: [
          { id: 'gen_1', type: 'input', title: `${studioName} Ingestion`, icon: '📥', x: 60, y: 140, params: { source: 'Client Config / API', schema: 'Strict' }, desc: `Ingests inputs and configurations for ${studioName}.` },
          { id: 'gen_2', type: 'transform', title: `${safeCategory.toUpperCase()} Controller`, icon: '⚙️', x: 380, y: 140, params: { engine: 'WASM / Companion Container', state: 'Active' }, desc: `Initializes execution logic and validates dependency graph.` },
          { id: 'gen_3', type: 'model', title: `Core Engine: ${safeTag}`, icon: '🧠', x: 700, y: 140, params: { mode: 'Production Compliant', sandbox: 'Isolated MicroVM' }, desc: cleanDesc },
          { id: 'gen_4', type: 'security', title: 'Integrity & Security Guardrail', icon: '🛡️', x: 1020, y: 140, params: { check: 'Passed', cveScan: '0 Found', slsaLevel: 'Level 3' }, desc: 'Audits generated artifacts against security baseline policies and CVE registries.' },
          { id: 'gen_5', type: 'output', title: 'Verified Telemetry & Artifact Export', icon: '🎯', x: 1340, y: 140, params: { exportFormat: 'YAML / JSON / Code', status: 'Ready' }, desc: 'Emits auditable configurations and real-time execution golden signal metrics.' }
        ],
        connections: [
          { from: 'gen_1', to: 'gen_2' },
          { from: 'gen_2', to: 'gen_3' },
          { from: 'gen_3', to: 'gen_4' },
          { from: 'gen_4', to: 'gen_5' }
        ],
        copilotHtml: `
          <div style="font-weight:600; color:#38bdf8; margin-bottom:0.4rem;">🔬 Guided ${studioName} Lab</div>
          <div class="vf-guide-curriculum">
            <div class="vf-curriculum-step">
              <div class="vf-step-num">1</div>
              <div class="vf-step-content">
                <div class="vf-step-title">📋 Phase 1: Prerequisites</div>
                <div class="vf-step-desc">Configure inputs and verify environment contracts.</div>
              </div>
            </div>
            <div class="vf-curriculum-step">
              <div class="vf-step-num">2</div>
              <div class="vf-step-content">
                <div class="vf-step-title">📚 Phase 2: Architecture Invariants</div>
                <div class="vf-step-desc">${cleanDesc}</div>
              </div>
            </div>
            <div class="vf-curriculum-step">
              <div class="vf-step-num">3</div>
              <div class="vf-step-content">
                <div class="vf-step-title">🧪 Phase 3: Interactive Drill</div>
                <div class="vf-step-desc">Inspect intermediate transform parameters and verify latency budgets.</div>
              </div>
            </div>
            <div class="vf-curriculum-step">
              <div class="vf-step-num">4</div>
              <div class="vf-step-content">
                <div class="vf-step-title">🎯 Phase 4: SRE Troubleshooting</div>
                <div class="vf-step-desc">Simulate component failure and observe automated circuit breaking.</div>
              </div>
            </div>
            <div class="vf-curriculum-step">
              <div class="vf-step-num">5</div>
              <div class="vf-step-content">
                <div class="vf-step-title">🚀 Phase 5: Production Project Export</div>
                <div class="vf-step-desc">Export verified reproducible project files for Docker or production deployment.</div>
              </div>
            </div>
          </div>
          <div class="vf-guide-cli-box">
            <div class="vf-cli-title">💻 Production Execution Command:</div>
            <code>git clone https://github.com/${repoName}.git && cd $(basename "${repoName}") && bash start.sh</code>
          </div>
        `
      };
    }

    generateStudioTopology(studioId, toolData = {}) {
      return VisualFlowCanvas.generateStudioTopology(studioId, toolData);
    }

    loadStudio(studioId) {
      if (!studioId) return;
      const safeStudioId = String(studioId).replace(/[^a-zA-Z0-9_\-\/]/g, '').trim();
      if (!safeStudioId) return;
      this.currentStudioId = safeStudioId;

      const slug = safeStudioId.toLowerCase().replace(/^\/?tools\//, '').replace(/\/$/, '');
      if (!this._studioLookup) {
        this._studioLookup = new Map();
        (this.studiosList || []).forEach(s => {
          const itemSlug = (s.link || '').toLowerCase().replace(/^\/?tools\//, '').replace(/\/$/, '');
          if (itemSlug) this._studioLookup.set(itemSlug, s);
          if (s.title) this._studioLookup.set(s.title.toLowerCase(), s);
        });
      }

      const tool = this._studioLookup.get(slug) || (this.studiosList || []).find(s => {
        const itemSlug = (s.link || '').toLowerCase().replace(/^\/?tools\//, '').replace(/\/$/, '');
        return itemSlug === slug || (s.title && s.title.toLowerCase().includes(slug));
      }) || { title: safeStudioId, category: 'ai' };

      const topo = this.generateStudioTopology(safeStudioId, tool);

      this.nodes.clear();
      this.connections = [];

      topo.nodes.forEach(n => this.nodes.set(n.id, Object.assign({}, n)));
      this.connections = topo.connections.map(c => Object.assign({}, c));

      if (this.studioSelect) {
        this.studioSelect.value = slug;
      }
      if (this.brandBadge) {
        this.brandBadge.textContent = (topo.category || 'STUDIO').toUpperCase() + ' FLOW';
      }
      this.studioCopilotHtml = topo.copilotHtml || '';
      if (this.copilotGuide) {
        const meta = FLOW_DIRECTIONS_METADATA[this.activeFlowDirection] || FLOW_DIRECTIONS_METADATA.happy;
        this._renderDirectionGuide(meta);
      }

      this.scale = 0.95;
      this.panOffset = { x: 30, y: 30 };
      this._applyTransform();
      this.autoLayout();
      this.render();
      this.fitView();

      const nodesArr = Array.from(this.nodes.values());
      const primaryNode = nodesArr.find(n => n.type === 'model' || n.type === 'transform') || nodesArr[0];
      if (primaryNode) {
        this.selectNode(primaryNode.id);
      }

      this.log(`[STUDIO WORKSPACE] Switched to ${topo.name} (${this.nodes.size} nodes, ${this.connections.length} wires)`);

      try {
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
          const url = new URL(window.location.href);
          url.searchParams.set('studio', slug);
          window.history.replaceState(null, '', url.toString());
        }
      } catch (e) {
        // tolerate in node or restricted environments
      }
    }

    loadTemplate(templateKey) {
      const t = STARTER_TEMPLATES[templateKey];
      if (!t) return;
      this.nodes.clear();
      this.connections = [];

      t.nodes.forEach(n => this.nodes.set(n.id, Object.assign({}, n)));
      this.connections = t.connections.map(c => Object.assign({}, c));

      if (this.brandBadge) {
        this.brandBadge.textContent = (t.category || 'STARTER').toUpperCase() + ' FLOW';
      }

      this.scale = 0.95;
      this.panOffset = { x: 30, y: 30 };
      this._applyTransform();
      this.render();
      this.fitView();

      const tNodesArr = Array.from(this.nodes.values());
      const tPrimary = tNodesArr.find(n => n.type === 'model' || n.type === 'transform') || tNodesArr[0];
      if (tPrimary) {
        this.selectNode(tPrimary.id);
      }

      this.log(`Loaded starter template: ${t.name} (${this.nodes.size} nodes, ${this.connections.length} wires)`);
    }

    addNode(nodeSpec) {
      this.nodes.set(nodeSpec.id, nodeSpec);
      this.render();
      this.selectNode(nodeSpec.id);
      this.log(`Added component: ${nodeSpec.title}`);
    }

    deleteNode(nodeId) {
      this.nodes.delete(nodeId);
      this.connections = this.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
      if (this.selectedNodeId === nodeId) {
        this.selectedNodeId = null;
        this._renderInspector(null);
      }
      this.render();
      this.log(`Deleted component ${nodeId}`);
    }

    selectNode(nodeId) {
      this.selectedNodeId = nodeId;
      this.nodesLayer.querySelectorAll('.vf-node').forEach(el => {
        if (el.getAttribute('data-id') === nodeId) el.classList.add('selected');
        else el.classList.remove('selected');
      });
      const node = this.nodes.get(nodeId);
      this._renderInspector(node);
    }

    _updateNodePosition(node) {
      const el = this.nodesLayer.querySelector(`[data-id="${node.id}"]`);
      if (el) {
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
      }
    }

    render() {
      // 1. Render Nodes
      const nodesList = Array.from(this.nodes.values());
      this.nodesLayer.innerHTML = nodesList.map((n, idx) => {
        const isSel = this.selectedNodeId === n.id;
        const nodeType = VisualFlowCanvas.escapeHtml(n.type || 'model');
        const nodeId = VisualFlowCanvas.escapeHtml(n.id || '');
        const nodeTitle = VisualFlowCanvas.escapeHtml(n.title || '');
        const nodeDesc = VisualFlowCanvas.escapeHtml(n.desc || '');
        const nodeIcon = VisualFlowCanvas.escapeHtml(n.icon || '📦');

        const paramsHtml = Object.entries(n.params || {}).map(([k, v]) => {
          const escK = VisualFlowCanvas.escapeHtml(k);
          const escV = VisualFlowCanvas.escapeHtml(v);
          return `
            <div class="vf-node-param">
              <span class="vf-param-key">${escK}</span>
              <span class="vf-param-val" title="${escV}">${escV}</span>
            </div>
          `;
        }).join('');

        const nodeState = VisualFlowCanvas.escapeHtml(n.state || 'pending');

        let modePillHtml = '';
        if (this.activeFlowDirection === 'learning') {
          const learningPhases = ['Phase 1: Prerequisites 📋', 'Phase 2: Theory Lesson 📚', 'Phase 3: Interactive Lab 🧪', 'Phase 4: Troubleshoot Challenge 🎯', 'Phase 5: Portfolio Project 🚀'];
          const pillText = learningPhases[idx % learningPhases.length];
          modePillHtml = `<span class="vf-node-mode-pill learning">${pillText}</span>`;
        } else if (this.activeFlowDirection && this.activeFlowDirection !== 'happy') {
          const dirMeta = FLOW_DIRECTIONS_METADATA[this.activeFlowDirection];
          if (dirMeta) {
            modePillHtml = `<span class="vf-node-mode-pill ${dirMeta.id}">${dirMeta.icon} ${dirMeta.badge}</span>`;
          }
        }

        return `
          <div class="vf-node vf-type-${nodeType} state-${nodeState} ${isSel ? 'selected' : ''}" data-id="${nodeId}" style="left: ${Number(n.x) || 0}px; top: ${Number(n.y) || 0}px;">
            <div class="vf-node-accent vf-accent-${nodeType}"></div>
            <div class="vf-port vf-port-input" data-port="in" title="Connect Input"></div>
            <div class="vf-port vf-port-output" data-port="out" title="Connect Output"></div>
            
            <div class="vf-node-header">
              <div class="vf-node-title-group">
                <span class="vf-node-icon">${nodeIcon}</span>
                <span class="vf-node-title" title="${nodeTitle}">${nodeTitle}</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.35rem; flex-shrink:0;">
                <span class="vf-node-status-pill vf-status-${nodeState}">${nodeState}</span>
                <span class="vf-node-badge vf-badge-${nodeType}">${nodeType}</span>
                <button class="vf-node-delete" data-del="${nodeId}" title="Remove Node">✕</button>
              </div>
            </div>

            <div class="vf-node-body">
              ${modePillHtml ? `<div style="margin-bottom:0.4rem;">${modePillHtml}</div>` : ''}
              <div class="vf-node-desc">${nodeDesc}</div>
              <div class="vf-node-params">${paramsHtml}</div>
            </div>
          </div>
        `;
      }).join('');

      this._bindNodeDOM();
      this._renderConnections();
    }

    _bindNodeDOM() {
      this.nodesLayer.querySelectorAll('.vf-node').forEach(el => {
        const id = el.getAttribute('data-id');

        // Select on click
        el.addEventListener('click', (e) => {
          if (e.target.closest('.vf-node-delete') || e.target.closest('.vf-port')) return;
          this.selectNode(id);
        });

        // Delete button
        const delBtn = el.querySelector('.vf-node-delete');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteNode(id);
          });
        }

        // Drag node
        el.addEventListener('mousedown', (e) => {
          if (e.target.closest('.vf-node-delete') || e.target.closest('.vf-port')) return;
          this.isDraggingNode = true;
          this.draggedNodeId = id;
          const rect = el.getBoundingClientRect();
          this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };
          this.selectNode(id);
        });

        // Port wiring interaction
        const outPort = el.querySelector('.vf-port-output');
        if (outPort) {
          outPort.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.activeConnectingFrom = id;
            this.log(`Drag wire from ${id} output... click target node input.`);
          });
        }

        const inPort = el.querySelector('.vf-port-input');
        if (inPort) {
          inPort.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            if (this.activeConnectingFrom && this.activeConnectingFrom !== id) {
              this.connections.push({ from: this.activeConnectingFrom, to: id });
              this._renderConnections();
              this.log(`Connected wire: ${this.activeConnectingFrom} ➔ ${id}`);
              this.activeConnectingFrom = null;
            }
          });
        }
      });
    }

    _renderConnections() {
      const defs = `
        <defs>
          <marker id="vf-arrow-idle" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
          </marker>
          <marker id="vf-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
          </marker>
          <marker id="vf-arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
          </marker>
          <marker id="vf-arrow-failed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
          </marker>
        </defs>
      `;

      let paths = defs;
      this.connections.forEach((c, idx) => {
        const fromNode = this.nodes.get(c.from);
        const toNode = this.nodes.get(c.to);
        if (!fromNode || !toNode) return;

        // Port geometric locations (node width: 280, vertical midpoint ~70px)
        const nodeWidth = 280;
        const x1 = fromNode.x + nodeWidth;
        const y1 = fromNode.y + 70;
        const x2 = toNode.x;
        const y2 = toNode.y + 70;

        const dx = Math.abs(x2 - x1) * 0.55;
        const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        paths += `<path class="vf-wire" data-idx="${idx}" data-from="${VisualFlowCanvas.escapeHtml(c.from)}" data-to="${VisualFlowCanvas.escapeHtml(c.to)}" d="${d}" />`;
      });

      this.svgLayer.innerHTML = paths;
    }

    _updateWiresForNode(nodeId) {
      if (!this.svgLayer) return;
      let hasMissing = false;
      this.connections.forEach((c, idx) => {
        if (c.from === nodeId || c.to === nodeId) {
          const fromNode = this.nodes.get(c.from);
          const toNode = this.nodes.get(c.to);
          if (!fromNode || !toNode) return;

          const nodeWidth = 280;
          const x1 = fromNode.x + nodeWidth;
          const y1 = fromNode.y + 70;
          const x2 = toNode.x;
          const y2 = toNode.y + 70;

          const dx = Math.abs(x2 - x1) * 0.55;
          const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
          const pathEl = this.svgLayer.querySelector(`path[data-idx="${idx}"]`);
          if (pathEl) {
            pathEl.setAttribute('d', d);
          } else {
            hasMissing = true;
          }
        }
      });
      if (hasMissing) {
        this._renderConnections();
      }
    }

    autoLayout() {
      const nodeList = Array.from(this.nodes.values());
      const spacingX = 320;
      const spacingY = 140;

      nodeList.forEach((n, idx) => {
        n.x = 60 + (idx * spacingX);
        n.y = 120 + ((idx % 2 === 0 ? 0 : 60));
        this._updateNodePosition(n);
      });

      this._renderConnections();
      this.fitView();
      this.log('Applied automated DAG layout arrangement.');
    }

    _renderInspector(node) {
      if (!node) {
        const nodeList = Array.from(this.nodes.values());
        const stagePills = nodeList.map(n => {
          const escId = VisualFlowCanvas.escapeHtml(n.id || '');
          const escIcon = VisualFlowCanvas.escapeHtml(n.icon || '📦');
          const escTitle = VisualFlowCanvas.escapeHtml(n.title || '');
          const escType = VisualFlowCanvas.escapeHtml(n.type || 'model');
          return `
            <button class="vf-stage-quick-btn" data-id="${escId}">
              <span>${escIcon}</span>
              <span class="vf-stage-quick-title">${escTitle}</span>
              <span class="vf-badge-${escType} vf-stage-quick-badge">${escType}</span>
            </button>
          `;
        }).join('');

        this.inspectorContent.innerHTML = `
          <div class="vf-inspector-overview">
            <div class="vf-overview-header">
              <div class="vf-overview-badge">WORKSPACE INSPECTOR</div>
              <div class="vf-overview-title">Pipeline Architecture</div>
              <div class="vf-overview-sub">
                ${nodeList.length} stages configured • ${this.connections.length} active wires
              </div>
            </div>

            <div class="vf-overview-stages-label">Select a component to inspect & configure:</div>
            <div class="vf-stage-quick-list">
              ${stagePills}
            </div>

            <div class="vf-ai-box" style="margin-top: 1rem;">
              <div class="vf-ai-box-title">
                <span>💡</span>
                <span>Canvas Navigation Tip</span>
              </div>
              <div class="vf-ai-box-body">
                Click any node on the canvas to inspect latency, modify live parameters, or drag output ports to re-wire dataflow.
              </div>
            </div>
          </div>
        `;

        this.inspectorContent.querySelectorAll('.vf-stage-quick-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            this.selectNode(id);
          });
        });
        return;
      }

      const escId = VisualFlowCanvas.escapeHtml(node.id || '');
      const escType = VisualFlowCanvas.escapeHtml(node.type || 'model');
      const escTitle = VisualFlowCanvas.escapeHtml(node.title || '');
      const escDesc = VisualFlowCanvas.escapeHtml(node.desc || '');
      const escIcon = VisualFlowCanvas.escapeHtml(node.icon || '📦');
      const ctx = this._getNodeLearningContext(node);
      const nodeState = VisualFlowCanvas.escapeHtml(node.state || 'pending');

      const paramsForm = Object.entries(node.params || {}).map(([k, v]) => {
        const escK = VisualFlowCanvas.escapeHtml(k);
        const escV = VisualFlowCanvas.escapeHtml(v);
        return `
          <div class="vf-form-group">
            <label class="vf-form-label">${escK}</label>
            <input type="text" class="vf-form-control vf-param-input" data-key="${escK}" value="${escV}" />
          </div>
        `;
      }).join('');

      this.inspectorContent.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.4rem;">${escIcon}</span>
            <div>
              <div style="font-weight:700; color:#fff; font-size:0.95rem;">${escTitle}</div>
              <div style="font-size:0.72rem; color:var(--vf-accent-cyan); font-family:var(--vf-font-mono);">ID: ${escId} (${escType})</div>
            </div>
          </div>
          <span class="vf-node-status-pill vf-status-${nodeState}">${nodeState}</span>
        </div>

        <!-- Dual Explanation Tabs (Beginner vs Technical) -->
        <div class="vf-dual-exp-tabs">
          <button class="vf-dual-exp-tab active" id="tabExpBeginner">👶 Beginner Plain-English</button>
          <button class="vf-dual-exp-tab" id="tabExpTechnical">⚙️ Advanced Technical</button>
        </div>
        <div class="vf-dual-exp-body" id="expBody">
          ${ctx.beginner}
        </div>

        <!-- Inputs, Outputs & Dependencies -->
        <div style="margin: 0.75rem 0; font-size: 0.72rem; line-height: 1.45;">
          <div style="color: #94a3b8; margin-bottom: 0.25rem;"><strong>📥 Inputs:</strong> ${ctx.inputs}</div>
          <div style="color: #94a3b8;"><strong>📤 Outputs:</strong> ${ctx.outputs}</div>
        </div>

        <!-- Editable Component Label & Desc -->
        <div class="vf-form-group">
          <label class="vf-form-label">Component Label</label>
          <input type="text" class="vf-form-control" id="vfInspectTitle" value="${escTitle}" />
        </div>

        <div class="vf-form-group">
          <label class="vf-form-label">Description & Role</label>
          <textarea class="vf-form-control" id="vfInspectDesc" rows="2">${escDesc}</textarea>
        </div>

        <!-- Active Parameters -->
        <div style="border-top: 1px solid var(--vf-border); margin: 0.75rem 0; padding-top: 0.6rem;">
          <div class="vf-panel-title" style="margin-bottom:0.5rem;">Active Parameters</div>
          ${paramsForm}
        </div>

        <!-- 3 Progressive Hint Levels -->
        <div class="vf-hints-container">
          <div class="vf-hint-card level-1">
            <div class="vf-hint-header">
              <span>💡 Level 1: Conceptual Hint</span>
              <button class="vf-hint-reveal-btn" data-hint="1">Reveal</button>
            </div>
            <div class="vf-hint-content" id="hint-body-1" style="display:none;">${ctx.hint1}</div>
          </div>

          <div class="vf-hint-card level-2">
            <div class="vf-hint-header">
              <span>🔍 Level 2: Diagnostic Hint</span>
              <button class="vf-hint-reveal-btn" data-hint="2">Reveal</button>
            </div>
            <div class="vf-hint-content" id="hint-body-2" style="display:none;">${ctx.hint2}</div>
          </div>

          <div class="vf-hint-card level-3">
            <div class="vf-hint-header">
              <span>🛠️ Level 3: Suggested Solution</span>
              <button class="vf-hint-reveal-btn" data-hint="3">Reveal</button>
            </div>
            <div class="vf-hint-content" id="hint-body-3" style="display:none;">${ctx.hint3}</div>
          </div>
        </div>

        <!-- Common Mistakes & Verification Box -->
        <div class="vf-check-box mistakes">
          <strong>⚠️ Common Anti-Patterns:</strong><br/>
          ${ctx.mistakes}
        </div>
        <div class="vf-check-box verification">
          <strong>✅ Verification Test Steps:</strong><br/>
          ${ctx.verification}
        </div>

        <!-- Direct Connected Action Hub -->
        <div class="vf-action-hub-links">
          <a href="/tools/${ctx.studioSlug}/learn.html" class="vf-action-hub-btn" target="_blank"><span>📚</span><span>Learn Docs</span></a>
          <a href="/tools/${ctx.studioSlug}/index.html" class="vf-action-hub-btn" target="_blank"><span>🧪</span><span>Studio Lab</span></a>
          <a href="/studios/flow/?studio=${ctx.studioSlug}" class="vf-action-hub-btn"><span>⚡</span><span>Flow DAG</span></a>
          <a href="/studios/learn/devops_cicd_prompt_library.json" class="vf-action-hub-btn" target="_blank"><span>📝</span><span>Prompts</span></a>
        </div>
      `;

      // Dual Explanation tab listeners
      const btnBeg = this.inspectorContent.querySelector('#tabExpBeginner');
      const btnTech = this.inspectorContent.querySelector('#tabExpTechnical');
      const expBody = this.inspectorContent.querySelector('#expBody');
      if (btnBeg && btnTech && expBody) {
        btnBeg.addEventListener('click', () => {
          btnBeg.classList.add('active');
          btnTech.classList.remove('active');
          expBody.textContent = ctx.beginner;
        });
        btnTech.addEventListener('click', () => {
          btnTech.classList.add('active');
          btnBeg.classList.remove('active');
          expBody.textContent = ctx.technical;
        });
      }

      // Progressive hints reveal toggle
      this.inspectorContent.querySelectorAll('.vf-hint-reveal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const num = btn.getAttribute('data-hint');
          const body = this.inspectorContent.querySelector(`#hint-body-${num}`);
          if (body) {
            const isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'block' : 'none';
            btn.textContent = isHidden ? 'Hide' : 'Reveal';
          }
        });
      });

      // Two-way parameter and title binding
      const titleInput = this.inspectorContent.querySelector('#vfInspectTitle');
      if (titleInput) {
        titleInput.addEventListener('input', (e) => {
          node.title = e.target.value;
          this.render();
        });
      }

      const descInput = this.inspectorContent.querySelector('#vfInspectDesc');
      if (descInput) {
        descInput.addEventListener('input', (e) => {
          node.desc = e.target.value;
          this.render();
        });
      }

      this.inspectorContent.querySelectorAll('.vf-param-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const k = inp.getAttribute('data-key');
          node.params[k] = e.target.value;
          this.render();
        });
      });
    }

    _getNodeLearningContext(node) {
      const type = (node.type || 'model').toLowerCase();
      const title = (node.title || '').toLowerCase();
      const studioSlug = (this.currentStudioId || 'ai').toLowerCase().replace(/^\/?tools\//, '').replace(/\/$/, '');

      let beginner = `This component acts as an essential stage in your pipeline. It ingests upstream events or data, applies domain logic, and routes validated artifacts to the next component.`;
      let technical = `Executes deterministic state transitions with schema validation, latency budgets (<100ms), and error boundaries. Leverages zero-trust isolation and emits OpenTelemetry distributed traces.`;
      let inputs = `Structured JSON payloads, raw file streams, or trigger events from upstream dependencies.`;
      let outputs = `Validated artifacts, normalized token vectors, or signed deployment manifests.`;
      let mistakes = `Bypassing schema validation; hardcoding production secrets; omitting timeout and retry bounds.`;
      let verification = `Execute unit integration test, verify exit code 0, and confirm zero CVE/vulnerability findings.`;
      let hint1 = `Examine what input format this stage expects and ensure the upstream node satisfies that contract.`;
      let hint2 = `Check environment variables, token limits, and network egress rules in the active parameters.`;
      let hint3 = `Apply the verified parameter baseline from the reference architecture: ensure timeout is set to 30s and retry limit is 3.`;

      if (type === 'input' || title.includes('ingestion') || title.includes('webhook') || title.includes('git')) {
        beginner = `The front door of your system. It listens for incoming user requests, Git commits, or raw files, ensuring only valid data enters the pipeline.`;
        technical = `Performs mTLS termination, cryptographic webhook signature verification (HMAC-SHA256), and schema parsing before downstream ingestion.`;
        inputs = `Signed Git push events, REST API payloads, or multipart S3 document uploads.`;
        outputs = `Validated JSON event objects, source checkout references, or raw text streams.`;
        mistakes = `Accepting unauthenticated webhooks; trusting client-supplied file extensions without MIME validation.`;
        verification = `Send a mock webhook with an invalid HMAC signature and verify HTTP 401 Unauthorized rejection.`;
        hint1 = `Ensure your trigger events are authenticated with least-privilege tokens.`;
        hint2 = `Verify webhook URL secret headers match the receiver configuration.`;
        hint3 = `Enable branch protection on 'main' and require signed GPG/SSH commits before triggering pipeline.`;
      } else if (type === 'model' || title.includes('llm') || title.includes('embedding') || title.includes('inference')) {
        beginner = `The intelligence brain. It transforms human text into mathematical vectors (embeddings) or reasons over data to synthesize natural language answers.`;
        technical = `Executes high-throughput tensor operations via vLLM PagedAttention, KV-cache prefixing, or INT4/FP8 quantized matrix multiplications.`;
        inputs = `Tokenized prompt contexts, similarity-ranked retrieved chunks, or multi-modal image patches.`;
        outputs = `Normalized embedding tensors (float32/float16) or streaming completion tokens with logprobs.`;
        mistakes = `Exceeding context window limits; ignoring TTFT/TPOT latency degradation; omitting temperature grounding.`;
        verification = `Benchmark p99 latency under concurrency, verify token usage, and inspect Hallucination score.`;
        hint1 = `Check if the model context window accommodates both system prompt and retrieved contexts.`;
        hint2 = `Inspect KV cache fragmentation and monitor GPU VRAM utilization.`;
        hint3 = `Set temperature to 0.1 for deterministic factuality and enable speculative decoding for 2.4x speedup.`;
      } else if (type === 'security' || title.includes('sast') || title.includes('shield') || title.includes('guardrail') || title.includes('gate')) {
        beginner = `The security guard. It inspects code, containers, and data for vulnerabilities, leaked secrets, or malicious prompt injection attacks before letting anything pass.`;
        technical = `AST static analysis (Semgrep), CVE layer auditing (Trivy), Rekor transparency logging, and runtime eBPF syscall filtering (Tetragon).`;
        inputs = `Compiled container layers, source code ASTs, or incoming user prompts with potential jailbreaks.`;
        outputs = `Signed SLSA Level 3 attestations, CycloneDX SBOM manifests, or blocked execution signals.`;
        mistakes = `Silently ignoring CRITICAL CVEs; checking secrets into version control; running containers as root UID 0.`;
        verification = `Scan artifact with 'trivy image --severity CRITICAL --exit-code 1' and confirm zero failures.`;
        hint1 = `Remember least privilege: no service should have more access than its exact job requires.`;
        hint2 = `Look for hardcoded tokens, open 0.0.0.0/0 CIDR ranges, and missing Kubernetes securityContext.`;
        hint3 = `Set runAsNonRoot: true, enforce read-only root filesystems, and verify keyless Cosign signatures.`;
      } else if (type === 'storage' || title.includes('pgvector') || title.includes('database') || title.includes('cache')) {
        beginner = `The long-term memory. It securely stores knowledge, database records, and vector representations so they can be retrieved in milliseconds.`;
        technical = `PostgreSQL pgvector with HNSW/IVFFlat indexing, ACID transaction isolation, and Redis distributed caching.`;
        inputs = `Vector embeddings (1536-dim), relational tables, or transient key-value cache sessions.`;
        outputs = `Cosine similarity nearest neighbors (<10ms), ACID committed records, or sub-millisecond cache hits.`;
        mistakes = `Using sequential scans instead of HNSW indexes; missing connection pool limits; storing unencrypted data at rest.`;
        verification = `Run EXPLAIN ANALYZE on vector query and verify index scan with execution cost < 15.0.`;
        hint1 = `Indexing is the difference between sub-10ms queries and 5-second timeouts.`;
        hint2 = `Verify distance metric: Cosine (<=>) vs Inner Product (<#>) vs L2 Euclidean (<->).`;
        hint3 = `Create HNSW index: CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops) WITH (m=16, ef_construction=64);`;
      } else if (type === 'tool' || title.includes('worker') || title.includes('tool') || title.includes('sandbox')) {
        beginner = `The hands and tools of the agent. It safely executes specific commands (like querying a database or inspecting Kubernetes pods) in a protected sandbox.`;
        technical = `Sandboxed microVM / gVisor process execution with strict POSIX syscall interception, CPU/memory quotas, and network egress controls.`;
        inputs = `Structured JSON tool arguments, SQL query templates, or authenticated API payloads.`;
        outputs = `Command exit codes, standard output/error streams, or structured database result sets.`;
        mistakes = `Running tools with root/admin privileges; executing unsanitized user inputs; omitting execution timeouts.`;
        verification = `Verify microVM sandbox isolation with 'dmesg | grep gVisor' and test that network egress blocks unauthorized endpoints.`;
        hint1 = `Always sandbox external tool execution to prevent privilege escalation.`;
        hint2 = `Enforce timeouts (max 5s) on external tool invocations to avoid deadlocks.`;
        hint3 = `Use gVisor runsc runtime handler with dropped capabilities: CAP_NET_RAW and CAP_SYS_ADMIN.`;
      } else if (type === 'compute' || title.includes('gpu') || title.includes('node') || title.includes('fleet')) {
        beginner = `The engine room. It supplies the raw processing power (CPU/GPU nodes) that runs your AI models and microservices.`;
        technical = `Hardware-accelerated compute instances (e.g. H100 GPUs or ARM64 instances) managed via Karpenter with NUMA node optimization and tensor parallelism.`;
        inputs = `Pod scheduling requests, container resource requests (cpu/memory/gpu), and priority classes.`;
        outputs = `Initialized bare-metal or virtualized node capacity ready for container binding in <40s.`;
        mistakes = `Over-provisioning On-Demand instances instead of Spot; ignoring NUMA node placement; missing GPU memory limits.`;
        verification = `Inspect node resource allocation: 'kubectl describe node' and verify VRAM utilization > 85%.`;
        hint1 = `Use price-capacity-optimized spot strategies to reduce compute costs by up to 70%.`;
        hint2 = `Verify GPU interconnect bandwidth using nvidia-smi nvlink -s.`;
        hint3 = `Set up Karpenter consolidation with WhenUnderutilized policy to automatically bin-pack compute pools.`;
      } else if (type === 'network' || title.includes('mesh') || title.includes('ingress') || title.includes('cni')) {
        beginner = `The highway system. It connects different services together securely, routing requests and enforcing network boundaries.`;
        technical = `Kernel-level eBPF CNI (Cilium) with WireGuard encryption, multi-ENI IPAM prefix delegation, and L3-L7 policy enforcement.`;
        inputs = `Raw Ethernet frames, TCP/IP packets, and HTTP/2 or gRPC request streams.`;
        outputs = `Encrypted network traffic, routed service endpoints, and packet-level telemetry traces.`;
        mistakes = `Allowing unsegmented flat networks; relying on slow iptables rather than eBPF; omitting MTU optimization for overlay networks.`;
        verification = `Run 'cilium connectivity test' and confirm 100% passed with zero dropped packets.`;
        hint1 = `Kernel eBPF routing bypasses IP tables, improving packet throughput by 3x.`;
        hint2 = `Ensure MTU is configured to 9000 (Jumbo frames) for high-bandwidth pod-to-pod communication.`;
        hint3 = `Enforce default-deny CiliumNetworkPolicy requiring explicit labels for inter-namespace traffic.`;
      } else if (type === 'deploy' || type === 'output' || title.includes('deploy') || title.includes('export') || title.includes('canary')) {
        beginner = `The delivery truck. It safely promotes verified applications into production, using canary traffic shifts to ensure users experience zero downtime.`;
        technical = `GitOps controller (ArgoCD) applying declarative K8s manifests with automated SLO metric rollbacks and traffic weight shifting.`;
        inputs = `Immutable container digests, signed Helm values, and Prometheus canary error signals.`;
        outputs = `Live production endpoints serving traffic, telemetry audit logs, and release certificates.`;
        mistakes = `Using mutable ':latest' image tags; promoting without staging smoke tests; missing automatic rollback triggers.`;
        verification = `Verify rollout status: 'kubectl rollout status deployment/<app>' and check error rate < 0.01%.`;
        hint1 = `Always deploy immutable digests (sha256:...) rather than moving tags.`;
        hint2 = `Configure a 10% canary traffic shift and observe golden signals for 5 minutes before 100% promotion.`;
        hint3 = `Set up Argo Rollouts with AnalysisTemplate triggering automated rollback if HTTP 5xx exceeds 0.5%.`;
      }

      return { studioSlug, beginner, technical, inputs, outputs, mistakes, verification, hint1, hint2, hint3 };
    }

    setFlowDirection(dirKey) {
      if (!FLOW_DIRECTIONS_METADATA[dirKey]) {
        dirKey = 'happy';
      }
      this.activeFlowDirection = dirKey;
      if (this.flowDirectionSelect && this.flowDirectionSelect.value !== dirKey) {
        this.flowDirectionSelect.value = dirKey;
      }

      const meta = FLOW_DIRECTIONS_METADATA[dirKey];

      // 1. Render HUD Banner on canvas
      this._renderDirectionBanner(meta);

      // 2. Render Contextual Copilot Guide Pane
      this._renderDirectionGuide(meta);

      // 3. Reset Simulation state cleanly
      this.resetSimulation();

      // 4. Re-render nodes with direction-specific annotations
      this.render();

      this.log(`----------------------------------------------------------------`);
      this.log(`[FLOW DIRECTION ACTIVATED] ${meta.name} — Mode: [${meta.badge}]`);
      this.log(`[FLOW STRATEGY] ${meta.summary}`);
    }

    _renderDirectionBanner(meta) {
      if (!this.directionBanner) {
        this.directionBanner = this.container.querySelector('#vfDirectionBanner');
      }
      if (!this.directionBanner) return;

      this.directionBanner.style.display = 'flex';
      this.directionBanner.style.borderColor = meta.accentColor;
      this.directionBanner.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px ${meta.accentColor}33`;

      this.directionBanner.innerHTML = `
        <div class="vf-dir-banner-left">
          <span class="vf-dir-banner-icon" style="background:${meta.accentColor}18; border-color:${meta.accentColor}44;">${meta.icon}</span>
          <div>
            <div class="vf-dir-banner-title">
              <span>${meta.name}</span>
              <span class="vf-dir-banner-badge" style="background:${meta.accentColor}22; color:${meta.accentColor}; border:1px solid ${meta.accentColor}66;">${meta.badge}</span>
            </div>
            <div class="vf-dir-banner-summary">${meta.summary}</div>
          </div>
        </div>
        <div class="vf-dir-banner-actions">
          <button class="vf-btn vf-btn-sm vf-btn-primary" id="btnRunActiveDirection" style="background:${meta.accentColor}; color:#000; font-weight:700;">▶ Run This Flow</button>
          <button class="vf-btn vf-btn-sm vf-btn-ghost" id="btnGuideActiveDirection">📖 Learn How It Works</button>
          <button class="vf-dir-banner-close" id="btnCloseDirectionBanner" title="Dismiss Banner">✕</button>
        </div>
      `;

      const runBtn = this.directionBanner.querySelector('#btnRunActiveDirection');
      if (runBtn) {
        runBtn.addEventListener('click', () => {
          this.runFlow();
        });
      }

      const guideBtn = this.directionBanner.querySelector('#btnGuideActiveDirection');
      if (guideBtn) {
        guideBtn.addEventListener('click', () => {
          if (this.sidebarRight && this.sidebarRight.classList.contains('collapsed')) {
            this.sidebarRight.classList.remove('collapsed');
            if (this.expandRightBtn) this.expandRightBtn.style.display = 'none';
          }
          this._renderDirectionGuide(meta);
          if (this.copilotGuide) {
            this.copilotGuide.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      const closeBtn = this.directionBanner.querySelector('#btnCloseDirectionBanner');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.directionBanner.style.display = 'none';
        });
      }
    }

    _renderDirectionGuide(meta) {
      if (!this.copilotGuide) return;

      const studioSlug = (this.currentStudioId || 'ai').toLowerCase().replace(/^\/?tools\//, '').replace(/\/$/, '');
      const dirKey = meta.id;

      let guideDetails = '';
      if (dirKey === 'learning') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">🎓 The 5-Phase Learning Journey</div>
            <ol class="vf-guide-step-list">
              <li><strong>Phase 1: Prerequisites Check</strong> — Validates foundational knowledge, developer tools, and required CLI runtimes.</li>
              <li><strong>Phase 2: Concept Lesson</strong> — Plain-English architecture walkthrough breaking down internal mechanisms without jargon.</li>
              <li><strong>Phase 3: Interactive Hands-On Lab</strong> — Real-time parameter tweaking, editable code, and instant simulation verification.</li>
              <li><strong>Phase 4: Knowledge Challenge</strong> — Injected anti-pattern or transient fault troubleshooting drill.</li>
              <li><strong>Phase 5: Portfolio Project</strong> — Verified, deployable repository blueprint ready for your personal GitHub.</li>
            </ol>
            <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
              <a href="/tools/${studioSlug}/learn.html" class="vf-btn vf-btn-sm" target="_blank">📚 Read Lesson</a>
              <a href="/tools/${studioSlug}/index.html" class="vf-btn vf-btn-sm vf-btn-primary" target="_blank">🧪 Open Interactive Lab</a>
            </div>
          </div>
        `;
      } else if (dirKey === 'failure') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">⚠️ Fault Injection & Error Propagation</div>
            <p>In production pipelines, a failure in stage 3 (e.g. Validation or Ingestion) must immediately halt downstream stages to prevent corrupted state from leaking into production.</p>
            <div class="vf-check-box mistakes" style="margin-top:0.4rem;">
              <strong>Anti-Pattern:</strong> Allowing downstream stages to execute with missing upstream outputs.
            </div>
            <div class="vf-check-box verification" style="margin-top:0.4rem;">
              <strong>Remediation:</strong> Fast-fail early, notify oncall via PagerDuty/Slack, and preserve execution logs for triage.
            </div>
          </div>
        `;
      } else if (dirKey === 'retry') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">🔁 Exponential Backoff & Circuit Breakers</div>
            <p>When an API rate limits (HTTP 429) or a database connection times out, instant retries cause thundering herds. Exponential backoff pauses (1s, 2s, 4s) with jitter ensure graceful recovery.</p>
          </div>
        `;
      } else if (dirKey === 'rollback') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">⏪ Automated Canary Rollback</div>
            <p>Canary releases route 5-10% traffic to new versions. If synthetic monitoring detects error budget consumption or p99 latency spikes, automated rollback instantly restores the immutable previous release with zero downtime.</p>
          </div>
        `;
      } else if (dirKey === 'security') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">🛡️ Zero-Trust Security Boundaries</div>
            <p>Every node strictly validates identity via mTLS/SPIFFE, masks sensitive secrets from logs, runs automated SAST/DAST scans, and validates SLSA cryptographic attestations.</p>
          </div>
        `;
      } else if (dirKey === 'observability') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">📊 OpenTelemetry MELT Observability</div>
            <p>Distributed tracing injects W3C TraceContext (traceparent) across every microservice hop, capturing correlated logs, RED metrics (Rate, Errors, Duration), and p99 distributions.</p>
          </div>
        `;
      } else if (dirKey === 'recovery') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">🩺 SRE Incident Auto-Remediation</div>
            <p>Demonstrates automatic incident diagnosis: signal detection ➔ pod eviction / failover to hot standby ➔ synthetic health checks ➔ automatic incident resolution.</p>
          </div>
        `;
      } else if (dirKey === 'performance') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">⚡ Performance Bottleneck Profiling</div>
            <p>Identifies serialization bottlenecks, queue delays, and memory pressure. Illustrates how continuous batching, KV caching, and asynchronous workers reduce p99 latency.</p>
          </div>
        `;
      } else if (dirKey === 'data') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">📦 Payload Inspection & Data Movement</div>
            <p>Inspects the exact data passing between stages: JSON payloads, chunk tokens, normalized 1536-dim vector embeddings, and retrieved citations.</p>
          </div>
        `;
      } else if (dirKey === 'reverse') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">🔍 Reverse Dependency Tracing</div>
            <p>Traces an output or incident backwards to find the root cause, upstream configuration drift, or anomalous user input that generated the state.</p>
          </div>
        `;
      } else if (dirKey === 'dependency') {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">🔗 Strict Topological Prerequisites</div>
            <p>Validates that upstream producer nodes satisfy their schema contracts before downstream consumer stages can run.</p>
          </div>
        `;
      } else {
        guideDetails = `
          <div class="vf-guide-section">
            <div class="vf-guide-step-title">✅ Happy Path Normal Execution</div>
            <p>Simulates smooth, end-to-end execution across all components from entry trigger to validated release with 100% test pass rate.</p>
          </div>
        `;
      }

      this.copilotGuide.innerHTML = `
        <div style="margin-bottom:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span style="font-size:1.3rem;">${meta.icon}</span>
            <span style="font-weight:700; color:#fff; font-size:0.95rem;">${meta.name}</span>
          </div>
          <div style="font-size:0.72rem; color:${meta.accentColor}; font-family:var(--vf-font-mono); font-weight:700;">${meta.badge}</div>
          <p style="font-size:0.75rem; color:#94a3b8; margin-top:0.4rem; line-height:1.45;">${meta.description}</p>
        </div>
        ${guideDetails}
        ${this.studioCopilotHtml ? `<div style="margin-top:0.85rem; border-top:1px solid var(--vf-border); padding-top:0.75rem;">${this.studioCopilotHtml}</div>` : ''}
      `;
    }

    async _waitWhilePaused() {
      while (this.isPaused && this.isRunning) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    togglePlayPause() {
      if (this.isRunning) {
        this.isPaused = !this.isPaused;
        if (this.playPauseBtn) {
          this.playPauseBtn.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
        }
        this.log(this.isPaused ? 'Simulation paused by user.' : 'Simulation resumed.');
      } else {
        this.runFlow();
      }
    }

    stepForward() {
      const nodes = Array.from(this.nodes.values());
      if (this.executionStep >= nodes.length) {
        this.log('Already at the final stage of flow.');
        return;
      }
      const n = nodes[this.executionStep];
      n.state = 'passed';
      this.render();
      this.selectNode(n.id);
      if (this.activeFlowDirection === 'learning') {
        const phases = ['Phase 1: Prerequisites Check', 'Phase 2: Concept Lesson', 'Phase 3: Interactive Lab', 'Phase 4: Knowledge Challenge', 'Phase 5: Portfolio Project'];
        const p = phases[this.executionStep % phases.length];
        this.log(`🎓 [${p.toUpperCase()}] at [${n.title}]: Step passed.`);
      } else {
        this.log(`Stepped forward: [${n.title}] ➔ PASSED`);
      }
      this.executionStep++;
    }

    stepBackward() {
      if (this.executionStep <= 0) {
        this.log('Already at the initial stage.');
        return;
      }
      this.executionStep--;
      const nodes = Array.from(this.nodes.values());
      const n = nodes[this.executionStep];
      n.state = 'pending';
      this.render();
      this.selectNode(n.id);
      this.log(`Stepped backward: [${n.title}] reset to PENDING`);
    }

    resetSimulation() {
      this.isRunning = false;
      this.isPaused = false;
      this.executionStep = 0;
      this.nodes.forEach(n => { n.state = 'pending'; });
      this.render();
      if (this.playPauseBtn) this.playPauseBtn.textContent = '▶ Play';
      if (this.runFlowBtn) {
        this.runFlowBtn.textContent = '▶ Run the Flow';
        this.runFlowBtn.disabled = false;
      }
      const wires = this.svgLayer ? this.svgLayer.querySelectorAll('.vf-wire') : [];
      wires.forEach(w => {
        w.classList.remove('active', 'success', 'failed');
      });
      this.log('Reset simulation state across all nodes to PENDING.');
    }

    injectFailure() {
      const nodes = Array.from(this.nodes.values());
      if (nodes.length === 0) return;
      const targetIdx = Math.min(2, nodes.length - 1);
      const failedNode = nodes[targetIdx];
      failedNode.state = 'failed';

      // Mark downstream nodes as blocked
      for (let i = targetIdx + 1; i < nodes.length; i++) {
        nodes[i].state = 'blocked';
      }

      this.render();
      this.selectNode(failedNode.id);
      this.log(`[FAILURE INJECTION] Simulated Critical Failure at [${failedNode.title}]. Downstream stages BLOCKED.`);
    }

    openManimModal() {
      let modal = document.getElementById('vfManimModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'vfManimModal';
        modal.className = 'vf-modal-overlay';
        document.body.appendChild(modal);
      }

      const studioSlug = (this.currentStudioId || 'pipeline').toLowerCase().replace(/^\/?tools\//, '').replace(/\/$/, '');
      const studioTitle = (this.brandBadge ? this.brandBadge.textContent : 'ENGINEERING').replace(' FLOW', '');
      const nodeList = Array.from(this.nodes.values());

      const pythonCode = `#!/usr/bin/env python3
"""
3Blue1Brown / Manim Programmatic Video Animation
${studioTitle} — Architecture & Flow Simulation
Render with: manim -pqh manim_flow.py ${studioTitle.replace(/[^a-zA-Z0-9]/g, '')}Scene
"""
from manim import *

class ${studioTitle.replace(/[^a-zA-Z0-9]/g, '')}Scene(Scene):
    def construct(self):
        self.camera.background_color = "#0B0F19"
        CYAN = "#00F0FF"
        EMERALD = "#10B981"
        AMBER = "#F59E0B"
        WHITE = "#F8FAFC"
        
        title = Text("${studioTitle} Flow", font_size=24, color=WHITE).to_edge(UP)
        self.play(FadeIn(title), run_time=1.0)
        
        # Stages: ${nodeList.map(n => n.title).join(' -> ')}
        # Auto-generated by VisualFlowCanvas Manim MCP Engine
        self.wait(2.0)
`;

      modal.innerHTML = `
        <div class="vf-modal-container">
          <div class="vf-modal-header">
            <div class="vf-modal-title">
              <span>🎬</span>
              <span>3Blue1Brown / Manim MCP Animation Studio</span>
              <span class="vf-badge" style="font-size:0.65rem; background:rgba(16,185,129,0.2); color:#10b981;">STATUS: READY</span>
            </div>
            <button class="vf-modal-close" id="btnManimModalClose">✕</button>
          </div>
          <div class="vf-modal-body">
            <p style="font-size:0.8rem; color:#94a3b8; margin-bottom:1rem; line-height:1.5;">
              This animation script is synthesized live for <strong>${studioTitle}</strong>. Execute via local Manim CLI or render on-demand through the Manim MCP Server to inspect animated token streams and packet transitions.
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <span style="font-size:0.75rem; font-family:var(--vf-font-mono); color:#38bdf8;">manim_flow.py</span>
              <button class="vf-btn vf-btn-sm" id="btnCopyManimCode">📋 Copy Script</button>
            </div>
            <pre class="vf-code-preview" style="max-height: 280px; overflow-y: auto;"><code>${VisualFlowCanvas.escapeHtml(pythonCode)}</code></pre>
            <div style="margin-top:1rem; font-size:0.72rem; color:#64748b; font-family:var(--vf-font-mono);">
              Render locally: <code>manim -pqh manim_flow.py ${studioTitle.replace(/[^a-zA-Z0-9]/g, '')}Scene</code>
            </div>
          </div>
        </div>
      `;

      modal.style.display = 'flex';
      modal.querySelector('#btnManimModalClose').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      modal.querySelector('#btnCopyManimCode').addEventListener('click', (e) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(pythonCode).then(() => {
            e.target.textContent = '✅ Copied!';
            setTimeout(() => { e.target.textContent = '📋 Copy Script'; }, 2000);
          });
        }
      });
    }

    async runFlow() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.isPaused = false;
      this.runFlowBtn.textContent = '⏳ Executing...';
      this.runFlowBtn.disabled = true;

      const direction = this.activeFlowDirection || 'happy';
      const meta = FLOW_DIRECTIONS_METADATA[direction] || FLOW_DIRECTIONS_METADATA.happy;
      this.log(`----------------------------------------------------------------`);
      this.log(`[FLOW INITIATION] Starting DAG pipeline in mode: [${meta.name}]`);
      this.log(`[FLOW STRATEGY] ${meta.description}`);

      const wires = this.svgLayer ? this.svgLayer.querySelectorAll('.vf-wire') : [];
      const nodes = Array.from(this.nodes.values());

      if (direction === 'reverse') {
        // 2. Reverse trace: Output -> Input
        for (let i = nodes.length - 1; i >= 0; i--) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          this.selectNode(n.id);
          this.log(`[REVERSE TRACE] Tracing dependency backwards: [${n.title}] ➔ inspecting parent origin...`);
          await new Promise(r => setTimeout(r, 450));
          n.state = 'passed';
          this.render();
        }
      } else if (direction === 'failure') {
        // 3. Failure path: Stage 3 critical failure & downstream blocked
        const failIdx = Math.min(2, nodes.length - 1);
        for (let i = 0; i <= failIdx; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          await new Promise(r => setTimeout(r, 450));
          if (i === failIdx) {
            n.state = 'failed';
            this.render();
            this.selectNode(n.id);
            this.log(`[CRITICAL FAILURE] Stage [${n.title}] failed validation assertion. Exit code: 1`);
            this.log(`[ERROR PROPAGATION] Halting pipeline execution. Downstream stages marked as BLOCKED.`);
          } else {
            n.state = 'passed';
            this.log(`Stage [${n.title}] completed successfully.`);
          }
          this.render();
        }
        for (let i = failIdx + 1; i < nodes.length; i++) {
          nodes[i].state = 'blocked';
        }
        this.render();
      } else if (direction === 'retry') {
        // 4. Retry path: Transient network failure with exponential backoff
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          if (i === 1) {
            this.log(`[TRANSIENT FAULT] [${n.title}] received HTTP 429 Rate Limit. Initiating exponential backoff...`);
            n.state = 'failed';
            this.render();
            await new Promise(r => setTimeout(r, 500));
            this.log(`[RETRY 1/3] Backoff wait 1.0s... retrying connection to [${n.title}]`);
            await new Promise(r => setTimeout(r, 600));
            n.state = 'running';
            this.render();
            this.log(`[RETRY SUCCESS] Connection established on attempt 2. Resuming execution.`);
          } else {
            await new Promise(r => setTimeout(r, 350));
          }
          n.state = 'passed';
          this.render();
        }
      } else if (direction === 'rollback') {
        // 5. Rollback path: Canary breach and automated rollback
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          await new Promise(r => setTimeout(r, 380));
          if (i === nodes.length - 1) {
            n.state = 'failed';
            this.render();
            this.log(`[CANARY MONITORING] 5xx error rate spiked to 3.8% (SLO threshold: 0.1%). Error budget BREACHED.`);
            this.log(`[CIRCUIT BREAKER] Automated rollback initiated. Draining canary traffic.`);
            await new Promise(r => setTimeout(r, 700));
            n.state = 'passed';
            this.render();
            this.log(`[ROLLBACK COMPLETE] Restored immutable previous release revision with zero customer downtime.`);
          } else {
            n.state = 'passed';
          }
          this.render();
        }
      } else if (direction === 'dependency') {
        // 6. Dependency path: Topologically verify parent-child contracts
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          const upstream = this.connections.filter(c => c.to === n.id).map(c => c.from);
          const downstream = this.connections.filter(c => c.from === n.id).map(c => c.to);
          this.log(`[DEPENDENCY CHECK] Stage [${n.title}] | Upstream prerequisites: [${upstream.join(', ') || 'None (Root)'}] | Downstream consumers: [${downstream.join(', ') || 'Terminal'}]`);
          await new Promise(r => setTimeout(r, 450));
          n.state = 'passed';
          this.render();
        }
      } else if (direction === 'data') {
        // 7. Data flow: Payload inspection passing along wires
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          if (wires[i]) wires[i].classList.add('active');

          const payloads = [
            'Document schema payload: 42KB UTF-8 text',
            'Normalized chunks: 18 blocks (chunkSize=1000, overlap=200)',
            'Vector embeddings: 18x float32 arrays (dim=1536)',
            'HNSW Index lookup: top-k=5 nearest neighbors (cosine sim=0.89)',
            'Synthesized model generation with 5 grounded source citations',
            'Final verified output artifact rendered with source citations'
          ];
          const payloadInfo = payloads[i % payloads.length];
          this.log(`[DATA FLOW] [${n.title}] Ingested & Transformed: ${payloadInfo}`);
          await new Promise(r => setTimeout(r, 500));

          n.state = 'passed';
          this.render();
          if (wires[i]) {
            wires[i].classList.remove('active');
            wires[i].classList.add('success');
          }
        }
      } else if (direction === 'security') {
        // 8. Security flow: Zero-Trust identity, secret boundaries, guardrails
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          const secChecks = [
            'mTLS SPIFFE identity token verified. Role: least-privilege-operator',
            'AST static code analysis: 0 CWE vulnerabilities detected (Semgrep)',
            'Secret boundary scan: 0 plaintext credentials leaked in environment/logs',
            'Supply chain validation: SLSA Level 3 provenance signature (Cosign verified)',
            'Runtime policy gate: Admission controller approved deployment'
          ];
          this.log(`[ZERO-TRUST GATE] [${n.title}]: ${secChecks[i % secChecks.length]}`);
          await new Promise(r => setTimeout(r, 450));
          n.state = 'passed';
          this.render();
        }
      } else if (direction === 'observability') {
        // 9. Observability flow: OpenTelemetry MELT telemetry
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          const traceId = '4bf92f3577b34da6a3ce929d0e0e' + (1000 + i);
          const spanId = '00f067aa0ba9' + (200 + i);
          const lat = Math.floor(Math.random() * 25) + 8;
          this.log(`[MELT TELEMETRY] [${n.title}] traceparent: 00-${traceId}-${spanId}-01 | latency: ${lat}ms | Memory: 114MB`);
          await new Promise(r => setTimeout(r, 420));
          n.state = 'passed';
          this.render();
        }
      } else if (direction === 'recovery') {
        // 10. Recovery flow: Incident triage, self-healing, and closure
        this.log(`[SRE ALERT] Alert: High Pod CrashLoopBackOff triggered in production namespace.`);
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          if (i === 1) {
            n.state = 'failed';
            this.render();
            this.log(`[INCIDENT TRIAGE] [${n.title}] flagged as root cause: out-of-memory crash.`);
            await new Promise(r => setTimeout(r, 600));
            this.log(`[AUTO-HEALING] Kubernetes autoscaler spun up healthy replica with 2x memory quota.`);
            await new Promise(r => setTimeout(r, 500));
            n.state = 'passed';
            this.render();
            this.log(`[HEALTH CHECK] Liveness and readiness probes passed (HTTP 200 OK).`);
          } else {
            await new Promise(r => setTimeout(r, 380));
            n.state = 'passed';
            this.render();
          }
        }
        this.log(`[INCIDENT CLOSED] SRE incident auto-remediated and post-mortem entry drafted.`);
      } else if (direction === 'performance') {
        // 11. Performance flow: Queue time & bottleneck profiling
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          if (i === 2) {
            this.log(`[PROFILER] [${n.title}] detected 120ms thread contention bottleneck.`);
            await new Promise(r => setTimeout(r, 500));
            this.log(`[OPTIMIZATION] Applied non-blocking async worker pool + PagedAttention KV-cache.`);
            await new Promise(r => setTimeout(r, 400));
            this.log(`[BENCHMARK] Throughput elevated from 45 RPS ➔ 210 RPS (p99 latency: 14ms).`);
          } else {
            await new Promise(r => setTimeout(r, 350));
          }
          n.state = 'passed';
          this.render();
        }
      } else if (direction === 'learning') {
        // 12. Learning flow: Prerequisites ➔ Lesson ➔ Lab ➔ Challenge ➔ Project
        const learningPhases = [
          { phase: 'Phase 1: Prerequisites Check', desc: 'Validating foundational requirements, environment variables, and SDK versions' },
          { phase: 'Phase 2: Concept Lesson', desc: 'Plain-English architecture breakdown and internal mechanism walkthrough' },
          { phase: 'Phase 3: Interactive Hands-On Lab', desc: 'Executing verified sandbox drill with live parameter inspection' },
          { phase: 'Phase 4: Knowledge Challenge', desc: 'Simulated troubleshooting scenario solved with 3-level progressive hints' },
          { phase: 'Phase 5: Portfolio Project', desc: 'Packaging verified code into a reproducible GitHub portfolio repository' }
        ];

        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          const p = learningPhases[i % learningPhases.length];
          n.state = 'running';
          this.render();
          this.selectNode(n.id);
          this.log(`🎓 [${p.phase.toUpperCase()}] at [${n.title}]: ${p.desc}...`);
          await new Promise(r => setTimeout(r, 650));
          n.state = 'passed';
          this.render();
        }
        this.log(`🏆 [LEARNING JOURNEY COMPLETE] You mastered all 5 educational milestones for this architecture!`);
      } else {
        // Default happy path
        for (let i = 0; i < nodes.length; i++) {
          if (this.isPaused) await this._waitWhilePaused();
          const n = nodes[i];
          n.state = 'running';
          this.render();
          if (wires[i]) wires[i].classList.add('active');
          const latency = Math.floor(Math.random() * 40) + 15;
          this.log(`Executing [${n.title}] | latency: ${latency}ms | exit code: 0`);
          await new Promise(r => setTimeout(r, 400));
          n.state = 'passed';
          this.render();
          if (wires[i]) {
            wires[i].classList.remove('active');
            wires[i].classList.add('success');
          }
        }
      }

      this.isRunning = false;
      this.runFlowBtn.textContent = '▶ Run the Flow';
      this.runFlowBtn.disabled = false;
      this.log(`[FLOW COMPLETE] Pipeline execution finished in mode [${meta.name}].`);
    }

    log(msg) {
      const time = new Date().toISOString().substring(11, 19);
      const entry = document.createElement('div');
      entry.className = 'vf-log-entry';
      entry.innerHTML = `
        <span class="vf-log-time">[${time}]</span>
        <span class="vf-log-engine">[WASM SIMULATION]</span>
        <span class="vf-log-msg">${msg}</span>
      `;
      this.terminalBody.appendChild(entry);
      this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
    }

    exportCode() {
      const spec = {
        version: 'pradeep.flow.v1',
        name: 'Visual Flow Specification',
        exportedAt: new Date().toISOString(),
        nodes: Array.from(this.nodes.values()),
        connections: this.connections
      };

      const jsonStr = JSON.stringify(spec, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flow-spec-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.log('Downloaded verified JSON flow declaration spec.');
    }

    saveProject() {
      const spec = {
        version: 'pradeep.flow.v1',
        name: (this.currentStudioId || 'custom-flow'),
        savedAt: new Date().toISOString(),
        studioId: this.currentStudioId,
        nodes: Array.from(this.nodes.values()),
        connections: this.connections,
        scale: this.scale,
        panOffset: this.panOffset
      };
      try {
        const key = `vf_project_${(this.currentStudioId || 'default').replace(/[^a-z0-9_-]/gi, '')}`;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(spec));
          localStorage.setItem('vf_last_saved_key', key);
        }
        if (this.saveBtn) {
          const prevText = this.saveBtn.textContent;
          this.saveBtn.textContent = '✅ Saved!';
          setTimeout(() => { if (this.saveBtn) this.saveBtn.textContent = prevText; }, 1800);
        }
        this.log(`Saved project state (${this.nodes.size} nodes, ${this.connections.length} wires) to local persistence.`);
        return true;
      } catch (e) {
        console.warn('Failed to save project:', e);
        return false;
      }
    }

    restoreProject() {
      try {
        if (typeof localStorage === 'undefined') return false;
        const key = `vf_project_${(this.currentStudioId || 'default').replace(/[^a-z0-9_-]/gi, '')}`;
        let raw = localStorage.getItem(key);
        if (!raw) {
          const lastKey = localStorage.getItem('vf_last_saved_key');
          if (lastKey) raw = localStorage.getItem(lastKey);
        }
        if (!raw) {
          this.log(`No saved project found for current studio in local storage.`);
          return false;
        }
        const spec = JSON.parse(raw);
        if (!spec || !Array.isArray(spec.nodes)) return false;

        this.nodes.clear();
        this.connections = [];
        spec.nodes.forEach(n => this.nodes.set(n.id, Object.assign({}, n)));
        if (Array.isArray(spec.connections)) {
          this.connections = spec.connections.map(c => Object.assign({}, c));
        }
        if (spec.scale) this.scale = spec.scale;
        if (spec.panOffset) this.panOffset = spec.panOffset;

        this.render();
        this._applyTransform();
        if (this.nodes.size > 0) {
          const firstNode = Array.from(this.nodes.values())[0];
          this.selectNode(firstNode.id);
        }
        if (this.restoreBtn) {
          const prev = this.restoreBtn.textContent;
          this.restoreBtn.textContent = '✅ Restored!';
          setTimeout(() => { if (this.restoreBtn) this.restoreBtn.textContent = prev; }, 1800);
        }
        this.log(`Restored project (${this.nodes.size} nodes, ${this.connections.length} wires) saved on ${spec.savedAt || 'earlier session'}.`);
        return true;
      } catch (e) {
        console.warn('Failed to restore project:', e);
        return false;
      }
    }

    importProject(jsonStr) {
      try {
        const spec = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
        if (!spec || !Array.isArray(spec.nodes)) {
          this.log('Invalid project specification format.');
          return false;
        }
        this.nodes.clear();
        this.connections = [];
        spec.nodes.forEach(n => this.nodes.set(n.id, Object.assign({}, n)));
        if (Array.isArray(spec.connections)) {
          this.connections = spec.connections.map(c => Object.assign({}, c));
        }
        this.render();
        this.fitView();
        if (this.nodes.size > 0) {
          const firstNode = Array.from(this.nodes.values())[0];
          this.selectNode(firstNode.id);
        }
        this.log(`Imported flow spec: ${spec.name || 'Custom Project'} (${this.nodes.size} nodes, ${this.connections.length} wires)`);
        return true;
      } catch (err) {
        this.log(`Error parsing imported file: ${err.message}`);
        return false;
      }
    }

    switchDrawerTab(tabKey) {
      if (!this.drawer) return;
      this.drawer.querySelectorAll('.vf-drawer-tab').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabKey) tab.classList.add('active');
        else tab.classList.remove('active');
      });

      if (this.terminalBody) this.terminalBody.style.display = tabKey === 'logs' ? 'block' : 'none';
      if (this.metricsPanel) this.metricsPanel.style.display = tabKey === 'metrics' ? 'block' : 'none';
      if (this.manifestPanel) this.manifestPanel.style.display = tabKey === 'code' ? 'block' : 'none';

      if (tabKey === 'metrics') {
        this._renderMetricsTab();
      } else if (tabKey === 'code') {
        this._renderManifestTab();
      }
    }

    _renderMetricsTab() {
      if (!this.metricsPanel) return;
      const count = this.nodes.size;
      const wireCount = this.connections.length;

      const nodeRows = Array.from(this.nodes.values()).map(n => {
        const lat = Math.floor(Math.random() * 20) + 12;
        const err = '0.00%';
        return `
          <div class="vf-slo-stage-row">
            <span class="vf-slo-stage-name">${n.icon || '📦'} ${n.title}</span>
            <span class="vf-slo-stage-type vf-badge-${n.type || 'model'}">${n.type || 'stage'}</span>
            <span class="vf-slo-stage-val" style="color:#38bdf8;">${lat}ms</span>
            <span class="vf-slo-stage-val" style="color:#10b981;">${err}</span>
            <div class="vf-slo-progress-bar">
              <div class="vf-slo-progress-fill" style="width: ${Math.min(100, lat * 2.5)}%;"></div>
            </div>
          </div>
        `;
      }).join('');

      this.metricsPanel.innerHTML = `
        <div class="vf-metrics-grid">
          <div class="vf-metric-card">
            <div class="vf-metric-header">
              <span class="vf-metric-title">⚡ End-to-End Latency</span>
              <span class="vf-metric-status ok">SLO &lt;100ms</span>
            </div>
            <div class="vf-metric-val">48.2 <span class="vf-metric-unit">ms</span></div>
            <div class="vf-metric-sub">p50: 16ms | p95: 38ms | p99: 74ms</div>
          </div>

          <div class="vf-metric-card">
            <div class="vf-metric-header">
              <span class="vf-metric-title">🛡️ Error Budget & Availability</span>
              <span class="vf-metric-status ok">99.99%</span>
            </div>
            <div class="vf-metric-val">100.0 <span class="vf-metric-unit">%</span></div>
            <div class="vf-metric-sub">0 budget burned | 0 dropped spans</div>
          </div>

          <div class="vf-metric-card">
            <div class="vf-metric-header">
              <span class="vf-metric-title">🌊 Throughput & Reflex Routing</span>
              <span class="vf-metric-status ok">Optimal</span>
            </div>
            <div class="vf-metric-val">1,480 <span class="vf-metric-unit">RPS</span></div>
            <div class="vf-metric-sub">Cache hit: 98.2% | Reflex bypass: active</div>
          </div>

          <div class="vf-metric-card">
            <div class="vf-metric-header">
              <span class="vf-metric-title">📊 Cluster Saturation</span>
              <span class="vf-metric-status ok">Healthy</span>
            </div>
            <div class="vf-metric-val">24.5 <span class="vf-metric-unit">%</span></div>
            <div class="vf-metric-sub">gVisor MicroVMs: 3/16 pooled</div>
          </div>
        </div>

        <div class="vf-slo-breakdown">
          <div class="vf-slo-breakdown-title">DAG Stage Latency & Golden Signals Breakdown (${count} nodes, ${wireCount} wires)</div>
          ${nodeRows}
        </div>
      `;
    }

    _renderManifestTab() {
      if (!this.manifestPanel) return;
      const spec = {
        apiVersion: 'pradeep.engineering/v1alpha1',
        kind: 'VisualFlowPipeline',
        metadata: {
          name: (this.currentStudioId || 'flow').replace(/[^a-z0-9-]/gi, '-'),
          generatedAt: new Date().toISOString()
        },
        spec: {
          runtime: 'wasm-simulation',
          companionEndpoint: 'http://localhost:8000',
          nodes: Array.from(this.nodes.values()).map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            params: n.params
          })),
          edges: this.connections
        }
      };

      const yamlOrJson = JSON.stringify(spec, null, 2);
      this.manifestPanel.innerHTML = `
        <div style="padding: 0.75rem 1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span style="font-size:0.75rem; font-family:var(--vf-font-mono); color:var(--vf-accent-cyan);">Generated Kubernetes CRD & DAG Manifest</span>
            <button class="vf-btn vf-btn-sm" id="vfCopyManifestBtn" style="padding:0.25rem 0.65rem; font-size:0.72rem; cursor:pointer;">📋 Copy Manifest</button>
          </div>
          <pre class="vf-code-preview"><code>${this._escapeHtml(yamlOrJson)}</code></pre>
        </div>
      `;

      const copyBtn = this.manifestPanel.querySelector('#vfCopyManifestBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(yamlOrJson).then(() => {
              copyBtn.textContent = '✅ Copied!';
              setTimeout(() => { copyBtn.textContent = '📋 Copy Manifest'; }, 2000);
            });
          }
        });
      }
    }

    _escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  VisualFlowCanvas.STARTER_TEMPLATES = STARTER_TEMPLATES;

  return VisualFlowCanvas;
});
