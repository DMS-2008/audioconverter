import os
import glob
import time
import uuid
import asyncio
import logging
from typing import Dict, List, Optional
import yt_dlp

try:
    from ..config import TEMP_DOWNLOAD_DIR, MAX_CONCURRENT_DOWNLOADS, FILE_RETENTION_SECONDS
    from ..schemas import DownloadRequest, JobProgressEvent
except ImportError:
    from app.config import TEMP_DOWNLOAD_DIR, MAX_CONCURRENT_DOWNLOADS, FILE_RETENTION_SECONDS
    from app.schemas import DownloadRequest, JobProgressEvent

logger = logging.getLogger("v2a.job_queue")

# Async Semaphore for controlling concurrent downloads
DOWNLOAD_SEMAPHORE = asyncio.Semaphore(MAX_CONCURRENT_DOWNLOADS)

# In-memory storage for jobs and active SSE listeners
JOBS_STORE: Dict[str, JobProgressEvent] = {}
JOB_SUBSCRIBERS: Dict[str, List[asyncio.Queue]] = {}

def get_job_status(job_id: str) -> Optional[JobProgressEvent]:
    return JOBS_STORE.get(job_id)

async def notify_subscribers(job_id: str, event: JobProgressEvent):
    """Publish progress event to all active SSE queues for this job."""
    JOBS_STORE[job_id] = event
    subscribers = JOB_SUBSCRIBERS.get(job_id, [])
    for q in list(subscribers):
        try:
            await q.put(event)
        except Exception as e:
            logger.warning(f"Error sending update to subscriber for {job_id}: {e}")

def sanitize_filename(filename: str) -> str:
    """Remove unsafe characters from filenames."""
    return "".join([c for c in filename if c.isalnum() or c in (" ", "_", "-", ".")]).strip()

def run_yt_dlp_download(job_id: str, req: DownloadRequest, loop: asyncio.AbstractEventLoop):
    """Synchronous download function executed in a background thread."""
    output_template = str(TEMP_DOWNLOAD_DIR / f"{job_id}_%(title)s.%(ext)s")

    def progress_hook(d: dict):
        status = d.get('status')
        if status == 'downloading':
            total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
            downloaded = d.get('downloaded_bytes') or 0
            percent = (downloaded / total * 100.0) if total > 0 else 0.0
            
            speed = d.get('speed')
            speed_str = f"{speed / (1024*1024):.1f} MB/s" if speed else "-- MB/s"
            
            eta = d.get('eta')
            eta_str = f"{eta}s" if eta is not None else "--s"

            event = JobProgressEvent(
                job_id=job_id,
                status="downloading",
                progress_percent=round(percent, 1),
                downloaded_bytes=downloaded,
                total_bytes=total,
                speed_str=speed_str,
                eta_str=eta_str
            )
            asyncio.run_coroutine_threadsafe(notify_subscribers(job_id, event), loop)

        elif status == 'finished':
            event = JobProgressEvent(
                job_id=job_id,
                status="processing",
                progress_percent=98.0,
                downloaded_bytes=0,
                total_bytes=0,
                speed_str="Processing",
                eta_str="Finalizing"
            )
            asyncio.run_coroutine_threadsafe(notify_subscribers(job_id, event), loop)

    # Configure yt-dlp options based on request type
    ydl_opts = {
        'outtmpl': output_template,
        'progress_hooks': [progress_hook],
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
    }

    if req.type == "audio":
        # Extract audio using ffmpeg
        ydl_opts['format'] = 'bestaudio/best'
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': req.target_ext if req.target_ext in ('mp3', 'm4a', 'opus') else 'mp3',
            'preferredquality': req.target_quality.replace('kbps', '') if 'kbps' in req.target_quality else '192',
        }]
    else:
        # Video download format selection
        target_height = None
        if "2160" in req.target_quality:
            target_height = 2160
        elif "1440" in req.target_quality:
            target_height = 1440
        elif "1080" in req.target_quality:
            target_height = 1080
        elif "720" in req.target_quality:
            target_height = 720
        elif "480" in req.target_quality:
            target_height = 480
        elif "360" in req.target_quality:
            target_height = 360

        if target_height:
            ydl_opts['format'] = (
                f"bestvideo[height<={target_height}][vcodec^=avc1]+bestaudio[acodec^=mp4a]/"
                f"bestvideo[height<={target_height}]+bestaudio/"
                f"best[height<={target_height}]/best"
            )
        else:
            ydl_opts['format'] = (
                "bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/"
                "bestvideo+bestaudio/best"
            )

        target_format = req.target_ext if req.target_ext in ('mp4', 'webm') else 'mp4'
        ydl_opts['merge_output_format'] = target_format
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': target_format
        }]

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([req.url])

        # Locate the downloaded output file on disk matching job_id prefix
        search_pattern = str(TEMP_DOWNLOAD_DIR / f"{job_id}_*")
        found_files = glob.glob(search_pattern)

        if not found_files:
            raise Exception("Downloaded file could not be located on server storage.")

        output_file = found_files[0]
        actual_filename = os.path.basename(output_file)

        event = JobProgressEvent(
            job_id=job_id,
            status="completed",
            progress_percent=100.0,
            downloaded_bytes=os.path.getsize(output_file),
            total_bytes=os.path.getsize(output_file),
            speed_str="Complete",
            eta_str="0s",
            filename=actual_filename,
            download_url=f"/api/stream/{job_id}"
        )
        asyncio.run_coroutine_threadsafe(notify_subscribers(job_id, event), loop)

    except Exception as e:
        logger.error(f"Download failed for job {job_id}: {e}", exc_info=True)
        event = JobProgressEvent(
            job_id=job_id,
            status="error",
            progress_percent=0.0,
            downloaded_bytes=0,
            total_bytes=0,
            speed_str="Failed",
            eta_str="N/A",
            error_message=str(e)
        )
        asyncio.run_coroutine_threadsafe(notify_subscribers(job_id, event), loop)

async def start_download_job(req: DownloadRequest) -> str:
    """Enqueue and execute a new download job asynchronously."""
    job_id = str(uuid.uuid4())
    
    initial_event = JobProgressEvent(
        job_id=job_id,
        status="queued",
        progress_percent=0.0,
        downloaded_bytes=0,
        total_bytes=0,
        speed_str="Queued",
        eta_str="Calculating..."
    )
    JOBS_STORE[job_id] = initial_event
    JOB_SUBSCRIBERS[job_id] = []

    loop = asyncio.get_event_loop()

    async def worker():
        async with DOWNLOAD_SEMAPHORE:
            # Run blocking yt-dlp operation in thread executor
            await loop.run_in_executor(None, run_yt_dlp_download, job_id, req, loop)

    asyncio.create_task(worker())
    return job_id

def cleanup_old_files():
    """Background task to remove temp download files older than retention period."""
    now = time.time()
    for f in TEMP_DOWNLOAD_DIR.iterdir():
        if f.is_file():
            if now - f.stat().st_mtime > FILE_RETENTION_SECONDS:
                try:
                    f.unlink()
                    logger.info(f"Cleaned up expired temp file: {f.name}")
                except Exception as e:
                    logger.warning(f"Failed to remove file {f.name}: {e}")
