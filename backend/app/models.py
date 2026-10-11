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
