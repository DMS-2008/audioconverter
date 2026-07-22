import React, { useEffect, useState } from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#0B0D13] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                V2<span className="text-amber-400">A</span>
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PRO ENGINE
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              High-Speed Video & Audio Transcoder
            </p>
          </div>
        </div>

        {/* Server Status Badge & Features */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Lossless Transcoding</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-white/5 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`}></span>
            <span className={isOnline ? 'text-emerald-400' : 'text-red-400'}>
              {isOnline ? 'SERVER READY' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
