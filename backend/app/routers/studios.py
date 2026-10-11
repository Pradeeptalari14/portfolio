from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from ..database import get_db
from ..models import Studio
from ..schemas import StudioCreate, StudioUpdate, StudioResponse

router = APIRouter(prefix="/api/studios", tags=["Studios"])

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
    return result.scalars().all()

@router.get("/{studio_id}", response_model=StudioResponse)
async def get_studio(studio_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Studio).where(Studio.id == studio_id))
    studio = result.scalar_one_or_none()
    if not studio:
        raise HTTPException(status_code=404, detail="Studio not found")
    return studio

@router.post("", response_model=StudioResponse, status_code=201)
async def create_studio(payload: StudioCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Studio).where(Studio.id == payload.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Studio with this ID already exists")

    new_studio = Studio(**payload.dict())
    db.add(new_studio)
    await db.commit()
    await db.refresh(new_studio)
    return new_studio

@router.patch("/{studio_id}", response_model=StudioResponse)
async def update_studio(studio_id: str, payload: StudioUpdate, db: AsyncSession = Depends(get_db)):
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
