import React, { useState } from 'react';
import { Video, Music, Download, CheckCircle2, Sparkles, HardDrive, Loader2, Gauge, Clock } from 'lucide-react';
import type { MediaInfoResponse, FormatVideoOption, FormatAudioOption, DownloadRequest, JobProgressEvent } from '../types/media';

interface FormatPickerProps {
  media: MediaInfoResponse;
  onStartDownload: (req: DownloadRequest) => void;
  isDownloading: boolean;
  currentJob: JobProgressEvent | null;
}

export const FormatPicker: React.FC<FormatPickerProps> = ({ media, onStartDownload, isDownloading, currentJob }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  
  // Selected Video state
  const [selectedVideo, setSelectedVideo] = useState<FormatVideoOption | null>(
    media.video_options.length > 0 ? media.video_options[0] : null
  );

  // Selected Audio state
  const [selectedAudioExt, setSelectedAudioExt] = useState<'mp3' | 'm4a' | 'opus'>('mp3');
  const [selectedAudioOption, setSelectedAudioOption] = useState<FormatAudioOption>(
    media.audio_options.find(a => a.ext === 'mp3' && a.abr_kbps === 320) || media.audio_options[0]
  );

  const handleDownloadTrigger = () => {
    if (activeTab === 'video') {
      if (!selectedVideo) return;
      onStartDownload({
        url: media.url,
        type: 'video',
        format_id: selectedVideo.format_id,
        target_quality: selectedVideo.resolution,
        target_ext: selectedVideo.ext,
      });
    } else {
      onStartDownload({
        url: media.url,
        type: 'audio',
        target_quality: `${selectedAudioOption.abr_kbps}kbps`,
        target_ext: selectedAudioExt,
      });
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6 shadow-2xl">
      {/* Mode Selector Tabs (Video vs Audio) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 bg-[#0B0D13] p-1.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Resolution</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
              activeTab === 'audio'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Audio Conversion</span>
          </button>
        </div>

        <span className="hidden sm:flex items-center gap-1 text-xs text-amber-400/90 font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          Tactile Format Selector
        </span>
      </div>

      {/* VIDEO TAB CONTENT */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Select Video Resolution
            </h3>
            <span className="text-xs text-gray-400">
              Format: <strong className="text-white font-mono">{selectedVideo?.ext.toUpperCase() || 'MP4'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {media.video_options.map((option) => {
              const isSelected = selectedVideo?.height === option.height;
              return (
                <button
                  key={option.height}
                  type="button"
                  onClick={() => setSelectedVideo(option)}
                  className={`relative p-4 rounded-xl text-left border transition-all transform active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 glow-amber'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-amber-400" />
                  )}
                  <div className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{option.resolution}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400 font-mono">
                    <span className="uppercase text-amber-400/80 font-bold">{option.ext}</span>
                    <span>
                      {option.filesize_approx_mb ? `~${option.filesize_approx_mb} MB` : 'Auto-size'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AUDIO TAB CONTENT */}
      {activeTab === 'audio' && (
        <div className="space-y-5">
          {/* Format extension selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              1. Audio Output Format
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['mp3', 'm4a', 'opus'] as const).map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() => setSelectedAudioExt(ext)}
                  className={`py-3 px-4 rounded-xl font-mono text-sm font-bold uppercase border transition-all text-center ${
                    selectedAudioExt === ext
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  .{ext}
                </button>
              ))}
            </div>
          </div>

          {/* Bitrate quality selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              2. Audio Bitrate Quality
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { abr: 320, label: '320 kbps (High Quality)' },
                { abr: 192, label: '192 kbps (Medium Quality)' },
                { abr: 128, label: '128 kbps (Standard)' },
              ].map(({ abr, label }) => {
                const isSelected = selectedAudioOption.abr_kbps === abr;
                const matchOpt = media.audio_options.find(a => a.abr_kbps === abr) || selectedAudioOption;
                return (
                  <button
                    key={abr}
                    type="button"
                    onClick={() => setSelectedAudioOption(matchOpt)}
                    className={`relative p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 glow-amber'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-amber-400" />
                    )}
                    <div className="text-sm font-bold text-white">{abr} kbps</div>
                    <div className="text-xs text-gray-400 mt-1">{label}</div>
                    <div className="text-[11px] font-mono text-amber-400/80 mt-2">
                      {matchOpt.filesize_approx_mb ? `~${matchOpt.filesize_approx_mb} MB` : 'Auto-size'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIVE PROGRESS BAR DISPLAY WHILE DOWNLOADING */}
      {isDownloading && (
        <div className="space-y-2.5 p-4 rounded-xl bg-[#0B0D13] border border-amber-500/30 text-white animate-fade-in font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <span className="flex items-center gap-2 text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Downloading & Converting Media...</span>
            </span>
            <span className="text-amber-400 text-base font-extrabold">
              {currentJob ? Math.round(currentJob.progress_percent || 0) : 0}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-300 shadow-md shadow-amber-500/30"
              style={{ width: `${Math.min(100, Math.max(0, currentJob?.progress_percent || 0))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              SPEED: <strong className="text-white">{currentJob?.speed_str || 'Calculating...'}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              ETA: <strong className="text-white">{currentJob?.eta_str || 'Calculating...'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Download Trigger Button */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4">
        <div className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>
            Selected Target:{' '}
            <strong className="text-white font-sans font-bold">
              {activeTab === 'video'
                ? `${selectedVideo?.resolution} (${selectedVideo?.ext.toUpperCase()})`
                : `${selectedAudioOption.abr_kbps}kbps .${selectedAudioExt.toUpperCase()}`}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={handleDownloadTrigger}
          disabled={isDownloading}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-extrabold text-sm md:text-base shadow-xl shadow-amber-500/20 hover:opacity-95 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              <span>Downloading ({currentJob ? Math.round(currentJob.progress_percent || 0) : 0}%)</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Start Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
