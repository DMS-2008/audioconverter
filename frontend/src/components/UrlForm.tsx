import React, { useState } from 'react';
import { Sparkles, Clipboard, Loader2, XCircle, Play } from 'lucide-react';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const SAMPLE_URLS = [
  { label: 'YouTube 4K Demo', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { label: 'Vimeo Audio Stream', url: 'https://vimeo.com/76979871' },
];

export const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Please enter or paste a valid video URL.');
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
      setErrorMsg('Failed to read clipboard.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative group transition-all duration-300">
        {/* Ambient Gradient Glow - Active ONLY when mouse pointer enters section */}
        <div className="absolute -inset-1 gemini-gradient-bg rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none"></div>

        <div className="relative flex items-center bg-[#18191d] border border-[#28292e] group-hover:border-[#a8c7fa]/50 rounded-2xl p-2.5 shadow-2xl prompt-input-glow transition-all duration-300 transform group-hover:-translate-y-0.5">
          <div className="pl-3 pr-2 text-[#a8c7fa]">
            <Sparkles className="w-5 h-5 text-[#a8c7fa]" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Enter YouTube, Vimeo, or video URL to process..."
            className="w-full bg-transparent text-[#e3e2e6] placeholder-[#8e8e99] text-sm sm:text-base px-2 py-2 focus:outline-none font-sans font-medium"
            disabled={isLoading}
          />

          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="p-2 text-[#8e8e99] hover:text-[#e3e2e6] transition-colors"
              title="Clear input"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={handlePaste}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#d3e3fd] bg-[#28292e] hover:bg-[#383940] rounded-xl border border-white/5 transition-colors mr-2 font-mono"
          >
            <Clipboard className="w-3.5 h-3.5 text-[#a8c7fa]" />
            Paste
          </button>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl gemini-gradient-bg hover:brightness-110 text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#1a73e8]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white fill-white" />
                <span>Run / Extract</span>
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
      <div className="flex items-center justify-between px-2 pt-1 text-xs text-[#90909a]">
        <span className="flex items-center gap-1.5 text-[#8e8e99] font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#a8c7fa]" />
          Example Prompts:
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
              className="text-[#a8c7fa] hover:text-white font-medium hover:bg-[#1a73e8]/15 px-2.5 py-1 rounded-lg transition-colors border border-[#1a73e8]/20"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
