'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface HeroImageProps {
  imageId: string;
  alt: string;
  className?: string;
}

export function HeroImage({ imageId, alt, className = '' }: HeroImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    async function fetchImageUrl(): Promise<void> {
      if (!imageId) return;
      try {
        // Try to get JSON response first (production)
        const response = await fetch(`/api/hero-image/${imageId}`);
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          setImageUrl(data.url);
        } else {
          // If not JSON, use the proxied endpoint (development)
          setImageUrl(`/api/hero-image/${imageId}`);
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
      }
    }
    fetchImageUrl();
  }, [imageId]);

  if (!imageUrl) {
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      priority
      sizes="300px"
    />
  );
}
