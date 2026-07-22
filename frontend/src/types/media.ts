export interface FormatVideoOption {
  format_id: string;
  resolution: string;
  height: number;
  ext: string;
  filesize_approx_mb?: number | null;
  fps?: number | null;
  vcodec: string;
  acodec: string;
}

export interface FormatAudioOption {
  format_id: string;
  ext: string;
  abr_kbps: number;
  filesize_approx_mb?: number | null;
}

export interface MediaInfoResponse {
  url: string;
  title: string;
  thumbnail?: string | null;
  duration_seconds: number;
  duration_formatted: string;
  author: string;
  site_name: string;
  video_options: FormatVideoOption[];
  audio_options: FormatAudioOption[];
}

export interface DownloadRequest {
  url: string;
  type: "video" | "audio";
  format_id?: string;
  target_quality: string;
  target_ext: string;
}

export interface JobProgressEvent {
  job_id: string;
  status: "queued" | "downloading" | "processing" | "completed" | "error";
  progress_percent: number;
  downloaded_bytes: number;
  total_bytes: number;
  speed_str: string;
  eta_str: string;
  filename?: string | null;
  download_url?: string | null;
  error_message?: string | null;
}

export interface DownloadHistoryItem {
  id: string;
  jobId: string;
  title: string;
  thumbnail?: string;
  type: "video" | "audio";
  quality: string;
  ext: string;
  fileSizeMb?: number;
  downloadUrl: string;
  timestamp: string;
}
