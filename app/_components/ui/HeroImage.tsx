'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface HeroImageProps {
  imageId: string;
  alt: string;
  className?: string;
  fallbackImage?: string;
}

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

// Default fallback images by gender
const DEFAULT_FALLBACKS = {
  male: '/images/superheroes/blue-man.jpeg',
  female: '/images/superheroes/blue-woman.jpeg',
  default: '/images/superheroes/blue-man.jpeg'
};

export function HeroImage({ 
  imageId, 
  alt, 
  className = '', 
  fallbackImage
}: HeroImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  // Determine which fallback to use based on alt text or use provided fallback
  const getFallbackImage = () => {
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
        // Check if we have a cached URL and if it's still valid
        const cachedData = localStorage.getItem(`hero-image-${imageId}`);
        
        if (cachedData) {
          try {
            const { url, timestamp } = JSON.parse(cachedData);
            const now = new Date().getTime();
            
            // If the cached data is still valid, use it
            if (now - timestamp < CACHE_DURATION && url) {
              setImageUrl(url);
              setLoading(false);
              
              // Verify the cached URL still works with a HEAD request
              fetch(url, { method: 'HEAD' })
                .then(response => {
                  if (!response.ok) {
                    console.warn('Cached image URL is no longer valid:', url);
                    localStorage.removeItem(`hero-image-${imageId}`);
                    fetchImageUrl(); // Retry fetch
                  }
                })
                .catch(() => {
                  // Don't take any action here - the image might still load
                });
                
              return;
            }
          } catch (e) {
            // If parsing fails, proceed to fetch fresh data
            console.error('Error parsing cached image data:', e);
          }
        }
        
        // If no valid cache exists, fetch the image URL
        const response = await fetch(`/api/hero-image/${imageId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error fetching hero image:', errorData);
          throw new Error('Failed to fetch image data');
        }
        
        const contentType = response.headers.get('content-type');
        
        let url: string;
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          
          if (!data.url) {
            throw new Error('No URL in response');
          }
          
          url = data.url;
        } else {
          // If not JSON, use the proxied endpoint (development)
          url = `/api/hero-image/${imageId}`;
        }
        
        // Cache the URL with current timestamp
        try {
          localStorage.setItem(
            `hero-image-${imageId}`, 
            JSON.stringify({ 
              url, 
              timestamp: new Date().getTime() 
            })
          );
        } catch (e) {
          // Handle storage errors (Safari private mode, quota exceeded, etc.)
          console.warn('Could not cache image URL in localStorage:', e);
          
          // Try to clear old cache entries if quota exceeded
          if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            // Simple cleanup: remove oldest cached items
            try {
              const keysToRemove = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('hero-image-')) {
                  keysToRemove.push(key);
                }
              }
              
              // Sort by timestamp (oldest first) and remove half of them
              const itemsToRemove = keysToRemove
                .map(key => {
                  try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    return { key, timestamp: data.timestamp || 0 };
                  } catch {
                    return { key, timestamp: 0 };
                  }
                })
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(0, Math.ceil(keysToRemove.length / 2));
              
              itemsToRemove.forEach(item => localStorage.removeItem(item.key));
            } catch (cleanupError) {
              console.error('Failed to clean localStorage cache:', cleanupError);
            }
          }
        }
        
        setImageUrl(url);
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
  const handleImageError = () => {
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
        className={`object-cover ${className}`}
        priority
        sizes="300px"
      />
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
      onError={handleImageError}
    />
  );
}
