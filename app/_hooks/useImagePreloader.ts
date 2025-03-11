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
      return new Promise((resolve, reject) => {
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
        img.onerror = reject;
      });
    };

    // Start preloading all images
    Promise.all(imageUrls.map(url => preloadImage(url)))
      .catch(error => {
        console.error('Error preloading images:', error);
        // Set loaded to true even on error to prevent hanging
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
