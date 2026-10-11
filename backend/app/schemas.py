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
    query: str
    top_k: int = 5
    category_filter: Optional[str] = None

class RAGSearchResult(BaseModel):
    studio_id: str
    title: str
    chunk_type: str
    chunk_text: str
    similarity_score: float

# Project Schemas
class ProjectCreate(BaseModel):
    id: str
    studio_id: str
    user_id: Optional[str] = "guest"
    title: str
    files: Optional[Dict[str, str]] = Field(default_factory=dict)
    mode: Optional[str] = "build"
    completed_steps: Optional[List[str]] = Field(default_factory=list)

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    files: Optional[Dict[str, str]] = None
    mode: Optional[str] = None
    completed_steps: Optional[List[str]] = None

class ProjectResponse(ProjectCreate):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Sandbox Execution Schemas
class SandboxRunRequest(BaseModel):
    studio_id: str
    language: str = "bash"  # bash, python, sh
    command: Optional[str] = None
    files: Optional[Dict[str, str]] = None
    timeout_sec: int = 15

class SandboxRunResponse(BaseModel):
    success: bool
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: float

# Ollama / AI Schemas
class AICompletionRequest(BaseModel):
    model: str = "qwen2.5-coder:7b"
    prompt: str
    system_prompt: Optional[str] = None
    temperature: float = 0.2
    stream: bool = False
