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
    const images: HTMLImageElement[] = [];

    const preloadImage = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        images.push(img);
        img.src = url;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages && isMounted) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          // Still increment counter and resolve to allow other images to continue loading
          loadedCount++;
          if (loadedCount === totalImages && isMounted) {
            setImagesLoaded(true);
          }
          resolve();
        };
      });
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
      // Clean up image objects
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
    };
  }, [imageUrls]);

  return imagesLoaded;
}
