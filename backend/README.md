# Talari Pradeep Studios Hub — Companion API & Shared Services

This backend is the optional, companion backend service that elevates the [Talari Pradeep Studios Hub](https://talaripradeep.info/studios/) into an enterprise-grade AI development workbench.

## Core Capabilities
1. **Persistent PostgreSQL with pgvector**:
   - Stores user projects, code files, and workspace state.
   - Vector embeddings of all 334 developer studios, production runbooks, and failure treatments.
   - Dynamic vector dimensions (supports 768-dim `nomic-embed-text` and 1536-dim `text-embedding-3-small`).
2. **Local AI & LLMOps with Ollama**:
   - Zero-cloud-cost local inference via models like `qwen2.5-coder:7b`, `llama3.2`, or `deepseek-r1`.
   - Streaming API generation for real-time coding assistance and agentic troubleshooting.
3. **Hardened Docker Sandboxes**:
   - Executes generated scripts in isolated containers.
   - Memory-capped (`512MB`), swap-isolated, PID-limited (`64`), network-isolated (`none`), read-only root filesystems with ephemeral tmpfs.
4. **Valkey 8 In-Memory Cache**:
   - High-throughput Redis-compatible caching licensed under BSD-3 for unencumbered commercial compliance.

---

## Quickstart

### 1. Run with Docker Compose (Recommended)
```bash
cd backend
docker compose up -d
```
Services started:
- `api`: FastAPI on `http://localhost:8000`
- `postgres`: PostgreSQL 16 + pgvector on `localhost:5432`
- `valkey`: Valkey 8 on `localhost:6379`
- `ollama`: Ollama on `localhost:11434`

### 2. Run Locally with Python Virtualenv
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## API Endpoints Overview
| Endpoint | Method | Description |
|---|---|---|
| `GET /health` | GET | Health status and database/docker engine checks |
| `GET /api/studios` | GET | List and filter 334 studios |
| `PATCH /api/studios/{id}` | PATCH | Update studio metadata & dynamic configurations |
| `POST /api/rag/query` | POST | pgvector cosine distance semantic search |
| `GET /api/projects` | GET | List user saved projects |
| `POST /api/projects` | POST | Upsert project files and state |
| `POST /api/sandbox/execute` | POST | Secure containerized code execution |
| `POST /api/ai/generate` | POST | Ollama local model inference |
