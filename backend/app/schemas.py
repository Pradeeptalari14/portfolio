from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Studio Schemas
class StudioBase(BaseModel):
    id: str
    title: str
    category: str
    domain: Optional[str] = None
    skill_level: Optional[str] = "Level 2"
    tag: Optional[str] = None
    desc: Optional[str] = None
    use_case: Optional[str] = None
    best_treatment: Optional[str] = None
    anti_pattern: Optional[str] = None
    real_time_drill: Optional[str] = None
    sre_metric: Optional[str] = None
    repository: Optional[str] = None

class StudioCreate(StudioBase):
    pass

class StudioUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    domain: Optional[str] = None
    skill_level: Optional[str] = None
    desc: Optional[str] = None
    use_case: Optional[str] = None
    best_treatment: Optional[str] = None
    anti_pattern: Optional[str] = None
    real_time_drill: Optional[str] = None
    sre_metric: Optional[str] = None

class StudioResponse(StudioBase):
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Vector RAG Schemas
class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="Query string for semantic similarity search")
    top_k: int = Field(default=5, ge=1, le=50, description="Number of nearest-neighbor results (bounded 1-50)")
    category_filter: Optional[str] = Field(default=None, max_length=100)

class RAGSearchResult(BaseModel):
    studio_id: str
    title: str
    chunk_type: str
    chunk_text: str
    similarity_score: float

# Project Schemas
class ProjectCreate(BaseModel):
    id: Optional[str] = Field(default=None, max_length=64, pattern=r"^[a-zA-Z0-9_\-\.]+$")
    studio_id: Optional[str] = Field(default="general", max_length=128)
    user_id: Optional[str] = Field(default="guest", max_length=64)
    title: Optional[str] = Field(default=None, max_length=256)
    name: Optional[str] = Field(default=None, max_length=256)
    files: Optional[Dict[str, str]] = Field(default_factory=dict)
    mode: Optional[str] = Field(default="build", max_length=32)
    completed_steps: Optional[List[str]] = Field(default_factory=list)

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=256)
    files: Optional[Dict[str, str]] = None
    mode: Optional[str] = Field(default=None, max_length=32)
    completed_steps: Optional[List[str]] = None

class ProjectResponse(BaseModel):
    id: str
    studio_id: str
    user_id: str
    title: str
    files: Dict[str, str] = Field(default_factory=dict)
    mode: str = "build"
    completed_steps: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Sandbox Execution Schemas
class SandboxRunRequest(BaseModel):
    studio_id: Optional[str] = "general"
    language: str = "bash"  # bash, python, sh
    command: Optional[str] = Field(default=None, max_length=2048)
    files: Optional[Dict[str, str]] = None
    timeout_sec: int = Field(default=15, ge=1, le=30)

class SandboxRunResponse(BaseModel):
    success: bool
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: float

# Ollama / AI Schemas
class AICompletionRequest(BaseModel):
    model: str = Field(default="qwen2.5-coder:7b", max_length=128)
    prompt: str = Field(..., min_length=1, max_length=16384, description="Prompt payload bounded to 16KB")
    system_prompt: Optional[str] = Field(default=None, max_length=4096)
    temperature: float = Field(default=0.2, ge=0.0, le=2.0)
    stream: bool = False

# 1. AI Guardrails & Prompt Injection Defense Schemas
class PromptGuardrailRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=8192)
    user_id: Optional[str] = Field(default="guest", max_length=64)
    enforcement_tier: Optional[str] = Field(default="strict", max_length=32)

class PromptGuardrailResponse(BaseModel):
    blocked: bool
    risk_score: float  # 0.0 to 1.0
    detected_attack_class: Optional[str] = None
    sanitized_prompt: str
    reasons: List[str] = Field(default_factory=list)
    latency_ms: float

# 2. Agent Working & Persistent Memory Schemas
class AgentMemoryStoreRequest(BaseModel):
    agent_id: str = Field(..., max_length=64)
    entity: str = Field(..., max_length=128)
    relation: str = Field(..., max_length=128)
    value: str = Field(..., max_length=1024)
    context: Optional[str] = Field(default=None, max_length=2048)
    importance: float = Field(default=0.7, ge=0.0, le=1.0)

class AgentMemoryFactResponse(BaseModel):
    fact_id: str
    agent_id: str
    entity: str
    relation: str
    value: str
    retention_score: float
    rehearsal_count: int
    created_at: datetime
    last_accessed_at: datetime

class AgentMemoryQueryRequest(BaseModel):
    agent_id: str = Field(..., max_length=64)
    query: str = Field(..., max_length=512)
    top_k: int = Field(default=5, ge=1, le=20)
    min_retention: float = Field(default=0.1, ge=0.0, le=1.0)

class AgentMemoryRecallResponse(BaseModel):
    agent_id: str
    facts: List[AgentMemoryFactResponse]
    graph_context: str
    total_recalled: int

# 3. Agent Evaluation & Regression Testing Schemas
class AgentEvalRequest(BaseModel):
    question: str = Field(..., max_length=1000)
    answer: str = Field(..., max_length=4000)
    contexts: List[str] = Field(default_factory=list)
    ground_truth: Optional[str] = Field(default=None, max_length=4000)

class AgentEvalResponse(BaseModel):
    faithfulness_score: float      # 0.0 to 1.0
    answer_relevance_score: float  # 0.0 to 1.0
    context_recall_score: float    # 0.0 to 1.0
    hallucination_index: float     # 0.0 to 1.0
    verdict: str                   # PASSED / FLAGGED / FAILED
    evaluation_ms: float

# 4. Model Inference & KV-Cache Profiling Schemas
class InferenceProfileRequest(BaseModel):
    model_name: str = Field(default="Llama-3.3-70B", max_length=64)
    model_params_b: float = Field(default=70.0, ge=0.5, le=1000.0)
    context_window: int = Field(default=8192, ge=512, le=2000000)
    gpu_type: str = Field(default="H100-SXM-80GB", max_length=64)
    gpu_count: int = Field(default=4, ge=1, le=128)
    kv_precision: str = Field(default="FP16", max_length=16)  # FP16, FP8, INT4
    batch_size: int = Field(default=16, ge=1, le=1024)
    speculative_draft_model: Optional[str] = Field(default=None, max_length=64)

class InferenceProfileResponse(BaseModel):
    model_weights_vram_gb: float
    kv_cache_per_token_bytes: float
    kv_cache_total_vram_gb: float
    total_vram_required_gb: float
    total_available_vram_gb: float
    max_concurrency_capacity: int
    memory_headroom_gb: float
    estimated_ttft_ms: float
    estimated_itl_ms: float
    speculative_speedup_ratio: Optional[float] = None
    paged_attention_efficiency_pct: float

# 5. MCP & Agent-to-Agent (A2A) Interoperability Schemas
class A2AMessageRequest(BaseModel):
    source_agent_id: str = Field(..., max_length=64)
    target_agent_id: str = Field(..., max_length=64)
    protocol: str = Field(default="mcp-2024-11-05", max_length=32)
    action: str = Field(..., max_length=64)
    payload: Dict[str, Any] = Field(default_factory=dict)

class A2AMessageResponse(BaseModel):
    message_id: str
    status: str  # routed, delivered, error
    target_agent_id: str
    response_payload: Dict[str, Any]
    latency_ms: float

# 6. Hybrid RAG Schemas
class HybridRAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(default=5, ge=1, le=50)
    alpha: float = Field(default=0.6, ge=0.0, le=1.0)  # Dense vs Sparse weight
    category_filter: Optional[str] = Field(default=None, max_length=100)

class HybridRAGSearchResult(BaseModel):
    studio_id: str
    title: str
    chunk_type: str
    chunk_text: str
    dense_score: float
    sparse_score: float
    rrf_score: float

