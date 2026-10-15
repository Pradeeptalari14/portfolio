import os
from typing import List, Optional
from datetime import datetime
from pathlib import Path
import json
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from ..database import get_db
from ..models import Studio
from ..schemas import StudioCreate, StudioUpdate, StudioResponse

router = APIRouter(prefix="/api/studios", tags=["Studios"])

def verify_admin_key(
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    authorization: Optional[str] = Header(None)
):
    admin_key = os.getenv("ADMIN_API_KEY")
    if not admin_key:
        if os.getenv("ENVIRONMENT") == "production":
            raise HTTPException(status_code=403, detail="Modifications disabled in production without configured ADMIN_API_KEY")
        return True
    token = x_admin_key
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
    if token != admin_key:
        raise HTTPException(status_code=401, detail="Unauthorized: invalid or missing X-Admin-Key")
    return True

def _get_tools_catalog():
    tools_path = Path(__file__).resolve().parents[3] / "tools" / "tools.json"
    if not tools_path.exists():
        tools_path = Path("tools/tools.json")
    if tools_path.exists():
        try:
            with open(tools_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

@router.get("", response_model=List[StudioResponse])
async def list_studios(
    category: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(500, le=1000),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    query = select(Studio)
    if category and category != "all":
        query = query.where(Studio.category == category)
    if q:
        search_pattern = f"%{q}%"
        query = query.where(
            or_(
                Studio.title.ilike(search_pattern),
                Studio.desc.ilike(search_pattern),
                Studio.use_case.ilike(search_pattern),
                Studio.domain.ilike(search_pattern)
            )
        )
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    studios = result.scalars().all()
    if studios:
        return studios

    # Fallback to tools.json for all 341 studios if database is unseeded
    tools_data = _get_tools_catalog()
    now = datetime.utcnow()
    fallback_studios = []
    for item in tools_data:
        sid = item.get("id") or item.get("link", "").strip("/").split("/")[-1]
        cat = item.get("category", "ai")
        if category and category != "all" and cat.lower() != category.lower():
            continue
        if q:
            search_pat = q.lower()
            if not (search_pat in (item.get("title") or "").lower() or search_pat in (item.get("desc") or "").lower()):
                continue
        fallback_studios.append(StudioResponse(
            id=sid,
            title=item.get("title", sid),
            category=cat,
            domain=item.get("domain", "Platform Engineering"),
            skill_level=item.get("skill_level", "Level 2"),
            tag=item.get("tag", "config.yaml"),
            desc=item.get("desc", ""),
            use_case=item.get("use_case", ""),
            best_treatment=item.get("best_treatment", ""),
            anti_pattern=item.get("anti_pattern", ""),
            real_time_drill=item.get("real_time_drill", ""),
            sre_metric=item.get("sre_metric", "Availability: 99.99%"),
            repository=item.get("repository") or f"Pradeeptalari14/tp-{sid}",
            version=1,
            created_at=now,
            updated_at=now
        ))
    return fallback_studios[offset:offset+limit]

@router.get("/{studio_id}", response_model=StudioResponse)
async def get_studio(studio_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Studio).where(Studio.id == studio_id))
    studio = result.scalar_one_or_none()
    if studio:
        return studio

    # Fallback lookup in tools.json
    tools_data = _get_tools_catalog()
    for item in tools_data:
        sid = item.get("id") or item.get("link", "").strip("/").split("/")[-1]
        if sid == studio_id:
            now = datetime.utcnow()
            return StudioResponse(
                id=sid,
                title=item.get("title", sid),
                category=item.get("category", "ai"),
                domain=item.get("domain", "Platform Engineering"),
                skill_level=item.get("skill_level", "Level 2"),
                tag=item.get("tag", "config.yaml"),
                desc=item.get("desc", ""),
                use_case=item.get("use_case", ""),
                best_treatment=item.get("best_treatment", ""),
                anti_pattern=item.get("anti_pattern", ""),
                real_time_drill=item.get("real_time_drill", ""),
                sre_metric=item.get("sre_metric", "Availability: 99.99%"),
                repository=item.get("repository") or f"Pradeeptalari14/tp-{sid}",
                version=1,
                created_at=now,
                updated_at=now
            )

    raise HTTPException(status_code=404, detail="Studio not found")

@router.post("", response_model=StudioResponse, status_code=201)
async def create_studio(
    payload: StudioCreate,
    db: AsyncSession = Depends(get_db),
    _admin: bool = Depends(verify_admin_key)
):
    existing = await db.execute(select(Studio).where(Studio.id == payload.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Studio with this ID already exists")

    new_studio = Studio(**payload.dict())
    db.add(new_studio)
    await db.commit()
    await db.refresh(new_studio)
    return new_studio

@router.patch("/{studio_id}", response_model=StudioResponse)
async def update_studio(
    studio_id: str,
    payload: StudioUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: bool = Depends(verify_admin_key)
):
    result = await db.execute(select(Studio).where(Studio.id == studio_id))
    studio = result.scalar_one_or_none()
    if not studio:
        raise HTTPException(status_code=404, detail="Studio not found")

    update_data = payload.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(studio, field, val)

    studio.version += 1
    await db.commit()
    await db.refresh(studio)
    return studio
