/**
 * RepoLearningGenerator
 * Unified Repository Learning Workspace & Real Project Development Engine.
 * Connects all 341 real source-code repositories to architecture DAGs, 10-point courses,
 * one-click development setups, in-browser diff workbench, and 341 specialized studios.
 * (c) 2026 Talari Pradeep. All rights reserved.
 */

const ALL_PRESET_REPOSITORIES = {
  "enterprise-agentic-os": {
    "id": "enterprise-agentic-os",
    "repo": "Pradeeptalari14/enterprise-agentic-os",
    "title": "Enterprise Agentic Operating System",
    "desc": "Multi-agent orchestration platform coordinating specialized AI agents (Planner, Executor, Critic, Memory) using LangGraph stateful cyclic graphs to handle 500+ concurrent enterprise workflows.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "a506893",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "LangGraph",
      "FastAPI",
      "LangChain"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes (EKS/AKS)",
      "Redis Enterprise",
      "ArgoCD"
    ],
    "monorepo": false,
    "entrypoints": [
      "agent_os.py"
    ],
    "studioBridge": [
      {
        "component": "Production Architecture",
        "studioId": "projects",
        "path": "/projects/enterprise-agentic-os.html"
      },
      {
        "component": "Agent Workflow Studio",
        "studioId": "agent-workflow",
        "path": "/tools/agent-workflow/"
      }
    ]
  },
  "enterprise-rag-platform": {
    "id": "enterprise-rag-platform",
    "repo": "Pradeeptalari14/enterprise-rag-platform",
    "title": "Enterprise Hybrid RAG Platform",
    "desc": "Production retrieval pipeline combining dense semantic vector search with BM25 lexical ranking over 5M+ documents, Weaviate clustering, and Neo4j GraphRAG.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "02aa3cf",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "LangChain",
      "Weaviate",
      "Neo4j"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Weaviate Cluster",
      "OpenSearch",
      "Terraform"
    ],
    "monorepo": false,
    "entrypoints": [
      "rag_engine.py"
    ],
    "studioBridge": [
      {
        "component": "Production Architecture",
        "studioId": "projects",
        "path": "/projects/enterprise-rag-platform.html"
      },
      {
        "component": "Vector DB Studio",
        "studioId": "vector-db",
        "path": "/tools/vector-db/"
      }
    ]
  },
  "multi-cloud-landing-zone": {
    "id": "multi-cloud-landing-zone",
    "repo": "Pradeeptalari14/multi-cloud-landing-zone",
    "title": "Multi-Cloud Landing Zone & IaC Platform",
    "desc": "Modular Terraform and Pulumi library establishing hardened AWS and Azure foundations to bootstrap isolated VPC topologies, zero-trust IAM, and transit gateways.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "fb05441",
    "languages": [
      "HCL (Terraform)",
      "TypeScript"
    ],
    "frameworks": [
      "Terraform",
      "Pulumi",
      "Ansible"
    ],
    "packageManagers": [
      "terraform",
      "npm"
    ],
    "infrastructure": [
      "AWS Transit Gateway",
      "Azure Virtual WAN",
      "OPA Conftest"
    ],
    "monorepo": false,
    "entrypoints": [
      "main.tf"
    ],
    "studioBridge": [
      {
        "component": "Production Architecture",
        "studioId": "projects",
        "path": "/projects/multi-cloud-landing-zone.html"
      },
      {
        "component": "Terraform Studio",
        "studioId": "terraform",
        "path": "/tools/terraform/"
      }
    ]
  },
  "ai-infra-monitoring-copilot": {
    "id": "ai-infra-monitoring-copilot",
    "repo": "Pradeeptalari14/ai-infra-monitoring-copilot",
    "title": "AI Infrastructure Monitoring Copilot",
    "desc": "Autonomous SRE copilot leveraging eBPF telemetry, Prometheus metrics, and causal AI to detect GPU saturation, network bottlenecks, and inference failures.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "c971807",
    "languages": [
      "Python",
      "C (eBPF)"
    ],
    "frameworks": [
      "FastAPI",
      "NetworkX",
      "BCC / Tetragon"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA DCGM",
      "Prometheus",
      "OpenTelemetry Collector"
    ],
    "monorepo": false,
    "entrypoints": [
      "copilot.py"
    ],
    "studioBridge": [
      {
        "component": "Production Architecture",
        "studioId": "projects",
        "path": "/projects/ai-infra-monitoring-copilot.html"
      },
      {
        "component": "Incident Simulator",
        "studioId": "incident",
        "path": "/incident/"
      }
    ]
  },
  "observability-platform-k8s": {
    "id": "observability-platform-k8s",
    "repo": "Pradeeptalari14/observability-platform-k8s",
    "title": "Kubernetes Observability & Telemetry Platform",
    "desc": "Production-grade telemetry stack integrating Prometheus, Grafana, OpenTelemetry, and Fluentbit to monitor multi-cluster Kubernetes topologies.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "a598579",
    "languages": [
      "YAML",
      "Go",
      "Shell"
    ],
    "frameworks": [
      "Prometheus Operator",
      "Thanos",
      "Grafana Loki & Tempo"
    ],
    "packageManagers": [
      "helm",
      "kubectl"
    ],
    "infrastructure": [
      "Kubernetes Multi-Cluster",
      "Istio Service Mesh",
      "S3 MinIO"
    ],
    "monorepo": false,
    "entrypoints": [
      "k8s-observability.yaml"
    ],
    "studioBridge": [
      {
        "component": "Production Architecture",
        "studioId": "projects",
        "path": "/projects/observability-platform-k8s.html"
      },
      {
        "component": "Observability Studio",
        "studioId": "monitoring",
        "path": "/tools/monitoring/"
      }
    ]
  },
  "whatsapp-voice-ai-assistant": {
    "id": "whatsapp-voice-ai-assistant",
    "repo": "Pradeeptalari14/whatsapp-voice-ai-assistant",
    "title": "WhatsApp Multilingual Voice AI Assistant",
    "desc": "Real-time conversational voice assistant for WhatsApp with speech-to-text, dialect translation, and sub-400ms end-to-end voice synthesis.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "b722a75",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "FastAPI",
      "Faster-Whisper",
      "Silero VAD",
      "Edge-TTS"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "WhatsApp Cloud API",
      "Celery Worker",
      "Redis Cache"
    ],
    "monorepo": false,
    "entrypoints": [
      "voice_assistant.py"
    ],
    "studioBridge": [
      {
        "component": "Production Architecture",
        "studioId": "projects",
        "path": "/projects/whatsapp-voice-ai-assistant.html"
      },
      {
        "component": "Realtime Voice Studio",
        "studioId": "openai-realtime-voice",
        "path": "/tools/openai-realtime-voice/"
      }
    ]
  },
  "cloud-architecture-center": {
    "id": "cloud-architecture-center",
    "repo": "Pradeeptalari14/portfolio",
    "title": "Cloud & AI Architecture Center",
    "desc": "Interactive production system architectures for AWS Multi-Account Landing Zones, Multi-Tenant EKS Clusters, Enterprise RAG Pipelines, and Hybrid VMware clouds.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "e4394e7",
    "languages": [
      "JavaScript",
      "HTML5",
      "CSS3"
    ],
    "frameworks": [
      "Mermaid.js",
      "SVG Engine"
    ],
    "packageManagers": [
      "npm"
    ],
    "infrastructure": [
      "Cloud Architecture Topologies",
      "AWS Transit Gateway",
      "Kubernetes"
    ],
    "monorepo": false,
    "entrypoints": [
      "architecture/index.html"
    ],
    "studioBridge": [
      {
        "component": "Interactive Center",
        "studioId": "architecture",
        "path": "/architecture/"
      },
      {
        "component": "Projects Showcase",
        "studioId": "projects",
        "path": "/projects/"
      }
    ]
  },

  "tp-ai": {
    "id": "tp-ai",
    "repo": "Pradeeptalari14/tp-ai",
    "title": "DevOps AI RAG Studio",
    "desc": "Build private enterprise knowledge bases. Customize and generate a Streamlit ChatGPT client, FastAPI backend, LangChain and ChromaDB indexing pipelines, and local LLM configurations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6964519",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "FastAPI",
      "LangChain"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "rag_engine.py"
    ],
    "studioBridge": [
      {
        "component": "DevOps AI RAG Studio",
        "studioId": "ai",
        "path": "/tools/ai/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-typesafe-jev": {
    "id": "tp-typesafe-jev",
    "repo": "Pradeeptalari14/tp-typesafe-jev",
    "title": "TypeSafe Jev: System 1 AI Studio",
    "desc": "Orchestrate TypeSafe AI's Jev System 1 model. Configure non-autoregressive sub-100ms reflex routing, calibrated decision thresholds (RLCD), schema-constrained Pydantic triage, and System 2 LLM escalation fallbacks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1a4c754",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "jev_engine.py"
    ],
    "studioBridge": [
      {
        "component": "TypeSafe Jev: System 1 AI Studio",
        "studioId": "jev-system1",
        "path": "/tools/jev-system1/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-llm": {
    "id": "tp-llm",
    "repo": "Pradeeptalari14/tp-llm",
    "title": "Enterprise LLM Studio",
    "desc": "Orchestrate scalable, GPU-accelerated environments for Large Models. Generate production Kubernetes manifests, high-performance vLLM configurations, and Prometheus telemetry dashboards.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "33cd77e",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "vLLM",
      "Kubernetes",
      "Prometheus"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "deployment.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Enterprise LLM Studio",
        "studioId": "llm",
        "path": "/tools/llm/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-slm": {
    "id": "tp-slm",
    "repo": "Pradeeptalari14/tp-slm",
    "title": "Local SLM Studio",
    "desc": "Build high-performance, containerized or edge environments for Small Models. Generate customized Ollama Modelfiles, systemd service units, and edge bootstrapping scripts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "33cd5d9",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "Modelfile",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Local SLM Studio",
        "studioId": "slm",
        "path": "/tools/slm/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-mlflow": {
    "id": "tp-mlflow",
    "repo": "Pradeeptalari14/tp-mlflow",
    "title": "MLflow Tracking Studio",
    "desc": "Deploy centralized model training registries. Generate database-backed experiment trackers, Docker Compose service meshes, Kubernetes manifests, and Python metrics logs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "51df804",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker Compose",
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "docker-compose.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "MLflow Tracking Studio",
        "studioId": "mlflow",
        "path": "/tools/mlflow/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-strands": {
    "id": "tp-strands",
    "repo": "Pradeeptalari14/tp-strands",
    "title": "Strands SRE Agent Studio",
    "desc": "Orchestrate autonomous SRE troubleshooters. Generate single-agent or swarm workflows, Model Context Protocol (MCP) integrations, and OpenTelemetry logging traces using the Strands SDK.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "619fb4d",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "agent.py"
    ],
    "studioBridge": [
      {
        "component": "Strands SRE Agent Studio",
        "studioId": "strands",
        "path": "/tools/strands/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-llm-guardrails": {
    "id": "tp-llm-guardrails",
    "repo": "Pradeeptalari14/tp-llm-guardrails",
    "title": "LLM Guardrails Studio",
    "desc": "Configure input/output validation, prompt injection shields, and SRE safety rules (NeMo/Llama Guard).",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "cce61ed",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "config.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "LLM Guardrails Studio",
        "studioId": "llm-guardrails",
        "path": "/tools/llm-guardrails/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ray-cluster": {
    "id": "tp-ray-cluster",
    "repo": "Pradeeptalari14/tp-ray-cluster",
    "title": "Ray Cluster Studio",
    "desc": "Orchestrate multi-node distributed training jobs, Ray clusters, and GPU autoscaling policies.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "74a0298",
    "languages": [
      "JavaScript/TypeScript",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "ray_cluster.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Ray Cluster Studio",
        "studioId": "ray-cluster",
        "path": "/tools/ray-cluster/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ai-eval": {
    "id": "tp-ai-eval",
    "repo": "Pradeeptalari14/tp-ai-eval",
    "title": "AI Evaluation Studio",
    "desc": "Scaffold automated Ragas pipelines, model accuracy tests, and hallucination metrics logs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6d202b3",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "eval_pipeline.py"
    ],
    "studioBridge": [
      {
        "component": "AI Evaluation Studio",
        "studioId": "ai-eval",
        "path": "/tools/ai-eval/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-feature-store": {
    "id": "tp-feature-store",
    "repo": "Pradeeptalari14/tp-feature-store",
    "title": "Feature Store Studio",
    "desc": "Generate Feast feature registries, offline/online database configurations, and feature definition scripts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "60fb924",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "feature_store.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Feature Store Studio",
        "studioId": "feature-store",
        "path": "/tools/feature-store/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-llm-gateway": {
    "id": "tp-llm-gateway",
    "repo": "Pradeeptalari14/tp-llm-gateway",
    "title": "LLM Gateway & API Router Studio",
    "desc": "Optimize model serving gateways. Scaffold LiteLLM routing configurations, semantic prompt caches, and client API scripts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "43f5d59",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "litellm-config.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "LLM Gateway & API Router Studio",
        "studioId": "llm-gateway",
        "path": "/tools/llm-gateway/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-llm-tracing": {
    "id": "tp-llm-tracing",
    "repo": "Pradeeptalari14/tp-llm-tracing",
    "title": "LLM Observability & Tracing Studio",
    "desc": "Scaffold self-hosted LLM tracing collectors. Generate Langfuse services deployments, PyOpenTelemetry instrumentation, and trace spans.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "f9c6011",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "langfuse-compose.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "LLM Observability & Tracing Studio",
        "studioId": "llm-tracing",
        "path": "/tools/llm-tracing/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vector-db": {
    "id": "tp-vector-db",
    "repo": "Pradeeptalari14/tp-vector-db",
    "title": "Vector Database Optimizer Studio",
    "desc": "Optimize search accuracy and index latency. Generate custom pgvector SQL schemas and Qdrant segment tuning configurations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "2623af3",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "qdrant-config.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Vector Database Optimizer Studio",
        "studioId": "vector-db",
        "path": "/tools/vector-db/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-sre-simulator": {
    "id": "tp-sre-simulator",
    "repo": "Pradeeptalari14/tp-sre-simulator",
    "title": "SRE AI Agent Simulator",
    "desc": "Run autonomous incident response diagnostics. Trigger mock failures (memory leaks, deadlocks) and view the AI agent's reasoning traces and RCAs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "515b34c",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "triage_agent.py"
    ],
    "studioBridge": [
      {
        "component": "SRE AI Agent Simulator",
        "studioId": "sre-simulator",
        "path": "/tools/sre-simulator/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-mcp-studio": {
    "id": "tp-mcp-studio",
    "repo": "Pradeeptalari14/tp-mcp-studio",
    "title": "MCP Studio",
    "desc": "Build and configure Model Context Protocol (MCP) ecosystems. Generate agent server configurations, safety guidelines, and 300+ infra automation recipes.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7f267aa",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "mcp_config.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "MCP Studio",
        "studioId": "mcp-studio",
        "path": "/tools/mcp-studio/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ansible": {
    "id": "tp-ansible",
    "repo": "Pradeeptalari14/tp-ansible",
    "title": "Ansible Playbook Builder",
    "desc": "Deploy applications instantly. Generate highly structured system updates, secure installation recipes, and customized role parameters in YAML syntax.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "60bbfb1",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Ansible"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "playbook.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Ansible Playbook Builder",
        "studioId": "ansible",
        "path": "/tools/ansible/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-docker": {
    "id": "tp-docker",
    "repo": "Pradeeptalari14/tp-docker",
    "title": "Docker Manager",
    "desc": "Containerize workloads correctly. Build clean production-grade Dockerfiles with validation checks and automated configuration maps.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "6112396",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker Compose"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "Dockerfile",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Docker Manager",
        "studioId": "docker",
        "path": "/tools/docker/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-git": {
    "id": "tp-git",
    "repo": "Pradeeptalari14/tp-git",
    "title": "Git Learning Studio",
    "desc": "Master Git operations from beginner to SRE levels. Learn version control differences, commands, interactive rebasing, tags, merge conflicts, and enterprise workflows.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "33cd8af",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "git_guide.md",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Git Learning Studio",
        "studioId": "git",
        "path": "/tools/git/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-jenkins": {
    "id": "tp-jenkins",
    "repo": "Pradeeptalari14/tp-jenkins",
    "title": "Jenkins CI/CD Pipeline",
    "desc": "Standardize continuous integration cycles. Write automated multi-branch Jenkins pipelines with integrated static scanning triggers.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "6bbb0a6",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "Jenkinsfile",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Jenkins CI/CD Pipeline",
        "studioId": "jenkins",
        "path": "/tools/jenkins/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-terraform": {
    "id": "tp-terraform",
    "repo": "Pradeeptalari14/tp-terraform",
    "title": "Terraform Architect",
    "desc": "Automate multi-tier environment setups. Provision VPC layers, server infrastructure scales, and bucket access configurations dynamically in HCL syntax.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "12e4d4c",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Terraform"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "main.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Terraform Architect",
        "studioId": "terraform",
        "path": "/tools/terraform/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-kubernetes": {
    "id": "tp-kubernetes",
    "repo": "Pradeeptalari14/tp-kubernetes",
    "title": "Advanced k8s Script Generator",
    "desc": "Deploy scalable container workloads. Orchestrate deployment sets, load-balancing discovery service rules, ingress path routes, and pod autoscaling configurations dynamically in YAML manifests.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "18ed7cc",
    "languages": [
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "deployment.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Advanced k8s Script Generator",
        "studioId": "kubernetes",
        "path": "/tools/kubernetes/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-monitoring": {
    "id": "tp-monitoring",
    "repo": "Pradeeptalari14/tp-monitoring",
    "title": "Advanced Monitoring Script Generator",
    "desc": "Deploy secure telemetry layers. Generate production-ready bash installation recipes for Prometheus, node_exporter daemon metrics, and Grafana dashboard charts.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "baf5c39",
    "languages": [
      "JavaScript/TypeScript",
      "Shell"
    ],
    "frameworks": [
      "Prometheus",
      "Grafana"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "install.sh"
    ],
    "studioBridge": [
      {
        "component": "Advanced Monitoring Script Generator",
        "studioId": "monitoring",
        "path": "/tools/monitoring/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-github-actions": {
    "id": "tp-github-actions",
    "repo": "Pradeeptalari14/tp-github-actions",
    "title": "GitHub Actions Workflow Studio",
    "desc": "Generate high-level, production-ready CI/CD pipelines with integrated Snyk/Trivy scans and secure multi-platform container pushes.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "1ad50c8",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "ci.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GitHub Actions Workflow Studio",
        "studioId": "github-actions",
        "path": "/tools/github-actions/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-helm": {
    "id": "tp-helm",
    "repo": "Pradeeptalari14/tp-helm",
    "title": "Helm Chart Scaffold Studio",
    "desc": "Generate full package structures including Charts definitions, custom overrides values files, dynamic template deployments and ingresses.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "45e3701",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "Chart.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Helm Chart Scaffold Studio",
        "studioId": "helm",
        "path": "/tools/helm/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-argocd": {
    "id": "tp-argocd",
    "repo": "Pradeeptalari14/tp-argocd",
    "title": "ArgoCD GitOps App Studio",
    "desc": "Orchestrate automated continuous GitOps synchronizations. Generate declarative Application manifests, secure projects wrappers, and CLI setups.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "66049c9",
    "languages": [
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "application.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "ArgoCD GitOps App Studio",
        "studioId": "argocd",
        "path": "/tools/argocd/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-logging": {
    "id": "tp-logging",
    "repo": "Pradeeptalari14/tp-logging",
    "title": "ELK & Loki Logging Studio",
    "desc": "Deploy secure system aggregators. Compile customized Logstash filtering configs, Loki scrapers, and automated installer pipelines.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "19cc7ef",
    "languages": [
      "Shell"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "install.sh"
    ],
    "studioBridge": [
      {
        "component": "ELK & Loki Logging Studio",
        "studioId": "logging",
        "path": "/tools/logging/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-linux": {
    "id": "tp-linux",
    "repo": "Pradeeptalari14/tp-linux",
    "title": "Linux & PowerShell Studio",
    "desc": "Orchestrate raw infrastructure tasks. Generate robust Linux Bash script files or Windows PowerShell cmdlets with built-in telemetry, logging, and cron/scheduler setups.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "7650599",
    "languages": [
      "Shell"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "sre-script.sh"
    ],
    "studioBridge": [
      {
        "component": "Linux & PowerShell Studio",
        "studioId": "linux",
        "path": "/tools/linux/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-python": {
    "id": "tp-python",
    "repo": "Pradeeptalari14/tp-python",
    "title": "Python SRE Utility Studio",
    "desc": "Deploy script tasks with SDK integrations. Generate automated Python scripts for AWS FinOps sweeps, Kubernetes health APIs, SSL certificate audits, or API load pings.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "4c0376b",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "sre_utility.py"
    ],
    "studioBridge": [
      {
        "component": "Python SRE Utility Studio",
        "studioId": "python",
        "path": "/tools/python/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-shellscript": {
    "id": "tp-shellscript",
    "repo": "Pradeeptalari14/tp-shellscript",
    "title": "ShellScript SRE Studio",
    "desc": "Deploy production Bash automation scripts. Generate robust shell commands, automated health audits, logs rotations, and alert notifications.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "665beed",
    "languages": [
      "Shell"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "sre-script.sh"
    ],
    "studioBridge": [
      {
        "component": "ShellScript SRE Studio",
        "studioId": "shellscript",
        "path": "/tools/shellscript/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gitlab": {
    "id": "tp-gitlab",
    "repo": "Pradeeptalari14/tp-gitlab",
    "title": "GitLab CI/CD Pipeline Studio",
    "desc": "Generate robust GitLab CI/CD pipelines (.gitlab-ci.yml) with SRE stages, dependency caching, container builds, and security scans.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "5c407f1",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      ".gitlab-ci.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GitLab CI/CD Pipeline Studio",
        "studioId": "gitlab",
        "path": "/tools/gitlab/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-webhooks": {
    "id": "tp-webhooks",
    "repo": "Pradeeptalari14/tp-webhooks",
    "title": "Webhooks Studio",
    "desc": "Generate secure HMAC-verified webhook receivers, Slack/Teams notification layouts, and automated PagerDuty alerting triggers.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "3d73d90",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "receiver.py"
    ],
    "studioBridge": [
      {
        "component": "Webhooks Studio",
        "studioId": "webhooks",
        "path": "/tools/webhooks/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-secrets": {
    "id": "tp-secrets",
    "repo": "Pradeeptalari14/tp-secrets",
    "title": "Secret Management Studio",
    "desc": "Generate secure HashiCorp Vault policies, dynamic Python secrets retrieval utilities, and Kubernetes Sealed Secrets.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "473b3d7",
    "languages": [
      "Python",
      "HCL / Terraform"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "policy.hcl",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Secret Management Studio",
        "studioId": "secrets",
        "path": "/tools/secrets/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-chaos": {
    "id": "tp-chaos",
    "repo": "Pradeeptalari14/tp-chaos",
    "title": "Chaos Engineering Studio",
    "desc": "Scaffold Chaos Mesh experiment definitions, container stress simulations, and resilience validation runbooks.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "76cfd31",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "experiment.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Chaos Engineering Studio",
        "studioId": "chaos",
        "path": "/tools/chaos/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-mesh": {
    "id": "tp-mesh",
    "repo": "Pradeeptalari14/tp-mesh",
    "title": "Service Mesh Studio",
    "desc": "Configure Istio/Linkerd canary traffic rules, Envoy circuit breakers, and mutual TLS (mTLS) egress gateways.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "45e1296",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "routing.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Service Mesh Studio",
        "studioId": "mesh",
        "path": "/tools/mesh/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-tracing": {
    "id": "tp-tracing",
    "repo": "Pradeeptalari14/tp-tracing",
    "title": "Distributed Tracing Studio",
    "desc": "Generate OpenTelemetry collector configs, dynamic Python/Go/Node instrumentation scripts, and span latency guides.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "6dd2798",
    "languages": [
      "Python",
      "Go",
      "JavaScript/TypeScript",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "otel_config.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Distributed Tracing Studio",
        "studioId": "tracing",
        "path": "/tools/tracing/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-compliance": {
    "id": "tp-compliance",
    "repo": "Pradeeptalari14/tp-compliance",
    "title": "Policy-as-Code Studio",
    "desc": "Scaffold OPA Rego security policies, Kyverno Kubernetes validation rules, and automated compliance scan runners.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "7d38680",
    "languages": [
      "Go"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "policy.rego",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Policy-as-Code Studio",
        "studioId": "compliance",
        "path": "/tools/compliance/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-db-migration": {
    "id": "tp-db-migration",
    "repo": "Pradeeptalari14/tp-db-migration",
    "title": "Database Migration Studio",
    "desc": "Scaffold Liquibase YAML changesets, Flyway SQL DDL migrations, and automated schema rollback recovery scripts.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "348c9cf",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "migration.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Database Migration Studio",
        "studioId": "db-migration",
        "path": "/tools/db-migration/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-performance": {
    "id": "tp-performance",
    "repo": "Pradeeptalari14/tp-performance",
    "title": "Performance Studio",
    "desc": "Generate k6 Javascript loads, Locust Python tasks, and execution runbooks for system scalability benchmarking.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "4c30a9a",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "load_test.js"
    ],
    "studioBridge": [
      {
        "component": "Performance Studio",
        "studioId": "performance",
        "path": "/tools/performance/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-slo": {
    "id": "tp-slo",
    "repo": "Pradeeptalari14/tp-slo",
    "title": "SLO & Error Budget Studio",
    "desc": "Scaffold Prometheus alert rules, ServiceLevelObjective Kubernetes CRDs, and SRE incident response rules.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "33cd5d9",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Kubernetes",
      "Prometheus"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "slo_rules.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "SLO & Error Budget Studio",
        "studioId": "slo",
        "path": "/tools/slo/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-sast": {
    "id": "tp-sast",
    "repo": "Pradeeptalari14/tp-sast",
    "title": "SAST Security Studio",
    "desc": "Generate custom Semgrep rules, Trivy ignores, and automated CI security scanning workflows.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "45de7e2",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "rules.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "SAST Security Studio",
        "studioId": "sast",
        "path": "/tools/sast/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-finops": {
    "id": "tp-finops",
    "repo": "Pradeeptalari14/tp-finops",
    "title": "FinOps Studio",
    "desc": "Generate Cloud Custodian sweep policies, AWS/GCP resource cleaner scripts, and cost anomaly alerts.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "5df804c",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "cleanup.py"
    ],
    "studioBridge": [
      {
        "component": "FinOps Studio",
        "studioId": "finops",
        "path": "/tools/finops/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-dns-ssl": {
    "id": "tp-dns-ssl",
    "repo": "Pradeeptalari14/tp-dns-ssl",
    "title": "DNS & SSL PKI Studio",
    "desc": "Scaffold Certbot Let's Encrypt cron renewal scripts, Route53/Cloudflare record templates, and domain expiry checks.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "3ddbb11",
    "languages": [
      "Shell"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "renew_certs.sh"
    ],
    "studioBridge": [
      {
        "component": "DNS & SSL PKI Studio",
        "studioId": "dns-ssl",
        "path": "/tools/dns-ssl/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-backup-dr": {
    "id": "tp-backup-dr",
    "repo": "Pradeeptalari14/tp-backup-dr",
    "title": "Backup & DR Studio",
    "desc": "Generate Velero Kubernetes backup policies, database snapshot automation, and disaster recovery restore runbooks.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "1dc1a99",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "backup_job.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Backup & DR Studio",
        "studioId": "backup-dr",
        "path": "/tools/backup-dr/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-event-sre": {
    "id": "tp-event-sre",
    "repo": "Pradeeptalari14/tp-event-sre",
    "title": "AWS Event-Driven & Messaging SRE Studio",
    "desc": "Orchestrate enterprise event routing and queue networks. Generate secure SQS policies, EventBridge bus rules, event simulators, and visual topologies.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "6cbc31d",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "sqs-policy.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AWS Event-Driven & Messaging SRE Studio",
        "studioId": "event-sre",
        "path": "/tools/event-sre/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-github-gov": {
    "id": "tp-github-gov",
    "repo": "Pradeeptalari14/tp-github-gov",
    "title": "GitHub Org Governance & CodeOwners Studio",
    "desc": "Automate repository configuration and review standards. Generate CODEOWNERS controls, branch protection API payloads, and pipeline security rules.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "139b2f9",
    "languages": [
      "Go"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "CODEOWNERS",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GitHub Org Governance & CodeOwners Studio",
        "studioId": "github-gov",
        "path": "/tools/github-gov/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-cloudflare-zero-trust": {
    "id": "tp-cloudflare-zero-trust",
    "repo": "Pradeeptalari14/tp-cloudflare-zero-trust",
    "title": "Cloudflare Zero Trust & Tunneling Studio",
    "desc": "Design secure, VPN-less access to local and cloud resources. Generate cloudflared daemon settings, access authentication policies, and ingress mapping scripts.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "5deab20",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "config.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Cloudflare Zero Trust & Tunneling Studio",
        "studioId": "cloudflare-zero-trust",
        "path": "/tools/cloudflare-zero-trust/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-localstack-dev": {
    "id": "tp-localstack-dev",
    "repo": "Pradeeptalari14/tp-localstack-dev",
    "title": "Docker Compose & LocalStack Dev Studio",
    "desc": "Scaffold sandbox emulation networks for fast local development. Generate compose stacks with PostgreSQL, Redis, and bootstrap scripts for offline AWS S3/SQS/DynamoDB services.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "6901284",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker Compose",
      "Redis",
      "PostgreSQL"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM",
      "Redis 7.2",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "docker-compose.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Docker Compose & LocalStack Dev Studio",
        "studioId": "localstack-dev",
        "path": "/tools/localstack-dev/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-local-cloud-dev": {
    "id": "tp-local-cloud-dev",
    "repo": "Pradeeptalari14/tp-local-cloud-dev",
    "title": "Docker Compose & Local Cloud Dev Studio",
    "desc": "Scaffold custom multi-cloud local sandboxes (AWS, Azure, GCP APIs). Generate private, telemetry-free compose stacks with Postgres, Redis, and setup scripts using custom 7-series ports.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "564dfcb",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker Compose",
      "Redis",
      "PostgreSQL"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM",
      "Redis 7.2",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "docker-compose.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Docker Compose & Local Cloud Dev Studio",
        "studioId": "local-cloud-dev",
        "path": "/tools/local-cloud-dev/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-status-incident": {
    "id": "tp-status-incident",
    "repo": "Pradeeptalari14/tp-status-incident",
    "title": "Status & Incident Studio",
    "desc": "Scaffold PagerDuty/Opsgenie escalation chains, status dashboard config schemas, and incident triage runbooks.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "73fe5ef",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "status_page.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Status & Incident Studio",
        "studioId": "status-incident",
        "path": "/tools/status-incident/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-api-gateway": {
    "id": "tp-api-gateway",
    "repo": "Pradeeptalari14/tp-api-gateway",
    "title": "API Gateway Studio",
    "desc": "Scaffold Nginx ingress, Traefik routes, rate limit headers, and routing proxies.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "5e362fc",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "nginx.conf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "API Gateway Studio",
        "studioId": "api-gateway",
        "path": "/tools/api-gateway/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gitops-secrets": {
    "id": "tp-gitops-secrets",
    "repo": "Pradeeptalari14/tp-gitops-secrets",
    "title": "GitOps Secrets Studio",
    "desc": "Generate Mozilla SOPS configs, Age encrypted keys, and GitOps decryption runners.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "51fa7f9",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      ".sops.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GitOps Secrets Studio",
        "studioId": "gitops-secrets",
        "path": "/tools/gitops-secrets/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-idp-template": {
    "id": "tp-idp-template",
    "repo": "Pradeeptalari14/tp-idp-template",
    "title": "IDP Template Studio",
    "desc": "Scaffold Backstage service catalog metadata and developer software scaffolding templates.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "6812f44",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "template.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "IDP Template Studio",
        "studioId": "idp-template",
        "path": "/tools/idp-template/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-progressive-delivery": {
    "id": "tp-progressive-delivery",
    "repo": "Pradeeptalari14/tp-progressive-delivery",
    "title": "Progressive Delivery Studio",
    "desc": "Generate Argo Rollouts canary releases, metrics analysis templates, and OpenFeature flag schemas.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "39859ea",
    "languages": [
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "rollout.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Progressive Delivery Studio",
        "studioId": "progressive-delivery",
        "path": "/tools/progressive-delivery/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-edge-wasm": {
    "id": "tp-edge-wasm",
    "repo": "Pradeeptalari14/tp-edge-wasm",
    "title": "Edge WASM Studio",
    "desc": "Orchestrate WebAssembly edge functions, Fermyon Spin configurations, and lightweight serverless runtimes.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "63e7a55",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "spin.toml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Edge WASM Studio",
        "studioId": "edge-wasm",
        "path": "/tools/edge-wasm/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-container-registry": {
    "id": "tp-container-registry",
    "repo": "Pradeeptalari14/tp-container-registry",
    "title": "Container Registry Studio",
    "desc": "Generate Cosign image signing scripts, Harbor tag retention rules, and registry configurations.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "5d5e106",
    "languages": [
      "Shell"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "sign_image.sh"
    ],
    "studioBridge": [
      {
        "component": "Container Registry Studio",
        "studioId": "container-registry",
        "path": "/tools/container-registry/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-db-clustering": {
    "id": "tp-db-clustering",
    "repo": "Pradeeptalari14/tp-db-clustering",
    "title": "Database Clustering Studio",
    "desc": "Scaffold Postgres Patroni failover configurations, Redis Sentinel topologies, and cluster sync guides.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "6e36b93",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Redis",
      "PostgreSQL"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "patroni.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Database Clustering Studio",
        "studioId": "db-clustering",
        "path": "/tools/db-clustering/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ebpf-tracing": {
    "id": "tp-ebpf-tracing",
    "repo": "Pradeeptalari14/tp-ebpf-tracing",
    "title": "eBPF Tracing Studio",
    "desc": "Generate kernel-level socket filters, Cilium network policies, and bpftrace performance scripts.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "747a97f",
    "languages": [
      "Go"
    ],
    "frameworks": [
      "Cilium / eBPF"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "ebpf_program.c",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "eBPF Tracing Studio",
        "studioId": "ebpf-tracing",
        "path": "/tools/ebpf-tracing/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-greenops": {
    "id": "tp-greenops",
    "repo": "Pradeeptalari14/tp-greenops",
    "title": "GreenOps Studio",
    "desc": "Generate Kepler telemetry rules, carbon-intensity scheduling crons, and cost/carbon-offset SRE runbooks.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "7405dd0",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "kepler_policy.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GreenOps Studio",
        "studioId": "greenops",
        "path": "/tools/greenops/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-confidential-enclave": {
    "id": "tp-confidential-enclave",
    "repo": "Pradeeptalari14/tp-confidential-enclave",
    "title": "Confidential Enclave Studio",
    "desc": "Orchestrate Intel SGX, AMD SEV, and AWS Nitro Enclaves. Generate attestation scripts and key-rotation pipelines.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "30330dd",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "enclave_config.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Confidential Enclave Studio",
        "studioId": "confidential-enclave",
        "path": "/tools/confidential-enclave/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-decentralized-infra": {
    "id": "tp-decentralized-infra",
    "repo": "Pradeeptalari14/tp-decentralized-infra",
    "title": "Decentralized Infrastructure Studio",
    "desc": "Monitor IPFS and blockchain nodes. Generate validator check scripts, peer discovery rules, and status alerts.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "37d28aa",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "ipfs_daemon.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Decentralized Infrastructure Studio",
        "studioId": "decentralized-infra",
        "path": "/tools/decentralized-infra/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-dataops": {
    "id": "tp-dataops",
    "repo": "Pradeeptalari14/tp-dataops",
    "title": "DataOps Studio",
    "desc": "Scaffold Apache Airflow / Prefect pipeline DAGs, Great Expectations data quality test schemas, and database sync verification.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "27d25c7",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "airflow_dag.py"
    ],
    "studioBridge": [
      {
        "component": "DataOps Studio",
        "studioId": "dataops",
        "path": "/tools/dataops/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-aiops": {
    "id": "tp-aiops",
    "repo": "Pradeeptalari14/tp-aiops",
    "title": "AIOps Studio",
    "desc": "Generate Prometheus PromQL anomaly detection rules (double exponential smoothing, z-scores), Logstash filters, and Python anomaly checkers.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "76eb590",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Prometheus"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "prometheus_anomaly.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AIOps Studio",
        "studioId": "aiops",
        "path": "/tools/aiops/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-systemd-builder": {
    "id": "tp-systemd-builder",
    "repo": "Pradeeptalari14/tp-systemd-builder",
    "title": "Systemd Service Builder",
    "desc": "Generate robust systemd unit files (Services, Timers, Sockets, Paths). Test systemctl lifecycle transitions, status checks, and unit logs dynamically in a simulated Linux terminal.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "3f9ca76",
    "languages": [
      "Shell"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "systemd.service",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Systemd Service Builder",
        "studioId": "systemd-builder",
        "path": "/tools/systemd-builder/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vpc-subnetter": {
    "id": "tp-vpc-subnetter",
    "repo": "Pradeeptalari14/tp-vpc-subnetter",
    "title": "VPC Subnetting Calculator",
    "desc": "Slice CIDR blocks into optimized public and private subnets across multi-AZ configurations. Visualize real-time SVG network topologies with routing, NAT gateways, and export HCL/CLI blueprints.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "23cfb62",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "vpc_config.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "VPC Subnetting Calculator",
        "studioId": "vpc-subnetter",
        "path": "/tools/vpc-subnetter/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-nginx-config": {
    "id": "tp-nginx-config",
    "repo": "Pradeeptalari14/tp-nginx-config",
    "title": "Nginx Configurator",
    "desc": "Build production-grade nginx.conf files. Configure upstreams, rate limiters, security headers, SSL, compression, and visualize live traffic routing flowcharts via dynamic Mermaid diagrams.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "40a1888",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "nginx.conf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Nginx Configurator",
        "studioId": "nginx-config",
        "path": "/tools/nginx-config/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-k8s-crd": {
    "id": "tp-k8s-crd",
    "repo": "Pradeeptalari14/tp-k8s-crd",
    "title": "Kubernetes CRD Studio",
    "desc": "Design Custom Resource Definitions (CRDs) with strict OpenAPI validation schemas. Generate custom resource custom YAML templates and Go controller struct boilerplate definitions.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "5401621",
    "languages": [
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "crd.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Kubernetes CRD Studio",
        "studioId": "k8s-crd",
        "path": "/tools/k8s-crd/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-trivy": {
    "id": "tp-trivy",
    "repo": "Pradeeptalari14/tp-trivy",
    "title": "Trivy Security Studio",
    "desc": "Configure supply chain vulnerability scans. Generate CLI execution strings, trivy.yaml config files, CI actions, whitelist ignores, and simulate CVE reports in real-time.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "75db98e",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "trivy.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Trivy Security Studio",
        "studioId": "trivy",
        "path": "/tools/trivy/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ai-rules-customizer": {
    "id": "tp-ai-rules-customizer",
    "repo": "Pradeeptalari14/tp-ai-rules-customizer",
    "title": "AI Rules Customizer",
    "desc": "Design custom guardrails and instructions for AI agents. Customize Next.js/FastAPI framework directives, strict styles, and simulate output modifications.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "147a255",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "FastAPI"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      ".cursorrules",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AI Rules Customizer",
        "studioId": "ai-rules-customizer",
        "path": "/tools/ai-rules-customizer/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-falco-auditor": {
    "id": "tp-falco-auditor",
    "repo": "Pradeeptalari14/tp-falco-auditor",
    "title": "Falco Security Auditor",
    "desc": "Build real-time container threat detection rules. Configure syscall conditions, rules macros, alert macros, and simulate runtime violation alerts.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "25aefd2",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "falco_rules.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Falco Security Auditor",
        "studioId": "falco-auditor",
        "path": "/tools/falco-auditor/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-alertmanager-visualizer": {
    "id": "tp-alertmanager-visualizer",
    "repo": "Pradeeptalari14/tp-alertmanager-visualizer",
    "title": "Alertmanager Visualizer",
    "desc": "Design nested alert dispatch trees. Map matching labels, PagerDuty receivers, grouping windows, and visualize alert escalation paths in real-time.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "1fcce6f",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "alertmanager.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Alertmanager Visualizer",
        "studioId": "alertmanager-visualizer",
        "path": "/tools/alertmanager-visualizer/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-dagger-pipelines": {
    "id": "tp-dagger-pipelines",
    "repo": "Pradeeptalari14/tp-dagger-pipelines",
    "title": "Dagger Pipelines Studio",
    "desc": "Construct container-based pipelines running on local docker engines. Generate Go/Python build SDKs, and simulate stages execution workflows.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "8b1b141",
    "languages": [
      "Python",
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Docker Compose"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "dagger.go"
    ],
    "studioBridge": [
      {
        "component": "Dagger Pipelines Studio",
        "studioId": "dagger-pipelines",
        "path": "/tools/dagger-pipelines/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ebpf-generator": {
    "id": "tp-ebpf-generator",
    "repo": "Pradeeptalari14/tp-ebpf-generator",
    "title": "eBPF Tracing Generator",
    "desc": "Generate eBPF C program filters and Python/Go loader scripts. Monitor kprobes and tracepoints, and view live tracing logs output simulations.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "25df704",
    "languages": [
      "Python",
      "Go"
    ],
    "frameworks": [
      "Cilium / eBPF"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "kprobe.bpf.c",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "eBPF Tracing Generator",
        "studioId": "ebpf-generator",
        "path": "/tools/ebpf-generator/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-crossplane-studio": {
    "id": "tp-crossplane-studio",
    "repo": "Pradeeptalari14/tp-crossplane-studio",
    "title": "Crossplane Cloud Studio",
    "desc": "Build compostable cloud resources. Generate composite resource definitions (XRDs), cross-cloud compositions, and claims maps visualizer.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "3a5ff99",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "composition.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Crossplane Cloud Studio",
        "studioId": "crossplane-studio",
        "path": "/tools/crossplane-studio/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-knative-routing": {
    "id": "tp-knative-routing",
    "repo": "Pradeeptalari14/tp-knative-routing",
    "title": "Knative Serverless Studio",
    "desc": "Configure serverless knative services with scale-to-zero thresholds. Map event-driven broker triggers and simulate live scaling container logs.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "3b098ce",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "service.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Knative Serverless Studio",
        "studioId": "knative-routing",
        "path": "/tools/knative-routing/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-karpenter-autoscaler": {
    "id": "tp-karpenter-autoscaler",
    "repo": "Pradeeptalari14/tp-karpenter-autoscaler",
    "title": "Karpenter Node Autoscaler",
    "desc": "Provision rapid Kubernetes nodes based on pending workload constraints. Pack pods dynamically by GPU, architecture, spot/on-demand ratios, and simulate EKS costs.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "682a1b1",
    "languages": [
      "JavaScript/TypeScript",
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Kubernetes v1.30",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "nodepool.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Karpenter Node Autoscaler",
        "studioId": "karpenter-autoscaler",
        "path": "/tools/karpenter-autoscaler/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-keda-scaling": {
    "id": "tp-keda-scaling",
    "repo": "Pradeeptalari14/tp-keda-scaling",
    "title": "KEDA Autoscaling Studio",
    "desc": "Deploy event-driven horizontal pod autoscaling. Configure scaling bounds from zero based on active queue lag, db tables count, or Prometheus metrics triggers.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "45efbd3",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Prometheus"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "scaledobject.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "KEDA Autoscaling Studio",
        "studioId": "keda-scaling",
        "path": "/tools/keda-scaling/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-otel-configurator": {
    "id": "tp-otel-configurator",
    "repo": "Pradeeptalari14/tp-otel-configurator",
    "title": "OpenTelemetry Collector",
    "desc": "Design high-performance telemetry pipelines. Build nested configurations for traces/metrics processors, custom exporter endpoints, and verify logs routes.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "62c992f",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "otel-collector.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "OpenTelemetry Collector",
        "studioId": "otel-configurator",
        "path": "/tools/otel-configurator/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vector-pipeline": {
    "id": "tp-vector-pipeline",
    "repo": "Pradeeptalari14/tp-vector-pipeline",
    "title": "Vector Log Pipeline Studio",
    "desc": "Build Rust-powered, high-throughput log routing streams. Write Vector Remap Language (VRL) rules, mask sensitive PII/IP fields, and verify JSON transforms.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "6a6a616",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "vector.toml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Vector Log Pipeline Studio",
        "studioId": "vector-pipeline",
        "path": "/tools/vector-pipeline/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-kyverno-policy": {
    "id": "tp-kyverno-policy",
    "repo": "Pradeeptalari14/tp-kyverno-policy",
    "title": "Kyverno Policy Studio",
    "desc": "Design Kubernetes-native policies. Configure validation rules for security contexts, labels, resource requests, and test pod compliance in real-time.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "10be065",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "policy.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Kyverno Policy Studio",
        "studioId": "kyverno-policy",
        "path": "/tools/kyverno-policy/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-github-arc": {
    "id": "tp-github-arc",
    "repo": "Pradeeptalari14/tp-github-arc",
    "title": "GitHub ARC Studio",
    "desc": "Deploy event-driven horizontal actions runners using Actions Runner Controller (ARC). Define runner boundaries and simulate dynamic container scaling.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "139b195",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "runnerset.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GitHub ARC Studio",
        "studioId": "github-arc",
        "path": "/tools/github-arc/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-terraform-drift": {
    "id": "tp-terraform-drift",
    "repo": "Pradeeptalari14/tp-terraform-drift",
    "title": "Terraform Drift Auditor",
    "desc": "Track cloud resource discrepancies. Generate scheduled CronJob auditors, custom drift checks, and trigger auto-reconciliation runbooks.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "612a5de",
    "languages": [
      "HCL / Terraform",
      "Shell"
    ],
    "frameworks": [
      "Terraform"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "drift_audit.sh"
    ],
    "studioBridge": [
      {
        "component": "Terraform Drift Auditor",
        "studioId": "terraform-drift",
        "path": "/tools/terraform-drift/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-fluxcd-gitops": {
    "id": "tp-fluxcd-gitops",
    "repo": "Pradeeptalari14/tp-fluxcd-gitops",
    "title": "FluxCD GitOps Studio",
    "desc": "Configure source controllers and GitOps reconciliation pipelines. Build Repository sources, Kustomizations, and simulate automated cluster sync loops.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "32d60ce",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "gitrepository.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "FluxCD GitOps Studio",
        "studioId": "fluxcd-gitops",
        "path": "/tools/fluxcd-gitops/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-cilium-policy": {
    "id": "tp-cilium-policy",
    "repo": "Pradeeptalari14/tp-cilium-policy",
    "title": "Cilium Policy Studio",
    "desc": "Design secure L3-L7 Kubernetes container networking rules. Scaffold CiliumNetworkPolicies, inspect live traffic flows, and debug DNS blocks using Hubble flow telemetry.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "4ebc7c8",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "cilium-policy.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Cilium Policy Studio",
        "studioId": "cilium-policy",
        "path": "/tools/cilium-policy/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-aws-iam": {
    "id": "tp-aws-iam",
    "repo": "Pradeeptalari14/tp-aws-iam",
    "title": "AWS IAM Policy Analyzer",
    "desc": "Build secure IAM identity-based policies and permission boundaries. Evaluate API call permissions through a step-by-step evaluation logic flow simulator.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "517b8ac",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "iam-policy.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AWS IAM Policy Analyzer",
        "studioId": "aws-iam",
        "path": "/tools/aws-iam/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vault-secrets": {
    "id": "tp-vault-secrets",
    "repo": "Pradeeptalari14/tp-vault-secrets",
    "title": "Vault Secrets Studio",
    "desc": "Configure dynamic secrets engines and PKI certificate authorities. Manage dynamic credentials databases roles, and simulate automated lease TTL countdowns.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "174f419",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "vault-policy.hcl",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Vault Secrets Studio",
        "studioId": "vault-secrets",
        "path": "/tools/vault-secrets/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-tekton-pipeline": {
    "id": "tp-tekton-pipeline",
    "repo": "Pradeeptalari14/tp-tekton-pipeline",
    "title": "Tekton Pipeline Studio",
    "desc": "Author declarative Kubernetes-native CI/CD build definitions. Scaffold Tekton Tasks, Pipelines, and PipelineRuns, and execute interactive DAG steps runs.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "7b2ec65",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "pipeline.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Tekton Pipeline Studio",
        "studioId": "tekton-pipeline",
        "path": "/tools/tekton-pipeline/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-go-utility": {
    "id": "tp-go-utility",
    "repo": "Pradeeptalari14/tp-go-utility",
    "title": "Go SRE Utility Studio",
    "desc": "Deploy high-performance Golang script tasks. Generate parallel HTTP health checkers, log parsing engines, or system metrics exporters with concurrent channels, Dockerfiles, and Makefiles.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "6c3dd17",
    "languages": [
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Docker Compose"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "main.go"
    ],
    "studioBridge": [
      {
        "component": "Go SRE Utility Studio",
        "studioId": "go-utility",
        "path": "/tools/go-utility/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-cloudformation": {
    "id": "tp-cloudformation",
    "repo": "Pradeeptalari14/tp-cloudformation",
    "title": "AWS CloudFormation Studio",
    "desc": "Orchestrate full AWS stacks dynamically. Generate YAML/JSON templates for VPCs, EC2 instances, ECS clusters, S3 buckets, IAM roles, ELB load balancers, CloudWatch metrics, and Route53 DNS records.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "3b9e2d8",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "template.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AWS CloudFormation Studio",
        "studioId": "cloudformation",
        "path": "/tools/cloudformation/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bitbucket": {
    "id": "tp-bitbucket",
    "repo": "Pradeeptalari14/tp-bitbucket",
    "title": "Bitbucket Pipelines Studio",
    "desc": "Design automated continuous integration workflows. Generate .bitbucket-pipelines.yml configs with parallel steps, build caching, Trivy security gates, and SonarQube quality checks.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "6acef0d",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "bitbucket-pipelines.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Bitbucket Pipelines Studio",
        "studioId": "bitbucket",
        "path": "/tools/bitbucket/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-tomcat": {
    "id": "tp-tomcat",
    "repo": "Pradeeptalari14/tp-tomcat",
    "title": "Apache Tomcat Tuning Studio",
    "desc": "Tune and optimize Apache Tomcat middleware services. Generate server.xml connectors, JNDI database connection pools in context.xml, and JVM memory setenv.sh configurations.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "45c0424",
    "languages": [
      "Shell"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "server.xml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Apache Tomcat Tuning Studio",
        "studioId": "tomcat",
        "path": "/tools/tomcat/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-maven": {
    "id": "tp-maven",
    "repo": "Pradeeptalari14/tp-maven",
    "title": "Maven Build Studio",
    "desc": "Orchestrate standard Maven builds. Scaffold structured POM.xml configurations, settings.xml access credentials, compiler plugin rules, and dependency scanning gates.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "7645c90",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "pom.xml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Maven Build Studio",
        "studioId": "maven",
        "path": "/tools/maven/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-sonarqube": {
    "id": "tp-sonarqube",
    "repo": "Pradeeptalari14/tp-sonarqube",
    "title": "SonarQube Quality Gate Studio",
    "desc": "Configure automated static code quality analysis. Generate sonar-project.properties specifications, define directory exclusions, coverage minimum targets, and check gates.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "623a84e",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "sonar-project.properties",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "SonarQube Quality Gate Studio",
        "studioId": "sonarqube",
        "path": "/tools/sonarqube/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-agile-itsm": {
    "id": "tp-agile-itsm",
    "repo": "Pradeeptalari14/tp-agile-itsm",
    "title": "Agile & ITSM Studio",
    "desc": "Automate IT service management delivery. Generate REST API request payloads and scripts to automate ServiceNow changes, Jira issue trackers, and PagerDuty alert triggers.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "7028ba2",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "servicenow-change.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Agile & ITSM Studio",
        "studioId": "agile-itsm",
        "path": "/tools/agile-itsm/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-pulumi": {
    "id": "tp-pulumi",
    "repo": "Pradeeptalari14/tp-pulumi",
    "title": "Pulumi Infrastructure Studio",
    "desc": "Compile cloud native infrastructure. Generate Pulumi stack configurations, write deployment scripts in TypeScript, Python, or Go, manage state backends, and configure deployment pipelines.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "4c3f472",
    "languages": [
      "Python",
      "Go",
      "JavaScript/TypeScript",
      "HCL / Terraform",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "Pulumi.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Pulumi Infrastructure Studio",
        "studioId": "pulumi",
        "path": "/tools/pulumi/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-qlora-tuning": {
    "id": "tp-qlora-tuning",
    "repo": "Pradeeptalari14/tp-qlora-tuning",
    "title": "SLM Fine-Tuning & Quantization Studio",
    "desc": "Design parameter-efficient fine-tuning pipelines. Generate PEFT QLoRA python scripts, select base models, configure quantization boundaries, and compile GGUF outputs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "13144c9",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "finetune.py"
    ],
    "studioBridge": [
      {
        "component": "SLM Fine-Tuning & Quantization Studio",
        "studioId": "qlora-tuning",
        "path": "/tools/qlora-tuning/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-promptops": {
    "id": "tp-promptops",
    "repo": "Pradeeptalari14/tp-promptops",
    "title": "Prompt Registry & Versioning Studio",
    "desc": "Manage prompts as code. Generate prompt models yaml configurations, manage system and user templates versions, route models dynamically, and configure GitOps prompt integrations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "61e130b",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "prompts.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Prompt Registry & Versioning Studio",
        "studioId": "promptops",
        "path": "/tools/promptops/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-modelops-gitops": {
    "id": "tp-modelops-gitops",
    "repo": "Pradeeptalari14/tp-modelops-gitops",
    "title": "Hugging Face & GitLFS Sync Studio",
    "desc": "Automate large models retrieval. Generate GitLFS sync scripts, Kubernetes model storage mount manifests, and checksum hash verification workflows for Hugging Face repositories.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5070284",
    "languages": [
      "Python",
      "Shell"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "sync-model.sh"
    ],
    "studioBridge": [
      {
        "component": "Hugging Face & GitLFS Sync Studio",
        "studioId": "modelops-gitops",
        "path": "/tools/modelops-gitops/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-llm-redteaming": {
    "id": "tp-llm-redteaming",
    "repo": "Pradeeptalari14/tp-llm-redteaming",
    "title": "LLM Red Teaming & Vulnerability Scanner Studio",
    "desc": "Design automated red-teaming pipelines for LLM security audits. Generate Garak vulnerability scan configs, select security probe targets, and verify alignment thresholds.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1615f6f",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "garak-config.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "LLM Red Teaming & Vulnerability Scanner Studio",
        "studioId": "llm-redteaming",
        "path": "/tools/llm-redteaming/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-synthetic-data": {
    "id": "tp-synthetic-data",
    "repo": "Pradeeptalari14/tp-synthetic-data",
    "title": "AI Synthetic Data Generator Studio",
    "desc": "Design synthetic training datasets pipelines. Generate python scripts for programmatic data synthesis, select pipeline topologies, configure schemas, and format output streams.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "2dc644a",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "generate-dataset.py"
    ],
    "studioBridge": [
      {
        "component": "AI Synthetic Data Generator Studio",
        "studioId": "synthetic-data",
        "path": "/tools/synthetic-data/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gpu-scheduler": {
    "id": "tp-gpu-scheduler",
    "repo": "Pradeeptalari14/tp-gpu-scheduler",
    "title": "GPU Scheduler & K8s Allocator Studio",
    "desc": "Optimize multi-instance GPU partitions, configure dynamic resource allocations, and customize Kueue fair-share batch scheduling policies in Kubernetes configurations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7da23cb",
    "languages": [
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "gpu-policy.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GPU Scheduler & K8s Allocator Studio",
        "studioId": "gpu-scheduler",
        "path": "/tools/gpu-scheduler/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-mcp-server": {
    "id": "tp-mcp-server",
    "repo": "Pradeeptalari14/tp-mcp-server",
    "title": "MCP Server Builder Studio",
    "desc": "Build custom Model Context Protocol (MCP) servers. Register local execution tools, configure SRE metrics databases as resource schemas, and export runnable server scripts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7ffaf53",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "mcp-server.py"
    ],
    "studioBridge": [
      {
        "component": "MCP Server Builder Studio",
        "studioId": "mcp-server",
        "path": "/tools/mcp-server/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-agent-workflow": {
    "id": "tp-agent-workflow",
    "repo": "Pradeeptalari14/tp-agent-workflow",
    "title": "AI Agentic Workflow Compiler Studio",
    "desc": "Design robust multi-agent orchestration frameworks. Generate workflow graph execution files, define agent persona capabilities, select communication protocols, and register tools hooks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5ae204f",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "agent-workflow.py"
    ],
    "studioBridge": [
      {
        "component": "AI Agentic Workflow Compiler Studio",
        "studioId": "agent-workflow",
        "path": "/tools/agent-workflow/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-search-ai": {
    "id": "tp-azure-search-ai",
    "repo": "Pradeeptalari14/tp-azure-search-ai",
    "title": "Azure Cognitive Search AI Studio",
    "desc": "Build and tune Azure Cognitive Search indexes with integrated Azure OpenAI embeddings. Generate search index schemas, indexing pull pipelines, and vector semantic configs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3b02835",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "search_config.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure Cognitive Search AI Studio",
        "studioId": "azure-search-ai",
        "path": "/tools/azure-search-ai/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-vertex-ai": {
    "id": "tp-gcp-vertex-ai",
    "repo": "Pradeeptalari14/tp-gcp-vertex-ai",
    "title": "GCP Vertex AI Model Registry Studio",
    "desc": "Deploy and track models in Vertex AI Model Registry. Generate batch prediction pipelines, model endpoint deployment specifications, and IAM service account bindings.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "12e9f01",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "vertex_deploy.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Vertex AI Model Registry Studio",
        "studioId": "gcp-vertex-ai",
        "path": "/tools/gcp-vertex-ai/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-aks": {
    "id": "tp-azure-aks",
    "repo": "Pradeeptalari14/tp-azure-aks",
    "title": "Azure AKS Cluster Studio",
    "desc": "Orchestrate enterprise AKS clusters. Generate Terraform HCL, AKS network policies, azure-cni overlays, and Active Directory pod identity bindings.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "361a373",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Terraform"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "aks_cluster.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure AKS Cluster Studio",
        "studioId": "azure-aks",
        "path": "/tools/azure-aks/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-app-service": {
    "id": "tp-azure-app-service",
    "repo": "Pradeeptalari14/tp-azure-app-service",
    "title": "Azure App Service Deployer",
    "desc": "Configure highly available Azure App Service plans. Generate slot deployments configurations, custom domain binds, dynamic logging profiles, and scaling templates.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "7711104",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "webapp_config.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure App Service Deployer",
        "studioId": "azure-app-service",
        "path": "/tools/azure-app-service/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-arc": {
    "id": "tp-azure-arc",
    "repo": "Pradeeptalari14/tp-azure-arc",
    "title": "Azure Arc Hybrid Management Studio",
    "desc": "Extend Azure control plane to external Kubernetes and bare-metal nodes. Generate onboarding scripts, policy assignments, and Azure Monitor telemetry agents bindings.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "361a380",
    "languages": [
      "JavaScript/TypeScript",
      "Shell"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "arc_onboard.sh"
    ],
    "studioBridge": [
      {
        "component": "Azure Arc Hybrid Management Studio",
        "studioId": "azure-arc",
        "path": "/tools/azure-arc/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-gke-autopilot": {
    "id": "tp-gcp-gke-autopilot",
    "repo": "Pradeeptalari14/tp-gcp-gke-autopilot",
    "title": "GCP GKE Autopilot Cluster Studio",
    "desc": "Provision fully managed Kubernetes setups in GCP GKE Autopilot. Generate terraform manifests, workload identity pools, and target regional load balancer rules.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "724bd79",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Kubernetes",
      "Terraform"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "gke_autopilot.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP GKE Autopilot Cluster Studio",
        "studioId": "gcp-gke-autopilot",
        "path": "/tools/gcp-gke-autopilot/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-cloud-run": {
    "id": "tp-gcp-cloud-run",
    "repo": "Pradeeptalari14/tp-gcp-cloud-run",
    "title": "GCP Cloud Run Serverless Studio",
    "desc": "Configure serverless container applications on Google Cloud Run. Generate service definitions, VPC connectors, custom Domain mappings, and scaling limits configs.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "25fd09e",
    "languages": [
      "Go",
      "HCL / Terraform"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "cloud_run.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Cloud Run Serverless Studio",
        "studioId": "gcp-cloud-run",
        "path": "/tools/gcp-cloud-run/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-anthos": {
    "id": "tp-gcp-anthos",
    "repo": "Pradeeptalari14/tp-gcp-anthos",
    "title": "GCP Anthos Service Mesh Studio",
    "desc": "Orchestrate multi-cluster service mesh across hybrid clouds. Generate mesh configs, mTLS egress/ingress rules, and telemetry log dashboards configurations.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "57eb4e3",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "asm_policy.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Anthos Service Mesh Studio",
        "studioId": "gcp-anthos",
        "path": "/tools/gcp-anthos/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-devops-pipelines": {
    "id": "tp-azure-devops-pipelines",
    "repo": "Pradeeptalari14/tp-azure-devops-pipelines",
    "title": "Azure DevOps Pipelines Studio",
    "desc": "Author robust pipeline tasks for Azure DevOps. Generate multi-stage YAML pipelines, agent pool targets, secret library links, and sonarqube scans gates.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "d6eab50",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "azure-pipelines.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure DevOps Pipelines Studio",
        "studioId": "azure-devops-pipelines",
        "path": "/tools/azure-devops-pipelines/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-cloud-build": {
    "id": "tp-gcp-cloud-build",
    "repo": "Pradeeptalari14/tp-gcp-cloud-build",
    "title": "GCP Cloud Build Studio",
    "desc": "Configure secure continuous build tasks on GCP. Generate cloudbuild.yaml workflows, Artifact Registry push stages, and secrets decrypter triggers.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "65ff49b",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "cloudbuild.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Cloud Build Studio",
        "studioId": "gcp-cloud-build",
        "path": "/tools/gcp-cloud-build/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-bicep-arm": {
    "id": "tp-azure-bicep-arm",
    "repo": "Pradeeptalari14/tp-azure-bicep-arm",
    "title": "Azure Bicep/ARM Studio",
    "desc": "Design modular declarative configurations for Azure. Generate Bicep templates, nested parameter configuration files, and target resource group scopes definitions.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "5636732",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "main.bicep",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure Bicep/ARM Studio",
        "studioId": "azure-bicep-arm",
        "path": "/tools/azure-bicep-arm/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-acr-secure": {
    "id": "tp-azure-acr-secure",
    "repo": "Pradeeptalari14/tp-azure-acr-secure",
    "title": "Azure ACR Security Guardrails",
    "desc": "Secure Azure Container Registries. Generate ACR access controls, content trust validation settings, image signing tasks, and Defender security triggers.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "7142cb7",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "acr_policy.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure ACR Security Guardrails",
        "studioId": "azure-acr-secure",
        "path": "/tools/azure-acr-secure/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-key-vault": {
    "id": "tp-azure-key-vault",
    "repo": "Pradeeptalari14/tp-azure-key-vault",
    "title": "Azure Key Vault Secret Manager",
    "desc": "Manage cloud credentials securely. Generate Key Vault policies configurations, certificate rotation schedulers, and dynamic secrets retrieval scripts.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "19bfd63",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "keyvault.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure Key Vault Secret Manager",
        "studioId": "azure-key-vault",
        "path": "/tools/azure-key-vault/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-functions": {
    "id": "tp-azure-functions",
    "repo": "Pradeeptalari14/tp-azure-functions",
    "title": "Azure Functions Studio",
    "desc": "Scaffold event-driven Azure Function apps. Generate serverless trigger bindings (Http, Queue, Timer), host settings configurations, and deployment packages.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "375b037",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "function.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure Functions Studio",
        "studioId": "azure-functions",
        "path": "/tools/azure-functions/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-deployment-manager": {
    "id": "tp-gcp-deployment-manager",
    "repo": "Pradeeptalari14/tp-gcp-deployment-manager",
    "title": "GCP Deployment Manager Studio",
    "desc": "Build declarative layout sheets for GCP. Generate Python/YAML templates, specify resource properties, and manage nested deployment structures.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "2d476e6",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "deployment.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Deployment Manager Studio",
        "studioId": "gcp-deployment-manager",
        "path": "/tools/gcp-deployment-manager/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-secret-manager": {
    "id": "tp-gcp-secret-manager",
    "repo": "Pradeeptalari14/tp-gcp-secret-manager",
    "title": "GCP Secret Manager Studio",
    "desc": "Store and manage API keys and keys versions on Google Cloud. Generate secret replication configurations, access permission maps, and programmatic retrieval SDKs.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "2cf2a3a",
    "languages": [
      "Go",
      "HCL / Terraform"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "secret_config.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Secret Manager Studio",
        "studioId": "gcp-secret-manager",
        "path": "/tools/gcp-secret-manager/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-cloud-functions": {
    "id": "tp-gcp-cloud-functions",
    "repo": "Pradeeptalari14/tp-gcp-cloud-functions",
    "title": "GCP Cloud Functions Studio",
    "desc": "Scaffold Google Cloud serverless triggers. Generate Node.js/Python functions, Pub/Sub trigger configurations, IAM access permissions, and deploy scripts.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "11d3278",
    "languages": [
      "Python",
      "Go",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Cloud Functions Studio",
        "studioId": "gcp-cloud-functions",
        "path": "/tools/gcp-cloud-functions/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-cloud-spanner": {
    "id": "tp-gcp-cloud-spanner",
    "repo": "Pradeeptalari14/tp-gcp-cloud-spanner",
    "title": "GCP Cloud Spanner Studio",
    "desc": "Design globally distributed Cloud Spanner SQL schemas. Generate instance configurations, DDL database setups, and optimized database session pool limits.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "6901999",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "spanner_ddl.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Cloud Spanner Studio",
        "studioId": "gcp-cloud-spanner",
        "path": "/tools/gcp-cloud-spanner/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-azure-monitor": {
    "id": "tp-azure-monitor",
    "repo": "Pradeeptalari14/tp-azure-monitor",
    "title": "Azure Monitor & Log Analytics Studio",
    "desc": "Configure enterprise diagnostic logs sinks. Generate Log Analytics workspaces templates, Kusto Query Language (KQL) SRE alert monitors, and diagnostic metrics bindings.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "24e13a8",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "monitor_rules.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Azure Monitor & Log Analytics Studio",
        "studioId": "azure-monitor",
        "path": "/tools/azure-monitor/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gcp-cloud-operations": {
    "id": "tp-gcp-cloud-operations",
    "repo": "Pradeeptalari14/tp-gcp-cloud-operations",
    "title": "GCP Cloud Operations Monitoring Studio",
    "desc": "Design alert policies and dashboards for Google Cloud (Stackdriver). Generate MQL metric alerts, uptime checkpoints, and webhook warning routes.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "2493dd3",
    "languages": [
      "Go",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "metrics_dashboard.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GCP Cloud Operations Monitoring Studio",
        "studioId": "gcp-cloud-operations",
        "path": "/tools/gcp-cloud-operations/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-user-genie": {
    "id": "tp-user-genie",
    "repo": "Pradeeptalari14/tp-user-genie",
    "title": "User Genie (Enhanced Agentic RAG)",
    "desc": "Internal on-call engineering copilot deployed within Slack. Connects to Kubernetes clusters and provides fast-or-deep retrieval.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4564842",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "rag_engine.py"
    ],
    "studioBridge": [
      {
        "component": "User Genie (Enhanced Agentic RAG)",
        "studioId": "user-genie",
        "path": "/tools/user-genie/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-knowledgeops-ai": {
    "id": "tp-knowledgeops-ai",
    "repo": "Pradeeptalari14/tp-knowledgeops-ai",
    "title": "KnowledgeOps AI",
    "desc": "Production RAG with full observability, hybrid retrieval pipelines, and integrated Prometheus/Grafana logging templates.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "27dd59d",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Prometheus",
      "Grafana"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "observability_config.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "KnowledgeOps AI",
        "studioId": "knowledgeops-ai",
        "path": "/tools/knowledgeops-ai/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-monvisor": {
    "id": "tp-monvisor",
    "repo": "Pradeeptalari14/tp-monvisor",
    "title": "MonVisor",
    "desc": "AI monitoring configurator that automates local RAG settings and generates Alertmanager YAML alert definitions.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "54e32ea",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "alerts_config.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "MonVisor",
        "studioId": "monvisor",
        "path": "/tools/monvisor/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ragrificant": {
    "id": "tp-ragrificant",
    "repo": "Pradeeptalari14/tp-ragrificant",
    "title": "RAGrificant",
    "desc": "Docker Compose RAG system with health monitoring, automatic restart policies, and Slack notification integrations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "39f91d2",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker Compose"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "docker-compose.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "RAGrificant",
        "studioId": "ragrificant",
        "path": "/tools/ragrificant/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-kuberag-operator": {
    "id": "tp-kuberag-operator",
    "repo": "Pradeeptalari14/tp-kuberag-operator",
    "title": "KubeRAG Operator",
    "desc": "Kubernetes operator managing RAG pipeline health, custom resource definitions (CRDs), and canary rollback loops.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5c3cd99",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "operator_deployment.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "KubeRAG Operator",
        "studioId": "kuberag-operator",
        "path": "/tools/kuberag-operator/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bifrost-rag": {
    "id": "tp-bifrost-rag",
    "repo": "Pradeeptalari14/tp-bifrost-rag",
    "title": "bifrost-rag",
    "desc": "Configurable chunking and retrieval evaluation harness assessing Hit Rate, MRR, and Precision@K metrics.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4dcc235",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "retrieval_harness.py"
    ],
    "studioBridge": [
      {
        "component": "bifrost-rag",
        "studioId": "bifrost-rag",
        "path": "/tools/bifrost-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-select": {
    "id": "tp-rag-select",
    "repo": "Pradeeptalari14/tp-rag-select",
    "title": "rag-select",
    "desc": "Experimentation playground for comparing different vector database search and retrieval pipeline architectures.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "75fdd44",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "architecture_compare.py"
    ],
    "studioBridge": [
      {
        "component": "rag-select",
        "studioId": "rag-select",
        "path": "/tools/rag-select/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-edu": {
    "id": "tp-rag-edu",
    "repo": "Pradeeptalari14/tp-rag-edu",
    "title": "RAG Educational Microservices",
    "desc": "ChromaDB-backed microservices engineered for educational content indexing, adaptive chunking, and text vector representation.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "b9a9e30",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "chroma_indexer.py"
    ],
    "studioBridge": [
      {
        "component": "RAG Educational Microservices",
        "studioId": "rag-edu",
        "path": "/tools/rag-edu/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-retrorag": {
    "id": "tp-retrorag",
    "repo": "Pradeeptalari14/tp-retrorag",
    "title": "RetroRAG",
    "desc": "Diagnostic toolkit for locating weak search queries, generating recall heatmaps, and detecting missing clusters.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "555228e",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "recall_diagnostics.py"
    ],
    "studioBridge": [
      {
        "component": "RetroRAG",
        "studioId": "retrorag",
        "path": "/tools/retrorag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-recallboost": {
    "id": "tp-recallboost",
    "repo": "Pradeeptalari14/tp-recallboost",
    "title": "RecallBoost",
    "desc": "Automated retrieval parameter tuner using Bayesian optimization for optimal Top-K retrieval thresholds.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7cabf56",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "tuner_params.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "RecallBoost",
        "studioId": "recallboost",
        "path": "/tools/recallboost/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-deepeval-pytest": {
    "id": "tp-deepeval-pytest",
    "repo": "Pradeeptalari14/tp-deepeval-pytest",
    "title": "DeepEval + Pytest",
    "desc": "CI/CD friendly validation testing suite using native Pytest assertions and G-Eval context checks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1c27c6a",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "eval_test.py"
    ],
    "studioBridge": [
      {
        "component": "DeepEval + Pytest",
        "studioId": "deepeval-pytest",
        "path": "/tools/deepeval-pytest/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ragas": {
    "id": "tp-ragas",
    "repo": "Pradeeptalari14/tp-ragas",
    "title": "RAGAS Evaluator",
    "desc": "Reference-free RAG evaluation framework measuring faithfulness, context precision, and response recall.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "75ff8c4",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "ragas_eval.py"
    ],
    "studioBridge": [
      {
        "component": "RAGAS Evaluator",
        "studioId": "ragas",
        "path": "/tools/ragas/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-cleanlab-evaluator": {
    "id": "tp-cleanlab-evaluator",
    "repo": "Pradeeptalari14/tp-cleanlab-evaluator",
    "title": "Cleanlab RAG Evaluator",
    "desc": "Groundedness and trustworthiness scoring harness validating context retrieval quality scores.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3e2a0c9",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "trust_evaluator.py"
    ],
    "studioBridge": [
      {
        "component": "Cleanlab RAG Evaluator",
        "studioId": "cleanlab-evaluator",
        "path": "/tools/cleanlab-evaluator/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-truthteller": {
    "id": "tp-truthteller",
    "repo": "Pradeeptalari14/tp-truthteller",
    "title": "TruthTeller Evaluator",
    "desc": "LLM & class-based pipeline evaluator operating without ground truth references using confidence intervals.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6aecf07",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "evaluator_config.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "TruthTeller Evaluator",
        "studioId": "truthteller",
        "path": "/tools/truthteller/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-bench": {
    "id": "tp-rag-bench",
    "repo": "Pradeeptalari14/tp-rag-bench",
    "title": "RAG-Bench",
    "desc": "CLI benchmarking suite featuring predefined datasets (Natural Questions, HotpotQA) and Weights & Biases integrations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "70be0dd",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "benchmark_runner.py"
    ],
    "studioBridge": [
      {
        "component": "RAG-Bench",
        "studioId": "rag-bench",
        "path": "/tools/rag-bench/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-aws-level1-observability": {
    "id": "tp-aws-level1-observability",
    "repo": "Pradeeptalari14/tp-aws-level1-observability",
    "title": "Four-i Level-1 Observability (AWS)",
    "desc": "CloudWatch RAG observability framework capturing retrieval latency metrics and collecting user feedback logs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3f6cef0",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "cloudwatch_dashboard.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Four-i Level-1 Observability (AWS)",
        "studioId": "aws-level1-observability",
        "path": "/tools/aws-level1-observability/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-open-monitor-agent": {
    "id": "tp-open-monitor-agent",
    "repo": "Pradeeptalari14/tp-open-monitor-agent",
    "title": "Open Monitor AI Agent Monitoring",
    "desc": "Open-source Prometheus observability stack mapping agent token costs, latency, and response accuracy in real-time.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "32242d8",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Prometheus"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "grafana_dashboard.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Open Monitor AI Agent Monitoring",
        "studioId": "open-monitor-agent",
        "path": "/tools/open-monitor-agent/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-openlit-rag": {
    "id": "tp-openlit-rag",
    "repo": "Pradeeptalari14/tp-openlit-rag",
    "title": "OpenLIT-RAG & Stack",
    "desc": "Production playground for modular telemetry collector configurations and OpenTelemetry traces.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5820fb7",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "openlit_telemetry.py"
    ],
    "studioBridge": [
      {
        "component": "OpenLIT-RAG & Stack",
        "studioId": "openlit-rag",
        "path": "/tools/openlit-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-radar": {
    "id": "tp-rag-radar",
    "repo": "Pradeeptalari14/tp-rag-radar",
    "title": "RAG Radar",
    "desc": "Embedding drift and query anomaly detector establishing dynamic performance baselines over Elasticsearch indexes.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6fde8d0",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "drift_detector.py"
    ],
    "studioBridge": [
      {
        "component": "RAG Radar",
        "studioId": "rag-radar",
        "path": "/tools/rag-radar/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vigilrag": {
    "id": "tp-vigilrag",
    "repo": "Pradeeptalari14/tp-vigilrag",
    "title": "VigilRAG",
    "desc": "Streamlit-backed telemetry dashboard pulling from Prometheus and Redis to review search performance weekly.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4e3f674",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Prometheus",
      "Redis"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "monitoring_dashboard.py"
    ],
    "studioBridge": [
      {
        "component": "VigilRAG",
        "studioId": "vigilrag",
        "path": "/tools/vigilrag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-tclp": {
    "id": "tp-tclp",
    "repo": "Pradeeptalari14/tp-tclp",
    "title": "tclp Text Fingerprinting",
    "desc": "High-performance text deduplication utility written in Rust. Supports MinHash, LSH, SimHash, and TLSH.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "45de031",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "fingerprint_utils.rs",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "tclp Text Fingerprinting",
        "studioId": "tclp",
        "path": "/tools/tclp/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-dedup4pg": {
    "id": "tp-dedup4pg",
    "repo": "Pradeeptalari14/tp-dedup4pg",
    "title": "dedup4pg",
    "desc": "Database-level duplicate chunk reducer using PostgreSQL LSH buckets and Jaccard threshold SQL queries.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7422014",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "PostgreSQL"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "dedup_trigger.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "dedup4pg",
        "studioId": "dedup4pg",
        "path": "/tools/dedup4pg/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-dedupflow": {
    "id": "tp-dedupflow",
    "repo": "Pradeeptalari14/tp-dedupflow",
    "title": "DedupFlow",
    "desc": "n8n workflow for exact and semantic document deduplication using MD5 hashes and Redis caches.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "10077a0",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Redis"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "dedup_workflow.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "DedupFlow",
        "studioId": "dedupflow",
        "path": "/tools/dedupflow/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-semantic-clean": {
    "id": "tp-semantic-clean",
    "repo": "Pradeeptalari14/tp-semantic-clean",
    "title": "SemanticClean",
    "desc": "Background dedup service mapping doc_hash columns and executing auto-merge policies using Celery and pgvector.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "2ca15d0",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "celery_task.py"
    ],
    "studioBridge": [
      {
        "component": "SemanticClean",
        "studioId": "semantic-clean",
        "path": "/tools/semantic-clean/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-aws-multitenant-rag": {
    "id": "tp-aws-multitenant-rag",
    "repo": "Pradeeptalari14/tp-aws-multitenant-rag",
    "title": "Multi-Tenant RAG with Metadata Filtering (AWS)",
    "desc": "Secure tenant isolation with AWS Bedrock and Cognito groups. Filters queries dynamically by tenant ID.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "55e8653",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "cognito_policy.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Multi-Tenant RAG with Metadata Filtering (AWS)",
        "studioId": "aws-multitenant-rag",
        "path": "/tools/aws-multitenant-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-sharepoint-permissions-pipeline": {
    "id": "tp-sharepoint-permissions-pipeline",
    "repo": "Pradeeptalari14/tp-sharepoint-permissions-pipeline",
    "title": "SharePoint Document Permissions Pipeline",
    "desc": "Ingestion pipeline propagating SharePoint ACL metadata and Entra ID object identifiers for secure search.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "902864a",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "entra_permissions.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "SharePoint Document Permissions Pipeline",
        "studioId": "sharepoint-permissions-pipeline",
        "path": "/tools/sharepoint-permissions-pipeline/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-metadata-aware-rbac": {
    "id": "tp-metadata-aware-rbac",
    "repo": "Pradeeptalari14/tp-metadata-aware-rbac",
    "title": "Metadata-Aware RAG for RBAC",
    "desc": "Chunk-level RBAC enforcement matching user role access attributes inside vector databases payloads.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4173d4e",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "rbac_metadata.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Metadata-Aware RAG for RBAC",
        "studioId": "metadata-aware-rbac",
        "path": "/tools/metadata-aware-rbac/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-opal-opa": {
    "id": "tp-opal-opa",
    "repo": "Pradeeptalari14/tp-opal-opa",
    "title": "OPAL & OPA Policy Controller",
    "desc": "Open Policy Agent integration templates. Evaluates document visibility policies as code in real-time.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "42b4835",
    "languages": [
      "Go"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "policy.rego",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "OPAL & OPA Policy Controller",
        "studioId": "opal-opa",
        "path": "/tools/opal-opa/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-permify-filter": {
    "id": "tp-permify-filter",
    "repo": "Pradeeptalari14/tp-permify-filter",
    "title": "Permify RAG Filter",
    "desc": "Permify authorization filter blocking unauthorized retrieval payloads in PostgreSQL and vector databases.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "24e3e9c",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "PostgreSQL"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "permify_rules.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Permify RAG Filter",
        "studioId": "permify-filter",
        "path": "/tools/permify-filter/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vector-db-rbac": {
    "id": "tp-vector-db-rbac",
    "repo": "Pradeeptalari14/tp-vector-db-rbac",
    "title": "Role-Based Filtering in Vector DBs",
    "desc": "Metadata enforcement rules for Pinecone, Milvus, and Qdrant to filter out document records by role flags.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "385bab2",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "vector_filter.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Role-Based Filtering in Vector DBs",
        "studioId": "vector-db-rbac",
        "path": "/tools/vector-db-rbac/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bedrock-metadata-filtering": {
    "id": "tp-bedrock-metadata-filtering",
    "repo": "Pradeeptalari14/tp-bedrock-metadata-filtering",
    "title": "Amazon Bedrock Knowledge Bases Filtering",
    "desc": "Metadata search filters compiler for Bedrock Knowledge Bases using relational key-value configurations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "523f7bf",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "kb_filter.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Amazon Bedrock Knowledge Bases Filtering",
        "studioId": "bedrock-metadata-filtering",
        "path": "/tools/bedrock-metadata-filtering/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-metaguard": {
    "id": "tp-metaguard",
    "repo": "Pradeeptalari14/tp-metaguard",
    "title": "MetaGuard",
    "desc": "Pydantic schemas validating metadata query templates and rejecting malformed search requests.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "522b09a",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "schema_validation.py"
    ],
    "studioBridge": [
      {
        "component": "MetaGuard",
        "studioId": "metaguard",
        "path": "/tools/metaguard/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-filter-optimizer": {
    "id": "tp-filter-optimizer",
    "repo": "Pradeeptalari14/tp-filter-optimizer",
    "title": "Filter Optimizer",
    "desc": "Query log analyzer recommending composite indexes and filter overrides for vector database clients.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "2ca8005",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "filter_recommendation.py"
    ],
    "studioBridge": [
      {
        "component": "Filter Optimizer",
        "studioId": "filter-optimizer",
        "path": "/tools/filter-optimizer/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-fallback-adaptive": {
    "id": "tp-rag-fallback-adaptive",
    "repo": "Pradeeptalari14/tp-rag-fallback-adaptive",
    "title": "rag-fallback (Adaptive Thresholding)",
    "desc": "Dynamic similarity search and reranker thresholds tuned dynamically based on query profile scores.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "716b89f",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "adaptive_thresholds.py"
    ],
    "studioBridge": [
      {
        "component": "rag-fallback (Adaptive Thresholding)",
        "studioId": "rag-fallback-adaptive",
        "path": "/tools/rag-fallback-adaptive/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-superrag": {
    "id": "tp-superrag",
    "repo": "Pradeeptalari14/tp-superrag",
    "title": "superRAG",
    "desc": "Unified RAG search engine with hybrid weighting scores and similarity cutoff tuning limits.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "40dd2ee",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "hybrid_search.py"
    ],
    "studioBridge": [
      {
        "component": "superRAG",
        "studioId": "superrag",
        "path": "/tools/superrag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-adaptive-rag": {
    "id": "tp-adaptive-rag",
    "repo": "Pradeeptalari14/tp-adaptive-rag",
    "title": "Adaptive-RAG",
    "desc": "Search complexity classifier selecting thin-vs-dense retrieval based on query token entropy.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "75a1a80",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "complexity_classifier.py"
    ],
    "studioBridge": [
      {
        "component": "Adaptive-RAG",
        "studioId": "adaptive-rag",
        "path": "/tools/adaptive-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-threshold-tuner": {
    "id": "tp-threshold-tuner",
    "repo": "Pradeeptalari14/tp-threshold-tuner",
    "title": "Threshold Tuner",
    "desc": "NumPy Grid search script parsing query evaluation datasets to optimize cosine similarity boundaries.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "96b2db9",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "grid_search.py"
    ],
    "studioBridge": [
      {
        "component": "Threshold Tuner",
        "studioId": "threshold-tuner",
        "path": "/tools/threshold-tuner/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-cohere-rerank": {
    "id": "tp-cohere-rerank",
    "repo": "Pradeeptalari14/tp-cohere-rerank",
    "title": "Cohere Rerank (API-based)",
    "desc": "Reranker connector interface leveraging the Cohere rerank API endpoints to extract top-N items.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3e427c2",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "cohere_rerank.py"
    ],
    "studioBridge": [
      {
        "component": "Cohere Rerank (API-based)",
        "studioId": "cohere-rerank",
        "path": "/tools/cohere-rerank/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bge-reranker": {
    "id": "tp-bge-reranker",
    "repo": "Pradeeptalari14/tp-bge-reranker",
    "title": "BGE Reranker v2-gte3",
    "desc": "Local cross-encoder loader running BGE model weights for high-precision local sentence scores.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "564ec81",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "bge_reranker.py"
    ],
    "studioBridge": [
      {
        "component": "BGE Reranker v2-gte3",
        "studioId": "bge-reranker",
        "path": "/tools/bge-reranker/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-synthesis-reranking-service": {
    "id": "tp-synthesis-reranking-service",
    "repo": "Pradeeptalari14/tp-synthesis-reranking-service",
    "title": "Synthesis Reranking Service",
    "desc": "Hybrid reranking aggregator blending Cohere API and local BGE model scores for optimal MRR@10.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3b0e4c3",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "hybrid_reranker.py"
    ],
    "studioBridge": [
      {
        "component": "Synthesis Reranking Service",
        "studioId": "synthesis-reranking-service",
        "path": "/tools/synthesis-reranking-service/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-flashrank": {
    "id": "tp-flashrank",
    "repo": "Pradeeptalari14/tp-flashrank",
    "title": "FlashRank Studio",
    "desc": "Ultra-lightweight CPU-optimized sentence reranker running local ONNX structures.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4d21ca0",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "flashrank_onnx.py"
    ],
    "studioBridge": [
      {
        "component": "FlashRank Studio",
        "studioId": "flashrank",
        "path": "/tools/flashrank/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rerank-gateway": {
    "id": "tp-rerank-gateway",
    "repo": "Pradeeptalari14/tp-rerank-gateway",
    "title": "Rerank Gateway",
    "desc": "Unified FastAPI routing gateway mediating traffic across multiple third-party reranking endpoints.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "49f3c53",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "FastAPI"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "rerank_gateway.py"
    ],
    "studioBridge": [
      {
        "component": "Rerank Gateway",
        "studioId": "rerank-gateway",
        "path": "/tools/rerank-gateway/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-protecrag": {
    "id": "tp-protecrag",
    "repo": "Pradeeptalari14/tp-protecrag",
    "title": "ProtecRAG",
    "desc": "LlamaGuard pipeline scanning retrieved contexts for toxic content and prompt injection payloads.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6d3069a",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "guardrails_rules.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "ProtecRAG",
        "studioId": "protecrag",
        "path": "/tools/protecrag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-prompt-security-firewall": {
    "id": "tp-prompt-security-firewall",
    "repo": "Pradeeptalari14/tp-prompt-security-firewall",
    "title": "PromptSecurity (Firewall)",
    "desc": "JSON-configured proxy firewall auditing raw prompts for bypass patterns and jailbreak attempts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7a0dc90",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "firewall_config.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "PromptSecurity (Firewall)",
        "studioId": "prompt-security-firewall",
        "path": "/tools/prompt-security-firewall/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-guardrails-action": {
    "id": "tp-rag-guardrails-action",
    "repo": "Pradeeptalari14/tp-rag-guardrails-action",
    "title": "RAG Guardrails Action (GitHub Action)",
    "desc": "Vulnerability assessment action auditing repo files for context poisoning vulnerabilities.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "75cbcd7",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "action.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "RAG Guardrails Action (GitHub Action)",
        "studioId": "rag-guardrails-action",
        "path": "/tools/rag-guardrails-action/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-injection-catcher": {
    "id": "tp-injection-catcher",
    "repo": "Pradeeptalari14/tp-injection-catcher",
    "title": "Injection Catcher",
    "desc": "Local transformer classifier running lightweight models to flag malicious inputs under 50ms.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5edacb5",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "injection_detector.py"
    ],
    "studioBridge": [
      {
        "component": "Injection Catcher",
        "studioId": "injection-catcher",
        "path": "/tools/injection-catcher/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-guardian-shield": {
    "id": "tp-guardian-shield",
    "repo": "Pradeeptalari14/tp-guardian-shield",
    "title": "Guardian Shield Proxy",
    "desc": "NGINX reverse proxy leveraging custom Lua scripts to scan prompt payloads at the gateway layer.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "743ab1d",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "nginx_shield.conf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Guardian Shield Proxy",
        "studioId": "guardian-shield",
        "path": "/tools/guardian-shield/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-awesome-chunker": {
    "id": "tp-awesome-chunker",
    "repo": "Pradeeptalari14/tp-awesome-chunker",
    "title": "Awesome-Chunker",
    "desc": "Scaffolding utility generating fixed-size, recursive, or semantic sentence chunking configurations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1cf30f1",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "chunking_harness.py"
    ],
    "studioBridge": [
      {
        "component": "Awesome-Chunker",
        "studioId": "awesome-chunker",
        "path": "/tools/awesome-chunker/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-late-chunking-jina": {
    "id": "tp-late-chunking-jina",
    "repo": "Pradeeptalari14/tp-late-chunking-jina",
    "title": "Late Chunking with Jina",
    "desc": "Vector indexing configs implementing late token chunking for improved document context retention.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "70dbf3b",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "late_chunking.py"
    ],
    "studioBridge": [
      {
        "component": "Late Chunking with Jina",
        "studioId": "late-chunking-jina",
        "path": "/tools/late-chunking-jina/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-finance-chunking": {
    "id": "tp-rag-finance-chunking",
    "repo": "Pradeeptalari14/tp-rag-finance-chunking",
    "title": "RAG Finance Chunking",
    "desc": "Custom text extractor splitting corporate reports and tables into semantic sections with 20% overlap.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4991552",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "finance_chunking.py"
    ],
    "studioBridge": [
      {
        "component": "RAG Finance Chunking",
        "studioId": "rag-finance-chunking",
        "path": "/tools/rag-finance-chunking/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-chunkviz": {
    "id": "tp-chunkviz",
    "repo": "Pradeeptalari14/tp-chunkviz",
    "title": "ChunkViz",
    "desc": "Visualizer interface for reviewing chunk splits, sentence token spans, and overlapping boundaries.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "20b20d3",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "boundary_viz.py"
    ],
    "studioBridge": [
      {
        "component": "ChunkViz",
        "studioId": "chunkviz",
        "path": "/tools/chunkviz/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-smartchunk": {
    "id": "tp-smartchunk",
    "repo": "Pradeeptalari14/tp-smartchunk",
    "title": "SmartChunk",
    "desc": "NLTK-guided semantic segmenter preserving markdown headers, lists, and tables intact.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "31da7a3",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "smart_chunker.py"
    ],
    "studioBridge": [
      {
        "component": "SmartChunk",
        "studioId": "smartchunk",
        "path": "/tools/smartchunk/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-q-embed": {
    "id": "tp-q-embed",
    "repo": "Pradeeptalari14/tp-q-embed",
    "title": "Q-Embed (Quantized Embedding)",
    "desc": "Utility for initializing 1-bit binary and Int8 quantized embedding models for memory optimization.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7df9402",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "quantized_embedding.py"
    ],
    "studioBridge": [
      {
        "component": "Q-Embed (Quantized Embedding)",
        "studioId": "q-embed",
        "path": "/tools/q-embed/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bge-telecom": {
    "id": "tp-bge-telecom",
    "repo": "Pradeeptalari14/tp-bge-telecom",
    "title": "bge-telecom (Telecom Embedding)",
    "desc": "Triplet loss configuration files optimized for tuning embeddings on telecommunication documentation.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3e78744",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "telecom_triplet.py"
    ],
    "studioBridge": [
      {
        "component": "bge-telecom (Telecom Embedding)",
        "studioId": "bge-telecom",
        "path": "/tools/bge-telecom/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-csh-v2-models": {
    "id": "tp-csh-v2-models",
    "repo": "Pradeeptalari14/tp-csh-v2-models",
    "title": "CSH-v2 Models",
    "desc": "Clinical, security, and legal domain embedding models initialization and deployment specifications.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7a787b5",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "domain_embeddings.py"
    ],
    "studioBridge": [
      {
        "component": "CSH-v2 Models",
        "studioId": "csh-v2-models",
        "path": "/tools/csh-v2-models/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-embedding-registry": {
    "id": "tp-embedding-registry",
    "repo": "Pradeeptalari14/tp-embedding-registry",
    "title": "Embedding Registry",
    "desc": "Versioned database repository template linking SQLite model indexes with static cloud storage buckets.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "61430b1",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "registry_schema.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Embedding Registry",
        "studioId": "embedding-registry",
        "path": "/tools/embedding-registry/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-model-drift-detector": {
    "id": "tp-model-drift-detector",
    "repo": "Pradeeptalari14/tp-model-drift-detector",
    "title": "Model Drift Detector",
    "desc": "Audit collector running Kolmogorov-Smirnov statistical tests on embedding output distributions.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "67b54c1",
    "languages": [
      "Python",
      "Go"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "drift_detector.py"
    ],
    "studioBridge": [
      {
        "component": "Model Drift Detector",
        "studioId": "model-drift-detector",
        "path": "/tools/model-drift-detector/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-redis-cesc": {
    "id": "tp-redis-cesc",
    "repo": "Pradeeptalari14/tp-redis-cesc",
    "title": "Redis-CESC",
    "desc": "Semantic prompt cache leveraging cosine similarity scoring inside Redis vector keys.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "db74ccb",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Redis"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "semantic_cache.py"
    ],
    "studioBridge": [
      {
        "component": "Redis-CESC",
        "studioId": "redis-cesc",
        "path": "/tools/redis-cesc/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-langchain-n8n-template": {
    "id": "tp-langchain-n8n-template",
    "repo": "Pradeeptalari14/tp-langchain-n8n-template",
    "title": "LangChain + n8n Template",
    "desc": "Production-ready n8n RAG workflow template with semantic caching and cache hit tracking dashboards.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "510d539",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "LangChain"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "workflow_cache.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "LangChain + n8n Template",
        "studioId": "langchain-n8n-template",
        "path": "/tools/langchain-n8n-template/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-enterprise-semantic-cache": {
    "id": "tp-enterprise-semantic-cache",
    "repo": "Pradeeptalari14/tp-enterprise-semantic-cache",
    "title": "Enterprise-Grade RAG with Semantic Cache",
    "desc": "Modular caching architecture separating prompt validation, schema hashing, and Redis storage calls.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5f9c476",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Redis"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "redis_cache.py"
    ],
    "studioBridge": [
      {
        "component": "Enterprise-Grade RAG with Semantic Cache",
        "studioId": "enterprise-semantic-cache",
        "path": "/tools/enterprise-semantic-cache/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gptsafe-cache": {
    "id": "tp-gptsafe-cache",
    "repo": "Pradeeptalari14/tp-gptsafe-cache",
    "title": "GPTSafe (Semantic Cache)",
    "desc": "Open-source prompt cache using local FAISS indexes and SQLite to bypass repetitive model calls.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "79f7ad6",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "semantic_cache.py"
    ],
    "studioBridge": [
      {
        "component": "GPTSafe (Semantic Cache)",
        "studioId": "gptsafe-cache",
        "path": "/tools/gptsafe-cache/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-cachewarmer": {
    "id": "tp-cachewarmer",
    "repo": "Pradeeptalari14/tp-cachewarmer",
    "title": "CacheWarmer",
    "desc": "Scheduler script pre-computing vector index mappings for frequent queries to reduce latency.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "69b4de2",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "cache_warmer.py"
    ],
    "studioBridge": [
      {
        "component": "CacheWarmer",
        "studioId": "cachewarmer",
        "path": "/tools/cachewarmer/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-langfuse-observability": {
    "id": "tp-langfuse-observability",
    "repo": "Pradeeptalari14/tp-langfuse-observability",
    "title": "Langfuse",
    "desc": "Complete open-source LLM engineering pipeline providing prompt traces, evaluations, and metrics.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "142bffe",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "docker-compose.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Langfuse",
        "studioId": "langfuse-observability",
        "path": "/tools/langfuse-observability/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-logger": {
    "id": "tp-rag-logger",
    "repo": "Pradeeptalari14/tp-rag-logger",
    "title": "RAG Logger",
    "desc": "Lightweight utility logger compiling queries, search metadata, and token completion counts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6a9694d",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "rag_logger.py"
    ],
    "studioBridge": [
      {
        "component": "RAG Logger",
        "studioId": "rag-logger",
        "path": "/tools/rag-logger/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-opal-comet": {
    "id": "tp-opal-comet",
    "repo": "Pradeeptalari14/tp-opal-comet",
    "title": "Opal (Comet)",
    "desc": "Comet ML integration scripts tracking prompt modifications, token costs, and output scores.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "66f79aa",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "comet_eval.py"
    ],
    "studioBridge": [
      {
        "component": "Opal (Comet)",
        "studioId": "opal-comet",
        "path": "/tools/opal-comet/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-tracerag": {
    "id": "tp-tracerag",
    "repo": "Pradeeptalari14/tp-tracerag",
    "title": "TraceRAG",
    "desc": "OpenTelemetry instrumentation scripts logging search latencies directly to Jaeger tracing backends.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4c7e7b1",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "opentelemetry_traces.py"
    ],
    "studioBridge": [
      {
        "component": "TraceRAG",
        "studioId": "tracerag",
        "path": "/tools/tracerag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-sre-logging-decorator": {
    "id": "tp-sre-logging-decorator",
    "repo": "Pradeeptalari14/tp-sre-logging-decorator",
    "title": "SRE logging Decorator",
    "desc": "JSON decorator redacting PII data and outputting logs configured for AWS CloudWatch and Grafana.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3b8bdd6",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Grafana"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "json_logger.py"
    ],
    "studioBridge": [
      {
        "component": "SRE logging Decorator",
        "studioId": "sre-logging-decorator",
        "path": "/tools/sre-logging-decorator/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-modelab": {
    "id": "tp-modelab",
    "repo": "Pradeeptalari14/tp-modelab",
    "title": "modelab",
    "desc": "API-agnostic Python evaluation harness routing query traffic across multiple model providers.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1aee96b",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "ab_testing.py"
    ],
    "studioBridge": [
      {
        "component": "modelab",
        "studioId": "modelab",
        "path": "/tools/modelab/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-raindrop-experiments": {
    "id": "tp-raindrop-experiments",
    "repo": "Pradeeptalari14/tp-raindrop-experiments",
    "title": "Raindrop Experiments",
    "desc": "A/B testing integration configurations managing model variants, system prompt updates, and PostHog logs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "320ad87",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "posthog_config.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Raindrop Experiments",
        "studioId": "raindrop-experiments",
        "path": "/tools/raindrop-experiments/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-splitter": {
    "id": "tp-rag-splitter",
    "repo": "Pradeeptalari14/tp-rag-splitter",
    "title": "RAG Splitter",
    "desc": "n8n workflow node dividing prompt requests 50/50 via user ID hashes and logging runs in Google Sheets.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "33fe7c8",
    "languages": [
      "Python",
      "Go",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "traffic_splitter.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "RAG Splitter",
        "studioId": "rag-splitter",
        "path": "/tools/rag-splitter/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-conductrag": {
    "id": "tp-conductrag",
    "repo": "Pradeeptalari14/tp-conductrag",
    "title": "ConductRAG",
    "desc": "Statistical calculator analyzing sample size requirements and model accuracy variations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "795e904",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "stats_calculator.py"
    ],
    "studioBridge": [
      {
        "component": "ConductRAG",
        "studioId": "conductrag",
        "path": "/tools/conductrag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-realtime-cdc-pipeline": {
    "id": "tp-realtime-cdc-pipeline",
    "repo": "Pradeeptalari14/tp-realtime-cdc-pipeline",
    "title": "Real-Time CDC Pipeline for RAG",
    "desc": "CDC pipeline loader streaming database mutations to vector indexes via RisingWave configurations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1906287",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "cdc_pipeline.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Real-Time CDC Pipeline for RAG",
        "studioId": "realtime-cdc-pipeline",
        "path": "/tools/realtime-cdc-pipeline/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-livevector-lake": {
    "id": "tp-livevector-lake",
    "repo": "Pradeeptalari14/tp-livevector-lake",
    "title": "LiveVector Lake",
    "desc": "Temporal retrieval engine maintaining versioned indexes for real-time document search.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "570081e",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "versioned_index.py"
    ],
    "studioBridge": [
      {
        "component": "LiveVector Lake",
        "studioId": "livevector-lake",
        "path": "/tools/livevector-lake/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vpage3-core": {
    "id": "tp-vpage3-core",
    "repo": "Pradeeptalari14/tp-vpage3-core",
    "title": "vpage3-core",
    "desc": "Fast incremental crawler checking content hashes and invalidating stale indexes.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "405b609",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "change_detector.ts",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "vpage3-core",
        "studioId": "vpage3-core",
        "path": "/tools/vpage3-core/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-cleanvector": {
    "id": "tp-cleanvector",
    "repo": "Pradeeptalari14/tp-cleanvector",
    "title": "CleanVector",
    "desc": "Index cleaner script finding and purging deleted or expired document vectors from registries.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "14d242f",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "cleanup_cron.py"
    ],
    "studioBridge": [
      {
        "component": "CleanVector",
        "studioId": "cleanvector",
        "path": "/tools/cleanvector/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-webwatcher": {
    "id": "tp-webwatcher",
    "repo": "Pradeeptalari14/tp-webwatcher",
    "title": "WebWatcher",
    "desc": "BeautifulSoup crawler checking site ETag updates and enqueueing changed files for re-indexing.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4e41e02",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "url_watcher.py"
    ],
    "studioBridge": [
      {
        "component": "WebWatcher",
        "studioId": "webwatcher",
        "path": "/tools/webwatcher/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-fastest-multimodal-rag": {
    "id": "tp-fastest-multimodal-rag",
    "repo": "Pradeeptalari14/tp-fastest-multimodal-rag",
    "title": "Fastest-Multimodal-Rag",
    "desc": "Extractor dividing text, tables, and image elements into separate document stores using LlamaIndex.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "323b7ad",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "multimodal_rag.py"
    ],
    "studioBridge": [
      {
        "component": "Fastest-Multimodal-Rag",
        "studioId": "fastest-multimodal-rag",
        "path": "/tools/fastest-multimodal-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-pdf-rag": {
    "id": "tp-pdf-rag",
    "repo": "Pradeeptalari14/tp-pdf-rag",
    "title": "PDF-RAG",
    "desc": "High-performance PDF parser parsing formatting grids and retrieving visual details using Streamlit.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5921359",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "pdf_rag.py"
    ],
    "studioBridge": [
      {
        "component": "PDF-RAG",
        "studioId": "pdf-rag",
        "path": "/tools/pdf-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-aws-multimodal-chatbot": {
    "id": "tp-aws-multimodal-chatbot",
    "repo": "Pradeeptalari14/tp-aws-multimodal-chatbot",
    "title": "Multimodal RAG Chatbot (AWS)",
    "desc": "AWS Bedrock assistant mapping multi-format documents using Amazon Textract and OpenSearch.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "19213d0",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "textract_pipeline.py"
    ],
    "studioBridge": [
      {
        "component": "Multimodal RAG Chatbot (AWS)",
        "studioId": "aws-multimodal-chatbot",
        "path": "/tools/aws-multimodal-chatbot/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-chartrag": {
    "id": "tp-chartrag",
    "repo": "Pradeeptalari14/tp-chartrag",
    "title": "ChartRAG",
    "desc": "Specialized chart image reader querying data labels and layout coordinates using GPT-4o.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4296945",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "chart_retriever.py"
    ],
    "studioBridge": [
      {
        "component": "ChartRAG",
        "studioId": "chartrag",
        "path": "/tools/chartrag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-audiorag": {
    "id": "tp-audiorag",
    "repo": "Pradeeptalari14/tp-audiorag",
    "title": "AudioRAG",
    "desc": "Speech transcript extractor matching search queries via Whisper and CLAP embedding spaces.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5e0a7b4",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "audio_retriever.py"
    ],
    "studioBridge": [
      {
        "component": "AudioRAG",
        "studioId": "audiorag",
        "path": "/tools/audiorag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-adagate": {
    "id": "tp-adagate",
    "repo": "Pradeeptalari14/tp-adagate",
    "title": "AdaGate",
    "desc": "Token-budgeted search proxy limiting retrieval costs dynamically for expensive multi-turn loops.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "72cb03e",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "evidence_controller.py"
    ],
    "studioBridge": [
      {
        "component": "AdaGate",
        "studioId": "adagate",
        "path": "/tools/adagate/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-context-engine": {
    "id": "tp-context-engine",
    "repo": "Pradeeptalari14/tp-context-engine",
    "title": "Context-Engine",
    "desc": "Context orchestrator calculating token lengths to prevent context limit errors.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7bf36c6",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "context_manager.py"
    ],
    "studioBridge": [
      {
        "component": "Context-Engine",
        "studioId": "context-engine",
        "path": "/tools/context-engine/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-cost-os": {
    "id": "tp-rag-cost-os",
    "repo": "Pradeeptalari14/tp-rag-cost-os",
    "title": "RAG-Cost-OS",
    "desc": "Cost tracker compiling detailed model token usage statistics and outputting JSON dashboards.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "cd2215e",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "cost_tracker.ts",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "RAG-Cost-OS",
        "studioId": "rag-cost-os",
        "path": "/tools/rag-cost-os/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-budgetguard": {
    "id": "tp-budgetguard",
    "repo": "Pradeeptalari14/tp-budgetguard",
    "title": "BudgetGuard",
    "desc": "Rate limiter decorator monitoring active API credentials and triggering Slack warning webhooks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "122778a",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "budget_decorator.py"
    ],
    "studioBridge": [
      {
        "component": "BudgetGuard",
        "studioId": "budgetguard",
        "path": "/tools/budgetguard/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-cost-aware-router": {
    "id": "tp-cost-aware-router",
    "repo": "Pradeeptalari14/tp-cost-aware-router",
    "title": "Cost-Aware Router",
    "desc": "Lightweight classifier routing queries to cheaper models based on semantic difficulty.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "175c4d7",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "cost_router.py"
    ],
    "studioBridge": [
      {
        "component": "Cost-Aware Router",
        "studioId": "cost-aware-router",
        "path": "/tools/cost-aware-router/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-eu-pii-anonymization": {
    "id": "tp-eu-pii-anonymization",
    "repo": "Pradeeptalari14/tp-eu-pii-anonymization",
    "title": "EU PII Anonymization (Multilingual)",
    "desc": "CPU-optimized PII redaction pipeline validating document contexts for GDPR compliance.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "9715edb",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "pii_redactor.py"
    ],
    "studioBridge": [
      {
        "component": "EU PII Anonymization (Multilingual)",
        "studioId": "eu-pii-anonymization",
        "path": "/tools/eu-pii-anonymization/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gdpr-safe-rag": {
    "id": "tp-gdpr-safe-rag",
    "repo": "Pradeeptalari14/tp-gdpr-safe-rag",
    "title": "gdpr-safe-rag",
    "desc": "GDPR audit toolkit tracking retrieval pathways and sanitizing prompt logs prior to external APIs calls.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "67eedd4",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "gdpr_toolkit.py"
    ],
    "studioBridge": [
      {
        "component": "gdpr-safe-rag",
        "studioId": "gdpr-safe-rag",
        "path": "/tools/gdpr-safe-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-enforcer-reg-patterns": {
    "id": "tp-enforcer-reg-patterns",
    "repo": "Pradeeptalari14/tp-enforcer-reg-patterns",
    "title": "Enforcer-Reg-Patterns",
    "desc": "Regulatory pattern compliance scanner filtering out sensitive data tags from indexed text chunks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1b7636b",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "regulatory_enforcer.py"
    ],
    "studioBridge": [
      {
        "component": "Enforcer-Reg-Patterns",
        "studioId": "enforcer-reg-patterns",
        "path": "/tools/enforcer-reg-patterns/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-anonymizer-proxy": {
    "id": "tp-anonymizer-proxy",
    "repo": "Pradeeptalari14/tp-anonymizer-proxy",
    "title": "Anonymizer Proxy",
    "desc": "Envoy reverse proxy running Presidio scripts to mask private data fields inside HTTP flows.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "607e487",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "envoy_proxy.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Anonymizer Proxy",
        "studioId": "anonymizer-proxy",
        "path": "/tools/anonymizer-proxy/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-auditrag": {
    "id": "tp-auditrag",
    "repo": "Pradeeptalari14/tp-auditrag",
    "title": "AuditRAG",
    "desc": "Tamper-evident query logger storing cryptographic hash chains inside local SQLite instances.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5e08357",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "immutable_log.py"
    ],
    "studioBridge": [
      {
        "component": "AuditRAG",
        "studioId": "auditrag",
        "path": "/tools/auditrag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-granite-guardian": {
    "id": "tp-granite-guardian",
    "repo": "Pradeeptalari14/tp-granite-guardian",
    "title": "Granite Guardian",
    "desc": "Model checker pipeline evaluating response alignment, bias flags, and hallucination scores.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1514491",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "guardian_eval.py"
    ],
    "studioBridge": [
      {
        "component": "Granite Guardian",
        "studioId": "granite-guardian",
        "path": "/tools/granite-guardian/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-doxa": {
    "id": "tp-doxa",
    "repo": "Pradeeptalari14/tp-doxa",
    "title": "doxa",
    "desc": "Provenance verifier cross-checking context claims without invoking external LLM models.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "45e51a9",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "provenance_checker.py"
    ],
    "studioBridge": [
      {
        "component": "doxa",
        "studioId": "doxa",
        "path": "/tools/doxa/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-halluguard": {
    "id": "tp-halluguard",
    "repo": "Pradeeptalari14/tp-halluguard",
    "title": "HalluGuard",
    "desc": "轻量级 reasoning model fine-tuned for automated response factuality validation.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5483746",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "hallucination_mitigator.py"
    ],
    "studioBridge": [
      {
        "component": "HalluGuard",
        "studioId": "halluguard",
        "path": "/tools/halluguard/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-refusarag": {
    "id": "tp-refusarag",
    "repo": "Pradeeptalari14/tp-refusarag",
    "title": "RefusaRAG",
    "desc": "System prompt builder ensuring refusal responses when context details are insufficient.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "75ab23f",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "refusal_prompts.py"
    ],
    "studioBridge": [
      {
        "component": "RefusaRAG",
        "studioId": "refusarag",
        "path": "/tools/refusarag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-citationenforcer": {
    "id": "tp-citationenforcer",
    "repo": "Pradeeptalari14/tp-citationenforcer",
    "title": "CitationEnforcer",
    "desc": "Entailment evaluator ensuring output citations map directly to valid source indices.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "37e0901",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "citation_verifier.py"
    ],
    "studioBridge": [
      {
        "component": "CitationEnforcer",
        "studioId": "citationenforcer",
        "path": "/tools/citationenforcer/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ragfallback-pipeline": {
    "id": "tp-ragfallback-pipeline",
    "repo": "Pradeeptalari14/tp-ragfallback-pipeline",
    "title": "ragfallback (Full Pipeline Fallback)",
    "desc": "Configurable pipeline framework switching search providers dynamically on connection timeouts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7644213",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "pipeline_fallback.py"
    ],
    "studioBridge": [
      {
        "component": "ragfallback (Full Pipeline Fallback)",
        "studioId": "ragfallback-pipeline",
        "path": "/tools/ragfallback-pipeline/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-production-faiss-rag": {
    "id": "tp-production-faiss-rag",
    "repo": "Pradeeptalari14/tp-production-faiss-rag",
    "title": "Production-Ready RAG with FAISS",
    "desc": "Resilient search utility implementing prompt caching, performance thresholds, and FAISS database fallbacks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "74362da",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "faiss_fallback.py"
    ],
    "studioBridge": [
      {
        "component": "Production-Ready RAG with FAISS",
        "studioId": "production-faiss-rag",
        "path": "/tools/production-faiss-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-query-regeneration-fallback": {
    "id": "tp-query-regeneration-fallback",
    "repo": "Pradeeptalari14/tp-query-regeneration-fallback",
    "title": "Query Regeneration Fallback",
    "desc": "Semantic query optimizer rewriting search terms when initial result scores fall under 0.2.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7d74cbc",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "query_regenerator.py"
    ],
    "studioBridge": [
      {
        "component": "Query Regeneration Fallback",
        "studioId": "query-regeneration-fallback",
        "path": "/tools/query-regeneration-fallback/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-circuitbreaker-rag": {
    "id": "tp-circuitbreaker-rag",
    "repo": "Pradeeptalari14/tp-circuitbreaker-rag",
    "title": "CircuitBreakerRAG",
    "desc": "Fault isolation controller using pybreaker to block failing API requests after consecutive losses.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7d12d41",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "circuit_breaker.py"
    ],
    "studioBridge": [
      {
        "component": "CircuitBreakerRAG",
        "studioId": "circuitbreaker-rag",
        "path": "/tools/circuitbreaker-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-hybrid-fallback": {
    "id": "tp-hybrid-fallback",
    "repo": "Pradeeptalari14/tp-hybrid-fallback",
    "title": "Hybrid Fallback",
    "desc": "Performance monitor switching from elasticsearch to local keyword indexes under high DB loads.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "42d025b",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "hybrid_fallback.py"
    ],
    "studioBridge": [
      {
        "component": "Hybrid Fallback",
        "studioId": "hybrid-fallback",
        "path": "/tools/hybrid-fallback/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-agentic-rag-security-lab": {
    "id": "tp-agentic-rag-security-lab",
    "repo": "Pradeeptalari14/tp-agentic-rag-security-lab",
    "title": "Agentic RAG Security Lab",
    "desc": "Automated workflow executing security scans and evaluating responses against prompt injection payloads.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "29b5a38",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "security_lab.py"
    ],
    "studioBridge": [
      {
        "component": "Agentic RAG Security Lab",
        "studioId": "agentic-rag-security-lab",
        "path": "/tools/agentic-rag-security-lab/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-stress-tester": {
    "id": "tp-rag-stress-tester",
    "repo": "Pradeeptalari14/tp-rag-stress-tester",
    "title": "RAG Pipeline Stress Tester",
    "desc": "Adversarial load tester generating concurrent queries to measure search latency and system drifts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "69f3c0f",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "stress_tester.py"
    ],
    "studioBridge": [
      {
        "component": "RAG Pipeline Stress Tester",
        "studioId": "rag-stress-tester",
        "path": "/tools/rag-stress-tester/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-chaos-genai": {
    "id": "tp-chaos-genai",
    "repo": "Pradeeptalari14/tp-chaos-genai",
    "title": "Chaos Engineering for GenAI",
    "desc": "Chaos Mesh manifests simulating API response errors, container restarts, and embedding server delays.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "2cf5991",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "chaos_mesh.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Chaos Engineering for GenAI",
        "studioId": "chaos-genai",
        "path": "/tools/chaos-genai/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-chaos": {
    "id": "tp-rag-chaos",
    "repo": "Pradeeptalari14/tp-rag-chaos",
    "title": "RAG-Chaos",
    "desc": "Kubernetes chaos experiments injecting network delays inside vector database instances.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "70aec88",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "chaos_experiment.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "RAG-Chaos",
        "studioId": "rag-chaos",
        "path": "/tools/rag-chaos/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-poisonpill": {
    "id": "tp-poisonpill",
    "repo": "Pradeeptalari14/tp-poisonpill",
    "title": "PoisonPill",
    "desc": "Pytest test fixtures validating that model queries successfully ignore malicious context documents.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "16731bc",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "poison_pill_test.py"
    ],
    "studioBridge": [
      {
        "component": "PoisonPill",
        "studioId": "poisonpill",
        "path": "/tools/poisonpill/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-pipeline-docs-template": {
    "id": "tp-rag-pipeline-docs-template",
    "repo": "Pradeeptalari14/tp-rag-pipeline-docs-template",
    "title": "RAG-Pipeline Documentation Template",
    "desc": "Exhaustive markdown documentation layouts detailing pipeline specifications and compliance metrics.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "550f54d",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "pipeline_docs.md",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "RAG-Pipeline Documentation Template",
        "studioId": "rag-pipeline-docs-template",
        "path": "/tools/rag-pipeline-docs-template/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-architecture-decision-record": {
    "id": "tp-architecture-decision-record",
    "repo": "Pradeeptalari14/tp-architecture-decision-record",
    "title": "Architecture Decision Record (ADR)",
    "desc": "Standardized design log templates recording framework selections and vector index schema versions.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3357476",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "adr_decision.md",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Architecture Decision Record (ADR)",
        "studioId": "architecture-decision-record",
        "path": "/tools/architecture-decision-record/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ai-orchestration-diagram": {
    "id": "tp-ai-orchestration-diagram",
    "repo": "Pradeeptalari14/tp-ai-orchestration-diagram",
    "title": "AI Orchestration Layer Diagram",
    "desc": "Detailed architectural drawings representing RAG storage layers, indexes, and reasoning pipelines.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3d6ed79",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "architecture_diagram.md",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AI Orchestration Layer Diagram",
        "studioId": "ai-orchestration-diagram",
        "path": "/tools/ai-orchestration-diagram/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-doc-rag": {
    "id": "tp-doc-rag",
    "repo": "Pradeeptalari14/tp-doc-rag",
    "title": "Doc-RAG",
    "desc": "Python utility scanning script folders and building structured markdown document guides.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3eaf0bb",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "doc_generator.py"
    ],
    "studioBridge": [
      {
        "component": "Doc-RAG",
        "studioId": "doc-rag",
        "path": "/tools/doc-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-knowledge-base-exporter": {
    "id": "tp-knowledge-base-exporter",
    "repo": "Pradeeptalari14/tp-knowledge-base-exporter",
    "title": "Knowledge Base Exporter",
    "desc": "Exporter script mapping vector registry schemas and exporting document fields into markdown.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3eefc88",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "kb_exporter.py"
    ],
    "studioBridge": [
      {
        "component": "Knowledge Base Exporter",
        "studioId": "knowledge-base-exporter",
        "path": "/tools/knowledge-base-exporter/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-multiagent-regulatory-compliance": {
    "id": "tp-multiagent-regulatory-compliance",
    "repo": "Pradeeptalari14/tp-multiagent-regulatory-compliance",
    "title": "Multi-Agent Regulatory Compliance (NIC)",
    "desc": "Multi-agent developer studio for Indian regulations compliance checks (SEBI & RBI). Integrates Slack alerts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6c3cba0",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "compliance_agent.py"
    ],
    "studioBridge": [
      {
        "component": "Multi-Agent Regulatory Compliance (NIC)",
        "studioId": "multiagent-regulatory-compliance",
        "path": "/tools/multiagent-regulatory-compliance/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-civic-sight": {
    "id": "tp-civic-sight",
    "repo": "Pradeeptalari14/tp-civic-sight",
    "title": "Civic Sight",
    "desc": "Citizen service portal with multilingual translation templates. Integrates WhatsApp Business API and Telegram channels for grievance routing.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7223c9d",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "whatsapp_grievance.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Civic Sight",
        "studioId": "civic-sight",
        "path": "/tools/civic-sight/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-forest-sensing-agent": {
    "id": "tp-forest-sensing-agent",
    "repo": "Pradeeptalari14/tp-forest-sensing-agent",
    "title": "Agentic AI for Forest Applications",
    "desc": "AI remote sensing analyst utilizing PyTorch satellite models. Integrates Telegram reports for wildfire and cover updates.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "361f5ca",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "forest_sensing.py"
    ],
    "studioBridge": [
      {
        "component": "Agentic AI for Forest Applications",
        "studioId": "forest-sensing-agent",
        "path": "/tools/forest-sensing-agent/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-sabhapati-judicial-deliberation": {
    "id": "tp-sabhapati-judicial-deliberation",
    "repo": "Pradeeptalari14/tp-sabhapati-judicial-deliberation",
    "title": "SABHAPATI: Multi-Agent for Judicial Deliberation",
    "desc": "Courtroom deliberation simulator traversing Indian Evidence Act contexts and compiling case citations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "13da687",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "court_deliberation.py"
    ],
    "studioBridge": [
      {
        "component": "SABHAPATI: Multi-Agent for Judicial Deliberation",
        "studioId": "sabhapati-judicial-deliberation",
        "path": "/tools/sabhapati-judicial-deliberation/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-nyayarag": {
    "id": "tp-nyayarag",
    "repo": "Pradeeptalari14/tp-nyayarag",
    "title": "NyayaRAG (Indian SC Judgments)",
    "desc": "Graph-structured legal reasoning engine processing Indian Supreme Court case histories.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4845b5f",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "nyaya_graph_rag.py"
    ],
    "studioBridge": [
      {
        "component": "NyayaRAG (Indian SC Judgments)",
        "studioId": "nyayarag",
        "path": "/tools/nyayarag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-nyaya-ai": {
    "id": "tp-nyaya-ai",
    "repo": "Pradeeptalari14/tp-nyaya-ai",
    "title": "NyayaAI",
    "desc": "Constitution & IPC legal assistant for automated student workflows. Configured with secure Telegram bot interfaces.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4846b8f",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "nyaya_assistant.py"
    ],
    "studioBridge": [
      {
        "component": "NyayaAI",
        "studioId": "nyaya-ai",
        "path": "/tools/nyaya-ai/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vakilgpt": {
    "id": "tp-vakilgpt",
    "repo": "Pradeeptalari14/tp-vakilgpt",
    "title": "VakilGPT - IPC Legal Copilot",
    "desc": "IPC case assistant traversing legal codes. Supports custom webhook and Slack notification hooks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1161f9b",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "vakil_copilot.py"
    ],
    "studioBridge": [
      {
        "component": "VakilGPT - IPC Legal Copilot",
        "studioId": "vakilgpt",
        "path": "/tools/vakilgpt/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-nyaya-gpt": {
    "id": "tp-nyaya-gpt",
    "repo": "Pradeeptalari14/tp-nyaya-gpt",
    "title": "nyaya-gpt (Constitution & BNS)",
    "desc": "ReAct-based agent processing Bharatiya Nyaya Sanhita (BNS) queries. Connects to Slack alerting channels.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3f6fb1c",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "nyaya_gpt.py"
    ],
    "studioBridge": [
      {
        "component": "nyaya-gpt (Constitution & BNS)",
        "studioId": "nyaya-gpt",
        "path": "/tools/nyaya-gpt/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-tamil-law-agents": {
    "id": "tp-tamil-law-agents",
    "repo": "Pradeeptalari14/tp-tamil-law-agents",
    "title": "Intelligent Agents for Tamil Law",
    "desc": "Graph RAG legal reviewer optimized for Tamil translation. Connects to Telegram channels for output sharing.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "762014e",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "tamil_law_agent.py"
    ],
    "studioBridge": [
      {
        "component": "Intelligent Agents for Tamil Law",
        "studioId": "tamil-law-agents",
        "path": "/tools/tamil-law-agents/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bfsi-regulatory-os": {
    "id": "tp-bfsi-regulatory-os",
    "repo": "Pradeeptalari14/tp-bfsi-regulatory-os",
    "title": "Agentic AI OS for BFSI (Indian Context)",
    "desc": "Compliance advisor for banking regulations. Sends instant Telegram notifications on audit failures.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "137786c",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "bfsi_agent_os.py"
    ],
    "studioBridge": [
      {
        "component": "Agentic AI OS for BFSI (Indian Context)",
        "studioId": "bfsi-regulatory-os",
        "path": "/tools/bfsi-regulatory-os/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-icai-ca-assistant": {
    "id": "tp-icai-ca-assistant",
    "repo": "Pradeeptalari14/tp-icai-ca-assistant",
    "title": "AI-Powered Assistant for Chartered Accountants",
    "desc": "GST and tax audit assistant referencing ICAI rulebooks. Generates warning messages for custom Slack webhooks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1639a04",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "icai_assistant.py"
    ],
    "studioBridge": [
      {
        "component": "AI-Powered Assistant for Chartered Accountants",
        "studioId": "icai-ca-assistant",
        "path": "/tools/icai-ca-assistant/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-haryapada-healthcare-chatbot": {
    "id": "tp-haryapada-healthcare-chatbot",
    "repo": "Pradeeptalari14/tp-haryapada-healthcare-chatbot",
    "title": "Generative AI Healthcare Chatbot (Minds of India)",
    "desc": "Haryapada health assistant chatbot referencing verified Indian medical articles. Sends alerts via email/SMS templates.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "bd4143e",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "healthcare_chatbot.py"
    ],
    "studioBridge": [
      {
        "component": "Generative AI Healthcare Chatbot (Minds of India)",
        "studioId": "haryapada-healthcare-chatbot",
        "path": "/tools/haryapada-healthcare-chatbot/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-krishi-bodh": {
    "id": "tp-krishi-bodh",
    "repo": "Pradeeptalari14/tp-krishi-bodh",
    "title": "Krishi Bodh (Indian Agriculture Chatbot)",
    "desc": "Voice assistant for farmers. Integrates WhatsApp and Telegram voice notes and provides farming answers.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4212ace",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "krishi_bodh.py"
    ],
    "studioBridge": [
      {
        "component": "Krishi Bodh (Indian Agriculture Chatbot)",
        "studioId": "krishi-bodh",
        "path": "/tools/krishi-bodh/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-nayanpay-agent": {
    "id": "tp-nayanpay-agent",
    "repo": "Pradeeptalari14/tp-nayanpay-agent",
    "title": "Nayanpay Unified Agent",
    "desc": "Multi-agent system handling UPI transaction scenarios. Integrates WhatsApp API alerts for payment approvals.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7e0da9e",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "nayanpay_agent.py"
    ],
    "studioBridge": [
      {
        "component": "Nayanpay Unified Agent",
        "studioId": "nayanpay-agent",
        "path": "/tools/nayanpay-agent/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rupeelink": {
    "id": "tp-rupeelink",
    "repo": "Pradeeptalari14/tp-rupeelink",
    "title": "RupeeLink",
    "desc": "Neuro-symbolic LLM query engine for Indian commerce. Includes Telegram and WhatsApp integration scripts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1751b0a",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "rupeelink_framework.py"
    ],
    "studioBridge": [
      {
        "component": "RupeeLink",
        "studioId": "rupeelink",
        "path": "/tools/rupeelink/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bharatapi-gateway": {
    "id": "tp-bharatapi-gateway",
    "repo": "Pradeeptalari14/tp-bharatapi-gateway",
    "title": "BharatAPI Gateway",
    "desc": "Gateway routing queries to Aadhaar, PAN, and banking APIs. Configured with auto-failover Slack warnings.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "2efcdf2",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "bharat_gateway.py"
    ],
    "studioBridge": [
      {
        "component": "BharatAPI Gateway",
        "studioId": "bharatapi-gateway",
        "path": "/tools/bharatapi-gateway/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vernacular-farming-robot": {
    "id": "tp-vernacular-farming-robot",
    "repo": "Pradeeptalari14/tp-vernacular-farming-robot",
    "title": "Vernacular Robot for Indian Farmers",
    "desc": "Agricultural advisor with speech-to-text. Connects to WhatsApp Business API channels to answer voice questions.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "71ba6cc",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "vernacular_robot.py"
    ],
    "studioBridge": [
      {
        "component": "Vernacular Robot for Indian Farmers",
        "studioId": "vernacular-farming-robot",
        "path": "/tools/vernacular-farming-robot/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-citizen-grievance-chatbot": {
    "id": "tp-citizen-grievance-chatbot",
    "repo": "Pradeeptalari14/tp-citizen-grievance-chatbot",
    "title": "All-India Citizen Grievance Chatbot",
    "desc": "Municipal portal automatically routing local grievances. Integrates WhatsApp API and email templates.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "366f294",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "citizen_grievance.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "All-India Citizen Grievance Chatbot",
        "studioId": "citizen-grievance-chatbot",
        "path": "/tools/citizen-grievance-chatbot/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-multilingual-citizen-services": {
    "id": "tp-multilingual-citizen-services",
    "repo": "Pradeeptalari14/tp-multilingual-citizen-services",
    "title": "Multi-Lingual RAG for Indian Citizen Services",
    "desc": "L10n assistant handling public registrations. Connects to WhatsApp/Telegram to deliver updates.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6659278",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "citizen_services_rag.py"
    ],
    "studioBridge": [
      {
        "component": "Multi-Lingual RAG for Indian Citizen Services",
        "studioId": "multilingual-citizen-services",
        "path": "/tools/multilingual-citizen-services/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-lifesave-rural-assistant": {
    "id": "tp-lifesave-rural-assistant",
    "repo": "Pradeeptalari14/tp-lifesave-rural-assistant",
    "title": "LifeSave Assistant for Indian Rural Communities",
    "desc": "Offline-first health advisor. Generates SMS/telephony alert templates for critical patient triage.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "258f3d5",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "lifesave_assistant.py"
    ],
    "studioBridge": [
      {
        "component": "LifeSave Assistant for Indian Rural Communities",
        "studioId": "lifesave-rural-assistant",
        "path": "/tools/lifesave-rural-assistant/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-regional-accent-tutor": {
    "id": "tp-regional-accent-tutor",
    "repo": "Pradeeptalari14/tp-regional-accent-tutor",
    "title": "Personalized AI Tutor for Indian Local Languages",
    "desc": "Curriculum tutor handling regional accents. Sends study milestones to Telegram parent channels.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "37f3c0d",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "vernacular_tutor.py"
    ],
    "studioBridge": [
      {
        "component": "Personalized AI Tutor for Indian Local Languages",
        "studioId": "regional-accent-tutor",
        "path": "/tools/regional-accent-tutor/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-offline-rural-legal-advisor": {
    "id": "tp-offline-rural-legal-advisor",
    "repo": "Pradeeptalari14/tp-offline-rural-legal-advisor",
    "title": "Offline AI for Indian Legal Information (Rural)",
    "desc": "Offline application for searching Indian Evidence Act indices. Includes local SMS export options.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4d6ae45",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "offline_legal_advisor.py"
    ],
    "studioBridge": [
      {
        "component": "Offline AI for Indian Legal Information (Rural)",
        "studioId": "offline-rural-legal-advisor",
        "path": "/tools/offline-rural-legal-advisor/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-kisan-seva-rag": {
    "id": "tp-kisan-seva-rag",
    "repo": "Pradeeptalari14/tp-kisan-seva-rag",
    "title": "Kisan-Seva (Indian Agriculture RAG)",
    "desc": "Weather and soil analytics RAG system. Sends daily farming recommendations to Telegram channels.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7d631e1",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "kisan_seva.py"
    ],
    "studioBridge": [
      {
        "component": "Kisan-Seva (Indian Agriculture RAG)",
        "studioId": "kisan-seva-rag",
        "path": "/tools/kisan-seva-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-whatsapp-grievance-reporter": {
    "id": "tp-whatsapp-grievance-reporter",
    "repo": "Pradeeptalari14/tp-whatsapp-grievance-reporter",
    "title": "Indian Local Language Issue Reporting via WhatsApp",
    "desc": "WhatsApp Business bot extracting local civic issues and creating grievance tickets.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6079d23",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "whatsapp_issue_reporter.py"
    ],
    "studioBridge": [
      {
        "component": "Indian Local Language Issue Reporting via WhatsApp",
        "studioId": "whatsapp-grievance-reporter",
        "path": "/tools/whatsapp-grievance-reporter/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-nyaya-mediation-resolver": {
    "id": "tp-nyaya-mediation-resolver",
    "repo": "Pradeeptalari14/tp-nyaya-mediation-resolver",
    "title": "Multi-Agent Legal Dispute Resolver",
    "desc": "Negotiation system recommending settlements. Delivers agreements directly to legal team Slack slots.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "66f201b",
    "languages": [
      "Python",
      "Go"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "mediation_resolver.py"
    ],
    "studioBridge": [
      {
        "component": "Multi-Agent Legal Dispute Resolver",
        "studioId": "nyaya-mediation-resolver",
        "path": "/tools/nyaya-mediation-resolver/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-customer-banking-copilot": {
    "id": "tp-customer-banking-copilot",
    "repo": "Pradeeptalari14/tp-customer-banking-copilot",
    "title": "Agentic AI OS for Indian BFSI (Customer)",
    "desc": "Personal banking assistant bot. Integrates WhatsApp multi-factor approval workflows.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7f9f8a9",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "customer_bfsi.py"
    ],
    "studioBridge": [
      {
        "component": "Agentic AI OS for Indian BFSI (Customer)",
        "studioId": "customer-banking-copilot",
        "path": "/tools/customer-banking-copilot/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-taxgpt": {
    "id": "tp-taxgpt",
    "repo": "Pradeeptalari14/tp-taxgpt",
    "title": "TaxGPT",
    "desc": "GST & Income Tax computation assistant. Sends tax warnings and summaries to Telegram bot clients.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "46807a6",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "tax_gpt.py"
    ],
    "studioBridge": [
      {
        "component": "TaxGPT",
        "studioId": "taxgpt",
        "path": "/tools/taxgpt/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-aadhaar-agentic-workflows": {
    "id": "tp-aadhaar-agentic-workflows",
    "repo": "Pradeeptalari14/tp-aadhaar-agentic-workflows",
    "title": "Aadhaar-authenticated Agentic Workflow System",
    "desc": "Secure workflow executor verifying citizen identity via UIDAI sandboxes. Emits MFA webhooks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3ca5a83",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "aadhaar_verification.py"
    ],
    "studioBridge": [
      {
        "component": "Aadhaar-authenticated Agentic Workflow System",
        "studioId": "aadhaar-agentic-workflows",
        "path": "/tools/aadhaar-agentic-workflows/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ayush-rag-advisor": {
    "id": "tp-ayush-rag-advisor",
    "repo": "Pradeeptalari14/tp-ayush-rag-advisor",
    "title": "Ayush RAG (Traditional Medicine Advisor)",
    "desc": "Information advisor on traditional Ayuverda remedies and drug interactions. Emits warnings to Slack.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "8742101",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "ayush_advisor.py"
    ],
    "studioBridge": [
      {
        "component": "Ayush RAG (Traditional Medicine Advisor)",
        "studioId": "ayush-rag-advisor",
        "path": "/tools/ayush-rag-advisor/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bharat-shikshak": {
    "id": "tp-bharat-shikshak",
    "repo": "Pradeeptalari14/tp-bharat-shikshak",
    "title": "Bharat Shikshak (Vernacular AI Tutor)",
    "desc": "Multilingual science tutor with whiteboard overlays. Transmits study progress logs to Telegram.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4d587a8",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "bharat_shikshak.py"
    ],
    "studioBridge": [
      {
        "component": "Bharat Shikshak (Vernacular AI Tutor)",
        "studioId": "bharat-shikshak",
        "path": "/tools/bharat-shikshak/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rti-assistant": {
    "id": "tp-rti-assistant",
    "repo": "Pradeeptalari14/tp-rti-assistant",
    "title": "RTI Query Assistant for Indian Citizens",
    "desc": "Form builder draft writing RTI requests. Exports formatted files and updates users via SMS.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "44daf16",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "rti_assistant.py"
    ],
    "studioBridge": [
      {
        "component": "RTI Query Assistant for Indian Citizens",
        "studioId": "rti-assistant",
        "path": "/tools/rti-assistant/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-swasthya-mitra": {
    "id": "tp-swasthya-mitra",
    "repo": "Pradeeptalari14/tp-swasthya-mitra",
    "title": "Swasthya Mitra (Rural Health Companion)",
    "desc": "Offline symptom checker for remote clinics. Exports diagnosis summaries to WhatsApp API.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7054848",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "swasthya_mitra.py"
    ],
    "studioBridge": [
      {
        "component": "Swasthya Mitra (Rural Health Companion)",
        "studioId": "swasthya-mitra",
        "path": "/tools/swasthya-mitra/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-indian-roads-fleet-manager": {
    "id": "tp-indian-roads-fleet-manager",
    "repo": "Pradeeptalari14/tp-indian-roads-fleet-manager",
    "title": "Agentic Fleet Manager for Indian Roads",
    "desc": "Route optimizer parsing traffic maps. Triggers warning webhook pings on routing alerts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4856bc6",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "fleet_manager.py"
    ],
    "studioBridge": [
      {
        "component": "Agentic Fleet Manager for Indian Roads",
        "studioId": "indian-roads-fleet-manager",
        "path": "/tools/indian-roads-fleet-manager/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-kirana-assistant": {
    "id": "tp-kirana-assistant",
    "repo": "Pradeeptalari14/tp-kirana-assistant",
    "title": "Kirana Assistant (Inventory & Sales)",
    "desc": "Voice-enabled inventory manager. Automatically sends restocking reminders via WhatsApp.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7561ef0",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "kirana_assistant.py"
    ],
    "studioBridge": [
      {
        "component": "Kirana Assistant (Inventory & Sales)",
        "studioId": "kirana-assistant",
        "path": "/tools/kirana-assistant/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-campus-counsel": {
    "id": "tp-campus-counsel",
    "repo": "Pradeeptalari14/tp-campus-counsel",
    "title": "Campus Counsel (AI Admission Guide)",
    "desc": "Admission assistant answering registration steps. Sends reminders to Telegram student chats.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "188dd54",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "campus_counsel.py"
    ],
    "studioBridge": [
      {
        "component": "Campus Counsel (AI Admission Guide)",
        "studioId": "campus-counsel",
        "path": "/tools/campus-counsel/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-school-bus-tracker": {
    "id": "tp-school-bus-tracker",
    "repo": "Pradeeptalari14/tp-school-bus-tracker",
    "title": "School Bus Tracking System Studio",
    "desc": "Real-time location, ETA notifications via WhatsApp, geofencing, driver tap logs, and route optimization.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "772acf0",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "bus_tracker.py"
    ],
    "studioBridge": [
      {
        "component": "School Bus Tracking System Studio",
        "studioId": "school-bus-tracker",
        "path": "/tools/school-bus-tracker/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-enterprise-ai-infrastructure": {
    "id": "tp-enterprise-ai-infrastructure",
    "repo": "Pradeeptalari14/tp-enterprise-ai-infrastructure",
    "title": "Enterprise AI Infrastructure Integration Studio",
    "desc": "Systematically integrate AI models into legacy enterprise infrastructure. Generate API gateway configurations, legacy proxy layers, and hybrid network routes.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "213d0c2",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "integration_plan.md",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Enterprise AI Infrastructure Integration Studio",
        "studioId": "enterprise-ai-infrastructure",
        "path": "/tools/enterprise-ai-infrastructure/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-llm-fundamentals": {
    "id": "tp-llm-fundamentals",
    "repo": "Pradeeptalari14/tp-llm-fundamentals",
    "title": "LLM Fundamentals & Runtime Studio",
    "desc": "Scaffold local and cloud model runtimes. Generate OpenAI API proxies, Ollama runtimes Modelfiles, and high-performance vLLM configurations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1e0337d",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "vLLM"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "Modelfile",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "LLM Fundamentals & Runtime Studio",
        "studioId": "llm-fundamentals",
        "path": "/tools/llm-fundamentals/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-langchain-llamaindex": {
    "id": "tp-langchain-llamaindex",
    "repo": "Pradeeptalari14/tp-langchain-llamaindex",
    "title": "LangChain & LlamaIndex Studio",
    "desc": "Orchestrate application workflows using LangChain and LlamaIndex. Generate prompt routing templates, hybrid query pipelines, and document loaders.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "a4bbce8",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "LangChain"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "pipeline.py"
    ],
    "studioBridge": [
      {
        "component": "LangChain & LlamaIndex Studio",
        "studioId": "langchain-llamaindex",
        "path": "/tools/langchain-llamaindex/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rag-optimization": {
    "id": "tp-rag-optimization",
    "repo": "Pradeeptalari14/tp-rag-optimization",
    "title": "Vector RAG Optimizer Studio",
    "desc": "Configure advanced RAG pipelines. Optimize document embedding models, text chunking sizes, and vector database indexing schemas.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "69b8243",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "rag_config.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Vector RAG Optimizer Studio",
        "studioId": "rag-optimization",
        "path": "/tools/rag-optimization/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-mcp-integration": {
    "id": "tp-mcp-integration",
    "repo": "Pradeeptalari14/tp-mcp-integration",
    "title": "MCP & Tool Integration Studio",
    "desc": "Scaffold Model Context Protocol (MCP) ecosystems. Expose custom tools, configure resource routers, and write secure execution handlers.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6945d33",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "mcp_tools.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "MCP & Tool Integration Studio",
        "studioId": "mcp-integration",
        "path": "/tools/mcp-integration/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-langgraph-agent": {
    "id": "tp-langgraph-agent",
    "repo": "Pradeeptalari14/tp-langgraph-agent",
    "title": "LangGraph & Multi-Agent Swarm Studio",
    "desc": "Build stateful multi-agent workflows. Design swarm orchestration hierarchies, conditional state transitions, and loops triage scripts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "367389c",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "LangGraph"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "swarm_graph.py"
    ],
    "studioBridge": [
      {
        "component": "LangGraph & Multi-Agent Swarm Studio",
        "studioId": "langgraph-agent",
        "path": "/tools/langgraph-agent/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ai-observability": {
    "id": "tp-ai-observability",
    "repo": "Pradeeptalari14/tp-ai-observability",
    "title": "AI Observability & Trace Studio",
    "desc": "Deploy trace instrumentation meshes. Generate Langfuse backend docker-compose structures, OpenTelemetry custom spans, and token budget alerts.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "589fc91",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker Compose"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "langfuse_otel.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AI Observability & Trace Studio",
        "studioId": "ai-observability",
        "path": "/tools/ai-observability/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ai-security": {
    "id": "tp-ai-security",
    "repo": "Pradeeptalari14/tp-ai-security",
    "title": "AI Security & Governance Studio",
    "desc": "Configure prompt injection shields and SRE governance boundaries. Generate input/output safety classifiers and semantic access control guards.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "e929e8c",
    "languages": [
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "security_rules.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AI Security & Governance Studio",
        "studioId": "ai-security",
        "path": "/tools/ai-security/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-enterprise-ai-k8s": {
    "id": "tp-enterprise-ai-k8s",
    "repo": "Pradeeptalari14/tp-enterprise-ai-k8s",
    "title": "Enterprise K8s AI Platform Studio",
    "desc": "Orchestrate end-to-end AI platform environments on Kubernetes. Provision Ray clusters, GPU node pools, and vLLM scale rules.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4c63bb6",
    "languages": [
      "Python",
      "Go",
      "JavaScript/TypeScript",
      "YAML"
    ],
    "frameworks": [
      "vLLM",
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "k8s_platform.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Enterprise K8s AI Platform Studio",
        "studioId": "enterprise-ai-k8s",
        "path": "/tools/enterprise-ai-k8s/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-enterprise-ai-stack": {
    "id": "tp-enterprise-ai-stack",
    "repo": "Pradeeptalari14/tp-enterprise-ai-stack",
    "title": "Enterprise AI Stack Blueprint Studio",
    "desc": "Design and export your enterprise-grade AI architecture blueprint. Select standard components across 16 infrastructure layers and generate declarative deployment models.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3e2958b",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "stack_blueprint.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Enterprise AI Stack Blueprint Studio",
        "studioId": "enterprise-ai-stack",
        "path": "/tools/enterprise-ai-stack/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-snowflake-warehouse": {
    "id": "tp-snowflake-warehouse",
    "repo": "Pradeeptalari14/tp-snowflake-warehouse",
    "title": "Snowflake Data Warehouse Studio",
    "desc": "Configure enterprise-grade Snowflake data warehouses, databases, roles, and schema pipelines with Snowflake Cortex AI integrations. Generate declarative SQL/SnowDDL scripts, secure storage integrations, and dbt profiles.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3c6542c",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "snowflake_ddl.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Snowflake Data Warehouse Studio",
        "studioId": "snowflake-warehouse",
        "path": "/tools/snowflake-warehouse/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-databricks-lakehouse": {
    "id": "tp-databricks-lakehouse",
    "repo": "Pradeeptalari14/tp-databricks-lakehouse",
    "title": "Databricks Lakehouse Studio",
    "desc": "Provision multi-user Databricks Spark clusters, Delta Lake tables, and Unity Catalog permissions with Databricks Mosaic AI integrations. Generate Databricks Asset Bundles (DABs), cluster configs, and PySpark jobs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "441bca6",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "databricks.yml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Databricks Lakehouse Studio",
        "studioId": "databricks-lakehouse",
        "path": "/tools/databricks-lakehouse/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-google-bigquery": {
    "id": "tp-google-bigquery",
    "repo": "Pradeeptalari14/tp-google-bigquery",
    "title": "Google BigQuery Studio",
    "desc": "Deploy serverless Google BigQuery datasets, partitioned/clustered tables, and row-level security policies with BigQuery ML & Vertex AI integrations. Generate DDL/SQL scripts, IAM role definitions, and dbt profile settings.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "b1b678b",
    "languages": [
      "Go"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "bigquery_schema.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Google BigQuery Studio",
        "studioId": "google-bigquery",
        "path": "/tools/google-bigquery/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-amazon-redshift": {
    "id": "tp-amazon-redshift",
    "repo": "Pradeeptalari14/tp-amazon-redshift",
    "title": "Amazon Redshift ML Studio",
    "desc": "Configure AWS Redshift clusters, database schemas, and IAM security profiles with Amazon Redshift ML & SageMaker integrations. Generate SQL script models, IAM execution policies, and dbt database profiles.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "520b011",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "redshift_ml.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Amazon Redshift ML Studio",
        "studioId": "amazon-redshift",
        "path": "/tools/amazon-redshift/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-neo4j-graphrag": {
    "id": "tp-neo4j-graphrag",
    "repo": "Pradeeptalari14/tp-neo4j-graphrag",
    "title": "GraphRAG & Neo4j Database Studio",
    "desc": "Configure GraphRAG schemas, Neo4j graph databases, APOC imports, and similarity graph queries. Generate Cypher query scripts, vector indexes, and docker-compose files.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "045b41a",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker Compose"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "schema_import.cypher",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GraphRAG & Neo4j Database Studio",
        "studioId": "neo4j-graphrag",
        "path": "/tools/neo4j-graphrag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-supabase-pgvector": {
    "id": "tp-supabase-pgvector",
    "repo": "Pradeeptalari14/tp-supabase-pgvector",
    "title": "Supabase & pgvector Developer Studio",
    "desc": "Deploy local Supabase databases with native pgvector vector extensions, Row-Level Security (RLS) policies, and seed data templates. Generate postgres SQL schemas, seed files, and CLI configs.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3305648",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "PostgreSQL"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "supabase_schema.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Supabase & pgvector Developer Studio",
        "studioId": "supabase-pgvector",
        "path": "/tools/supabase-pgvector/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-kafka-flink-streaming": {
    "id": "tp-kafka-flink-streaming",
    "repo": "Pradeeptalari14/tp-kafka-flink-streaming",
    "title": "Kafka & Flink Streaming Studio",
    "desc": "Orchestrate real-time message streams with Apache Kafka topics and stream-processing aggregations using Apache Flink SQL. Generate Flink SQL jobs, Python producers, and docker-compose services.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7382d03",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker Compose"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "flink_job.sql",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Kafka & Flink Streaming Studio",
        "studioId": "kafka-flink-streaming",
        "path": "/tools/kafka-flink-streaming/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-milvus-weaviate-cluster": {
    "id": "tp-milvus-weaviate-cluster",
    "repo": "Pradeeptalari14/tp-milvus-weaviate-cluster",
    "title": "Milvus & Weaviate Vector DB Clustering Studio",
    "desc": "Provision distributed, high-availability Milvus or Weaviate vector database clusters. Generate Kubernetes Helm values files, Python schema definitions, and docker-compose orchestrations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5865f1d",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker Compose",
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "cluster_values.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Milvus & Weaviate Vector DB Clustering Studio",
        "studioId": "milvus-weaviate-cluster",
        "path": "/tools/milvus-weaviate-cluster/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-pinecone-serverless": {
    "id": "tp-pinecone-serverless",
    "repo": "Pradeeptalari14/tp-pinecone-serverless",
    "title": "Pinecone Serverless Vector DB Studio",
    "desc": "Configure serverless cloud-native Pinecone indexes, dimensions, distance metrics, and AWS IAM connection policies. Generate initialization scripts, vector query templates, and IAM policies.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "64b1880",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "index_setup.py"
    ],
    "studioBridge": [
      {
        "component": "Pinecone Serverless Vector DB Studio",
        "studioId": "pinecone-serverless",
        "path": "/tools/pinecone-serverless/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-knowledge-graph": {
    "id": "tp-knowledge-graph",
    "repo": "Pradeeptalari14/tp-knowledge-graph",
    "title": "Knowledge Graph & Entity Extraction Studio",
    "desc": "Extract entities and construct semantic graph structures from unstructured texts. Programmatically compile node extraction pipelines, graph databases seeds, and entity mapping configurations.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4941021",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "entity_extractor.py"
    ],
    "studioBridge": [
      {
        "component": "Knowledge Graph & Entity Extraction Studio",
        "studioId": "knowledge-graph",
        "path": "/tools/knowledge-graph/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vectorless-rag": {
    "id": "tp-vectorless-rag",
    "repo": "Pradeeptalari14/tp-vectorless-rag",
    "title": "Vectorless RAG & Sparse Search Studio",
    "desc": "Build high-speed keyword retrieval pipelines utilizing BM25 algorithms, TF-IDF representations, and relational SQL queries. Generate sparse indexes, relational schemas, and query analyzers.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1e699f9",
    "languages": [
      "Python",
      "Go"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "bm25_retriever.py"
    ],
    "studioBridge": [
      {
        "component": "Vectorless RAG & Sparse Search Studio",
        "studioId": "vectorless-rag",
        "path": "/tools/vectorless-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-production-secrets": {
    "id": "tp-production-secrets",
    "repo": "Pradeeptalari14/tp-production-secrets",
    "title": "Production Secrets & Rotation Studio",
    "desc": "Manage enterprise credentials and dynamic keys rotation. Configure Vault databases connection leases, dynamic credentials providers, and Kubernetes External Secrets configurations.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "6514c9a",
    "languages": [
      "HCL / Terraform"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30",
      "PostgreSQL 16"
    ],
    "monorepo": false,
    "entrypoints": [
      "vault_rotation.tf",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Production Secrets & Rotation Studio",
        "studioId": "production-secrets",
        "path": "/tools/production-secrets/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-prompt-caching": {
    "id": "tp-prompt-caching",
    "repo": "Pradeeptalari14/tp-prompt-caching",
    "title": "Prompt Caching & Cost Optimization Studio",
    "desc": "Optimize AI API costs and latency using prompt caching. Compile Python SDK wrappers with cache decorators, raw HTTP JSON payloads with cache-control headers, and validation setups.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3d0ee3c",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "prompt_caching.py"
    ],
    "studioBridge": [
      {
        "component": "Prompt Caching & Cost Optimization Studio",
        "studioId": "prompt-caching",
        "path": "/tools/prompt-caching/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-deepseek-speculative-decoding": {
    "id": "tp-deepseek-speculative-decoding",
    "repo": "Pradeeptalari14/tp-deepseek-speculative-decoding",
    "title": "DeepSeek-R1 Speculative Decoding & Reasoning Studio",
    "desc": "Orchestrate DeepSeek-R1 speculative decoding pipelines. Configure lightweight draft models (Qwen-2.5-Coder), parallel token verification, 3.2x latency speedup, and 3Blue1Brown/Manim programmatic video animation.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "231b928",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "speculative_engine.py"
    ],
    "studioBridge": [
      {
        "component": "DeepSeek-R1 Speculative Decoding & Reasoning Studio",
        "studioId": "deepseek-speculative-decoding",
        "path": "/tools/deepseek-speculative-decoding/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-sglang-radix-attention": {
    "id": "tp-sglang-radix-attention",
    "repo": "Pradeeptalari14/tp-sglang-radix-attention",
    "title": "SGLang RadixAttention & Prefix-Caching Studio",
    "desc": "Simulate high-throughput Radix Tree KV-cache sharing across multi-turn agent chats, hierarchical system prompts, and tree-search decodings.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7b35cb7",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "SGLang KV-Cache",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "SGLang RadixAttention & Prefix-Caching Studio",
        "studioId": "sglang-radix-attention",
        "path": "/tools/sglang-radix-attention/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-deepseek-v3-moe-router": {
    "id": "tp-deepseek-v3-moe-router",
    "repo": "Pradeeptalari14/tp-deepseek-v3-moe-router",
    "title": "DeepSeek-V3 DualPipe & MoE Router Studio",
    "desc": "Simulate DeepSeek-V3 fine-grained expert routing (K=8 of 256), Multi-Head Latent Attention (MLA) 14x KV compression, and DualPipe communication overlap.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "78275c6",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "DeepSeek-V3 MoE",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "DeepSeek-V3 DualPipe & MoE Router Studio",
        "studioId": "deepseek-v3-moe",
        "path": "/tools/deepseek-v3-moe/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-webgpu-browser-slm": {
    "id": "tp-webgpu-browser-slm",
    "repo": "Pradeeptalari14/tp-webgpu-browser-slm",
    "title": "WebGPU In-Browser Small LM Studio",
    "desc": "Execute 4-bit quantized Small Language Models (SmolLM2/Phi-3.5) directly inside client web browsers with WebGPU WGSL compute shaders and air-gapped privacy.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1a1c9d7",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "WebGPU Zero-Server",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "WebGPU In-Browser Small LM Studio",
        "studioId": "webgpu-browser-slm",
        "path": "/tools/webgpu-browser-slm/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-vllm-paged-attention": {
    "id": "tp-vllm-paged-attention",
    "repo": "Pradeeptalari14/tp-vllm-paged-attention",
    "title": "vLLM PagedAttention & Chunked Prefill Studio",
    "desc": "Simulate vLLM PagedAttention v2 virtual memory block mapping, eliminate KV-cache fragmentation down to <4%, and co-schedule chunked prefill with FlashAttention-3 for 2.8x higher concurrency.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "ed6cca1",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "vLLM"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "paged_cache_engine.py"
    ],
    "studioBridge": [
      {
        "component": "vLLM PagedAttention & Chunked Prefill Studio",
        "studioId": "vllm-paged-attention",
        "path": "/tools/vllm-paged-attention/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-bitnet-ternary-inference": {
    "id": "tp-bitnet-ternary-inference",
    "repo": "Pradeeptalari14/tp-bitnet-ternary-inference",
    "title": "BitNet 1.58-bit Ternary LLM Inference Studio",
    "desc": "Simulate Microsoft BitNet b1.58 ternary weights {-1, 0, +1} replacing FP16 matrix multiplications with pure integer additions, delivering 71% DRAM energy reduction and zero GPU requirement.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "5eea32b",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "bitlinear_kernel.py"
    ],
    "studioBridge": [
      {
        "component": "BitNet 1.58-bit Ternary LLM Inference Studio",
        "studioId": "bitnet-ternary-inference",
        "path": "/tools/bitnet-ternary-inference/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-dspy-optimizer": {
    "id": "tp-dspy-optimizer",
    "repo": "Pradeeptalari14/tp-dspy-optimizer",
    "title": "DSPy Algorithmic Prompt Optimizer (MIPROv2) Studio",
    "desc": "Orchestrate Stanford DSPy MIPROv2 algorithmic prompt optimization. Replace hand-written prompt crafting with Bayesian search over instruction candidates and few-shot exemplars with +19.4% accuracy.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7b8b380",
    "languages": [
      "Python",
      "Go"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "dspy_compiler.py"
    ],
    "studioBridge": [
      {
        "component": "DSPy Algorithmic Prompt Optimizer (MIPROv2) Studio",
        "studioId": "dspy-optimizer",
        "path": "/tools/dspy-optimizer/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-agentic-temporal-memory": {
    "id": "tp-agentic-temporal-memory",
    "repo": "Pradeeptalari14/tp-agentic-temporal-memory",
    "title": "Agentic Temporal Memory & Episodic Graph Studio",
    "desc": "Simulate stateful agentic episodic memory combining Neo4j relational knowledge graph edges, Qdrant dense vector embeddings, Ebbinghaus forgetting decay, and sub-15ms prompt injection.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7dcead3",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "temporal_memory_engine.py"
    ],
    "studioBridge": [
      {
        "component": "Agentic Temporal Memory & Episodic Graph Studio",
        "studioId": "agentic-temporal-memory",
        "path": "/tools/agentic-temporal-memory/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-agent-swarm-consensus": {
    "id": "tp-agent-swarm-consensus",
    "repo": "Pradeeptalari14/tp-agent-swarm-consensus",
    "title": "Multi-Agent Swarm RAFT Consensus Studio",
    "desc": "Orchestrate Byzantine-resilient autonomous multi-agent swarms with distributed RAFT leader elections, append-entries heartbeats, cryptographic voting logs, and >66% quorum execution gates.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "773aeb0",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "raft_node_agent.py"
    ],
    "studioBridge": [
      {
        "component": "Multi-Agent Swarm RAFT Consensus Studio",
        "studioId": "agent-swarm-consensus",
        "path": "/tools/agent-swarm-consensus/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-tensorrt-llm-engine": {
    "id": "tp-tensorrt-llm-engine",
    "repo": "Pradeeptalari14/tp-tensorrt-llm-engine",
    "title": "TensorRT-LLM Multi-GPU Tensor Parallelism Studio",
    "desc": "Configure NVIDIA TensorRT-LLM 8-way Tensor Parallelism (TP=8) across H100 SXM5 GPUs. Maximize 900 GB/s NVLink All-Reduce bandwidth with FP8 quantization and in-flight continuous batching.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "2afa610",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "trtllm_engine_builder.py"
    ],
    "studioBridge": [
      {
        "component": "TensorRT-LLM Multi-GPU Tensor Parallelism Studio",
        "studioId": "tensorrt-llm-engine",
        "path": "/tools/tensorrt-llm-engine/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ebpf-continuous-profiler": {
    "id": "tp-ebpf-continuous-profiler",
    "repo": "Pradeeptalari14/tp-ebpf-continuous-profiler",
    "title": "Continuous eBPF Kernel Profiler & FlameGraph Studio",
    "desc": "Zero-overhead continuous CPU and memory profiling via Linux kernel eBPF ring buffers. Resolves DWARF frames and tracks off-CPU scheduler contention without application restart.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "ff5f662",
    "languages": [
      "Python",
      "Go",
      "Shell"
    ],
    "frameworks": [
      "Cilium / eBPF"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "ebpf_profiler_daemon.py"
    ],
    "studioBridge": [
      {
        "component": "Continuous eBPF Kernel Profiler & FlameGraph Studio",
        "studioId": "ebpf-continuous-profiler",
        "path": "/tools/ebpf-continuous-profiler/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-mcp-agentic-bridge": {
    "id": "tp-mcp-agentic-bridge",
    "repo": "Pradeeptalari14/tp-mcp-agentic-bridge",
    "title": "Anthropic Model Context Protocol (MCP) Multi-Agent Gateway Studio",
    "desc": "Enterprise Model Context Protocol gateway providing dynamic tool discovery, fine-grained OAuth2/RBAC security gates, and bi-directional SSE streaming across multi-agent fleets.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "370aa64",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "mcp_gateway_router.py"
    ],
    "studioBridge": [
      {
        "component": "Anthropic Model Context Protocol (MCP) Multi-Agent Gateway Studio",
        "studioId": "mcp-universal-gateway",
        "path": "/tools/mcp-universal-gateway/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-speculative-rag-verifier": {
    "id": "tp-speculative-rag-verifier",
    "repo": "Pradeeptalari14/tp-speculative-rag-verifier",
    "title": "Speculative RAG & Self-Correction Studio",
    "desc": "Dual-stage Speculative RAG orchestrator: fast 1.5B edge SLM drafts parallel hypotheses verified in a single forward pass by a 70B judge, eliminating hallucinations and slashing TTFT.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "25408ca",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "speculative_rag_engine.py"
    ],
    "studioBridge": [
      {
        "component": "Speculative RAG & Self-Correction Studio",
        "studioId": "speculative-rag-pipeline",
        "path": "/tools/speculative-rag-pipeline/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-deepspeed-zero-offload": {
    "id": "tp-deepspeed-zero-offload",
    "repo": "Pradeeptalari14/tp-deepspeed-zero-offload",
    "title": "Microsoft DeepSpeed ZeRO-3 & NVMe Offload Studio",
    "desc": "Extreme-scale distributed model training engine partitioning optimizer states, gradients, and parameters across multi-node clusters with ZeRO-Infinity NVMe asynchronous prefetching.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "598fa32",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "zero3_offload_engine.py"
    ],
    "studioBridge": [
      {
        "component": "Microsoft DeepSpeed ZeRO-3 & NVMe Offload Studio",
        "studioId": "deepspeed-zero-offload",
        "path": "/tools/deepspeed-zero-offload/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-confidential-ai-tee": {
    "id": "tp-confidential-ai-tee",
    "repo": "Pradeeptalari14/tp-confidential-ai-tee",
    "title": "Confidential AI & NVIDIA H100 TEE Attestation Studio",
    "desc": "Hardware-enforced confidential computing with NVIDIA Hopper H100 GPU TEE, AMD SEV-SNP enclaves, SPDM cryptographic remote attestation, and encrypted VRAM weight protection.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "639703f",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "tee_attestation_verifier.py"
    ],
    "studioBridge": [
      {
        "component": "Confidential AI & NVIDIA H100 TEE Attestation Studio",
        "studioId": "confidential-ai-tee",
        "path": "/tools/confidential-ai-tee/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-quantum-hybrid-rag": {
    "id": "tp-quantum-hybrid-rag",
    "repo": "Pradeeptalari14/tp-quantum-hybrid-rag",
    "title": "Quantum-Classical Hybrid RAG & Embedding Studio",
    "desc": "Quantum Kernel Feature Maps and Variational Quantum Classifiers (VQC) in Hilbert space, eliminating classical cosine saturation and enhancing semantic discrimination.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "148891a",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "quantum_kernel_rag.py"
    ],
    "studioBridge": [
      {
        "component": "Quantum-Classical Hybrid RAG & Embedding Studio",
        "studioId": "quantum-hybrid-rag",
        "path": "/tools/quantum-hybrid-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-kuberay": {
    "id": "tp-kuberay",
    "repo": "Pradeeptalari14/tp-kuberay",
    "title": "KubeRay Operator Studio",
    "desc": "Generate production KubeRay RayCluster, RayJob and RayService manifests with GCS fault tolerance, autoscaler v2, GPU worker groups and zero-downtime Ray Serve upgrades on Kubernetes.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "44bce47",
    "languages": [
      "YAML"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "kuberay.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "KubeRay Operator Studio",
        "studioId": "kuberay",
        "path": "/tools/kuberay/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-colpali-rag": {
    "id": "tp-colpali-rag",
    "repo": "Pradeeptalari14/tp-colpali-rag",
    "title": "ColPali Vision-Language Multi-Vector RAG Studio",
    "desc": "Eliminate OCR pipelines by indexing PDF pages directly as PaliGemma-3B vision-language patch embeddings with Qdrant multi-vector store and late-interaction MaxSim retrieval.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "551d90a",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "colpali_retriever.py"
    ],
    "studioBridge": [
      {
        "component": "ColPali Vision-Language Multi-Vector RAG Studio",
        "studioId": "colpali-vlm-rag",
        "path": "/tools/colpali-vlm-rag/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-disaggregated-serving": {
    "id": "tp-disaggregated-serving",
    "repo": "Pradeeptalari14/tp-disaggregated-serving",
    "title": "Disaggregated Prefill & Decode Serving Studio",
    "desc": "Split LLM inference into compute-bound prefill and memory-bound decode worker pools with Mooncake KV cache chunk transfer over RoCEv2/InfiniBand RDMA.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "34b09ab",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "pd_disaggregated_router.py"
    ],
    "studioBridge": [
      {
        "component": "Disaggregated Prefill & Decode Serving Studio",
        "studioId": "disaggregated-prefill-decode",
        "path": "/tools/disaggregated-prefill-decode/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ebpf-tetragon": {
    "id": "tp-ebpf-tetragon",
    "repo": "Pradeeptalari14/tp-ebpf-tetragon",
    "title": "Cilium Tetragon eBPF Kernel Runtime Security Studio",
    "desc": "Enforce zero-overhead kernel-level security observability and automated SIGKILL runtime prevention for Kubernetes clusters using Cilium Tetragon eBPF TracingPolicies.",
    "category": "observability",
    "defaultBranch": "main",
    "commitSha": "739ce2a",
    "languages": [
      "Python",
      "Go",
      "YAML"
    ],
    "frameworks": [
      "Kubernetes",
      "Cilium / eBPF"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "tracingpolicy-k8s.yaml",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Cilium Tetragon eBPF Kernel Runtime Security Studio",
        "studioId": "ebpf-tetragon-security",
        "path": "/tools/ebpf-tetragon-security/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-computer-use-agent": {
    "id": "tp-computer-use-agent",
    "repo": "Pradeeptalari14/tp-computer-use-agent",
    "title": "Autonomous Computer-Use & OS Operator Agent Studio",
    "desc": "Deploy sandboxed autonomous OS operator agents with Anthropic/OpenAI Computer Use APIs, Xvfb virtual displays, visual GUI grounding, and zero-trust Kubernetes execution walls.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "3f9cb20",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Kubernetes"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Kubernetes v1.30"
    ],
    "monorepo": false,
    "entrypoints": [
      "computer_use_agent.py"
    ],
    "studioBridge": [
      {
        "component": "Autonomous Computer-Use & OS Operator Agent Studio",
        "studioId": "computer-use-agent",
        "path": "/tools/computer-use-agent/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-rocm-mi300x": {
    "id": "tp-rocm-mi300x",
    "repo": "Pradeeptalari14/tp-rocm-mi300x",
    "title": "AMD ROCm 6.2 & Instinct MI300X AI Studio",
    "desc": "Scale open-weights LLMs on AMD Instinct MI300X accelerators (192GB HBM3, 5.3 TB/s) with vLLM ROCm FlashAttention-2, PyTorch FSDP multi-node, and Triton gfx942 kernels.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1c94d7a",
    "languages": [
      "Python",
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "vLLM"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "vllm_mi300x_serve.py"
    ],
    "studioBridge": [
      {
        "component": "AMD ROCm 6.2 & Instinct MI300X AI Studio",
        "studioId": "amd-rocm-mi300x",
        "path": "/tools/amd-rocm-mi300x/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-claude-hybrid-reasoning": {
    "id": "tp-claude-hybrid-reasoning",
    "repo": "Pradeeptalari14/tp-claude-hybrid-reasoning",
    "title": "Claude 3.7 Sonnet Hybrid Reasoning Studio",
    "desc": "Deploy Anthropic's flagship hybrid reasoning model with dynamic thinking budgets, sub-agent tool orchestrators, and prompt complexity routers.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1cb8a8b",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "claude_reasoner.py"
    ],
    "studioBridge": [
      {
        "component": "Claude 3.7 Sonnet Hybrid Reasoning Studio",
        "studioId": "claude-hybrid-reasoning",
        "path": "/tools/claude-hybrid-reasoning/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-openai-realtime-voice": {
    "id": "tp-openai-realtime-voice",
    "repo": "Pradeeptalari14/tp-openai-realtime-voice",
    "title": "OpenAI Realtime WebRTC Voice Studio",
    "desc": "Orchestrate bidirectional sub-300ms multimodal audio streams with WebRTC data channels, Whisper speech-to-speech, and function call execution.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "137fff0",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "openai_realtime_webrtc.py"
    ],
    "studioBridge": [
      {
        "component": "OpenAI Realtime WebRTC Voice Studio",
        "studioId": "openai-realtime-voice",
        "path": "/tools/openai-realtime-voice/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-deepseek-mla-dualpipe": {
    "id": "tp-deepseek-mla-dualpipe",
    "repo": "Pradeeptalari14/tp-deepseek-mla-dualpipe",
    "title": "DeepSeek-R1 Multi-Head Latent Attention & DualPipe Studio",
    "desc": "Deploy DeepSeek-R1 / V3 671B MoE architecture with Multi-Head Latent Attention (MLA) 93.3% KV-cache compression, DualPipe computation overlap, and native FP8 GEMM.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "1a7487d",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "deepseek_mla_engine.py"
    ],
    "studioBridge": [
      {
        "component": "DeepSeek-R1 Multi-Head Latent Attention & DualPipe Studio",
        "studioId": "deepseek-mla-dualpipe",
        "path": "/tools/deepseek-mla-dualpipe/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-qwen-agentic-coder": {
    "id": "tp-qwen-agentic-coder",
    "repo": "Pradeeptalari14/tp-qwen-agentic-coder",
    "title": "Qwen2.5-Coder-32B Enterprise Agentic Coding Studio",
    "desc": "Deploy Alibaba Cloud's state-of-the-art coding model with 128k context YaRN, autonomous ReAct loops, AST syntax verification, and AWQ 4-bit vLLM serving.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7b04415",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "vLLM"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2",
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "qwen_coder_agent.py"
    ],
    "studioBridge": [
      {
        "component": "Qwen2.5-Coder-32B Enterprise Agentic Coding Studio",
        "studioId": "qwen-agentic-coder",
        "path": "/tools/qwen-agentic-coder/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-kimi-long-context": {
    "id": "tp-kimi-long-context",
    "repo": "Pradeeptalari14/tp-kimi-long-context",
    "title": "Moonshot Kimi K1.5 2M Ultra-Long Context Studio",
    "desc": "Deploy Moonshot Kimi K1.5 2-Million token ultra-long context reasoning engine with hierarchical NVMe KV-cache offload, radix prefix caching, and 100% NIAH accuracy.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "754329c",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "kimi_long_context_engine.py"
    ],
    "studioBridge": [
      {
        "component": "Moonshot Kimi K1.5 2M Ultra-Long Context Studio",
        "studioId": "kimi-long-context",
        "path": "/tools/kimi-long-context/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gpt-6-sol-computer-control": {
    "id": "tp-gpt-6-sol-computer-control",
    "repo": "Pradeeptalari14/tp-gpt-6-sol-computer-control",
    "title": "OpenAI GPT-6.1 Sol Computer Control & Software Engineering Studio",
    "desc": "Deploy OpenAI GPT-6.1 Sol: frontier AI tailored for complex software engineering, 80% cost reduction, and human-like desktop graphical computer use.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "77d7a1d",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "gpt6_sol_agent.py"
    ],
    "studioBridge": [
      {
        "component": "OpenAI GPT-6.1 Sol Computer Control & Software Engineering Studio",
        "studioId": "gpt-6-sol-computer-control",
        "path": "/tools/gpt-6-sol-computer-control/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-dots-autonomous-agents": {
    "id": "tp-dots-autonomous-agents",
    "repo": "Pradeeptalari14/tp-dots-autonomous-agents",
    "title": "OpenAI Dots 24/7 Autonomous Cloud Agents Studio",
    "desc": "Deploy 24/7 background AI agents running in isolated cloud sandboxes, orchestrating autonomous workflows across 4,000+ linked enterprise applications.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "e325947",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "dots_agent_worker.py"
    ],
    "studioBridge": [
      {
        "component": "OpenAI Dots 24/7 Autonomous Cloud Agents Studio",
        "studioId": "dots-autonomous-cloud-agents",
        "path": "/tools/dots-autonomous-cloud-agents/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gpt-6-luna-decisions": {
    "id": "tp-gpt-6-luna-decisions",
    "repo": "Pradeeptalari14/tp-gpt-6-luna-decisions",
    "title": "OpenAI GPT-6 Luna Decisions API & Structural Router Studio",
    "desc": "Deploy OpenAI GPT-6 Luna: lightweight, sub-second classification engine processing strict JSON schemas to execute low-latency branch routing decisions.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "7886457",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "luna_decisions_router.py"
    ],
    "studioBridge": [
      {
        "component": "OpenAI GPT-6 Luna Decisions API & Structural Router Studio",
        "studioId": "gpt-6-luna-decisions",
        "path": "/tools/gpt-6-luna-decisions/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-private-intelligence-zdr": {
    "id": "tp-private-intelligence-zdr",
    "repo": "Pradeeptalari14/tp-private-intelligence-zdr",
    "title": "OpenAI Private Intelligence & Zero Data Retention (ZDR) Studio",
    "desc": "Deploy OpenAI Private Intelligence: enterprise security layer featuring Zero Data Retention (ZDR), confidential computing enclaves (AMD SEV-SNP), and ephemeral key shredding.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "22e6f84",
    "languages": [
      "Python"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "zdr_enclave_gateway.py"
    ],
    "studioBridge": [
      {
        "component": "OpenAI Private Intelligence & Zero Data Retention (ZDR) Studio",
        "studioId": "private-intelligence-zdr",
        "path": "/tools/private-intelligence-zdr/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-codex-cloud-sandboxes": {
    "id": "tp-codex-cloud-sandboxes",
    "repo": "Pradeeptalari14/tp-codex-cloud-sandboxes",
    "title": "Codex Cloud Sandboxes & Ephemeral Runner Studio",
    "desc": "Sub-50ms ephemeral Linux microVM sandboxes for executing untrusted AI-generated code with network namespace isolation.",
    "category": "automation",
    "defaultBranch": "main",
    "commitSha": "67ab128",
    "languages": [
      "Go",
      "Shell"
    ],
    "frameworks": [
      "gVisor",
      "Firecracker",
      "Docker"
    ],
    "packageManagers": [
      "go modules"
    ],
    "infrastructure": [
      "Linux Cgroups v2",
      "Docker"
    ],
    "monorepo": false,
    "entrypoints": [
      "sandbox_daemon.go",
      "runner.sh"
    ],
    "studioBridge": [
      {
        "component": "Codex Cloud Sandboxes",
        "studioId": "codex-cloud-sandboxes",
        "path": "/tools/codex-cloud-sandboxes/"
      },
      {
        "component": "Local Cloud Dev",
        "studioId": "local-cloud-dev",
        "path": "/tools/local-cloud-dev/"
      }
    ]
  },
  "tp-gpt-live-voice-api": {
    "id": "tp-gpt-live-voice-api",
    "repo": "Pradeeptalari14/tp-gpt-live-voice-api",
    "title": "GPT Live Voice API Studio",
    "desc": "Design full-duplex realtime voice agents over WebRTC with low-latency audio streaming, barge-in handling, server VAD and function calling.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "4ebd344",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "voice-api.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "GPT Live Voice API Studio",
        "studioId": "gpt-live-voice-api",
        "path": "/tools/gpt-live-voice-api/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-codex-security-cloud": {
    "id": "tp-codex-security-cloud",
    "repo": "Pradeeptalari14/tp-codex-security-cloud",
    "title": "Codex Security Cloud Scanner Studio",
    "desc": "Automated repository vulnerability scanning with Semgrep rules, AI-assisted triage and SARIF output for GitHub code scanning.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "28e319f",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Cloud VPC & IAM"
    ],
    "monorepo": false,
    "entrypoints": [
      "security-scan.sarif",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Codex Security Cloud Scanner Studio",
        "studioId": "codex-security-cloud",
        "path": "/tools/codex-security-cloud/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-chatgpt-space-collab": {
    "id": "tp-chatgpt-space-collab",
    "repo": "Pradeeptalari14/tp-chatgpt-space-collab",
    "title": "ChatGPT Space Collaboration Studio",
    "desc": "Multi-user, multi-agent collaborative canvas with CRDT state sync over WebSockets, presence and conflict-free merges.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "592a856",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "space-crdt.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "ChatGPT Space Collaboration Studio",
        "studioId": "chatgpt-space-collaboration",
        "path": "/tools/chatgpt-space-collaboration/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-ai-pages-canvas": {
    "id": "tp-ai-pages-canvas",
    "repo": "Pradeeptalari14/tp-ai-pages-canvas",
    "title": "AI Pages Dynamic Canvas Studio",
    "desc": "Live computational documents with sandboxed script execution, dynamic notebooks and interactive generated UI blocks.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "29c6e44",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "canvas-runtime.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "AI Pages Dynamic Canvas Studio",
        "studioId": "ai-pages-dynamic-canvas",
        "path": "/tools/ai-pages-dynamic-canvas/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-signin-chatgpt-identity": {
    "id": "tp-signin-chatgpt-identity",
    "repo": "Pradeeptalari14/tp-signin-chatgpt-identity",
    "title": "Sign in with ChatGPT Identity Studio",
    "desc": "OAuth2 / OIDC identity brokering with PKCE, token exchange, scoped claims and zero-data-retention session handling.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "6c38497",
    "languages": [
      "JavaScript/TypeScript"
    ],
    "frameworks": [
      "Docker",
      "Cloud Native"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "docker"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "oidc-config.json",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Sign in with ChatGPT Identity Studio",
        "studioId": "signin-chatgpt-identity",
        "path": "/tools/signin-chatgpt-identity/"
      },
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      }
    ]
  },
  "tp-gemini-2-flash-live": {
    "id": "tp-gemini-2-flash-live",
    "repo": "Pradeeptalari14/tp-gemini-2-flash-live",
    "title": "Gemini 2.0 Flash Live Multimodal Streaming Studio",
    "desc": "Sub-200ms bi-directional WebRTC audio and video streaming with Gemini 2.0 Flash Live API, tool calling, and screen grounding.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "78fa310",
    "languages": [
      "TypeScript",
      "Python"
    ],
    "frameworks": [
      "WebRTC",
      "FastAPI",
      "Google GenAI SDK"
    ],
    "packageManagers": [
      "npm",
      "pip"
    ],
    "infrastructure": [
      "Docker",
      "Coturn STUN/TURN"
    ],
    "monorepo": false,
    "entrypoints": [
      "live_client.ts",
      "server.py"
    ],
    "studioBridge": [
      {
        "component": "Gemini Live Streaming",
        "studioId": "gemini-2-flash-live",
        "path": "/tools/gemini-2-flash-live/"
      },
      {
        "component": "OpenAI Realtime Voice",
        "studioId": "openai-realtime-voice",
        "path": "/tools/openai-realtime-voice/"
      }
    ]
  },
  "tp-claude-37-computer-use": {
    "id": "tp-claude-37-computer-use",
    "repo": "Pradeeptalari14/tp-claude-37-computer-use",
    "title": "Claude 3.7 Sonnet Computer Use Automation Hub",
    "desc": "Autonomous desktop OS automation, mouse pointer control, bash shell execution, and visual screen coordinate grounding.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "a19f201",
    "languages": [
      "Python",
      "Shell"
    ],
    "frameworks": [
      "Anthropic SDK",
      "PyAutoGUI",
      "FastAPI"
    ],
    "packageManagers": [
      "pip (requirements.txt)"
    ],
    "infrastructure": [
      "Docker (X11 Virtual Display)",
      "gVisor"
    ],
    "monorepo": false,
    "entrypoints": [
      "agent.py",
      "computer.py"
    ],
    "studioBridge": [
      {
        "component": "Computer Use Agent",
        "studioId": "claude-37-computer-use",
        "path": "/tools/claude-37-computer-use/"
      },
      {
        "component": "Agent Workflow",
        "studioId": "agent-workflow",
        "path": "/tools/agent-workflow/"
      }
    ]
  },
  "tp-mistral-pixtral-vlm": {
    "id": "tp-mistral-pixtral-vlm",
    "repo": "Pradeeptalari14/tp-mistral-pixtral-vlm",
    "title": "Mistral Pixtral 12B Vision Language Model Studio",
    "desc": "Multimodal vision-language inference with dynamic image resolution tokenization, chart understanding, and OCR extraction.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "56fe91b",
    "languages": [
      "Python",
      "HTML"
    ],
    "frameworks": [
      "vLLM",
      "PyTorch",
      "HuggingFace"
    ],
    "packageManagers": [
      "pip"
    ],
    "infrastructure": [
      "NVIDIA GPU Container",
      "CUDA 12.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "serve_vlm.py",
      "client.py"
    ],
    "studioBridge": [
      {
        "component": "Pixtral VLM Engine",
        "studioId": "mistral-pixtral-vlm",
        "path": "/tools/mistral-pixtral-vlm/"
      },
      {
        "component": "vLLM PagedAttention",
        "studioId": "vllm-paged-attention",
        "path": "/tools/vllm-paged-attention/"
      }
    ]
  },
  "tp-yi-lightning-moe": {
    "id": "tp-yi-lightning-moe",
    "repo": "Pradeeptalari14/tp-yi-lightning-moe",
    "title": "Yi-Lightning Mixture-of-Experts Inference Engine",
    "desc": "Ultra-fast bilingual MoE LLM serving engine with dynamic expert dispatch, sub-15ms TTFT, and hierarchical speculative KV-cache reuse.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "94ca230",
    "languages": [
      "Python",
      "Shell"
    ],
    "frameworks": [
      "vLLM",
      "PyTorch",
      "FastAPI"
    ],
    "packageManagers": [
      "pip (requirements.txt)"
    ],
    "infrastructure": [
      "NVIDIA H100 / A100 GPU",
      "Docker"
    ],
    "monorepo": false,
    "entrypoints": [
      "bilingual_token_estimator.py",
      "serve_moe.sh"
    ],
    "studioBridge": [
      {
        "component": "Yi-Lightning MoE Engine",
        "studioId": "yi-lightning-moe",
        "path": "/tools/yi-lightning-moe/"
      },
      {
        "component": "DeepSeek MoE Router",
        "studioId": "deepseek-v3-moe-router",
        "path": "/tools/deepseek-v3-moe-router/"
      }
    ]
  },
  "tp-openai-marketplace-broker": {
    "id": "tp-openai-marketplace-broker",
    "repo": "Pradeeptalari14/tp-openai-marketplace-broker",
    "title": "OpenAI Marketplace Quota & Token Broker Studio",
    "desc": "Multi-tenant OpenAI token quota arbitrator with sliding-window rate limiters, token leasing, and cost attribution metrics.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "891cd02",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "FastAPI",
      "Redis",
      "Celery"
    ],
    "packageManagers": [
      "pip (requirements.txt)"
    ],
    "infrastructure": [
      "Docker",
      "Redis 7.2"
    ],
    "monorepo": false,
    "entrypoints": [
      "quota_broker.py",
      "main.py"
    ],
    "studioBridge": [
      {
        "component": "Token Broker Gateway",
        "studioId": "openai-marketplace-broker",
        "path": "/tools/openai-marketplace-broker/"
      },
      {
        "component": "API Gateway Studio",
        "studioId": "api-gateway",
        "path": "/tools/api-gateway/"
      }
    ]
  },
  "tp-sigstore-cosign-slsa": {
    "id": "tp-sigstore-cosign-slsa",
    "repo": "Pradeeptalari14/tp-sigstore-cosign-slsa",
    "title": "Sigstore Cosign Keyless Attestation & SLSA Studio",
    "desc": "Keyless OIDC cryptographic container signing, Rekor transparency log integration, and SLSA Level 3 supply chain attestation.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "e714a02",
    "languages": [
      "Go",
      "Shell",
      "YAML"
    ],
    "frameworks": [
      "Cosign CLI",
      "Sigstore",
      "Kyverno"
    ],
    "packageManagers": [
      "go modules"
    ],
    "infrastructure": [
      "Distroless Container",
      "Rekor",
      "Fulcio"
    ],
    "monorepo": false,
    "entrypoints": [
      "scripts/sign.sh",
      ".github/workflows/slsa.yml"
    ],
    "studioBridge": [
      {
        "component": "Cosign Keyless Signing",
        "studioId": "sigstore-cosign-slsa",
        "path": "/tools/sigstore-cosign-slsa/"
      },
      {
        "component": "Kubernetes Admission",
        "studioId": "kubernetes",
        "path": "/tools/kubernetes/"
      }
    ]
  },
  "tp-sbom-cyclonedx-governance": {
    "id": "tp-sbom-cyclonedx-governance",
    "repo": "Pradeeptalari14/tp-sbom-cyclonedx-governance",
    "title": "CycloneDX SBOM & Supply Chain Governance Studio",
    "desc": "Software Bill of Materials generation via Syft, vulnerability scanning with Grype, and automated EPSS risk threshold gating.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "c819fa4",
    "languages": [
      "JSON",
      "Shell",
      "Go"
    ],
    "frameworks": [
      "Syft",
      "Grype",
      "CycloneDX 1.5"
    ],
    "packageManagers": [
      "go modules",
      "npm"
    ],
    "infrastructure": [
      "Docker",
      "GitHub Actions"
    ],
    "monorepo": false,
    "entrypoints": [
      "scripts/generate_sbom.sh",
      "sbom.cdx.json"
    ],
    "studioBridge": [
      {
        "component": "SBOM Governance",
        "studioId": "sbom-cyclonedx-governance",
        "path": "/tools/sbom-cyclonedx-governance/"
      },
      {
        "component": "Trivy Scanner",
        "studioId": "trivy",
        "path": "/tools/trivy/"
      }
    ]
  },
  "tp-semgrep-ast-guardrails": {
    "id": "tp-semgrep-ast-guardrails",
    "repo": "Pradeeptalari14/tp-semgrep-ast-guardrails",
    "title": "Semgrep AST Static Analysis & Guardrails Engine",
    "desc": "Semantic AST SAST policy suites blocking SQL injections, hardcoded JWT secrets, and insecure deserialization in PR workflows.",
    "category": "cicd",
    "defaultBranch": "main",
    "commitSha": "b91c890",
    "languages": [
      "YAML",
      "Python",
      "Go",
      "JavaScript"
    ],
    "frameworks": [
      "Semgrep Engine",
      "PyTest"
    ],
    "packageManagers": [
      "pip",
      "npm"
    ],
    "infrastructure": [
      "Docker",
      "GitHub Actions CI"
    ],
    "monorepo": false,
    "entrypoints": [
      "rules/owasp-top10.yml",
      "scripts/validate.sh"
    ],
    "studioBridge": [
      {
        "component": "Semgrep AST Rules",
        "studioId": "semgrep-ast-guardrails",
        "path": "/tools/semgrep-ast-guardrails/"
      },
      {
        "component": "DevSecOps Pipeline",
        "studioId": "devsecops-portfolio-guide",
        "path": "/tools/devsecops-portfolio-guide/"
      }
    ]
  },
  "tp-owasp-llm-agent-shield": {
    "id": "tp-owasp-llm-agent-shield",
    "repo": "Pradeeptalari14/tp-owasp-llm-agent-shield",
    "title": "OWASP Top 10 for LLMs & AI Agent Shield Studio",
    "desc": "Real-time prompt injection classifier, sensitive PII sanitizer, and tool-hijacking defenses protecting autonomous multi-agent swarms.",
    "category": "ai",
    "defaultBranch": "main",
    "commitSha": "f1029ba",
    "languages": [
      "Python",
      "YAML"
    ],
    "frameworks": [
      "LangChain",
      "FastAPI",
      "Guardrails AI"
    ],
    "packageManagers": [
      "pip (requirements.txt)"
    ],
    "infrastructure": [
      "Docker",
      "Ollama LLM"
    ],
    "monorepo": false,
    "entrypoints": [
      "shield.py",
      "guardrails-config.yaml"
    ],
    "studioBridge": [
      {
        "component": "OWASP LLM Shield",
        "studioId": "owasp-llm-agent-shield",
        "path": "/tools/owasp-llm-agent-shield/"
      },
      {
        "component": "Agent Workflow",
        "studioId": "agent-workflow",
        "path": "/tools/agent-workflow/"
      }
    ]
  },
  "tp-boundary-zerotrust": {
    "id": "tp-boundary-zerotrust",
    "repo": "Pradeeptalari14/tp-boundary-zerotrust",
    "title": "HashiCorp Boundary Zero-Trust Access Studio",
    "desc": "Identity-based ephemeral access control replacing static SSH bastion keys with OIDC authenticated session routing for Kubernetes and Aurora DBs.",
    "category": "cloud",
    "defaultBranch": "main",
    "commitSha": "d38f121",
    "languages": [
      "HCL",
      "Shell",
      "Go"
    ],
    "frameworks": [
      "HashiCorp Boundary",
      "Terraform"
    ],
    "packageManagers": [
      "terraform"
    ],
    "infrastructure": [
      "Docker Compose",
      "PostgreSQL (Boundary KMS)",
      "Boundary Worker"
    ],
    "monorepo": false,
    "entrypoints": [
      "boundary-controller.hcl",
      "docker-compose.yml"
    ],
    "studioBridge": [
      {
        "component": "Boundary Access Controller",
        "studioId": "hashicorp-boundary-zerotrust",
        "path": "/tools/hashicorp-boundary-zerotrust/"
      },
      {
        "component": "Terraform Infrastructure",
        "studioId": "terraform",
        "path": "/tools/terraform/"
      }
    ]
  },
  "tp-backend-ecosystem": {
    "id": "tp-backend-ecosystem",
    "repo": "Pradeeptalari14/tp-backend-ecosystem",
    "title": "Enterprise Backend Ecosystem & Lifecycle Platform",
    "desc": "Production multi-stack microservices: Python FastAPI order engine, Node.js WebSockets broadcast hub, Go HMAC webhook dispatcher, Redis caching, and Celery workers.",
    "category": "devops",
    "defaultBranch": "main",
    "commitSha": "42be0e3",
    "languages": [
      "Python",
      "JavaScript",
      "Go",
      "Shell",
      "YAML"
    ],
    "frameworks": [
      "FastAPI",
      "Express",
      "Gin",
      "Celery",
      "BullMQ",
      "Asynq"
    ],
    "packageManagers": [
      "pip (requirements.txt)",
      "npm (package.json)",
      "go modules (go.mod)"
    ],
    "infrastructure": [
      "Docker Compose",
      "NGINX 1.25",
      "PostgreSQL 16",
      "MySQL 8",
      "Redis 7.2",
      "RabbitMQ 3.13"
    ],
    "monorepo": true,
    "entrypoints": [
      "main.py",
      "projects/ecommerce-order-engine/main.py",
      "projects/notification-event-hub/src/index.js",
      "projects/saas-billing-dispatcher/main.go"
    ],
    "studioBridge": [
      {
        "component": "FastAPI Microservice",
        "studioId": "backend-ecosystem",
        "path": "/tools/backend-ecosystem/"
      },
      {
        "component": "NGINX Ingress",
        "studioId": "nginx-config",
        "path": "/tools/nginx-config/"
      },
      {
        "component": "Redis Cache & Locks",
        "studioId": "redis-cesc",
        "path": "/tools/redis-cesc/"
      },
      {
        "component": "Celery / Queue SRE",
        "studioId": "event-sre",
        "path": "/tools/event-sre/"
      },
      {
        "component": "Postgres & Migration",
        "studioId": "db-migration",
        "path": "/tools/db-migration/"
      }
    ]
  },
  "tp-repo-learning": {
    "id": "tp-repo-learning",
    "repo": "Pradeeptalari14/tp-repo-learning",
    "title": "Unified Repository Learning Workspace & Real Project Platform",
    "desc": "Interactive codebase parser, architecture DAG generator, 10-point courses, one-click dev setups, and stack trace debugger.",
    "category": "devops",
    "defaultBranch": "main",
    "commitSha": "035f888",
    "languages": [
      "Python",
      "Shell",
      "Docker"
    ],
    "frameworks": [
      "FastAPI",
      "Docker Compose",
      "GitHub Actions"
    ],
    "packageManagers": [
      "pip"
    ],
    "infrastructure": [
      "Docker Compose",
      "Linux Containers"
    ],
    "monorepo": false,
    "entrypoints": [
      "main.py",
      "scripts/validate.sh"
    ],
    "studioBridge": [
      {
        "component": "Repository Workspace",
        "studioId": "repo-learning",
        "path": "/tools/repo-learning/"
      },
      {
        "component": "Backend Ecosystem",
        "studioId": "backend-ecosystem",
        "path": "/tools/backend-ecosystem/"
      }
    ]
  }
};

export class RepoLearningGenerator {
  constructor() {
    this.name = 'Unified Repository Learning & Development Workspace';
    this.version = '2.0.0';
    this._presets = ALL_PRESET_REPOSITORIES;
  }

  presetRepositories() {
    return this._presets;
  }

  inspectRepository(files = []) {
    // Detect languages, frameworks, package managers, and DevOps files from file list
    const fileNames = files.map(f => typeof f === 'string' ? f : f.path || f.name);

    const hasPy = fileNames.some(f => f.endsWith('.py'));
    const hasJs = fileNames.some(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx'));
    const hasGo = fileNames.some(f => f.endsWith('.go'));
    const hasHcl = fileNames.some(f => f.endsWith('.tf') || f.endsWith('.hcl'));
    const hasSh = fileNames.some(f => f.endsWith('.sh'));
    const hasYaml = fileNames.some(f => f.endsWith('.yml') || f.endsWith('.yaml'));

    const detectedLanguages = [];
    if (hasPy) detectedLanguages.push('Python');
    if (hasJs) detectedLanguages.push('TypeScript/JavaScript');
    if (hasGo) detectedLanguages.push('Go');
    if (hasHcl) detectedLanguages.push('HCL / Terraform');
    if (hasSh) detectedLanguages.push('Shell Script');
    if (hasYaml) detectedLanguages.push('YAML');

    const hasDocker = fileNames.some(f => f.toLowerCase().includes('dockerfile'));
    const hasCompose = fileNames.some(f => f.toLowerCase().includes('docker-compose'));
    const hasCi = fileNames.some(f => f.includes('.github/workflows'));
    const hasDevContainer = fileNames.some(f => f.includes('.devcontainer'));
    const isMonorepo = fileNames.some(f => f.startsWith('projects/') || f.startsWith('packages/'));

    return {
      languages: detectedLanguages.length ? detectedLanguages : ['General Polyglot'],
      monorepo: isMonorepo,
      dockerSupport: hasDocker || hasCompose,
      composeFile: hasCompose,
      ciConfigured: hasCi,
      devContainer: hasDevContainer,
      totalFiles: fileNames.length
    };
  }

  generateArchitectureDag(repoId = 'tp-backend-ecosystem') {
    if (repoId === 'tp-semgrep-ast-guardrails') {
      return {
        nodes: [
          { id: 'src', title: 'Source Code (PR)', role: 'Python / Go / JS pull request changes' },
          { id: 'parser', title: 'Tree-Sitter AST Parser', role: 'Converts code into Abstract Syntax Trees' },
          { id: 'engine', title: 'Semgrep Rule Engine', role: 'Matches pattern-either and taint-tracking rules' },
          { id: 'gate', title: 'CI/CD Gating Hook', role: 'Blocks PR if HIGH/CRITICAL vulnerabilities found' },
          { id: 'sarif', title: 'SARIF Security Report', role: 'Uploads auditable findings to GitHub Security tab' }
        ],
        connections: [
          { from: 'src', to: 'parser' },
          { from: 'parser', to: 'engine' },
          { from: 'engine', to: 'gate' },
          { from: 'gate', to: 'sarif' }
        ]
      };
    }

    if (repoId === 'tp-backend-ecosystem') {
      return {
        nodes: [
          { id: 'client', title: 'Client Browser', role: 'Emits HTTP/2 request with JWT & Idempotency-Key' },
          { id: 'nginx', title: 'NGINX Reverse Proxy', role: 'SSL termination & Token Bucket rate limiting' },
          { id: 'auth', title: 'JWT Auth Gate', role: 'RS256 public key cryptographic signature verification' },
          { id: 'backend', title: 'FastAPI / Express API', role: 'Validates payload, coordinates DB & Queue' },
          { id: 'cache', title: 'Redis 7 Cache', role: 'Sub-2ms inventory check and idempotency locking' },
          { id: 'db', title: 'PostgreSQL DB', role: 'ACID row-level lock and immutable ledger write' },
          { id: 'queue', title: 'RabbitMQ Broker', role: 'Durable event topic exchange message publish' },
          { id: 'worker', title: 'Celery Worker', role: 'Asynchronous payment capture & email dispatch' },
          { id: 'saas', title: 'Stripe SaaS', role: 'Outbound API call wrapped with Circuit Breaker' },
          { id: 'otel', title: 'OpenTelemetry', role: 'W3C traceparent export to Prometheus & Grafana' }
        ],
        connections: [
          { from: 'client', to: 'nginx' },
          { from: 'nginx', to: 'auth' },
          { from: 'auth', to: 'backend' },
          { from: 'backend', to: 'cache' },
          { from: 'backend', to: 'db' },
          { from: 'backend', to: 'queue' },
          { from: 'queue', to: 'worker' },
          { from: 'worker', to: 'saas' },
          { from: 'backend', to: 'otel' }
        ]
      };
    }

    const repo = this._presets[repoId] || this._presets['tp-backend-ecosystem'];
    const cat = (repo.category || 'ai').toLowerCase();

    if (cat === 'ai') {
      return {
        nodes: [
          { id: 'prompt', title: 'Client / Agent Prompt', role: 'Emits context payload with API key' },
          { id: 'gateway', title: 'API Router & Rate Limiter', role: 'Token bucket pacing & model dispatch' },
          { id: 'guardrail', title: 'Prompt & Safety Shield', role: 'Blocks prompt injections & jailbreak probes' },
          { id: 'retrieval', title: 'Vector & RAG Index', role: 'Dense semantic lookup & BM25 hybrid ranking' },
          { id: 'inference', title: repo.title, role: 'Executes core model inference & generation loop' },
          { id: 'telemetry', title: 'Observability & Evaluation', role: 'Captures token latency, cost, and output quality' }
        ],
        connections: [
          { from: 'prompt', to: 'gateway' },
          { from: 'gateway', to: 'guardrail' },
          { from: 'guardrail', to: 'retrieval' },
          { from: 'retrieval', to: 'inference' },
          { from: 'inference', to: 'telemetry' }
        ]
      };
    }

    if (cat === 'cloud') {
      return {
        nodes: [
          { id: 'spec', title: 'IaC Infrastructure Spec', role: 'Terraform / Pulumi / YAML architecture definitions' },
          { id: 'linter', title: 'Policy-as-Code Linter', role: 'Enforces CIS benchmarks & FinOps budget limits' },
          { id: 'iam', title: 'Cloud IAM & VPC Enclave', role: 'Least-privilege roles, security groups, & NAT gateways' },
          { id: 'cluster', title: repo.title, role: 'Deploys managed clusters, nodes, and networking' },
          { id: 'ingress', title: 'Ingress & DNS Controller', role: 'Public TLS termination, Route53, & Cert-Manager' },
          { id: 'telemetry', title: 'CloudWatch / Grafana', role: 'Real-time telemetry, audit trails, and billing alerts' }
        ],
        connections: [
          { from: 'spec', to: 'linter' },
          { from: 'linter', to: 'iam' },
          { from: 'iam', to: 'cluster' },
          { from: 'cluster', to: 'ingress' },
          { from: 'ingress', to: 'telemetry' }
        ]
      };
    }

    if (cat === 'observability') {
      return {
        nodes: [
          { id: 'source', title: 'Workload Microservice', role: 'Target production pods emitting logs and traces' },
          { id: 'probe', title: 'Kernel / eBPF Probe', role: 'Zero-overhead socket tracing and syscall capture' },
          { id: 'collector', title: 'OpenTelemetry Collector', role: 'Batches, filters, and standardizes W3C telemetry' },
          { id: 'tsdb', title: repo.title, role: 'Stores Prometheus metrics, Tempo traces, and Loki logs' },
          { id: 'alerts', title: 'Alertmanager Engine', role: 'Deduplicates alerts, evaluates SLOs, and pages SRE' },
          { id: 'dashboard', title: 'Grafana SRE Dashboard', role: 'Visualizes golden signals (latency, traffic, errors)' }
        ],
        connections: [
          { from: 'source', to: 'probe' },
          { from: 'probe', to: 'collector' },
          { from: 'collector', to: 'tsdb' },
          { from: 'tsdb', to: 'alerts' },
          { from: 'alerts', to: 'dashboard' }
        ]
      };
    }

    if (cat === 'cicd') {
      return {
        nodes: [
          { id: 'commit', title: 'Git Push (PR Branch)', role: 'Developer commits code changes and pushes upstream' },
          { id: 'scanner', title: 'SAST & Secret Scanner', role: 'Trivy, Semgrep, and Gitleaks pre-flight gates' },
          { id: 'builder', title: 'Container Build Pipeline', role: 'Multi-stage Docker build to Distroless image' },
          { id: 'attest', title: repo.title, role: 'Generates CycloneDX SBOM and signs with Sigstore Cosign' },
          { id: 'admission', title: 'Kyverno Admission Webhook', role: 'Rejects unsigned images from scheduling' },
          { id: 'gitops', title: 'ArgoCD Deployment', role: 'Reconciles Git desired state with live cluster' }
        ],
        connections: [
          { from: 'commit', to: 'scanner' },
          { from: 'scanner', to: 'builder' },
          { from: 'builder', to: 'attest' },
          { from: 'attest', to: 'admission' },
          { from: 'admission', to: 'gitops' }
        ]
      };
    }

    // Default automation DAG
    return {
      nodes: [
        { id: 'trigger', title: 'Event / Schedule Trigger', role: 'Cron, webhook, or outage anomaly triggers workflow' },
        { id: 'eval', title: 'Rule & Policy Evaluator', role: 'Evaluates parameters against cluster constraints' },
        { id: 'worker', title: repo.title, role: 'Executes automated task, script, or playbook' },
        { id: 'enforce', title: 'Target State Enforcer', role: 'Remediates drift, scales pods, or patches config' },
        { id: 'audit', title: 'Audit Log & Notification', role: 'Publishes execution audit trail to Slack / PagerDuty' }
      ],
      connections: [
        { from: 'trigger', to: 'eval' },
        { from: 'eval', to: 'worker' },
        { from: 'worker', to: 'enforce' },
        { from: 'enforce', to: 'audit' }
      ]
    };
  }

  courseModules(repoId = 'tp-backend-ecosystem') {
    if (repoId === 'tp-backend-ecosystem') {
      return [
        {
          id: 'mod-1',
          level: 'beginner',
          title: 'Lesson 1: Anatomy of Request Flow & Idempotency',
          objectives: 'Understand why client requests require idempotency tokens and trace packet journey from NGINX to FastAPI.',
          concept: 'In distributed systems, networks drop packets. When a user clicks "Pay", their browser generates a UUID idempotency key. Redis checks if the UUID already exists; if not, it locks for 15 minutes to prevent double-charging.',
          relevantFiles: [
            'projects/ecommerce-order-engine/main.py',
            'nginx.conf',
            'docker-compose.yml'
          ],
          traceSteps: [
            'Client sends POST /api/v1/orders with header Idempotency-Key: idemp_9921',
            'NGINX inspects token bucket and proxies to FastAPI on port 8000',
            'FastAPI queries Redis: GET idemp:idemp_9921 (Cache Miss)',
            'FastAPI executes atomic DB transaction and offloads payment to Celery',
            'FastAPI writes Redis: SET idemp:idemp_9921 "ord_100" EX 900 and returns HTTP 201'
          ],
          walkthrough: `// Look at main.py lines 34-48:
if order.idempotency_key in MEMORY_CACHE:
    return MEMORY_CACHE[order.idempotency_key]
// Notice how returning the cached order immediately stops duplicate execution!`,
          exercise: 'Add an inventory check preventing users from ordering more than 10 units of "laptop-pro-m3" at once.',
          troubleshootingTips: 'Ensure you return HTTP 400 Bad Request with a clear error payload if quantity exceeds 10.',
          quiz: {
            question: 'Why should idempotency keys have a Time-To-Live (TTL) in Redis rather than remaining forever?',
            options: [
              'To free up Redis memory and allow valid future transactions after network retries expire.',
              'Because Redis automatically deletes keys older than 1 minute.',
              'To force PostgreSQL to drop the customer table.'
            ],
            correct: 0,
            explanation: 'Setting a 15-minute TTL allows retry deduplication during transient outages while preventing infinite memory growth in Redis.'
          },
          solutionDiff: `--- a/projects/ecommerce-order-engine/main.py
+++ b/projects/ecommerce-order-engine/main.py
@@ -32,2 +32,4 @@
     for item in order.items:
+        if item.quantity > 10:
+            raise HTTPException(status_code=400, detail="Maximum purchase limit is 10 units per order")
         stock_key = f"stock:{item.product_id}"`,
          nextLesson: 'Lesson 2: Asynchronous Queues & Celery Background Workers'
        },
        {
          id: 'mod-2',
          level: 'intermediate',
          title: 'Lesson 2: Decoupling Microservices with Celery & RabbitMQ',
          objectives: 'Master asynchronous task queues, durable message publishing, and non-blocking HTTP request handlers.',
          concept: 'Calling external third-party APIs (Stripe, Twilio) directly inside an HTTP request thread causes 200–500ms latency spikes and freezes under load. By pushing a job message to RabbitMQ, the API returns in <20ms while Celery workers process the payment in the background.',
          relevantFiles: [
            'projects/ecommerce-order-engine/worker.py',
            'projects/ecommerce-order-engine/main.py'
          ],
          traceSteps: [
            'FastAPI validates order and commits SQL transaction',
            'FastAPI calls celery_app.send_task("tasks.process_payment", queue="payments")',
            'RabbitMQ receives persistent message into durable exchange',
            'FastAPI immediately returns HTTP 201 Created to caller with task_id',
            'Celery worker daemon polls RabbitMQ, executes Stripe call, and writes invoice'
          ],
          walkthrough: `// In worker.py:
def process_order_payment_and_fulfillment(order_id, user_id, amount):
    # Simulates asynchronous Stripe charge
    time.sleep(0.1)
    return {"status": "completed", "paid": True}`,
          exercise: 'Implement exponential backoff retry in the Celery worker task when an external network exception occurs.',
          troubleshootingTips: 'Use Celery’s autoretry_for=(Exception,) and retry_backoff=True to prevent stampeding the payment API.',
          quiz: {
            question: 'What happens if you do NOT use a message queue and an external payment gateway takes 30 seconds to respond?',
            options: [
              'All web server worker threads get exhausted, leading to HTTP 504 Gateway Timeouts for all incoming users.',
              'PostgreSQL automatically converts the call into an async thread.',
              'The client browser accelerates the connection.'
            ],
            correct: 0,
            explanation: 'Synchronous blocking calls tie up worker threads, exhausting thread pools and causing cascading gateway timeouts.'
          },
          solutionDiff: `--- a/projects/ecommerce-order-engine/worker.py
+++ b/projects/ecommerce-order-engine/worker.py
@@ -10,3 +10,4 @@
+@celery_app.task(bind=True, max_retries=3, retry_backoff=2, retry_jitter=True)
 def process_order_payment_and_fulfillment(self, order_id: str, user_id: str, amount: float):
     try:`,
          nextLesson: 'Lesson 3: The Transactional Outbox Pattern & Zero Data Loss'
        },
        {
          id: 'mod-3',
          level: 'advanced',
          title: 'Lesson 3: The Transactional Outbox Pattern & Zero Data Loss',
          objectives: 'Eliminate dual-write inconsistencies between relational databases and message brokers.',
          concept: 'Writing to a database and publishing to Kafka in two separate operations is vulnerable to split-brain failure. The Outbox pattern writes domain events into an outbox database table inside the exact same ACID transaction. A Debezium CDC worker reads the database WAL and streams events to Kafka with zero data loss.',
          relevantFiles: [
            'projects/saas-billing-dispatcher/main.go',
            'docker-compose.yml'
          ],
          traceSteps: [
            'Incoming webhook event received in Go Gin controller',
            'BEGIN local database transaction',
            'INSERT INTO billing_invoices (...)',
            'INSERT INTO outbox_events (id, aggregate_id, payload, created_at)',
            'COMMIT transaction (Atomicity guaranteed)',
            'Background CDC worker reads outbox table and streams to Kafka'
          ],
          walkthrough: `// In main.go:
tx := db.Begin()
tx.Create(&invoice)
tx.Create(&outboxEvent)
tx.Commit() // Atomically guaranteed!`,
          exercise: 'Write a consumer query ensuring that already processed event UUIDs are deduplicated idempotently.',
          troubleshootingTips: 'Use an ON CONFLICT (event_id) DO NOTHING clause in PostgreSQL.',
          quiz: {
            question: 'What failure scenario does the Transactional Outbox pattern solve?',
            options: [
              'Database write succeeds but message broker publish fails, causing data inconsistency across microservices.',
              'Docker daemon runs out of memory.',
              'Redis server latency drops below 1ms.'
            ],
            correct: 0,
            explanation: 'The Outbox pattern prevents dual-write failures by ensuring database changes and message events are committed in a single ACID transaction.'
          },
          solutionDiff: `--- a/projects/saas-billing-dispatcher/main.go
+++ b/projects/saas-billing-dispatcher/main.go
@@ -40,3 +40,5 @@
+	if err := tx.Exec("INSERT INTO processed_events (event_id) VALUES (?) ON CONFLICT DO NOTHING", eventID).Error; err != nil {
+		return err
+	}`,
          nextLesson: 'Congratulations! You have completed the Enterprise Backend Core Curriculum.'
        }
      ];
    }

    const repo = this._presets[repoId] || this._presets['tp-backend-ecosystem'];
    const primaryFile = (repo.entrypoints && repo.entrypoints[0]) || 'main.py';

    return [
      {
        id: 'mod-1',
        level: 'beginner',
        title: `Lesson 1: Architecture & Request Execution in ${repo.title}`,
        objectives: `Understand the architectural foundation and execution lifecycle of ${repo.id}.`,
        concept: repo.desc || 'Modular production service engineered for high availability and zero-overhead execution.',
        relevantFiles: [primaryFile, 'README.md', 'Dockerfile'],
        traceSteps: [
          `Client initializes connection to ${repo.id} service`,
          'Request validates authentication tokens and header parameters',
          `Core logic compiles execution plan against ${primaryFile}`,
          'Emits structured response and records telemetry'
        ],
        walkthrough: `// Inspect ${primaryFile}:
// Notice how the entrypoint coordinates runtime dependencies and configuration state.`,
        exercise: `Configure environment variables and parameters for ${repo.id} to run in isolated dev mode.`,
        troubleshootingTips: 'Verify port bindings and local environment variables match expected defaults.',
        quiz: {
          question: `What is the primary role of the ${repo.id} repository in the ecosystem?`,
          options: [
            repo.desc.slice(0, 100),
            'To store temporary cache files only.',
            'To replace the DNS root servers.'
          ],
          correct: 0,
          explanation: `${repo.title} delivers specialized engineering functionality as part of the 341 repository catalog.`
        },
        solutionDiff: `--- a/${primaryFile}
+++ b/${primaryFile}
@@ -1,2 +1,3 @@
+# Configured for production resilience
+ENV_MODE = "production"`,
        nextLesson: 'Lesson 2: Configuration, Parameters & Resilience'
      },
      {
        id: 'mod-2',
        level: 'intermediate',
        title: `Lesson 2: Configuration, Parameters & Resilience in ${repo.id}`,
        objectives: 'Configure stack parameters and handle edge-case failure modes.',
        concept: 'Production workloads must handle transient failures, retries, and network partitions gracefully.',
        relevantFiles: [primaryFile, 'config.yaml'],
        traceSteps: [
          'Load runtime parameters from environment and config files',
          'Validate input parameters against schema',
          'Execute workload with active error handling',
          'Return structured result or fallback state'
        ],
        walkthrough: '// Implement retry logic and fallback mechanisms to ensure high availability.',
        exercise: 'Add input parameter validation and structured logging.',
        troubleshootingTips: 'Inspect logs to ensure exceptions are caught and reported cleanly.',
        quiz: {
          question: 'Why should services implement graceful fallbacks?',
          options: [
            'To prevent cascading outages across downstream dependent services.',
            'To speed up CPU clock speed.',
            'Because memory is infinite.'
          ],
          correct: 0,
          explanation: 'Graceful fallbacks isolate failures and preserve system availability.'
        },
        solutionDiff: `--- a/config.yaml
+++ b/config.yaml
@@ -1,2 +1,4 @@
+retry_attempts: 3
+timeout_seconds: 10`,
        nextLesson: 'Lesson 3: Production Hardening, CI/CD & SRE Observability'
      },
      {
        id: 'mod-3',
        level: 'advanced',
        title: `Lesson 3: Production Hardening, CI/CD & SRE Observability for ${repo.id}`,
        objectives: 'Deploy with automated CI/CD checks, security scanning, and SRE metric monitoring.',
        concept: 'Automate deployment pipelines and monitor golden signals (latency, errors, saturation).',
        relevantFiles: ['.github/workflows/ci.yml', 'Dockerfile'],
        traceSteps: [
          'Run automated unit and integration tests on pull request',
          'Execute security scanning and vulnerability analysis',
          'Package minimal container image with non-root user',
          'Export metrics to Prometheus and Grafana dashboards'
        ],
        walkthrough: '// Ensure your CI/CD pipeline enforces passing tests before merging to main.',
        exercise: 'Define health check probes and monitoring metric exporters.',
        troubleshootingTips: 'Ensure health check endpoints respond within 2 seconds.',
        quiz: {
          question: 'What is the purpose of running automated CI/CD checks on every commit?',
          options: [
            'To catch regressions and security vulnerabilities before code reaches production.',
            'To delete older Git branches.',
            'To reduce internet bandwidth.'
          ],
          correct: 0,
          explanation: 'Continuous Integration validates code quality, security, and correctness before deployment.'
        },
        solutionDiff: `--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -1,2 +1,4 @@
+name: CI
+on: [push, pull_request]`,
        nextLesson: `Congratulations! You have completed the course for ${repo.title}.`
      }
    ];
  }

  generateDevSetupScript(repoId = 'tp-backend-ecosystem') {
    const repo = this._presets[repoId] || this._presets['tp-backend-ecosystem'];
    const repoSlug = repo.id;
    const repoFull = repo.repo || `Pradeeptalari14/${repoSlug}`;

    return `#!/usr/bin/env bash
# ==============================================================================
# One-Click Development Setup for ${repo.title}
# Repository: https://github.com/${repoFull}
# ==============================================================================
set -e

echo "🚀 [1/5] Cloning repository ${repoFull}..."
if [ ! -d "${repoSlug}" ]; then
  git clone "https://github.com/${repoFull}.git" "${repoSlug}"
fi
cd "${repoSlug}"

echo "📦 [2/5] Inspecting environment and dependencies..."
if [ -f "requirements.txt" ]; then
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
elif [ -f "package.json" ]; then
  npm install
elif [ -f "go.mod" ]; then
  go mod download
fi

echo "🐳 [3/5] Starting containerized services..."
if [ -f "docker-compose.yml" ]; then
  docker compose up -d
fi

echo "🧪 [4/5] Running test validation suites..."
if [ -f "requirements.txt" ]; then
  python3 -m unittest discover -s tests -p "*.py" || true
elif [ -f "package.json" ]; then
  npm test || true
fi

echo "✨ [5/5] Development workspace ready! Happy coding."
`;
  }

  generateStacktraceAnalysis(trace = '') {
    if (trace.includes('OutOfMemory') || trace.includes('CUDA out of memory') || trace.includes('OOMKilled')) {
      return {
        failureType: 'CUDA / System Out of Memory (OOM)',
        rootCause: 'Batch size or KV-cache reservation exceeded physical GPU/RAM allocations.',
        solution: 'Enable DeepSpeed ZeRO-3 offloading, chunked prefill, or reduce max_num_seqs in inference config.',
        suggestedStudio: '/tools/vllm-paged-attention/'
      };
    }
    if (trace.includes('Deadlock') || trace.includes('Lock wait timeout')) {
      return {
        failureType: 'Distributed Lock / Database Contention',
        rootCause: 'Concurrent transactions acquired row locks in conflicting order without timeouts.',
        solution: 'Enforce deterministic alphabetical locking order and reduce transaction window.',
        suggestedStudio: '/tools/redis-cesc/'
      };
    }
    return {
      failureType: 'General Runtime Exception',
      rootCause: 'Service returned unexpected response code or unhandled exception during execution.',
      solution: 'Check service logs, verify environment variables, and inspect network firewall rules.',
      suggestedStudio: '/tools/incident/'
    };
  }

  developmentSetup(repoId = 'tp-backend-ecosystem') {
    return {
      prerequisites: ['Docker 24+', 'Python 3.11+', 'Node.js 20+'],
      envTemplate: 'DATABASE_URL=postgresql://user:pass@localhost:5432/app\nREDIS_URL=redis://localhost:6379\nSECRET_KEY=dev_secret_key',
      dockerCommand: 'docker-compose up -d',
      healthCheckCommand: 'curl http://localhost:8000/health'
    };
  }

  stackTraceDiagnosis(trace = '') {
    if (trace.includes('remaining connection slots are reserved')) {
      return {
        matchedFile: 'main.py',
        line: 42,
        category: 'PostgreSQL Connection Pool Exhaustion',
        suggestedStudio: 'db-clustering',
        remediation: 'Configure PgBouncer connection pooling and adjust max_connections.'
      };
    }
    return {
      matchedFile: 'main.py',
      line: 12,
      category: 'General Runtime Exception',
      suggestedStudio: 'incident',
      remediation: 'Inspect application logs.'
    };
  }

  generateBranchName(featureTitle = '') {
    const slug = featureTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `feat/${slug || 'feature-update'}`;
  }
}
