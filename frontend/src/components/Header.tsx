import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setIsOnline(true);
        else setIsOnline(false);
      } catch {
        setIsOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#28292e] bg-[#0e0f12]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gemini-gradient-bg p-0.5 shadow-lg shadow-[#1a73e8]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#18191d] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#a8c7fa] animate-spark" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-[#e3e2e6] flex items-center gap-1.5">
                <span>V2A</span>
                <span className="gemini-gradient-text text-sm font-semibold">Studio</span>
              </h1>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#1a73e8]/15 text-[#a8c7fa] border border-[#1a73e8]/30">
                v2.4 Media AI
              </span>
            </div>
            <p className="text-[11px] text-[#90909a] hidden sm:block font-mono">
              High-Speed Media Extraction & Audio Transcoding
            </p>
          </div>
        </div>

        {/* Server Pipeline Status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-[#90909a] bg-[#1e1f24] px-3 py-1.5 rounded-full border border-[#28292e]">
            <Cpu className="w-3.5 h-3.5 text-[#a8c7fa]" />
            <span>FastAPI • yt-dlp • FFmpeg</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-[#18191d] border border-[#28292e]">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#c4eed0] shadow-[0_0_8px_#c4eed0] animate-ping' : 'bg-red-500'}`}></span>
            <span className={isOnline ? 'text-[#c4eed0] font-semibold' : 'text-red-400'}>
              {isOnline ? 'Pipeline Active' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
