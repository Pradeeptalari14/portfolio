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
    if (text.includes('kernel') || text.includes('quantum') || text.includes('tee') || text.includes('deepspeed') || text.includes('vllm') || text.includes('sglang') || text.includes('tensorrt') || text.includes('bitnet') || text.includes('speculative')) {
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
  } else {
    // Intelligent contextual synthesis for all other studios
    const actionVerb = cat === 'ai' ? 'Tune and orchestrate' : cat === 'observability' ? 'Monitor and diagnose' : cat === 'cloud' ? 'Provision and scale' : cat === 'cicd' ? 'Automate and verify' : 'Scaffold and harden';

    useCase = `Production ${cat.toUpperCase()} engineering: ${actionVerb} enterprise ${title} workloads with zero-drift reproducibility and audited reliability.`;
    bestTreatment = `Standardize on version-controlled declarations (${tag}), enforce automated validation before commit, and monitor runtime telemetry against target SLOs.`;
    antiPattern = `Manually configuring instances or parameters in ad-hoc consoles without version-controlled state manifests and rollback testing.`;
    realTimeDrill = `git clone https://github.com/${repo}.git && cd $(basename "${repo}") && bash scripts/validate.sh`;
    sreMetric = `100% Infrastructure-as-Code Compliance & Audited Reproducibility`;
  }

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
    sreMetric
  };
}

const enrichedStudios = tools.map(generateLearningProfile);

fs.writeFileSync(outFile, JSON.stringify(enrichedStudios, null, 2), 'utf8');
console.log(`✅ Successfully generated learning profiles for all ${enrichedStudios.length} studios at ${outFile}`);
