import json
import asyncio
from fastapi import APIRouter, Request, HTTPException
from sse_starlette.sse import EventSourceResponse

try:
    from ..services.job_queue import get_job_status, JOB_SUBSCRIBERS, JobProgressEvent
except ImportError:
    from app.services.job_queue import get_job_status, JOB_SUBSCRIBERS, JobProgressEvent

router = APIRouter(prefix="/api", tags=["Progress"])

@router.get("/progress/{job_id}")
async def stream_job_progress(job_id: str, request: Request):
    """Server-Sent Events (SSE) endpoint to stream real-time download progress."""
    initial_job = get_job_status(job_id)
    if not initial_job:
        raise HTTPException(status_code=404, detail="Job ID not found.")

    async def event_generator():
        q = asyncio.Queue()
        if job_id not in JOB_SUBSCRIBERS:
            JOB_SUBSCRIBERS[job_id] = []
        JOB_SUBSCRIBERS[job_id].append(q)

        try:
            # Yield initial status immediately
            current_status = get_job_status(job_id)
            if current_status:
                yield {
                    "event": "progress",
                    "data": json.dumps(current_status.model_dump())
                }

            while True:
                if await request.is_disconnected():
                    break

                try:
                    # Wait for next progress event with timeout to send keep-alive heartbeats
                    event: JobProgressEvent = await asyncio.wait_for(q.get(), timeout=15.0)
                    yield {
                        "event": "progress",
                        "data": json.dumps(event.model_dump())
                    }

                    # End stream on terminal states
                    if event.status in ("completed", "error"):
                        break
                except asyncio.TimeoutError:
                    # Heartbeat comment to keep connection active
                    yield {"event": "ping", "data": "keep-alive"}

        finally:
            if job_id in JOB_SUBSCRIBERS and q in JOB_SUBSCRIBERS[job_id]:
                JOB_SUBSCRIBERS[job_id].remove(q)

    return EventSourceResponse(event_generator())
