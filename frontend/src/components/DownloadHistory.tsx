import { History, Download, Trash2, Video, Music } from 'lucide-react';
import type { DownloadHistoryItem } from '../types/media';

interface DownloadHistoryProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({ history, onClearHistory }) => {
  if (history.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-extrabold text-white">Session Download History</h3>
          <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            {history.length}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 hover:bg-white/5 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                {item.type === 'video' ? <Video className="w-4 h-4" /> : <Music className="w-4 h-4" />}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="font-bold text-white truncate max-w-xs sm:max-w-md">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 text-gray-400 font-mono text-[11px]">
                  <span className="text-amber-400 uppercase font-semibold">{item.quality}</span>
                  <span>•</span>
                  <span className="uppercase">.{item.ext}</span>
                  <span>•</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>

            <a
              href={item.downloadUrl}
              download
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-medium transition-colors ml-2 flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
