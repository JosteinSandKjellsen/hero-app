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

  return (
    <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden relative">
      {heroImages.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt="Superhero"
          className={`object-cover transition-opacity duration-1000
                     ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
          fill
          sizes="(max-width: 128px) 100vw, 128px"
          priority={index === 0}
        />
      ))}
    </div>
  );
}
