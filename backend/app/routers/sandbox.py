import time
import os
import docker
from fastapi import APIRouter, HTTPException
from ..schemas import SandboxRunRequest, SandboxRunResponse

router = APIRouter(prefix="/api/sandbox", tags=["Docker Sandbox"])

# Fallback in-process runner if Docker daemon is not active in dev
def run_in_docker(request: SandboxRunRequest) -> SandboxRunResponse:
    start_time = time.time()
    try:
        client = docker.from_env()
    except Exception as e:
        return SandboxRunResponse(
            success=False,
            exit_code=1,
            stdout="",
            stderr=f"Docker daemon unavailable: {str(e)}. Please start Docker Desktop or Docker engine.",
            duration_ms=(time.time() - start_time) * 1000
        )

    image = "python:3.11-alpine" if request.language == "python" else "alpine:3.19"
    cmd = request.command or "echo 'No command specified'"

    try:
        # Hardened container specs as defined in approved blueprint
        container = client.containers.create(
            image=image,
            command=["sh", "-c", cmd],
            network_mode="none",  # complete network isolation
            mem_limit="512m",     # strict memory cap
            memswap_limit="512m", # prevent swap thrashing
            pids_limit=64,        # fork-bomb prevention
            read_only=True,       # immutable root filesystem
            tmpfs={"/tmp": "rw,noexec,nosuid,size=64m"},
            init=True             # tini init process prevents zombie processes
        )

        container.start()
        res = container.wait(timeout=request.timeout_sec)
        exit_code = res.get("StatusCode", 0)
        logs = container.logs(stdout=True, stderr=True)
        container.remove(force=True)

        duration = (time.time() - start_time) * 1000
        output_str = logs.decode("utf-8", errors="replace")

        return SandboxRunResponse(
            success=(exit_code == 0),
            exit_code=exit_code,
            stdout=output_str if exit_code == 0 else "",
            stderr="" if exit_code == 0 else output_str,
            duration_ms=duration
        )
    except docker.errors.ContainerError as ce:
        return SandboxRunResponse(
            success=False,
            exit_code=ce.exit_status,
            stdout="",
            stderr=str(ce),
            duration_ms=(time.time() - start_time) * 1000
        )
    except Exception as ex:
        return SandboxRunResponse(
            success=False,
            exit_code=124,
            stdout="",
            stderr=f"Sandbox execution error: {str(ex)}",
            duration_ms=(time.time() - start_time) * 1000
        )

@router.post("/execute", response_model=SandboxRunResponse)
async def execute_in_sandbox(payload: SandboxRunRequest):
    return run_in_docker(payload)
