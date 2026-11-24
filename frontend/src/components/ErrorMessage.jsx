import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry }) => {
  return (
    <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-900 my-4 flex items-start justify-between gap-3 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-rose-800">Error</h4>
          <p className="text-sm text-rose-700 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
