from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Project
from ..schemas import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
async def list_projects(user_id: str = "guest", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.user_id == user_id))
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

import uuid

@router.post("", response_model=ProjectResponse, status_code=201)
async def create_or_upsert_project(payload: ProjectCreate, db: AsyncSession = Depends(get_db)):
    proj_id = payload.id or f"proj_{uuid.uuid4().hex[:8]}"
    proj_title = payload.title or payload.name or "Untitled Workspace"
    proj_studio = payload.studio_id or "general"

    result = await db.execute(select(Project).where(Project.id == proj_id))
    existing = result.scalar_one_or_none()

    if existing:
        update_data = payload.dict(exclude_unset=True)
        update_data.pop("name", None)
        update_data["title"] = proj_title
        for field, val in update_data.items():
            if hasattr(existing, field):
                setattr(existing, field, val)
        await db.commit()
        await db.refresh(existing)
        return existing

    create_data = payload.dict()
    create_data.pop("name", None)
    create_data["id"] = proj_id
    create_data["title"] = proj_title
    create_data["studio_id"] = proj_studio

    new_project = Project(**create_data)
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, payload: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(project, field, val)

    await db.commit()
    await db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project:
        await db.delete(project)
        await db.commit()
    return None
