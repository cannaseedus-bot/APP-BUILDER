"""
ASX Studio Generator API v3.0
FastAPI backend for XJSON-based studio generation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, List
import json

from .xjson_engine import run_xjson_job

app = FastAPI(title="ASX Studio Generator", version="3.0.0")

# CORS middleware for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========== MODELS ==========

class JobRequest(BaseModel):
    job: str
    input: Dict = {}


class StudioCreateRequest(BaseModel):
    name: str
    description: str = ""
    type: str = "web"  # web, game, api, tape, ai, cms, pwa, terminal


class ImportGithubRequest(BaseModel):
    repo_url: str
    project_name: Optional[str] = None


# ========== HELPERS ==========

def get_project_root() -> Path:
    """Get project root directory"""
    return Path(__file__).resolve().parent.parent.parent


def get_jobs_dir() -> Path:
    """Get jobs directory"""
    return get_project_root() / "studio" / "jobs"


def get_projects_dir() -> Path:
    """Get projects directory"""
    projects = get_project_root() / "projects"
    projects.mkdir(exist_ok=True)
    return projects


# ========== ROUTES ==========

@app.get("/api/health")
def health():
    """Health check endpoint"""
    return {
        "ok": True,
        "service": "ASX-StudioGenerator-v3",
        "status": "online",
        "version": "3.0.0",
        "ecosystem": "ASXR Trinity"
    }


@app.post("/api/xjson/run-job")
def run_job(req: JobRequest):
    """Execute XJSON job"""
    jobs_dir = get_jobs_dir()
    job_path = jobs_dir / f"{req.job}.xjson"

    if not job_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Job file not found: {req.job}.xjson"
        )

    try:
        ctx = run_xjson_job(
            str(job_path),
            req.input,
            base_dir=str(get_project_root())
        )
        return {
            "ok": True,
            "ctx": ctx,
            "job": req.job
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Job execution failed: {str(e)}"
        )


@app.post("/api/studio/create")
def create_studio(req: StudioCreateRequest):
    """Create new studio project"""
    # Map studio type to XJSON job
    type_map = {
        "web": "web-studio",
        "game": "game-studio",
        "api": "api-studio",
        "tape": "xjson-tape-studio",
        "ai": "ai-multi-agent-studio",
        "cms": "cms-studio",
        "pwa": "pwa-studio",
        "terminal": "terminal-studio"
    }

    job = type_map.get(req.type, "web-studio")
    jobs_dir = get_jobs_dir()
    job_path = jobs_dir / f"{job}.xjson"

    # If job doesn't exist, use default template
    if not job_path.exists():
        job_path = jobs_dir / "default-studio.xjson"

    if not job_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Job template not found: {job}"
        )

    try:
        ctx = run_xjson_job(
            str(job_path),
            {
                "name": req.name,
                "description": req.description,
                "type": req.type
            },
            base_dir=str(get_project_root())
        )

        return {
            "ok": True,
            "ctx": ctx,
            "job": job,
            "project": f"/projects/{req.name}",
            "type": req.type
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Studio creation failed: {str(e)}"
        )


@app.post("/api/studio/import-github")
def import_github(req: ImportGithubRequest):
    """Import GitHub repository as project"""
    projects_dir = get_projects_dir()
    name = req.project_name or Path(req.repo_url.rstrip("/")).stem
    project_dir = projects_dir / name
    project_dir.mkdir(parents=True, exist_ok=True)

    # Store metadata
    meta = {
        "@context": "ASXR-Trinity-Import",
        "@v": "3.0.0",
        "type": "github-import",
        "name": name,
        "repo_url": req.repo_url,
        "imported_at": "{{timestamp}}"
    }

    meta_path = project_dir / "github.xjson"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    return {
        "ok": True,
        "project": str(project_dir),
        "meta": meta,
        "name": name
    }


@app.get("/api/studio/list-projects")
def list_projects():
    """List all studio projects"""
    projects_dir = get_projects_dir()

    if not projects_dir.exists():
        return {"ok": True, "projects": []}

    projects = []
    for p in projects_dir.iterdir():
        if p.is_dir():
            # Try to load metadata
            meta_path = p / "studio.xjson"
            if meta_path.exists():
                with open(meta_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                    projects.append({
                        "name": p.name,
                        "path": str(p),
                        **meta
                    })
            else:
                projects.append({
                    "name": p.name,
                    "path": str(p),
                    "type": "unknown"
                })

    return {
        "ok": True,
        "projects": projects,
        "count": len(projects)
    }


@app.delete("/api/studio/delete/{project_name}")
def delete_project(project_name: str):
    """Delete studio project"""
    projects_dir = get_projects_dir()
    project_dir = projects_dir / project_name

    if not project_dir.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Project not found: {project_name}"
        )

    # TODO: Implement safe deletion with confirmation
    return {
        "ok": False,
        "error": "Deletion not implemented for safety"
    }


@app.get("/api/studio/templates")
def list_templates():
    """List available studio templates"""
    jobs_dir = get_jobs_dir()

    templates = []
    if jobs_dir.exists():
        for job in jobs_dir.glob("*.xjson"):
            templates.append({
                "name": job.stem,
                "path": str(job),
                "type": "xjson"
            })

    return {
        "ok": True,
        "templates": templates,
        "count": len(templates)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
