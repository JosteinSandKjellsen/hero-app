'use client';

import { CameraCapture } from './CameraCapture';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTranslations } from 'next-intl';

interface CameraSectionProps {
  onPhotoTaken: (photoUrl: string | null) => void;
  isGenerating?: boolean;
}

export function CameraSection({ onPhotoTaken, isGenerating = false }: CameraSectionProps): JSX.Element {
  const t = useTranslations();
  return (
    <div className="bg-white/5 rounded-lg border border-white/20 w-full max-w-2xl mx-auto p-4 md:p-8">
      {isGenerating ? (
        <div className="h-[60vh] md:h-[70vh] flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-6 text-center text-base md:text-lg">
            {t('camera.generating.status')}
          </p>
          <p className="text-white/70 text-xs md:text-sm mt-2 text-center">
            {t('camera.generating.timeEstimate')}
          </p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {t('camera.title')}
            </h2>
            <p className="text-white/90 text-sm md:text-base mt-2">
              {t('camera.subtitle')}
            </p>
          </div>
          <CameraCapture onPhotoTaken={onPhotoTaken} isGenerating={isGenerating} />
        </div>
      )}
    </div>
  );
}
