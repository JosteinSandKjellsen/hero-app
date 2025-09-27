'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { HeroImage } from '../ui/HeroImage';

interface ImagePreviewProps {
  imageUrl: string;
  onAccept: () => void;
  onRetry: () => void;
  retriesLeft: number;
  isRetrying?: boolean;
  isAccepting?: boolean;
}

export function ImagePreview({ 
  imageUrl, 
  onAccept, 
  onRetry, 
  retriesLeft,
  isRetrying = false,
  isAccepting = false
}: ImagePreviewProps): JSX.Element {
  const t = useTranslations('imagePreview');

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 border border-white/20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t('title')}</h2>
        <p className="text-white/80">{t('subtitle')}</p>
      </div>
      
      {/* Hero Card Preview - Same styling as results page but without header and stats */}
      <div className="mb-8 flex justify-center">
        <div
          className="rounded-xl bg-white shadow-2xl"
          style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto'
          }}
        >
          <div className="relative aspect-[3/4]">
            <div className="relative w-full h-full bg-gray-100/50 rounded-xl overflow-hidden">
              {imageUrl.includes('cdn.leonardo.ai') ? (
                <HeroImage
                  imageId={imageUrl.match(/generations\/([^/]+)/)?.[1] || ''}
                  alt="Generated hero image"
                  className="rounded-xl"
                  priority={true}
                  quality={95}
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt="Generated hero image"
                  className="object-cover object-top rounded-xl"
                  fill
                  sizes="400px"
                  priority={true}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onAccept}
          className="text-light py-3 px-8 rounded-lg transition-all duration-300 
                    bg-gradient-to-r from-green-600 to-green-700 bg-[length:200%_100%] bg-[position:0%]
                    hover:bg-[position:100%] font-medium shadow-lg hover:shadow-xl 
                    transform hover:-translate-y-0.5 flex items-center justify-center space-x-2
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={isRetrying || isAccepting}
          aria-label={t('accept')}
        >
          <span>{isAccepting ? 'Saving...' : t('accept')}</span>
        </button>
        
        {retriesLeft > 0 && (
          <button
            onClick={onRetry}
            className="text-light py-3 px-8 rounded-lg transition-all duration-300 
                      bg-gradient-to-r from-dark to-dark bg-[length:200%_100%] bg-[position:0%] 
                      hover:bg-[position:100%] border border-white/30
                      font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                      flex items-center justify-center space-x-2
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={isRetrying || isAccepting}
            aria-label={isRetrying ? t('generating') : `${t('retry')} (${retriesLeft} ${t('retriesLeft')})`}
          >
            {isRetrying ? (
              <span>{t('generating')}</span>
            ) : (
              <span>{t('retry')} ({retriesLeft} {t('retriesLeft')})</span>
            )}
          </button>
        )}
      </div>
      
      {retriesLeft === 0 && (
        <p className="text-center text-white/60 text-sm mt-4">
          {t('noRetriesLeft')}
        </p>
      )}
    </div>
  );
}