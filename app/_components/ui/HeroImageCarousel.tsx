'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { getRandomIndex } from '@/app/_lib/utils/random';
import { heroImages } from '@/app/_lib/constants/images';

export function HeroImageCarousel(): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const updateImage = useCallback(() => {
    setCurrentImageIndex(current => {
      let nextIndex;
      do {
        nextIndex = getRandomIndex(heroImages.length);
      } while (nextIndex === current);
      return nextIndex;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(updateImage, 2000);
    return () => clearInterval(interval);
  }, [updateImage]);

  // Preload next image - assume the next 2 images might be shown soon
  const preloadIndex = (currentImageIndex + 1) % heroImages.length;
  const preloadIndexNext = (currentImageIndex + 2) % heroImages.length;

  return (
    <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden relative">
      {heroImages.map((src, index) => {
        // Determine if this image is visible or about to be visible
        const isVisible = index === currentImageIndex;
        const isNext = index === preloadIndex || index === preloadIndexNext;
        
        return (
          <Image
            key={src}
            src={src}
            alt="Superhero"
            className={`object-cover transition-opacity duration-1000
                       ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            fill
            sizes="128px"
            loading={isVisible || isNext ? "eager" : "lazy"}
            priority={isVisible || isNext}
            // Add fetchpriority attribute for important images
            fetchPriority={isVisible ? "high" : isNext ? "low" : "auto"}
          />
        );
      })}
    </div>
  );
}
