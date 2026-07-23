import React, { useState, useEffect } from 'react';
import { UrlForm } from './components/UrlForm';
import { MediaCard } from './components/MediaCard';
import { FormatPicker } from './components/FormatPicker';
import { DownloadHistory } from './components/DownloadHistory';
import { ErrorAlert } from './components/ErrorAlert';
import { QuantumThreadCanvas } from './components/QuantumThreadCanvas';
import type { MediaInfoResponse, DownloadRequest, JobProgressEvent, DownloadHistoryItem } from './types/media';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e0f12] text-[#e3e2e6] selection:bg-[#1a73e8] selection:text-white px-4 py-12 relative overflow-hidden">
      {/* Whisper-Thin Quantum Thread Network Canvas in Free Space */}
      <QuantumThreadCanvas />
      <main className="w-full max-w-4xl mx-auto space-y-8 z-20 relative my-auto">
        {/* Input Form Section */}
        <div className="space-y-4 text-center">
          <UrlForm onSubmit={handleFetchMediaInfo} isLoading={isLoadingInfo} />
        </div>

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
          <div className="w-full max-w-3xl mx-auto p-4 rounded-2xl bg-[#c4eed0]/15 border border-[#c4eed0]/30 text-[#c4eed0] text-sm font-semibold text-center animate-fade-in shadow-xl font-mono">
            {downloadSuccessMsg}
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
    </div>
  );
};

export default App;
