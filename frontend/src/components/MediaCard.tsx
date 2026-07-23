import React from 'react';
import { Clock, User, Globe, Film, CheckCircle2 } from 'lucide-react';
import type { MediaInfoResponse } from '../types/media';

interface MediaCardProps {
  media: MediaInfoResponse;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  return (
    <div className="studio-card rounded-2xl p-5 border border-[#28292e] shadow-2xl relative overflow-hidden group">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Thumbnail preview */}
        <div className="relative w-full md:w-64 h-40 rounded-xl overflow-hidden bg-[#0e0f12] flex-shrink-0 border border-[#28292e] shadow-md">
          {media.thumbnail ? (
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8e8e99]">
              <Film className="w-12 h-12" />
            </div>
          )}

          {/* Duration overlay badge */}
          <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-[#0e0f12]/90 backdrop-blur-md rounded-md text-xs font-mono text-[#a8c7fa] flex items-center gap-1 border border-white/10 shadow">
            <Clock className="w-3 h-3 text-[#a8c7fa]" />
            <span>{media.duration_formatted}</span>
          </div>

          {/* Platform name tag */}
          <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-[#1a73e8] text-white font-medium rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Globe className="w-3 h-3 text-white" />
            <span>{media.site_name}</span>
          </div>
        </div>

        {/* Video metadata information */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold text-[#c4eed0] bg-[#c4eed0]/10 border border-[#c4eed0]/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#c4eed0]" />
              Format Inspection Ready
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-[#e3e2e6] leading-snug line-clamp-2">
            {media.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#90909a] pt-2 border-t border-[#28292e] font-mono">
            <div className="flex items-center gap-1.5 text-[#a8c7fa] font-medium">
              <User className="w-3.5 h-3.5 text-[#a8c7fa]" />
              <span>Channel: {media.author}</span>
            </div>

            <div className="flex items-center gap-1 text-[#c07efd]">
              <Clock className="w-3.5 h-3.5 text-[#c07efd]" />
              <span>Duration: {media.duration_formatted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
