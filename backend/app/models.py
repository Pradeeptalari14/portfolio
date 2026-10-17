import os
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from .database import Base

EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "768"))  # 768 for nomic-embed-text / default Ollama

class Studio(Base):
    __tablename__ = "studios"

    id = Column(String(128), primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    category = Column(String(64), index=True, nullable=False)
    domain = Column(String(128), index=True)
    skill_level = Column(String(64), default="Level 2")
    tag = Column(String(128))
    desc = Column(Text)
    use_case = Column(Text)
    best_treatment = Column(Text)
    anti_pattern = Column(Text)
    real_time_drill = Column(Text)
    sre_metric = Column(String(256))
    repository = Column(String(256))
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    embeddings = relationship("StudioEmbedding", back_populates="studio", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="studio", cascade="all, delete-orphan")

class StudioEmbedding(Base):
    __tablename__ = "studio_embeddings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    studio_id = Column(String(128), ForeignKey("studios.id", ondelete="CASCADE"), index=True)
    chunk_type = Column(String(64), default="doc")  # doc, use_case, treatment, drill
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(EMBEDDING_DIM))
    created_at = Column(DateTime, default=datetime.utcnow)

    studio = relationship("Studio", back_populates="embeddings")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(128), primary_key=True, index=True)
    studio_id = Column(String(128), ForeignKey("studios.id", ondelete="CASCADE"), index=True)
    user_id = Column(String(128), index=True, default="guest")
    title = Column(String(256), nullable=False)
    files = Column(JSON, default=dict)  # {"main.py": "print('hello')", "config.yaml": "..."}
    mode = Column(String(64), default="build")  # learn, practise, build, advanced
    completed_steps = Column(JSON, default=list)  # ["learn", "configure"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    studio = relationship("Studio", back_populates="projects")

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    studio_id = Column(String(128), index=True)
    event_type = Column(String(64), index=True)  # drill_run, launch, step_complete
    payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class AgentMemory(Base):
    __tablename__ = "agent_memories"

    id = Column(String(64), primary_key=True, index=True)
    agent_id = Column(String(64), index=True, nullable=False)
    entity = Column(String(128), index=True, nullable=False)
    relation = Column(String(128), nullable=False)
    value = Column(Text, nullable=False)
    context = Column(Text)
    importance = Column(Integer, default=70)  # 0 to 100
    rehearsal_count = Column(Integer, default=1)
    last_accessed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIEvalRun(Base):
    __tablename__ = "ai_eval_runs"

    id = Column(String(64), primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    faithfulness_score = Column(Integer, default=100)
    relevance_score = Column(Integer, default=100)
    context_recall_score = Column(Integer, default=100)
    hallucination_index = Column(Integer, default=0)
    verdict = Column(String(32), default="PASSED")
    created_at = Column(DateTime, default=datetime.utcnow)

class GuardrailAuditLog(Base):
    __tablename__ = "guardrail_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), index=True, default="guest")
    prompt = Column(Text, nullable=False)
    blocked = Column(Integer, default=0)
    risk_score = Column(Integer, default=0)
    attack_class = Column(String(128))
    reasons = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

