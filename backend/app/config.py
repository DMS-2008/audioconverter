import os
import sys
from pathlib import Path

# Project Branding
APP_NAME = "AudioStream"
APP_DESCRIPTION = "Web Video & Audio Downloader"
APP_VERSION = "2.0.0"

# Initialize static_ffmpeg to ensure ffmpeg and ffprobe are in PATH
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
except Exception as e:
    print(f"Warning: Failed to initialize static_ffmpeg: {e}", file=sys.stderr)

BASE_DIR = Path(__file__).resolve().parent.parent
TEMP_DOWNLOAD_DIR = BASE_DIR / "temp_downloads"
TEMP_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Host & Port Configurations
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

# Maximum concurrent downloads allowed
MAX_CONCURRENT_DOWNLOADS = int(os.getenv("MAX_CONCURRENT_DOWNLOADS", "3"))

# Retention window for temporary files in seconds (default: 10 minutes)
FILE_RETENTION_SECONDS = int(os.getenv("FILE_RETENTION_SECONDS", "600"))

# CORS allowed origins (comma-separated or wildcard)
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]
