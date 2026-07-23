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
    <div className="studio-card rounded-2xl p-6 border border-[#28292e] space-y-6 shadow-2xl">
      {/* Mode Selector Tabs (Video vs Audio) */}
      <div className="flex items-center justify-between border-b border-[#28292e] pb-4">
        <div className="flex items-center gap-1.5 bg-[#0e0f12] p-1.5 rounded-xl border border-[#28292e]">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-[#1a73e8] text-white shadow-md shadow-[#1a73e8]/30 font-semibold'
                : 'text-[#90909a] hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="w-4 h-4 text-current" />
            <span>Video Output</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'audio'
                ? 'bg-[#1a73e8] text-white shadow-md shadow-[#1a73e8]/30 font-semibold'
                : 'text-[#90909a] hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4 text-current" />
            <span>Audio Conversion</span>
          </button>
        </div>

        <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#a8c7fa] font-mono bg-[#1a73e8]/10 border border-[#1a73e8]/20 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-[#a8c7fa]" />
          Model Parameters
        </span>
      </div>

      {/* VIDEO TAB CONTENT */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-medium text-[#8e8e99] uppercase tracking-wider">
              Select Output Resolution
            </h3>
            <span className="text-xs text-[#8e8e99] font-mono">
              Container: <strong className="text-[#a8c7fa]">{selectedVideo?.ext.toUpperCase() || 'MP4'}</strong>
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
                      ? 'bg-[#1a73e8]/15 border-[#1a73e8] shadow-[0_0_20px_rgba(26,115,232,0.2)]'
                      : 'bg-[#18191d] border-[#28292e] hover:border-white/20 hover:bg-[#1e1f24]'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-[#a8c7fa]" />
                  )}
                  <div className="text-base font-bold text-[#e3e2e6] flex items-center gap-2">
                    <span>{option.resolution}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-[#8e8e99] font-mono">
                    <span className="uppercase text-[#a8c7fa] font-semibold">{option.ext}</span>
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
            <h3 className="text-xs font-mono font-medium text-[#8e8e99] uppercase tracking-wider">
              1. Audio Extension Format
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['mp3', 'm4a', 'opus'] as const).map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() => setSelectedAudioExt(ext)}
                  className={`py-2.5 px-4 rounded-xl font-mono text-sm font-semibold uppercase border transition-all text-center ${
                    selectedAudioExt === ext
                      ? 'bg-[#1a73e8] text-white border-[#1a73e8] shadow-md shadow-[#1a73e8]/30'
                      : 'bg-[#18191d] border-[#28292e] text-[#90909a] hover:bg-[#1e1f24] hover:text-white'
                  }`}
                >
                  .{ext}
                </button>
              ))}
            </div>
          </div>

          {/* Bitrate quality selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-medium text-[#8e8e99] uppercase tracking-wider">
              2. Target Bitrate Quality
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { abr: 320, label: '320 kbps (Lossless Master)' },
                { abr: 192, label: '192 kbps (Standard High)' },
                { abr: 128, label: '128 kbps (Compact Audio)' },
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
                        ? 'bg-[#1a73e8]/15 border-[#1a73e8] shadow-[0_0_20px_rgba(26,115,232,0.2)]'
                        : 'bg-[#18191d] border-[#28292e] hover:border-white/20 hover:bg-[#1e1f24]'
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-[#a8c7fa]" />
                    )}
                    <div className="text-sm font-bold text-[#e3e2e6]">{abr} kbps</div>
                    <div className="text-xs text-[#8e8e99] mt-1 font-sans">{label}</div>
                    <div className="text-[11px] font-mono text-[#a8c7fa] mt-2">
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
        <div className="space-y-2.5 p-4 rounded-xl bg-[#0e0f12] border border-[#1a73e8]/40 text-[#e3e2e6] animate-fade-in font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="flex items-center gap-2 text-[#a8c7fa]">
              <Loader2 className="w-4 h-4 animate-spin text-[#a8c7fa]" />
              <span>Generating & Encoding Media Stream...</span>
            </span>
            <span className="text-[#a8c7fa] text-base font-extrabold font-mono">
              {currentJob ? Math.round(currentJob.progress_percent || 0) : 0}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 bg-[#18191d] rounded-full overflow-hidden border border-[#28292e] p-0.5">
            <div
              className="h-full gemini-gradient-bg rounded-full transition-all duration-300 shadow-md shadow-[#1a73e8]/40"
              style={{ width: `${Math.min(100, Math.max(0, currentJob?.progress_percent || 0))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8e8e99] pt-0.5">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#a8c7fa]" />
              SPEED: <strong className="text-[#e3e2e6]">{currentJob?.speed_str || 'Calculating...'}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#c4eed0]" />
              ETA: <strong className="text-[#e3e2e6]">{currentJob?.eta_str || 'Calculating...'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Download Trigger Button */}
      <div className="pt-2 border-t border-[#28292e] flex items-center justify-between gap-4">
        <div className="text-xs text-[#8e8e99] flex items-center gap-1.5 font-mono">
          <HardDrive className="w-4 h-4 text-[#a8c7fa]" />
          <span>
            Selected Output:{' '}
            <strong className="text-[#e3e2e6] font-sans font-semibold">
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
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-sm md:text-base shadow-xl shadow-[#1a73e8]/30 hover:opacity-95 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Generating ({currentJob ? Math.round(currentJob.progress_percent || 0) : 0}%)</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 text-white" />
              <span>Generate & Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
