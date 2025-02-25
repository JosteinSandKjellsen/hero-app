'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { getRandomIndex } from '@/app/_lib/utils/random';
import { heroImages } from '@/app/_lib/constants/images';

export function HeroImageCarousel(): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Track images that fail to load
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const updateImage = useCallback(() => {
    setCurrentImageIndex(current => {
      // Get working images (exclude failed ones)
      const workingImageIndices = heroImages
        .map((_, index) => index)
        .filter(index => !failedImages[index]);
      
      // If all images failed, just use the default
      if (workingImageIndices.length === 0) {
        return 0; // Stay on the first image
      }
      
      // If only one working image, use that
      if (workingImageIndices.length === 1) {
        return workingImageIndices[0];
      }
      
      // Otherwise, pick a random working image that's different from current
      let nextIndex;
      do {
        const randomIndex = getRandomIndex(workingImageIndices.length);
        nextIndex = workingImageIndices[randomIndex];
      } while (nextIndex === current && workingImageIndices.length > 1);
      
      return nextIndex;
    });
  }, [failedImages]);

  useEffect(() => {
    const interval = setInterval(updateImage, 2000);
    return () => clearInterval(interval);
  }, [updateImage]);

  // Handle image error
  const handleImageError = (index: number): void => {
    console.error(`Carousel image at index ${index} failed to load`);
    setFailedImages(prev => ({ ...prev, [index]: true }));
  };

  // Check if we have any working images
  const hasWorkingImages = heroImages.some((_, index) => !failedImages[index]);

  // Preload next image - assume the next 2 images might be shown soon
  const preloadIndex = (currentImageIndex + 1) % heroImages.length;
  const preloadIndexNext = (currentImageIndex + 2) % heroImages.length;

  // If all images failed, show a gray placeholder
  if (!hasWorkingImages) {
    return (
      <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden relative">
        <div className="w-full h-full bg-gray-400 flex items-center justify-center">
          <span className="text-white text-xs text-center">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden relative">
      {heroImages.map((src, index) => {
        // Skip rendering failed images
        if (failedImages[index]) {
          return null;
        }
        
        // Determine if this image is visible or about to be visible
        const isVisible = index === currentImageIndex;
        const isNext = index === preloadIndex || index === preloadIndexNext;
        
        return (
          <Image
            key={src}
            src={src}
            alt="Superhero"
            className={`object-cover object-[center_top] transition-opacity duration-1000
                       ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            fill
            sizes="128px"
            loading={isVisible || isNext ? "eager" : "lazy"}
            priority={isVisible || isNext}
            // Add fetchpriority attribute for important images
            fetchPriority={isVisible ? "high" : isNext ? "low" : "auto"}
            onError={() => handleImageError(index)}
          />
        );
      })}
    </div>
  );
}
