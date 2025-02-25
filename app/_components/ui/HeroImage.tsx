'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface HeroImageProps {
  imageId: string;
  alt: string;
  className?: string;
}

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

export function HeroImage({ imageId, alt, className = '' }: HeroImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImageUrl(): Promise<void> {
      if (!imageId) return;

      setLoading(true);
      
      try {
        // Check if we have a cached URL and if it's still valid
        const cachedData = localStorage.getItem(`hero-image-${imageId}`);
        
        if (cachedData) {
          try {
            const { url, timestamp } = JSON.parse(cachedData);
            const now = new Date().getTime();
            
            // If the cached data is still valid, use it
            if (now - timestamp < CACHE_DURATION) {
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
        const contentType = response.headers.get('content-type');
        
        let url: string;
        if (contentType?.includes('application/json')) {
          const data = await response.json();
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
      } finally {
        setLoading(false);
      }
    }
    
    fetchImageUrl();
  }, [imageId]);

  if (!imageUrl || loading) {
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
