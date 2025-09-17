import { useState, useEffect, useRef } from 'react';

export function useImagePreloader(imageUrls: string[]): boolean {
  const [loadedUrls] = useState(() => new Set<string>());
  const [isLoading, setIsLoading] = useState(true);
  const urlsRef = useRef<string[]>([]);
  const loadingRef = useRef(false);

  // Extract complex expression for dependency array
  const urlsKey = imageUrls.join(',');

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    // Validate input
    if (!Array.isArray(imageUrls)) {
      console.warn('useImagePreloader: imageUrls is not an array');
      setIsLoading(false);
      return;
    }

    // Check if URLs actually changed (not just array reference)
    const urlsChanged = urlsRef.current.length !== imageUrls.length || 
      urlsRef.current.some((url, index) => url !== imageUrls[index]);

    if (!urlsChanged) {
      // URLs haven't changed, check if all are already loaded
      const allLoaded = imageUrls.every(url => loadedUrls.has(url));
      if (allLoaded && !loadingRef.current) {
        setIsLoading(false);
      }
      return;
    }

    urlsRef.current = [...imageUrls]; // Create a copy
    
    if (!imageUrls.length) {
      setIsLoading(false);
      return;
    }

    // Check if all URLs are already loaded
    const allAlreadyLoaded = imageUrls.every(url => loadedUrls.has(url));
    if (allAlreadyLoaded) {
      setIsLoading(false);
      return;
    }

    // Only set loading if we actually need to load new images
    const newUrls = imageUrls.filter(url => !loadedUrls.has(url));
    if (newUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);

    const preloadImage = async (url: string): Promise<void> => {
      if (loadedUrls.has(url)) return;

      // Validate URL
      if (!url || typeof url !== 'string') {
        console.warn(`Invalid image URL: ${url}`);
        return;
      }

      try {
        // Use requestAnimationFrame to spread out image loading
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          const timeout = setTimeout(() => {
            reject(new Error(`Image load timeout: ${url}`));
          }, 10000); // 10 second timeout
          
          img.onload = () => {
            clearTimeout(timeout);
            loadedUrls.add(url);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
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

    // Load only new images
    async function loadNewImages(): Promise<void> {
      try {
        for (const url of newUrls) {
          if (abortController.signal.aborted) break;
          await preloadImage(url);
        }
      } catch (error) {
        console.error('Error in image preloading sequence:', error);
      } finally {
        if (isMounted) {
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    }

    loadNewImages();

    return () => {
      isMounted = false;
      loadingRef.current = false;
      abortController.abort();
    };
  }, [urlsKey, loadedUrls, imageUrls]); // Include all dependencies

  return !isLoading;
}
