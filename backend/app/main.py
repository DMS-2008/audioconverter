import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

try:
    from .routers import media, progress
except ImportError:
    from app.routers import media, progress

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title="V2A Media Converter & Downloader API",
    description="Backend API for video/audio info extraction and asynchronous download conversion using yt-dlp.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(media.router)
app.include_router(progress.router)

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": "V2A", "version": "1.0.0"}

# Mount frontend static build files if dist exists
BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
else:
    print(f"Notice: Frontend build directory not found at {FRONTEND_DIST}. Run 'npm run build' in frontend/ to serve static UI.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
