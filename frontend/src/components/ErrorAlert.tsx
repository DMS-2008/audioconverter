import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-[#e3e2e6] space-y-3 animate-fade-in shadow-2xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <h4 className="font-semibold text-sm text-red-400 uppercase tracking-wider">Extraction Failed</h4>
          <p className="text-xs leading-relaxed text-[#90909a] font-mono">{message}</p>
        </div>
      </div>

      {onRetry && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium text-red-300 border border-red-500/30 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
