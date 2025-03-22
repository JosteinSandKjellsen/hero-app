import { useState, useEffect } from 'react';

export function useImagePreloader(imageUrls: string[]): boolean {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!imageUrls.length) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;
    const abortControllers: AbortController[] = [];

    const preloadImage = async (url: string): Promise<void> => {
      const controller = new AbortController();
      abortControllers.push(controller);

      try {
        // Use fetch instead of Image object to ensure we always use the API proxy
        const response = await fetch(url, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load image: ${url}`);
        }
        
        // We don't need to do anything with the response data
        // Just getting a successful response means the image is in the browser's cache
        
        loadedCount++;
        if (loadedCount === totalImages && isMounted) {
          setImagesLoaded(true);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(`Failed to load image: ${url}`, error);
          // Still increment counter to allow other images to continue loading
          loadedCount++;
          if (loadedCount === totalImages && isMounted) {
            setImagesLoaded(true);
          }
        }
      }
    };

    // Track which images have started loading
    const loadingImages = new Set<string>();

    // Start preloading all images
    Promise.all(
      imageUrls.filter(url => {
        // Skip duplicate URLs
        if (loadingImages.has(url)) return false;
        loadingImages.add(url);
        return true;
      }).map(url => preloadImage(url))
    ).finally(() => {
      // Ensure we mark as loaded even if some images failed
      if (isMounted) {
        setImagesLoaded(true);
      }
    });

    return () => {
      isMounted = false;
      // Abort any in-flight requests
      abortControllers.forEach(controller => {
        try {
          controller.abort();
        } catch (e) {
          // Ignore abort errors
        }
      });
    };
  }, [imageUrls]);

  return imagesLoaded;
}
