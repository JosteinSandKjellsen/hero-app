'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface HeroImageProps {
  imageId: string;
  alt: string;
  className?: string;
  fallbackImage?: string;
  priority?: boolean;
}

// Default fallback images by gender
const DEFAULT_FALLBACKS = {
  male: '/images/superheroes/blue-man.webp',
  female: '/images/superheroes/blue-woman.webp',
  default: '/images/superheroes/blue-man.webp'
};

export function HeroImage({ 
  imageId, 
  alt, 
  className = '', 
  fallbackImage,
  priority = false
}: HeroImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  // Determine which fallback to use based on alt text or use provided fallback
  const getFallbackImage = (): string => {
    if (fallbackImage) return fallbackImage;
    
    const lowerAlt = alt.toLowerCase();
    if (lowerAlt.includes('female') || lowerAlt.includes('woman') || lowerAlt.includes('girl')) {
      return DEFAULT_FALLBACKS.female;
    } else if (lowerAlt.includes('male') || lowerAlt.includes('man') || lowerAlt.includes('boy')) {
      return DEFAULT_FALLBACKS.male;
    }
    return DEFAULT_FALLBACKS.default;
  };

  useEffect(() => {
    if (!imageId) {
      setError(true);
      return;
    }

    // Always use our proxy endpoint - no need for HEAD request validation
    const proxyUrl = `/api/hero-image/${imageId}`;
    setImageUrl(proxyUrl);
    setLoaded(false); // Reset loaded state when imageId changes
  }, [imageId]);

  // Handle image load error
  const handleImageError = (): void => {
    console.error(`Image failed to load: ${imageUrl}`);
    setError(true);
  };

  const handleImageLoad = (): void => {
    setLoaded(true);
  };

  return (
    <div className="relative w-full h-full">
      <div 
        className={`absolute inset-0 bg-gray-200 rounded-lg transition-opacity duration-300 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {error || !imageUrl ? (
        <Image
          src={getFallbackImage()}
          alt={`${alt} (fallback)`}
          fill
          className={`object-cover object-center ${className}`}
          priority={priority}
          sizes="(max-width: 768px) 90vw, 450px"
          unoptimized
        />
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className={`object-cover object-center transition-opacity duration-300 ${className} ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          priority={priority}
          sizes="(max-width: 768px) 90vw, 450px"
          onError={handleImageError}
          onLoad={handleImageLoad}
          unoptimized
        />
      )}
    </div>
  );
}
