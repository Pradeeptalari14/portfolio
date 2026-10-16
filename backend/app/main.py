import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import studios, projects, rag, sandbox, ai

app = FastAPI(
    title="Talari Pradeep Studios Hub — Companion API",
    description="Enterprise AI upgrade backend providing pgvector persistent search, Docker sandboxes, and Ollama integration for all 341 engineering studios.",
    version="1.0.0"
)

# CORS configuration allowing custom domains and local development
allowed_origins = [
    "https://talaripradeep.info",
    "https://www.talaripradeep.info",
    "https://pradeeptalari.me",
    "https://www.pradeeptalari.me",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000"
]

extra_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
if extra_origins:
    for origin in extra_origins.split(","):
        origin_clean = origin.strip()
        if origin_clean and origin_clean not in allowed_origins:
            allowed_origins.append(origin_clean)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

@app.on_event("startup")
async def on_startup():
    # Automatically initialize tables in dev mode if PostgreSQL is active
    try:
        async with engine.begin() as conn:
            # Enable pgvector extension if available
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[Studios API] Note on database init: {e}")

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "platform": "Talari Pradeep Studios Hub",
        "studios_supported": 341,
        "database": "postgresql+pgvector",
        "cache": "valkey-8",
        "sandbox": "docker-isolated",
        "local_ai": "ollama",
        "version": "1.0.0"
    }

# Mount routers
app.include_router(studios.router)
app.include_router(projects.router)
app.include_router(rag.router)
app.include_router(sandbox.router)
app.include_router(ai.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
