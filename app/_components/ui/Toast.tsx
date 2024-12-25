'use client';

import { AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps): JSX.Element {
  return (
    <div className="fixed top-4 right-4 z-50 animate-fadeIn">
      <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg shadow-lg border border-red-200 max-w-md flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-medium mb-1">Feil ved generering av heltenavn</p>
          <p className="text-red-600">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
