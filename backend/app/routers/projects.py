from typing import List
from datetime import datetime
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
    projects = result.scalars().all()
    if projects:
        return projects

    # Fallback / Default: return project workspaces for all 341 repositories
    tools_path = Path(__file__).resolve().parents[3] / "tools" / "tools.json"
    if not tools_path.exists():
        tools_path = Path("tools/tools.json")

    default_projects = []
    if tools_path.exists():
        try:
            with open(tools_path, "r", encoding="utf-8") as f:
                tools_data = json.load(f)
            now = datetime.utcnow()
            for item in tools_data:
                sid = item.get("id") or item.get("link", "").strip("/").split("/")[-1]
                default_projects.append(ProjectResponse(
                    id=f"proj_tp_{sid}",
                    studio_id=sid,
                    user_id=user_id,
                    title=f"{item.get('title')} Workspace",
                    files={
                        "main.py": f"# Project workspace for {item.get('title')}\\n# Target Repository: https://github.com/Pradeeptalari14/tp-{sid}\\n",
                        item.get("tag", "config.yaml"): f"# Configuration artifact for {item.get('title')}\\n"
                    },
                    mode="build",
                    completed_steps=["learn", "configure", "test"],
                    created_at=now,
                    updated_at=now
                ))
        except Exception:
            pass
    return default_projects

from pathlib import Path
import json

@router.get("/repositories")
async def list_open_source_repositories(category: str = None, search: str = None):
    """
    Returns the catalog of all 341 open-source developer repositories and paired studios.
    """
    tools_path = Path(__file__).resolve().parents[3] / "tools" / "tools.json"
    if not tools_path.exists():
        tools_path = Path("tools/tools.json")

    if not tools_path.exists():
        return {"total": 0, "repositories": []}

    try:
        with open(tools_path, "r", encoding="utf-8") as f:
            tools = json.load(f)
    except Exception:
        return {"total": 0, "repositories": []}

    results = tools
    if category and category.lower() != "all":
        results = [t for t in results if (t.get("category") or "").lower() == category.lower()]
    if search:
        s = search.lower()
        results = [
            t for t in results
            if s in (t.get("title") or "").lower()
            or s in (t.get("desc") or "").lower()
            or s in (t.get("repository") or "").lower()
            or s in (t.get("tag") or "").lower()
        ]

    return {
        "total": len(results),
        "total_catalog": len(tools),
        "repositories": [
            {
                "title": t.get("title"),
                "description": t.get("desc"),
                "category": t.get("category"),
                "repository": t.get("repository") or f"Pradeeptalari14/tp-{t.get('link','').strip('/')}",
                "github_url": f"https://github.com/{t.get('repository') or 'Pradeeptalari14/tp-' + t.get('link','').strip('/')}",
                "studio_link": f"/tools/{t.get('link','').strip('/')}/",
                "tag": t.get("tag"),
                "icon": t.get("icon", "🛠️")
            }
            for t in results
        ]
    }


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
