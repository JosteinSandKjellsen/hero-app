import { useState, useEffect } from 'react';

export function useImagePreloader(imageUrls: string[]): boolean {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrls.length) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    const preloadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = reject;
      });
    };

    // Start preloading all images
    Promise.all(imageUrls.map(url => preloadImage(url)))
      .catch(error => {
        console.error('Error preloading images:', error);
        // Set loaded to true even on error to prevent hanging
        setImagesLoaded(true);
      });

    return () => {
      // Reset state when urls change
      setImagesLoaded(false);
    };
  }, [imageUrls]);

  return imagesLoaded;
}
