'use client';

import { useEffect, useState, useCallback } from 'react';
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

  return (
    <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden relative">
      {heroImages.map((src, index) => (
        <img
          key={src}
          src={src}
          alt="Superhero"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
                     ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </div>
  );
}