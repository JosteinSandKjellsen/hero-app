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
    <div className="text-center p-8 bg-red-50/10 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
      <p className="text-red-300 mb-6 text-lg">{error}</p>
      <button
        onClick={onRetry}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 
                   transition-colors flex items-center justify-center gap-2 mx-auto"
      >
        <RefreshCw className="w-5 h-5" />
        <span>{t('camera.retry')}</span>
      </button>
    </div>
  );
}
