import os
import sys
from pathlib import Path

# Initialize static_ffmpeg to ensure ffmpeg and ffprobe are in PATH
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
except Exception as e:
    print(f"Warning: Failed to initialize static_ffmpeg: {e}", file=sys.stderr)

BASE_DIR = Path(__file__).resolve().parent.parent
TEMP_DOWNLOAD_DIR = BASE_DIR / "temp_downloads"
TEMP_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Maximum concurrent downloads allowed
MAX_CONCURRENT_DOWNLOADS = 3

# Retention window for temporary files in seconds (10 minutes)
FILE_RETENTION_SECONDS = 600
