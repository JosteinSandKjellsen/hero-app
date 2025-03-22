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

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

// Memory cache for URLs to avoid localStorage reads
const urlMemoryCache = new Map<string, { url: string; timestamp: number }>();

// Cache validation interval (10 minutes) - only validate cached URLs every 10 minutes
const VALIDATION_INTERVAL = 10 * 60 * 1000;

// Keep track of last validation time for each URL
const lastValidationTime = new Map<string, number>();

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
        const now = new Date().getTime();
        
        // First check memory cache
        const memoryCached = urlMemoryCache.get(`hero-image-${imageId}`);
        if (memoryCached && now - memoryCached.timestamp < CACHE_DURATION) {
          setImageUrl(memoryCached.url);
          setLoading(false);
          
          // Only validate if enough time has passed since last validation
          const lastValidated = lastValidationTime.get(memoryCached.url) || 0;
          if (now - lastValidated > VALIDATION_INTERVAL) {
            lastValidationTime.set(memoryCached.url, now);
            
            // For proxied images, no need to validate with HEAD request
            if (!memoryCached.url.startsWith('/api/')) {
              // Validate URL in background
              fetch(memoryCached.url, { method: 'HEAD' })
                .then(response => {
                  if (!response.ok) {
                    console.warn('Cached image URL is no longer valid:', memoryCached.url);
                    urlMemoryCache.delete(`hero-image-${imageId}`);
                    localStorage.removeItem(`hero-image-${imageId}`);
                    fetchImageUrl(); // Retry fetch
                  }
                })
                .catch(() => {
                  // Don't take any action here - the image might still load
                });
            }
          }
          
          return;
        }
        
        // Check localStorage if not in memory cache
        const cachedData = localStorage.getItem(`hero-image-${imageId}`);
        
        if (cachedData) {
          try {
            const { url, timestamp } = JSON.parse(cachedData);
            
            // If the cached data is still valid, use it and update memory cache
            if (now - timestamp < CACHE_DURATION && url) {
              urlMemoryCache.set(`hero-image-${imageId}`, { url, timestamp });
              setImageUrl(url);
              setLoading(false);
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
          const cacheData = { 
            url, 
            timestamp: new Date().getTime() 
          };
          
          // Update both caches
          urlMemoryCache.set(`hero-image-${imageId}`, cacheData);
          localStorage.setItem(
            `hero-image-${imageId}`, 
            JSON.stringify(cacheData)
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
