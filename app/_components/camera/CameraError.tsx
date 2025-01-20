'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CameraErrorProps {
  error: string;
  onRetry: () => void;
}

export function CameraError({ error, onRetry }: CameraErrorProps): JSX.Element {
  const t = useTranslations();
  return (
    <div className="text-center p-8 bg-white/20 backdrop-blur-lg rounded-lg border border-white/20 shadow-2xl">
      <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
      <p className="text-red-300 mb-6 text-lg">{error}</p>
      <button
        onClick={onRetry}
        className="text-light px-6 py-3 rounded-lg transition-all duration-300 
                  bg-gradient-to-r from-dark to-dark bg-[length:200%_100%] bg-[position:0%]
                  hover:bg-[position:100%]
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center justify-center gap-2 mx-auto"
      >
        <RefreshCw className="w-5 h-5" />
        <span>{t('camera.retry')}</span>
      </button>
    </div>
  );
}
