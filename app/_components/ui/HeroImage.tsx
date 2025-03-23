'use client';

import { useState } from 'react';
import Image from 'next/image';

interface HeroImageProps {
  imageId: string;
  alt: string;
  className?: string;
  fallbackImage?: string;
  priority?: boolean;
  quality?: number;
}

// Default fallback images by gender
const DEFAULT_FALLBACKS = {
  male: '/images/superheroes/blue-man.webp',
  female: '/images/superheroes/blue-woman.webp',
  default: '/images/superheroes/blue-man.webp'
};

// Generate the tiny placeholder URL
const getPlaceholderUrl = (imageId: string): string => {
  return `/api/hero-image/${imageId}?w=20&q=10&blur=true`;
};

export function HeroImage({ 
  imageId, 
  alt, 
  className = '', 
  fallbackImage,
  priority = false,
  quality = 90
}: HeroImageProps): JSX.Element {
  const [error, setError] = useState<boolean>(false);

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

  const imageUrl = imageId ? `/api/hero-image/${imageId}?q=${quality}` : '';

  // Handle image load error
  const handleImageError = (): void => {
    console.error(`Image failed to load: ${imageUrl}`);
    setError(true);
  };

  return (
    <div className="relative w-full h-full">
      {(error || !imageId) ? (
        <Image
          src={getFallbackImage()}
          alt={`${alt} (fallback)`}
          fill
          className={`object-cover object-center rounded-lg ${className}`}
          priority={priority}
          sizes="(max-width: 768px) 90vw, 450px"
          unoptimized
        />
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          placeholder="blur"
          blurDataURL={getPlaceholderUrl(imageId)}
          className={`object-cover object-center rounded-lg ${className}`}
          priority={priority}
          sizes="(max-width: 768px) 90vw, 450px"
          onError={handleImageError}
          unoptimized
        />
      )}
    </div>
  );
}
