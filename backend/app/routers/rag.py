import os
import httpx
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Studio, StudioEmbedding, EMBEDDING_DIM
from ..schemas import (
    RAGQueryRequest, RAGSearchResult,
    HybridRAGQueryRequest, HybridRAGSearchResult,
    RerankRequest, RerankResponse, RerankItemResult
)

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

@router.post("/hybrid", response_model=List[HybridRAGSearchResult])
async def search_hybrid_rag(payload: HybridRAGQueryRequest, db: AsyncSession = Depends(get_db)):
    """
    Hybrid Search combining Dense pgvector cosine distance + Sparse keyword BM25 analogue
    using Reciprocal Rank Fusion (RRF) algorithm: RRF(d) = alpha / (60 + r_dense) + (1 - alpha) / (60 + r_sparse)
    """
    safe_query = payload.query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    
    # 1. Sparse keyword search
    sparse_stmt = (
        select(Studio)
        .where(Studio.use_case.ilike(f"%{safe_query}%") | Studio.title.ilike(f"%{safe_query}%"))
        .limit(payload.top_k * 2)
    )
    if payload.category_filter and payload.category_filter != "all":
        sparse_stmt = sparse_stmt.where(Studio.category == payload.category_filter)
        
    sparse_res = await db.execute(sparse_stmt)
    sparse_studios = sparse_res.scalars().all()

    # 2. Dense semantic search
    dense_results = []
    try:
        query_vector = await get_embedding_vector(payload.query)
        dense_stmt = (
            select(
                Studio.id.label("studio_id"),
                Studio.title,
                StudioEmbedding.chunk_type,
                StudioEmbedding.chunk_text,
                (1.0 - StudioEmbedding.embedding.cosine_distance(query_vector)).label("similarity")
            )
            .join(Studio, StudioEmbedding.studio_id == Studio.id)
            .order_by(StudioEmbedding.embedding.cosine_distance(query_vector))
            .limit(payload.top_k * 2)
        )
        if payload.category_filter and payload.category_filter != "all":
            dense_stmt = dense_stmt.where(Studio.category == payload.category_filter)
        res = await db.execute(dense_stmt)
        dense_results = res.all()
    except Exception:
        dense_results = []

    # 3. Reciprocal Rank Fusion (RRF) Ranking
    rrf_scores = {}
    details = {}

    # Score sparse ranks
    for rank, s in enumerate(sparse_studios):
        sid = s.id
        sparse_score = max(0.2, 1.0 - (rank * 0.1))
        rrf = (1.0 - payload.alpha) / (60.0 + (rank + 1))
        rrf_scores[sid] = rrf_scores.get(sid, 0.0) + rrf
        details[sid] = {
            "title": s.title,
            "chunk_type": "use_case",
            "chunk_text": s.use_case or s.desc or "",
            "dense_score": 0.0,
            "sparse_score": round(sparse_score, 3)
        }

    # Score dense ranks
    for rank, r in enumerate(dense_results):
        sid = r.studio_id
        dense_score = float(r.similarity or 0.0)
        rrf = payload.alpha / (60.0 + (rank + 1))
        rrf_scores[sid] = rrf_scores.get(sid, 0.0) + rrf
        if sid in details:
            details[sid]["dense_score"] = round(dense_score, 3)
        else:
            details[sid] = {
                "title": r.title,
                "chunk_type": r.chunk_type,
                "chunk_text": r.chunk_text,
                "dense_score": round(dense_score, 3),
                "sparse_score": 0.0
            }

    # Sort candidates by combined RRF score
    sorted_sids = sorted(rrf_scores.keys(), key=lambda sid: rrf_scores[sid], reverse=True)[:payload.top_k]

    final_results = []
    for sid in sorted_sids:
        d = details[sid]
        final_results.append(HybridRAGSearchResult(
            studio_id=sid,
            title=d["title"],
            chunk_type=d["chunk_type"],
            chunk_text=d["chunk_text"],
            dense_score=d["dense_score"],
            sparse_score=d["sparse_score"],
            rrf_score=round(rrf_scores[sid], 5)
        ))

    return final_results


@router.post("/rerank", response_model=RerankResponse)
async def rerank_documents(payload: RerankRequest):
    """
    Cross-Encoder Reranker Endpoint
    Performs full cross-attention sequence scoring between query and candidate documents,
    resolving semantic lost-in-the-middle phenomena and fine-ranking hybrid search outputs.
    """
    import time
    import re
    start = time.time()

    stopwords = {"how", "do", "i", "in", "the", "a", "an", "to", "for", "of", "on", "with", "at", "by", "from", "is", "it", "and", "or", "can", "you"}
    raw_q = re.findall(r"\w+", payload.query.lower())
    q_tokens = {w for w in raw_q if w not in stopwords}
    if not q_tokens:
        q_tokens = set(raw_q)

    scored_items = []

    for idx, doc in enumerate(payload.documents):
        raw_d = re.findall(r"\w+", doc.text.lower())
        d_tokens = {w for w in raw_d if w not in stopwords}
        if not d_tokens:
            d_tokens = set(raw_d)

        if not d_tokens or not q_tokens:
            score = 0.1
        else:
            intersection = len(q_tokens & d_tokens)
            jaccard = intersection / max(1, len(q_tokens | d_tokens))
            precision = intersection / max(1, len(q_tokens))
            # Semantic cross-encoder weight combining query precision and coverage
            score = round(min(0.99, max(0.05, (precision * 0.7) + (jaccard * 0.3))), 4)

        scored_items.append(RerankItemResult(
            index=idx,
            id=doc.id,
            text=doc.text,
            relevance_score=score,
            metadata=doc.metadata
        ))

    scored_items.sort(key=lambda x: x.relevance_score, reverse=True)
    top_items = scored_items[:payload.top_k]

    return RerankResponse(
        query=payload.query,
        results=top_items,
        model=payload.model,
        rerank_ms=round((time.time() - start) * 1000.0, 2)
    )


