'use client';

import { RotateCcw, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PhotoPreviewProps {
  photoUrl: string;
  onRetake: () => void;
  onUsePhoto: () => void;
}

export function PhotoPreview({ photoUrl, onRetake, onUsePhoto }: PhotoPreviewProps): JSX.Element {
  const t = useTranslations();

  return (
    <div className="relative max-w-md mx-auto h-[70vh]">
      <div className="relative h-full">
        {/* Using img instead of Next.js Image since this is a data URL from canvas */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt="Captured photo preview"
          className="w-full h-full object-cover rounded-lg border border-white/20 bg-white/5 shadow-xl"
        />
        
        <div className="absolute inset-x-4 bottom-4 flex justify-center space-x-4">
          <button
            onClick={onRetake}
            className="bg-white/20 backdrop-blur-lg text-white py-3 px-6 rounded-lg 
                     hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl 
                     transform hover:-translate-y-0.5 flex items-center space-x-2 font-medium
                     focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label={t('camera.preview.retake')}
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t('camera.preview.retake')}</span>
          </button>
          
          <button
            onClick={onUsePhoto}
            className="text-light py-3 px-6 rounded-lg transition-all duration-300 
                      bg-gradient-to-r from-dark to-dark bg-[length:200%_100%] bg-[position:0%]
                      hover:bg-[position:100%] font-medium shadow-lg hover:shadow-xl 
                      transform hover:-translate-y-0.5 flex items-center space-x-2
                      focus:outline-none focus:ring-2 focus:ring-dark/30"
            aria-label={t('camera.preview.usePhoto')}
          >
            <Check className="w-5 h-5" />
            <span>{t('camera.preview.usePhoto')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}