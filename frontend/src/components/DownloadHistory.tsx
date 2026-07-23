import React from 'react';
import { Terminal, Download, Trash2, Video, Music } from 'lucide-react';
import type { DownloadHistoryItem } from '../types/media';

interface DownloadHistoryProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({ history, onClearHistory }) => {
  if (history.length === 0) return null;

  return (
    <div className="studio-card rounded-2xl p-6 border border-[#28292e] space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#28292e] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#a8c7fa]" />
          <h3 className="text-sm font-semibold text-[#e3e2e6]">Recent Executions</h3>
          <span className="text-xs font-mono text-[#a8c7fa] bg-[#1a73e8]/10 px-2.5 py-0.5 rounded-full border border-[#1a73e8]/20 font-medium">
            {history.length}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-[#8e8e99] hover:text-red-400 hover:bg-white/5 px-2.5 py-1 rounded-lg transition-colors font-mono"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Log
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#18191d] border border-[#28292e] hover:border-[#1a73e8]/40 transition-all text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#1a73e8]/15 flex items-center justify-center text-[#a8c7fa] flex-shrink-0 border border-[#1a73e8]/30">
                {item.type === 'video' ? <Video className="w-4 h-4 text-[#a8c7fa]" /> : <Music className="w-4 h-4 text-[#c07efd]" />}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="font-semibold text-[#e3e2e6] truncate max-w-xs sm:max-w-md font-sans">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 text-[#90909a] font-mono text-[11px]">
                  <span className="text-[#a8c7fa] uppercase font-medium">{item.quality}</span>
                  <span>•</span>
                  <span className="uppercase text-[#c07efd]">.{item.ext}</span>
                  <span>•</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>

            <a
              href={item.downloadUrl}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs ml-2 flex-shrink-0 shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
