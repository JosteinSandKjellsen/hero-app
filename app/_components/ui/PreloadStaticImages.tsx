'use client';

import { useEffect } from 'react';
import { heroImages } from '@/app/_lib/constants/images';

/**
 * Component that dynamically handles image loading strategy for static hero images.
 * We let Next.js handle image optimization and preloading through its Image component
 * and only preload the first image that we know will be needed immediately.
 */
export function PreloadStaticImages(): JSX.Element {
  useEffect(() => {
    // Only preload the first image as it's likely to be needed immediately
    const firstImage = heroImages[0];
    if (firstImage) {
      const linkElement = document.createElement('link');
      linkElement.rel = 'preload';
      linkElement.href = firstImage;
      linkElement.as = 'image';
      linkElement.setAttribute('type', 'image/webp');
      document.head.appendChild(linkElement);
    }

    // Cleanup function to remove preload tag when component unmounts
    return () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, []);

  return <></>; // Return empty fragment as this component doesn't render visible UI
}
