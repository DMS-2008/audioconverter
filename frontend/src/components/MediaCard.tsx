import React from 'react';
import { Clock, User, Globe, Film } from 'lucide-react';
import type { MediaInfoResponse } from '../types/media';

interface MediaCardProps {
  media: MediaInfoResponse;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden group">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Thumbnail preview with hover zoom */}
        <div className="relative w-full md:w-64 h-40 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5 shadow-md">
          {media.thumbnail ? (
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <Film className="w-12 h-12" />
            </div>
          )}

          {/* Duration overlay badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-md text-xs font-mono text-white flex items-center gap-1 border border-white/10">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{media.duration_formatted}</span>
          </div>

          {/* Site name tag */}
          <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-amber-500/90 text-slate-950 font-bold rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 shadow">
            <Globe className="w-3 h-3" />
            <span>{media.site_name}</span>
          </div>
        </div>

        {/* Video metadata information */}
        <div className="flex-1 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-2">
            {media.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <User className="w-4 h-4 text-amber-400" />
              <span>{media.author}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Duration: {media.duration_formatted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
