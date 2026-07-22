import React, { useState } from 'react';
import { Link2, Clipboard, ArrowRight, Loader2, Sparkles, XCircle } from 'lucide-react';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const SAMPLE_URLS = [
  { label: 'YouTube Sample', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { label: 'Vimeo Sample', url: 'https://vimeo.com/76979871' },
];

export const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Please paste or enter a video URL first.');
      return;
    }
    setErrorMsg('');
    onSubmit(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setErrorMsg('');
      }
    } catch {
      setErrorMsg('Failed to read clipboard. Please paste manually.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Glow backdrop */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-emerald-500/30 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>

        <div className="relative flex items-center bg-[#131722] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-amber-500/60 transition-all">
          <div className="pl-3 pr-2 text-gray-400">
            <Link2 className="w-6 h-6 text-amber-400" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Paste YouTube, Vimeo or Web Video URL here..."
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm sm:text-base px-2 py-3 focus:outline-none"
            disabled={isLoading}
          />

          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Clear input"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={handlePaste}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors mr-2"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste
          </button>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <span>Extract Formats</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {errorMsg && (
        <p className="text-xs text-red-400 font-medium pl-3 animate-fade-in flex items-center gap-1">
          <span>⚠️</span> {errorMsg}
        </p>
      )}

      {/* Quick Presets */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs text-gray-400">
        <span className="flex items-center gap-1 text-gray-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Test URLs:
        </span>
        <div className="flex items-center gap-2">
          {SAMPLE_URLS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                onSubmit(sample.url);
              }}
              className="text-amber-400/80 hover:text-amber-300 underline underline-offset-2 hover:bg-amber-400/10 px-2 py-0.5 rounded transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
