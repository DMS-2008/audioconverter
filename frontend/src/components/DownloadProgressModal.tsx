import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, Gauge, Clock, X, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { JobProgressEvent } from '../types/media';

interface DownloadProgressModalProps {
  job: JobProgressEvent | null;
  mediaTitle: string;
  onClose: () => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({ job, mediaTitle, onClose }) => {
  if (!job) return null;

  const isCompleted = job.status === 'completed';
  const isError = job.status === 'error';

  useEffect(() => {
    if (isCompleted && job?.download_url) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Automatically trigger direct browser download to user's local machine Downloads folder
      const link = document.createElement('a');
      link.href = job.download_url;
      if (job.filename) {
        link.setAttribute('download', job.filename);
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [isCompleted, job?.download_url]);

  const getStatusText = () => {
    switch (job.status) {
      case 'queued':
        return 'Job queued in server pipeline...';
      case 'downloading':
        return 'Downloading high-speed media stream...';
      case 'processing':
        return 'ffmpeg audio/video transcoding...';
      case 'completed':
        return 'Conversion complete! Downloading directly to your machine...';
      case 'error':
        return 'Download failed.';
      default:
        return 'Processing download...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Header */}
        <div className="space-y-1 text-center">
          <h3 className="text-xl font-extrabold text-white line-clamp-1">
            {mediaTitle}
          </h3>
          <p className="text-xs font-mono text-amber-400">
            JOB ID: {job.job_id.slice(0, 8)}...
          </p>
        </div>

        {/* Animated Visual Progress Bar / Ring */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * (job.progress_percent || 0)) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
                fill="transparent"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Center Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              {isCompleted ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              ) : isError ? (
                <AlertTriangle className="w-12 h-12 text-red-400" />
              ) : (
                <>
                  <span className="text-2xl font-extrabold font-mono text-white">
                    {Math.round(job.progress_percent)}%
                  </span>
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin mt-1" />
                </>
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="text-sm font-semibold text-center text-gray-300">
            {getStatusText()}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <Gauge className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-gray-400 block text-[10px]">SPEED</span>
              <strong className="text-white">{job.speed_str || '--'}</strong>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-gray-400 block text-[10px]">ETA</span>
              <strong className="text-white">{job.eta_str || '--'}</strong>
            </div>
          </div>
        </div>

        {/* Error Message if failed */}
        {isError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
            {job.error_message || 'An error occurred during transcoding.'}
          </div>
        )}

        {/* Automatic Completion Feedback */}
        {isCompleted && (
          <div className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-sm sm:text-base">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>Downloaded directly to your machine!</span>
          </div>
        )}
      </div>
    </div>
  );
};
