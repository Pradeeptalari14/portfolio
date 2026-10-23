'use strict';
/**
 * Engineer role definitions — AI & Data group.
 */
module.exports = [
  {
    id: 'mlops',
    plugin: 'mlops-engineer',
    title: 'MLOps Engineer',
    group: 'AI & Data',
    icon: '🧪',
    summary: 'Reproducible training pipelines, model registry, deployment gates and drift monitoring.',
    tools: ['MLflow', 'Kubeflow', 'DVC', 'KServe', 'Evidently'],
    studioLink: '/tools/mlflow/',
    studioName: 'MLflow Tracking & Model Registry Studio',
    learnLink: '/studios/learn/?studio=mlflow',
    learnTopic: 'Kubeflow Pipelines & Drift Detection',
    flowLink: '/studios/flow/?template=rag',
    flowName: 'ML Pipeline & Model Registry',
    projectRepo: 'Pradeeptalari14/tp-mlflow',
    realWorldScenario: 'Automated Model Retraining: Detects statistical covariate shift in fraud detection model; triggers Kubeflow pipeline for retraining and canary deployment.',
    businessGain: 'Reduces model degradation detection time from 2 weeks to 15 minutes; protects against fraudulent transactions.',
    skills: [
      {
        name: 'ml-pipeline-design',
        description: "Design reproducible training and deployment pipelines for machine learning. Trigger with 'ML pipeline', 'model registry', 'reproducible training', 'promote a model' or 'retraining'.",
        when: ['Models are trained from notebooks with no lineage', 'Promotion to production is manual and undocumented'],
        steps: [
          'Version everything: code, data snapshot or hash, feature definitions, hyperparameters and environment image.',
          'Split the pipeline into validate data, train, evaluate, register and deploy stages with explicit artifacts between them.',
          'Log metrics, parameters and artifacts to an experiment tracker and register candidate models with lineage.',
          'Gate promotion on evaluation against a champion model, fairness and latency checks.',
          'Deploy behind a canary or shadow stage and keep the previous model ready for rollback.'
        ],
        checks: [
          'Any registered model can be reproduced from its recorded inputs',
          'Training and serving use the same feature logic',
          'Promotion requires passing automated evaluation, not a manual flag',
          'Model cards record intended use and known limits'
        ],
        output: [
          '## ML Pipeline: [Model]',
          '| Stage | Input | Output | Gate |',
          '|-------|-------|--------|------|',
          '| Validate | raw data | clean data | schema and drift checks |',
          '',
          '**Registry policy:** [stages and approvers]',
          '**Rollback:** [mechanism]'
        ],
        pitfalls: [
          'Training-serving skew caused by duplicated feature code.',
          'Evaluating only on aggregate metrics while a key segment regresses.',
          'Overwriting the dataset in place and losing reproducibility.'
        ]
      },
      {
        name: 'model-monitoring',
        description: "Monitor deployed models for data drift, concept drift and performance decay. Trigger with 'model drift', 'monitor the model', 'accuracy dropped in production' or 'when to retrain'.",
        when: ['Ground truth arrives late', 'Business metrics moved but model metrics look fine'],
        steps: [
          'Track service health first: latency, errors, throughput and resource use.',
          'Monitor input drift per feature with population stability index or distribution tests, against a reference window.',
          'Monitor prediction drift and, when labels arrive, quality metrics with delay handled explicitly.',
          'Define alert thresholds and a retraining trigger based on drift plus quality, not drift alone.',
          'Keep an audit log of predictions and model version for debugging and compliance.'
        ],
        checks: [
          'Reference data is versioned alongside the model',
          'Thresholds are tuned to avoid constant false alarms',
          'Retraining is automated but promotion remains gated',
          'Segment-level performance is visible'
        ],
        output: [
          '## Model Monitoring: [Model]',
          '| Signal | Method | Threshold | Action |',
          '|--------|--------|-----------|--------|',
          '| Feature drift | PSI | > 0.2 | investigate |',
          '',
          '**Retrain trigger:** [rule]'
        ],
        pitfalls: [
          'Treating any drift as an error when it is seasonal.',
          'Waiting for labels that never arrive instead of using proxies.',
          'Retraining automatically on corrupted data.'
        ]
      }
    ],
    commands: [
      {
        name: 'pipeline-blueprint',
        description: 'Generate an end-to-end ML pipeline blueprint for a use case',
        hint: '<model type, data source and serving target>',
        steps: [
          'Confirm data sources, training cadence and serving latency.',
          'Lay out stages, artifacts and gates.',
          'Choose tooling for tracking, registry and serving.',
          'Provide a rollout and rollback plan.'
        ],
        output: 'A stage-by-stage blueprint with tools, gates and rollout plan.'
      },
      {
        name: 'drift-report',
        description: 'Analyse reference and current data summaries for drift and recommend actions',
        hint: '<feature statistics or sample descriptions for both windows>',
        steps: [
          'Compare feature distributions between windows.',
          'Score drift per feature and rank them.',
          'Explain likely causes such as upstream change or seasonality.',
          'Recommend investigate, retrain or ignore.'
        ],
        output: 'A ranked drift table and a recommended action.'
      }
    ]
  },
  {
    id: 'llmops',
    plugin: 'llmops-engineer',
    title: 'LLMOps Engineer',
    group: 'AI & Data',
    icon: '🧠',
    summary: 'Prompt versioning, evaluation harnesses, guardrails, gateways and LLM cost control.',
    tools: ['LangSmith', 'Langfuse', 'LiteLLM', 'Promptfoo', 'Guardrails'],
    studioLink: '/tools/llm-tracing/',
    studioName: 'LLM Tracing & Langfuse Studio',
    learnLink: '/studios/learn/?studio=llm-tracing',
    learnTopic: 'Anthropic Prompt Caching & TTFT Optimization',
    flowLink: '/studios/flow/?template=rag',
    flowName: 'LLM Gateway & Prompt Caching',
    projectRepo: 'Pradeeptalari14/tp-llm-tracing',
    realWorldScenario: 'Prompt Caching & Cost Reduction: Implements Anthropic prompt caching headers across customer support agents with 80k token system prompts.',
    businessGain: '82% reduction in recurring LLM API costs; decreases Time-to-First-Token (TTFT) from 1.8s to 320ms.',
    skills: [
      {
        name: 'llm-evaluation-harness',
        description: "Build an offline and online evaluation system for LLM features. Trigger with 'evaluate the prompt', 'LLM evals', 'regression tests for prompts', 'LLM as judge' or 'is the new model better'.",
        when: ['Prompt or model changes are shipped on intuition', 'Quality complaints cannot be reproduced'],
        steps: [
          'Collect a golden dataset from real traffic with expected outputs or rubrics, covering common cases, edge cases and known failures.',
          'Define metrics per task: exact match or schema validity for structured output, groundedness for RAG, rubric scores for open-ended text.',
          'Use LLM-as-judge with a fixed rubric, calibrate it against human labels and track agreement.',
          'Run the suite in CI on every prompt, model or retrieval change and block regressions beyond a tolerance.',
          'Sample production traces for online evaluation and feed failures back into the golden set.'
        ],
        checks: [
          'The judge model differs from the generator where possible',
          'Results report variance across several runs, not one sample',
          'Cost and latency are evaluated alongside quality',
          'Prompt and model versions are stored with every score'
        ],
        output: [
          '## Eval Report: [Feature], [Candidate vs Baseline]',
          '| Metric | Baseline | Candidate | Delta |',
          '|--------|----------|-----------|-------|',
          '| Groundedness | [x] | [y] | [d] |',
          '',
          '**Regressions:** [cases]',
          '**Decision:** [ship | hold]'
        ],
        pitfalls: [
          'Evaluating on the same examples used to craft the prompt.',
          'Trusting an uncalibrated judge.',
          'Ignoring non-determinism by drawing a single sample.'
        ]
      },
      {
        name: 'llm-guardrails-gateway',
        description: "Design an LLM gateway with routing, caching, guardrails and spend controls. Trigger with 'LLM gateway', 'prompt injection defence', 'PII in prompts', 'LLM cost control' or 'rate limit the model'.",
        when: ['Several teams call model APIs directly', 'LLM spend or safety incidents are unmanaged'],
        steps: [
          'Route all model traffic through one gateway that handles authentication, per-team quotas and retries with fallback models.',
          'Add input controls: PII redaction, prompt-injection detection and size limits.',
          'Add output controls: schema validation, policy classification and secret or PII filtering.',
          'Enable semantic and exact caching where answers are stable, and log token usage per team and feature.',
          'Alert on spend anomalies and set hard budget limits.'
        ],
        checks: [
          'No application holds raw provider API keys',
          'Tool-calling agents have least-privilege tool scopes',
          'Logs avoid storing sensitive prompts unredacted',
          'Fallback behaviour is tested during provider outages'
        ],
        output: [
          '## LLM Gateway Design',
          '| Layer | Control | Tool | Failure mode |',
          '|-------|---------|------|--------------|',
          '| Input | PII redaction | [tool] | fail closed |',
          '',
          '**Budgets:** [per team limits]',
          '**Fallback:** [model order]'
        ],
        pitfalls: [
          'Treating guardrails as a replacement for least-privilege tool access.',
          'Caching responses that depend on user-specific context.',
          'Blocking traffic on a guardrail timeout instead of defining a safe default.'
        ]
      }
    ],
    commands: [
      {
        name: 'eval-plan',
        description: 'Create an evaluation plan with datasets, metrics and release gates for an LLM feature',
        hint: '<feature description and failure modes seen>',
        steps: [
          'Define success criteria and unacceptable failures.',
          'Propose dataset composition and size.',
          'Select metrics and judge rubric.',
          'Set CI gates and online monitoring.'
        ],
        output: 'An evaluation plan with dataset spec, metrics, thresholds and gating rules.'
      },
      {
        name: 'prompt-review',
        description: 'Review a prompt for clarity, injection risk and testability',
        hint: '<prompt text and intended behaviour>',
        steps: [
          'Check role, task, constraints and output format are explicit.',
          'Identify injection and leakage risks.',
          'Suggest structured output and examples where useful.',
          'Provide a test set of adversarial and normal inputs.'
        ],
        output: 'Annotated issues, an improved prompt and a starter test set.'
      }
    ]
  },
  {
    id: 'ai-infra',
    plugin: 'ai-infra-engineer',
    title: 'AI Infrastructure Engineer',
    group: 'AI & Data',
    icon: '⚡',
    summary: 'GPU scheduling, inference serving, batching, quantisation and capacity planning.',
    tools: ['vLLM', 'KServe', 'NVIDIA GPU Operator', 'Ray', 'Triton'],
    studioLink: '/tools/ray-cluster/',
    studioName: 'Distributed Ray & vLLM Cluster Studio',
    learnLink: '/studios/learn/?studio=ray-cluster',
    learnTopic: 'GPU Clustering, PagedAttention & NCCL Tuning',
    flowLink: '/studios/flow/?template=rag',
    flowName: 'vLLM High-Throughput Serving Engine',
    projectRepo: 'Pradeeptalari14/tp-ray-cluster',
    realWorldScenario: 'Distributed Inference Serving: Deploys DeepSeek-V3 across 8x H100 GPUs with vLLM PagedAttention and TensorRT-LLM tensor parallelism.',
    businessGain: 'Maximizes GPU memory utilization from 42% to 94%; handles 4.5x higher concurrent inference requests.',
    skills: [
      {
        name: 'inference-serving-design',
        description: "Design a production LLM or model inference service. Trigger with 'serve a model', 'vLLM', 'GPU inference', 'reduce latency of the model' or 'time to first token'.",
        when: ['A model needs to serve interactive traffic', 'GPU utilisation is low while latency is high'],
        steps: [
          'Characterise the workload: input and output token lengths, concurrency, latency targets for time to first token and inter-token latency.',
          'Choose the engine and features: continuous batching, paged KV cache, prefix caching and tensor parallelism if the model does not fit one GPU.',
          'Pick precision and quantisation (FP8, INT8, AWQ or GPTQ) and verify quality on your evaluation set.',
          'Size replicas from measured tokens per second per GPU and target utilisation, with headroom for failure.',
          'Autoscale on queue depth or concurrency, not CPU, and plan cold-start time for model weights.'
        ],
        checks: [
          'Load test uses realistic prompt and output length distributions',
          'Quantised model passes the quality evaluation',
          'Model weights are cached close to nodes to cut cold starts',
          'GPU, KV-cache and queue metrics are on dashboards'
        ],
        output: [
          '## Inference Design: [Model]',
          '| Item | Choice | Reason |',
          '|------|--------|--------|',
          '| Engine | [vLLM] | continuous batching |',
          '',
          '**Capacity:** [replicas x tokens/s]',
          '**SLO:** TTFT [x] ms, ITL [y] ms'
        ],
        pitfalls: [
          'Sizing from peak throughput benchmarks with short prompts.',
          'Autoscaling on GPU utilisation, which saturates before latency degrades.',
          'Ignoring model load time in scale-up decisions.'
        ]
      },
      {
        name: 'gpu-capacity-planning',
        description: "Plan and schedule GPU capacity across training and inference. Trigger with 'GPU shortage', 'GPU utilisation', 'MIG', 'gang scheduling' or 'GPU cost'.",
        when: ['GPU queues are long while some GPUs sit idle', 'Training and inference compete for hardware'],
        steps: [
          'Measure real utilisation and memory per workload, and identify idle or fragmented GPUs.',
          'Separate pools by workload class: latency-sensitive inference, batch inference, and training with preemption allowed.',
          'Use sharing where suitable: MIG partitions or time-slicing for small models.',
          'Adopt gang scheduling and priority classes so distributed jobs start together and high priority work preempts low.',
          'Forecast demand and decide the reserved, on-demand and spot mix.'
        ],
        checks: [
          'Idle GPU time is reported per team',
          'Training jobs checkpoint so spot preemption is safe',
          'Quotas prevent a single team from monopolising a pool',
          'Driver and CUDA versions are standardised'
        ],
        output: [
          '## GPU Capacity Plan: [Quarter]',
          '| Pool | GPUs | Workload | Utilisation | Purchase |',
          '|------|------|----------|-------------|----------|',
          '| inference-a | [n] | online | [%] | reserved |',
          '',
          '**Forecast:** [demand]'
        ],
        pitfalls: [
          'Static partitioning that strands capacity.',
          'Running training on spot without checkpointing.',
          'Mixing driver versions and debugging mysterious failures.'
        ]
      }
    ],
    commands: [
      {
        name: 'serving-sizing',
        description: 'Estimate replicas and GPU count for a model from traffic and latency targets',
        hint: '<model, GPU type, request rate, token lengths, latency target>',
        steps: [
          'Estimate memory for weights and KV cache per concurrent request.',
          'Estimate tokens per second per GPU and required concurrency.',
          'Compute replicas with headroom for failure and bursts.',
          'State assumptions and what to measure to verify.'
        ],
        output: 'A sizing table, assumptions and a load-test checklist.'
      },
      {
        name: 'gpu-utilization-review',
        description: 'Review GPU utilisation data and find waste and scheduling fixes',
        hint: '<utilisation metrics or workload list>',
        steps: [
          'Group workloads by pool and utilisation.',
          'Find idle, fragmented or oversized allocations.',
          'Recommend sharing, repacking or priority changes.',
          'Estimate the saving.'
        ],
        output: 'A findings table with changes and estimated GPU-hour savings.'
      }
    ]
  },
  {
    id: 'rag',
    plugin: 'rag-engineer',
    title: 'RAG Engineer',
    group: 'AI & Data',
    icon: '🔎',
    summary: 'Chunking, hybrid retrieval, reranking, grounding and retrieval quality measurement.',
    tools: ['Weaviate', 'Qdrant', 'pgvector', 'OpenSearch', 'Cohere Rerank'],
    studioLink: '/tools/ai/',
    studioName: 'DevOps AI RAG Studio',
    learnLink: '/studios/learn/?studio=ai',
    learnTopic: 'Hybrid RRF Retrieval & Semantic Chunking',
    flowLink: '/studios/flow/?template=rag',
    flowName: 'Enterprise Hybrid RAG Pipeline',
    projectRepo: 'Pradeeptalari14/tp-ai',
    realWorldScenario: 'Enterprise Internal Docs QA: Implements reciprocal rank fusion (BM25 + Qdrant dense vector) with cross-encoder reranking over 100,000 engineering wiki pages.',
    businessGain: '96.4% context recall; eliminates hallucinated runbook commands for on-call engineers.',
    skills: [
      {
        name: 'retrieval-pipeline-design',
        description: "Design a retrieval-augmented generation pipeline. Trigger with 'build RAG', 'chunking strategy', 'hybrid search', 'reranker' or 'the bot gives wrong answers from our docs'.",
        when: ['Answers are fluent but ungrounded', 'Retrieval misses obvious documents'],
        steps: [
          'Inventory sources and access rules, and carry document-level permissions into the index so retrieval respects them.',
          'Chunk by structure (headings, sections, tables) with modest overlap, and store metadata such as source, date and ACL.',
          'Use hybrid retrieval: dense vectors plus BM25, fused with reciprocal rank fusion.',
          'Rerank the top candidates with a cross-encoder and pass only the best few to the model.',
          'Prompt for grounded answers with citations and an explicit refusal when evidence is missing.'
        ],
        checks: [
          'Retrieval is evaluated separately from generation',
          'Index updates handle deletes and permission changes',
          'Answers include citations to retrieved chunks',
          'Embedding model and chunking version are recorded'
        ],
        output: [
          '## RAG Design: [Use case]',
          '| Stage | Choice | Parameter |',
          '|-------|--------|-----------|',
          '| Chunking | structural | 400 tokens, 10% overlap |',
          '',
          '**Retrieval:** [hybrid, k, rerank k]',
          '**Refusal rule:** [text]'
        ],
        pitfalls: [
          'Fixed-size chunks that split tables and code.',
          'Stuffing too much context, which lowers answer quality.',
          'Leaking documents the asking user is not allowed to read.'
        ]
      },
      {
        name: 'retrieval-evaluation',
        description: "Measure and improve retrieval quality with labelled queries. Trigger with 'RAG evaluation', 'recall at k', 'retrieval is poor', 'compare embedding models'.",
        when: ['Changing embeddings, chunking or reranker', 'Quality is judged only by anecdotes'],
        steps: [
          'Build a query set with known relevant chunks from support logs and subject experts.',
          'Measure recall at k, MRR and nDCG for retrieval, before generation.',
          'Measure answer faithfulness and relevance for generation using a calibrated judge.',
          'Run ablations: chunk size, embedding model, hybrid weight and reranker on or off.',
          'Review failures by category and fix the biggest bucket first.'
        ],
        checks: [
          'The query set includes hard and out-of-scope questions',
          'Each experiment changes one variable',
          'Latency and cost are measured per configuration',
          'Results are reproducible with versioned indexes'
        ],
        output: [
          '## Retrieval Evaluation',
          '| Config | Recall@5 | MRR | Faithfulness | p95 latency |',
          '|--------|----------|-----|--------------|-------------|',
          '| [baseline] | [x] | [y] | [z] | [ms] |',
          '',
          '**Winner and rationale:** [text]'
        ],
        pitfalls: [
          'Tuning on the test queries.',
          'Optimising recall while ignoring precision and context length.',
          'Evaluating only on easy factual questions.'
        ]
      }
    ],
    commands: [
      {
        name: 'chunking-strategy',
        description: 'Recommend a chunking and metadata strategy for a document set',
        hint: '<document types and sample structure>',
        steps: [
          'Classify documents by structure.',
          'Recommend chunk boundaries, size and overlap per type.',
          'Define metadata and permission fields.',
          'Give an ingestion outline.'
        ],
        output: 'A chunking spec per document type with a metadata schema.'
      },
      {
        name: 'rag-debug',
        description: 'Diagnose why a RAG answer was wrong from the question, chunks and answer',
        hint: '<question, retrieved chunks and generated answer>',
        steps: [
          'Check whether the needed evidence was retrieved at all.',
          'If retrieved, check ranking and whether the answer used it.',
          'Classify the failure as retrieval, ranking, context or generation.',
          'Recommend the specific fix.'
        ],
        output: 'A failure classification and a targeted fix recommendation.'
      }
    ]
  },
  {
    id: 'agent',
    plugin: 'agent-engineer',
    title: 'Agent Engineer',
    group: 'AI & Data',
    icon: '🤖',
    summary: 'Tool-using agents, MCP servers, orchestration graphs, memory and safe autonomy.',
    tools: ['LangGraph', 'MCP', 'OpenAI Agents SDK', 'Temporal', 'OpenTelemetry'],
    studioLink: '/tools/strands/',
    studioName: 'Strands Autonomous SRE Agent Studio',
    learnLink: '/studios/learn/?studio=strands',
    learnTopic: 'LangGraph Multi-Agent Consensus & Safety',
    flowLink: '/studios/flow/?template=agent',
    flowName: 'Autonomous Agent Swarm Consensus',
    projectRepo: 'Pradeeptalari14/tp-strands',
    realWorldScenario: 'Autonomous Pod Crash Remediation: LangGraph multi-agent swarm inspects container OOMKilled logs, patches deployment memory limits, and creates pull request.',
    businessGain: 'Autonomously resolves 48% of tier-1 production alerts without waking human engineers.',
    skills: [
      {
        name: 'agent-architecture',
        description: "Design a reliable tool-using agent or multi-agent workflow. Trigger with 'build an agent', 'multi-agent', 'LangGraph', 'agent keeps looping' or 'which tools should the agent have'.",
        when: ['A workflow needs model-driven decisions across several tools', 'An agent is unreliable or too expensive'],
        steps: [
          'Start with the simplest design that works: a fixed workflow before an agent, a single agent before a swarm.',
          'Model the work as a state graph with explicit nodes, edges, retries and termination conditions.',
          'Define each tool with a narrow purpose, typed input schema, clear description and least-privilege credentials.',
          'Add budgets: maximum steps, tokens, wall-clock time and spend per run.',
          'Add human approval for irreversible or high-impact actions, and persist state so runs can resume.'
        ],
        checks: [
          'Every loop has a hard exit',
          'Tool errors return structured messages the model can act on',
          'Runs are traced end to end with inputs, outputs and cost',
          'Evaluations cover multi-step success, not only single responses'
        ],
        output: [
          '## Agent Design: [Task]',
          '**Pattern:** [workflow | single agent | supervisor]',
          '| Tool | Purpose | Scope | Approval needed |',
          '|------|---------|-------|-----------------|',
          '',
          '**Budgets:** [steps, tokens, time]',
          '**Failure handling:** [rules]'
        ],
        pitfalls: [
          'Giving one agent dozens of overlapping tools.',
          'Unbounded retry loops that burn budget.',
          'Letting an agent hold broad credentials for convenience.'
        ]
      },
      {
        name: 'mcp-server-design',
        description: "Design and secure a Model Context Protocol server. Trigger with 'build an MCP server', 'expose this API to the agent', 'MCP tool design' or 'MCP security'.",
        when: ['An internal system should be usable by AI clients', 'An existing MCP server has too many or unsafe tools'],
        steps: [
          'List the user tasks, then expose a small set of task-oriented tools instead of mirroring every API endpoint.',
          'Write precise tool names, descriptions and JSON schemas with enums and constraints. Return concise structured results.',
          'Choose transport and authentication: stdio for local, streamable HTTP with OAuth for remote, with per-user authorisation.',
          'Treat tool output as untrusted input to the model, and defend against prompt injection from fetched content.',
          'Add logging, rate limits, timeouts and a read-only mode, and test with an MCP inspector and an evaluation set.'
        ],
        checks: [
          'Destructive tools require confirmation or are omitted',
          'Secrets never appear in tool results',
          'Servers enforce authorisation themselves, not through the model',
          'Tool descriptions are tested for correct selection by the model'
        ],
        output: [
          '## MCP Server Spec: [System]',
          '| Tool | Input | Output | Risk |',
          '|------|-------|--------|------|',
          '| [search_tickets] | query, limit | list | read-only |',
          '',
          '**Transport and auth:** [choice]',
          '**Controls:** [limits, logging]'
        ],
        pitfalls: [
          'One tool per endpoint, overwhelming model tool selection.',
          'Returning huge payloads that waste context.',
          'Trusting the model to enforce access rules.'
        ]
      }
    ],
    commands: [
      {
        name: 'agent-spec',
        description: 'Produce an agent specification with graph, tools, budgets and approvals',
        hint: '<task the agent must accomplish>',
        steps: [
          'Decide if a workflow is sufficient.',
          'Draw the node and edge list.',
          'Define tools, scopes and approval points.',
          'Set budgets and the evaluation plan.'
        ],
        output: 'An agent specification with graph, tool table, budgets and evaluation plan.'
      },
      {
        name: 'mcp-tool-review',
        description: 'Review MCP tool definitions for clarity, safety and token efficiency',
        hint: '<tool definitions JSON>',
        steps: [
          'Check names, descriptions and schemas for ambiguity.',
          'Flag overlapping or destructive tools.',
          'Estimate output size and suggest trimming.',
          'Rewrite the weakest definitions.'
        ],
        output: 'Findings per tool and rewritten definitions.'
      }
    ]
  },
  {
    id: 'data',
    plugin: 'data-engineer',
    title: 'Data Engineer',
    group: 'AI & Data',
    icon: '🗃️',
    summary: 'Pipelines, data contracts, quality checks, lakehouse modelling and streaming reliability.',
    tools: ['Airflow', 'dbt', 'Spark', 'Kafka', 'Great Expectations'],
    studioLink: '/tools/snowflake-warehouse/',
    studioName: 'Snowflake Lakehouse & dbt Studio',
    learnLink: '/studios/learn/?studio=snowflake-warehouse',
    learnTopic: 'Apache Iceberg Lakehouse & Data Quality Contracts',
    flowLink: '/studios/flow/?template=rag',
    flowName: 'Lakehouse Pipeline & Quality Contracts',
    projectRepo: 'Pradeeptalari14/tp-snowflake-warehouse',
    realWorldScenario: 'Zero-Downtime Data Pipeline Migration: Migrates 15TB daily streaming clickstream data to Apache Iceberg and dbt with automated Great Expectations schema validation.',
    businessGain: 'Reduces ETL compute costs by 54%; guarantees zero corrupted data rows reach executive dashboards.',
    skills: [
      {
        name: 'data-pipeline-design',
        description: "Design reliable batch or streaming data pipelines. Trigger with 'ETL', 'ELT', 'data pipeline', 'idempotent', 'backfill' or 'late arriving data'.",
        when: ['A pipeline produces duplicates or gaps on retry', 'Backfills are manual and risky'],
        steps: [
          'Define source, sink, freshness target and acceptable latency, and choose batch, micro-batch or streaming accordingly.',
          'Make every task idempotent: overwrite partitions or merge on keys so reruns converge to the same result.',
          'Parameterise by data interval rather than wall-clock time so backfills use the same code path.',
          'Handle late and out-of-order data with watermarks or reprocessing windows.',
          'Layer the model: raw, cleaned, and curated marts, with lineage between layers.'
        ],
        checks: [
          'Rerunning any task never creates duplicates',
          'Schema changes are detected before they break downstream jobs',
          'Failures alert the owner with the failing partition',
          'Raw data is retained so any layer can be rebuilt'
        ],
        output: [
          '## Pipeline Design: [Dataset]',
          '| Stage | Mode | Key | Idempotency method |',
          '|-------|------|-----|--------------------|',
          '| ingest | [batch] | [id] | partition overwrite |',
          '',
          '**Freshness SLO:** [target]',
          '**Backfill:** [procedure]'
        ],
        pitfalls: [
          'Using now() inside transformations, which breaks reruns.',
          'Append-only loads with no deduplication.',
          'Silent schema drift from upstream sources.'
        ]
      },
      {
        name: 'data-quality-contracts',
        description: "Introduce data contracts and automated quality checks. Trigger with 'data quality', 'data contract', 'bad data in the dashboard', 'schema change broke us' or 'data observability'.",
        when: ['Consumers find data issues before producers do', 'Upstream changes break reports regularly'],
        steps: [
          'Agree a contract per dataset: schema, semantics, owner, freshness, volume and quality expectations.',
          'Validate at the boundary: reject or quarantine records that violate the contract and report counts.',
          'Add tests in the transformation layer for uniqueness, not-null, referential integrity and accepted values.',
          'Monitor freshness, volume and distribution anomalies with alerts to the data owner.',
          'Version contracts and require a deprecation period for breaking changes.'
        ],
        checks: [
          'Every critical dataset has a named owner',
          'Quarantined records are visible and recoverable',
          'Breaking changes go through a review with consumers',
          'Tests run in CI before deployment of models'
        ],
        output: [
          '## Data Contract: [Dataset]',
          '**Owner:** [team] | **Freshness:** [target] | **Volume:** [range]',
          '| Field | Type | Rule |',
          '|-------|------|------|',
          '| [order_id] | string | unique, not null |',
          '',
          '**Breaking change policy:** [text]'
        ],
        pitfalls: [
          'Hundreds of low-value tests that nobody acts on.',
          'Contracts that exist only as documents without enforcement.',
          'Alerting consumers instead of the producing team.'
        ]
      }
    ],
    commands: [
      {
        name: 'pipeline-review',
        description: 'Review a pipeline or DAG for idempotency, backfill safety and failure handling',
        hint: '<DAG code, SQL or description>',
        steps: [
          'Check each task for idempotency and time-dependence.',
          'Evaluate retries, timeouts and alerting.',
          'Assess backfill and late data handling.',
          'Return fixes ordered by risk.'
        ],
        output: 'A risk-ordered findings list with corrected examples.'
      },
      {
        name: 'data-contract',
        description: 'Draft a data contract for a dataset from sample schema and usage',
        hint: '<sample schema, producer and consumers>',
        steps: [
          'Infer fields, types and constraints.',
          'Propose freshness and volume expectations.',
          'List quality tests.',
          'Draft the change policy.'
        ],
        output: 'A data contract document with tests and a change policy.'
      }
    ]
  }
];
