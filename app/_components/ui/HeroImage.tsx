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
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function fetchImageUrl(): Promise<void> {
      if (!imageId) {
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);
      
      try {
        // Always use our proxy endpoint - no caching of CDN URLs
        const proxyUrl = `/api/hero-image/${imageId}`;
        setImageUrl(proxyUrl);
        
        // Test if proxy is accessible
        const response = await fetch(proxyUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error('Failed to fetch image data');
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchImageUrl();
  }, [imageId]);

  // Handle image load error
  const handleImageError = (): void => {
    console.error(`Image failed to load: ${imageUrl}`);
    setError(true);
    
    // Remove from cache if it failed
    try {
      localStorage.removeItem(`hero-image-${imageId}`);
    } catch (e) {
      console.error('Failed to remove bad image from cache:', e);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  if (error || !imageUrl) {
    return (
      <Image
        src={getFallbackImage()}
        alt={`${alt} (fallback)`}
        fill
        className={`object-cover object-center ${className}`}
        priority={priority}
        sizes="(max-width: 768px) 90vw, 450px"
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className={`object-cover object-center ${className}`}
      priority={priority}
        sizes="(max-width: 768px) 90vw, 450px"
      onError={handleImageError}
    />
  );
}
