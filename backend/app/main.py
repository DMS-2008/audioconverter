import time
import os
import shutil
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

try:
    from .config import (
        APP_NAME, APP_DESCRIPTION, APP_VERSION,
        CORS_ORIGINS, TEMP_DOWNLOAD_DIR
    )
    from .routers import media, progress
    from .services.job_queue import JOBS_STORE
except ImportError:
    from app.config import (
        APP_NAME, APP_DESCRIPTION, APP_VERSION,
        CORS_ORIGINS, TEMP_DOWNLOAD_DIR
    )
    from app.routers import media, progress
    from app.services.job_queue import JOBS_STORE

# Configure structured logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("audiostream.main")

SERVER_START_TIME = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan handler for startup and graceful shutdown."""
    logger.info(f"✨ {APP_NAME} v{APP_VERSION} initialized successfully.")
    yield
    # Graceful shutdown: clean up temporary download cache
    logger.info("Cleaning up temporary download directory on shutdown...")
    try:
        for f in TEMP_DOWNLOAD_DIR.glob("*"):
            if f.is_file():
                f.unlink(missing_ok=True)
    except Exception as e:
        logger.warning(f"Failed to clear temp directory on exit: {e}")
    logger.info(f"{APP_NAME} shutdown complete.")

app = FastAPI(
    title=f"{APP_NAME} — {APP_DESCRIPTION} API",
    description="High-performance backend API for dual-stream video & audio extraction, transcoding, and real-time SSE delivery.",
    version=APP_VERSION,
    lifespan=lifespan
)

# Enable CORS with configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(media.router)
app.include_router(progress.router)

@app.get("/api/health")
async def health_check():
    """Enhanced production health check endpoint with system metrics."""
    uptime_sec = round(time.time() - SERVER_START_TIME, 1)
    
    # Calculate storage used in temp downloads
    temp_files = list(TEMP_DOWNLOAD_DIR.glob("*"))
    temp_size_bytes = sum(f.stat().st_size for f in temp_files if f.is_file())
    temp_size_mb = round(temp_size_bytes / (1024 * 1024), 2)
    
    # Count active/queued jobs
    active_jobs = sum(1 for j in JOBS_STORE.values() if j.status in ("queued", "downloading", "processing"))

    return {
        "status": "ok",
        "app": APP_NAME,
        "version": APP_VERSION,
        "uptime_seconds": uptime_sec,
        "active_jobs": active_jobs,
        "temp_storage_mb": temp_size_mb,
        "environment": os.getenv("ENVIRONMENT", "production")
    }

# Mount frontend static build files if dist exists
BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
else:
    logger.info(f"Notice: Frontend build directory not found at {FRONTEND_DIST}. Run 'npm run build' in frontend/ to serve static UI.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
