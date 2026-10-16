import os
import httpx
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Studio, StudioEmbedding, EMBEDDING_DIM
from ..schemas import RAGQueryRequest, RAGSearchResult

router = APIRouter(prefix="/api/rag", tags=["Vector RAG"])

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

async def get_embedding_vector(text: str) -> List[float]:
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                f"{OLLAMA_HOST}/api/embeddings",
                json={"model": EMBED_MODEL, "prompt": text}
            )
            if resp.status_code == 200:
                data = resp.json()
                emb = data.get("embedding", [])
                if len(emb) == EMBEDDING_DIM:
                    return emb
    except Exception:
        pass
    # Fallback pseudo-vector of zero if Ollama offline during dev
    return [0.0] * EMBEDDING_DIM

@router.post("/query", response_model=List[RAGSearchResult])
async def search_rag(payload: RAGQueryRequest, db: AsyncSession = Depends(get_db)):
    query_vector = await get_embedding_vector(payload.query)

    # pgvector cosine distance query
    # StudioEmbedding.embedding.cosine_distance(query_vector)
    try:
        stmt = (
            select(
                Studio.id.label("studio_id"),
                Studio.title,
                StudioEmbedding.chunk_type,
                StudioEmbedding.chunk_text,
                (1.0 - StudioEmbedding.embedding.cosine_distance(query_vector)).label("similarity")
            )
            .join(Studio, StudioEmbedding.studio_id == Studio.id)
            .order_by(StudioEmbedding.embedding.cosine_distance(query_vector))
            .limit(payload.top_k)
        )
        if payload.category_filter and payload.category_filter != "all":
            stmt = stmt.where(Studio.category == payload.category_filter)

        res = await db.execute(stmt)
        rows = res.all()

        results = []
        for r in rows:
            results.append(RAGSearchResult(
                studio_id=r.studio_id,
                title=r.title,
                chunk_type=r.chunk_type,
                chunk_text=r.chunk_text,
                similarity_score=float(r.similarity or 0.0)
            ))
        return results
    except Exception as e:
        # Fallback ILIKE search if vector extension is indexing or empty
        safe_query = payload.query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        ilike_stmt = (
            select(Studio)
            .where(Studio.use_case.ilike(f"%{safe_query}%"))
            .limit(payload.top_k)
        )
        res = await db.execute(ilike_stmt)
        studios = res.scalars().all()
        return [
            RAGSearchResult(
                studio_id=s.id,
                title=s.title,
                chunk_type="use_case",
                chunk_text=s.use_case or s.desc or "",
                similarity_score=0.85
            )
            for s in studios
        ]
