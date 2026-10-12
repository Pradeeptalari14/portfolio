"""
Talari Pradeep Studios Hub — Automated Database Seeder
Seeds all 341 engineering studios into PostgreSQL + pgvector.
Usage:
    python backend/scripts/seed_studios.py
"""

import os
import json
import asyncio
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from backend.app.database import DATABASE_URL, Base
from backend.app.models import Studio, StudioEmbedding, Project

async def seed():
    repo_root = Path(__file__).resolve().parent.parent.parent
    tools_json_path = repo_root / "tools" / "tools.json"
    learn_json_path = repo_root / "studios" / "learn" / "studios-learning.json"

    if not tools_json_path.exists():
        print(f"Error: Could not find tools.json at {tools_json_path}")
        return

    with open(tools_json_path, "r", encoding="utf-8") as f:
        tools_data = json.load(f)

    learn_data = {}
    if learn_json_path.exists():
        try:
            with open(learn_json_path, "r", encoding="utf-8") as f:
                learn_data = json.load(f)
        except Exception as e:
            print(f"Note: Could not parse studios-learning.json: {e}")

    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    print(f"Connecting to database: {DATABASE_URL}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        seeded_count = 0
        updated_count = 0

        for item in tools_data:
            studio_id = item.get("id") or (item.get("link", "").strip("/").split("/")[-1])
            if not studio_id:
                continue

            enrichment = learn_data.get(studio_id, {})

            stmt = select(Studio).where(Studio.id == studio_id)
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()

            studio_record = {
                "id": studio_id,
                "title": item.get("title", "Untitled Studio"),
                "category": item.get("category", "General"),
                "domain": enrichment.get("domain", item.get("category", "Engineering")),
                "skill_level": enrichment.get("skill_level", "Level 2"),
                "tag": item.get("tag", "Interactive"),
                "desc": item.get("desc", ""),
                "use_case": enrichment.get("use_case", item.get("desc", "")),
                "best_treatment": enrichment.get("best_treatment", ""),
                "anti_pattern": enrichment.get("anti_pattern", ""),
                "real_time_drill": enrichment.get("real_time_drill", ""),
                "sre_metric": enrichment.get("sre_metric", "Platform Uptime 99.98%"),
                "repository": item.get("repository", f"tp-{studio_id}")
            }

            if existing:
                for k, v in studio_record.items():
                    setattr(existing, k, v)
                updated_count += 1
            else:
                new_studio = Studio(**studio_record)
                session.add(new_studio)
                seeded_count += 1

            # Seed / Upsert default Project record for this studio & repository
            proj_id = f"proj_tp_{studio_id}"
            stmt_proj = select(Project).where(Project.id == proj_id)
            res_proj = await session.execute(stmt_proj)
            existing_proj = res_proj.scalar_one_or_none()

            project_record = {
                "id": proj_id,
                "studio_id": studio_id,
                "user_id": "guest",
                "title": f"{item.get('title', 'Untitled')} Project Workspace",
                "files": {
                    "main.py": f"# Project workspace for {item.get('title')}\n# Target Repo: https://github.com/Pradeeptalari14/tp-{studio_id}\n",
                    item.get("tag", "config.yaml"): f"# Configuration artifact for {item.get('title')}\n"
                },
                "mode": "build",
                "completed_steps": ["learn", "configure", "test"]
            }

            if existing_proj:
                for k, v in project_record.items():
                    setattr(existing_proj, k, v)
            else:
                session.add(Project(**project_record))

        await session.commit()
        print(f"Seeding Complete! Seeded: {seeded_count}, Updated: {updated_count}, Total Processed: {len(tools_data)}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
