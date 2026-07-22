import os
import glob
import re
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

try:
    from ..schemas import UrlInfoRequest, MediaInfoResponse, DownloadRequest, DownloadJobResponse
    from ..services.media_service import extract_media_info
    from ..services.job_queue import start_download_job, get_job_status, TEMP_DOWNLOAD_DIR, cleanup_old_files
except ImportError:
    from app.schemas import UrlInfoRequest, MediaInfoResponse, DownloadRequest, DownloadJobResponse
    from app.services.media_service import extract_media_info
    from app.services.job_queue import start_download_job, get_job_status, TEMP_DOWNLOAD_DIR, cleanup_old_files

router = APIRouter(prefix="/api", tags=["Media"])

def get_safe_ascii_filename(filename: str) -> str:
    """Sanitize filename to prevent HTTP latin-1 header encoding errors."""
    name, ext = os.path.splitext(filename)
    # Replace non-ASCII characters and dangerous header characters with underscores
    safe_name = "".join([c if c.isascii() and c not in r'\/:*?"<>|' else '_' for c in name])
    safe_name = re.sub(r'_+', '_', safe_name).strip(" ._")
    if not safe_name:
        safe_name = "media_download"
    return f"{safe_name}{ext}"

@router.post("/info", response_model=MediaInfoResponse)
async def get_info(req: UrlInfoRequest):
    """Extract formats, title, thumbnail, and duration for a given URL."""
    try:
        info = extract_media_info(req.url)
        return info
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error processing video: {str(e)}")

@router.post("/download", response_model=DownloadJobResponse)
async def create_download(req: DownloadRequest, background_tasks: BackgroundTasks):
    """Create an asynchronous download job."""
    try:
        job_id = await start_download_job(req)
        background_tasks.add_task(cleanup_old_files)
        return DownloadJobResponse(
            job_id=job_id,
            status="queued",
            message="Download job created successfully."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue download: {str(e)}")

@router.get("/stream/{job_id}")
async def stream_download_file(job_id: str, background_tasks: BackgroundTasks):
    """Serve the completed downloaded file directly to the client browser."""
    job = get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Download job not found.")

    if job.status != "completed":
        raise HTTPException(status_code=400, detail=f"File is not ready. Current job status: {job.status}")

    search_pattern = str(TEMP_DOWNLOAD_DIR / f"{job_id}_*")
    found_files = glob.glob(search_pattern)

    if not found_files:
        raise HTTPException(status_code=404, detail="File lost or already deleted from server.")

    file_path = found_files[0]
    display_filename = job.filename or os.path.basename(file_path)
    # Strip prefix job_id_ if present
    if display_filename.startswith(f"{job_id}_"):
        display_filename = display_filename[len(f"{job_id}_"):]

    safe_filename = get_safe_ascii_filename(display_filename)

    def remove_file():
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

    # Schedule cleanup after serving the file
    background_tasks.add_task(remove_file)

    return FileResponse(
        path=file_path,
        media_type="application/octet-stream",
        filename=safe_filename
    )
