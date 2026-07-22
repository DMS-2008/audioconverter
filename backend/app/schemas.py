from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class UrlInfoRequest(BaseModel):
    url: str = Field(..., description="Web video or audio URL (YouTube, Vimeo, SoundCloud, etc.)")

class FormatVideoOption(BaseModel):
    format_id: str
    resolution: str
    height: int
    ext: str
    filesize_approx_mb: Optional[float] = None
    fps: Optional[int] = None
    vcodec: str
    acodec: str

class FormatAudioOption(BaseModel):
    format_id: str
    ext: str  # e.g. mp3, m4a, opus
    abr_kbps: int  # e.g. 320, 192, 128
    filesize_approx_mb: Optional[float] = None

class MediaInfoResponse(BaseModel):
    url: str
    title: str
    thumbnail: Optional[str] = None
    duration_seconds: int
    duration_formatted: str
    author: str
    site_name: str
    video_options: List[FormatVideoOption]
    audio_options: List[FormatAudioOption]

class DownloadRequest(BaseModel):
    url: str
    type: Literal["video", "audio"]
    format_id: Optional[str] = None
    target_quality: str  # e.g., "1080p", "720p" or "320kbps", "192kbps"
    target_ext: str  # e.g. "mp4", "webm" or "mp3", "m4a", "opus"

class JobProgressEvent(BaseModel):
    job_id: str
    status: Literal["queued", "downloading", "processing", "completed", "error"]
    progress_percent: float
    downloaded_bytes: int
    total_bytes: int
    speed_str: str
    eta_str: str
    filename: Optional[str] = None
    download_url: Optional[str] = None
    error_message: Optional[str] = None

class DownloadJobResponse(BaseModel):
    job_id: str
    status: str
    message: str
