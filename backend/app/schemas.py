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
    id: Optional[str] = None
    studio_id: Optional[str] = "general"
    user_id: Optional[str] = "guest"
    title: Optional[str] = None
    name: Optional[str] = None
    files: Optional[Dict[str, str]] = Field(default_factory=dict)
    mode: Optional[str] = "build"
    completed_steps: Optional[List[str]] = Field(default_factory=list)

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    files: Optional[Dict[str, str]] = None
    mode: Optional[str] = None
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
