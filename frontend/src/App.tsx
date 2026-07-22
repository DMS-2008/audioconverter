import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlForm } from './components/UrlForm';
import { MediaCard } from './components/MediaCard';
import { FormatPicker } from './components/FormatPicker';
import { DownloadHistory } from './components/DownloadHistory';
import { ErrorAlert } from './components/ErrorAlert';
import type { MediaInfoResponse, DownloadRequest, JobProgressEvent, DownloadHistoryItem } from './types/media';
import { Sparkles, ArrowDownToLine, FileVideo, Music2, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [media, setMedia] = useState<MediaInfoResponse | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Download job state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [currentJob, setCurrentJob] = useState<JobProgressEvent | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string>('');
  
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('v2a_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('v2a_history', JSON.stringify(downloadHistory));
    } catch (e) {
      console.error('Failed to save download history', e);
    }
  }, [downloadHistory]);

  const handleFetchMediaInfo = async (url: string) => {
    setIsLoadingInfo(true);
    setErrorMsg('');
    setDownloadSuccessMsg('');
    setMedia(null);

    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to fetch video information.');
      }

      const data: MediaInfoResponse = await res.json();
      setMedia(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleStartDownload = async (req: DownloadRequest) => {
    setErrorMsg('');
    setDownloadSuccessMsg('');
    setIsDownloading(true);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Could not queue download job.');
      }

      const data = await res.json();
      const jobId = data.job_id;

      // Open SSE connection for background progress monitoring
      const eventSource = new EventSource(`/api/progress/${jobId}`);

      eventSource.addEventListener('progress', (e: MessageEvent) => {
        try {
          const jobEvent: JobProgressEvent = JSON.parse(e.data);
          setCurrentJob(jobEvent);

          if (jobEvent.status === 'completed') {
            eventSource.close();
            setIsDownloading(false);

            if (jobEvent.download_url) {
              // Trigger confetti celebration
              confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.6 }
              });

              // Automatically trigger DIRECT browser download to local Downloads folder
              const link = document.createElement('a');
              link.href = jobEvent.download_url;
              if (jobEvent.filename) {
                link.setAttribute('download', jobEvent.filename);
              }
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              setDownloadSuccessMsg(`🎉 File downloaded directly to your local machine!`);

              // Add to history
              if (media) {
                const newHistoryItem: DownloadHistoryItem = {
                  id: Math.random().toString(36).substring(2, 9),
                  jobId: jobEvent.job_id,
                  title: media.title,
                  thumbnail: media.thumbnail || undefined,
                  type: req.type,
                  quality: req.target_quality,
                  ext: req.target_ext,
                  fileSizeMb: jobEvent.total_bytes ? Math.round((jobEvent.total_bytes / (1024 * 1024)) * 10) / 10 : undefined,
                  downloadUrl: jobEvent.download_url,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setDownloadHistory((prev) => [newHistoryItem, ...prev]);
              }
            }
          } else if (jobEvent.status === 'error') {
            eventSource.close();
            setIsDownloading(false);
            setErrorMsg(jobEvent.error_message || 'Download failed.');
          }
        } catch (parseErr) {
          console.error('Failed to parse SSE payload', parseErr);
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        eventSource.close();
        setIsDownloading(false);
      };
    } catch (err: any) {
      setIsDownloading(false);
      setErrorMsg(err.message || 'Download failed to initialize.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D13] text-gray-100 selection:bg-amber-500 selection:text-slate-950">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Hero Banner Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant High-Quality Audio & Video Extraction</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Convert Any Web Video to <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 bg-clip-text text-transparent">
              Lossless Audio or Ultra HD Video
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Paste a URL from YouTube or supported platforms to select custom resolutions or audio bitrates.
          </p>
        </div>

        {/* Input Form */}
        <UrlForm onSubmit={handleFetchMediaInfo} isLoading={isLoadingInfo} />

        {/* Error Feedback Banner */}
        {errorMsg && (
          <ErrorAlert
            message={errorMsg}
            onRetry={() => {
              if (media?.url) handleFetchMediaInfo(media.url);
            }}
          />
        )}

        {/* Direct Download Success Banner */}
        {downloadSuccessMsg && (
          <div className="w-full max-w-3xl mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold text-center animate-fade-in shadow-xl">
            {downloadSuccessMsg}
          </div>
        )}

        {/* Empty State when no media fetched */}
        {!media && !isLoadingInfo && !errorMsg && (
          <div className="glass-panel rounded-3xl p-10 border border-white/5 text-center space-y-6 max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <ArrowDownToLine className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-white">Ready for Conversion</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Paste any link above to inspect formats, pick your audio bitrate or video resolution, and download.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-left text-xs text-gray-400">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <FileVideo className="w-4 h-4 text-amber-400" />
                  <span>Up to 4K Video</span>
                </div>
                <p className="text-[11px] text-gray-400">MP4 and WEBM in all available resolutions.</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Music2 className="w-4 h-4 text-emerald-400" />
                  <span>320kbps Audio</span>
                </div>
                <p className="text-[11px] text-gray-400">Pure audio extraction into MP3, M4A, or OPUS.</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Direct Download</span>
                </div>
                <p className="text-[11px] text-gray-400">Instant file delivery straight to your Downloads folder.</p>
              </div>
            </div>
          </div>
        )}

        {/* Media Details & Format Picker */}
        {media && (
          <div className="space-y-6 animate-fade-in">
            <MediaCard media={media} />
            <FormatPicker
              media={media}
              onStartDownload={handleStartDownload}
              isDownloading={isDownloading}
              currentJob={currentJob}
            />
          </div>
        )}

        {/* Session Download History */}
        <DownloadHistory
          history={downloadHistory}
          onClearHistory={() => setDownloadHistory([])}
        />
      </main>

      <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-gray-500 font-mono">
        <p>V2A Engine • Powered by FastAPI, yt-dlp & FFmpeg</p>
      </footer>
    </div>
  );
};

export default App;
