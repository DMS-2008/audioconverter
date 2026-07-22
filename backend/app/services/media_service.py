import os
import re
import math
import logging
from typing import List, Optional
from urllib.parse import urlparse
import yt_dlp

try:
    from ..schemas import MediaInfoResponse, FormatVideoOption, FormatAudioOption
except ImportError:
    from app.schemas import MediaInfoResponse, FormatVideoOption, FormatAudioOption

logger = logging.getLogger("v2a.media_service")

# Regex to check URL safety and valid format
URL_REGEX = re.compile(
    r'^(https?://)?'  # http:// or https://
    r'([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'  # domain
    r'(:[0-9]+)?'  # optional port
    r'(/.*)?$',
    re.IGNORECASE
)

def validate_url(url: str) -> str:
    """Validate and sanitize URL before sending to yt-dlp."""
    if not url or not isinstance(url, str):
        raise ValueError("Please provide a valid video URL.")
    
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only HTTP and HTTPS URLs are supported.")

    hostname = parsed.hostname or ""
    if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        raise ValueError("Localhost URLs are not allowed.")

    if not URL_REGEX.match(url):
        raise ValueError("Invalid URL format. Please paste a valid web video link.")

    return url

def format_duration(seconds: Optional[int]) -> str:
    """Format duration in seconds into MM:SS or HH:MM:SS."""
    if not seconds or seconds <= 0:
        return "Unknown"
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"

def extract_media_info(url: str) -> MediaInfoResponse:
    """Fetch video metadata and format list using yt-dlp."""
    sanitized_url = validate_url(url)
    
    ydl_opts = {
        'extract_flat': False,
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': False,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(sanitized_url, download=False)
    except yt_dlp.utils.DownloadError as e:
        err_msg = str(e)
        if "Private video" in err_msg:
            raise ValueError("This video is private or restricted.")
        elif "Video unavailable" in err_msg:
            raise ValueError("This video is unavailable or has been removed.")
        elif "Copyright" in err_msg:
            raise ValueError("This content is unavailable due to copyright restriction.")
        else:
            raise ValueError(f"Could not extract video information: {err_msg.split(';')[0]}")
    except Exception as e:
        logger.error(f"Error extracting info for {url}: {e}", exc_info=True)
        raise ValueError(f"Failed to fetch video details: {str(e)}")

    if not info:
        raise ValueError("Unable to extract video details.")

    title = info.get('title', 'Untitled Media')
    thumbnail = info.get('thumbnail') or (info.get('thumbnails')[-1]['url'] if info.get('thumbnails') else None)
    duration_seconds = int(info.get('duration') or 0)
    duration_formatted = format_duration(duration_seconds)
    author = info.get('uploader') or info.get('channel') or info.get('creator') or 'Unknown Author'
    site_name = info.get('extractor_key') or 'Web Video'

    # Extract Video Options
    formats = info.get('formats') or []
    video_options_dict: Dict[int, FormatVideoOption] = {}

    for f in formats:
        height = f.get('height')
        vcodec = f.get('vcodec') or 'none'
        
        # Must have video height
        if not height or vcodec == 'none':
            continue

        # Standard resolution label
        res_label = f"{height}p"
        if height >= 2160:
            res_label = "4K (2160p)"
        elif height >= 1440:
            res_label = "2K (1440p)"
        elif height >= 1080:
            res_label = "1080p Full HD"
        elif height >= 720:
            res_label = "720p HD"
        elif height >= 480:
            res_label = "480p"
        elif height >= 360:
            res_label = "360p"
        elif height >= 240:
            res_label = "240p"

        filesize = f.get('filesize') or f.get('filesize_approx')
        filesize_mb = round(filesize / (1024 * 1024), 1) if filesize else None
        
        # Estimate filesize from tbr if missing and duration is known
        if not filesize_mb and duration_seconds > 0 and f.get('tbr'):
            tbr_kbps = f.get('tbr')
            filesize_mb = round((tbr_kbps * 1000 * duration_seconds) / (8 * 1024 * 1024), 1)

        format_id = f.get('format_id', '')
        ext = f.get('ext') or 'mp4'

        # Keep highest quality per height level
        if height not in video_options_dict or (filesize_mb and not video_options_dict[height].filesize_approx_mb):
            video_options_dict[height] = FormatVideoOption(
                format_id=format_id,
                resolution=res_label,
                height=height,
                ext=ext if ext in ('mp4', 'webm') else 'mp4',
                filesize_approx_mb=filesize_mb,
                fps=f.get('fps'),
                vcodec=vcodec,
                acodec=f.get('acodec') or 'none'
            )

    # Sort video resolutions descending (highest resolution first)
    sorted_heights = sorted(video_options_dict.keys(), reverse=True)
    video_options = [video_options_dict[h] for h in sorted_heights if h >= 240]

    # Default fallback video resolutions if none detected in formats
    if not video_options:
        video_options = [
            FormatVideoOption(format_id="best", resolution="1080p Full HD", height=1080, ext="mp4", vcodec="h264", acodec="aac"),
            FormatVideoOption(format_id="best[height<=720]", resolution="720p HD", height=720, ext="mp4", vcodec="h264", acodec="aac"),
            FormatVideoOption(format_id="best[height<=480]", resolution="480p", height=480, ext="mp4", vcodec="h264", acodec="aac")
        ]

    # Generate Audio Quality Options (Presets for high, medium, standard)
    audio_options: List[FormatAudioOption] = []
    
    # Estimate audio filesize based on duration
    # 320kbps ~ 2.4 MB/min, 192kbps ~ 1.4 MB/min, 128kbps ~ 0.95 MB/min
    dur_min = duration_seconds / 60.0 if duration_seconds > 0 else 3.5

    for abr, label in [(320, "320 kbps (High Quality)"), (192, "192 kbps (Medium Quality)"), (128, "128 kbps (Standard)")]:
        est_mb = round((abr * 1000 * (duration_seconds if duration_seconds > 0 else 210)) / (8 * 1024 * 1024), 1)
        for ext in ["mp3", "m4a", "opus"]:
            audio_options.append(FormatAudioOption(
                format_id=f"audio-{ext}-{abr}",
                ext=ext,
                abr_kbps=abr,
                filesize_approx_mb=est_mb
            ))

    return MediaInfoResponse(
        url=sanitized_url,
        title=title,
        thumbnail=thumbnail,
        duration_seconds=duration_seconds,
        duration_formatted=duration_formatted,
        author=author,
        site_name=site_name,
        video_options=video_options,
        audio_options=audio_options
    )
