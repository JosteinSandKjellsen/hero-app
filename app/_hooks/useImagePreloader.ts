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
        // Create a temporary Image object to preload and ensure rendering
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages && isMounted) {
              setImagesLoaded(true);
            }
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
            // Still increment counter to allow other images to continue loading
            loadedCount++;
            if (loadedCount === totalImages && isMounted) {
              setImagesLoaded(true);
            }
            resolve(); // Resolve anyway to allow other images to load
          };
          // Set crossOrigin to anonymous since we're using our proxy
          img.crossOrigin = 'anonymous';
          img.src = url;
        });
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
