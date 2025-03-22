import { useState, useEffect, useRef } from 'react';

export function useImagePreloader(imageUrls: string[]): boolean {
  const [loadedUrls] = useState(() => new Set<string>());
  const [isLoading, setIsLoading] = useState(true);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    // Compare arrays to see if we need to reload
    const hasNewUrls = imageUrls.some(url => !loadedUrls.has(url));
    if (!hasNewUrls && urlsRef.current.length === imageUrls.length) {
      setIsLoading(false);
      return;
    }

    urlsRef.current = imageUrls;
    
    if (!imageUrls.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const preloadImage = async (url: string): Promise<void> => {
      if (loadedUrls.has(url)) return;

      try {
        // Use requestAnimationFrame to spread out image loading
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loadedUrls.add(url);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
            resolve(); // Still resolve to continue loading others
          };
          img.crossOrigin = 'anonymous';
          img.src = url;
        });
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error(`Failed to load image: ${url}`, error);
        }
      }
    };

    // Load images in sequence to prevent overwhelming the browser
    async function loadImagesSequentially(): Promise<void> {
      for (const url of imageUrls) {
        if (abortController.signal.aborted) break;
        await preloadImage(url);
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadImagesSequentially();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [imageUrls, loadedUrls]);

  return !isLoading;
}
