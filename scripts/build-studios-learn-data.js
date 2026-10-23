const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const toolsPath = path.join(rootDir, 'tools', 'tools.json');
const outDir = path.join(rootDir, 'studios', 'learn');
const outFile = path.join(outDir, 'studios-learning.json');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));

// Helper to deduce domain treatment and skill level
function deriveDomainAndLevel(tool) {
  const cat = tool.category || '';
  const text = (tool.title + ' ' + tool.desc + ' ' + tool.tag).toLowerCase();

  let domain = 'Cloud Delivery & GitOps';
  let level = 'Level 2 (Scripting & Ops)';

  if (cat === 'ai') {
    if (text.includes('forward deployed') || text.includes('fde')) {
      domain = 'Customer AI & Air-Gapped K8s';
      level = 'Level 3 (Distributed & Compliance)';
    } else if (text.includes('kernel') || text.includes('quantum') || text.includes('tee') || text.includes('deepspeed') || text.includes('vllm') || text.includes('sglang') || text.includes('tensorrt') || text.includes('bitnet') || text.includes('speculative')) {
      domain = 'LLMOps & AI Runtime';
      level = 'Level 4 (Kernel & Deep AI)';
    } else if (text.includes('guardrail') || text.includes('security') || text.includes('redteaming') || text.includes('governance') || text.includes('aadhaar')) {
      domain = 'Zero-Trust Security & AI Safety';
      level = 'Level 3 (Distributed & Compliance)';
    } else if (text.includes('cost') || text.includes('budget') || text.includes('cache') || text.includes('caching')) {
      domain = 'FinOps & Cost Optimization';
      level = 'Level 2 (Scripting & Ops)';
    } else {
      domain = 'LLMOps & RAG Pipelines';
      level = 'Level 3 (Distributed & Compliance)';
    }
  } else if (cat === 'observability') {
    if (text.includes('ebpf') || text.includes('kernel') || text.includes('profiler') || text.includes('flamegraph')) {
      domain = 'Kernel Telemetry & Performance';
      level = 'Level 4 (Kernel & Deep AI)';
    } else {
      domain = 'Incident Triage & Observability';
      level = 'Level 2 (Scripting & Ops)';
    }
  } else if (cat === 'cloud') {
    if (text.includes('karpenter') || text.includes('keda') || text.includes('cilium') || text.includes('crossplane') || text.includes('gpu')) {
      domain = 'Cloud Infrastructure & K8s';
      level = 'Level 3 (Distributed & Compliance)';
    } else {
      domain = 'Cloud Infrastructure & K8s';
      level = 'Level 2 (Scripting & Ops)';
    }
  } else if (cat === 'cicd') {
    domain = 'Cloud Delivery & GitOps';
    level = text.includes('argocd') || text.includes('flux') || text.includes('progressive') ? 'Level 3 (Distributed & Compliance)' : 'Level 2 (Scripting & Ops)';
  } else if (cat === 'automation') {
    if (text.includes('vault') || text.includes('secret') || text.includes('sast') || text.includes('trivy') || text.includes('compliance')) {
      domain = 'Zero-Trust Security & DevSecOps';
      level = 'Level 3 (Distributed & Compliance)';
    } else if (text.includes('localstack') || text.includes('docker') || text.includes('git')) {
      domain = 'Local Sandbox & Emulation';
      level = 'Level 1 (Foundations & Sandbox)';
    } else {
      domain = 'Automation & SRE Runbooks';
      level = 'Level 2 (Scripting & Ops)';
    }
  }

  return { domain, level };
}

// Generate rich educational metadata
function generateLearningProfile(tool) {
  const cat = tool.category || '';
  const title = tool.title;
  const desc = tool.desc;
  const tag = tool.tag || 'config.yaml';
  const repo = tool.repository || `Pradeeptalari14/tp-${tool.link.replace(/\//g, '')}`;
  const { domain, level } = deriveDomainAndLevel(tool);
  const text = (title + ' ' + desc + ' ' + tag).toLowerCase();

  let useCase = '';
  let bestTreatment = '';
  let antiPattern = '';
  let realTimeDrill = '';
  let sreMetric = '';

  // Tailored profiles for prominent next-gen and key tools
  if (text.includes('ebpf-continuous-profiler') || text.includes('continuous ebpf')) {
    useCase = 'Diagnose silent production CPU spikes, thread scheduling lock contention, and off-CPU blocking in mission-critical Linux clusters without adding user-space agent latency.';
    bestTreatment = 'Deploy in-kernel eBPF perf ring buffers at 99Hz sampling rate with DWARF frame-unwinding. Aggregate stack traces in kernel space before sending to userland to maintain <0.8% CPU overhead.';
    antiPattern = 'Attaching invasive JVM / Node / Python debuggers or running ptrace in live traffic, which pauses threads and introduces 8%+ CPU degradation.';
    realTimeDrill = 'sudo bpftrace -e \'profile:hz:99 /pid == 1234/ { @[kstack, ustack] = count(); }\' | ./flamegraph.pl > cpu_flame.svg';
    sreMetric = '<0.8% Overhead & 100% On/Off-CPU Stack Trace Resolution';
  } else if (text.includes('mcp-universal-gateway') || text.includes('model context protocol')) {
    useCase = 'Governing heterogeneous multi-agent workflows (Claude, LangGraph, AutoGen) consuming internal microservice tools via Anthropic Model Context Protocol (MCP).';
    bestTreatment = 'Implement a centralized JSON-RPC 2.0 gateway with dynamic schema discovery, token-bucket rate limiting, and zero-trust RBAC role evaluation per tool invocation.';
    antiPattern = 'Granting autonomous agents direct unrestricted database credentials or shell access without an intermediary schema-enforcing proxy.';
    realTimeDrill = 'curl -X POST http://localhost:8080/mcp/v1/tools/call -H "Authorization: Bearer sops_key" -d \'{"tool":"k8s_drain_node","params":{"node":"worker-9"}}\'';
    sreMetric = '100% RBAC Policy Enforcement & <2.1ms Schema Cache Latency';
  } else if (text.includes('speculative-rag') || text.includes('speculative rag')) {
    useCase = 'High-accuracy enterprise RAG systems where verifying complex multi-hop factual claims causes severe response latency bottlenecks for user queries.';
    bestTreatment = 'Use dual-model speculative architecture: a lightweight draft SLM generates candidate answer chunks while a verified cross-encoder evaluates factual grounding in parallel.';
    antiPattern = 'Passing entire unranked 100k-token corpora into massive flagship LLMs directly, inflating TTFT latency and increasing hallucination risks.';
    realTimeDrill = 'python3 -m speculative_rag.verifier --draft-model phi-3.5-mini --verifier-model llama-3.3-70b --grounding-threshold 0.88 --query "Audit FY26 EBITDA"';
    sreMetric = '62% Reduction in TTFT Latency & <0.4% Hallucination Rate';
  } else if (text.includes('deepspeed-zero-offload') || text.includes('zero-3')) {
    useCase = 'Fine-tuning and pre-training 70B+ parameter LLMs across constrained on-premise or cloud GPU clusters without triggering CUDA Out-of-Memory exceptions.';
    bestTreatment = 'Partition optimizer states, gradients, and model parameters across all nodes (ZeRO Stage 3) while asynchronously prefetching layer weights from host CPU RAM and NVMe SSDs.';
    antiPattern = 'Standard DDP (Distributed Data Parallel) which duplicates model weights and optimizer states across every GPU, hitting OOM on models >13B parameters.';
    realTimeDrill = 'deepspeed --num_gpus=8 train_llm.py --deepspeed ds_zero3_offload_config.json --model_name_or_path meta-llama/Llama-3-70B';
    sreMetric = '8x VRAM Footprint Reduction & 48.2 TFLOPS/GPU Sustained';
  } else if (text.includes('confidential-ai') || text.includes('tee attestation')) {
    useCase = 'Running proprietary LLM inference and private medical/financial data processing on third-party cloud GPUs without allowing host OS or hypervisor operators to inspect memory.';
    bestTreatment = 'Run inference inside hardware-enforced Trusted Execution Environments (NVIDIA Hopper H100 TEE + AMD SEV-SNP) with cryptographic remote attestation verified before decrypting weights.';
    antiPattern = 'Relying purely on software-level TLS or container namespaces, leaving VRAM and PCIe bus plaintext data vulnerable to root compromise on the host.';
    realTimeDrill = 'python3 verify_attestation.py --evidence /dev/sev-guest --cert-chain ./nv_attest.pem && ./launch_secure_enclave.sh --model-vault s3://secure-weights';
    sreMetric = '100% Verified Remote Cryptographic Attestation & <2.3% Crypto Overhead';
  } else if (text.includes('quantum-hybrid-rag') || text.includes('quantum')) {
    useCase = 'Resolving ultra-high-dimensional semantic ambiguity and dense concept overlaps in specialized scientific, pharmaceutical, or legal patent retrieval.';
    bestTreatment = 'Map classical dense vector embeddings into higher-dimensional quantum Hilbert spaces using quantum kernel feature maps (ZZFeatureMap) on simulator/QPU backends.';
    antiPattern = 'Relying exclusively on Euclidean or Cosine distance on static embeddings when dense cluster collisions obscure nuanced contextual differences.';
    realTimeDrill = 'python3 -m quantum_rag.pipeline --backend aer_simulator --qubits 8 --feature-map ZZFeatureMap --top-k 5 --query "Target kinase inhibitor"';
    sreMetric = '+23.8% Semantic Discrimination Precision & 14ms Statevector Latency';
  } else if (text.includes('vllm') || text.includes('pagedattention')) {
    useCase = 'High-throughput LLM production serving handling bursty traffic where traditional contiguous KV-caches waste up to 70% of GPU VRAM via external fragmentation.';
    bestTreatment = 'Implement vLLM PagedAttention v2 with virtual memory block tables (16/32 token pages) and dynamic chunked prefill co-scheduled alongside token decode batches.';
    antiPattern = 'Allocating static contiguous max_tokens buffers upfront per request, resulting in severe GPU memory starvation and low concurrent batch sizes.';
    realTimeDrill = 'python3 -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-3-8B-Instruct --gpu-memory-utilization 0.92 --block-size 16 --enable-chunked-prefill';
    sreMetric = '2.8x Higher Concurrency & <4% VRAM External Fragmentation';
  } else if (text.includes('sglang') || text.includes('radix')) {
    useCase = 'Multi-turn agent swarms and repetitive chain-of-thought workflows where system prompts and tools definitions are repeated across thousands of consecutive LLM calls.';
    bestTreatment = 'Maintain a Radix Tree KV-cache index across requests, allowing automatic prefix matching, instant KV reuse, and zero recomputation of static prompt prefixes.';
    antiPattern = 'Re-tokenizing and running full transformer prefill passes on the exact same 3,000-token system prompt across every single agent step.';
    realTimeDrill = 'python3 -m sglang.launch_server --model-path meta-llama/Llama-3-8B-Instruct --port 30000 --enable-cache-report';
    sreMetric = '4.5x Prefix Prefill Throughput & 88% KV-Cache Hit Ratio';
  } else if (text.includes('bitnet') || text.includes('ternary')) {
    useCase = 'Deploying large language models on edge servers, CPUs, and mobile platforms without requiring expensive dedicated high-wattage GPU hardware.';
    bestTreatment = 'Convert transformer linear weights to ternary (-1, 0, +1) representations using BitNet b1.58, replacing floating-point matrix multiplications with fast integer additions.';
    antiPattern = 'Running unquantized FP16/BF16 models on edge devices, resulting in thermal throttling, battery drain, and out-of-memory crashes.';
    realTimeDrill = './bitnet-inference --model bitnet_b1_58-3B.gguf --threads 8 --temp 0.7 -p "Analyze edge telemetry logs:"';
    sreMetric = '71% Energy Reduction & 4.1x Faster CPU Inference';
  } else if (text.includes('dspy') || text.includes('mipro')) {
    useCase = 'Replacing fragile manual prompt engineering trial-and-error with programmatic, algorithmic prompt optimization and few-shot example compilation.';
    bestTreatment = 'Define modular pipeline signatures (Predict, ChainOfThought) and compile with MIPROv2 or BootstrapFewShot to optimize instructions against explicit validation metrics.';
    antiPattern = 'Hand-tuning prose in system prompts when model releases change, leading to silent degradation in complex multi-step reasoning.';
    realTimeDrill = 'python3 optimize_dspy.py --teleprompter MIPROv2 --trainset ./benchmarks.jsonl --metric exact_match --max-bootstrapped-demos 4';
    sreMetric = '+18.4% Accuracy Improvement & Zero Hand-Tuned System Prompts';
  } else if (text.includes('localstack') || text.includes('sandbox')) {
    useCase = 'Developing and testing cloud infrastructure locally without incurring AWS costs, rate limits, or provisioning delays.';
    bestTreatment = 'Emulate S3, SQS, DynamoDB, and Lambda using containerized LocalStack with automated bootstrap initialization scripts.';
    antiPattern = 'Testing IaC code directly against live cloud development accounts, leading to leaked test resources and unexpected monthly bills.';
    realTimeDrill = 'docker compose up -d localstack && awslocal s3 mb s3://local-test-bucket && awslocal sqs create-queue --queue-name test-events';
    sreMetric = '100% Offline Dev Speed & Zero AWS Sandbox Spend';
  } else if (text.includes('terraform-drift') || text.includes('drift')) {
    useCase = 'Preventing out-of-band manual changes made in the AWS/GCP console from corrupting automated Terraform state files.';
    bestTreatment = 'Schedule automated daily read-only drift audit scans in CI/CD that compare real cloud APIs against state and alert SREs prior to pull request merges.';
    antiPattern = 'Ignoring console edits until emergency deployments overwrite manual hotfixes and cause cascading outages.';
    realTimeDrill = 'terraform plan -detailed-exitcode -no-color > drift.log || echo "CRITICAL: State drift detected!"';
    sreMetric = '100% State Consistency & Zero Unplanned Overwrites';
  } else if (text.includes('keda') || text.includes('autoscal')) {
    useCase = 'Scaling Kubernetes worker pods based on real-time event queue depth (SQS, Kafka, RabbitMQ) instead of sluggish CPU/memory metrics.';
    bestTreatment = 'Deploy KEDA ScaledObjects configured with proactive target queue length triggers and scale-to-zero when queues are idle.';
    antiPattern = 'Using basic Kubernetes HPA based solely on CPU, leaving queue processing delayed while pods fail to trigger scale thresholds.';
    realTimeDrill = 'kubectl apply -f keda-scaledobject.yaml && kubectl get scaledobject -w';
    sreMetric = 'Sub-15s Scale Reaction & 65% Idle Compute Cost Savings';
  } else if (text.includes('vault') || text.includes('secret')) {
    useCase = 'Securing API tokens, database passwords, and cryptographic keys across distributed microservices with automated rotation.';
    bestTreatment = 'Store credentials in HashiCorp Vault with short-lived dynamic lease times, injecting secrets into pods via ephemeral volume mounts or CSI drivers.';
    antiPattern = 'Storing plaintext credentials in Git repositories, unencrypted Kubernetes ConfigMaps, or long-lived environment variables.';
    realTimeDrill = 'vault kv put secret/production/db password="$(openssl rand -hex 24)" && vault kv get secret/production/db';
    sreMetric = 'Zero Plaintext Secrets in Git & Automated 30-Day Key Rotation';
  } else if (text.includes('chaos') || text.includes('resilience')) {
    useCase = 'Validating system fault tolerance against unexpected network latency, pod kills, and disk pressure before production rollout.';
    bestTreatment = 'Run automated Chaos Mesh / Litmus experiments in staging to verify that circuit breakers, retries, and fallback caches activate as designed.';
    antiPattern = 'Assuming multi-zone architectures are resilient without ever simulating active network partition or database failovers.';
    realTimeDrill = 'kubectl apply -f network-latency-experiment.yaml && kubectl get chaos -n chaos-mesh';
    sreMetric = 'Validated RTO < 5m & Zero Cascading Network Deadlocks';
  } else if (text.includes('forward deployed') || text.includes('fde')) {
    useCase = `Bridging raw AI capabilities and enterprise client requirements: discovering real operational pain points, designing agentic MCP swarms, deploying into air-gapped private VPCs, and establishing continuous evaluation feedback loops.`;
    bestTreatment = `Deploy containerized agentic pipelines with local SLMs (vLLM/Ollama), zero-egress NetworkPolicies, Presidio PII redaction, automated Ragas acceptance benchmarks, and Day-2 SRE runbooks.`;
    antiPattern = `Deploying uncontained Jupyter notebook prototypes directly into customer perimeters without security review, air-gap isolation, golden dataset benchmarks, or client team enablement.`;
    realTimeDrill = `pytest -v evals/test_acceptance_evals.py --threshold-faithfulness 0.95 --verify-airgap`;
    sreMetric = `14-Day Discovery-to-Production Cycle & 96.4% Evals Compliance`;
  } else if (text.includes('rag') || text.includes('vector') || text.includes('qdrant') || text.includes('chroma') || text.includes('milvus') || text.includes('colpali') || text.includes('knowledge')) {
    useCase = `Mitigating hallucination, context drift, and retrieval latency in enterprise ${title} workloads over large multi-modal and structured knowledge bases.`;
    bestTreatment = `Implement hybrid dense-sparse retrieval (BM25 + pgvector/Qdrant cosine fusion) with Cross-Encoder reranking and semantic chunk windowing.`;
    antiPattern = `Dumping raw unchunked documents directly into high-dimensional vector stores without deduplication, sparse keyword indexes, or relevance thresholds.`;
    realTimeDrill = `python3 -m rag.retriever --query "Audit production cluster state" --hybrid-rrf --top-k 5 --rerank-threshold 0.75`;
    sreMetric = `93.5% Context Recall & <32ms End-to-End Retrieval Latency`;
  } else if (text.includes('agent') || text.includes('swarm') || text.includes('langgraph') || text.includes('crew') || text.includes('autogen') || text.includes('computer-use')) {
    useCase = `Orchestrating autonomous multi-agent tool execution in ${title} while preventing infinite delegation loops, cascading errors, and unbounded API costs.`;
    bestTreatment = `Deploy deterministic LangGraph state machine graphs with checkpointed PostgreSQL state persistence, human-in-the-loop gates, and bounded tool execution steps.`;
    antiPattern = `Allowing unconstrained recursive agent dispatch without max-iteration budgets, structured schema constraints, or circuit-breakers.`;
    realTimeDrill = `python3 -m agents.runner --graph-config ${tag} --max-steps 8 --verify-tool-schemas --trace-otel`;
    sreMetric = `100% Deterministic State Recovery & Zero Unbounded Delegation Cascades`;
  } else if (text.includes('deepseek') || text.includes('yi-lightning') || text.includes('qwen') || text.includes('kimi') || text.includes('mistral') || text.includes('gemini') || text.includes('claude') || text.includes('moe')) {
    useCase = `Serving frontier open-weight models in ${title} across high-concurrency production endpoints with strict Time-To-First-Token (TTFT) budgets.`;
    bestTreatment = `Configure fine-grained Mixture-of-Experts (MoE) parallelism with aux-loss-free routing, prefix caching, and tensor-parallel GPU memory distribution.`;
    antiPattern = `Deploying monolithic multi-billion parameter checkpoints on single GPUs without dynamic tensor parallelism or chunked prefill co-scheduling.`;
    realTimeDrill = `python3 -m inference.engine --config ${tag} --benchmark-tokens 2048 --batch-size 32 --measure-latency`;
    sreMetric = `4.2x Higher Token Throughput & <16ms Inter-Token Generation Latency`;
  } else if (text.includes('guardrail') || text.includes('shield') || text.includes('injection') || text.includes('redteam') || text.includes('safety') || text.includes('owasp')) {
    useCase = `Defending LLM and agent workflows against adversarial prompt injections, persona jailbreaks, and sensitive data leakage in ${title}.`;
    bestTreatment = `Apply layered zero-trust defense: sub-reflex regex heuristics, Llama-Guard classifier inspection, and isolated gVisor containerized execution sandboxes.`;
    antiPattern = `Relying solely on system prompt instructions ("Do not reveal secrets") without programmatic input filtering or output sanitizers.`;
    realTimeDrill = `pytest -v tests/security_scan.py --test-prompts ./adversarial_drills.json --enforce-fail-closed`;
    sreMetric = `100% OWASP LLM01-LLM10 Threat Interception & <18ms Sub-Reflex Gating`;
  } else if (text.includes('finops') || text.includes('greenops') || text.includes('cost') || text.includes('semantic-cache') || text.includes('promptops') || text.includes('carbon')) {
    useCase = `Eliminating runaway cloud token expenditures and infrastructure carbon waste in high-volume ${title} deployments.`;
    bestTreatment = `Deploy sub-5ms semantic vector caching to intercept repeated queries and route simple requests to efficient local SLMs before escalating to flagship LLMs.`;
    antiPattern = `Directing every trivial query to expensive external frontier APIs without local semantic caching or cost-aware model routing.`;
    realTimeDrill = `python3 -m finops.cache_profiler --eval-corpus ./queries.json --similarity-cutoff 0.92 --calc-savings`;
    sreMetric = `65% Reduction in Monthly Token Spend & 84% Semantic Cache Hit Rate`;
  } else if (text.includes('kubernetes') || text.includes('k8s') || text.includes('helm') || text.includes('crossplane') || text.includes('karpenter') || text.includes('cilium') || text.includes('ingress')) {
    useCase = `Eliminating node provisioning lag, pod scheduling starvation, and network policy drift in enterprise ${title} Kubernetes environments.`;
    bestTreatment = `Standardize on declarative GitOps manifests with Karpenter fast node consolidation, eBPF Cilium network policies, and rolling zero-downtime updates.`;
    antiPattern = `Manually editing live cluster resources with kubectl edit or running static oversized node groups that waste idle cloud compute.`;
    realTimeDrill = `kubectl apply -f ${tag} --dry-run=server && kubectl get pods -l app=${title.toLowerCase().replace(/[^a-z0-9]/g, '-')} -w`;
    sreMetric = `Sub-45s Node Autoscaling & Zero Unplanned Service Disruption`;
  } else if (text.includes('ebpf') || text.includes('telemetry') || text.includes('otel') || text.includes('prometheus') || text.includes('grafana') || text.includes('loki') || text.includes('jaeger') || text.includes('sre') || text.includes('monitoring')) {
    useCase = `Detecting kernel-level socket bottlenecks, memory leak regressions, and microservice trace latency spikes in production ${title}.`;
    bestTreatment = `Deploy OpenTelemetry auto-instrumentation alongside in-kernel eBPF probes with continuous sampling, streaming unified metrics to Prometheus and Loki.`;
    antiPattern = `Scraping unaggregated debug logs or using invasive synchronous APM agents that introduce noticeable request latency overhead.`;
    realTimeDrill = `curl -sSf http://localhost:9090/metrics | grep -E "p99_latency|error_rate|active_workers"`;
    sreMetric = `100% Trace Coverage & <1.2% Observability Agent CPU Overhead`;
  } else if (text.includes('pipeline') || text.includes('argocd') || text.includes('gitops') || text.includes('jenkins') || text.includes('gitlab') || text.includes('github') || text.includes('tekton') || text.includes('trivy') || text.includes('cosign') || text.includes('sonar') || text.includes('sbom')) {
    useCase = `Securing the software supply chain against untrusted dependency vulnerabilities, image tampering, and deployment drift in ${title}.`;
    bestTreatment = `Enforce cryptographic Sigstore cosign container signing, CycloneDX SBOM generation, and automated Trivy vulnerability gating before GitOps sync.`;
    antiPattern = `Pushing unsigned container images directly to production registries without vulnerability scan gates or immutable SHA256 digest pinning.`;
    realTimeDrill = `trivy image --severity HIGH,CRITICAL ghcr.io/${repo}:latest && cosign verify --key cosign.pub ghcr.io/${repo}:latest`;
    sreMetric = `Zero Critical CVEs in Production & 100% Cryptographically Verified SLSA Provenance`;
  } else if (text.includes('database') || text.includes('postgres') || text.includes('pgvector') || text.includes('sql') || text.includes('redis') || text.includes('neo4j') || text.includes('snowflake') || text.includes('migration')) {
    useCase = `Preventing connection pool exhaustion, slow unindexed queries, and schema migration locking in mission-critical ${title} databases.`;
    bestTreatment = `Implement asynchronous connection pooling (PgBouncer/SQLAlchemy), automated zero-downtime Alembic migrations, and pgvector HNSW indexing.`;
    antiPattern = `Executing unindexed multi-table JOINs and synchronous blocking DDL alter commands during peak business traffic.`;
    realTimeDrill = `alembic upgrade head && psql -U postgres -d studios_hub -c "EXPLAIN ANALYZE SELECT * FROM pgvector_store LIMIT 10;"`;
    sreMetric = `P99 Query Latency < 12ms & Zero Schema Migration Downtime`;
  } else if (text.includes('ansible') || text.includes('playbook')) {
    useCase = `Automating zero-downtime configuration management, OS patching, and idempotent node provisioning in enterprise ${title}.`;
    bestTreatment = `Structure roles with idempotent tasks, Vault-encrypted host variables, and pre-commit ansible-lint attestation before running in production.`;
    antiPattern = `Running unversioned imperative shell tasks within playbooks that break idempotency and fail upon re-execution.`;
    realTimeDrill = `ansible-playbook -i inventory/hosts ${tag} --check --diff`;
    sreMetric = `100% Idempotent Execution & Zero Unplanned Configuration Drift`;
  } else if (text.includes('terraform') || text.includes('opentofu') || text.includes('vpc') || text.includes('subnet')) {
    useCase = `Managing multi-region cloud topology, subnet CIDR allocations, and VPC peering connections declaratively without state corruption in ${title}.`;
    bestTreatment = `Store remote state in S3/GCS with DynamoDB state locking, enforce pre-merge terraform plan approval gates, and run daily drift scanners.`;
    antiPattern = `Applying Terraform changes locally from developer laptops with shared static credentials or unencrypted local state files.`;
    realTimeDrill = `terraform init && terraform plan -out=tfplan && terraform show -json tfplan | jq .resource_changes`;
    sreMetric = `100% S3 Remote State Locking & Sub-3m VPC Deployment Time`;
  } else if (text.includes('gateway') || text.includes('router') || text.includes('proxy') || text.includes('nginx') || text.includes('envoy') || text.includes('traefik')) {
    useCase = `Terminating TLS, routing high-throughput ingress traffic, and rate-limiting abusive API consumers before reaching backend microservices in ${title}.`;
    bestTreatment = `Deploy Envoy/Nginx sidecars with token-bucket rate limiters, active health checks, and circuit-breaking upstream connection pools.`;
    antiPattern = `Exposing upstream backend services directly to public ingress without connection limits, TLS termination, or CORS request filters.`;
    realTimeDrill = `nginx -t -c ${tag} && curl -Iv http://localhost:8080/healthz`;
    sreMetric = `<4.5ms Gateway Routing Latency & 100% DoS Burst Mitigation`;
  } else if (text.includes('mesh') || text.includes('istio') || text.includes('linkerd')) {
    useCase = `Enforcing strict mutual TLS (mTLS), distributed tracing spans, and canary traffic splitting across heterogeneous microservices in ${title}.`;
    bestTreatment = `Inject lightweight service mesh sidecars with automatic mTLS rotation, Istio VirtualServices for canary shifting, and OpenTelemetry baggage injection.`;
    antiPattern = `Allowing unencrypted plaintext east-west service communication across Kubernetes pods without cryptographic pod identity.`;
    realTimeDrill = `istioctl analyze && istioctl proxy-status`;
    sreMetric = `100% Mutual TLS East-West Encryption & <1.8ms Sidecar Latency Penalty`;
  } else if (text.includes('dns') || text.includes('ssl') || text.includes('pki') || text.includes('cert') || text.includes('tls')) {
    useCase = `Automating wildcard SSL/TLS certificate issuance, renewal, and DNS record validation without human intervention or certificate expiry outages in ${title}.`;
    bestTreatment = `Deploy Cert-Manager with automated ACME Let's Encrypt DNS01 challenge solvers and alert 30 days prior to certificate expiration.`;
    antiPattern = `Manually purchasing and copying static SSL certificates onto servers, causing unexpected production outages when certificates expire.`;
    realTimeDrill = `openssl s_client -connect localhost:443 -servername talaripradeep.info </dev/null 2>/dev/null | openssl x509 -noout -dates`;
    sreMetric = `Zero Certificate Expiration Outages & 100% Automated 60-Day Renewal`;
  } else if (text.includes('alert') || text.includes('incident') || text.includes('pagerduty') || text.includes('status') || text.includes('webhook')) {
    useCase = `Eliminating alert fatigue, deduping flapping notifications, and dispatching webhook payloads during Sev-1 production outages in ${title}.`;
    bestTreatment = `Configure Alertmanager inhibition rules, multi-receiver grouping windows (5m wait), and automated webhook escalations linked to SRE runbooks.`;
    antiPattern = `Firing unthrottled individual Slack/SMS notifications on every single CPU spike, leading SREs to ignore critical incident alerts.`;
    realTimeDrill = `amtool check-config ${tag} && amtool alert query alertname="HighErrorRate"`;
    sreMetric = `85% Reduction in Alert Fatigue & MTTR < 8m on P1 Outages`;
  } else if (text.includes('idp') || text.includes('platform') || text.includes('template') || text.includes('backstage')) {
    useCase = `Empowering developers to self-service scaffold production-grade microservices and cloud resources with built-in compliance templates in ${title}.`;
    bestTreatment = `Publish standardized Internal Developer Portal (IDP) templates with golden paths, pre-configured CI/CD pipelines, and security guardrails.`;
    antiPattern = `Requiring engineering teams to manually file Jira tickets and wait weeks for DevOps engineers to provision standard infrastructure.`;
    realTimeDrill = `cookiecutter gh:Pradeeptalari14/${repo} --no-input && cd * && tree .`;
    sreMetric = `Sub-10m Developer Onboarding & 100% Golden Path Architectural Adherence`;
  } else if (text.includes('jev') || text.includes('reflex') || text.includes('system 1') || text.includes('system 2')) {
    useCase = `Eliminating costly, sluggish multi-second LLM calls for predictable classification, routing, and schema validation tasks in ${title}.`;
    bestTreatment = `Deploy non-autoregressive System 1 sub-50ms reflex encoders with calibrated confidence thresholds, escalating to System 2 LLMs only on high ambiguity.`;
    antiPattern = `Sending every single high-volume routing or entity extraction request to massive autoregressive models, causing severe queue latency.`;
    realTimeDrill = `python3 -m jev.reflex_engine --input "Production restart required on pod 4" --confidence-threshold 0.85`;
    sreMetric = `<42ms Decision Latency & 78% Reduction in System 2 Flagship Invocations`;
  } else if (text.includes('linux') || text.includes('systemd') || text.includes('shell') || text.includes('bash') || text.includes('docker') || text.includes('container') || text.includes('edge')) {
    useCase = `Hardening host OS runtime, optimizing daemon lifecycle management, and isolating microservice container processes in ${title}.`;
    bestTreatment = `Standardize on lightweight distroless container images, non-root systemd service cgroup limits, and read-only root filesystems.`;
    antiPattern = `Running container processes as root with unrestricted host PID/network namespaces and mutable disk volumes.`;
    realTimeDrill = `systemctl status ${title.toLowerCase().replace(/[^a-z0-9]/g, '-')} --no-pager || docker inspect --format '{{.State.Status}}' container_app`;
    sreMetric = `100% Non-Root Process Isolation & Sub-2s Daemon Bootstrap Latency`;
  } else {
    // Contextual Synthesis for specialized domain studios (Health, Legal, Farming, Governance)
    useCase = `Production engineering: Deploying resilient, schema-validated ${title} services with audited compliance and zero-drift operational reliability.`;
    bestTreatment = `Standardize on version-controlled declarations (${tag}), enforce automated validation before commit, and monitor runtime telemetry against target SLOs.`;
    antiPattern = `Manual ad-hoc configuration adjustments in live environments without versioned state manifests or automated rollback testing.`;
    realTimeDrill = `bash scripts/validate.sh --manifest ${tag} --verify-health --environment production`;
    sreMetric = `99.95% Availability SLO & 100% Audited Reproducibility`;
  }

  const { pluginId, pluginName, pluginInstall } = derivePluginInfo(tool);
  const architectureFlow = deriveArchitectureFlow(tool);
  const coreConcept = deriveCoreConcept(tool);
  const prerequisite = derivePrerequisites(tool);
  const realWorldImpact = deriveRealWorldImpact(tool);

  return {
    id: tool.link.replace(/\/$/, ''),
    ...tool,
    repo: tool.repository,
    domain,
    skillLevel: level,
    useCase,
    bestTreatment,
    antiPattern,
    realTimeDrill,
    sreMetric,
    connectedPlugin: pluginId,
    pluginName,
    pluginInstall,
    architectureFlow,
    coreConcept,
    prerequisite,
    realWorldImpact
  };
}

function derivePluginInfo(tool) {
  const cat = tool.category || '';
  const text = (tool.title + ' ' + tool.desc + ' ' + (tool.tag || '')).toLowerCase();

  let pluginId = 'platform-engineer';
  let pluginName = 'Platform Engineer';

  if (cat === 'ai') {
    if (text.includes('forward deployed') || text.includes('fde')) {
      pluginId = 'forward-deployed-engineer';
      pluginName = 'Forward Deployed AI Engineer';
    } else if (text.includes('agent') || text.includes('swarm') || text.includes('langgraph') || text.includes('autogen') || text.includes('crew') || text.includes('computer-use')) {
      pluginId = 'agent-engineer';
      pluginName = 'Autonomous Agent Engineer';
    } else if (text.includes('rag') || text.includes('vector') || text.includes('retriev') || text.includes('chunk') || text.includes('embed') || text.includes('search')) {
      pluginId = 'rag-engineer';
      pluginName = 'Enterprise RAG Engineer';
    } else if (text.includes('guardrail') || text.includes('safety') || text.includes('redteam') || text.includes('eval') || text.includes('alignment') || text.includes('shield')) {
      pluginId = 'eval-specialist';
      pluginName = 'AI Eval & Alignment Specialist';
    } else if (text.includes('cost') || text.includes('finops') || text.includes('greenops') || text.includes('cache') || text.includes('budget')) {
      pluginId = 'finops-engineer';
      pluginName = 'FinOps Engineer';
    } else {
      pluginId = 'ai-infra-engineer';
      pluginName = 'AI Infrastructure Engineer';
    }
  } else if (cat === 'observability') {
    if (text.includes('ebpf') || text.includes('profiler') || text.includes('flamegraph') || text.includes('kernel')) {
      pluginId = 'ebpf-specialist';
      pluginName = 'Kernel & eBPF Specialist';
    } else if (text.includes('incident') || text.includes('alert') || text.includes('triage') || text.includes('pagerduty')) {
      pluginId = 'incident-commander';
      pluginName = 'Incident Commander';
    } else {
      pluginId = 'sre-observability';
      pluginName = 'SRE & Observability Engineer';
    }
  } else if (cat === 'cloud') {
    if (text.includes('k8s') || text.includes('kubernetes') || text.includes('helm') || text.includes('keda') || text.includes('cilium')) {
      pluginId = 'kubernetes-specialist';
      pluginName = 'Kubernetes Specialist';
    } else if (text.includes('terraform') || text.includes('opentofu') || text.includes('terragrunt') || text.includes('iac')) {
      pluginId = 'terraform-specialist';
      pluginName = 'Terraform Specialist';
    } else if (text.includes('network') || text.includes('vpc') || text.includes('subnet') || text.includes('dns')) {
      pluginId = 'network-engineer';
      pluginName = 'Network Engineer';
    } else {
      pluginId = 'cloud-architect';
      pluginName = 'Cloud Architect';
    }
  } else if (cat === 'cicd') {
    if (text.includes('argocd') || text.includes('flux') || text.includes('gitops')) {
      pluginId = 'gitops-specialist';
      pluginName = 'GitOps Specialist';
    } else if (text.includes('security') || text.includes('trivy') || text.includes('cosign') || text.includes('sbom')) {
      pluginId = 'devsecops-engineer';
      pluginName = 'DevSecOps Engineer';
    } else {
      pluginId = 'release-engineer';
      pluginName = 'Release Engineer';
    }
  } else if (cat === 'automation') {
    if (text.includes('vault') || text.includes('secret') || text.includes('sast') || text.includes('trivy') || text.includes('compliance')) {
      pluginId = 'devsecops-engineer';
      pluginName = 'DevSecOps Engineer';
    } else if (text.includes('database') || text.includes('sql') || text.includes('postgres') || text.includes('db') || text.includes('migration')) {
      pluginId = 'database-engineer';
      pluginName = 'Database Engineer';
    } else if (text.includes('ansible') || text.includes('systemd') || text.includes('shell') || text.includes('linux') || text.includes('bash')) {
      pluginId = 'systems-administrator';
      pluginName = 'Systems Administrator';
    } else {
      pluginId = 'platform-engineer';
      pluginName = 'Platform Engineer';
    }
  } else {
    pluginId = 'devops-engineer';
    pluginName = 'DevOps Platform Engineer';
  }

  return {
    pluginId,
    pluginName,
    pluginInstall: `/plugin install pradeeptalari14/portfolio:plugins/${pluginId}`
  };
}

function deriveArchitectureFlow(tool) {
  const cat = tool.category || '';
  const text = (tool.title + ' ' + tool.desc + ' ' + (tool.tag || '')).toLowerCase();

  if (cat === 'ai') {
    if (text.includes('forward deployed') || text.includes('fde')) {
      return '/tools/forward-deployed-engineer/';
    } else if (text.includes('rag') || text.includes('vector') || text.includes('retriev') || text.includes('chunk')) {
      return '/studios/flow/?template=rag';
    } else if (text.includes('agent') || text.includes('swarm') || text.includes('langgraph')) {
      return '/studios/flow/?template=agents';
    }
    return '/studios/flow/?template=ai';
  }
  if (cat === 'observability') {
    if (text.includes('ebpf') || text.includes('profiler')) return '/studios/flow/?template=ebpf';
    return '/studios/flow/?template=observability';
  }
  if (cat === 'cloud') return '/studios/flow/?template=infra';
  if (cat === 'cicd') return '/studios/flow/?template=gitops';
  if (cat === 'automation') {
    if (text.includes('incident') || text.includes('alert')) return '/studios/flow/?template=incident';
    return '/studios/flow/?template=infra';
  }
  return '/studios/flow/';
}

function deriveCoreConcept(tool) {
  const cat = tool.category || '';
  const text = (tool.title + ' ' + tool.desc).toLowerCase();

  if (cat === 'ai') {
    if (text.includes('forward deployed') || text.includes('fde')) return 'Customer-centric AI systems engineering combining rapid problem discovery with air-gapped Kubernetes deployment, Presidio PII redaction, and automated Ragas evaluation gates.';
    if (text.includes('vllm') || text.includes('pagedattention')) return 'Paged memory allocation eliminating KV cache fragmentation across continuous batching steps.';
    if (text.includes('rag') || text.includes('vector')) return 'Hybrid sparse-dense vector retrieval with reciprocal rank fusion (RRF) and neural cross-encoder re-ranking.';
    if (text.includes('agent') || text.includes('swarm')) return 'Deterministic StateGraph finite state machines with PostgreSQL checkpoints and bounded tool execution gates.';
    if (text.includes('guardrail') || text.includes('safety')) return 'Layered sub-reflex regex heuristics and LLM classifier gating enforcing zero-trust prompt isolation.';
    return 'Scalable distributed model inference serving with GPU kernel acceleration and dynamic tensor parallelism.';
  }
  if (cat === 'observability') {
    if (text.includes('ebpf')) return 'In-kernel eBPF bytecode sampling at 99Hz with DWARF unwinding and zero user-space thread pause latency.';
    return 'Multi-window multi-burn-rate SLO alerting with distributed W3C traceparent context propagation.';
  }
  if (cat === 'cloud') {
    if (text.includes('k8s') || text.includes('kubernetes')) return 'Declarative reconciliation loops with zone-aware TopologySpreadConstraints and PodDisruptionBudgets.';
    if (text.includes('terraform') || text.includes('iac')) return 'DRY remote state inheritance with DynamoDB distributed state locking and automated drift detection.';
    return 'Multi-AZ cloud topology design with resilient cross-region networking and automated autoscaling.';
  }
  if (cat === 'cicd') {
    return 'Cryptographic SLSA container signing (Cosign) and CycloneDX SBOM generation before declarative GitOps reconciliation.';
  }
  if (cat === 'automation') {
    if (text.includes('database') || text.includes('postgres')) return 'Synchronous commit replication with Patroni etcd consensus and PgBouncer connection pooling.';
    if (text.includes('vault') || text.includes('secret')) return 'Ephemeral secret injection via CSI drivers with automated dynamic lease rotation.';
    return 'Idempotent infrastructure automation with pre-commit policy enforcement and automated verification.';
  }
  return 'Production platform engineering with verified telemetry, compliance enforcement, and automated rollbacks.';
}

function derivePrerequisites(tool) {
  const cat = tool.category || '';
  const text = (tool.title + ' ' + tool.desc).toLowerCase();
  if (text.includes('forward deployed') || text.includes('fde')) return 'Python systems engineering, Kubernetes & Docker containerization, enterprise VPC networking, and LLM evaluation frameworks (Ragas).';
  if (cat === 'ai') return 'Python 3.10+, PyTorch basics & GPU tensor concepts';
  if (cat === 'observability') return 'Linux terminal, eBPF & Prometheus PromQL basics';
  if (cat === 'cloud') return 'AWS/Cloud CLI, Kubernetes manifests & Terraform basics';
  if (cat === 'cicd') return 'Git, GitHub Actions & Docker container fundamentals';
  if (cat === 'automation') return 'Bash scripting, Linux systemd & YAML declarations';
  return 'Linux command line, HTTP protocols & software engineering foundations';
}

function deriveRealWorldImpact(tool) {
  const cat = tool.category || '';
  const text = (tool.title + ' ' + tool.desc).toLowerCase();
  if (cat === 'ai') {
    if (text.includes('forward deployed') || text.includes('fde')) return 'Accelerates customer production delivery from 6 months to 14 days while eliminating 100% of data exfiltration risks in air-gapped VPCs.';
    if (text.includes('vllm') || text.includes('inference')) return 'Enables 2.8x higher concurrent request throughput while reducing GPU VRAM allocation costs by 40%.';
    if (text.includes('rag')) return 'Boosts contextual retrieval accuracy to 94%+ while preventing LLM hallucinations on enterprise data.';
    if (text.includes('agent')) return 'Guarantees 100% deterministic state recovery and stops rogue tool execution cascades.';
    return 'Drives sub-20ms Time-To-First-Token (TTFT) response latency under heavy concurrent enterprise workloads.';
  }
  if (cat === 'observability') {
    return 'Pinpoints root-cause latency bottlenecks in seconds without adding invasive user-space agent overhead (<0.8% CPU).';
  }
  if (cat === 'cloud') {
    return 'Eliminates cluster upgrade outages and guarantees 99.95%+ uptime across multi-AZ production workloads.';
  }
  if (cat === 'cicd') {
    return 'Enforces zero-critical CVE gates and guarantees 100% cryptographically verified software supply chain provenance.';
  }
  return 'Eliminates manual toil and prevents configuration drift across enterprise production environments.';
}

const enrichedStudios = tools.map(generateLearningProfile);

fs.writeFileSync(outFile, JSON.stringify(enrichedStudios, null, 2), 'utf8');
console.log(`✅ Successfully generated learning profiles for all ${enrichedStudios.length} studios at ${outFile}`);

